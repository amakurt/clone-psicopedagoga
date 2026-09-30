import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { EncaminhamentoService } from '../services/encaminhamento.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { DOC_TEMPLATES, replaceDocPlaceholders } from '@core/data/doc-templates.data';

@Component({
  selector: 'app-encaminhamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClinicalDocEditorComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/encaminhamentos" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all shrink-0">
            <span class="material-icons text-slate-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ (isEdit || editingId()) ? 'Editar' : 'Novo' }} Encaminhamento</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                [class]="form.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : form.status === 'ACEITO' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'">
                {{ form.status }}
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Encaminhamento clínico oficial para especialistas com timbrado A4</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/app/encaminhamentos" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Voltar
          </a>
          <button (click)="save()" [disabled]="saving() || !form.pacienteId"
            class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
            <span class="material-icons text-[18px]">save</span>
            {{ saving() ? 'Salvando...' : 'Salvar Encaminhamento' }}
          </button>
        </div>
      </div>

      <!-- Controls & Recipients Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Paciente -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente *</label>
            <select [(ngModel)]="form.pacienteId" (change)="onPatientChange()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="">Selecione o paciente</option>
              @for (p of pacientes(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          <!-- Profissional Interno (opcional) -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destinatário Interno</label>
            <select [(ngModel)]="form.paraUserId" (change)="onInternalUserSelect()"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="">Especialista Externo / Outro</option>
              @for (m of members(); track m.id) {
                <option [value]="m.id">{{ m.name }} ({{ m.role }})</option>
              }
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select [(ngModel)]="form.status"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white">
              <option value="PENDENTE">Pendente</option>
              <option value="ACEITO">Aceito</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Quick Referral Templates -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <span class="material-icons text-sm">medical_services</span> Modelos de Encaminhamento:
        </span>
        <button type="button" (click)="applyReferralTemplate('neuropediatria')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🧠 Neuropediatria / Neurologia
        </button>
        <button type="button" (click)="applyReferralTemplate('fonoaudiologia')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🗣️ Fonoaudiologia (DPAC / Linguagem)
        </button>
        <button type="button" (click)="applyReferralTemplate('terapia_ocupacional')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🎨 Terapia Ocupacional (Sensorial)
        </button>
        <button type="button" (click)="applyReferralTemplate('psiquiatria')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🩺 Psiquiatria Infantil
        </button>
        <button type="button" (click)="applyReferralTemplate('escola')"
          class="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:border-primary/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0">
          🏫 Equipe Escolar / Coordenação
        </button>
      </div>

      <!-- Clinical A4 Document Editor -->
      <app-clinical-doc-editor
        [content]="documentContent"
        [paciente]="selectedPatient()"
        [clinicName]="clinicName()"
        [clinicLogo]="clinicLogo()"
        [professionalName]="getCurrentUserName()"
        (contentChange)="onContentChange($event)">
      </app-clinical-doc-editor>

      <!-- Registros Anteriores do Paciente -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span class="material-icons text-primary text-xl">history</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Encaminhamentos Anteriores</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ records().length }} encaminhamento(s) de {{ getPatientName() }}</p>
            </div>
          </div>
          @if (editingId()) {
            <button (click)="resetForm()" class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs transition-all">
              <span class="material-icons text-[16px]">add</span>
              Novo Encaminhamento
            </button>
          }
        </div>

        @if (records().length === 0) {
          <div class="p-8 text-center text-slate-400 text-sm">
            Nenhum encaminhamento registrado para este paciente.
          </div>
        } @else {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (r of records(); track r.id) {
              <div class="px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span class="material-icons text-slate-600 dark:text-slate-300 text-lg">outgoing_mail</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {{ stripHtml(r.motivo) | slice:0:70 }}
                    </h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      {{ r.createdAt | date:'dd/MM/yyyy' }} · De: {{ r.deUser?.name || '—' }} → Para: {{ r.paraUser?.name || 'Especialista Externo' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase"
                    [class]="r.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : r.status === 'ACEITO' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'">
                    {{ r.status }}
                  </span>
                  <button (click)="editRecord(r)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400" title="Editar">
                    <span class="material-icons text-[18px]">edit</span>
                  </button>
                  <button (click)="deleteRecord(r)" class="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl" title="Excluir">
                    <span class="material-icons text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class EncaminhamentoFormComponent implements OnInit {
  private service = inject(EncaminhamentoService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  members = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');
  selectedPatient = signal<any>(null);

  clinicName = computed(() => this.auth.tenant()?.name || 'EduPsych Pro');
  clinicLogo = computed(() => this.auth.tenant()?.logoUrl || '');

  documentContent = '';

  form: any = {
    pacienteId: '',
    deUserId: '',
    paraUserId: '',
    motivo: '',
    resposta: '',
    status: 'PENDENTE'
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;
    this.form.deUserId = this.auth.user()?.id || '';

    this.api.get('/pacientes').subscribe((res: any) => {
      this.pacientes.set(res.data || []);
      if (this.form.pacienteId) {
        this.updateSelectedPatient();
      }
    });

    this.api.get('/users/members').subscribe((res: any) => {
      this.members.set(res.data || []);
    });

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = res;
        this.documentContent = res.motivo || '';
        this.updateSelectedPatient();
        this.loadRecords();
      });
    } else {
      this.applyReferralTemplate('neuropediatria');
    }
  }

  getCurrentUserName(): string {
    return this.auth.user()?.name || 'Neuropsicopedagogo(a)';
  }

  getPatientName(): string {
    const p = this.selectedPatient();
    return p?.name || '-';
  }

  onPatientChange() {
    this.updateSelectedPatient();
    if (this.selectedPatient()) {
      this.documentContent = replaceDocPlaceholders(this.documentContent, this.selectedPatient());
      this.loadRecords();
    }
  }

  private updateSelectedPatient() {
    const found = this.pacientes().find(p => p.id === this.form.pacienteId);
    this.selectedPatient.set(found || null);
  }

  onInternalUserSelect() {
    const user = this.members().find(m => m.id === this.form.paraUserId);
    if (user) {
      this.toast.info(`Destinatário definido: ${user.name}`);
    }
  }

  onContentChange(newHtml: string) {
    this.documentContent = newHtml;
    this.form.motivo = newHtml;
  }

  applyReferralTemplate(type: 'neuropediatria' | 'fonoaudiologia' | 'terapia_ocupacional' | 'psiquiatria' | 'escola') {
    const templates: Record<string, string> = {
      neuropediatria: `
        <h2>ENCAMINHAMENTO CLÍNICO INTERDISCIPLINAR</h2>
        <br>
        <p><strong>Ao(À) Ilustríssimo(a) Dr(a).:</strong> Médico(a) Neuropediatra / Neurologista</p>
        <p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade} | <strong>Data de Nasc.:</strong> {data_nascimento}</p>
        <p><strong>Responsável:</strong> {nome_responsavel} | <strong>Telefone:</strong> {telefone_responsavel}</p>
        <br>
        <h3>1. MOTIVO DO ENCAMINHAMENTO</h3>
        <p>Encaminhamos o(a) paciente para avaliação e parecer da Neuropediatria com fins de investigação diagnóstica complementar para transtornos do neurodesenvolvimento (TEA / TDAH / Transtornos Específicos de Aprendizagem).</p>
        <br>
        <h3>2. MANIFESTAÇÕES CLÍNICAS E PEDAGÓGICAS OBSERVADAS</h3>
        <ul>
          <li>Oscilação de foco e sustentação atencional em atividades acadêmicas estruturadas.</li>
          <li>Dificuldade de planejamento executivo e organização motora.</li>
          <li>Comportamentos de sobrecarga sensorial e desregulação em ambientes ruidosos.</li>
          <li>Desempenho em leitura e escrita abaixo do esperado para o ciclo escolar.</li>
        </ul>
        <br>
        <h3>3. INSTRUMENTOS APLICADOS NO CONSULTÓRIO</h3>
        <p>Foram realizadas sessões de observação clínica lúdica, aplicação de escalas de rastreio neuropsicopedagógico e inventário comportamental.</p>
        <br>
        <h3>4. SOLICITAÇÃO AO ESPECIALISTA</h3>
        <p>Solicitamos, respeitosamente, avaliação médica especializada e orientações medicamentosas ou terapêuticas pertinentes, colocando-nos à total disposição para troca interdisciplinar em prol do estudante.</p>
      `,
      fonoaudiologia: `
        <h2>ENCAMINHAMENTO PARA AVALIAÇÃO FONOAUDIOLÓGICA</h2>
        <br>
        <p><strong>Ao(À) Colega Especialista em Fonoaudiologia:</strong></p>
        <p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
        <p><strong>Responsável:</strong> {nome_responsavel}</p>
        <br>
        <h3>1. MOTIVO DO ENCAMINHAMENTO</h3>
        <p>Solicitamos avaliação da via auditiva central (Processamento Auditivo Central - DPAC) e das habilidades de consciência fonológica, articulação e linguagem oral/expressiva.</p>
        <br>
        <h3>2. ACHADOS EM CONSULTÓRIO</h3>
        <ul>
          <li>Trocas fonológicas recorrentes na escrita e leitura (surdas/sonoras).</li>
          <li>Dificuldade de compreensão de comandos orais sequenciais com mais de duas instruções.</li>
          <li>Queixa de desatenção auditiva em ambientes com ruído competitivo em sala de aula.</li>
        </ul>
        <br>
        <p>Aguardamos devolutiva e contrarreferência para alinhamento dos estímulos psicopedagógicos e fonoaudiológicos.</p>
      `,
      terapia_ocupacional: `
        <h2>ENCAMINHAMENTO PARA TERAPIA OCUPACIONAL</h2>
        <br>
        <p><strong>À Especialista em Terapia Ocupacional / Integração Sensorial:</strong></p>
        <p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
        <br>
        <h3>1. JUSTIFICATIVA CLÍNICA</h3>
        <p>Encaminhamos para avaliação do perfil sensorial (sensibilidade tátil/proprioceptiva/vestibular), tônus postural e desenvolvimento da coordenação motora fina (preensão de lápis e práxis grafomotora).</p>
        <br>
        <h3>2. DEMANDAS OBSERVADAS</h3>
        <ul>
          <li>Fadiga muscular rápida durante o registro em caderno.</li>
          <li>Busca sensorial por movimento ou esquiva ao toque de materiais com texturas específicas.</li>
          <li>Desorganização espacial na folha e assimetria no traçado das letras.</li>
        </ul>
        <br>
        <p>Contamos com sua avaliação especializada para suporte às adaptações de materiais escolares e rotina diária.</p>
      `,
      psiquiatria: `
        <h2>ENCAMINHAMENTO PARA PSIQUIATRIA DA INFÂNCIA E ADOLESCÊNCIA</h2>
        <br>
        <p><strong>Ao(À) Médico(a) Psiquiatra da Infância e Adolescência:</strong></p>
        <p><strong>Paciente:</strong> {nome_paciente} | <strong>Idade:</strong> {idade}</p>
        <p><strong>Responsável:</strong> {nome_responsavel}</p>
        <br>
        <h3>1. SÍNTESE CLÍNICA</h3>
        <p>Encaminhamos o(a) paciente para avaliação psiquiátrica em virtude de oscilações acentuadas de humor, sintomas de ansiedade de desempenho e episódios de rigidez comportamental que impactam a aprendizagem.</p>
        <br>
        <h3>2. HISTÓRICO</h3>
        <p>Durante os atendimentos psicopedagógicos observou-se baixa tolerância à frustração, prejuízo na autorregulação emocional e relatos frequentes de sofrimento psíquico relacionados à escola.</p>
        <br>
        <p>Solicitamos conduta médica e parecer para acompanhamento multidisciplinar integrado.</p>
      `,
      escola: `
        <h2>COMUNICAÇÃO E RECOMENDAÇÕES PARA A EQUIPE ESCOLAR</h2>
        <br>
        <p><strong>À Equipe de Gestão Pedagógica, Orientação e Professores:</strong></p>
        <p><strong>Estudante:</strong> {nome_paciente} | <strong>Ano/Série:</strong> {serie} | <strong>Escola:</strong> {escola}</p>
        <br>
        <h3>1. APRESENTAÇÃO</h3>
        <p>Vimos compartilhar recomendações psicopedagógicas estruturadas para apoiar o estudante em sala de aula, promovendo acessibilidade curricular e bem-estar acadêmico.</p>
        <br>
        <h3>2. ESTRATÉGIAS PRIORITÁRIAS</h3>
        <ul>
          <li>Segmentação de enunciados longos e verificação de entendimento individualizada.</li>
          <li>Tempo adicional de 30% para a execução de avaliações escritas.</li>
          <li>Uso prioritário de apoio visual e pistas mnemônicas.</li>
          <li>Permissão para pequenas pausas de autorregulação física.</li>
        </ul>
        <br>
        <p>Permanecemos à disposição para reuniões de alinhamento com os docentes.</p>
      `
    };

    const templateContent = templates[type];
    if (!templateContent) return;

    if (this.documentContent && !confirm('Deseja substituir o conteúdo atual pelo modelo selecionado?')) {
      return;
    }

    const p = this.selectedPatient();
    this.documentContent = replaceDocPlaceholders(templateContent, p);
    this.form.motivo = this.documentContent;
    this.toast.info('Modelo de encaminhamento carregado.');
  }

  loadRecords() {
    if (!this.form.pacienteId) {
      this.records.set([]);
      return;
    }
    this.service.list({ pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      this.records.set(res.data || []);
    });
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    this.form = {
      pacienteId: r.pacienteId || '',
      deUserId: r.deUserId || this.auth.user()?.id || '',
      paraUserId: r.paraUserId || '',
      motivo: r.motivo || '',
      resposta: r.resposta || '',
      status: r.status || 'PENDENTE'
    };
    this.documentContent = r.motivo || '';
    this.updateSelectedPatient();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      deUserId: this.auth.user()?.id || '',
      paraUserId: '',
      motivo: '',
      resposta: '',
      status: 'PENDENTE'
    };
    this.applyReferralTemplate('neuropediatria');
  }

  deleteRecord(r: any) {
    if (!confirm('Excluir este encaminhamento?')) return;
    this.service.delete(r.id).subscribe({
      next: () => {
        this.toast.success('Encaminhamento excluído com sucesso');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir encaminhamento')
    });
  }

  stripHtml(html: string): string {
    if (!html) return 'Encaminhamento Clínico';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || 'Encaminhamento Clínico';
  }

  save() {
    if (!this.form.pacienteId) {
      this.toast.warning('Selecione um paciente');
      return;
    }

    this.saving.set(true);
    const payload = {
      ...this.form,
      motivo: this.documentContent,
      paraUserId: this.form.paraUserId || null
    };

    const obs = this.editingId()
      ? this.service.update(this.editingId(), payload)
      : this.isEdit
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Encaminhamento oficial salvo com sucesso!');
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar encaminhamento');
      }
    });
  }
}