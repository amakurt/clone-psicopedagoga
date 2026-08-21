import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var html2pdf: any;

interface DocTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  favorite: boolean;
}

@Component({
  selector: 'app-modelos-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">37 Modelos de Documentos</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Templates profissionais prontos para uso</p>
      </div>

      <!-- Search -->
      <div class="relative">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
          [(ngModel)]="searchTerm" (ngModelChange)="filterItems()" placeholder="Buscar modelos...">
      </div>

      <!-- Category Filters -->
      <div class="flex flex-wrap gap-2">
        <button (click)="filterCategory.set('')"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          [class]="filterCategory() === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
          Todos ({{ totalCount }})
        </button>
        @for (cat of categories; track cat.value) {
          <button (click)="filterCategory.set(cat.value); filterItems()"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            [class]="filterCategory() === cat.value ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
            {{ cat.label }} ({{ cat.count }})
          </button>
        }
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (item of filteredItems(); track item.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/30 hover:-translate-y-1 transition-all flex flex-col">
            <div class="h-24 flex items-center justify-center" [class]="getCategoryBg(item.category)">
              <span class="material-icons text-3xl opacity-50">{{ getCategoryIcon(item.category) }}</span>
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ item.name }}</h3>
                <button (click)="toggleFavorite(item.id)"
                  class="p-1 rounded-lg transition-all shrink-0"
                  [class]="item.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'">
                  <span class="material-icons text-lg">{{ item.favorite ? 'star' : 'star_border' }}</span>
                </button>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold self-start mb-2"
                [class]="getCategoryStyle(item.category)">
                {{ item.category }}
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex-1">{{ item.description }}</p>
              <div class="flex gap-2">
                <button (click)="useTemplate(item)"
                  class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all">
                  <span class="material-icons text-sm">edit</span> Usar
                </button>
                <button (click)="previewTemplate(item)"
                  class="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all">
                  <span class="material-icons text-sm">visibility</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredItems().length === 0) {
        <div class="text-center py-12">
          <span class="material-icons text-6xl text-slate-300">search_off</span>
          <p class="text-slate-500 mt-3">Nenhum modelo encontrado</p>
        </div>
      }

      <!-- Editor Modal -->
      @if (editingTemplate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="editingTemplate.set(null)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ editingTemplate()!.name }}</h2>
                <p class="text-xs text-slate-500 mt-1">{{ editingTemplate()!.category }}</p>
              </div>
              <div class="flex items-center gap-3">
                <button (click)="exportEditToPdf()"
                  class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-xs transition-all">
                  <span class="material-icons text-sm">picture_as_pdf</span> PDF
                </button>
                <button (click)="editingTemplate.set(null)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <textarea class="w-full h-full min-h-[500px] px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none font-mono leading-relaxed text-slate-900 dark:text-white"
                [(ngModel)]="editContent"></textarea>
            </div>
          </div>
        </div>
      }

      <!-- Preview Modal -->
      @if (previewingTemplate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="previewingTemplate.set(null)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8">
            <button (click)="previewingTemplate.set(null)" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <span class="material-icons">close</span>
            </button>
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-4">{{ previewingTemplate()!.name }}</h2>
            <div class="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{{ previewingTemplate()!.content }}</div>
            <div class="mt-6 flex justify-end gap-3">
              <button (click)="previewingTemplate.set(null)"
                class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-400 transition-all">
                Fechar
              </button>
              <button (click)="useTemplate(previewingTemplate()!); previewingTemplate.set(null)"
                class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95">
                <span class="material-icons text-[18px]">edit</span>
                Usar Modelo
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ModelosDocumentoComponent {
  searchTerm = '';
  filterCategory = signal('');
  editingTemplate = signal<DocTemplate | null>(null);
  editContent = '';
  previewingTemplate = signal<DocTemplate | null>(null);

  categories = [
    { value: 'Diagnóstico', label: 'Diagnóstico', count: 7 },
    { value: 'Avaliação', label: 'Avaliação', count: 6 },
    { value: 'Intervenção', label: 'Intervenção', count: 6 },
    { value: 'Escolar', label: 'Escolar', count: 5 },
    { value: 'Jurídico', label: 'Jurídico', count: 5 },
    { value: 'Família', label: 'Família', count: 4 },
    { value: 'Financeiro', label: 'Financeiro', count: 4 },
  ];

  totalCount = 37;

  private allItems: DocTemplate[] = [
    // DIAGNÓSTICO (7)
    { id: 'd1', name: 'Laudo TEA', description: 'Laudo diagnóstico para Transtorno do Espectro Autista', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - TRANSTORNO DO ESPECTRO AUTISTA\n\n1. IDENTIFICAÇÃO\nPaciente: ___\nData de nascimento: ___\nIdade: ___\nEscola: ___\nResponsáveis: ___\n\n2. MOTIVO DA AVALIAÇÃO\nDescrição do motivo da consulta e encaminhamento.\n\n3. ANTECEDENTES\n- Histórico familiar\n- Desenvolvimento neuropsicomotor\n- Histórico de saúde\n- Histórico escolar\n\n4. OBSERVAÇÃO CLÍNICA\n- Interação social\n- Comunicação verbal e não-verbal\n- Comportamentos repetitivos\n- Interesses restritos\n\n5. INSTRUMENTOS UTILIZADOS\n- M-CHAT-R\n- ESCS\n- Entrevista semiestruturada\n- Observação clínica\n\n6. RESULTADOS\nApresentação dos resultados por domínio.\n\n7. CONCLUSÃO DIAGNÓSTICA\nClassificação conforme DSM-5: ___________\nNível de suporte: ___\n\n8. RECOMENDAÇÕES\n- Intervenção ABA\n- Terapia de linguagem\n- Orientação escolar\n- Acompanhamento multiprofissional\n\nLocal e data: ___/___/___\n\n___________________________\nProfissional - CRP nº ___` },
    { id: 'd2', name: 'Laudo TDAH', description: 'Laudo diagnóstico para TDAH', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - TDAH\n\n1. IDENTIFICAÇÃO\nPaciente: ___ | Idade: ___\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. ANTECEDENTES\n\n4. OBSERVAÇÃO CLÍNICA\n- Desatenção\n- Hiperatividade\n- Impulsividade\n\n5. INSTRUMENTOS\n- SNAP-IV\n- Entrevista clínica\n- Relatórios escolares\n\n6. RESULTADOS\n\n7. CONCLUSÃO\nSubtipo: Desatento / Hiperativo / Combinado\n\n8. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'd3', name: 'Laudo Dislexia', description: 'Laudo diagnóstico para Dislexia', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - DISLEXIA\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. HISTÓRICO ESCOLAR\n\n4. AVALIAÇÃO DA LEITURA E ESCRITA\n- Fluência\n- Compreensão\n- Decodificação\n- Fonologia\n\n5. INSTRUMENTOS\n- Prova de Leitura\n- Teste de Consciência Fonológica\n\n6. RESULTADOS\n\n7. CONCLUSÃO\n\n8. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'd4', name: 'Laudo DI', description: 'Laudo diagnóstico para Deficiência Intelectual', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - DEFICIÊNCIA INTELECTUAL\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. AVALIAÇÃO COGNITIVA\n- QI total: ___\n- Áreas específicas: ___\n\n4. AVALIAÇÃO ADAPTATIVA\n- Comunicação\n- Cuidados pessoais\n- Vida doméstica\n- Habilidades sociais\n\n5. CLASSIFICAÇÃO\nNível: Leve / Moderado / Severo / Profundo\n\n6. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'd5', name: 'Laudo Atraso Desenvolvimento', description: 'Laudo para atrasos no desenvolvimento', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - ATRASO NO DESENVOLVIMENTO\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. DESENVOLVIMENTO NEUROPSICOMOTOR\n- Marcha\n- Linguagem\n- Esfincteriana\n- Socialização\n\n4. INSTRUMENTOS\n\n5. RESULTADOS\n\n6. CONCLUSÃO\n\n7. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'd6', name: 'Laudo TOD', description: 'Laudo diagnóstico para TOD', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - TRANSTORNO OPOSITOR DESAFIADOR\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. COMPORTAMENTOS OBSERVADOS\n- Raiva frequente\n- Discussão com autoridades\n- Culpar os outros\n- Vingança\n\n4. INSTRUMENTOS\n\n5. RESULTADOS\n\n6. CONCLUSÃO\n\n7. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'd7', name: 'Laudo Hiperatividade', description: 'Laudo para Transtorno de Hiperatividade', category: 'Diagnóstico', favorite: false, content: `LAUDO DE AVALIAÇÃO - HIPERATIVIDADE\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. MANIFESTAÇÕES CLÍNICAS\n- Agitação motora\n- Dificuldade de concentração\n- Comportamentos impulsivos\n\n4. INSTRUMENTOS\n\n5. RESULTADOS\n\n6. CONCLUSÃO\n\n7. RECOMENDAÇÕES\n\n___________________________` },

    // AVALIAÇÃO (6)
    { id: 'a1', name: 'Relatório Avaliação Psicopedagógica', description: 'Relatório completo de avaliação psicopedagógica', category: 'Avaliação', favorite: false, content: `RELATÓRIO DE AVALIAÇÃO PSICOPEDAGÓGICA\n\n1. IDENTIFICAÇÃO\nPaciente: ___\nIdade: ___\nEscola: ___\nSérie: ___\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. HISTÓRICO DE VIDA\n- Gestação e parto\n- Desenvolvimento neuropsicomotor\n- Desenvolvimento da linguagem\n- Histórico de saúde\n- Histórico familiar\n\n4. HISTÓRICO ESCOLAR\n\n5. ANÁLISE DA APRENDIZAGEM\n- Leitura\n- Escrita\n- Cálculo\n- Raciocínio lógico\n\n6. ANÁLISE DAS FUNÇÕES EXECUTIVAS\n\n7. ASPECTOS AFETIVO-SOCIAIS\n\n8. INSTRUMENTOS UTILIZADOS\n\n9. SÍNTESE DIAGNÓSTICA\n\n10. CONCLUSÃO E RECOMENDAÇÕES\n\n___________________________` },
    { id: 'a2', name: 'Relatório Avaliação ABA', description: 'Relatório de avaliação funcional ABA', category: 'Avaliação', favorite: false, content: `RELATÓRIO DE AVALIAÇÃO FUNCIONAL - ABA\n\n1. IDENTIFICAÇÃO DO PACIENTE\n\n2. MOTIVO DA AVALIAÇÃO\n\n3. ANÁLISE FUNCIONAL DO COMPORTAMENTO\n- Comportamento-alvo\n- Antecedentes\n- Consequências\n- Função do comportamento\n\n4. ANÁLISE DO COMPORTAMENTO VERBAL\n- Manding\n- Tacting\n- Echoic\n- Intraverbal\n\n5. NÍVEL DE FUNCIONALIDADE\n- VB-MAPP\n- ABLLS-R\n\n6. RECOMENDAÇÕES DE INTERVENÇÃO\n\n___________________________` },
    { id: 'a3', name: 'Parecer ABA', description: 'Parecer técnico para intervenção ABA', category: 'Avaliação', favorite: false, content: `PARECER TÉCNICO - PROGRAMA ABA\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO DO PARECER\n\n3. DADOS DA AVALIAÇÃO\n\n4. ANÁLISE\n- Habilidades presentes\n- Habilidades ausentes\n- Comportamentos de desafio\n\n5. PROGRAMA DE INTERVENÇÃO RECOMENDADO\n- DTT\n- NET\n- Contingência de reforço\n\n6. METAS E OBJETIVOS\n\n7. CONCLUSÃO\n\n___________________________` },
    { id: 'a4', name: 'Relatório Screening', description: 'Relatório de rastreio rápido', category: 'Avaliação', favorite: false, content: `RELATÓRIO DE SCREENING\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO\nRastreio rápido para identificação de indicadores de:\n- TEA\n- TDAH\n- Dificuldades de aprendizagem\n\n3. INSTRUMENTOS UTILIZADOS\n\n4. RESULTADOS POR ÁREA\n- Comportamento social\n- Linguagem\n- Atenção\n- Aprendizagem\n\n5. CLASSIFICAÇÃO DE RISCO\nBaixo / Moderado / Alto\n\n6. ENCAMINHAMENTOS\n\n___________________________` },
    { id: 'a5', name: 'Parecer Comportamental', description: 'Parecer sobre comportamento do paciente', category: 'Avaliação', favorite: false, content: `PARECER COMPORTAMENTAL\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO\n\n3. OBSERVAÇÃO DO COMPORTAMENTO\n- Frequência\n- Duração\n- Intensidade\n- Contexto\n\n4. ANÁLISE FUNCIONAL\n\n5. RECOMENDAÇÕES\n\n___________________________` },
    { id: 'a6', name: 'Relatório Funções Executivas', description: 'Relatório de avaliação de funções executivas', category: 'Avaliação', favorite: false, content: `RELATÓRIO DE FUNÇÕES EXECUTIVAS\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO\n\n3. FUNÇÕES AVALIADAS\n- Planejamento\n- Organização\n- Memória de trabalho\n- Controle inibitório\n- Flexibilidade cognitiva\n- Tomada de decisão\n\n4. INSTRUMENTOS\n\n5. RESULTADOS\n\n6. RECOMENDAÇÕES\n\n___________________________` },

    // INTERVENÇÃO (6)
    { id: 'i1', name: 'PEI', description: 'Plano Educacional Individualizado', category: 'Intervenção', favorite: false, content: `PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)\n\n1. IDENTIFICAÇÃO DO ESTUDANTE\nNome: ___ | Idade: ___ | Série: ___\nDiagnóstico: ___\n\n2. OBJETIVOS GERAIS\n\n3. OBJETIVOS ESPECÍFICOS\n- Área cognitiva\n- Área de comunicação\n- Área social\n- Área motora\n- Área comportamental\n\n4. ADAPTAÇÕES CURRICULARES\n- Metodológicas\n- Avaliativas\n- Organizacionais\n\n5. RECURSOS NECESSÁRIOS\n\n6. CRONOGRAMA\n\n7. RESPONSÁVEIS\n\n8. REVISÃO\nPeriodicidade: ___\n\n___________________________` },
    { id: 'i2', name: 'Plano ABA', description: 'Plano de intervenção ABA', category: 'Intervenção', favorite: false, content: `PLANO DE INTERVENÇÃO ABA\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVOS\n\n3. PROGRAMAS\n- DTT\n- NET\n- Contingência de reforço\n- Generalização\n\n4. ALVOS POR PROGRAMA\n\n5. PROCEDIMENTOS DE COLETA DE DADOS\n\n6. CRITÉRIOS DE MUDANÇA\n\n7. REVISÃO\n\n___________________________` },
    { id: 'i3', name: 'Plano de Sessão', description: 'Plano individual de sessão', category: 'Intervenção', favorite: false, content: `PLANO DE SESSÃO\n\nData: ___ | Horário: ___\nPaciente: ___\n\n1. OBJETIVOS DA SESSÃO\n\n2. MATERIAIS\n\n3. ATIVIDADES\n- Aquecimento: ___\n- Atividade principal: ___\n- Generalização: ___\n- Encerramento: ___\n\n4. DADOS A COLETAR\n\n5. OBSERVAÇÕES\n\n___________________________` },
    { id: 'i4', name: 'Plano de Estimulação', description: 'Plano de estimulação precoce', category: 'Intervenção', favorite: false, content: `PLANO DE ESTIMULAÇÃO PRECOCE\n\n1. IDENTIFICAÇÃO\n\n2. ÁREAS DE ESTIMULAÇÃO\n- Sensorial\n- Motora\n- Cognitiva\n- Linguagem\n- Social\n\n3. ATIVIDADES PROPOSTAS\n\n4. FREQUÊNCIA\n\n5. ORIENTAÇÕES À FAMÍLIA\n\n___________________________` },
    { id: 'i5', name: 'Roteiro de Atividades', description: 'Roteiro de atividades terapêuticas', category: 'Intervenção', favorite: false, content: `ROTEIRO DE ATIVIDADES\n\n1. TEMA\n\n2. OBJETIVOS\n\n3. MATERIAIS NECESSÁRIOS\n\n4. SEQUÊNCIA DE ATIVIDADES\n1) ___\n2) ___\n3) ___\n4) ___\n\n5. CRITÉRIOS DE AVALIAÇÃO\n\n6. REGISTRO\n\n___________________________` },
    { id: 'i6', name: 'Protocolo de Crise', description: 'Protocolo de atendimento em crise', category: 'Intervenção', favorite: false, content: `PROTOCOLO DE ATENDIMENTO EM CRISE\n\n1. IDENTIFICAÇÃO DO PACIENTE\n\n2. COMPORTAMENTOS DE CRISE\n- Descrição operacional\n- Estímulo antecedente\n- Consequência mantenedora\n\n3. PLANO DE PREVENÇÃO\n\n4. PROCEDIMENTOS DURANTE A CRISE\n- Passo 1: ___\n- Passo 2: ___\n- Passo 3: ___\n\n5. APÓS A CRISE\n\n6. COMUNICAÇÃO COM A FAMÍLIA\n\n___________________________` },

    // ESCOLAR (5)
    { id: 'e1', name: 'Relatório para Escola', description: 'Relatório direcionado para escola', category: 'Escolar', favorite: false, content: `RELATÓRIO PARA A ESCOLA\n\nÀ Direção/Docência da Escola ___\n\n1. IDENTIFICAÇÃO DO ESTUDANTE\n\n2. OBJETIVO DO RELATÓRIO\n\n3. SÍNTESE DA AVALIAÇÃO\n\n4. SUGESTÕES PARA O PROFESSOR\n- Adaptações pedagógicas\n- Estratégias de ensino\n- Avaliação diferenciada\n\n5. ENCAMINHAMENTOS\n\n___________________________` },
    { id: 'e2', name: 'Parecer Pedagógico', description: 'Parecer técnico pedagógico', category: 'Escolar', favorite: false, content: `PARECER PEDAGÓGICO\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO\n\n3. ANÁLISE DO CONTEXTO ESCOLAR\n\n4. SUGESTÕES\n\n5. CONCLUSÃO\n\n___________________________` },
    { id: 'e3', name: 'Laudo de Encaminhamento', description: 'Laudo para encaminhamento escolar', category: 'Escolar', favorite: false, content: `LAUDO DE ENCAMINHAMENTO\n\nÀ Escola ___\n\n1. IDENTIFICAÇÃO\n\n2. MOTIVO DO ENCAMINHAMENTO\n\n3. DIAGNÓSTICO\n\n4. RECOMENDAÇÕES\n\n5. ENCAMINHAMENTOS SUGERIDOS\n\n___________________________` },
    { id: 'e4', name: 'Relatório de Adaptação', description: 'Relatório de adaptação escolar', category: 'Escolar', favorite: false, content: `RELATÓRIO DE ADAPTAÇÃO ESCOLAR\n\n1. IDENTIFICAÇÃO\n\n2. PERÍODO DE OBSERVAÇÃO\n\n3. COMPORTAMENTOS OBSERVADOS\n\n4. DIFICULDADES IDENTIFICADAS\n\n5. ADAPTAÇÕES SUGERIDAS\n\n6. ENCAMINHAMENTOS\n\n___________________________` },
    { id: 'e5', name: 'Parecer Adaptativo', description: 'Parecer sobre necessidades adaptativas', category: 'Escolar', favorite: false, content: `PARECER ADAPTATIVO\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO\n\n3. NECESSIDADES IDENTIFICADAS\n\n4. ADAPTAÇÕES RECOMENDADAS\n- Curriculares\n- Avaliativas\n- Comportamentais\n- Infraestrutura\n\n5. CONCLUSÃO\n\n___________________________` },

    // JURÍDICO (5)
    { id: 'j1', name: 'Declaração de Comparecimento', description: 'Declaração de comparecimento a consultas', category: 'Jurídico', favorite: false, content: `DECLARAÇÃO DE COMPARECIMENTO\n\nDeclaro para os devidos fins que o(a) Sr(a). _________________, CPF nº _____________, compareceu ao meu consultório nas seguintes datas:\n\n1) ___/___/___\n2) ___/___/___\n3) ___/___/___\n\nPara atendimento de natureza psicopedagógica.\n\nLocal e data: ___/___/___\n\n___________________________\nProfissional - CRP nº ___` },
    { id: 'j2', name: 'Atestado de Presença', description: 'Atestado de presença para atividades', category: 'Jurídico', favorite: false, content: `ATESTADO DE PRESENÇA\n\nAtesto que o(a) Sr(a). _________________, CPF nº _____________, esteve presente em sessão de atendimento psicopedagógico no dia ___/___/___, no horário de ___ às ___.\n\n___________________________\nProfissional - CRP nº ___` },
    { id: 'j3', name: 'Termo de Responsabilidade', description: 'Termo de responsabilidade profissional', category: 'Jurídico', favorite: false, content: `TERMO DE RESPONSABILIDADE\n\nEu, _________________, inscrito(a) no CRP nº __________, DECLARO que assumo a responsabilidade técnica pelo atendimento psicopedagógico do(a) paciente _________________, nos termos da legislação vigente e do Código de Ética do Psicólogo.\n\n___________________________\nProfissional - CRP nº ___` },
    { id: 'j4', name: 'Declaração de Atendimento', description: 'Declaração de atendimento profissional', category: 'Jurídico', favorite: false, content: `DECLARAÇÃO DE ATENDIMENTO\n\nDeclaro que atendo o(a) Sr(a). _________________, CPF nº _____________, desde ___/___/___, com frequência semanal de ___ sessão(ões), para tratamento de _________________.\n\n___________________________\nProfissional - CRP nº ___` },
    { id: 'j5', name: 'Parecer para Perícia', description: 'Parecer técnico para perícia', category: 'Jurídico', favorite: false, content: `PARECER TÉCNICO PARA PERÍCIA\n\n1. IDENTIFICAÇÃO DO(A) AVALIANDO(A)\n\n2. OBJETIVO DO PARECER\n\n3. DADOS CLÍNICOS\n\n4. ANÁLISE TÉCNICA\n\n5. CONCLUSÃO\n\n6. LIMITAÇÕES\n\n___________________________\nProfissional - CRP nº ___` },

    // FAMÍLIA (4)
    { id: 'f1', name: 'Carta para Pais', description: 'Carta orientativa para pais', category: 'Família', favorite: false, content: `CARTA PARA PAIS\n\nPrezado(a) responsável,\n\nApós a avaliação do(a) seu(sua) filho(a) _________________, gostaria de compartilhar algumas orientações:\n\n1. SOBRE O DIAGNÓSTICO\n\n2. COMO VOCÊ PODE AJUDAR EM CASA\n\n3. ATIVIDADES SUGERIDAS\n\n4. SINAIS DE ALERTA\n\n5. PRÓXIMOS PASSOS\n\nEstou à disposição para esclarecer dúvidas.\n\nAtenciosamente,\n___________________________` },
    { id: 'f2', name: 'Orientação Familiar', description: 'Documento de orientação à família', category: 'Família', favorite: false, content: `ORIENTAÇÃO FAMILIAR\n\n1. COMPREENDENDO A CONDIÇÃO\n\n2. ESTRATÉGIAS PARA O DIA A DIA\n\n3. COMUNICAÇÃO EFICAZ\n\n4. ROTINA E ORGANIZAÇÃO\n\n5. ENCAMINHAMENTOS\n\n___________________________` },
    { id: 'f3', name: 'Relatório Devolutiva', description: 'Relatório para sessão de devolutiva', category: 'Família', favorite: false, content: `RELATÓRIO DE DEVOLUTIVA\n\n1. IDENTIFICAÇÃO\n\n2. OBJETIVO DA REUNIÃO\n\n3. SÍNTESE DA AVALIAÇÃO\n\n4. DIAGNÓSTICO\n\n5. PLANO DE INTERVENÇÃO\n\n6. ORIENTAÇÕES PARA A FAMÍLIA\n\n7. PRÓXIMOS PASSOS\n\n___________________________` },
    { id: 'f4', name: 'Termo de Consentimento', description: 'Termo de consentimento para pais', category: 'Família', favorite: false, content: `TERMO DE CONSENTIMENTO\n\nEu, _________________, CPF nº _____________, na qualidade de responsável pelo(a) menor _________________, AUTORIZO:\n\n[ ] Avaliação psicopedagógica\n[ ] Intervenção terapêutica\n[ ] Compartilhamento de informações com a escola\n[ ] Participação em grupo de orientação\n[ ] Outros: _________________\n\nData: ___/___/___\n\n___________________________\nResponsável` },

    // FINANCEIRO (4)
    { id: 'fn1', name: 'Proposta Comercial', description: 'Proposta comercial de serviços', category: 'Financeiro', favorite: false, content: `PROPOSTA COMERCIAL\n\nProfissional: ___ | CRP: ___\n\nPaciente: ___\nResponsável: ___\n\nSERVIÇOS PROPOSTOS\n- Avaliação: R$ ___\n- Sessão: R$ ___\n- Pacote ___ sessões: R$ ___\n\nFORMA DE PAGAMENTO: ___\nVALIDADE: 15 dias\n\n___________________________` },
    { id: 'fn2', name: 'Contrato Prestação', description: 'Contrato de prestação de serviços', category: 'Financeiro', favorite: false, content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nCONTRATANTE: ___\nCONTRATADO: ___\n\n1. OBJETO\n2. DURAÇÃO\n3. VALOR\n4. PAGAMENTO\n5. CANCELAMENTO\n6. SIGILO\n\n___________________________` },
    { id: 'fn3', name: 'Nota Fiscal', description: 'Modelo de nota fiscal de serviços', category: 'Financeiro', favorite: false, content: `NOTA FISCAL DE SERVIÇOS\n\nNº: ___\nData: ___\n\nPRESTADOR: ___ | CNPJ: ___\nTOMADOR: ___ | CPF/CNPJ: ___\n\nDESCRIÇÃO DO SERVIÇO: ___\nVALOR: R$ ___\nIR: R$ ___\nISS: R$ ___\nLÍQUIDO: R$ ___\n\n___________________________` },
    { id: 'fn4', name: 'Recibo', description: 'Modelo de recibo de pagamento', category: 'Financeiro', favorite: false, content: `RECIBO\n\nRecebi de _________________, CPF nº _____________, a quantia de R$ ___ (___), referente a:\n\n[ ] Sessão de atendimento psicopedagógico\n[ ] Avaliação psicopedagógica\n[ ] Pacote de sessões\n[ ] Outros: _________________\n\nData: ___/___/___\n\n___________________________\nProfissional - CRP nº ___` },
  ];

  filteredItems = signal<DocTemplate[]>(this.allItems);

  filterItems() {
    const term = this.searchTerm.toLowerCase();
    const cat = this.filterCategory();
    this.filteredItems.set(
      this.allItems.filter(item => {
        const catMatch = !cat || item.category === cat;
        const searchMatch = !term ||
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term);
        return catMatch && searchMatch;
      })
    );
  }

  toggleFavorite(id: string) {
    const item = this.allItems.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.filterItems();
    }
  }

  useTemplate(item: DocTemplate) {
    this.editingTemplate.set(item);
    this.editContent = item.content;
  }

  previewTemplate(item: DocTemplate) {
    this.previewingTemplate.set(item);
  }

  exportEditToPdf() {
    if (!this.editingTemplate()) return;
    const title = this.editingTemplate()!.name;
    const content = this.editContent;
    const html = `<html><head><meta charset="utf-8"><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;font-size:13px;line-height:1.8;}
      h1{font-size:20px;color:#6366f1;margin-bottom:16px;text-align:center;}
      .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center;}</style></head>
      <body><h1>${title}</h1><pre style="white-space:pre-wrap;font-family:inherit;">${content}</pre>
      <div class="footer">Exportado em ${new Date().toLocaleDateString('pt-BR')} - EduPsych Pro</div></body></html>`;
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el);
    html2pdf().set({ margin: 10, filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save().then(() => document.body.removeChild(el));
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = { 'Diagnóstico': 'medical_services', 'Avaliação': 'assessment', 'Intervenção': 'handyman', 'Escolar': 'school', 'Jurídico': 'gavel', 'Família': 'family_restroom', 'Financeiro': 'payments' };
    return icons[cat] || 'description';
  }

  getCategoryBg(cat: string): string {
    const bgs: Record<string, string> = { 'Diagnóstico': 'bg-red-50 dark:bg-red-900/20', 'Avaliação': 'bg-blue-50 dark:bg-blue-900/20', 'Intervenção': 'bg-emerald-50 dark:bg-emerald-900/20', 'Escolar': 'bg-amber-50 dark:bg-amber-900/20', 'Jurídico': 'bg-purple-50 dark:bg-purple-900/20', 'Família': 'bg-pink-50 dark:bg-pink-900/20', 'Financeiro': 'bg-teal-50 dark:bg-teal-900/20' };
    return bgs[cat] || 'bg-slate-50 dark:bg-slate-800';
  }

  getCategoryStyle(cat: string): string {
    const styles: Record<string, string> = { 'Diagnóstico': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', 'Avaliação': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', 'Intervenção': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 'Escolar': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'Jurídico': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', 'Família': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', 'Financeiro': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' };
    return styles[cat] || 'bg-slate-100 text-slate-700';
  }
}
