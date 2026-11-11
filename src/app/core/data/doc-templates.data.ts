export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Diagnóstico' | 'Avaliação' | 'Intervenção' | 'Escolar' | 'Jurídico' | 'Família' | 'Financeiro';
  favorite?: boolean;
  isCustom?: boolean;
  content: string;
}

export const DOC_CATEGORIES = [
  { value: 'Diagnóstico', label: 'Diagnóstico', count: 7 },
  { value: 'Avaliação', label: 'Avaliação', count: 6 },
  { value: 'Intervenção', label: 'Intervenção', count: 6 },
  { value: 'Escolar', label: 'Escolar', count: 5 },
  { value: 'Jurídico', label: 'Jurídico', count: 5 },
  { value: 'Família', label: 'Família', count: 4 },
  { value: 'Financeiro', label: 'Financeiro', count: 4 },
] as const;

export const DOC_TEMPLATES: DocTemplate[] = [
  // ==========================================
  // DIAGNÓSTICO (7)
  // ==========================================
  {
    id: 'd1',
    name: 'Laudo TEA (Transtorno do Espectro Autista)',
    description: 'Laudo multiprofissional completo com critérios DSM-5, CID-11, escalas e diretrizes escolares',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - TRANSTORNO DO ESPECTRO AUTISTA (TEA)</h2>
<h3>1. DADOS DE IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição de Ensino:</strong> {escola} — Série/Ano: {serie}</p>
<p><strong>Responsável(is):</strong> {nome_responsavel}</p>
<p><strong>Data de Emissão:</strong> {data_atual}</p>

<h3>2. MOTIVO DO ENCAMINHAMENTO & QUEIXA PRINCIPAL</h3>
<p>O(A) paciente foi encaminhado(a) para avaliação clínica psicopedagógica e neurocognitiva em decorrência de dificuldades acentuadas na reciprocidade socioemocional, rigidez cognitiva, desatenção no contexto escolar, estereotipias motoras em momentos de ansiedade e sobrecarga sensorial.</p>

<h3>3. HISTÓRICO DO DESENVOLVIMENTO (ANAMNESE)</h3>
<ul>
  <li><strong>Marcos Neuropsicomotores:</strong> Sustentação cefálica e marcha adquiridas dentro do padrão esperado; início de vocalizações com atraso na aquisição de fala expressiva e uso predominantemente instrumental do adulto.</li>
  <li><strong>Processamento Sensorial:</strong> Presença de hiper-reatividade tátil e auditiva frente a ruídos intensos e texturas específicas; busca proprioceptiva por pressão e movimentos pendulares.</li>
  <li><strong>Autonomia e Rotina:</strong> Necessita de apoio substancial para atividades de vida diária (AVDs), apresentando rigidez frente a quebras repentinas de rotina e seletividade alimentar moderada.</li>
</ul>

<h3>4. OBSERVAÇÃO CLÍNICA & COMPORTAMENTAL</h3>
<ul>
  <li><strong>Comunicação Social:</strong> Contato visual oscilante, dificuldade na manutenção do diálogo alternado e tendência a falas ecolálicas ou temáticas de hiperfoco.</li>
  <li><strong>Interação com Pares:</strong> Demonstra interesse em interagir, porém com abordagens invasivas ou atípicas, apresentando dificuldade na leitura de pistas sociais sutis e expressões faciais.</li>
  <li><strong>Comportamentos Restritos & Repetitivos:</strong> Interesses circunscritos, apego excessivo a rotinas e padrões rígidos de brincar (enfileiramento e separação por cores).</li>
</ul>

<h3>5. INSTRUMENTOS E PROTOCOLOS APLICADOS</h3>
<ul>
  <li>Escala M-CHAT-R / Rastreio de Sinais Precoces de Autismo.</li>
  <li>Protocolo de Avaliação de Comportamento Verbal e Repertório Básico (baseado em ABA/VB-MAPP).</li>
  <li>Provas Operatórias de Piaget e EOCA (Entrevista Operativa Centrada na Aprendizagem).</li>
  <li>Anamnese semiestruturada com os responsáveis e parecer da coordenação escolar.</li>
</ul>

<h3>6. SÍNTESE COGNITIVA E APRENDIZAGEM</h3>
<p>Identificou-se discrepância qualitativa entre o raciocínio visual/concreto e as habilidades pragmáticas de abstração e generalização conceitual. O perfil de aprendizagem beneficia-se expressivamente de antecipação visual, instruções fracionadas e rotinas estruturadas.</p>

<h3>7. CONCLUSÃO DIAGNÓSTICA</h3>
<p>Os achados clínicos e comportamentais convergem integralmente para os critérios do <strong>DSM-5 (299.00)</strong> e <strong>CID-11 (6A02.0)</strong> para <strong>Transtorno do Espectro Autista (TEA) — Nível 1 de Suporte</strong>, requerendo apoio direcionado para comunicação social e flexibilidade cognitiva.</p>

<div class="page-break" contenteditable="false" style="page-break-before: always; break-before: always; border-top: 2px dashed #94a3b8; margin: 18px 0 12px 0; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold; user-select: none; padding: 4px 0;">✂ --- Folha 2: Conduta Terapêutica & Recomendações Escolares ---</div>

<h3>8. PLANO DE CONDUTA E RECOMENDAÇÕES MULTIDISCIPLINARES</h3>
<ol>
  <li><strong>Intervenção Psicopedagógica:</strong> Sessões com foco em funções executivas, flexibilidade cognitiva, raciocínio lógico e autorregulação.</li>
  <li><strong>Terapia ABA e Comportamental:</strong> Treinamento de habilidades sociais e expansão do repertório comunicativo funcional.</li>
  <li><strong>Fonoaudiologia:</strong> Acompanhamento centrado na pragmática da linguagem e compreensão textual inferencial.</li>
  <li><strong>Adaptações Escolares (Lei Federal nº 12.764/2012 e LBI nº 13.146/2015):</strong>
    <ul>
      <li>Elaboração e execução do Plano Educacional Individualizado (PEI).</li>
      <li>Disponibilização de suporte e mediação pedagógica em sala de aula.</li>
      <li>Pistas visuais de rotina e redução de estímulos distratores sonoros.</li>
      <li>Tempo estendido e avaliações fracionadas com enunciados diretos.</li>
    </ul>
  </li>
</ol>`
  },
  {
    id: 'd2',
    name: 'Laudo TDAH (Déficit de Atenção e Hiperatividade)',
    description: 'Laudo completo com inventário SNAP-IV, perfil neuroexecutivo e adaptações pela Lei 14.254/21',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO CLÍNICA - TDAH</h2>
<h3>1. DADOS DE IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Escola:</strong> {escola} — Série: {serie}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data de Emissão:</strong> {data_atual}</p>

<h3>2. MOTIVO DA AVALIAÇÃO CLÍNICA</h3>
<p>Investigação de queixas de desatenção sustentada, hiperatividade motora, desorganização no cumprimento de tarefas acadêmicas, perda frequente de materiais e declínio no rendimento escolar.</p>

<h3>3. ANÁLISE DOS INSTRUMENTOS E ESCALAS PADRONIZADAS</h3>
<ul>
  <li><strong>Escala SNAP-IV (Versão Pais e Professores):</strong> Pontuação indicativa de frequência clinicamente significativa para sintomas de Desatenção e Hiperatividade/Impulsividade em ambos os ambientes (escola e família).</li>
  <li><strong>Bateria de Funções Executivas:</strong> Déficit no controle inibitório de resposta, lentidão na velocidade de processamento sob sobrecarga e fadiga rápida em atenção concentrada.</li>
  <li><strong>EOCA e Análise de Produção Textual:</strong> Apresenta ideias criativas e bom vocabulário oral, com desorganização na transposição para a escrita decorrente da impulsividade.</li>
</ul>

<h3>4. SINTOMATOLOGIA CLÍNICA OBSERVADA</h3>
<ul>
  <li><strong>Dimensão Desatenção:</strong> Comete erros por descuido, não sustenta o foco em leituras extensas e necessita de reorientação verbal constante para concluir exercícios.</li>
  <li><strong>Dimensão Hiperatividade/Impulsividade:</strong> Inquietação motora contínua de membros inferiores e superiores, dificuldade em aguardar a sua vez e interrupção frequente na fala alheia.</li>
</ul>

<h3>5. CONCLUSÃO CLÍNICA</h3>
<p>O perfil cognitivo-comportamental preenche todos os critérios estabelecidos pelo <strong>DSM-5 (314.01)</strong> e <strong>CID-11 (6A05.2)</strong> para o diagnóstico de <strong>Transtorno do Déficit de Atenção e Hiperatividade — Tipo Combinado</strong>.</p>

<h3>6. DIRETRIZES DE ENCAMINHAMENTO E SUPORTE ESCOLAR (LEI 14.254/2021)</h3>
<ol>
  <li><strong>Avaliação Médica Especializada:</strong> Encaminhamento a Neuropediatra / Psiquiatra Infantil para ponderação de suporte psicofarmacológico.</li>
  <li><strong>Intervenção Psicopedagógica Clínica:</strong> Treino sistemático de estratégias metacognitivas, gestão de tempo (técnica Pomodoro) e organização de caderno e agenda.</li>
  <li><strong>Adaptações Pedagógicas Obrigatórias (Lei nº 14.254/21):</strong>
    <ul>
      <li>Assento na primeira fileira, longe de janelas e portas.</li>
      <li>Fracionamento de provas em blocos com permissão de pausas motoras de 2 minutos.</li>
      <li>Pistas visuais em enunciados (destaque em negrito das palavras-chave).</li>
      <li>Autorização para verificação prévia do material escolar antes da saída da aula.</li>
    </ul>
  </li>
</ol>`
  },
  {
    id: 'd3',
    name: 'Laudo Dislexia / Transtorno Específico da Aprendizagem',
    description: 'Laudo com mapeamento de rotas de leitura, consciência fonológica e diretrizes da Lei 14.254/21',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - DISLEXIA DO DESENVOLVIMENTO</h2>
<h3>1. IDENTIFICAÇÃO DO PACIENTE</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Idade:</strong> {idade} | <strong>Data de Nascimento:</strong> {data_nascimento}</p>
<p><strong>Instituição Escolar:</strong> {escola} — Série/Ano: {serie}</p>
<p><strong>Responsável(is):</strong> {nome_responsavel}</p>
<p><strong>Data de Realização:</strong> {data_atual}</p>

<h3>2. HISTÓRICO ESCOLAR E QUEIXA PRINCIPAL</h3>
<p>Dificuldades acentuadas e persistentes na aquisição e automatização da leitura e escrita, trocas ortográficas frequentes, estafa cognitiva em avaliações textuais e discrepância entre o potencial intelectual e o desempenho na alfabetização.</p>

<h3>3. AVALIAÇÃO DAS HABILIDADES PSICOLINGUÍSTICAS</h3>
<ul>
  <li><strong>Consciência Fonológica:</strong> Déficits severos na consciência fonêmica, manipulação, subtração e inversão de fonemas.</li>
  <li><strong>Nomeação Rápida Automática (RAN):</strong> Velocidade de acesso ao léxico mental substancialmente rebaixada para letras, dígitos e cores.</li>
  <li><strong>Rotas de Leitura:</strong> Comprometimento primário da rota fonológica (dificuldade marcante na leitura de pseudopalavras) e sobrecarga na rota lexical com tentativas de adivinhação de palavras por pistas contextuais.</li>
  <li><strong>Compreensão Leitora:</strong> Nível de compreensão leitora rebaixado quando lê de forma autônoma; excelente compreensão quando o mesmo texto é lido em voz alta por um terceiro.</li>
</ul>

<h3>4. CONCLUSÃO DIAGNÓSTICA</h3>
<p>Os achados clínicos confirmam o diagnóstico de <strong>Transtorno Específico da Aprendizagem com prejuízo na Leitura e Escrita (Dislexia do Desenvolvimento — CID-11 6A03.0 / DSM-5 315.00)</strong> de grau moderado.</p>

<h3>5. PLANO TERAPÊUTICO E ADAPTAÇÕES CURRICULARES (LEI Nº 14.254/2021)</h3>
<ol>
  <li><strong>Intervenção Psicopedagógica / Fônica:</strong> Treino sistemático de instrução fônica explícita, decodificação multissensorial e ampliação da memória de trabalho verbal.</li>
  <li><strong>Medidas de Acessibilidade Pedagógica em Sala de Aula:</strong>
    <ul>
      <li>Disponibilização de leitor de apoio para textos longos e provas.</li>
      <li>Uso de fontes tipográficas amigáveis (sem serifa, tamanho 14 e entrelinhas ampliado).</li>
      <li>Não solicitação de leitura oral em voz alta na frente dos colegas, salvo por iniciativa espontânea do aluno.</li>
      <li>Critério atenuado na correção de erros ortográficos em disciplinas não-linguísticas.</li>
      <li>Tempo adicional de 30 a 50% para conclusão de provas e exames escolares.</li>
    </ul>
  </li>
</ol>`
  },
  {
    id: 'd4',
    name: 'Laudo de Deficiência Intelectual (DI)',
    description: 'Avaliação multidimensional de conduta adaptativa nos domínios conceitual, social e prático',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - DEFICIÊNCIA INTELECTUAL</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição de Ensino:</strong> {escola} — Ano: {serie}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data da Avaliação:</strong> {data_atual}</p>

<h3>2. HISTÓRICO & MOTIVO DA AVALIAÇÃO</h3>
<p>Avaliação das funções de raciocínio lógico-abstrato, aprendizagem acadêmica e conduta adaptativa frente a defasagem curricular persistente e necessidade de mediação contínua nas rotinas cotidianas.</p>

<h3>3. AVALIAÇÃO MULTIDIMENSIONAL DO COMPORTAMENTO ADAPTATIVO</h3>
<ul>
  <li><strong>Domínio Conceitual:</strong> Lentidão na aquisição de conceitos numéricos e temporais; beneficia-se de materiais concretos, recursos visuais e modelagem passo a passo.</li>
  <li><strong>Domínio Social:</strong> Interage afetuosamente com pares e adultos; necessita de apoio para interpretação de regras sociais complexas, julgamento de risco e regulação em situações de conflito.</li>
  <li><strong>Domínio Prático:</strong> Realiza tarefas básicas de autocuidado e higiene com autonomia parcial; requer supervisão para manejo de valores monetários, segurança e planejamento sequencial.</li>
</ul>

<h3>4. SÍNTESE CLÍNICA E CLASSIFICAÇÃO</h3>
<p>O quadro clínico e funcional é compatível com <strong>Deficiência Intelectual — Nível Leve (CID-11 6A00.0 / CID-10 F70)</strong>, caracterizada por demanda de suporte intermitente/limitado no âmbito acadêmico e na vida comunitária.</p>

<h3>5. RECOMENDAÇÕES PARA O PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)</h3>
<ol>
  <li>Currículo adaptado com ênfase em habilidades funcionais de leitura e cálculo prático para a vida diária.</li>
  <li>Mediação pedagógica contínua com redução da complexidade das tarefas abstratas.</li>
  <li>Inclusão de recursos de comunicação alternativa ou pistas visuais de apoio.</li>
  <li>Acompanhamento psicopedagógico e estimulação das funções executivas básicas.</li>
</ol>`
  },
  {
    id: 'd5',
    name: 'Laudo Atraso Global do Desenvolvimento (AGD)',
    description: 'Laudo para primeira infância com investigação de marcos motores, linguagem e cognição',
    category: 'Diagnóstico',
    content: `<h2>LAUDO CLÍNICO - ATRASO GLOBAL DO DESENVOLVIMENTO (AGD)</h2>
<h3>1. IDENTIFICAÇÃO DA CRIANÇA</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data:</strong> {data_atual}</p>

<h3>2. MOTIVO DO ENCAMINHAMENTO</h3>
<p>Investigação precoce de defasagem observada em múltiplos marcos do desenvolvimento neuropsicomotor, incluindo aquisição tardia da marcha, ausência de fala comunicativa e déficit no brincar compartilhado.</p>

<h3>3. MAPEAMENTO DOS MARCOS NEUROEVOLUTIVOS</h3>
<ul>
  <li><strong>Área Motora:</strong> Hipotonia leve a moderada de tronco, marcha com base alargada e preensão palmar imatura.</li>
  <li><strong>Área da Linguagem e Comunicação:</strong> Compreensão de ordens simples preservada mediante gestos; ausência de frases com duas palavras e vocabulário expressivo limitado a sons isolados.</li>
  <li><strong>Cognição e Resolução de Problemas:</strong> Permanece em fase sensório-motora, com exploração tátil/oral de objetos e pouca intencionalidade causal no brincar.</li>
  <li><strong>Socialização e Afetividade:</strong> Bom contato ocular e resposta ao sorriso social, com dificuldade na atenção compartilhada continuada.</li>
</ul>

<h3>4. CONCLUSÃO CLÍNICA</h3>
<p>Quadro compatível com <strong>Atraso Global do Desenvolvimento Neuropsicomotor (CID-11 6A01.0 / CID-10 F88)</strong>, diagnóstico provisional aplicável na primeira infância que demanda intervenção precoce intensiva.</p>

<h3>5. ENCAMINHAMENTOS E INTERVENÇÃO PRECOCE</h3>
<ol>
  <li>Estimulação Precoce Multidisciplinar com Fonoaudiologia e Terapia Ocupacional.</li>
  <li>Intervenção Psicopedagógica voltada para mediação do brincar simbólico e atenção conjunta.</li>
  <li>Avaliação com Neuropediatra e realização de exames complementares de triagem metabólica/genética.</li>
  <li>Reavaliação clínica e neuroevolutiva em intervalo de 6 meses.</li>
</ol>`
  },
  {
    id: 'd6',
    name: 'Laudo Transtorno Opositor Desafiador (TOD)',
    description: 'Avaliação clínica comportamental para reatividade emocional, oposição e diretrizes parentais',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - TRANSTORNO OPOSITOR DESAFIADOR (TOD)</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Idade:</strong> {idade} | <strong>Escola:</strong> {escola}</p>
<p><strong>Responsáveis:</strong> {nome_responsavel}</p>
<p><strong>Data da Emissão:</strong> {data_atual}</p>

<h3>2. MOTIVO DA AVALIAÇÃO</h3>
<p>Investigação de comportamento recorrente de desobediência a figuras de autoridade, crises frequentes de birra desproporcional à idade, baixa tolerância à frustração e recusa sistemática ao cumprimento de regras escolares e familiares.</p>

<h3>3. ACHADOS CLÍNICOS E COMPORTAMENTAIS</h3>
<ul>
  <li><strong>Humor Irritável e Explosivo:</strong> Facilmente incomodado por demandas cotidianas, reagindo com respostas verbais agressivas e negativismo.</li>
  <li><strong>Comportamento Vindicativo e Desafiador:</strong> Desafia deliberadamente regras pré-estabelecidas e responsabiliza colegas ou familiares pelos próprios erros.</li>
  <li><strong>Contexto Escolar:</strong> Dificuldade acentuada em transições de atividades e trabalhos em equipe, gerando conflitos frequentes no recreio.</li>
</ul>

<h3>4. CONCLUSÃO CLÍNICA</h3>
<p>Os padrões de conduta apresentados atendem aos critérios diagnósticos do <strong>DSM-5 (313.81)</strong> e <strong>CID-11 (6C90.0)</strong> para <strong>Transtorno Opositor Desafiador (TOD)</strong> de grau moderado.</p>

<h3>5. RECOMENDAÇÕES E DIRETRIZES DE MANEJO</h3>
<ol>
  <li><strong>Treinamento de Manejo Parental:</strong> Alinhamento de regras claras, elogio ao comportamento adequado e técnicas de extinção de comportamentos opositivos.</li>
  <li><strong>Psicoterapia Comportamental & Psicopedagogia:</strong> Treino de autorregulação emocional, identificação precoce de gatilhos de raiva e tolerância à frustração.</li>
  <li><strong>Manejo em Sala de Aula:</strong> Evitar embates públicos de autoridade; utilizar escolhas dirigidas (ex: "prefere fazer a folha azul ou a verde primeiro?") e reforço contingente positivo.</li>
</ol>`
  },
  {
    id: 'd7',
    name: 'Laudo de Hiperatividade e Impulsividade com Modulação Inibitória',
    description: 'Laudo clínico voltado especificamente para componentes motores, impulsividade e agitação',
    category: 'Diagnóstico',
    content: `<h2>LAUDO CLÍNICO - HIPERATIVIDADE E DEFASAGEM INIBITÓRIA</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Escola:</strong> {escola} — {serie}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data:</strong> {data_atual}</p>

<h3>2. QUEIXA PRINCIPAL</h3>
<p>Comportamento motor excessivo, dificuldade de permanecer sentado em sala de aula, respostas precipitadas a estímulos verbais e busca contínua por estimulação sensorial e motora.</p>

<h3>3. AVALIAÇÃO PSICOMOTORA E NEUROCOGNITIVA</h3>
<ul>
  <li><strong>Inibição Comportamental:</strong> Acentuada dificuldade em suprimir respostas motoras automáticas frente a comandos inibitórios ("pare / espere").</li>
  <li><strong>Agitação Psicomotora:</strong> Movimentação contínua de tronco e extremidades mesmo quando engajado em atividades de seu interesse.</li>
  <li><strong>Atenção Sustentada:</strong> Preservada quando o conteúdo possui dinamismo e feedback visual imediato; rebaixada em tarefas monótonas ou repetitivas.</li>
</ul>

<h3>4. CONCLUSÃO & RECOMENDAÇÕES</h3>
<p>Compatível com <strong>TDAH com Predomínio Hiperativo/Impulsivo (CID-11 6A05.1)</strong>.</p>
<ol>
  <li>Permitir o uso de moduladores sensoriais discretos (fidget toys ou faixas elásticas na cadeira).</li>
  <li>Atribuição de responsabilidades ativas em sala de aula (distribuir materiais, apagar o quadro).</li>
  <li>Intervenção psicopedagógica centrada em autorregulação e planejamento sequencial de ações.</li>
</ol>`
  },

  // ==========================================
  // AVALIAÇÃO (6)
  // ==========================================
  {
    id: 'a1',
    name: 'Relatório de Avaliação Psicopedagógica Completo',
    description: 'Documento master de 7 seções cobrindo queixa, histórico, baterias aplicadas, síntese e conduta',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO PSICOPEDAGÓGICA CLÍNICA</h2>
<h3>1. DADOS DE IDENTIFICAÇÃO</h3>
<p><strong>Nome do(a) Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição Escolar:</strong> {escola} — Ano/Série: {serie}</p>
<p><strong>Filiação/Responsáveis:</strong> {nome_responsavel}</p>
<p><strong>Profissional Responsável:</strong> {profissional_nome}</p>
<p><strong>Período de Avaliação:</strong> {data_atual}</p>

<h3>2. MOTIVO DA AVALIAÇÃO E QUEIXA INICIAL</h3>
<p>A família procurou atendimento psicopedagógico especializado com o objetivo de compreender as causas dos bloqueios na aprendizagem escolar, dificuldades na alfabetização e insegurança manifestada diante de avaliações acadêmicas.</p>

<h3>3. METODOLOGIA E INSTRUMENTOS UTILIZADOS</h3>
<ul>
  <li>Entrevista de Anamnese com a família sobre a história de vida e desenvolvimento.</li>
  <li>EOCA (Entrevista Operativa Centrada na Aprendizagem) segundo a epistemologia convergente de Jorge Visca.</li>
  <li>Provas de Diagnóstico Operatório de Jean Piaget (Conservação, Classificação e Seriação).</li>
  <li>Teste de Desempenho Escolar (TDE-II) nas subáreas de Escrita, Aritmética e Leitura.</li>
  <li>Avaliação do nível conceitual de escrita (Emilia Ferreiro e Ana Teberosky).</li>
  <li>Análise de produções gráficas (Desenho da Família, Par Educativo) e contato com a equipe pedagógica.</li>
</ul>

<h3>4. ANÁLISE DOS RESULTADOS POR EIXOS COGNITIVOS</h3>
<ul>
  <li><strong>Vínculo com o Objeto do Conhecimento:</strong> Vínculo inicialmente defensivo, evoluindo para postura participativa e curiosa mediante reforço positivo.</li>
  <li><strong>Estruturas Lógicas do Pensamento:</strong> Pensamento no estágio operatório concreto em consolidação; domínio de seriação e classificação simples, em transição nas provas de conservação de quantidade.</li>
  <li><strong>Habilidades Linguísticas e Leitoras:</strong> Nível de escrita alfabético inicial com necessidade de consolidação de relações grafofonêmicas complexas.</li>
  <li><strong>Raciocínio Matemático:</strong> Boa compreensão do conceito de quantidade; necessita de apoio visual para operações de cálculo com agrupamento e reagrupamento.</li>
  <li><strong>Funções Executivas:</strong> Boa iniciativa de ação; requer mediação externa para planejamento sequencial e revisão cuidadosa do que foi produzido.</li>
</ul>

<h3>5. SÍNTESE DIAGNÓSTICA</h3>
<p>Os dados coletados apontam para um perfil de aprendizagem com ótimo potencial intelectual global, cujas dificuldades decorrem primariamente de imaturidade nas funções de planejamento e sobrecarga atencional, e não de defasagem de capacidade cognitiva.</p>

<h3>6. ENCAMINHAMENTOS E ORIENTAÇÕES PRÁTICAS</h3>
<ol>
  <li><strong>Ao Paciente:</strong> Início de intervenção psicopedagógica semanal para fortalecimento metacognitivo e alfabetização estruturada.</li>
  <li><strong>À Instituição de Ensino:</strong>
    <ul>
      <li>Fragmentar instruções longas e valorizar etapas intermediárias dos trabalhos escolares.</li>
      <li>Garantir assento próximo ao professor com mediação acolhedora.</li>
      <li>Conceder tempo adicional para finalização de provas escritas.</li>
    </ul>
  </li>
  <li><strong>À Família:</strong>
    <ul>
      <li>Manter ambiente de estudos calmo, iluminado e sem telas por perto durante a lição.</li>
      <li>Elogiar o empenho e os progressos ao invés de focar unicamente na nota numérica final.</li>
    </ul>
  </li>
</ol>`
  },
  {
    id: 'a2',
    name: 'Relatório de Avaliação Funcional Comportamental (ABA)',
    description: 'Análise de contingências A-B-C, repertório de operantes verbais e plano de intervenção',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO FUNCIONAL ABA</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Idade:</strong> {idade} | <strong>Data da Coleta:</strong> {data_atual}</p>
<p><strong>Terapeuta ABA:</strong> {profissional_nome}</p>

<h3>2. AVALIAÇÃO DE LINHA DE BASE & ANÁLISE FUNCIONAL (A-B-C)</h3>
<p>Foram realizadas observações estruturadas para mapeamento das contingências que mantêm os comportamentos-alvo:</p>
<ul>
  <li><strong>Antecedentes Comuns:</strong> Apresentação de demandas acadêmicas com texto longo, transição de atividades sem aviso prévio e recusa de acesso a itens de preferência.</li>
  <li><strong>Respostas Observadas:</strong> Fuga da mesa, vocalizações desreguladas e lançamento de materiais no chão.</li>
  <li><strong>Consequências Mantenedoras:</strong> Fuga da tarefa (esquiva da demanda de esforço cognitivo) e obtenção de atenção verbal imediata do adulto.</li>
</ul>

<h3>3. AVALIAÇÃO DO REPERTÓRIO VERBAL (OPERANTES DE SKINNER)</h3>
<ul>
  <li><strong>Mando (Pedidos):</strong> Emite pedidos funcionais de itens tangíveis com apoio gestual; baixa emissão de pedidos para pausas ou auxílio.</li>
  <li><strong>Tato (Nomeação):</strong> Nomeia objetos concretos e figuras conhecidas com precisão acima de 80%.</li>
  <li><strong>Ecoico (Imitação Vocal):</strong> Repertório ecoico preservado para palavras simples e dissílabas.</li>
  <li><strong>Intraverbal (Diálogo/Troca):</strong> Apresenta respostas prontas para perguntas fechadas; dificuldade em manter conversação aberta.</li>
</ul>

<h3>4. PLANO DE ENSINO E REDUÇÃO COMPORTAMENTAL</h3>
<ol>
  <li>Ensino de Comunicação Funcional (FCT) para solicitação adequada de pausa ("quero descansar").</li>
  <li>Extinção de fuga da demanda com procedimento de correção e entrega de reforçador de alta preferência mediante engajamento na tarefa.</li>
  <li>Uso de economia de fichas com reforçamento positivo contingente a cada etapa cumprida.</li>
</ol>`
  },
  {
    id: 'a3',
    name: 'Parecer Técnico Psicopedagógico Pontual',
    description: 'Parecer formal e circunstanciado para convênios, perícias, escolas ou órgãos de proteção',
    category: 'Avaliação',
    content: `<h2>PARECER TÉCNICO PSICOPEDAGÓGICO</h2>
<h3>IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Escola:</strong> {escola} — Série: {serie}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data de Emissão:</strong> {data_atual}</p>

<h3>PARECER CONCLUSIVO</h3>
<p>Atesto, para os devidos fins de direito e instrução técnica, que o(a) paciente acima identificado(a) encontra-se em acompanhamento psicopedagógico clínico regular nesta unidade, com frequência semanal de atendimento.</p>
<p>Durante o percurso terapêutico, observou-se evolução qualitativa relevante na regulação atencional e na disponibilidade para o aprendizado de conteúdos formais, subsistindo a necessidade imperativa de continuidade das intervenções especializadas e das adaptações pedagógicas escolares vigentes.</p>
<p>Por ser expressão da verdade com base no prontuário clínico sob minha responsabilidade, firmo o presente parecer.</p>`
  },
  {
    id: 'a4',
    name: 'Relatório de Triagem e Rastreio Neurocognitivo',
    description: 'Síntese de escalas de triagem, identificação precoce de riscos e indicadores de encaminhamento',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE TRIAGEM E RASTREIO NEUROCOGNITIVO</h2>
<h3>1. DADOS CADASTRAIS</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Data da Triagem:</strong> {data_atual}</p>

<h3>2. QUESTIONÁRIOS E ESCALAS DE RASTREIO APLICADOS</h3>
<ul>
  <li>Questionário de Comunicação e Interação Social (Rastreio TEA).</li>
  <li>Escala de Rastreio de Atenção e Impulsividade (SNAP-IV).</li>
  <li>Triagem de Processamento Auditivo e Consciência Fonológica.</li>
</ul>

<h3>3. INDICADORES ENCONTRADOS E RISCO DETECTADO</h3>
<p>A pontuação total obtida posicionou o(a) paciente acima da linha de corte de alerta na subescala de atenção sustentada e linguagem pragmática, sugerindo a recomendação de aprofundamento investigativo por meio de avaliação neuropsicopedagógica completa e avaliação médica neurológica.</p>`
  },
  {
    id: 'a5',
    name: 'Parecer de Evolução e Sessão Clínica',
    description: 'Registro analítico de engajamento, aquisição de metas e conduta de sessão terapêutica',
    category: 'Avaliação',
    content: `<h2>PARECER DE EVOLUÇÃO CLÍNICA</h2>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Data da Sessão:</strong> {data_atual}</p>
<p><strong>Objetivo Trabalhado:</strong> Estimulação da memória operacional verbal e segmentação silábica.</p>
<p><strong>Conduta e Resultados Observados:</strong> O paciente demonstrou excelente disposição inicial, interagindo com o material lúdico proposto e atingindo índice de acerto de 85% nos exercícios com mediação moderada. Estabelecidos combinados para generalização das metas no contexto familiar.</p>`
  },
  {
    id: 'a6',
    name: 'Relatório de Funções Executivas e Autorregulação',
    description: 'Mapeamento específico de memória de trabalho, controle inibitório e flexibilidade mental',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO DAS FUNÇÕES EXECUTIVAS</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Data da Análise:</strong> {data_atual}</p>

<h3>2. PILARES NEUROEXECUTIVOS AVALIADOS</h3>
<ul>
  <li><strong>Controle Inibitório:</strong> Dificuldade em frear respostas automáticas, necessitando de tempo de espera orientado.</li>
  <li><strong>Memória de Trabalho (Operacional):</strong> Capacidade de reter até 3 instruções sequenciais antes de dispersar.</li>
  <li><strong>Flexibilidade Cognitiva:</strong> Boa adaptação frente a mudanças lúdicas de regras com suporte de dicas visuais.</li>
  <li><strong>Planejamento e Organização:</strong> Beneficia-se de checklists ilustrados para execução de tarefas divididas em etapas.</li>
</ul>`
  },

  // ==========================================
  // INTERVENÇÃO (6)
  // ==========================================
  {
    id: 'i1',
    name: 'Plano Educacional Individualizado (PEI)',
    description: 'PEI estruturado alinhado à LBI com metas trimestrais, adaptações pedagógicas e recursos de acessibilidade',
    category: 'Intervenção',
    content: `<h2>PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)</h2>
<h3>1. DADOS DO(A) ESTUDANTE</h3>
<p><strong>Nome Completo:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição Escolar:</strong> {escola} — Ano/Série: {serie}</p>
<p><strong>Professor(a) Regente / Mediador(a):</strong> ____________________________________</p>
<p><strong>Vigência do Plano:</strong> Semestre Letivo — {data_atual}</p>

<h3>2. HABILIDADES ATUAIS CONSOLIDADAS (LINHA DE BASE)</h3>
<ul>
  <li>Reconhece o próprio nome e palavras familiares de uso diário.</li>
  <li>Compreende narrativas lidas pelo professor e responde a perguntas factuais diretas.</li>
  <li>Demonstra criatividade em produções artísticas e ótimo relacionamento afetuoso com os colegas.</li>
</ul>

<h3>3. METAS DE DESENVOLVIMENTO (CURTO, MÉDIO E LONGO PRAZO)</h3>
<ul>
  <li><strong>Meta 1 (Linguagem e Alfabetização — 3 meses):</strong> Consolidar a correspondência grafema-fonema nas consoantes de apoio e ler palavras dissílabas simples.</li>
  <li><strong>Meta 2 (Raciocínio Matemático — 6 meses):</strong> Compreender o conceito de soma e subtração com auxílio de material dourado ou tampinhas.</li>
  <li><strong>Meta 3 (Autorregulação e Convivência — 6 meses):</strong> Permanecer engajado em atividades da carteira por períodos contínuos de 20 minutos com pausas planejadas.</li>
</ul>

<h3>4. ADAPTAÇÕES METODOLÓGICAS E DE AVALIAÇÃO (LBI Nº 13.146/15)</h3>
<ol>
  <li>Disponibilizar enunciados com vocabulário direto e ilustrações de suporte.</li>
  <li>Fracionar as avaliações em duas partes aplicadas em momentos distintos do dia.</li>
  <li>Priorizar avaliações orais ou respostas por múltipla escolha com no máximo 3 opções.</li>
  <li>Manter quadro de rotina visual com os horários e matérias do dia afixado na carteira.</li>
</ol>`
  },
  {
    id: 'i2',
    name: 'Plano de Intervenção Terapêutica (PIT)',
    description: 'Planejamento terapêutico clínico com objetivos, eixos de estimulação, frequência e critérios de alta',
    category: 'Intervenção',
    content: `<h2>PLANO DE INTERVENÇÃO TERAPÊUTICA (PIT)</h2>
<h3>1. IDENTIFICAÇÃO DO PACIENTE</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Frequência Recomendada:</strong> 1 sessão semanal de 50 minutos</p>
<p><strong>Período do Ciclo:</strong> 12 sessões com reavaliação continuada</p>

<h3>2. EIXOS PRIORITÁRIOS DE ATUAÇÃO</h3>
<ul>
  <li><strong>Eixo 1 (Neuroaprendizagem):</strong> Estimulação sistemática da consciência fonológica e automatização do princípio alfabético.</li>
  <li><strong>Eixo 2 (Funções Executivas):</strong> Jogos cognitivos para ampliação da memória operacional e controle inibitório.</li>
  <li><strong>Eixo 3 (Socioemocional):</strong> Fortalecimento do autoconceito acadêmico, tolerância a frustrações e redução do medo de errar.</li>
</ul>

<h3>3. CRITÉRIOS DE SUCESSO E TRANSIÇÃO</h3>
<p>Considera-se meta atingida quando o paciente demonstrar autonomia na decodificação de textos curtos, uso espontâneo de estratégias de conferência do trabalho e redução dos episódios de recusa de tarefas.</p>`
  },
  {
    id: 'i3',
    name: 'Plano Individual de Sessão Clínica (5 Fases)',
    description: 'Estrutura técnica para condução de atendimento psicopedagógico individual de 50 minutos',
    category: 'Intervenção',
    content: `<h2>PLANEJAMENTO INDIVIDUAL DE SESSÃO CLÍNICA</h2>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Data da Sessão:</strong> {data_atual}</p>
<p><strong>Meta da Sessão:</strong> Estimulação da memória de trabalho visual e fixação do fonema /s/.</p>

<ol>
  <li><strong>Fase 1: Acolhimento & Rapport (5 min):</strong> Recepção afetuosa, conversa livre e escolha conjunta da ordem das atividades do dia.</li>
  <li><strong>Fase 2: Aquecimento Cognitivo (10 min):</strong> Jogo de cartas ou memória para ativação do foco atencional.</li>
  <li><strong>Fase 3: Intervenção Focada (20 min):</strong> Atividade de alfabetização multissensorial com letras móveis e pistas visuais.</li>
  <li><strong>Fase 4: Generalização & Aplicação Lúdica (10 min):</strong> Jogo de tabuleiro aplicando o conceito consolidado.</li>
  <li><strong>Fase 5: Síntese e Despedida (5 min):</strong> Autoavaliação do paciente ("como me senti hoje") e registro no diário de bordo.</li>
</ol>`
  },
  {
    id: 'i4',
    name: 'Plano de Estimulação Precoce e Neuroaprendizagem',
    description: 'Roteiro de intervenções lúdicas e sensório-motoras para crianças pequenas na primeira infância',
    category: 'Intervenção',
    content: `<h2>PLANO DE ESTIMULAÇÃO PRECOCE</h2>
<p><strong>Criança:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Objetivos Centrais:</strong> Desenvolvimento da coordenação viso-motora, fortalecimento de tônus postural, incentivo ao balbucio comunicativo e introdução de rotinas lúdicas com brinquedos de causa e efeito.</p>`
  },
  {
    id: 'i5',
    name: 'Roteiro de Atividades e Treino Metacognitivo',
    description: 'Guia de passos para autorregulação e resolução autônoma de problemas escolares',
    category: 'Intervenção',
    content: `<h2>ROTEIRO DE TREINO METACOGNITIVO (APRENDER A APRENDER)</h2>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p>Protocolo de 4 passos ensinado e praticado em sessão:</p>
<ol>
  <li><strong>1. PARAR:</strong> Respirar fundo antes de pegar o lápis e olhar para toda a folha.</li>
  <li><strong>2. PENSAR:</strong> Explicar em voz alta: "O que o exercício está me pedindo para fazer?".</li>
  <li><strong>3. EXECUTAR COM CALMA:</strong> Realizar uma etapa por vez, riscando o que já foi concluído.</li>
  <li><strong>4. CONFERIR:</strong> Rever se todas as perguntas foram respondidas antes de entregar.</li>
</ol>`
  },
  {
    id: 'i6',
    name: 'Protocolo de Suporte em Desregulação Emocional',
    description: 'Diretrizes de acolhimento e manejo em momentos de sobrecarga sensorial ou crises de frustração',
    category: 'Intervenção',
    content: `<h2>PROTOCOLO DE MANEJO EM DESREGULAÇÃO EMOCIONAL</h2>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<ul>
  <li><strong>O que fazer:</strong> Reduzir o volume de voz, diminuir a iluminação do ambiente, retirar materiais de sobrecarga da mesa e oferecer o espaço de descompressão (almofadas ou itens com peso).</li>
  <li><strong>O que evitar:</strong> Não discutir verbalmente durante o pico da crise, evitar insistir em comandos pedagógicos e não reprimir o choro ou a necessidade de autorregulação física.</li>
</ul>`
  },

  // ==========================================
  // ESCOLAR (5)
  // ==========================================
  {
    id: 'e1',
    name: 'Relatório Devolutivo para a Escola',
    description: 'Comunicação oficial e acolhedora com orientações práticas para professores e coordenação pedagógica',
    category: 'Escolar',
    content: `<h2>RELATÓRIO DE ORIENTAÇÃO PEDAGÓGICA ESCOLAR</h2>
<h3>À Coordenação Pedagógica e Corpo Docente do(a): {escola}</h3>
<p><strong>Assunto:</strong> Acompanhamento psicopedagógico do(a) estudante {nome_paciente}</p>
<p><strong>Série/Ano:</strong> {serie} | <strong>Data:</strong> {data_atual}</p>

<h3>1. APRESENTAÇÃO</h3>
<p>Vimos por meio deste documento formalizar as observações clínicas e compartilhar orientações técnico-pedagógicas com a finalidade de apoiar o processo de inclusão, aprendizagem e bem-estar do(a) aluno(a) {nome_paciente} no ambiente escolar.</p>

<h3>2. PERFIL DE APRENDIZAGEM OBSERVADO</h3>
<p>O(A) estudante apresenta excelente engajamento em atividades com mediação afetuosa e suporte visual. Suas maiores demandas concentram-se na sustentação atencional durante explicações orais coletivas e na organização da produção textual.</p>

<h3>3. SUGESTÕES PRÁTICAS PARA SALA DE AULA</h3>
<ul>
  <li><strong>Posicionamento Espacial:</strong> Manter o aluno sentado próximo à mesa do professor, reduzindo estímulos visuais e auditivos distratores.</li>
  <li><strong>Comandos Curtos:</strong> Fracionar comandos em uma etapa por vez, certificando-se de que a instrução foi compreendida antes do início da tarefa.</li>
  <li><strong>Validação Positiva:</strong> Elogiar o esforço intermediário para fortalecer a autoestima e o vínculo escolar.</li>
  <li><strong>Pausas Regulatórias:</strong> Permitir pausas ativas rápidas (levar um bilhete à secretaria, beber água) entre blocos longos de aula.</li>
</ul>
<p>Permanecemos à inteira disposição para reuniões de alinhamento com os educadores.</p>`
  },
  {
    id: 'e2',
    name: 'Parecer Pedagógico de Acomodação Curricular e Provas',
    description: 'Diretrizes técnicas fundamentadas na Lei de Inclusão para adaptação de exames e notas',
    category: 'Escolar',
    content: `<h2>PARECER TÉCNICO DE ACOMODAÇÃO CURRICULAR E AVALIATIVA</h2>
<h3>Identificação do Estudante</h3>
<p><strong>Aluno(a):</strong> {nome_paciente} | <strong>Escola:</strong> {escola} — {serie}</p>
<p><strong>Data:</strong> {data_atual}</p>

<h3>Fundamentação Legal e Diretrizes</h3>
<p>Com amparo na <strong>Lei Brasileira de Inclusão (Lei nº 13.146/2015)</strong> e na <strong>Lei nº 14.254/2021</strong>, recomenda-se a adoção imediata das seguintes adaptações nos instrumentos avaliativos:</p>
<ol>
  <li><strong>Tempo Adicional:</strong> Concessão de tempo estendido em todas as avaliações escritas e simulados.</li>
  <li><strong>Leitor de Apoio:</strong> Disponibilização de profissional para leitura dos enunciados das questões quando solicitado.</li>
  <li><strong>Critério de Correção Flexível:</strong> Valorização prioritária do conteúdo e raciocínio conceitual com atenuação de descontos em erros de grafia.</li>
  <li><strong>Enunciados Descomplicados:</strong> Diagramação limpa com espaçamento entrelinhas 1.5 e eliminação de duplas negativas nas questões.</li>
</ol>`
  },
  {
    id: 'e3',
    name: 'Encaminhamento Interdisciplinar para Especialistas Médicos',
    description: 'Encaminhamento formal com queixa técnica para Neuropediatra, Psiquiatra, Fono ou T.O.',
    category: 'Escolar',
    content: `<h2>ENCAMINHAMENTO CLÍNICO INTERDISCIPLINAR</h2>
<p><strong>Ao(À) Ilustríssimo(a) Colega Médico(a) / Terapeuta Especialista:</strong></p>
<br>
<p><strong>Paciente:</strong> {nome_paciente} (Nascimento: {data_nascimento} — Idade: {idade})</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data do Encaminhamento:</strong> {data_atual}</p>

<h3>MOTIVO DO ENCAMINHAMENTO E QUADRO OBSERVADO</h3>
<p>Encaminhamos o(a) paciente acima qualificado(a) para vossa criteriosa avaliação especializada, tendo em vista achados clínicos colhidos durante a avaliação psicopedagógica que sugerem a necessidade de investigação aprofundada nas seguintes áreas:</p>
<ul>
  <li>Sinais de oscilação atencional persistente com prejuízo funcional acadêmico.</li>
  <li>Alterações no processamento sensorial e hiper-reatividade a estímulos sonoros.</li>
  <li>Demanda de investigação neurobiológica complementar para definição diagnóstica conjunta.</li>
</ul>
<p>Colocamo-nos à inteira disposição para compartilhamento de relatórios e discussão do caso visando ao melhor benefício terapêutico do paciente.</p>`
  },
  {
    id: 'e4',
    name: 'Relatório de Observação no Contexto Escolar',
    description: 'Registro de visita técnica in loco e observação de dinâmicas em sala de aula e recreio',
    category: 'Escolar',
    content: `<h2>RELATÓRIO DE VISITA E OBSERVAÇÃO TÉCNICA ESCOLAR</h2>
<p><strong>Estudante:</strong> {nome_paciente} | <strong>Escola:</strong> {escola}</p>
<p><strong>Data da Visita:</strong> {data_atual} | <strong>Profissional:</strong> {profissional_nome}</p>
<h3>1. OBSERVAÇÃO EM SALA DE AULA</h3>
<p>Durante as atividades acadêmicas, o aluno manteve o olhar direcionado ao professor por cerca de 10 minutos, iniciando em seguida movimentação de materiais na carteira. Respondeu prontamente quando chamado pelo nome de forma individual.</p>
<h3>2. OBSERVAÇÃO NO RECREIO E ESPAÇOS COLETIVOS</h3>
<p>Participou de brincadeiras em pequenos grupos, demonstrando preferência por jogos com regras bem estabelecidas.</p>`
  },
  {
    id: 'e5',
    name: 'Parecer Técnico de Justificativa para Mediação Escolar',
    description: 'Documento técnico com fundamentação jurídica e pedagógica para concessão de mediador escolar',
    category: 'Escolar',
    content: `<h2>PARECER TÉCNICO - JUSTIFICATIVA DE MEDIAÇÃO ESCOLAR</h2>
<p><strong>Estudante:</strong> {nome_paciente} | <strong>Ano Escolar:</strong> {serie}</p>
<p>Com fundamento no art. 3º, parágrafo único, da Lei nº 12.764/2012 e art. 28 da Lei nº 13.146/2015, atesto que o estudante necessita de profissional de apoio escolar (mediador/estagiário de inclusão) com atribuição de auxiliar na comunicação interpessoal, mediação de conflitos e suporte na organização das atividades acadêmicas.</p>`
  },

  // ==========================================
  // JURÍDICO (5)
  // ==========================================
  {
    id: 'j1',
    name: 'Declaração de Comparecimento e Consulta',
    description: 'Comprovante com timbre, horário e finalidade legal de justificativa para escola ou trabalho',
    category: 'Jurídico',
    content: `<h2>DECLARAÇÃO DE COMPARECIMENTO A ATENDIMENTO CLÍNICO</h2>
<br>
<p>Declaro, para os devidos fins de comprovação e justificativa legal, que o(a) paciente <strong>{nome_paciente}</strong>, acompanhado(a) por seu(sua) responsável legal <strong>{nome_responsavel}</strong>, compareceu a este consultório psicopedagógico na data de <strong>{data_atual}</strong>, permanecendo em atendimento no período das _____h_____ às _____h_____.</p>
<br>
<p>Por ser a expressão fiel da verdade com fé de ofício profissional, firmo o presente documento.</p>
<br><br>
<p style="text-align: center;">____________________________________________________<br>
<strong>{profissional_nome}</strong><br>
Psicopedagoga Clínica • Registro ABPp: {registro_profissional}</p>`
  },
  {
    id: 'j2',
    name: 'Atestado de Atendimento e Acompanhamento Clínico',
    description: 'Atestado formal de frequência e horários para abono escolar ou comprovação em perícias',
    category: 'Jurídico',
    content: `<h2>ATESTADO DE ATENDIMENTO PSICOPEDAGÓGICO</h2>
<br>
<p>Atesto, sob minha responsabilidade profissional e ética, que <strong>{nome_paciente}</strong> encontra-se sob meus cuidados profissionais em acompanhamento psicopedagógico especializado, tendo comparecido à sessão clínica agendada no dia <strong>{data_atual}</strong>.</p>
<p>Recomenda-se a dispensa de atividades acadêmicas regulares no período compreendido entre _____h_____ e _____h_____ para cumprimento do cronograma terapêutico.</p>
<br><br>
<p style="text-align: center;">____________________________________________________<br>
<strong>{profissional_nome}</strong><br>
Registro Profissional: {registro_profissional}</p>`
  },
  {
    id: 'j3',
    name: 'Termo de Sigilo, Privacidade e Conduta Ética',
    description: 'Compromisso ético formal de guarda segura de dados e sigilo profissional conforme LGPD',
    category: 'Jurídico',
    content: `<h2>TERMO DE COMPROMISSO ÉTICO E SIGILO PROFISSIONAL</h2>
<p>Pelo presente termo, a profissional <strong>{profissional_nome}</strong> firma compromisso solene de sigilo, confidencialidade e guarda inviolável de todos os registros clínicos, avaliações, testes e prontuários pertinentes ao paciente <strong>{nome_paciente}</strong>, em estrita obediência ao Código de Ética Profissional e à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>`
  },
  {
    id: 'j4',
    name: 'Declaração de Vínculo Terapêutico Contínuo',
    description: 'Comprovante para planos de saúde, órgãos públicos e judiciais de acompanhamento regular',
    category: 'Jurídico',
    content: `<h2>DECLARAÇÃO DE TRATAMENTO PSICOPEDAGÓGICO CONTÍNUO</h2>
<p>Declaro para os devidos fins de direito que <strong>{nome_paciente}</strong> é atendido(a) com regularidade semanal neste consultório psicopedagógico desde _____/_____/_________ sob supervisão contínua da equipe clínica, cumprindo assiduamente o plano terapêutico prescrito.</p>`
  },
  {
    id: 'j5',
    name: 'Parecer Técnico Circunstanciado para Demanda Judicial',
    description: 'Parecer pericial estruturado para subsidiar ações judiciais, pensão, defensoria ou Ministério Público',
    category: 'Jurídico',
    content: `<h2>PARECER TÉCNICO CIRCUNSTANCIADO PARA FINS JUDICIAIS</h2>
<h3>À Autoridade Judiciária / Ministério Público / Defensoria Pública</h3>
<p><strong>Paciente / Menor:</strong> {nome_paciente}</p>
<p><strong>Responsável Legal:</strong> {nome_responsavel}</p>
<p><strong>Data:</strong> {data_atual}</p>
<h3>RELATÓRIO HISTÓRICO DAS INTERVENÇÕES</h3>
<p>Em atendimento ao ofício expedido, informamos que o(a) menor recebe atendimento psicopedagógico regular com foco em neurodesenvolvimento. A interrupção ou descontinuidade dos atendimentos acarreta prejuízos diretos na estabilidade cognitiva e social da criança.</p>`
  },

  // ==========================================
  // FAMÍLIA (4)
  // ==========================================
  {
    id: 'f1',
    name: 'Guia de Apoio e Orientações para a Família',
    description: 'Carta afetuosa com orientações para rotina de lição de casa, limites e apoio socioemocional',
    category: 'Família',
    content: `<h2>GUIA DE APOIO E ORIENTAÇÃO FAMILIAR</h2>
<p><strong>Querida família de {nome_paciente},</strong></p>
<p>O desenvolvimento da criança acontece de forma potente quando clínica, escola e família caminham juntas. Preparamos com muito carinho orientações práticas para a rotina diária em casa:</p>

<ol>
  <li><strong>Cantinho dos Estudos Estruturado:</strong> Escolha um local bem iluminado, silencioso e livre de telas ou aparelhos eletrônicos durante a lição de casa.</li>
  <li><strong>Valorize o Esforço e Não Apenas o Resultado:</strong> Elogie a persistência diante de desafios difíceis, demonstrando que o erro faz parte natural do aprender.</li>
  <li><strong>Leitura Compartilhada (15 minutos ao dia):</strong> A leitura afetiva antes de dormir estimula o vocabulário, a imaginação e fortalece o vínculo familiar.</li>
  <li><strong>Previsibilidade na Rotina:</strong> Manter horários consistentes de sono e alimentação reduz expressivamente a ansiedade infantil.</li>
</ol>
<p>Estamos juntos nessa linda caminhada de desenvolvimento!</p>`
  },
  {
    id: 'f2',
    name: 'Orientações Práticas para Manejo de Rotina e Telas',
    description: 'Orientações técnicas para uso saudável de tecnologia, celulares, videogames e rotina do sono',
    category: 'Família',
    content: `<h2>ORIENTAÇÕES SOBRE ROTINA E TEMPO DE TELAS</h2>
<p><strong>Orientações para os pais de {nome_paciente}:</strong></p>
<ul>
  <li><strong>Regra do Desligamento Noturno:</strong> Encerrar o uso de telas (celular, tablet e TV) pelo menos 60 minutos antes do horário de dormir para preservação da melatonina e qualidade do sono.</li>
  <li><strong>Tempo Máximo Recomendado:</strong> Limite diário de até 1 hora de telas para conteúdo recreativo em dias de semana.</li>
  <li><strong>Substituições Positivas:</strong> Oferecer jogos de tabuleiro em família, passeios ao ar livre e atividades de pintura/desenho como alternativas divertidas.</li>
</ul>`
  },
  {
    id: 'f3',
    name: 'Roteiro e Ata para Sessão de Devolutiva com Pais',
    description: 'Roteiro estruturado para reunião devolutiva dos resultados diagnósticos aos responsáveis',
    category: 'Família',
    content: `<h2>ROTEIRO DE SESSÃO DE DEVOLUTIVA COM OS PAIS</h2>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Responsáveis Presentes:</strong> {nome_responsavel}</p>
<p><strong>Data da Devolutiva:</strong> {data_atual}</p>
<h3>PAUTAS APRESENTADAS:</h3>
<ol>
  <li>Apresentação dos pontos fortes e potências cognitivas do paciente.</li>
  <li>Exposição clara e acessível das hipóteses diagnósticas sem jargões médicos.</li>
  <li>Apresentação das sugestões de encaminhamento e metas para os próximos meses.</li>
  <li>Espaço acolhedor para escuta de dúvidas, angústias e sentimentos dos pais.</li>
</ol>`
  },
  {
    id: 'f4',
    name: 'Termo de Consentimento Livre e Esclarecido (LGPD)',
    description: 'Autorização expressa dos responsáveis para avaliação, trocas escolares e prontuário digital',
    category: 'Família',
    content: `<h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE - LGPD)</h2>
<p>Eu, <strong>{nome_responsavel}</strong>, portador(a) do documento de identificação registrado, na qualidade de responsável legal pelo(a) menor <strong>{nome_paciente}</strong>, declaro que fui plenamente informado(a) sobre a natureza, objetivos e metodologia do acompanhamento psicopedagógico clínico conduzido pela profissional <strong>{profissional_nome}</strong>.</p>
<p>Autorizo expressamente a realização dos atendimentos, a troca de informações estritamente pedagógicas com a instituição escolar <strong>{escola}</strong> e a guarda segura de prontuário eletrônico em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
<br>
<p style="text-align: center;">Assinatura do(a) Responsável: ____________________________________________________</p>`
  },

  // ==========================================
  // FINANCEIRO (4)
  // ==========================================
  {
    id: 'fn1',
    name: 'Proposta Formal de Prestação de Serviços Clínicos',
    description: 'Proposta comercial com cronograma, metodologia, investimentos e plano terapêutico',
    category: 'Financeiro',
    content: `<h2>PROPOSTA DE PRESTAÇÃO DE SERVIÇOS PSICOPEDAGÓGICOS</h2>
<p><strong>Contratante:</strong> {nome_responsavel}</p>
<p><strong>Beneficiário(a) do Atendimento:</strong> {nome_paciente}</p>
<p><strong>Data:</strong> {data_atual}</p>

<h3>1. ESCOPO DOS SERVIÇOS</h3>
<p>A presente proposta contempla ciclo de atendimentos psicopedagógicos com periodicidade de 1 (uma) sessão semanal com duração de 50 (cinquenta) minutos, incluindo acompanhamento das metas e contato periódico com a coordenação escolar.</p>

<h3>2. INVESTIMENTO E CONDIÇÕES</h3>
<ul>
  <li><strong>Valor por Sessão / Mensalidade:</strong> R$ ______________ (___________________________________).</li>
  <li><strong>Data de Vencimento:</strong> Todo dia _____ de cada mês.</li>
  <li><strong>Forma de Pagamento:</strong> Transferência bancária, PIX ou boleto bancário.</li>
</ul>`
  },
  {
    id: 'fn2',
    name: 'Contrato Completo de Prestação de Serviços Psicopedagógicos',
    description: 'Contrato jurídico completo com cláusulas de faltas, reposições, rescisão e LGPD',
    category: 'Financeiro',
    content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOPEDAGÓGICOS</h2>
<p>Pelo presente instrumento particular de contrato, de um lado <strong>{profissional_nome}</strong>, inscrita no CNPJ/CPF sob nº ___________________, e de outro lado <strong>{nome_responsavel}</strong>, responsável legal por <strong>{nome_paciente}</strong>, têm entre si justo e acordado o seguinte:</p>

<h3>CLÁUSULA 1ª — DO OBJETO</h3>
<p>O presente contrato tem por objeto a prestação de serviços de avaliação e intervenção psicopedagógica especializada ao(à) paciente acima identificado(a).</p>

<h3>CLÁUSULA 2ª — DO LOCAL E HORÁRIO</h3>
<p>As sessões ocorrerão semanalmente com duração de 50 minutos por atendimento, no endereço do consultório, em dia e horário previamente pactuados.</p>

<h3>CLÁUSULA 3ª — DAS FALTAS E REPOSIÇÕES</h3>
<p>As faltas deverão ser comunicadas com antecedência mínima de 24 (vinte e quatro) horas para possibilitar o reagendamento de reposição, respeitada a disponibilidade de agenda do consultório. Faltas não justificadas com a antecedência devida serão cobradas normalmente.</p>

<h3>CLÁUSULA 4ª — DOS HONORÁRIOS</h3>
<p>Pelos serviços contratados, o(a) CONTRATANTE pagará à CONTRATADA o valor mensal acordado, vencendo-se todo dia 10 de cada mês.</p>

<h3>CLÁUSULA 5ª — DA RESCISÃO</h3>
<p>O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio por escrito de 30 (trinta) dias, garantindo-se o fechamento adequado do processo terapêutico com o paciente.</p>
<br>
<p style="text-align: center;">Local e Data: ________________________, {data_atual}</p>
<br>
<p style="text-align: center;">______________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ______________________________________<br>
Contratante: {nome_responsavel} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Contratada: {profissional_nome}</p>`
  },
  {
    id: 'fn3',
    name: 'Recibo de Pagamento de Honorários Clínicos',
    description: 'Recibo oficial detalhado com dados fiscais para comprovação e dedução de Imposto de Renda',
    category: 'Financeiro',
    content: `<h2>RECIBO DE PAGAMENTO DE HONORÁRIOS PROFISSIONAIS</h2>
<br>
<p>Recebi de <strong>{nome_responsavel}</strong>, inscrito(a) no CPF nº _____________________, a quantia de <strong>R$ ____________ (________________________________________________)</strong> referente aos atendimentos psicopedagógicos prestados ao(à) seu(sua) dependente <strong>{nome_paciente}</strong> no mês de referência.</p>
<br>
<p>Por ser verdade e para os devidos fins de comprovação e declaração de Imposto de Renda, firmo o presente recibo.</p>
<br><br>
<p style="text-align: center;">Emitido em: {data_atual}</p>
<p style="text-align: center;">____________________________________________________<br>
<strong>{profissional_nome}</strong><br>
Psicopedagoga Clínica • Registro ABPp: {registro_profissional}</p>`
  },
  {
    id: 'fn4',
    name: 'Declaração de Quitação Anual de Mensalidades',
    description: 'Declaração anual consolidada de quitação de débitos clínicos nos termos da Lei 12.007/09',
    category: 'Financeiro',
    content: `<h2>DECLARAÇÃO DE QUITAÇÃO ANUAL DE DÉBITOS (LEI Nº 12.007/2009)</h2>
<br>
<p>Declaramos, para os devidos fins e em cumprimento às disposições da Lei Federal nº 12.007/2009, que o(a) responsável financeiro(a) <strong>{nome_responsavel}</strong> encontra-se em dia com todas as obrigações financeiras relativas aos serviços psicopedagógicos prestados ao(à) paciente <strong>{nome_paciente}</strong> durante o respectivo ano de exercício.</p>
<br>
<p>Por ser expressão da verdade, firmo a presente quitação.</p>
<br><br>
<p style="text-align: center;">{data_atual}</p>
<p style="text-align: center;">____________________________________________________<br>
<strong>{profissional_nome}</strong></p>`
  }
];

export function replaceDocPlaceholders(
  content: string,
  paciente?: any,
  profissional?: { name?: string; councilNumber?: string; registry?: string },
  clinica?: { name?: string }
): string {
  if (!content) return '';
  let res = content;

  const dataAtual = new Date().toLocaleDateString('pt-BR');

  // Paciente
  const nomePaciente = paciente?.name || paciente?.nome || '{nome_paciente}';
  let dataNascimento = '{data_nascimento}';
  if (paciente?.birthDate || paciente?.dataNascimento) {
    const rawDate = paciente.birthDate || paciente.dataNascimento;
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dataNascimento = d.toLocaleDateString('pt-BR');
      } else {
        dataNascimento = String(rawDate);
      }
    } catch {
      dataNascimento = String(rawDate);
    }
  }

  let idade = '{idade}';
  if (paciente?.birthDate || paciente?.dataNascimento) {
    const bDate = new Date(paciente.birthDate || paciente.dataNascimento);
    if (!isNaN(bDate.getTime())) {
      const diff = Date.now() - bDate.getTime();
      const ageDate = new Date(diff);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      idade = `${years} anos`;
    }
  } else if (paciente?.idade || paciente?.age) {
    idade = `${paciente.idade || paciente.age} anos`;
  }

  const escola = paciente?.school || paciente?.escola || '{escola}';
  const serie = paciente?.grade || paciente?.serie || '{serie}';
  const responsavel = paciente?.responsibleName || paciente?.responsavel || paciente?.responsavelNome || '{nome_responsavel}';

  // Profissional
  const profNome = profissional?.name || 'Dra. Vilma Rossi';
  const profRegistro = profissional?.councilNumber || profissional?.registry || 'ABPp 1234/SP';
  const clinicNome = clinica?.name || 'Clínica de Psicopedagogia & Neuroeducação';

  res = res.replace(/\{nome_paciente\}/g, nomePaciente);
  res = res.replace(/\{data_nascimento\}/g, dataNascimento);
  res = res.replace(/\{idade\}/g, idade);
  res = res.replace(/\{escola\}/g, escola);
  res = res.replace(/\{serie\}/g, serie);
  res = res.replace(/\{nome_responsavel\}/g, responsavel);
  res = res.replace(/\{data_atual\}/g, dataAtual);
  res = res.replace(/\{profissional_nome\}/g, profNome);
  res = res.replace(/\{registro_profissional\}/g, profRegistro);
  res = res.replace(/\{clinica_nome\}/g, clinicNome);

  return res;
}

export function formatDocBlankPlaceholders(
  content: string,
  profissional?: { name?: string; councilNumber?: string; registry?: string }
): string {
  if (!content) return '';
  let res = content;
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const profNome = profissional?.name || 'Dra. Vilma Rossi';
  const profRegistro = profissional?.councilNumber || profissional?.registry || 'ABPp 1234/SP';

  res = res.replace(/\{nome_paciente\}/g, '________________________________________________');
  res = res.replace(/\{data_nascimento\}/g, '___/___/______');
  res = res.replace(/\{idade\}/g, '____ anos');
  res = res.replace(/\{escola\}/g, '________________________________________________');
  res = res.replace(/\{serie\}/g, '________________');
  res = res.replace(/\{nome_responsavel\}/g, '________________________________________________');
  res = res.replace(/\{data_atual\}/g, dataAtual);
  res = res.replace(/\{profissional_nome\}/g, profNome);
  res = res.replace(/\{registro_profissional\}/g, profRegistro);
  res = res.replace(/\{clinica_nome\}/g, 'Clínica de Psicopedagogia & Neuroeducação');

  return res;
}
