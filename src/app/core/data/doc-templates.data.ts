export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Diagnóstico' | 'Avaliação' | 'Intervenção' | 'Escolar' | 'Jurídico' | 'Família' | 'Financeiro';
  favorite?: boolean;
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
  // DIAGNÓSTICO (7)
  {
    id: 'd1',
    name: 'Laudo TEA (Autismo)',
    description: 'Laudo diagnóstico para Transtorno do Espectro Autista conforme DSM-5',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - TRANSTORNO DO ESPECTRO AUTISTA</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição de Ensino:</strong> {escola} - Série/Ano: {serie}</p>
<p><strong>Responsável(is):</strong> {nome_responsavel}</p>
<p><strong>Data da Avaliação:</strong> {data_atual}</p>
<h3>2. MOTIVO DO ENCAMINHAMENTO E DA CONSULTA</h3>
<p>Avaliação das funções de comunicação, interação social, processamento sensorial e flexibilidade cognitiva frente às queixas de desatenção, estereotipias e dificuldades na aprendizagem escolar.</p>
<h3>3. HISTÓRICO E ANTECEDENTES RELEVANTES</h3>
<ul>
  <li><strong>Desenvolvimento neuropsicomotor:</strong> Marcos do desenvolvimento, aquisição da marcha e da linguagem.</li>
  <li><strong>Histórico familiar:</strong> Sem comorbidades psiquiátricas ou neurológicas conhecidas de primeiro grau.</li>
  <li><strong>Rotina e autonomia:</strong> Sono regularizado, seletividade alimentar leve e dependência parcial em atividades da vida diária (AVDs).</li>
</ul>
<h3>4. OBSERVAÇÕES CLÍNICAS E COMPORTAMENTAIS</h3>
<ul>
  <li><strong>Interação Social Recíproca:</strong> Contato visual oscilante, dificuldade na manutenção do diálogo contínuo e atenção compartilhada reduzida.</li>
  <li><strong>Comunicação Verbal e Não-Verbal:</strong> Vocabulário formal preservado, alterações pragmáticas na fala e compreensão predominantemente literal.</li>
  <li><strong>Padrões Restritos e Repetitivos:</strong> Movimentos pendulares nos momentos de ansiedade e hiperfoco em temas específicos.</li>
</ul>
<h3>5. INSTRUMENTOS E PROTOCOLOS UTILIZADOS</h3>
<ul>
  <li>Escala M-CHAT-R / Protocolos ABA e VB-MAPP.</li>
  <li>Entrevista clínica semiestruturada com a família (Anamnese).</li>
  <li>Avaliação psicopedagógica das funções executivas e neuroaprendizagem.</li>
  <li>Relatório pedagógico e devolutiva da equipe escolar.</li>
</ul>
<h3>6. RESULTADOS E SÍNTESE DA AVALIAÇÃO</h3>
<p>Observou-se discrepância qualitativa entre o raciocínio não-verbal e a flexibilidade socioemocional, indicando necessidade de suporte no ambiente acadêmico e relacional.</p>
<h3>7. CONCLUSÃO DIAGNÓSTICA</h3>
<p>O quadro clínico e comportamental é compatível com os critérios do DSM-5 e CID-11 para <strong>Transtorno do Espectro Autista (F84.0)</strong>, com <strong>Nível 1 de Suporte</strong> (suporte leve/moderado).</p>
<div class="page-break" contenteditable="false" style="page-break-before: always; break-before: always; border-top: 2px dashed #94a3b8; margin: 18px 0 12px 0; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold; user-select: none; padding: 4px 0;">✂ --- Início da Folha 2 (8. Plano de Intervenção e Assinaturas) ---</div>
<h3>8. PLANO DE INTERVENÇÃO E RECOMENDAÇÕES</h3>
<ol>
  <li>Intervenção Psicopedagógica e ABA com foco em flexibilidade cognitiva e autorregulação.</li>
  <li>Acompanhamento fonoaudiológico voltado para a pragmática da linguagem.</li>
  <li>Adaptações curriculares e mediação pedagógica escolar conforme Lei nº 12.764/12.</li>
  <li>Manutenção da rotina visual estruturada em casa e na escola.</li>
</ol>`
  },
  {
    id: 'd2',
    name: 'Laudo TDAH',
    description: 'Laudo diagnóstico para Transtorno do Déficit de Atenção e Hiperatividade',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - TDAH (DÉFICIT DE ATENÇÃO / HIPERATIVIDADE)</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Idade:</strong> {idade} | <strong>Escola:</strong> {escola}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data:</strong> {data_atual}</p>
<br>
<h3>2. MOTIVO DA AVALIAÇÃO</h3>
<p>Dificuldades acentuadas de sustentação atencional, desorganização no manejo de materiais, impulsividade e declínio no rendimento acadêmico.</p>
<br>
<h3>3. OBSERVAÇÃO CLÍNICA E SINTOMATOLOGIA</h3>
<ul>
  <li><strong>Desatenção:</strong> Perda frequente de foco em tarefas que exigem esforço mental prolongado e esquecimento frequente de instruções sequenciais.</li>
  <li><strong>Hiperatividade/Impulsividade:</strong> Inquietação motora e tendência a responder precocemente antes do término das perguntas.</li>
</ul>
<br>
<h3>4. INSTRUMENTOS E ESCALAS</h3>
<ul>
  <li>Escala SNAP-IV (preenchida por pais e professores).</li>
  <li>Bateria de Funções Executivas e Atenção Concentrada/Alternada.</li>
</ul>
<br>
<h3>5. CONCLUSÃO CLÍNICA</h3>
<p>Compatível com <strong>TDAH - Subtipo Combinado (Desatento e Hiperativo/Impulsivo)</strong>, com repercussão funcional moderada no contexto escolar.</p>
<br>
<h3>6. ENCAMINHAMENTOS E RECOMENDAÇÕES</h3>
<ol>
  <li>Acompanhamento psicopedagógico focado em estratégias metacognitivas e organização executiva.</li>
  <li>Avaliação com Neuropediatra para ponderação sobre conduta medicamentosa.</li>
  <li>Posicionamento preferencial na primeira fileira da sala de aula e tempo estendido para avaliações.</li>
</ol>`
  },
  {
    id: 'd3',
    name: 'Laudo Dislexia / Transtorno Específico da Aprendizagem',
    description: 'Laudo para Dislexia do Desenvolvimento e transtornos da leitura/escrita',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - DISLEXIA DO DESENVOLVIMENTO</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Escola:</strong> {escola} - {serie}</p>
<br>
<h3>2. QUEIXA PRINCIPAL</h3>
<p>Lentidão acentuada no processo de decodificação leitora, trocas fonológicas na escrita e estafa durante tarefas com sobrecarga textual.</p>
<br>
<h3>3. AVALIAÇÃO DAS HABILIDADES DE LEITURA E ESCRITA</h3>
<ul>
  <li><strong>Consciência Fonológica:</strong> Déficit no processamento fonológico, segmentação e manipulação de rimas/aliterações.</li>
  <li><strong>Velocidade e Acurácia Leitora:</strong> Nível de leitura significativamente abaixo do esperado para a idade cronológica e escolaridade.</li>
  <li><strong>Compreensão Textual:</strong> Preservada quando o texto é lido pelo terapeuta/leitor ou por síntese de voz.</li>
</ul>
<br>
<h3>4. CONCLUSÃO</h3>
<p>Quadro correspondente a <strong>Transtorno Específico da Aprendizagem com prejuízo na Leitura (Dislexia - CID-11 6A03)</strong>.</p>
<br>
<h3>5. MEDIDAS E ADAPTAÇÕES ESCOLARES (LEI 14.254/21)</h3>
<ul>
  <li>Acesso a leitor de apoio ou softwares de leitura de tela para provas.</li>
  <li>Priorização de avaliações orais e desconto atenuado para erros ortográficos.</li>
  <li>Intervenção fônica sistemática e treino de fluência leitora.</li>
</ul>`
  },
  {
    id: 'd4',
    name: 'Laudo de Deficiência Intelectual',
    description: 'Avaliação multidimensional de funcionamento intelectual e comportamento adaptativo',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - DEFICIÊNCIA INTELECTUAL</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Nascimento:</strong> {data_nascimento}</p>
<br>
<h3>2. AVALIAÇÃO COGNITIVA E ADAPTATIVA</h3>
<p>Avaliação compreensiva dos domínios conceitual, social e prático através de observação clínica, escalas de conduta adaptativa e inventários de desenvolvimento.</p>
<br>
<h3>3. DOMÍNIOS ANALISADOS</h3>
<ul>
  <li><strong>Domínio Conceitual:</strong> Necessidade de suporte continuado para raciocínio abstrato, leitura funcional e conceitos monetários.</li>
  <li><strong>Domínio Social:</strong> Capacidade de comunicação interpessoal presente, demandando mediação em situações de conflito ou julgamento social.</li>
  <li><strong>Domínio Prático:</strong> Bom desempenho em rotinas estabelecidas de autocuidado sob supervisão pontual.</li>
</ul>
<br>
<h3>4. CLASSIFICAÇÃO</h3>
<p>Quadro compatível com <strong>Deficiência Intelectual Leve (F70)</strong>, exigindo suporte intermitente no ambiente educacional e comunitário.</p>`
  },
  {
    id: 'd5',
    name: 'Laudo Atraso Global do Desenvolvimento (AGD)',
    description: 'Laudo para crianças em primeira infância com atrasos em múltiplos marcos',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - ATRASO GLOBAL DO DESENVOLVIMENTO</h2>
<br>
<h3>1. IDENTIFICAÇÃO DO PACIENTE</h3>
<p><strong>Criança:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<br>
<h3>2. MARCOS DE DESENVOLVIMENTO ANALISADOS</h3>
<p>Foram investigadas as áreas de motricidade ampla, motricidade fina, comunicação receptiva/expressiva, cognição precoce e autonomia social.</p>
<br>
<h3>3. CONDUTA TERAPÊUTICA</h3>
<p>Indicação imediata de Estimulação Precoce Multidisciplinar, com reavaliação periódica semestral para acompanhamento da curva neuroevolutiva.</p>`
  },
  {
    id: 'd6',
    name: 'Laudo Transtorno Opositor Desafiador (TOD)',
    description: 'Avaliação clínica para comportamentos opositivos e desregulação emocional',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO - COMPORTAMENTO E TRANSTORNO OPOSITOR</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Responsáveis:</strong> {nome_responsavel}</p>
<br>
<h3>2. DINÂMICA COMPORTAMENTAL OBSERVADA</h3>
<p>Padrão recorrente de humor irritável, desobediência a figuras de autoridade, baixa tolerância à frustração e atribuição externa de culpas.</p>
<br>
<h3>3. DIRETRIZES DE MANEJO</h3>
<p>Treinamento parental em manejo comportamental, estabelecimento de acordos prévios claros e intervenção psicopedagógica com reforçamento positivo.</p>`
  },
  {
    id: 'd7',
    name: 'Laudo de Hiperatividade e Impulsividade',
    description: 'Laudo com ênfase em inquietação motora e modulação inibitória',
    category: 'Diagnóstico',
    content: `<h2>LAUDO DE AVALIAÇÃO CLÍNICA - HIPERATIVIDADE E MODULAÇÃO INIBITÓRIA</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Data:</strong> {data_atual}</p>
<br>
<h3>2. DESCRIÇÃO DAS MANIFESTAÇÕES</h3>
<p>Inquietação psicomotora contínua, dificuldade em permanecer sentado durante atividades dirigidas e verbalizações excessivas.</p>`
  },

  // AVALIAÇÃO (6)
  {
    id: 'a1',
    name: 'Relatório de Avaliação Psicopedagógica Completo',
    description: 'Relatório estruturado com anamnese, síntese dos testes e conclusão escolar',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO PSICOPEDAGÓGICA</h2>
<br>
<h3>1. DADOS DE IDENTIFICAÇÃO</h3>
<p><strong>Nome:</strong> {nome_paciente}</p>
<p><strong>Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Escola:</strong> {escola} | <strong>Série:</strong> {serie}</p>
<p><strong>Responsável(is):</strong> {nome_responsavel}</p>
<p><strong>Terapeuta Responsável:</strong> {profissional_nome} ({registro_profissional})</p>
<br>
<h3>2. QUEIXA INICIAL E HISTÓRICO</h3>
<p>A família procurou auxílio psicopedagógico com o objetivo de investigar entraves na alfabetização, dispersão atencional e insegurança no aprendizado.</p>
<br>
<h3>3. PROCESSO AVALIATIVO (INSTRUMENTOS E TÉCNICAS)</h3>
<ul>
  <li>EOCA (Entrevista Operativa Centrada na Aprendizagem).</li>
  <li>Provas de Diagnóstico Operatório de Piaget.</li>
  <li>Testes de Memória Operacional e Atenção Visual.</li>
  <li>Avaliação do nível de escrita (Ferreiro e Teberosky).</li>
</ul>
<br>
<h3>4. ANÁLISE DOS RESULTADOS</h3>
<p>O paciente demonstrou excelente potencial criativo e raciocínio prático, necessitando de mediação estruturada para tarefas de planejamento e codificação fonêmica.</p>
<br>
<h3>5. RECOMENDAÇÕES PARA A ESCOLA E FAMÍLIA</h3>
<ul>
  <li>Fragmentar tarefas longas em etapas menores com validações intermediárias.</li>
  <li>Utilizar recursos multissensoriais e jogos de raciocínio.</li>
  <li>Garantir ambiente silencioso e livre de estímulos distratores para as tarefas de casa.</li>
</ul>`
  },
  {
    id: 'a2',
    name: 'Relatório de Avaliação Funcional ABA',
    description: 'Relatório de linha de base e mapeamento de repertório comportamental',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO FUNCIONAL ABA</h2>
<br>
<h3>1. IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Data da Coleta:</strong> {data_atual}</p>
<br>
<h3>2. ANÁLISE FUNCIONAL DE COMPORTAMENTOS (A-B-C)</h3>
<p>Mapeamento das contingências comportamentais: Antecedentes imediatos, Respostas observadas e Consequências mantenedoras de fuga/esquiva de demanda ou obtenção de atenção.</p>
<br>
<h3>3. COMPORTAMENTO VERBAL</h3>
<p>Avaliação das operantes verbais: Ecoico, Tato, Mando e Intraverbal segundo a metodologia Skinneriana.</p>`
  },
  {
    id: 'a3',
    name: 'Parecer Técnico Psicopedagógico',
    description: 'Parecer pontual para fins de perícia, convênio ou mediação escolar',
    category: 'Avaliação',
    content: `<h2>PARECER TÉCNICO PSICOPEDAGÓGICO</h2>
<br>
<p>Emitido em favor de <strong>{nome_paciente}</strong>, nascido em {data_nascimento}, matriculado no(a) {escola}.</p>
<br>
<p>Atesto que o referido paciente encontra-se em processo de intervenção terapêutica psicopedagógica, apresentando evolução satisfatória nos pilares de autorregulação e engajamento escolar.</p>`
  },
  {
    id: 'a4',
    name: 'Relatório de Screening e Rastreio',
    description: 'Síntese de instrumentos de triagem neurocognitiva e indicadores de risco',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE TRIAGEM E RASTREIO COGNITIVO</h2>
<br>
<h3>1. DADOS CADASTRAIS</h3>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<br>
<h3>2. PONTUAÇÃO DOS RASTREIOS APLICADOS</h3>
<p>Aplicação de questionários normatizados para identificação precoce de indicadores de neurodesenvolvimento.</p>`
  },
  {
    id: 'a5',
    name: 'Parecer Comportamental de Sessão',
    description: 'Análise descritiva do padrão de engajamento durante atendimentos clínicos',
    category: 'Avaliação',
    content: `<h2>PARECER DE COMPORTAMENTO CLÍNICO</h2>
<br>
<p>Síntese do perfil de colaboração, aceitação de limites, permanência em tarefa e tolerância a desafios cognitivos de {nome_paciente}.</p>`
  },
  {
    id: 'a6',
    name: 'Relatório de Funções Executivas',
    description: 'Avaliação de memória de trabalho, controle inibitório e flexibilidade mental',
    category: 'Avaliação',
    content: `<h2>RELATÓRIO DE AVALIAÇÃO DAS FUNÇÕES EXECUTIVAS</h2>
<br>
<p>Investigação detalhada dos três pilares executivos centrais: Controle Inibitório, Memória de Trabalho e Flexibilidade Cognitiva.</p>`
  },

  // INTERVENÇÃO (6)
  {
    id: 'i1',
    name: 'Plano Educacional Individualizado (PEI)',
    description: 'Planejamento de adaptações curriculares, metas e estratégias pedagógicas',
    category: 'Intervenção',
    content: `<h2>PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)</h2>
<br>
<h3>1. DADOS DO ESTUDANTE</h3>
<p><strong>Estudante:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} | <strong>Ano/Série:</strong> {serie}</p>
<p><strong>Escola:</strong> {escola}</p>
<br>
<h3>2. HABILIDADES ATUAIS E POTENCIAIS</h3>
<p>Registro das competências consolidadas e daquelas em processo de aquisição nos âmbitos acadêmico, social e comunicativo.</p>
<br>
<h3>3. METAS A CURTO, MÉDIO E LONGO PRAZO</h3>
<ul>
  <li><strong>Meta 1 (Comunicação/Leitura):</strong> Identificar e associar fonemas aos grafemas em palavras dissílabas.</li>
  <li><strong>Meta 2 (Socialização/Interação):</strong> Participar de atividades em duplas com mediação do professor.</li>
  <li><strong>Meta 3 (Autonomia):</strong> Organizar os próprios materiais escolares no início e término da aula.</li>
</ul>
<br>
<h3>4. ADAPTAÇÕES METODOLÓGICAS E DE AVALIAÇÃO</h3>
<p>Uso de pistas visuais, enunciados diretos e redução do volume de exercícios por folha.</p>`
  },
  {
    id: 'i2',
    name: 'Plano de Intervenção Terapêutica (PIT)',
    description: 'Cronograma de objetivos e atividades para ciclo de atendimentos clínicos',
    category: 'Intervenção',
    content: `<h2>PLANO DE INTERVENÇÃO TERAPÊUTICA (PIT)</h2>
<br>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Ciclo Previsto:</strong> 12 sessões</p>
<p><strong>Frequência Semanal:</strong> 1 a 2 sessões semanais de 50 minutos.</p>
<br>
<h3>OBJETIVOS DA INTERVENÇÃO</h3>
<p>Desenvolver as rotas fonológica e lexical da leitura através de estimulação de consciência fonológica, raciocínio lógico e jogos cognitivos interativos.</p>`
  },
  {
    id: 'i3',
    name: 'Plano Individual de Sessão Clínica',
    description: 'Planejamento das 5 fases de uma sessão psicopedagógica',
    category: 'Intervenção',
    content: `<h2>PLANO DE SESSÃO INDIVIDUAL</h2>
<br>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Data:</strong> {data_atual}</p>
<ol>
  <li><strong>Acolhimento & Rapport (5 min):</strong> Conversa livre e check-in emocional.</li>
  <li><strong>Ativação Cognitiva (10 min):</strong> Jogo de atenção concentrada ou memória de trabalho.</li>
  <li><strong>Intervenção Principal (25 min):</strong> Atividade estruturada de leitura/escrita ou mediação lógica.</li>
  <li><strong>Generalização & Desafio (5 min):</strong> Aplicação da estratégia aprendida em novo contexto.</li>
  <li><strong>Fechamento & Síntese (5 min):</strong> Registro da autoavaliação e combinados para o próximo encontro.</li>
</ol>`
  },
  {
    id: 'i4',
    name: 'Plano de Estimulação Precoce',
    description: 'Roteiro de intervenções lúdicas e sensório-motoras para crianças pequenas',
    category: 'Intervenção',
    content: `<h2>PLANO DE ESTIMULAÇÃO PRECOCE E NEUROAPRENDIZAGEM</h2>
<br>
<p><strong>Criança:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p>Estratégias lúdicas direcionadas para integração sensorial, tônus postural, preensão palmar e imitação motora.</p>`
  },
  {
    id: 'i5',
    name: 'Roteiro de Atividades e Treino Metacognitivo',
    description: 'Guia de passos para autorregulação e resolução de problemas',
    category: 'Intervenção',
    content: `<h2>ROTEIRO DE TREINO METACOGNITIVO</h2>
<br>
<p>Passo a passo aplicado com {nome_paciente}: 1. Parar; 2. Pensar no objetivo; 3. Executar devagar; 4. Conferir o resultado.</p>`
  },
  {
    id: 'i6',
    name: 'Protocolo de Suporte em Desregulação Emocional',
    description: 'Orientações práticas para momentos de sobrecarga sensorial ou frustração',
    category: 'Intervenção',
    content: `<h2>PROTOCOLO DE MANEJO EM DESREGULAÇÃO EMOCIONAL</h2>
<br>
<p>Diretrizes de acolhimento para <strong>{nome_paciente}</strong>: abaixar o tom de voz, evitar toques invasivos e oferecer o cantinho da calma.</p>`
  },

  // ESCOLAR (5)
  {
    id: 'e1',
    name: 'Relatório Devolutivo para a Escola',
    description: 'Comunicação oficial do consultório para professores e coordenadores',
    category: 'Escolar',
    content: `<h2>RELATÓRIO DE DEVOLUTIVA E ORIENTAÇÕES ESCOLARES</h2>
<br>
<p><strong>À Coordenação Pedagógica e Corpo Docente do(a):</strong> {escola}</p>
<p><strong>Assunto:</strong> Acompanhamento psicopedagógico do(a) aluno(a) {nome_paciente}</p>
<p><strong>Data:</strong> {data_atual}</p>
<br>
<h3>1. APRESENTAÇÃO</h3>
<p>Vimos por meio deste compartilhar síntese das observações clínicas e sugestões metodológicas para favorecer a aprendizagem e inclusão de {nome_paciente}.</p>
<br>
<h3>2. ORIENTAÇÕES METODOLÓGICAS EM SALA DE AULA</h3>
<ul>
  <li>Posicionar o(a) estudante próximo à mesa do professor, reduzindo distrações visuais e auditivas.</li>
  <li>Oferecer comandos diretos, com no máximo uma ou duas instruções por vez.</li>
  <li>Permitir pausas ativas de 2 minutos entre atividades densas para autorregulação física.</li>
  <li>Valorizar os sucessos intermediários com incentivo verbal.</li>
</ul>
<br>
<p>Permanecemos à disposição para reuniões de alinhamento com a equipe de mediação pedagógica.</p>`
  },
  {
    id: 'e2',
    name: 'Parecer Pedagógico de Acomodação Curricular',
    description: 'Recomendação técnica fundamentada para adequação de provas e aulas',
    category: 'Escolar',
    content: `<h2>PARECER TÉCNICO DE ACOMODAÇÃO CURRICULAR</h2>
<br>
<p>Recomendações técnicas embasadas na Lei de Inclusão para flexibilização das avaliações do estudante {nome_paciente}.</p>`
  },
  {
    id: 'e3',
    name: 'Encaminhamento Escolar para Especialistas',
    description: 'Encaminhamento formal para neuropediatria, fonoaudiologia ou terapia ocupacional',
    category: 'Escolar',
    content: `<h2>ENCAMINHAMENTO CLÍNICO INTERDISCIPLINAR</h2>
<br>
<p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
<p><strong>Ao(À) Colega Especialista:</strong></p>
<p>Encaminhamos o(a) paciente acima identificado(a) para avaliação complementar especializada em função dos achados clínicos em anexo.</p>`
  },
  {
    id: 'e4',
    name: 'Relatório de Observação no Contexto Escolar',
    description: 'Registro de visita escolar e observação participativa do aluno',
    category: 'Escolar',
    content: `<h2>RELATÓRIO DE VISITA E OBSERVAÇÃO ESCOLAR</h2>
<br>
<p>Visita técnica realizada no(a) {escola} com o objetivo de observar a interação e engajamento de {nome_paciente} no recreio e em sala de aula.</p>`
  },
  {
    id: 'e5',
    name: 'Parecer de Suporte e Mediação Escolar',
    description: 'Justificativa e diretrizes para atuação do estagiário/mediador escolar',
    category: 'Escolar',
    content: `<h2>PARECER TÉCNICO PARA MEDIAÇÃO ESCOLAR</h2>
<br>
<p>Justificativa de necessidade de profissional de apoio escolar (mediador) para acompanhamento das rotinas e mediação de {nome_paciente}.</p>`
  },

  // JURÍDICO (5)
  {
    id: 'j1',
    name: 'Declaração de Comparecimento',
    description: 'Comprovante oficial de presença em consulta para fins de justificativa',
    category: 'Jurídico',
    content: `<h2>DECLARAÇÃO DE COMPARECIMENTO</h2>
<br>
<p>Declaro, para os devidos fins de comprovação e justificativa legal, que o(a) paciente <strong>{nome_paciente}</strong>, acompanhado(a) por seu(sua) responsável <strong>{nome_responsavel}</strong>, compareceu a este consultório no dia <strong>{data_atual}</strong> para atendimento psicopedagógico especializado.</p>
<br>
<p>Por ser verdade, firmo a presente declaração.</p>`
  },
  {
    id: 'j2',
    name: 'Atestado de Presença e Atendimento',
    description: 'Atestado com especificação de horários para trabalho ou escola',
    category: 'Jurídico',
    content: `<h2>ATESTADO DE ATENDIMENTO CLÍNICO</h2>
<br>
<p>Atesto que <strong>{nome_paciente}</strong> esteve sob atendimento clínico no dia <strong>{data_atual}</strong>, das ___:___ às ___:___ horas.</p>`
  },
  {
    id: 'j3',
    name: 'Termo de Responsabilidade e Sigilo Profissional',
    description: 'Compromisso de conduta ética, confidencialidade e guarda de dados',
    category: 'Jurídico',
    content: `<h2>TERMO DE SIGILO E RESPONSABILIDADE ÉTICA</h2>
<br>
<p>Compromisso de confidencialidade e guarda segura das informações clínicas de {nome_paciente}, em total conformidade com a LGPD e o Código de Ética Profissional.</p>`
  },
  {
    id: 'j4',
    name: 'Declaração de Vínculo Terapêutico Contínuo',
    description: 'Declaração de que o paciente é atendido regularmente na clínica',
    category: 'Jurídico',
    content: `<h2>DECLARAÇÃO DE TRATAMENTO CONTÍNUO</h2>
<br>
<p>Declaro que <strong>{nome_paciente}</strong> encontra-se em acompanhamento psicopedagógico regular nesta clínica com periodicidade semanal.</p>`
  },
  {
    id: 'j5',
    name: 'Parecer Técnico para Perícia Judicial',
    description: 'Parecer circunstanciado para demandas judiciais e defensoria pública',
    category: 'Jurídico',
    content: `<h2>PARECER TÉCNICO PERICIAL</h2>
<br>
<p>Relatório circunstanciado com histórico das intervenções prestadas ao paciente {nome_paciente}, atendendo à solicitação legal.</p>`
  },

  // FAMÍLIA (4)
  {
    id: 'f1',
    name: 'Carta de Orientações para a Família',
    description: 'Guia amigável com estratégias para apoiar os estudos e rotina em casa',
    category: 'Família',
    content: `<h2>GUIA DE APOIO E ORIENTAÇÃO FAMILIAR</h2>
<br>
<p><strong>Querida família de {nome_paciente},</strong></p>
<br>
<p>O desenvolvimento da criança acontece de forma potente quando clínica, escola e família caminham juntas. Selecionamos dicas carinhosas e práticas para a rotina diária em casa:</p>
<br>
<ol>
  <li><strong>Crie um cantinho da lição acolhedor:</strong> Bem iluminado, sem celular ou televisão ligados por perto.</li>
  <li><strong>Elogie o esforço e a dedicação:</strong> Mais do que a nota final, valorize o empenho e cada pequeno progresso.</li>
  <li><strong>Momentos de leitura compartilhada:</strong> Ler 10 minutinhos juntos antes de dormir estimula o vocabulário e o vínculo afetivo.</li>
  <li><strong>Rotina previsível:</strong> Horários regulares para sono, refeições e brincadeiras diminuem a ansiedade infantil.</li>
</ol>
<br>
<p>Contem sempre comigo nessa caminhada!</p>`
  },
  {
    id: 'f2',
    name: 'Orientações para Manejo de Rotina e Telas',
    description: 'Orientações sobre uso saudável de tecnologia e organização do dia',
    category: 'Família',
    content: `<h2>ORIENTAÇÕES SOBRE ROTINA E TEMPO DE TELAS</h2>
<br>
<p>Orientações práticas para manejo do tempo de telas e organização do quadro de tarefas visuais de {nome_paciente}.</p>`
  },
  {
    id: 'f3',
    name: 'Relatório para Sessão de Devolutiva',
    description: 'Roteiro de apresentação dos resultados da avaliação com os pais',
    category: 'Família',
    content: `<h2>ROTEIRO PARA ENCONTRO DE DEVOLUTIVA</h2>
<br>
<p>Guia de pontos abordados com os responsáveis de {nome_paciente} ao término da bateria diagnóstica.</p>`
  },
  {
    id: 'f4',
    name: 'Termo de Consentimento Informado (LGPD)',
    description: 'Autorização formal para avaliação, atendimentos e troca com a escola',
    category: 'Família',
    content: `<h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (LGPD)</h2>
<br>
<p>Eu, <strong>{nome_responsavel}</strong>, responsável legal pelo(a) menor <strong>{nome_paciente}</strong>, autorizo a realização do processo de avaliação e intervenção psicopedagógica, bem como a comunicação técnica estritamente necessária com a escola <strong>{escola}</strong>, nos termos da Lei Geral de Proteção de Dados (Lei 13.709/18).</p>`
  },

  // FINANCEIRO (4)
  {
    id: 'fn1',
    name: 'Proposta de Prestação de Serviços Clínicos',
    description: 'Proposta com cronograma de sessões, honorários e condições',
    category: 'Financeiro',
    content: `<h2>PROPOSTA DE ATENDIMENTO PSICOPEDAGÓGICO</h2>
<br>
<p><strong>Contratante:</strong> {nome_responsavel} | <strong>Beneficiário:</strong> {nome_paciente}</p>
<p>Apresentamos a proposta para o plano terapêutico com investimento mensal ou por sessão.</p>`
  },
  {
    id: 'fn2',
    name: 'Contrato de Prestação de Serviços Psicopedagógicos',
    description: 'Contrato formal com cláusulas de faltas, reposições e sigilo',
    category: 'Financeiro',
    content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOPEDAGÓGICOS</h2>
<br>
<p>Pelo presente instrumento particular, de um lado a clínica/terapeuta e de outro o(a) responsável <strong>{nome_responsavel}</strong>, estabelecem as normas e condições para o atendimento de <strong>{nome_paciente}</strong>.</p>`
  },
  {
    id: 'fn3',
    name: 'Recibo de Pagamento de Honorários',
    description: 'Recibo com dados completos para declaração de imposto de renda',
    category: 'Financeiro',
    content: `<h2>RECIBO DE PAGAMENTO DE HONORÁRIOS PROFISSIONAIS</h2>
<br>
<p>Recebi de <strong>{nome_responsavel}</strong> a importância correspondente aos atendimentos psicopedagógicos prestados a <strong>{nome_paciente}</strong> no mês de referência.</p>`
  },
  {
    id: 'fn4',
    name: 'Declaração de Quitação Anual de Mensalidades',
    description: 'Comprovante anual consolidado de quitação financeira para o responsável',
    category: 'Financeiro',
    content: `<h2>DECLARAÇÃO DE QUITAÇÃO ANUAL DE DÉBITOS</h2>
<br>
<p>Declaramos para os devidos fins que o(a) responsável <strong>{nome_responsavel}</strong> encontra-se em dia com todas as obrigações financeiras relativas aos atendimentos de <strong>{nome_paciente}</strong>.</p>`
  }
];

export function replaceDocPlaceholders(
  content: string,
  patient?: any,
  professional?: any,
  tenant?: any
): string {
  if (!content) return '';

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const replacements: Record<string, string> = {
    '{nome_paciente}': patient?.name || 'Nome do Paciente',
    '{data_nascimento}': patient?.birthDate || '___/___/_____',
    '{idade}': patient?.age || (patient?.birthDate ? calculateAge(patient.birthDate) : '___ anos'),
    '{escola}': patient?.school?.name || 'Instituição de Ensino',
    '{serie}': patient?.grade || 'Ano Escolar',
    '{nome_responsavel}': patient?.responsible?.name || 'Responsável Legal',
    '{data_atual}': dateFormatted,
    '{profissional_nome}': professional?.name || 'Profissional Responsável',
    '{registro_profissional}': professional?.councilNumber || professional?.role || 'ABPp / Registro',
    '{nome_clinica}': tenant?.name || 'EduPsych Pro - Clínica Especializada'
  };

  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }

  // Remove quebras <br> redundantes antes ou após títulos para manter espaçamento elegante e compacto
  result = result.replace(/<br\s*\/?>\s*(<h[1-6]>)/gi, '$1');
  result = result.replace(/(<\/h[1-6]>)\s*<br\s*\/?>/gi, '$1');

  return result;
}

function calculateAge(birthDateStr: string): string {
  try {
    const parts = birthDateStr.split('-');
    if (parts.length === 3) {
      const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} anos`;
    }
  } catch {}
  return '___ anos';
}
