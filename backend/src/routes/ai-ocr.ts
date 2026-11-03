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

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-1.5-pro',
];

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

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: finalPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
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

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('API key not valid') || errorText.includes('INVALID_ARGUMENT')) {
          lastError = new Error('A chave de API do Google Gemini informada é inválida ou expirou. Obtenha uma chave gratuita em https://aistudio.google.com e configure em Configurações > WhatsApp.');
          break;
        }
        lastError = new Error(`Gemini ${model} HTTP ${response.status}: ${errorText}`);
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
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Não foi possível processar o documento com os modelos disponíveis.');
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

    // Teste leve de validação direta com o Google para garantir que a chave funciona
    try {
      const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!testRes.ok) {
        const errBody = await testRes.text();
        if (errBody.includes('API_KEY_INVALID') || testRes.status === 400 || testRes.status === 403) {
          return res.status(400).json({
            error: 'O Google recusou esta chave de API. Verifique se copiou a chave completa gerada no Google AI Studio (ex: AIzaSy...).'
          });
        }
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

