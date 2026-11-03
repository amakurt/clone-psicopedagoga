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
 * POST /api/ai-ocr/scan
 * Endpoint unificado para upload de arquivo (multipart) ou envio de base64 (JSON)
 */
router.post('/scan', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let apiKey = '';

    // 1. Tenta buscar a chave configurada na clínica ativa (WhatsAppConfig.geminiKey)
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (tenantId) {
      const tenantConfig = await prisma.whatsAppConfig.findFirst({
        where: { tenantId },
        select: { geminiKey: true }
      });
      if (tenantConfig?.geminiKey && tenantConfig.geminiKey.trim()) {
        apiKey = tenantConfig.geminiKey.trim();
      }
    }

    // 2. Fallback: Se a clínica não tiver chave própria, busca de qualquer clínica configurada (ex: SuperAdmin / Gestora)
    if (!apiKey) {
      const masterConfig = await prisma.whatsAppConfig.findFirst({
        where: { geminiKey: { not: null } },
        select: { geminiKey: true }
      });
      if (masterConfig?.geminiKey && masterConfig.geminiKey.trim()) {
        apiKey = masterConfig.geminiKey.trim();
      }
    }

    // 3. Fallback: Variável global no .env do servidor
    if (!apiKey && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      apiKey = process.env.GEMINI_API_KEY.trim();
    }

    if (!apiKey) {
      return res.status(400).json({
        error: 'Chave do Google Gemini não encontrada. Por favor, adicione sua chave de API gratuita do Gemini em Configurações > WhatsApp > Chave Google Gemini.',
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

