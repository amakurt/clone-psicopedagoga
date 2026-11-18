import fs from 'fs';
import path from 'path';
// @ts-ignore
import mammoth from 'mammoth';
// @ts-ignore
import WordExtractor from 'word-extractor';

export interface ParsedDocument {
  title?: string;
  html: string;
  rawText: string;
}

/**
 * Detecta se o buffer é DOCX (PK ZIP) ou DOC (OLE2)
 */
function isDocx(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
}

function isDoc(buffer: Buffer): boolean {
  return buffer.length >= 8 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
}

export async function parseDocumentFile(filePath: string): Promise<ParsedDocument> {
  if (!fs.existsSync(filePath)) {
    throw new Error('Arquivo não encontrado no servidor: ' + filePath);
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  return parseDocumentBuffer(buffer, ext);
}

export async function parseDocumentBuffer(buffer: Buffer, fileExtension = ''): Promise<ParsedDocument> {
  const ext = fileExtension.toLowerCase();

  // 1. Tenta DOCX (Mammoth)
  if (ext === '.docx' || isDocx(buffer)) {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      let html = result.value || '';
      if (!html.trim()) {
        const rawRes = await mammoth.extractRawText({ buffer });
        if (rawRes.value) {
          html = rawRes.value.split('\n\n').filter(Boolean).map((p: string) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        }
      }
      const rawText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return { html, rawText };
    } catch (docxErr) {
      console.warn('Falha no mammoth, tentando word-extractor fallback:', docxErr);
    }
  }

  // 2. Tenta DOC (WordExtractor)
  if (ext === '.doc' || isDoc(buffer)) {
    try {
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(buffer);
      const body = extracted.getBody() || '';
      const paragraphs = body
        .split(/\r?\n\r?\n/)
        .map((p: string) => p.trim())
        .filter(Boolean);

      const html = paragraphs
        .map((p: string) => {
          if (p.length < 80 && p === p.toUpperCase() && !p.includes('.')) {
            return `<h3>${p}</h3>`;
          }
          return `<p>${p.replace(/\r?\n/g, '<br>')}</p>`;
        })
        .join('');

      return {
        html: html || `<p>${body.replace(/\r?\n/g, '<br>')}</p>`,
        rawText: body.trim()
      };
    } catch (docErr) {
      console.warn('Falha no word-extractor, tentando fallback:', docErr);
    }
  }

  // 3. Fallback: Se for arquivo de texto simples ou CSV
  if (ext === '.txt' || ext === '.csv') {
    const text = buffer.toString('utf-8');
    const html = text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    return { html, rawText: text.trim() };
  }

  // 4. Se for DOCX que veio como .doc ou vice-versa, tenta inversão
  try {
    const result = await mammoth.convertToHtml({ buffer });
    if (result.value && result.value.trim()) {
      const html = result.value;
      const rawText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return { html, rawText };
    }
  } catch {}

  try {
    const extractor = new WordExtractor();
    const extracted = await extractor.extract(buffer);
    const body = extracted.getBody() || '';
    if (body.trim()) {
      const html = body.split(/\r?\n\r?\n/).filter(Boolean).map((p: string) => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`).join('');
      return { html, rawText: body.trim() };
    }
  } catch {}

  return { html: '', rawText: '' };
}

/**
 * Localiza o arquivo físico correspondente a uma fileUrl do banco
 */
export function resolveUploadFilePath(fileUrl: string): string | null {
  if (!fileUrl) return null;
  const filename = path.basename(fileUrl.split('?')[0]);
  const uploadsDir = path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}
