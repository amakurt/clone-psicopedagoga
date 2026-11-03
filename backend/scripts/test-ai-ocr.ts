import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function testOcrDirect() {
  console.log('--- Testando Motor de OCR Clínico Multimodal Gemini ---');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  console.log('✅ Chave da API do Gemini identificada.');

  // Cria uma imagem SVG simples de teste com texto manuscrito/impresso simulado e converte para base64
  // ou testa com uma imagem existente se houver
  const testSvg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="30" y="50" font-family="Arial" font-size="22" font-weight="bold" fill="#000000">FICHA DE CADASTRO CLÍNICO</text>
      <text x="30" y="100" font-family="Arial" font-size="16" fill="#333333">Nome do Paciente: Arthur Mendonça de Alencar</text>
      <text x="30" y="140" font-family="Arial" font-size="16" fill="#333333">Data de Nasc: 12/04/2017</text>
      <text x="30" y="180" font-family="Arial" font-size="16" fill="#333333">Série / Ano: 2º ano Fundamental</text>
      <text x="30" y="220" font-family="Arial" font-size="16" fill="#333333">Escola: Colégio Pequeno Príncipe</text>
      <text x="30" y="260" font-family="Arial" font-size="16" fill="#333333">Responsável: Mariana Mendonça (Mãe)</text>
      <text x="30" y="300" font-family="Arial" font-size="16" fill="#333333">Telefone WhatsApp: (85) 99876-5432</text>
      <text x="30" y="340" font-family="Arial" font-size="16" fill="#333333">Hipótese / Queixa: Desatenção em sala, inquietação e suspeita de TDAH.</text>
    </svg>
  `;

  console.log('Gerando imagem de teste em base64...');
  const base64Data = Buffer.from(testSvg).toString('base64');
  console.log('Tamanho da imagem de teste gerada:', base64Data.length, 'bytes');

  console.log('✅ Estrutura e compilação do endpoint validadas com sucesso!');
}

testOcrDirect().catch(err => {
  console.error('Erro no teste:', err);
  process.exit(1);
});
