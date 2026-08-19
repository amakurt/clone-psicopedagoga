// Instrumentos de rastreio/triagem padronizados (uso livre) com scoring automático.
// M-CHAT-R, SNAP-IV e ATA são instrumentos validados e de domínio público no Brasil.
// ASRS-18 (rastreio de TDAH no adulto) e Rastreio de Habilidades Sociais completam a lista.
// IMPORTANTE: os resultados são INDICATIVOS — não substituem avaliação diagnóstica.

export type ScreeningItem = {
  id: string;
  text: string;
  dimension?: string;
  critical?: boolean;
  reverse?: boolean;
};

export type ScreeningDimension = { id: string; label: string };

export type ScreeningInstrumentDef = {
  code: string;
  name: string;
  description: string;
  target: string;
  optionType: 'SIM_NAO' | 'SNAP_IV' | 'ATA' | 'ASRS_18' | 'FREQUENCIA_4';
  options: { value: string; label: string }[];
  dimensions?: ScreeningDimension[];
  items: ScreeningItem[];
};

export type ScreeningResult = {
  scores: any;
  riskLevel: string;
  summary: string;
};

const OP_SIM_NAO = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

const OP_SNAP = [
  { value: '0', label: 'Nem um pouco' },
  { value: '1', label: 'Só um pouco' },
  { value: '2', label: 'Bastante' },
  { value: '3', label: 'Demais' },
];

const OP_ATA = [
  { value: '0', label: 'Ausente' },
  { value: '1', label: 'Presente (1 subitem)' },
  { value: '2', label: 'Presente (2+ subitens)' },
];

const OP_ASRS = [
  { value: '0', label: 'Nunca' },
  { value: '1', label: 'Raramente' },
  { value: '2', label: 'Às vezes' },
  { value: '3', label: 'Frequentemente' },
  { value: '4', label: 'Muito frequentemente' },
];

const OP_FREQ4 = [
  { value: '1', label: 'Nunca' },
  { value: '2', label: 'Raramente' },
  { value: '3', label: 'Às vezes' },
  { value: '4', label: 'Sempre' },
];

export const SCREENING_INSTRUMENTS: ScreeningInstrumentDef[] = [
  {
    code: 'MCHAT_R',
    name: 'M-CHAT-R (TEA infantil 16-30 meses)',
    description:
      'Checklist Modificado para Autismo em Crianças Pequenas, versão revisada. Rastreio precoce de Transtorno do Espectro Autista (TEA) em crianças de 16 a 30 meses, respondido pelos pais ou cuidadores.',
    target: 'Crianças de 16 a 30 meses',
    optionType: 'SIM_NAO',
    options: OP_SIM_NAO,
    items: [
      { id: 'q1', text: 'Se você apontar para algo do outro lado da sala, a criança olha para isso?' },
      { id: 'q2', text: 'Você já se perguntou se a criança é surda?', reverse: true, critical: true },
      { id: 'q3', text: 'A criança brinca de faz de conta (por exemplo, finge que está dando de comer a uma boneca)?' },
      { id: 'q4', text: 'A criança gosta de subir em coisas (móveis, escadas)?' },
      { id: 'q5', text: 'A criança faz movimentos incomuns com os dedos perto dos olhos?', reverse: true },
      { id: 'q6', text: 'A criança aponta com o dedo para pedir algo ou para indicar interesse?' },
      { id: 'q7', text: 'A criança aponta para mostrar algo interessante a você?', critical: true },
      { id: 'q8', text: 'A criança se interessa por outras crianças?' },
      { id: 'q9', text: 'A criança mostra coisas para você levando objetos até onde você está?', critical: true },
      { id: 'q10', text: 'A criança responde quando você a chama pelo nome?' },
      { id: 'q11', text: 'Quando você sorri para a criança, ela sorri de volta?' },
      { id: 'q12', text: 'A criança se aborrece com barulhos do dia a dia (aspirador, liquidificador)?', reverse: true },
      { id: 'q13', text: 'A criança anda?', critical: true },
      { id: 'q14', text: 'A criança olha nos seus olhos quando você fala com ela?', critical: true },
      { id: 'q15', text: 'A criança imita você (gestos, expressões, sons)?', critical: true },
      { id: 'q16', text: 'Se você vira a cabeça para olhar algo, a criança também olha?' },
      { id: 'q17', text: 'A criança tenta chamar sua atenção para ver o que você está olhando?' },
      { id: 'q18', text: 'A criança entende o que você diz?' },
      { id: 'q19', text: 'Às vezes a criança parece olhar para o nada ou vagar sem propósito?', reverse: true },
      { id: 'q20', text: 'A criança olha para o seu rosto para ver sua reação em situações novas ou desconhecidas?' },
    ],
  },
  {
    code: 'SNAP_IV',
    name: 'SNAP-IV (TDAH — pais e professores)',
    description:
      'Escala de rastreio de Transtorno de Déficit de Atenção/Hiperatividade conforme critérios do DSM-IV/DSM-5, com versões para pais e professores. 18 itens: 9 de desatenção e 9 de hiperatividade/impulsividade.',
    target: 'Crianças e adolescentes (com informante: pais ou professores)',
    optionType: 'SNAP_IV',
    options: OP_SNAP,
    dimensions: [
      { id: 'desatencao', label: 'Desatenção' },
      { id: 'hiperatividade', label: 'Hiperatividade/Impulsividade' },
    ],
    items: [
      { id: 'i1', text: 'Não presta atenção a detalhes ou comete erros por descuido nas tarefas escolares ou outras atividades', dimension: 'desatencao' },
      { id: 'i2', text: 'Tem dificuldade para manter a atenção em tarefas ou atividades lúdicas', dimension: 'desatencao' },
      { id: 'i3', text: 'Parece não ouvir quando falam diretamente com ele(a)', dimension: 'desatencao' },
      { id: 'i4', text: 'Não segue instruções até o fim e não termina tarefas escolares ou deveres', dimension: 'desatencao' },
      { id: 'i5', text: 'Tem dificuldade para organizar tarefas e atividades', dimension: 'desatencao' },
      { id: 'i6', text: 'Evita ou reluta em envolver-se em tarefas que exigem esforço mental prolongado', dimension: 'desatencao' },
      { id: 'i7', text: 'Perde coisas necessárias para tarefas ou atividades (material, brinquedos)', dimension: 'desatencao' },
      { id: 'i8', text: 'Distrai-se facilmente com estímulos externos', dimension: 'desatencao' },
      { id: 'i9', text: 'É esquecido(a) nas atividades diárias', dimension: 'desatencao' },
      { id: 'i10', text: 'Agita as mãos ou os pés ou se remexe na cadeira', dimension: 'hiperatividade' },
      { id: 'i11', text: 'Levanta da cadeira em situações em que se espera que permaneça sentado(a)', dimension: 'hiperatividade' },
      { id: 'i12', text: 'Corre ou escala em situações em que isso é inapropriado', dimension: 'hiperatividade' },
      { id: 'i13', text: 'Tem dificuldade para brincar ou se envolver tranquilamente em atividades de lazer', dimension: 'hiperatividade' },
      { id: 'i14', text: 'Parece estar "a todo vapor" ou age como se estivesse "ligado(a) na tomada"', dimension: 'hiperatividade' },
      { id: 'i15', text: 'Fala em excesso', dimension: 'hiperatividade' },
      { id: 'i16', text: 'Responde antes de as perguntas serem completadas', dimension: 'hiperatividade' },
      { id: 'i17', text: 'Tem dificuldade para esperar a sua vez', dimension: 'hiperatividade' },
      { id: 'i18', text: 'Interrompe ou se intromete nos assuntos dos outros', dimension: 'hiperatividade' },
    ],
  },
  {
    code: 'ATA',
    name: 'ATA (Traços Autísticos)',
    description:
      'Escala de Avaliação de Traços Autísticos — instrumento pré-diagnóstico que avalia a presença de condutas características do TEA em crianças a partir de 2 anos, podendo ser respondido pelos pais ou profissionais.',
    target: 'Crianças a partir de 2 anos',
    optionType: 'ATA',
    options: OP_ATA,
    items: [
      { id: 'a1', text: 'Tende a isolar-se (permanece alheio(a) ao ambiente e às pessoas)' },
      { id: 'a2', text: 'Não procura contato nem busca a atenção das pessoas' },
      { id: 'a3', text: 'Não reage quando chamado(a) — não atende pelo nome' },
      { id: 'a4', text: 'Não mantém contato visual (evita olhar nos olhos)' },
      { id: 'a5', text: 'Não faz amigos nem interage com outras crianças' },
      { id: 'a6', text: 'Não participa de jogos ou brincadeiras em grupo' },
      { id: 'a7', text: 'Não imita gestos e comportamentos dos outros' },
      { id: 'a8', text: 'Não se comunica por gestos (apontar, dar tchau, acenar)' },
      { id: 'a9', text: 'Apresenta ecolalia (repete palavras/frases) ou fala sem função comunicativa' },
      { id: 'a10', text: 'Faz uso inadequado de pronomes (eu/você) ou fala de si em 3ª pessoa' },
      { id: 'a11', text: 'Apresenta interesse restrito a um único objeto ou atividade' },
      { id: 'a12', text: 'Insiste em rotinas e rituais (mesmo trajeto, mesma sequência)' },
      { id: 'a13', text: 'Apresenta movimentos estereotipados (balançar, girar, bater as mãos, rodopiar)' },
      { id: 'a14', text: 'Interessa-se por partes de objetos (rodas, luzes, texturas, movimentos)' },
      { id: 'a15', text: 'Apresenta riso ou choro sem motivo aparente' },
      { id: 'a16', text: 'Não demonstra medo diante de perigos reais' },
      { id: 'a17', text: 'Apresenta apego excessivo a objetos (não aceita desapegar-se)' },
      { id: 'a18', text: 'Apresenta hiperatividade ou hipoatividade acentuada' },
      { id: 'a19', text: 'Resiste a mudanças na rotina ou no ambiente' },
      { id: 'a20', text: 'Apresenta alterações de sono e/ou alimentação' },
      { id: 'a21', text: 'Parece não responder a estímulos auditivos (como se fosse surdo(a))' },
      { id: 'a22', text: 'Apresenta agressividade ou autoagressão' },
      { id: 'a23', text: 'Apresenta atraso ou regressão no desenvolvimento da linguagem' },
    ],
  },
  {
    code: 'ASRS_18',
    name: 'ASRS-18 (TDAH no adulto)',
    description:
      'Adult ADHD Self-Report Scale v1.1 — rastreio de sintomas de TDAH em adultos. 18 itens: parte A (6 itens, triagem) e parte B (12 itens, sintomas).',
    target: 'Adultos (autoavaliação)',
    optionType: 'ASRS_18',
    options: OP_ASRS,
    dimensions: [
      { id: 'parteA', label: 'Parte A — Triagem' },
      { id: 'parteB', label: 'Parte B — Sintomas' },
    ],
    items: [
      { id: 'a1', text: 'Com que frequência você comete erros por descuido quando tem de trabalhar em um projeto chato ou difícil?', dimension: 'parteA' },
      { id: 'a2', text: 'Com que frequência você tem dificuldade para manter a atenção no que as outras pessoas estão dizendo?', dimension: 'parteA' },
      { id: 'a3', text: 'Com que frequência você tem dificuldade para organizar tarefas e atividades?', dimension: 'parteA' },
      { id: 'a4', text: 'Com que frequência você tem problemas para lembrar compromissos e obrigações?', dimension: 'parteA' },
      { id: 'a5', text: 'Com que frequência você se remexe ou se contorce quando precisa ficar sentado(a) por muito tempo?', dimension: 'parteA' },
      { id: 'a6', text: 'Com que frequência você se sente ativo(a) demais e obrigado(a) a fazer coisas, como se estivesse "com um motor ligado"?', dimension: 'parteA' },
      { id: 'b1', text: 'Com que frequência você tem dificuldade para concluir os detalhes finais de um projeto depois de ter feito as partes mais difíceis?', dimension: 'parteB' },
      { id: 'b2', text: 'Com que frequência você tem dificuldade para colocar as coisas em ordem quando tem uma tarefa que exige organização?', dimension: 'parteB' },
      { id: 'b3', text: 'Com que frequência você tem problemas para lembrar de compromissos ou obrigações?', dimension: 'parteB' },
      { id: 'b4', text: 'Com que frequência você se distrai ou se desvia do que está fazendo quando tem coisas para fazer?', dimension: 'parteB' },
      { id: 'b5', text: 'Com que frequência você tem dificuldade para ficar sentado(a) quando precisa?', dimension: 'parteB' },
      { id: 'b6', text: 'Com que frequência você se sente inquieto(a) ou agitado(a)?', dimension: 'parteB' },
      { id: 'b7', text: 'Com que frequência você tem dificuldade para aguardar a sua vez em situações em que é necessário?', dimension: 'parteB' },
      { id: 'b8', text: 'Com que frequência você interrompe os outros quando estão ocupados?', dimension: 'parteB' },
      { id: 'b9', text: 'Com que frequência você inicia conversas em momentos inapropriados?', dimension: 'parteB' },
      { id: 'b10', text: 'Com que frequência você tem dificuldade para controlar seus impulsos?', dimension: 'parteB' },
      { id: 'b11', text: 'Com que frequência você fala demais?', dimension: 'parteB' },
      { id: 'b12', text: 'Com que frequência você sente que sua desorganização atrapalha suas atividades do dia a dia?', dimension: 'parteB' },
    ],
  },
  {
    code: 'HABILIDADES_SOCIAIS',
    name: 'Rastreio de Habilidades Sociais',
    description:
      'Triagem de repertório de habilidades sociais em 6 dimensões (comunicação, interação, empatia, autocontrole, assertividade e cooperação), com perfil gráfico por dimensão.',
    target: 'Crianças, adolescentes e adultos',
    optionType: 'FREQUENCIA_4',
    options: OP_FREQ4,
    dimensions: [
      { id: 'comunicacao', label: 'Comunicação' },
      { id: 'interacao', label: 'Interação Social' },
      { id: 'empatia', label: 'Empatia' },
      { id: 'autocontrole', label: 'Autocontrole Emocional' },
      { id: 'assertividade', label: 'Assertividade' },
      { id: 'cooperacao', label: 'Cooperação' },
    ],
    items: [
      { id: 'c1', text: 'Inicia conversas com colegas ou familiares', dimension: 'comunicacao' },
      { id: 'c2', text: 'Expressa suas ideias e opiniões de forma clara', dimension: 'comunicacao' },
      { id: 'c3', text: 'Faz perguntas para entender o que os outros dizem', dimension: 'comunicacao' },
      { id: 'c4', text: 'Mantém contato visual durante uma conversa', dimension: 'comunicacao' },
      { id: 'c5', text: 'Adequa o tom de voz e o vocabulário ao contexto', dimension: 'comunicacao' },
      { id: 'i1', text: 'Aproxima-se de outras crianças/pessoas para brincar ou conversar', dimension: 'interacao' },
      { id: 'i2', text: 'Participa de atividades em grupo', dimension: 'interacao' },
      { id: 'i3', text: 'Faz amigos e mantém amizades', dimension: 'interacao' },
      { id: 'i4', text: 'Convida outros para participar de suas atividades', dimension: 'interacao' },
      { id: 'i5', text: 'Reage positivamente quando alguém se aproxima', dimension: 'interacao' },
      { id: 'e1', text: 'Percebe quando outra pessoa está triste ou chateada', dimension: 'empatia' },
      { id: 'e2', text: 'Oferece ajuda ou conforto quando alguém precisa', dimension: 'empatia' },
      { id: 'e3', text: 'Compreende o ponto de vista do outro em uma situação de conflito', dimension: 'empatia' },
      { id: 'e4', text: 'Comemora as conquistas dos outros', dimension: 'empatia' },
      { id: 'e5', text: 'Respeita os sentimentos alheios mesmo quando discorda', dimension: 'empatia' },
      { id: 'ac1', text: 'Controla a raiva em situações de frustração', dimension: 'autocontrole' },
      { id: 'ac2', text: 'Aceita críticas sem reagir agressivamente', dimension: 'autocontrole' },
      { id: 'ac3', text: 'Lida com imprevistos e mudanças sem desorganizar-se', dimension: 'autocontrole' },
      { id: 'ac4', text: 'Espera a sua vez sem se irritar', dimension: 'autocontrole' },
      { id: 'ac5', text: 'Recupera-se rapidamente após uma decepção', dimension: 'autocontrole' },
      { id: 'as1', text: 'Diz "não" quando não quer fazer algo', dimension: 'assertividade' },
      { id: 'as2', text: 'Pede ajuda quando precisa', dimension: 'assertividade' },
      { id: 'as3', text: 'Defende seus direitos de forma respeitosa', dimension: 'assertividade' },
      { id: 'as4', text: 'Expressa discordância sem ofender o outro', dimension: 'assertividade' },
      { id: 'as5', text: 'Negocia e chega a acordos quando há divergência', dimension: 'assertividade' },
      { id: 'co1', text: 'Segue regras e combinados', dimension: 'cooperacao' },
      { id: 'co2', text: 'Compartilha objetos e materiais', dimension: 'cooperacao' },
      { id: 'co3', text: 'Ajuda nas tarefas coletivas', dimension: 'cooperacao' },
      { id: 'co4', text: 'Aceita responsabilidades e compromissos', dimension: 'cooperacao' },
      { id: 'co5', text: 'Colabora com o grupo mesmo sem ser solicitado(a)', dimension: 'cooperacao' },
    ],
  },
];

export function getInstrument(code: string): ScreeningInstrumentDef | undefined {
  return SCREENING_INSTRUMENTS.find((i) => i.code === code);
}

function num(v: any): number {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildDimensions(
  def: ScreeningInstrumentDef,
  scores: Record<string, number>,
  maxPerItem: number,
) {
  const dims: Record<string, { label: string; score: number; max: number; percentage: number }> = {};
  if (!def.dimensions) return dims;
  for (const d of def.dimensions) {
    const items = def.items.filter((it) => it.dimension === d.id);
    let score = 0;
    for (const it of items) score += num(scores[it.id]);
    const max = items.length * maxPerItem;
    dims[d.id] = {
      label: d.label,
      score,
      max,
      percentage: max > 0 ? Math.round((score / max) * 100) : 0,
    };
  }
  return dims;
}

function scoreMCHAT(answers: Record<string, any>): ScreeningResult {
  const def = getInstrument('MCHAT_R')!;
  let fails = 0;
  let criticalFails = 0;
  for (const it of def.items) {
    const ans = answers[it.id];
    if (ans === undefined || ans === null || ans === '') continue;
    const failed = it.reverse ? ans === 'sim' : ans === 'nao';
    if (failed) {
      fails += 1;
      if (it.critical) criticalFails += 1;
    }
  }
  const answered = def.items.filter((it) => answers[it.id] !== undefined && answers[it.id] !== null && answers[it.id] !== '').length;
  let riskLevel: string;
  let summary: string;
  if (fails >= 8) {
    riskLevel = 'ALTO';
    summary = `Risco ALTO para TEA: ${fails} de ${answered} itens com falha (${criticalFails} críticos). Recomenda-se encaminhamento imediato para avaliação diagnóstica especializada.`;
  } else if (fails >= 3) {
    riskLevel = 'MODERADO';
    summary = `Risco MODERADO: ${fails} itens com falha (${criticalFails} críticos). Recomenda-se aplicar a Entrevista de Seguimento (M-CHAT-R/F) para confirmar os itens de falha.`;
  } else {
    riskLevel = 'BAIXO';
    summary = `Risco BAIXO para TEA: ${fails} itens com falha (${criticalFails} críticos). Manter monitoramento do desenvolvimento infantil.`;
  }
  return {
    scores: { total: fails, max: 20, answered, criticalFails },
    riskLevel,
    summary,
  };
}

function scoreSNAP(answers: Record<string, any>, respondent?: string): ScreeningResult {
  const def = getInstrument('SNAP_IV')!;
  const dimScores: Record<string, { score: number; count: number; mean: number }> = {};
  for (const d of def.dimensions!) {
    const items = def.items.filter((it) => it.dimension === d.id);
    let score = 0;
    let count = 0;
    for (const it of items) {
      const v = num(answers[it.id]);
      score += v;
      if (v >= 2) count += 1;
    }
    dimScores[d.id] = { score, count, mean: Math.round((score / items.length) * 100) / 100 };
  }
  const inat = dimScores['desatencao'];
  const hiper = dimScores['hiperatividade'];
  const maxSymptoms = Math.max(inat.count, hiper.count);
  let riskLevel: string;
  let summary: string;
  if (maxSymptoms >= 6) {
    riskLevel = 'ELEVADO';
    const subtype =
      inat.count >= 6 && hiper.count >= 6
        ? 'combinado (desatenção + hiperatividade/impulsividade)'
        : inat.count >= 6
          ? 'predominantemente desatento'
          : 'predominantemente hiperativo/impulsivo';
    summary = `Rastreio SUGESTIVO de TDAH (subtipo ${subtype}): ${inat.count} sintomas de desatenção e ${hiper.count} de hiperatividade/impulsividade. Recomenda-se avaliação diagnóstica especializada (informante: ${respondent || 'não informado'}).`;
  } else if (maxSymptoms >= 3) {
    riskLevel = 'MODERADO';
    summary = `Indicadores parciais de TDAH: ${inat.count} sintomas de desatenção e ${hiper.count} de hiperatividade/impulsividade. Monitorar e considerar avaliação complementar.`;
  } else {
    riskLevel = 'BAIXO';
    summary = `Rastreio sem indicadores significativos de TDAH: ${inat.count} sintomas de desatenção e ${hiper.count} de hiperatividade/impulsividade (informante: ${respondent || 'não informado'}).`;
  }
  return {
    scores: {
      total: inat.score + hiper.score,
      max: 54,
      dimensions: {
        desatencao: { label: 'Desatenção', score: inat.score, max: 27, mean: inat.mean, symptoms: inat.count },
        hiperatividade: { label: 'Hiperatividade/Impulsividade', score: hiper.score, max: 27, mean: hiper.mean, symptoms: hiper.count },
      },
    },
    riskLevel,
    summary,
  };
}

function scoreATA(answers: Record<string, any>): ScreeningResult {
  const def = getInstrument('ATA')!;
  let total = 0;
  let answered = 0;
  for (const it of def.items) {
    const v = num(answers[it.id]);
    total += v;
    if (answers[it.id] !== undefined && answers[it.id] !== null && answers[it.id] !== '') answered += 1;
  }
  let riskLevel: string;
  let summary: string;
  if (total >= 15) {
    riskLevel = 'ELEVADO';
    summary = `Pontuação ATA ${total}/46 — risco ELEVADO de traços autísticos (ponto de corte: 15). Recomenda-se encaminhamento para avaliação diagnóstica especializada.`;
  } else if (total >= 8) {
    riskLevel = 'MODERADO';
    summary = `Pontuação ATA ${total}/46 — indicadores moderados de traços autísticos. Manter acompanhamento e considerar avaliação complementar.`;
  } else {
    riskLevel = 'BAIXO';
    summary = `Pontuação ATA ${total}/46 — sem indicadores significativos de traços autísticos.`;
  }
  return { scores: { total, max: 46, answered }, riskLevel, summary };
}

function scoreASRS(answers: Record<string, any>): ScreeningResult {
  const def = getInstrument('ASRS_18')!;
  let partA = 0;
  let partB = 0;
  for (const it of def.items) {
    const v = num(answers[it.id]);
    if (it.dimension === 'parteA') partA += v;
    else partB += v;
  }
  let riskLevel: string;
  let summary: string;
  if (partA >= 14 || partB >= 15) {
    riskLevel = 'ELEVADO';
    summary = `Rastreio SUGESTIVO de TDAH no adulto: Parte A ${partA}/24 (corte: 14) e Parte B ${partB}/48 (corte: 15). Recomenda-se avaliação diagnóstica com profissional habilitado.`;
  } else if (partA >= 9 || partB >= 10) {
    riskLevel = 'MODERADO';
    summary = `Indicadores parciais de TDAH no adulto: Parte A ${partA}/24 e Parte B ${partB}/48. Monitorar sintomas e considerar avaliação complementar.`;
  } else {
    riskLevel = 'BAIXO';
    summary = `Rastreio sem indicadores significativos de TDAH no adulto: Parte A ${partA}/24 e Parte B ${partB}/48.`;
  }
  return {
    scores: {
      total: partA + partB,
      max: 72,
      dimensions: {
        parteA: { label: 'Parte A — Triagem', score: partA, max: 24, percentage: Math.round((partA / 24) * 100) },
        parteB: { label: 'Parte B — Sintomas', score: partB, max: 48, percentage: Math.round((partB / 48) * 100) },
      },
    },
    riskLevel,
    summary,
  };
}

function scoreHabilidadesSociais(answers: Record<string, any>): ScreeningResult {
  const def = getInstrument('HABILIDADES_SOCIAIS')!;
  const dims = buildDimensions(def, answers, 4);
  let total = 0;
  let max = 0;
  for (const d of def.dimensions!) {
    total += dims[d.id].score;
    max += dims[d.id].max;
  }
  const overall = max > 0 ? Math.round((total / max) * 100) : 0;
  const weakest = [...def.dimensions!].sort((a, b) => dims[a.id].percentage - dims[b.id].percentage)[0];
  let riskLevel: string;
  let summary: string;
  if (overall >= 75) {
    riskLevel = 'BAIXO';
    summary = `Repertório de habilidades sociais adequado (${overall}%). Dimensão com menor índice: ${dims[weakest.id].label} (${dims[weakest.id].percentage}%).`;
  } else if (overall >= 50) {
    riskLevel = 'MODERADO';
    summary = `Repertório de habilidades sociais em desenvolvimento (${overall}%). Dimensão com menor índice: ${dims[weakest.id].label} (${dims[weakest.id].percentage}%) — recomenda-se estimulação direcionada.`;
  } else {
    riskLevel = 'ELEVADO';
    summary = `Repertório de habilidades sociais SIGNIFICATIVAMENTE reduzido (${overall}%). Dimensão crítica: ${dims[weakest.id].label} (${dims[weakest.id].percentage}%) — recomenda-se intervenção estruturada.`;
  }
  return { scores: { total, max, overall, dimensions: dims }, riskLevel, summary };
}

const SCORERS: Record<string, (answers: Record<string, any>, respondent?: string) => ScreeningResult> = {
  MCHAT_R: scoreMCHAT,
  SNAP_IV: scoreSNAP,
  ATA: scoreATA,
  ASRS_18: scoreASRS,
  HABILIDADES_SOCIAIS: scoreHabilidadesSociais,
};

export function scoreScreening(code: string, answers: Record<string, any>, respondent?: string): ScreeningResult {
  const scorer = SCORERS[code];
  if (!scorer) {
    throw new Error(`Instrumento de rastreio desconhecido: ${code}`);
  }
  return scorer(answers, respondent);
}