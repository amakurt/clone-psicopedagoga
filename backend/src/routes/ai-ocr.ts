import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize } from '../middleware';
import prisma from '../lib/prisma';

const router = Router();
router.use(authenticate);
router.use(authorize('GESTOR', 'PROFISSIONAL', 'PSICOPEDAGOGO', 'SECRETARIA', 'SUPERADMIN'));

// Diretório para armazenamento seguro de fichas digitalizadas
const fichasDir = path.join(__dirname, '../../uploads/fichas');
if (!fs.existsSync(fichasDir)) {
  fs.mkdirSync(fichasDir, { recursive: true });
}

// Configuração do multer em memória com limite de 15MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Envie uma imagem (JPG, PNG, WebP) ou documento PDF.'));
    }
  },
});

// Cache de modelos suportados por chave (TTL: 1 hora)
const modelsCache = new Map<string, { models: string[]; expiresAt: number }>();

/**
 * Descobre dinamicamente os modelos habilitados para a chave do Google Gemini da clínica,
 * priorizando as versões mais rápidas, estáveis e modernas para visão computacional/OCR.
 */
async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  const cached = modelsCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.models;
  }

  const fallbackModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data?.models)) {
        const validNames: string[] = data.models
          .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map((m: any) => (m.name || '').replace(/^models\//, ''));

        const preferredOrder = [
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
          'gemini-1.5-flash',
          'gemini-1.5-flash-002',
          'gemini-1.5-flash-001',
          'gemini-1.5-flash-8b',
          'gemini-1.5-pro',
          'gemini-1.5-pro-002',
        ];

        const prioritized: string[] = [];
        for (const pref of preferredOrder) {
          const match = validNames.find(vn => vn === pref || vn.startsWith(pref));
          if (match && !prioritized.includes(match)) {
            prioritized.push(match);
          }
        }

        // Adiciona quaisquer outros modelos que suportem generateContent (exceto embeddings/tts)
        for (const vn of validNames) {
          if (!prioritized.includes(vn) && !vn.includes('embedding') && !vn.includes('aqa') && !vn.includes('imagen')) {
            prioritized.push(vn);
          }
        }

        if (prioritized.length > 0) {
          modelsCache.set(apiKey, { models: prioritized, expiresAt: Date.now() + 60 * 60 * 1000 });
          return prioritized;
        }
      }
    }
  } catch (err) {
    console.warn('[AI_OCR] Falha ao consultar modelos ativos do Google, usando fallback padrão:', err);
  }

  return fallbackModels;
}

/**
 * Chamada multimodal ao Gemini para extração estruturada de dados clínicos
 */
async function extractWithGemini(
  base64Data: string,
  mimeType: string,
  tipoFicha: 'PACIENTE' | 'ANAMNESE' | 'AUTO',
  apiKey: string
): Promise<any> {
  const isAnamnese = tipoFicha === 'ANAMNESE';

  const systemPrompt = `
Você é uma Inteligência Artificial especialista em OCR clínico, leitura de caligrafia manuscrita e extração estruturada de fichas de Psicopedagogia, Neuropsicologia e Clínicas Multidisciplinares no Brasil.

Sua tarefa é analisar a imagem ou documento PDF fornecido (que pode ser uma ficha impressa preenchida à mão, datilografada ou formulário escolar/médico) e extrair com o máximo de precisão todos os campos legíveis.

Regras de Extração e Normalização:
1. Nomes próprios: Formatar com Iniciais Maiúsculas (ex: "Gabriel Santos de Oliveira").
2. Datas: Converter sempre para o formato ISO AAAA-MM-DD (ex: 15/03/2016 -> "2016-03-15"). Se o ano for de dois dígitos, interprete de acordo com a idade provável de uma criança ou adolescente.
3. Telefones: Incluir DDD se presente (ex: "(85) 98801-4049").
4. CPF / RG: Manter apenas números ou formatar adequadamente.
5. Caligrafia cursiva: Use o contexto clínico para inferir palavras manuscritas difíceis (ex: termos como TDAH, Dislexia, TEA, Ritalina, Risperidona, prematuro, parto cesárea).
6. Se um campo não estiver presente ou for completamente ilegível, retorne null ou string vazia, sem inventar informações.
7. Retorne estritamente um objeto JSON válido, sem texto explicativo adicional.
`;

  let promptInstrucao = '';
  if (isAnamnese) {
    promptInstrucao = `
Extraia os dados da FICHA DE ANAMNESE estruturando exatamente no seguinte formato JSON:
{
  "tipoIdentificado": "ANAMNESE",
  "confiancaGeral": "ALTA" | "MEDIA" | "BAIXA",
  "anamnese": {
    "pacienteNome": "Nome da criança/paciente ou null",
    "dataNascimento": "AAAA-MM-DD ou null",
    "turno": "manha" | "tarde" | "integral" | null,
    "escola": "Nome da escola ou null",
    "telefoneEscola": "Telefone ou null",
    "queixaPrincipal": "Descrição da queixa principal trazida pelos pais/escola",
    "historicoGestacional": "Detalhes sobre gravidez, parto, semanas gestacionais, intercorrências",
    "desenvolvimentoMotor": "Idade que sustentou a cabeça, sentou, engatinhou, andou, coordenação",
    "desenvolvimentoLinguagem": "Idade das primeiras palavras, frases, compreensão atual",
    "sonoAlimentacao": "Padrão de sono, dificuldades para dormir, seletividade alimentar",
    "historicoEscolar": "Entrada na escola, adaptação, retenções, relação com professores/colegas",
    "historicoFamiliar": "Composição familiar, relação com pais/irmãos, histórico familiar de transtornos",
    "observacoesComportamentais": "Comportamentos relevantes, estereotipias, humor, desatenção, hiperatividade"
  },
  "camposPreenchidos": ["array com os nomes dos campos que tinham dados na ficha"]
}
`;
  } else {
    promptInstrucao = `
Extraia os dados da FICHA CADASTRAL / TRIAGEM DO PACIENTE estruturando exatamente no seguinte formato JSON:
{
  "tipoIdentificado": "PACIENTE",
  "confiancaGeral": "ALTA" | "MEDIA" | "BAIXA",
  "paciente": {
    "name": "Nome Completo do Paciente",
    "birthDate": "AAAA-MM-DD ou null",
    "grade": "Série ou ano escolar (ex: 3º ano)",
    "schoolName": "Nome da escola onde estuda",
    "schoolShift": "Manhã" | "Tarde" | "Integral" | "Noite" | null,
    "cpf": "000.000.000-00 ou null",
    "rg": "Número do RG ou null",
    "phone": "Telefone de contato principal",
    "phoneIsWhatsApp": true,
    "diagnosis": "Diagnóstico prévio ou hipótese diagnóstica mencionada",
    "medications": "Medicamentos em uso contínuo",
    "allergies": "Alergias ou restrições alimentares/médicas",
    "notes": "Queixa inicial, observações ou resumo da ficha",
    "address": {
      "street": "Logradouro / Rua / Avenida",
      "number": "Número",
      "complement": "Complemento se houver",
      "neighborhood": "Bairro",
      "city": "Cidade",
      "state": "UF",
      "cep": "00000-000"
    }
  },
  "responsavel": {
    "name": "Nome completo do pai, mãe ou responsável legal",
    "relationship": "Mãe" | "Pai" | "Avó" | "Avô" | "Tutor Legal" | "Outro",
    "phone": "Telefone celular ou WhatsApp do responsável",
    "email": "E-mail se informado",
    "cpf": "CPF do responsável se informado"
  },
  "camposPreenchidos": ["array com as propriedades identificadas com sucesso"]
}
`;
  }

  const finalPrompt = `${systemPrompt}\n\n${promptInstrucao}`;

  let lastError: any = null;
  const models = await getAvailableGeminiModels(apiKey);

  for (const model of models) {
    for (const ep of ['v1beta', 'v1']) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ep}/models/${model}:generateContent?key=${apiKey}`;

        const requestBody: any = {
          contents: [
            {
              parts: [
                { text: finalPrompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 3000,
          },
        };

        let response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        // Se falhar com 400 por não suportar responseMimeType, retenta sem responseMimeType
        if (!response.ok && response.status === 400 && requestBody.generationConfig?.responseMimeType) {
          delete requestBody.generationConfig.responseMimeType;
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
        }

        // Se ainda falhar com 400, tenta formato alternativo inline_data (snake_case)
        if (!response.ok && response.status === 400) {
          requestBody.contents[0].parts[1] = {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          };
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          let errorDetail = errorText;
          try {
            const parsed = JSON.parse(errorText);
            errorDetail = parsed?.error?.message || errorText;
          } catch {}

          console.warn(`[AI_OCR] Falha no endpoint ${ep}/${model} (Status ${response.status}):`, errorDetail);

          // 1. Chave realmente inválida
          if (errorDetail.includes('API_KEY_INVALID') || errorDetail.includes('API key not valid')) {
            throw new Error('A chave de API do Google Gemini informada é inválida ou expirou. Obtenha uma chave gratuita em https://aistudio.google.com e configure nas opções.');
          }

          // 2. Limite temporário da cota gratuita atingido (15 req/min)
          if (response.status === 429 || errorDetail.includes('RESOURCE_EXHAUSTED')) {
            lastError = new Error('Limite temporário de requisições por minuto atingido no Google Gemini gratuito. Aguarde 30 segundos e tente novamente.');
            continue;
          }

          // 3. Payload ou tamanho da foto
          if (errorDetail.includes('payload size exceeds') || errorDetail.includes('exceeds maximum allowed size')) {
            throw new Error('A imagem da foto é muito pesada para o processador de IA. Reduza a resolução ou fotografe diretamente pelo aplicativo.');
          }

          // 4. Modelo não encontrado nesta versão da API (404) ou desativado no projeto
          if (response.status === 404 || errorDetail.includes('not found') || errorDetail.includes('is not supported')) {
            lastError = new Error(
              `O Google recusou o processamento com esta chave (${model} - ${ep}): "${errorDetail}". ` +
              `Para resolver, acesse https://aistudio.google.com/app/apikey, clique em "Create API key" e certifique-se de escolher "Create API key in NEW project".`
            );
            continue;
          }

          lastError = new Error(`Falha no Google Gemini (${model}): ${errorDetail}`);
          continue;
        }

        const resJson: any = await response.json();
        const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error('Nenhum texto retornado pelo modelo Gemini');
        }

        const cleanJson = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        return JSON.parse(cleanJson);
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Não foi possível interpretar a ficha com os modelos disponíveis no Google Gemini.');
}

/**
 * GET /api/ai-ocr/has-key
 * Informa ao frontend se a clínica já possui chave de API configurada
 */
router.get('/has-key', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const userRole = (req as any).user?.role;
    let hasKey = false;
    let keyMasked = '';

    if (tenantId) {
      const cfg = await prisma.whatsAppConfig.findFirst({
        where: { tenantId },
        select: { geminiKey: true },
      });
      if (cfg?.geminiKey && cfg.geminiKey.trim()) {
        hasKey = true;
        const k = cfg.geminiKey.trim();
        keyMasked = k.length > 8 ? `${k.substring(0, 4)}...${k.substring(k.length - 4)}` : '••••••••';
      }
    }

    // Se for SUPERADMIN, pode usar a chave global se configurada
    if (!hasKey && userRole === 'SUPERADMIN' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      hasKey = true;
      keyMasked = 'Global (.env)';
    }

    return res.json({ hasKey, keyMasked });
  } catch {
    return res.json({ hasKey: false });
  }
});

/**
 * POST /api/ai-ocr/save-key
 * Salva ou atualiza a Chave de API própria da clínica para IA
 */
router.post('/save-key', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Identificação da clínica não encontrada.' });
    }

    const { geminiKey } = req.body;
    if (!geminiKey || typeof geminiKey !== 'string' || !geminiKey.trim()) {
      return res.status(400).json({ error: 'Informe a Chave de API do Google Gemini.' });
    }

    const key = geminiKey.trim();

    if (key.length < 15) {
      return res.status(400).json({ error: 'Chave de API parece inválida ou muito curta (deve ter pelo menos 20 caracteres).' });
    }

    // Teste de validação direta e geração com o Google para garantir que a chave funciona 100%
    try {
      const testModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
      let workingModel: string | null = null;
      let lastTestErr = '';

      for (const m of testModels) {
        for (const ep of ['v1beta', 'v1']) {
          const genTest = await fetch(`https://generativelanguage.googleapis.com/${ep}/models/${m}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'ok' }] }] }),
          });
          if (genTest.ok) {
            workingModel = `${ep}/${m}`;
            break;
          } else {
            const errTxt = await genTest.text();
            lastTestErr = errTxt;
          }
        }
        if (workingModel) break;
      }

      if (!workingModel) {
        let parsedMsg = lastTestErr;
        try { parsedMsg = JSON.parse(lastTestErr)?.error?.message || lastTestErr; } catch {}
        if (parsedMsg.includes('API_KEY_INVALID') || parsedMsg.includes('API key not valid')) {
          return res.status(400).json({
            error: 'Chave de API do Google inválida. Copie a chave completa gerada no Google AI Studio (ex: AIzaSy...).'
          });
        }
        return res.status(400).json({
          error: `O Google recusou a geração com esta chave: "${parsedMsg}". Dica: Acesse https://aistudio.google.com/app/apikey, clique em "Create API key" e certifique-se de escolher "Create API key in NEW project".`
        });
      }
    } catch (testErr) {
      console.warn('Aviso: Falha temporária de rede ao validar chave com Google:', testErr);
    }

    const existing = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
    if (existing) {
      await prisma.whatsAppConfig.update({
        where: { id: existing.id },
        data: { geminiKey: key, aiEnabled: true },
      });
    } else {
      await prisma.whatsAppConfig.create({
        data: {
          tenantId,
          apiUrl: 'https://api.evolution-api.com',
          token: 'default',
          geminiKey: key,
          aiEnabled: true,
        },
      });
    }

    // Limpa cache de modelos para esta chave
    modelsCache.delete(key);

    const keyMasked = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '••••••••';
    return res.json({
      success: true,
      message: 'Chave de Inteligência Artificial do Google salva e ativada com sucesso!',
      keyMasked
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao salvar chave: ' + error.message });
  }
});

/**
 * DELETE /api/ai-ocr/key
 * Remove a Chave de API da clínica
 */
router.delete('/key', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (tenantId) {
      const existing = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
      if (existing) {
        await prisma.whatsAppConfig.update({
          where: { id: existing.id },
          data: { geminiKey: null },
        });
      }
    }
    return res.json({ success: true, message: 'Chave removida com sucesso.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao remover chave: ' + error.message });
  }
});

/**
 * POST /api/ai-ocr/scan
 * Endpoint unificado para upload de arquivo (multipart) ou envio de base64 (JSON)
 */
router.post('/scan', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let apiKey = '';
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;

    // 0. Se o usuário forneceu a chave diretamente na modal/requisição:
    if (req.body.geminiKey && typeof req.body.geminiKey === 'string' && req.body.geminiKey.trim()) {
      apiKey = req.body.geminiKey.trim();
      // Salva para a clínica para uso contínuo
      if (tenantId) {
        const existing = await prisma.whatsAppConfig.findFirst({ where: { tenantId } });
        if (existing) {
          await prisma.whatsAppConfig.update({
            where: { id: existing.id },
            data: { geminiKey: apiKey, aiEnabled: true },
          });
        } else {
          await prisma.whatsAppConfig.create({
            data: {
              tenantId,
              apiUrl: 'https://api.evolution-api.com',
              token: 'default',
              geminiKey: apiKey,
              aiEnabled: true,
            },
          });
        }
      }
    }

    // 1. Tenta buscar a chave configurada na clínica ativa (WhatsAppConfig.geminiKey)
    if (!apiKey && tenantId) {
      const tenantConfig = await prisma.whatsAppConfig.findFirst({
        where: { tenantId },
        select: { geminiKey: true }
      });
      if (tenantConfig?.geminiKey && tenantConfig.geminiKey.trim()) {
        apiKey = tenantConfig.geminiKey.trim();
      }
    }

    // 2. Se for SuperAdmin, pode usar a variável global .env se existir
    const userRole = (req as any).user?.role;
    if (!apiKey && userRole === 'SUPERADMIN' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      apiKey = process.env.GEMINI_API_KEY.trim();
    }

    // IMPORTANTE: Cada clínica deve ter sua própria chave gratuita para não consumir limite do SaaS
    if (!apiKey) {
      return res.status(400).json({
        requiresApiKey: true,
        error: 'Sua clínica ainda não configurou uma chave gratuita do Google Gemini. Cada clínica deve usar sua própria chave gratuita (1.500 leituras/dia sem cartão) para ler fichas.',
      });
    }

    let base64Data = '';
    let mimeType = 'image/jpeg';
    let fileUrl = '';
    const tipoFicha = (req.body.tipoFicha || req.query.tipoFicha || 'PACIENTE') as 'PACIENTE' | 'ANAMNESE' | 'AUTO';

    // 1. Processamento via Upload Multipart (arquivo físico)
    if (req.file) {
      mimeType = req.file.mimetype;
      base64Data = req.file.buffer.toString('base64');

      // Salva arquivo físico para anexo no prontuário
      const ext = path.extname(req.file.originalname) || (mimeType.includes('pdf') ? '.pdf' : '.jpg');
      const filename = `scan-${uuidv4()}${ext}`;
      const destPath = path.join(fichasDir, filename);
      fs.writeFileSync(destPath, req.file.buffer);
      fileUrl = `/uploads/fichas/${filename}`;
    }
    // 2. Processamento via JSON com Base64 (captura direta de câmera ou canvas)
    else if (req.body.imageBase64) {
      let rawBase64 = req.body.imageBase64 as string;
      const match = rawBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = rawBase64;
        mimeType = req.body.mimeType || 'image/jpeg';
      }

      // Salva imagem no disco para histórico
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
      const filename = `scan-${uuidv4()}${ext}`;
      const destPath = path.join(fichasDir, filename);
      fs.writeFileSync(destPath, buffer);
      fileUrl = `/uploads/fichas/${filename}`;
    } else {
      return res.status(400).json({
        error: 'Envie um arquivo na propriedade "file" ou a imagem em base64 em "imageBase64".',
      });
    }

    // 3. Execução da extração multimodal via Gemini
    const extractedData = await extractWithGemini(base64Data, mimeType, tipoFicha, apiKey);

    return res.json({
      success: true,
      fileUrl,
      data: extractedData,
      message: 'Ficha digitalizada e interpretada com sucesso pela Inteligência Artificial.',
    });
  } catch (error: any) {
    console.error('[AI_OCR_SCAN_ERROR]', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar e digitalizar a ficha.',
    });
  }
});

export default router;

