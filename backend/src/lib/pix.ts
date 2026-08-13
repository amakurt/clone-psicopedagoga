// Gera o payload PIX estático (BR Code / EMV) — "copia e cola" — sem gateway.
// Formato: https://www.bcb.gov.br/estabilidadefinanceira/pix

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

// Normaliza a chave conforme o tipo:
//  - PHONE: E.164 com código do país (+55...), como registrado no DICT — se o
//    usuário digitou só o DDD + número, o 55 é adicionado automaticamente
//  - EMAIL/RANDOM: preserva a chave exata
//  - CPF/CNPJ: apenas dígitos
export function normalizePixKey(key: string, keyType?: string): string {
  const t = (keyType || '').toUpperCase();
  const trimmed = (key || '').trim();
  if (t === 'EMAIL') return trimmed.toLowerCase();
  if (t === 'RANDOM') return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (t === 'PHONE') {
    const e164 = digits.startsWith('55') ? digits : `55${digits}`;
    return `+${e164}`;
  }
  return digits;
}

export function generatePixCopiaECola(opts: {
  key: string;
  keyType?: PixKeyType | string;
  amount?: number;
  merchantName: string;
  merchantCity?: string;
  txid?: string;
}): string {
  const key = normalizePixKey(opts.key, opts.keyType);
  if (!key) throw new Error('Chave PIX não configurada');

  const merchantName = (opts.merchantName || 'CLINICA').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 25) || 'CLINICA';
  const merchantCity = (opts.merchantCity || 'BRASIL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 15) || 'BRASIL';
  const txid = (opts.txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  let payload = emv('00', '01');
  payload += emv('26', `0014br.gov.bcb.pix${emv('01', key)}`);
  payload += emv('52', '0000');
  payload += emv('53', '986');
  if (opts.amount && opts.amount > 0) {
    payload += emv('54', opts.amount.toFixed(2));
  }
  payload += emv('58', 'BR');
  payload += emv('59', merchantName);
  payload += emv('60', merchantCity);
  payload += emv('62', emv('05', txid));
  payload += '6304';
  return `${payload}${crc16(payload)}`;
}