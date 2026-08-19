import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnamneseService } from '../services/anamnese.service';
import { ApiService } from '@core/services/api.service';
import { AddressFormComponent, Address } from '@core/components/address-form.component';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-anamnese-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 legacy-page">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar' : 'Nova' }} Anamnese</h1>
            <p class="text-sm text-gray-500 mt-1">Preencha os dados do paciente etapa por etapa</p>
          </div>
          <a routerLink="/app/anamnese" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span class="material-icons text-lg">arrow_back</span> Voltar
          </a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm">
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-center gap-2 overflow-x-auto">
              @for (step of steps; track step.id; let i = $index) {
                <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
                  [class]="currentStep() === i ? 'bg-blue-600 text-white' : currentStep() > i ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  (click)="currentStep.set(i)">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    [class]="currentStep() === i ? 'bg-white/20' : currentStep() > i ? 'bg-green-200' : 'bg-gray-200'">
                    @if (currentStep() > i) {
                      <span class="material-icons text-sm">check</span>
                    } @else {
                      {{ i + 1 }}
                    }
                  </span>
                  <span class="hidden sm:inline">{{ step.title }}</span>
                </button>
              }
            </div>
          </div>

          <div class="p-6">
            @if (currentStep() === 0) {
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">Identificação</h2>
                <p class="text-sm text-gray-500 mb-6">Dados de identificação e contato da escola</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                    <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      [(ngModel)]="form.pacienteId" (change)="loadRecords()">
                      <option value="">Selecione o paciente</option>
                      @for (p of pacientes(); track p.id) {
                        <option [value]="p.id">{{ p.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                    <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      [(ngModel)]="form.turno">
                      <option value="">Selecione</option>
                      <option value="manha">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="integral">Integral</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Telefone da Escola</label>
                    <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      [(ngModel)]="form.telefoneEscola" placeholder="(00) 0000-0000">
                  </div>
                  <div class="md:col-span-2">
                    <app-address-form 
                      [address]="form.enderecoEscola" 
                      label="Endereço da Escola"
                      (addressChange)="onSchoolAddressChange($event)">
                    </app-address-form>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Indicação para Tratamento</label>
                    <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      [(ngModel)]="form.indicacaoTratamento" placeholder="Quem indicou?">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.diagnostico" placeholder="Diagnóstico médico (se houver)"></textarea>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 1) {
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">Pais</h2>
                <p class="text-sm text-gray-500 mb-6">Informações sobre os pais</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-gray-50 rounded-xl p-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Pai</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Profissão</label>
                        <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [(ngModel)]="form.profissaoPai">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Idade</label>
                        <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="number" [(ngModel)]="form.idadePai">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Escolaridade</label>
                        <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [(ngModel)]="form.escolaridadePai">
                          <option value="">Selecione</option>
                          <option value="ensinoFundamental">Ensino Fundamental</option>
                          <option value="ensinoMedio">Ensino Médio</option>
                          <option value="superior">Superior</option>
                          <option value="posGraduacao">Pós-graduação</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Mãe</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Profissão</label>
                        <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [(ngModel)]="form.profissaoMae">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Idade</label>
                        <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="number" [(ngModel)]="form.idadeMae">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Escolaridade</label>
                        <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [(ngModel)]="form.escolaridadeMae">
                          <option value="">Selecione</option>
                          <option value="ensinoFundamental">Ensino Fundamental</option>
                          <option value="ensinoMedio">Ensino Médio</option>
                          <option value="superior">Superior</option>
                          <option value="posGraduacao">Pós-graduação</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">Motivo</h2>
                <p class="text-sm text-gray-500 mb-6">Motivo da consulta e queixa principal</p>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Queixa Principal *</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="4" [(ngModel)]="form.queixaPrincipal" placeholder="Descreva a queixa principal..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Histórico da Queixa</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="4" [(ngModel)]="form.historiaQueixa" placeholder="Histórico detalhado da queixa..."></textarea>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 3) {
              <div>
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 mb-1">Constelação Familiar</h2>
                    <p class="text-sm text-gray-500">Membros da família</p>
                  </div>
                  <button class="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    (click)="addFamilyMember()">
                    <span class="material-icons text-lg">add</span> Adicionar
                  </button>
                </div>
                @if (form.constelacaoFamiliar.length === 0) {
                  <div class="text-center py-8 bg-gray-50 rounded-xl">
                    <span class="material-icons text-4xl text-gray-300">family_restroom</span>
                    <p class="text-gray-500 mt-2">Nenhum membro adicionado</p>
                    <p class="text-sm text-gray-400">Clique em "Adicionar" para incluir membros da família</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (member of form.constelacaoFamiliar; track $index; let i = $index) {
                      <div class="bg-gray-50 rounded-xl p-4 flex gap-3 items-end">
                        <div class="flex-1">
                          <label class="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                          <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [(ngModel)]="member.nome">
                        </div>
                        <div class="w-32">
                          <label class="block text-xs font-medium text-gray-600 mb-1">Parentesco</label>
                          <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [(ngModel)]="member.parentesco">
                        </div>
                        <div class="flex-1">
                          <label class="block text-xs font-medium text-gray-600 mb-1">Ocupação</label>
                          <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [(ngModel)]="member.ocupacao">
                        </div>
                        <div class="w-20">
                          <label class="block text-xs font-medium text-gray-600 mb-1">Idade</label>
                          <input class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number" [(ngModel)]="member.idade">
                        </div>
                        <div class="w-28">
                          <label class="block text-xs font-medium text-gray-600 mb-1">Sexo</label>
                          <select class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [(ngModel)]="member.sexo">
                            <option value="">—</option>
                            <option value="M">M</option>
                            <option value="F">F</option>
                          </select>
                        </div>
                        <button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" (click)="removeFamilyMember(i)">
                          <span class="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (currentStep() === 4) {
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">Saúde</h2>
                <p class="text-sm text-gray-500 mb-6">Histórico de saúde e hábitos</p>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sono</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.sono" placeholder="Descrição do padrão de sono..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Alimentação</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.alimentacao" placeholder="Descrição da alimentação..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Medicações</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.medicacoes" placeholder="Medicações em uso..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tratamentos Anteriores</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.tratamentosAnteriores" placeholder="Tratamentos anteriores realizados..."></textarea>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 5) {
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">Desenvolvimento</h2>
                <p class="text-sm text-gray-500 mb-6">Histórico de desenvolvimento e escolar</p>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Gestação</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.gestacao" placeholder="Como foi a gestação?"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dificuldades de Aprendizado</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.dificuldadesAprendizado" placeholder="Dificuldades observadas..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Histórico Escolar</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.historicoEscolar" placeholder="Trajetória escolar..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observações Comportamentais</label>
                    <textarea class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3" [(ngModel)]="form.observacoesComportamentais" placeholder="Comportamento observado..."></textarea>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="p-6 border-t border-gray-100 flex justify-between">
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              [disabled]="currentStep() === 0" (click)="prevStep()">
              <span class="material-icons text-lg align-middle mr-1">arrow_back</span> Anterior
            </button>
            <div class="flex gap-3">
              @if (currentStep() < steps.length - 1) {
                <button class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  (click)="nextStep()">
                  Próximo <span class="material-icons text-lg align-middle ml-1">arrow_forward</span>
                </button>
              } @else {
                <button class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  (click)="save()" [disabled]="saving()">
                  {{ saving() ? 'Salvando...' : 'Salvar Anamnese' }}
                </button>
              }
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm mt-6">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span class="material-icons text-indigo-600">history</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Registros Anteriores</h3>
                <p class="text-xs text-gray-500">{{ records().length }} anamnese(s) de {{ getPatientName() }}</p>
              </div>
            </div>
            @if (editingId()) {
              <button class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors" (click)="resetForm()">
                <span class="material-icons text-lg">add</span> Nova anamnese
              </button>
            }
          </div>
          @if (records().length === 0) {
            <div class="p-10 text-center">
              <span class="material-icons text-4xl text-gray-300">assignment_ind</span>
              <p class="mt-3 text-sm font-medium text-gray-500">Nenhuma anamnese para este paciente</p>
              <p class="text-xs text-gray-400 mt-1">Selecione um paciente para listar as anamneses salvas</p>
            </div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (r of records(); track r.id) {
                <div class="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <span class="material-icons text-blue-600 text-lg">assignment_ind</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ r.queixaPrincipal || 'Sem queixa principal' }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 truncate">{{ r.createdAt | date:'dd/MM/yyyy' }} · {{ r.status || 'PENDENTE' }} · {{ r.autor?.name || '—' }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Editar" (click)="editRecord(r)">
                      <span class="material-icons text-lg text-gray-500">edit</span>
                    </button>
                    <button class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Excluir" (click)="deleteRecord(r)">
                      <span class="material-icons text-lg text-red-500">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AnamneseFormComponent implements OnInit {
  private service = inject(AnamneseService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');
  currentStep = signal(0);

  steps = [
    { id: 'identificacao', title: 'Identificação' },
    { id: 'pais', title: 'Pais' },
    { id: 'motivo', title: 'Motivo' },
    { id: 'constelacao', title: 'Constelação Familiar' },
    { id: 'saude', title: 'Saúde' },
    { id: 'desenvolvimento', title: 'Desenvolvimento' }
  ];

  form: any = {
    pacienteId: '',
    turno: '', telefoneEscola: '', 
    enderecoEscola: { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' },
    indicacaoTratamento: '', diagnostico: '',
    profissaoPai: '', idadePai: '', escolaridadePai: '',
    profissaoMae: '', idadeMae: '', escolaridadeMae: '',
    queixaPrincipal: '', historiaQueixa: '',
    constelacaoFamiliar: [],
    sono: '', alimentacao: '', medicacoes: '', tratamentosAnteriores: '',
    gestacao: '', dificuldadesAprendizado: '', historicoEscolar: '', observacoesComportamentais: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));

    if (this.isEdit) {
      this.service.get(this.id).subscribe((res: any) => {
        this.form = {
          ...this.form,
          ...res,
          constelacaoFamiliar: res.constelacaoFamiliar || []
        };
      });
    }
  }

  nextStep() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  addFamilyMember() {
    this.form.constelacaoFamiliar.push({ nome: '', parentesco: '', ocupacao: '', idade: '', sexo: '' });
  }

  removeFamilyMember(index: number) {
    this.form.constelacaoFamiliar.splice(index, 1);
  }

  onSchoolAddressChange(address: Address) {
    this.form.enderecoEscola = address;
  }

  getPatientName(): string {
    const p = this.pacientes().find(p => p.id === this.form.pacienteId);
    return p?.name || '-';
  }

  loadRecords() {
    if (!this.form.pacienteId) { this.records.set([]); return; }
    this.api.get('/anamneses', { pacienteId: this.form.pacienteId }).subscribe((res: any) => this.records.set(res.data || []));
  }

  editRecord(r: any) {
    this.editingId.set(r.id);
    const endereco = typeof r.enderecoEscola === 'string' ? this.parseAddress(r.enderecoEscola) : (r.enderecoEscola || this.form.enderecoEscola);
    this.form = { ...this.form, ...r, enderecoEscola: endereco, constelacaoFamiliar: r.constelacaoFamiliar || [] };
    this.currentStep.set(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set('');
    this.form = {
      pacienteId: this.form.pacienteId,
      turno: '', telefoneEscola: '',
      enderecoEscola: { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' },
      indicacaoTratamento: '', diagnostico: '',
      profissaoPai: '', idadePai: '', escolaridadePai: '',
      profissaoMae: '', idadeMae: '', escolaridadeMae: '',
      queixaPrincipal: '', historiaQueixa: '',
      constelacaoFamiliar: [],
      sono: '', alimentacao: '', medicacoes: '', tratamentosAnteriores: '',
      gestacao: '', dificuldadesAprendizado: '', historicoEscolar: '', observacoesComportamentais: ''
    };
    this.currentStep.set(0);
  }

  deleteRecord(r: any) {
    if (!confirm(`Excluir a anamnese de ${r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '—'}?`)) return;
    this.api.delete(`/anamneses/${r.id}`).subscribe({
      next: () => { this.toast.success('Anamnese excluída'); this.loadRecords(); },
      error: () => this.toast.error('Erro ao excluir anamnese')
    });
  }

  private parseAddress(json: string): Address {
    try {
      const obj = JSON.parse(json);
      return { cep: obj.cep || '', street: obj.street || '', neighborhood: obj.neighborhood || '', number: obj.number || '', complement: obj.complement || '', city: obj.city || '', state: obj.state || '' };
    } catch {
      return { cep: '', street: '', neighborhood: '', number: '', complement: '', city: '', state: '' };
    }
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.form.queixaPrincipal) return this.toast.warning('Preencha a queixa principal');
    this.saving.set(true);

    const data = {
      ...this.form,
      enderecoEscola: JSON.stringify(this.form.enderecoEscola)
    };

    const obs = this.editingId() ? this.service.update(this.editingId(), data) : this.isEdit ? this.service.update(this.id, data) : this.service.create(data);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Anamnese salva');
        this.resetForm();
        this.loadRecords();
      },
      error: () => { this.saving.set(false); this.toast.error('Erro ao salvar'); }
    });
  }
}
