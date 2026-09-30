import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { replaceDocPlaceholders } from '@core/data/doc-templates.data';

interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  htmlContent: string;
}

@Component({
  selector: 'app-acordos',
  standalone: true,
  imports: [CommonModule, FormsModule, ClinicalDocEditorComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Acordos & Contratos Profissionais</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Calculadora de honorários, propostas comerciais e contratos timbrados em formato A4</p>
        </div>

        @if (editorActive()) {
          <button (click)="closeEditor()"
            class="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-95">
            <span class="material-icons text-sm">arrow_back</span>
            Voltar aos Modelos
          </button>
        }
      </div>

      <!-- If Editor is Open, show full ClinicalDocEditor -->
      @if (editorActive()) {
        <div class="space-y-4 animate-in">
          <!-- Editor Context Bar -->
          <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span class="material-icons text-xl">gavel</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ activeDocTitle() }}</h3>
                <p class="text-xs text-slate-500">Editando termo oficial com suporte a variáveis automáticas e assinatura</p>
              </div>
            </div>

            <!-- Patient Selector to fill placeholders -->
            <div class="flex items-center gap-2 w-full md:w-auto">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Preencher com Paciente:</label>
              <select [(ngModel)]="selectedPatientId" (change)="onPatientSelect()"
                class="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-semibold ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary">
                <option value="">Selecione para autopreencher</option>
                @for (p of patients(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- The A4 Clinical Editor -->
          <app-clinical-doc-editor
            [content]="editorContent"
            [paciente]="selectedPatient()"
            [clinicName]="clinicName()"
            [clinicLogo]="clinicLogo()"
            [professionalName]="professionalName()"
            (contentChange)="onEditorContentChange($event)">
          </app-clinical-doc-editor>
        </div>
      } @else {
        <!-- Navigation Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          @for (tab of tabs; track tab.id) {
            <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
              [class]="activeTab() === tab.id
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
              <span class="material-icons text-[16px]">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- TAB: CALCULADORA -->
        @if (activeTab() === 'calculadora') {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-icons text-primary">calculate</span>
                Calculadora de Valor Hora & Precificação
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custo Operacional Mensal (R$)</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="calc.custoMensal" placeholder="Ex: 8000">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Horas Trabalhadas por Semana</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="calc.horasSemana" placeholder="Ex: 40">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dias Úteis no Mês</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="calc.diasUteis" placeholder="Ex: 22">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Margem de Lucro Desejada (%)</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="calc.margem" placeholder="Ex: 30">
                </div>
              </div>
              <button (click)="calcularValorHora()"
                class="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
                <span class="material-icons text-[18px]">calculate</span>
                Calcular Precificação
              </button>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
              <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-icons text-emerald-500">analytics</span>
                Resultado da Precificação
              </h2>
              @if (resultadoCalc()) {
                <div class="space-y-4">
                  <div class="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                    <p class="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Valor da Sessão Recomendado</p>
                    <p class="text-3xl font-black text-primary">R$ {{ resultadoCalc()!.valorHora | number:'1.2-2' }}</p>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-500 uppercase">Horas / Mês</p>
                      <p class="text-lg font-bold text-slate-900 dark:text-white">{{ resultadoCalc()!.horasMes }}</p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-500 uppercase">Custo / Hora</p>
                      <p class="text-lg font-bold text-slate-900 dark:text-white">R$ {{ resultadoCalc()!.custoHora | number:'1.2-2' }}</p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-500 uppercase">Faturamento Projetado</p>
                      <p class="text-lg font-bold text-emerald-600">R$ {{ resultadoCalc()!.receitaMes | number:'1.2-2' }}</p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-500 uppercase">Lucro Líquido</p>
                      <p class="text-lg font-bold text-emerald-600">R$ {{ resultadoCalc()!.lucroMes | number:'1.2-2' }}</p>
                    </div>
                  </div>
                  <button (click)="useCalculatedValueInProposal()"
                    class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all">
                    Usar este valor na Proposta Comercial →
                  </button>
                </div>
              } @else {
                <div class="text-center py-12 text-slate-400">
                  <span class="material-icons text-5xl">calculate</span>
                  <p class="mt-2 text-sm">Defina os parâmetros ao lado e clique em Calcular</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB: CONTRATOS & TERMOS -->
        @if (activeTab() === 'contratos') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (tpl of templates; track tpl.id) {
              <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 flex flex-col justify-between hover:ring-primary/40 hover:shadow-lg transition-all">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {{ tpl.category }}
                    </span>
                    <span class="material-icons text-slate-300 dark:text-slate-600 text-lg">gavel</span>
                  </div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-base mb-1.5">{{ tpl.title }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{{ tpl.description }}</p>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button (click)="openTemplateInEditor(tpl)"
                    class="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95">
                    <span class="material-icons text-sm">edit_note</span>
                    Abrir no Editor A4
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- TAB: OBJEÇÕES -->
        @if (activeTab() === 'objecoes') {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-amber-500">tips_and_updates</span>
              Manejo de Objeções de Preço e Valor Terapêutico
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (obj of objecoes; track obj.objecao) {
                <div class="p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <p class="font-bold text-xs text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <span class="material-icons text-amber-500 text-sm">chat_bubble_outline</span>
                    &#8220;{{ obj.objecao }}&#8221;
                  </p>
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{{ obj.resposta }}</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB: PROPOSTA COMERCIAL -->
        @if (activeTab() === 'proposta') {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 space-y-4">
              <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-icons text-primary">description</span>
                Gerar Proposta Comercial de Tratamento
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vincular Paciente Cadastrado</label>
                  <select [(ngModel)]="selectedPatientId" (change)="onProposalPatientSelect()"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Selecione ou digite abaixo manualmente</option>
                    @for (p of patients(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Paciente</label>
                  <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="proposta.paciente" placeholder="Ex: Arthur Silva">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Responsável Legal</label>
                  <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="proposta.responsavel" placeholder="Ex: Mariana Silva">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nº de Sessões</label>
                    <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                      [(ngModel)]="proposta.sessoes">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor/Sessão (R$)</label>
                    <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                      [(ngModel)]="proposta.valorSessao">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forma de Pagamento</label>
                  <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="proposta.pagamento">
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="credito">Cartão de Crédito</option>
                    <option value="transferencia">Transferência Bancária</option>
                    <option value="parcelado">Parcelado Mensalmente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações / Condutas Especiais</label>
                  <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none"
                    rows="3" [(ngModel)]="proposta.observacoes" placeholder="Informações adicionais e acordos de remarcação..."></textarea>
                </div>
              </div>
              <button (click)="openProposalInEditor()"
                class="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
                <span class="material-icons text-[18px]">edit_document</span>
                Abrir Proposta no Editor A4 Timbrado
              </button>
            </div>

            <!-- Preview Card -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="material-icons text-emerald-500">preview</span>
                  Resumo da Proposta
                </h2>
                <div class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-3">
                  <div class="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <p class="font-black text-primary text-base">PROPOSTA COMERCIAL TERAPÊUTICA</p>
                    <p class="text-[10px] text-slate-500">{{ clinicName() }}</p>
                  </div>
                  <p><span class="font-bold text-slate-700 dark:text-slate-300">Paciente:</span> {{ proposta.paciente || '—' }}</p>
                  <p><span class="font-bold text-slate-700 dark:text-slate-300">Responsável:</span> {{ proposta.responsavel || '—' }}</p>
                  <div class="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <p><span class="font-bold">Ciclo:</span> {{ proposta.sessoes || 0 }} sessões</p>
                    <p><span class="font-bold">Investimento por sessão:</span> R$ {{ proposta.valorSessao || 0 | number:'1.2-2' }}</p>
                    <p class="text-base font-black text-primary mt-2">Investimento Total: R$ {{ (proposta.sessoes || 0) * (proposta.valorSessao || 0) | number:'1.2-2' }}</p>
                    <p><span class="font-bold">Pagamento:</span> {{ getPagamentoLabel(proposta.pagamento) }}</p>
                  </div>
                  @if (proposta.observacoes) {
                    <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p class="font-bold text-slate-700 dark:text-slate-300">Observações:</p>
                      <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{{ proposta.observacoes }}</p>
                    </div>
                  }
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button (click)="openProposalInEditor()"
                  class="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <span class="material-icons text-sm text-red-400">picture_as_pdf</span>
                  Personalizar e Exportar PDF A4 Timbrado
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AcordosComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  activeTab = signal('calculadora');
  editorActive = signal(false);
  activeDocTitle = signal('');
  editorContent = '';

  patients = signal<any[]>([]);
  selectedPatientId = '';
  selectedPatient = signal<any>(null);

  clinicName = computed(() => this.auth.tenant()?.name || 'EduPsych Pro');
  clinicLogo = computed(() => this.auth.tenant()?.logoUrl || '');
  professionalName = computed(() => this.auth.user()?.name || 'Neuropsicopedagogo(a)');

  tabs = [
    { id: 'calculadora', label: 'Calculadora', icon: 'calculate' },
    { id: 'contratos', label: 'Contratos & Termos', icon: 'gavel' },
    { id: 'proposta', label: 'Proposta Comercial', icon: 'description' },
    { id: 'objecoes', label: 'Objeções de Preço', icon: 'tips_and_updates' },
  ];

  calc = { custoMensal: 8000, horasSemana: 40, diasUteis: 22, margem: 30 };
  resultadoCalc = signal<{ valorHora: number; custoHora: number; horasMes: number; receitaMes: number; lucroMes: number } | null>(null);

  proposta = { paciente: '', responsavel: '', sessoes: 12, valorSessao: 150, pagamento: 'pix', observacoes: '' };

  templates: ContractTemplate[] = [
    {
      id: 't1',
      title: 'Contrato de Prestação de Serviços Clínicos',
      description: 'Contrato completo para atendimento clínico psicopedagógico individual com cláusulas de faltas, sigilo e pagamentos.',
      category: 'Atendimento Clínico',
      htmlContent: `
        <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOPEDAGÓGICOS</h2>
        <br>
        <p><strong>CONTRATADA:</strong> {nome_profissional}, neuropsicopedagogo(a) atuante em {clinica}.</p>
        <p><strong>CONTRATANTE:</strong> {nome_responsavel}, responsável legal pelo(a) menor {nome_paciente}, nascido(a) em {data_nascimento}.</p>
        <br>
        <h3>CLÁUSULA 1ª - DO OBJETO</h3>
        <p>O presente instrumento tem como objeto a prestação de serviços de avaliação e intervenção neuropsicopedagógica clínica, visando a estimulação das funções cognitivas, executivas e processos de aprendizagem do(a) estudante.</p>
        <br>
        <h3>CLÁUSULA 2ª - DA FREQUÊNCIA E DURAÇÃO</h3>
        <p>As sessões serão realizadas com frequência semanal, com duração estimada de 50 (cinquenta) minutos cada, em dia e horário previamente pactuados.</p>
        <br>
        <h3>CLÁUSULA 3ª - DOS HONORÁRIOS E PAGAMENTO</h3>
        <p>O valor de cada sessão é fixado em <strong>R$ 150,00</strong>, a ser quitado mensalmente até o 5º dia útil do mês subsequente via PIX ou transferência bancária.</p>
        <br>
        <h3>CLÁUSULA 4ª - DAS FALTAS E REMARCAÇÕES</h3>
        <p>Faltas comunicadas com antecedência mínima de 24 (vinte e quatro) horas poderão ser repostas conforme disponibilidade de agenda. Faltas sem aviso prévio serão computadas normalmente em razão da reserva de horário do profissional.</p>
        <br>
        <h3>CLÁUSULA 5ª - DO SIGILO E ÉTICA PROFISSIONAL</h3>
        <p>Todas as informações prestadas durante os atendimentos gozam de sigilo profissional ético e proteção de dados em conformidade com a LGPD (Lei nº 13.709/2018).</p>
        <br>
        <p>Por estarem justos e acordados, firmam as partes o presente instrumento.</p>
        <br>
        <div style="margin-top: 30px; display: flex; justify-content: space-around; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; width: 40%; padding-top: 6px; font-size: 11px;">
            <strong>{nome_profissional}</strong><br>Neuropsicopedagoga Responsável
          </div>
          <div style="border-top: 1px solid #94a3b8; width: 40%; padding-top: 6px; font-size: 11px;">
            <strong>{nome_responsavel}</strong><br>Contratante / Responsável Legal
          </div>
        </div>
      `
    },
    {
      id: 't2',
      title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
      description: 'Autorização expressa dos responsáveis para avaliação e intervenção neuropsicopedagógica.',
      category: 'Autorização',
      htmlContent: `
        <h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)</h2>
        <br>
        <p>Eu, <strong>{nome_responsavel}</strong>, portador(a) do documento de identidade e responsável legal pelo(a) menor <strong>{nome_paciente}</strong>, autorizo a realização da Avaliação e Intervenção Neuropsicopedagógica Clínica pelo(a) profissional {nome_profissional}.</p>
        <br>
        <h3>1. PROCEDIMENTOS AUTORIZADOS</h3>
        <ul>
          <li>Aplicação de testes de rastreio cognitivo, baterias de atenção e escalas neuropsicopedagógicas.</li>
          <li>Observação lúdica participativa e registro de evolução de aprendizagem.</li>
          <li>Comunicação técnica e alinhamento com a equipe pedagógica do(a) {escola} quando necessário.</li>
        </ul>
        <br>
        <h3>2. CONFIDENCIALIDADE E DEVOLUTIVA</h3>
        <p>Declaro estar ciente de que ao término da avaliação será realizada sessão de devolutiva presencial acompanhada de relatório técnico descritivo, mantendo-se estrito sigilo ético.</p>
        <br>
        <div style="margin-top: 30px; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; width: 60%; margin: 0 auto; padding-top: 6px; font-size: 11px;">
            <strong>{nome_responsavel}</strong><br>Assinatura do(a) Responsável Legal
          </div>
        </div>
      `
    },
    {
      id: 't3',
      title: 'Contrato de Parceria e Assessoria Escolar',
      description: 'Termo de prestação de serviços de orientação psicopedagógica e elaboração de PEI para instituições de ensino.',
      category: 'Institucional / Escolar',
      htmlContent: `
        <h2>CONTRATO DE ASSESSORIA PSICOPEDAGÓGICA ESCOLAR</h2>
        <br>
        <p><strong>CONTRATADA:</strong> {nome_profissional} | <strong>CONTRATADA:</strong> Instituição de Ensino {escola}</p>
        <br>
        <h3>OBJETO DO CONTRATO</h3>
        <p>Prestação de serviços de assessoria e formação pedagógica contínua, incluindo elaboração de Planos Educacionais Individualizados (PEI), mediação de adaptações curriculares e orientação de docentes.</p>
        <br>
        <h3>DAS ATIVIDADES PREVISTAS</h3>
        <ol>
          <li>Visitas técnicas quinzenais e reuniões de alinhamento com a coordenação pedagógica.</li>
          <li>Supervisão e orientação aos profissionais de apoio / mediadores escolares.</li>
          <li>Emissão de pareceres técnicos sobre acomodações avaliativas para estudantes neurodivergentes.</li>
        </ol>
        <br>
        <div style="margin-top: 30px; display: flex; justify-content: space-around; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; width: 40%; padding-top: 6px; font-size: 11px;">
            <strong>{nome_profissional}</strong><br>Assessora Psicopedagógica
          </div>
          <div style="border-top: 1px solid #94a3b8; width: 40%; padding-top: 6px; font-size: 11px;">
            <strong>Direção Pedagógica</strong><br>{escola}
          </div>
        </div>
      `
    },
    {
      id: 't4',
      title: 'Termo de Sigilo, Privacidade e Tratamento de Dados (LGPD)',
      description: 'Compromisso institucional de proteção aos dados sensíveis do paciente conforme a LGPD.',
      category: 'Compliance / LGPD',
      htmlContent: `
        <h2>TERMO DE COMPROMISSO DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)</h2>
        <br>
        <p>O consultório <strong>{clinica}</strong>, sob responsabilidade técnica de <strong>{nome_profissional}</strong>, declara formalmente a adoção de rígidas medidas técnicas de segurança da informação e sigilo no tratamento dos dados pessoais e sensíveis do(a) paciente <strong>{nome_paciente}</strong>.</p>
        <br>
        <h3>FINALIDADES DO TRATAMENTO</h3>
        <p>Os dados coletados destinam-se exclusivamente ao prontuário clínico, acompanhamento da aprendizagem, faturamento de honorários e cumprimento de obrigações legais da saúde e educação.</p>
        <br>
        <p>Em hipótese alguma tais informações serão compartilhadas com terceiros sem prévio e expresso consentimento formal dos responsáveis.</p>
      `
    }
  ];

  objecoes = [
    { objecao: 'Muito caro, não posso pagar agora', resposta: 'Entendo sua preocupação orçamentária. O investimento na intervenção psicopedagógica na infância previne prejuízos cumulativos na alfabetização e autoestima. Oferecemos opções facilitadas em pacotes mensais e adequação de cronograma.' },
    { objecao: 'Vou procurar alguém mais barato', resposta: 'A qualificação técnica e o uso de instrumentos clínicos padronizados garantem resultados mais rápidos e seguros, evitando perda de tempo crucial na janela de neuroplasticidade da criança.' },
    { objecao: 'Preciso pensar e conversar em família', resposta: 'Com certeza! É muito importante que todos estejam alinhados. Posso enviar o resumo da proposta comercial para vocês analisarem com calma os benefícios e o plano de metas.' },
    { objecao: 'Acho que a escola deveria resolver isso', resposta: 'A escola atua no coletivo; a psicopedagogia clínica investiga individualmente como a criança processa, memoriza e aprende, criando as pontes necessárias para que ela brilhe também em sala de aula.' }
  ];

  ngOnInit() {
    this.api.get('/pacientes').subscribe((res: any) => {
      this.patients.set(res.data || []);
    });
  }

  onPatientSelect() {
    const found = this.patients().find(p => p.id === this.selectedPatientId);
    this.selectedPatient.set(found || null);
    if (found) {
      this.editorContent = replaceDocPlaceholders(this.editorContent, found);
      this.toast.info(`Dados de ${found.name} aplicados no documento.`);
    }
  }

  onProposalPatientSelect() {
    const found = this.patients().find(p => p.id === this.selectedPatientId);
    if (found) {
      this.proposta.paciente = found.name;
      this.proposta.responsavel = found.responsavelNome || found.guardianName || '';
      this.selectedPatient.set(found);
    }
  }

  calcularValorHora() {
    const horasMes = this.calc.horasSemana * (this.calc.diasUteis / 5);
    const custoHora = this.calc.custoMensal / horasMes;
    const valorHora = custoHora * (1 + this.calc.margem / 100);
    const receitaMes = valorHora * horasMes;
    const lucroMes = receitaMes - this.calc.custoMensal;
    this.resultadoCalc.set({ valorHora, custoHora, horasMes, receitaMes, lucroMes });
  }

  useCalculatedValueInProposal() {
    if (this.resultadoCalc()) {
      this.proposta.valorSessao = Math.round(this.resultadoCalc()!.valorHora);
      this.activeTab.set('proposta');
      this.toast.success(`Valor de R$ ${this.proposta.valorSessao},00 aplicado na proposta.`);
    }
  }

  openTemplateInEditor(tpl: ContractTemplate) {
    this.activeDocTitle.set(tpl.title);
    let content = tpl.htmlContent;
    if (this.selectedPatient()) {
      content = replaceDocPlaceholders(content, this.selectedPatient());
    }
    this.editorContent = content;
    this.editorActive.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openProposalInEditor() {
    const total = (this.proposta.sessoes || 0) * (this.proposta.valorSessao || 0);
    this.activeDocTitle.set(`Proposta Comercial - ${this.proposta.paciente || 'Paciente'}`);

    const content = `
      <h2>PROPOSTA COMERCIAL DE ACOMPANHAMENTO PSICOPEDAGÓGICO</h2>
      <br>
      <p><strong>À Família e Responsável:</strong> ${this.proposta.responsavel || '{nome_responsavel}'}</p>
      <p><strong>Estudante:</strong> ${this.proposta.paciente || '{nome_paciente}'}</p>
      <p><strong>Consultório:</strong> {clinica} | <strong>Profissional:</strong> {nome_profissional}</p>
      <br>
      <h3>1. APRESENTAÇÃO DO PROGRAMA DE INTERVENÇÃO</h3>
      <p>Apresentamos a proposta para o ciclo de acompanhamento neuropsicopedagógico individualizado, voltado ao desenvolvimento de habilidades cognitivas, funções executivas e consolidação da aprendizagem acadêmica.</p>
      <br>
      <h3>2. CONDIÇÕES FINANCEIRAS & CRONOGRAMA</h3>
      <div style="margin: 14px 0; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #475569;">Quantidade de Sessões Previstas:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">${this.proposta.sessoes || 0} sessões</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569;">Investimento por Atendimento:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">R$ ${(this.proposta.valorSessao || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569;">Forma de Pagamento:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">${this.getPagamentoLabel(this.proposta.pagamento)}</td>
          </tr>
          <tr style="border-top: 2px solid #007F80;">
            <td style="padding: 10px 0 0 0; font-weight: bold; font-size: 14px; color: #0f172a;">INVESTIMENTO TOTAL DO PACOTE:</td>
            <td style="padding: 10px 0 0 0; font-weight: 900; font-size: 16px; color: #007F80; text-align: right;">R$ ${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <br>
      <h3>3. ITENS INCLUSOS NESTA PROPOSTA</h3>
      <ul>
        <li>Sessões individuais semanais de 50 minutos com materiais especializados.</li>
        <li>Emissão de relatórios e devolutivas periódicas à família.</li>
        <li>Contato e articulação pedagógica com os professores da escola.</li>
      </ul>
      ${this.proposta.observacoes ? `<br><h3>4. OBSERVAÇÕES ADICIONAIS</h3><p>${this.proposta.observacoes}</p>` : ''}
      <br>
      <p style="font-size: 11px; color: #64748b;">Esta proposta possui validade de 15 dias a contar de sua emissão.</p>
    `;

    this.editorContent = this.selectedPatient() ? replaceDocPlaceholders(content, this.selectedPatient()) : content;
    this.editorActive.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeEditor() {
    this.editorActive.set(false);
  }

  onEditorContentChange(newHtml: string) {
    this.editorContent = newHtml;
  }

  getPagamentoLabel(pagamento: string): string {
    const labels: Record<string, string> = {
      pix: 'PIX',
      boleto: 'Boleto Bancário',
      credito: 'Cartão de Crédito',
      transferencia: 'Transferência Bancária',
      parcelado: 'Parcelado Mensalmente'
    };
    return labels[pagamento] || pagamento;
  }
}
