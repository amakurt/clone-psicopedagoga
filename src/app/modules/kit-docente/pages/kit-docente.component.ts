import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SentLink {
  id: number;
  studentName: string;
  teacherName: string;
  school: string;
  sentAt: string;
  status: 'pendente' | 'respondido';
  response?: TeacherResponse;
}

interface TeacherResponse {
  observations: string;
  academicPerformance: string;
  behavioralNotes: string;
  cooperationLevel: string;
  additionalComments: string;
}

interface ResponsibilityItem {
  area: string;
  school: string;
  clinic: string;
}

interface TrainingExercise {
  id: number;
  title: string;
  duration: string;
  description: string;
  steps: string[];
}

const SENT_LINKS: SentLink[] = [
  { id: 1, studentName: 'Lucas Silva', teacherName: 'Prof. Ana Costa', school: 'EMEF Professor Paulo', sentAt: '2025-08-18', status: 'respondido',
    response: { observations: 'Lucas tem melhorado na participacao em sala. Dificuldade persistente com organizacao de material.', academicPerformance: 'Leitura abaixo do esperado, matematica adequada', behavioralNotes: 'Cooperativo, as vezes disperso', cooperationLevel: 'Boa', additionalComments: 'Precisa de reforco em linguagem' } },
  { id: 2, studentName: 'Maria Santos', teacherName: 'Prof. Carlos Lima', school: 'EMEF Maria Montessori', sentAt: '2025-08-19', status: 'respondido',
    response: { observations: 'Maria e muito dedicada mas se frustra facilmente com tarefas complexas.', academicPerformance: 'Acima da media em todas as areas', behavioralNotes: 'Exemplar, ajuda colegas', cooperationLevel: 'Otima', additionalComments: 'Sugiro participacao de programas de lideranca' } },
  { id: 3, studentName: 'Pedro Oliveira', teacherName: 'Prof. Julia Mendes', school: 'EMEF Tiradentes', sentAt: '2025-08-20', status: 'pendente' },
  { id: 4, studentName: 'Ana Ferreira', teacherName: 'Prof. Roberto Alves', school: 'EMEF Horizonte', sentAt: '2025-08-20', status: 'pendente' },
  { id: 5, studentName: 'Joao Pereira', teacherName: 'Prof. Fernanda Rocha', school: 'EMEF Nova Era', sentAt: '2025-08-17', status: 'respondido',
    response: { observations: 'Joao apresenta dificuldades motoras que afetam a escrita. Demora nas atividades.', academicPerformance: 'Raciocinio logico bom, escrita lenta', behavioralNotes: 'Calmo, observador', cooperationLevel: 'Boa', additionalComments: 'Adaptacoes motoras estao ajudando' } },
];

const RESPONSIBILITIES: ResponsibilityItem[] = [
  { area: 'Avaliacao Inicial', school: 'Fornecer relatorio de desempenho e observacoes do dia a dia', clinic: 'Realizar avaliacao psicopedagogica completa' },
  { area: 'Plano de Intervencao', school: 'Implementar adaptacoes curriculares em sala', clinic: 'Elaborar plano terapeutico com metas especificas' },
  { area: 'Acompanhamento', school: 'Monitorar progresso semanal e reportar mudancas', clinic: 'Realizar sessoes terapeuticas regulares' },
  { area: 'Comunicacao com Pais', school: 'Participar de reunioes e enviar relatorios', clinic: 'Orientar pais e mediar comunicacao escola-familia' },
  { area: 'Adaptacoes', school: 'Garantir adaptacoes no ambiente e material didatico', clinic: 'Sugerir e supervisionar adaptacoes especificas' },
  { area: 'Emergencias', school: 'Identificar e acionar quando necessario', clinic: 'Fornecer protocolo de crise e suporte imediato' },
];

const TRAINING_EXERCISES: TrainingExercise[] = [
  { id: 1, title: 'Rotina Visual para Sala de Aula', duration: '15 min',
    description: 'Como criar e usar cartoes de rotina para ajudar alunos com TDAH e TEA',
    steps: ['Identifique as atividades fixas do dia', 'Crie cartoes com imagem e texto simples', 'Coloque em local visivel e acessivel', 'Ensine o aluno a consultar a rotina', 'Revise semanalmente com o aluno'] },
  { id: 2, title: 'Estrategias de Instrucao Direta', duration: '20 min',
    description: 'Como dar instrucoes claras para alunos com dificuldades de processamento',
    steps: ['Use frases curtas e diretas', 'Demonstre antes de pedir que faca', 'Verifique compreensao com pergunta simples', 'Aguarde 5 segundos antes de repetir', 'Elogie a execucao correta'] },
  { id: 3, title: 'Gestao de Transicoes', duration: '10 min',
    description: 'Como reduzir ansiedade e comportamentos durante mudancas de atividade',
    steps: ['Avise 2 minutos antes da transicao', 'Use sinal visual ou sonoro', 'Mantenha sequencia previsivel', 'Ofereca escolha quando possivel', 'Elogie adaptabilidade'] },
  { id: 4, title: 'Inclusao em Trabalho em Grupo', duration: '15 min',
    description: 'Estrategias para incluir alunos com necessidades em trabalhos colaborativos',
    steps: ['Atribua papéis claros e especificos', 'Use的时间 timers para cada parte', 'Inclua habilidades de cada aluno', 'Medie conflitos proativamente', 'Celebre conquistas do grupo'] },
];

@Component({
  selector: 'app-kit-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Kit Docente</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ferramentas para colaboracao clinica-escola</p>
        </div>
        <div class="flex gap-2">
          @for (tab of tabs; track tab.id) {
            <button class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              [class]="activeTab() === tab.id ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'"
              (click)="activeTab.set(tab.id)">
              <span class="material-icons text-[14px] align-middle mr-1">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      @if (activeTab() === 'links') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-slate-900 dark:text-white">Links Enviados</h3>
            <button class="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all"
              (click)="showNewLinkModal.set(true)">
              <span class="material-icons text-[14px] align-middle mr-1">add</span> Novo Link
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Aluno(a)</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Professor(a)</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Escola</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Data</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody>
                @for (link of sentLinks; track link.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">{{ link.studentName }}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ link.teacherName }}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ link.school }}</td>
                    <td class="py-3 px-4 text-slate-500 text-xs">{{ link.sentAt }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-1 rounded-full text-[10px] font-bold"
                        [class]="link.status === 'respondido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                        {{ link.status === 'respondido' ? 'Respondido' : 'Pendente' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      @if (link.status === 'respondido') {
                        <button class="text-primary text-xs font-bold hover:underline" (click)="viewResponse(link)">Ver Resposta</button>
                      } @else {
                        <button class="text-slate-400 text-xs font-bold cursor-not-allowed">Aguardando</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (activeTab() === 'devolutiva') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-primary text-sm">description</span>
            Formulario de Devolutiva para Professores
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Esta e a visao do que o professor vê ao preencher a devolutiva</p>
          <div class="space-y-4 max-w-2xl">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aluno(a)</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" value="Lucas Silva" readonly>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observacoes gerais do aluno em sala</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 resize-none" rows="3"
                placeholder="Descreva o comportamento e participacao do aluno..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Desempenho academico</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 resize-none" rows="2"
                placeholder="Como esta se saindo nas disciplinas..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observacoes comportamentais</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 resize-none" rows="2"
                placeholder="Interacao com colegas, autorregulacao, etc..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nivel de cooperacao</label>
              <div class="flex gap-3">
                @for (level of ['Otima', 'Boa', 'Regular', 'Insuficiente']; track level) {
                  <button class="px-4 py-2 rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 transition-all"
                    [class]="selectedLevel() === level ? 'bg-primary text-on-primary' : 'bg-white dark:bg-slate-800 text-slate-600'"
                    (click)="selectedLevel.set(level)">
                    {{ level }}
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Comentarios adicionais</label>
              <textarea class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 resize-none" rows="2"
                placeholder="Informacoes adicionais relevantes..."></textarea>
            </div>
            <button class="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all">
              <span class="material-icons text-[14px] align-middle mr-1">send</span> Enviar Devolutiva
            </button>
          </div>
        </div>
      }

      @if (activeTab() === 'responsabilidades') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-primary text-sm">balance</span>
            Matriz de Responsabilidades - Escola x Clinica
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase">Area</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase bg-blue-50 dark:bg-blue-900/20">Escola</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold text-slate-500 uppercase bg-emerald-50 dark:bg-emerald-900/20">Clinica</th>
                </tr>
              </thead>
              <tbody>
                @for (item of responsibilities; track item.area) {
                  <tr class="border-b border-slate-100 dark:border-slate-800">
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">{{ item.area }}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-900/10 text-xs">{{ item.school }}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-900/10 text-xs">{{ item.clinic }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (activeTab() === 'treino') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (exercise of trainingExercises; track exercise.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5 hover:ring-primary/50 transition-all">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ exercise.title }}</h4>
                  <p class="text-xs text-slate-500 mt-1">{{ exercise.description }}</p>
                </div>
                <span class="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold shrink-0">{{ exercise.duration }}</span>
              </div>
              <div class="space-y-2">
                @for (step of exercise.steps; track $index) {
                  <div class="flex items-start gap-2">
                    <span class="size-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{{ $index + 1 }}</span>
                    <p class="text-xs text-slate-600 dark:text-slate-400">{{ step }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab() === 'email') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-primary text-sm">email</span>
            Template de Email para Professores
          </h3>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 max-w-2xl">
            <div class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>Prezado(a) <span class="font-bold text-primary">{{ '[NOME DO PROFESSOR]' }}</span>,</p>
              <p>Espero que esteja bem. Escrevo para compartilhar informacoes sobre o acompanhamento psicopedagogico de <span class="font-bold">{{ '[NOME DO ALUNO]' }}</span>.</p>
              <p>Apos avaliacao realizada em <span class="font-bold">{{ '[DATA]' }}</span>, identificamos o seguinte perfil:</p>
              <ul class="list-disc list-inside space-y-1 ml-4 text-xs">
                <li>Perfil cognitivo: <span class="font-bold">{{ '[DESCRICAO]' }}</span></li>
                <li>Pontos fortes: <span class="font-bold">{{ '[PONTOS FORTES]' }}</span></li>
                <li>Areas de atencao: <span class="font-bold">{{ '[AREAS DE ATENCAO]' }}</span></li>
              </ul>
              <p>As recomendacoes para a escola sao:</p>
              <ul class="list-disc list-inside space-y-1 ml-4 text-xs">
                <li>{{ '[RECOMENDACAO 1]' }}</li>
                <li>{{ '[RECOMENDACAO 2]' }}</li>
                <li>{{ '[RECOMENDACAO 3]' }}</li>
              </ul>
              <p>Fico a disposicao para esclarecimentos. Por favor, preencha a devolutiva online para sincronizarmos as informacoes.</p>
              <p>Atenciosamente,<br><span class="font-bold">{{ '[SEU NOME]' }}</span><br>Psicopedagoga</p>
            </div>
          </div>
          <button class="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
            <span class="material-icons text-[14px] align-middle mr-1">content_copy</span> Copar Template
          </button>
        </div>
      }
    </div>

    @if (showResponseModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showResponseModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white">Resposta do Professor</h3>
            <button class="p-2 text-slate-500" (click)="showResponseModal.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Aluno(a)</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedResponse()?.studentName }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Observacoes</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ selectedResponse()?.response?.observations }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Desempenho Academico</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ selectedResponse()?.response?.academicPerformance }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Comportamento</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ selectedResponse()?.response?.behavioralNotes }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Nivel de Cooperacao</p>
              <span class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">{{ selectedResponse()?.response?.cooperationLevel }}</span>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Comentarios Adicionais</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ selectedResponse()?.response?.additionalComments }}</p>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showNewLinkModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showNewLinkModal.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white">Gerar Link para Professor</h3>
            <button class="p-2 text-slate-500" (click)="showNewLinkModal.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Aluno</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" placeholder="Nome completo">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Professor</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" placeholder="Prof. Nome">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Escola</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" placeholder="EMEF Nome">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email do Professor</label>
              <input class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700" type="email" placeholder="professor@escola.edu.br">
            </div>
            <button class="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all"
              (click)="generateLink()">
              <span class="material-icons text-[14px] align-middle mr-1">link</span> Gerar e Enviar Link
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class KitDocenteComponent {
  tabs = [
    { id: 'links', label: 'Links', icon: 'link' },
    { id: 'devolutiva', label: 'Devolutiva', icon: 'description' },
    { id: 'responsabilidades', label: 'Responsabilidades', icon: 'balance' },
    { id: 'treino', label: 'Treino Rapido', icon: 'school' },
    { id: 'email', label: 'Email', icon: 'email' },
  ];

  activeTab = signal('links');
  sentLinks = [...SENT_LINKS];
  responsibilities = [...RESPONSIBILITIES];
  trainingExercises = [...TRAINING_EXERCISES];

  showResponseModal = signal(false);
  showNewLinkModal = signal(false);
  selectedResponse = signal<SentLink | null>(null);
  selectedLevel = signal('');

  viewResponse(link: SentLink) {
    this.selectedResponse.set(link);
    this.showResponseModal.set(true);
  }

  generateLink() {
    this.showNewLinkModal.set(false);
  }
}
