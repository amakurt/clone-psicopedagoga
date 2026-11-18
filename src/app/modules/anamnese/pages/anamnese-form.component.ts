import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnamneseService } from '../services/anamnese.service';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast.component';
import { DialogService } from '@shared/services/dialog.service';
import { FichaScannerModalComponent, ScanResult } from '@shared/components/ficha-scanner-modal.component';

@Component({
  selector: 'app-anamnese-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FichaScannerModalComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 animate-in">
      <div class="max-w-5xl mx-auto space-y-6">

        <!-- Top Header & Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                Protocolo Clínico Oficial
              </span>
              @if (isVilmaModel()) {
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span class="material-icons text-[14px]">star</span> Dra. Vilma Sousa (16 Eixos)
                </span>
              }
            </div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {{ isEdit ? 'Editar' : 'Nova' }} Anamnese Clínica
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Preenchimento rápido com auto-preenchimento cadastral e botões de toque para iPad
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Alternador de Modelo -->
            <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button type="button" (click)="selectedModel.set('vilma')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                [class]="selectedModel() === 'vilma' ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'">
                <span class="material-icons text-[16px]">verified</span>
                <span>Dra. Vilma (16 Eixos)</span>
              </button>
              <button type="button" (click)="selectedModel.set('padrao')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                [class]="selectedModel() === 'padrao' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'">
                Padrão
              </button>
            </div>

            <!-- Botão Ver / Imprimir em A4 -->
            <button type="button" (click)="openPrintPreview()"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shadow-xs">
              <span class="material-icons text-[18px]">print</span>
              <span>Visualizar / A4 Timbrado</span>
            </button>

            <!-- Scanner IA -->
            <button type="button" (click)="showScannerModal.set(true)"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all">
              <span class="material-icons text-[18px]">document_scanner</span>
              <span class="hidden sm:inline">Preencher por Foto (IA)</span>
            </button>

            <a routerLink="/app/anamnese" class="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
              <span class="material-icons text-xl">close</span>
            </a>
          </div>
        </div>

        <!-- Seletor de Paciente com Preenchimento Automático -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                1. Selecione o Paciente *
              </label>
              <p class="text-xs text-slate-400">
                Os dados de identificação, escola, pais, telefone e idade serão preenchidos automaticamente.
              </p>
            </div>
            @if (selectedPatient()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span class="material-icons text-[16px]">check_circle</span> Dados sincronizados
              </span>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div class="md:col-span-2">
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                [(ngModel)]="form.pacienteId" (change)="onPacienteSelected()">
                <option value="">-- Escolha um paciente cadastrado --</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.name }} ({{ p.grade || 'Série não inf.' }})</option>
                }
              </select>
            </div>

            <!-- Resumo Rápido da Idade e Nascimento -->
            @if (selectedPatient()) {
              <div class="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 flex items-center gap-3">
                <div class="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                  {{ selectedPatient()?.initials || 'P' }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-teal-900 dark:text-teal-200 truncate">{{ selectedPatient()?.name }}</p>
                  <p class="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                    {{ calculatedAge() || 'Idade a calcular' }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Seção Principal: Passos da Anamnese da Dra. Vilma (16 Eixos) -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          <!-- Stepper Horizontal com Scroll Touch no iPad -->
          <div class="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 min-w-max">
              @for (step of activeSteps(); track step.id; let i = $index) {
                <button type="button" (click)="currentStep.set(i)"
                  class="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all"
                  [class]="currentStep() === i ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : currentStep() > i ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'">
                  <span class="size-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    [class]="currentStep() === i ? 'bg-white/25 text-white' : currentStep() > i ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'">
                    @if (currentStep() > i) {
                      <span class="material-icons text-[12px]">check</span>
                    } @else {
                      {{ i + 1 }}
                    }
                  </span>
                  <span>{{ step.title }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Conteúdo do Passo Ativo -->
          <div class="p-6 sm:p-8 space-y-6">

            <!-- ======================================================== -->
            <!-- PASSO 0: I. IDENTIFICAÇÃO & II. MOTIVO DA CONSULTA       -->
            <!-- ======================================================== -->
            @if (currentStep() === 0) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">badge</span>
                    I. Identificação do Paciente e Família
                  </h2>
                  <p class="text-xs text-slate-500">Dados do paciente, escola, responsáveis e contatos</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <input class="form-input" [(ngModel)]="v.nomePaciente" placeholder="Nome do paciente">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                    <input class="form-input" type="date" [(ngModel)]="v.dataNascimento" (change)="recalculateAge()">
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade Calculada</label>
                    <input class="form-input bg-slate-100 dark:bg-slate-800" [(ngModel)]="v.idadeFormatada" placeholder="Ex: 8 anos e 3 meses" readonly>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ano / Série</label>
                    <input class="form-input" [(ngModel)]="v.serie" placeholder="Ex: 3º Ano Fundamental">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Turno Escolar (Toque Rápido)</label>
                    <div class="flex flex-wrap gap-1.5 mt-1">
                      @for (t of ['Manhã', 'Tarde', 'Integral']; track t) {
                        <button type="button" (click)="v.turno = t"
                          class="chip-btn" [class.active]="v.turno === t">
                          {{ t }}
                        </button>
                      }
                    </div>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Escola</label>
                    <input class="form-input" [(ngModel)]="v.escola" placeholder="Nome da instituição de ensino">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone da Escola</label>
                    <input class="form-input" [(ngModel)]="v.telefoneEscola" placeholder="(00) 0000-0000">
                  </div>

                  <div class="md:col-span-3">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Endereço da Escola</label>
                    <input class="form-input" [(ngModel)]="v.enderecoEscola" placeholder="Rua, número, bairro, cidade">
                  </div>
                </div>

                <!-- Dados dos Pais -->
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 class="text-sm font-black text-slate-800 dark:text-slate-200">Filiação e Responsáveis</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome dos Pais / Responsável Principal</label>
                      <input class="form-input" [(ngModel)]="v.nomeResponsavel" placeholder="Nome da mãe, pai ou responsável legal">
                    </div>

                    <!-- Dados do Pai -->
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <p class="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">Dados do Pai</p>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Profissão do Pai</label>
                        <input class="form-input" [(ngModel)]="v.profissaoPai" placeholder="Profissão">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Idade do Pai</label>
                        <input class="form-input" type="number" [(ngModel)]="v.idadePai" placeholder="Idade">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Escolaridade do Pai</label>
                        <div class="flex flex-wrap gap-1.5 mt-1">
                          @for (esc of ['Fundamental', 'Médio', 'Superior', 'Pós']; track esc) {
                            <button type="button" (click)="v.escolaridadePai = esc"
                              class="chip-btn" [class.active]="v.escolaridadePai === esc">{{ esc }}</button>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Dados da Mãe -->
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <p class="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">Dados da Mãe</p>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Profissão da Mãe</label>
                        <input class="form-input" [(ngModel)]="v.profissaoMae" placeholder="Profissão">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Idade da Mãe</label>
                        <input class="form-input" type="number" [(ngModel)]="v.idadeMae" placeholder="Idade">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Escolaridade da Mãe</label>
                        <div class="flex flex-wrap gap-1.5 mt-1">
                          @for (esc of ['Fundamental', 'Médio', 'Superior', 'Pós']; track esc) {
                            <button type="button" (click)="v.escolaridadeMae = esc"
                              class="chip-btn" [class.active]="v.escolaridadeMae === esc">{{ esc }}</button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Endereço Residencial</label>
                      <input class="form-input" [(ngModel)]="v.enderecoResidencial" placeholder="Endereço da família">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telefones para Contato</label>
                      <input class="form-input" [(ngModel)]="v.telefonesContato" placeholder="(00) 00000-0000">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Indicação do Tratamento</label>
                      <input class="form-input" [(ngModel)]="v.indicacaoTratamento" placeholder="Quem indicou a clínica (médico, escola, amigos, etc.)">
                    </div>
                  </div>
                </div>

                <!-- II. Motivo da Consulta -->
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">psychology</span>
                    II. Motivo da Consulta e Queixa Principal
                  </h2>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Queixa Principal / Diagnóstico Prévio *</label>
                    <textarea class="form-textarea" rows="3" [(ngModel)]="v.queixaPrincipal" placeholder="Descreva os motivos que levaram a família a buscar atendimento..."></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">História da Queixa (quando, como e em que circunstâncias começou e se desenvolveu)</label>
                    <textarea class="form-textarea" rows="4" [(ngModel)]="v.historiaQueixa" placeholder="Detalhes de como os sintomas ou dificuldades foram percebidos ao longo do tempo..."></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 1: III. CONSTELAÇÃO FAMILIAR                       -->
            <!-- ======================================================== -->
            @if (currentStep() === 1) {
              <div class="space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span class="material-icons text-teal-600">groups</span>
                      III. Constelação Familiar
                    </h2>
                    <p class="text-xs text-slate-500">Membros da família que convivem com a criança</p>
                  </div>
                  <button type="button" (click)="addFamilyMember()"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm">
                    <span class="material-icons text-sm">add</span>
                    <span>Adicionar Familiar</span>
                  </button>
                </div>

                @if (v.constelacaoFamiliar.length === 0) {
                  <div class="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <span class="material-icons text-4xl text-slate-400">family_restroom</span>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">Nenhum membro adicionado</p>
                    <p class="text-xs text-slate-500 mt-1">Toque no botão "Adicionar Familiar" para listar pais, irmãos, avós ou cuidadores.</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (m of v.constelacaoFamiliar; track $index; let i = $index) {
                      <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div class="sm:col-span-1 flex items-center justify-center font-bold text-xs text-slate-400">
                          #{{ i + 1 }}
                        </div>
                        <div class="sm:col-span-4">
                          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nome / Parentesco</label>
                          <input class="form-input text-xs" [(ngModel)]="m.nome" placeholder="Ex: Lucas (Irmão)">
                        </div>
                        <div class="sm:col-span-3">
                          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Ocupação</label>
                          <input class="form-input text-xs" [(ngModel)]="m.ocupacao" placeholder="Ex: Estudante">
                        </div>
                        <div class="sm:col-span-2">
                          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Idade</label>
                          <input class="form-input text-xs" type="number" [(ngModel)]="m.idade" placeholder="Anos">
                        </div>
                        <div class="sm:col-span-2 flex items-center gap-2">
                          <div class="flex-1">
                            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Sexo</label>
                            <div class="flex gap-1">
                              <button type="button" (click)="m.sexo = 'M'"
                                class="px-2 py-1 rounded-lg text-xs font-bold border"
                                [class]="m.sexo === 'M' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200'">M</button>
                              <button type="button" (click)="m.sexo = 'F'"
                                class="px-2 py-1 rounded-lg text-xs font-bold border"
                                [class]="m.sexo === 'F' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200'">F</button>
                            </div>
                          </div>
                          <button type="button" (click)="removeFamilyMember(i)"
                            class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors" title="Remover">
                            <span class="material-icons text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 2: IV. ANTECEDENTES PESSOAIS                       -->
            <!-- ======================================================== -->
            @if (currentStep() === 2) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">pregnant_woman</span>
                    IV. Antecedentes Pessoais (Concepção, Gestação e Parto)
                  </h2>
                  <p class="text-xs text-slate-500">Histórico pré-natal, intercorrências gestacionais e nascimento</p>
                </div>

                <!-- a) Concepção -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">a) Concepção</h3>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">A criança foi desejada?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Sim', 'Não', 'Planejada']; track opt) {
                          <button type="button" (click)="v.concepcaoDesejada = opt"
                            class="chip-btn" [class.active]="v.concepcaoDesejada === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fez pré-natal?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Sim', 'Não']; track opt) {
                          <button type="button" (click)="v.concepcaoPrenatal = opt"
                            class="chip-btn" [class.active]="v.concepcaoPrenatal === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade da mãe na gravidez</label>
                      <input class="form-input" [(ngModel)]="v.idadeGravidez" placeholder="Ex: 27 anos">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Observações da concepção</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.observacoesConcepcao" placeholder="Observações..."></textarea>
                  </div>
                </div>

                <!-- b) Gestação -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">b) Gestação</h3>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Como a mãe estava emocionalmente?</label>
                    <input class="form-input" [(ngModel)]="v.gestacaoEmocional" placeholder="Ansiedade, depressão, tranquilidade, luto...">
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teve complicações orgânicas?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.gestacaoComplicacoes = opt"
                            class="chip-btn" [class.active]="v.gestacaoComplicacoes === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Em que mês?</label>
                      <input class="form-input" [(ngModel)]="v.gestacaoMesComplicacao" placeholder="Mês gestacional">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Traumatismo, queda ou alguma intercorrência durante a gestação?</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.gestacaoIntercorrencias" placeholder="Descreva intercorrências..."></textarea>
                  </div>
                </div>

                <!-- c) Parto -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">c) Parto</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Maternidade</label>
                      <input class="form-input" [(ngModel)]="v.partoMaternidade" placeholder="Nome do hospital/maternidade">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Condições do Parto</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Normal', 'Cesárea', 'Fórceps']; track opt) {
                          <button type="button" (click)="v.partoCondicao = opt"
                            class="chip-btn" [class.active]="v.partoCondicao === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Como foram as 24 horas anteriores (mãe) e 24 horas posteriores (mãe e criança)?</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.parto24h" placeholder="Relato das 24h pré e pós parto..."></textarea>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Prematuro?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['A Termo (Não)', 'Sim (Prematuro)']; track opt) {
                          <button type="button" (click)="v.partoPrematuro = opt"
                            class="chip-btn" [class.active]="v.partoPrematuro === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semanas / Meses</label>
                      <input class="form-input" [(ngModel)]="v.partoPrematuroSemanas" placeholder="Ex: 36 semanas">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peso ao Nascer</label>
                      <input class="form-input" [(ngModel)]="v.partoPeso" placeholder="Ex: 3.250 kg">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tamanho e Apgar</label>
                      <input class="form-input" [(ngModel)]="v.partoTamanhoApgar" placeholder="Ex: 49cm, Apgar 9/10">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Observações do Parto</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.observacoesParto" placeholder="Observações..."></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 3: V. DESENVOLVIMENTO & VI. DESENVOLVIMENTO MOTOR  -->
            <!-- ======================================================== -->
            @if (currentStep() === 3) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">directions_run</span>
                    V. Desenvolvimento Geral, Sono, Alimentação e Motor
                  </h2>
                  <p class="text-xs text-slate-500">Marcos psicomotores, hábitos diários e controle de esfíncteres</p>
                </div>

                <!-- Recursos adicionais -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    a) Faz uso de algum recurso adicional? (Toque para selecionar)
                  </label>
                  <div class="flex flex-wrap gap-2">
                    @for (r of ['Nenhum', 'Óculos', 'Aparelho Auditivo', 'Cadeira de Rodas', 'Prótese', 'Muletas', 'Tutor / Órtese']; track r) {
                      <button type="button" (click)="toggleRecurso(r)"
                        class="chip-btn" [class.active]="hasRecurso(r)">
                        {{ r }}
                      </button>
                    }
                  </div>
                  <div>
                    <input class="form-input mt-2" [(ngModel)]="v.recursosOutros" placeholder="Outros recursos ou detalhes...">
                  </div>
                </div>

                <!-- Alimentação -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">b) Alimentação</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mamou no peito?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Sim', 'Não']; track opt) {
                          <button type="button" (click)="v.alimentacaoMamou = opt"
                            class="chip-btn" [class.active]="v.alimentacaoMamou === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Até quando?</label>
                      <input class="form-input" [(ngModel)]="v.alimentacaoMamouTempo" placeholder="Ex: até 1 ano e 6 meses">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primeiros Dentes</label>
                      <input class="form-input" [(ngModel)]="v.alimentacaoDentes" placeholder="Ex: aos 6 meses">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mamadeira (iniciou e deixou)</label>
                      <input class="form-input" [(ngModel)]="v.alimentacaoMamadeira" placeholder="Quando iniciou e quando deixou">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aceitação de alimentos sólidos</label>
                      <input class="form-input" [(ngModel)]="v.alimentacaoSolidos" placeholder="Como e quando introduziu e aceitou">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Problemas de alimentação atualmente?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim (Seletividade)', 'Sim (Recusa)', 'Sim (Mastigação)']; track opt) {
                          <button type="button" (click)="v.alimentacaoProblemas = opt"
                            class="chip-btn" [class.active]="v.alimentacaoProblemas === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qual a atitude da família?</label>
                      <input class="form-input" [(ngModel)]="v.alimentacaoAtitudeFamilia" placeholder="Manejo das recusas, cobranças...">
                    </div>
                  </div>
                </div>

                <!-- Sono -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">c) Sono</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Onde dormiu desde o nascimento?</label>
                      <input class="form-input" [(ngModel)]="v.sonoLocalNascimento" placeholder="Berço, cama compartilhada...">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade em que passou a dormir sozinho no quarto?</label>
                      <input class="form-input" [(ngModel)]="v.sonoQuartoSozinho" placeholder="Idade">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Como foi o sono desde pequeno?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Tranquilo', 'Agitado', 'Acordava Muito', 'Terror Noturno']; track opt) {
                          <button type="button" (click)="v.sonoInfancia = opt"
                            class="chip-btn" [class.active]="v.sonoInfancia === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Atualmente como é o sono?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Bom / Contínuo', 'Agitado', 'Insônia', 'Pesadelos', 'Bruxismo']; track opt) {
                          <button type="button" (click)="v.sonoAtual = opt"
                            class="chip-btn" [class.active]="v.sonoAtual === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <!-- VI. Desenvolvimento Motor -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">VI. Marcos Motores</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Sustentou Cabeça</label>
                      <input class="form-input text-xs" [(ngModel)]="v.motorCabeca" placeholder="Ex: 3 meses">
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Sentou</label>
                      <input class="form-input text-xs" [(ngModel)]="v.motorSentou" placeholder="Ex: 6 meses">
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Engatinhou</label>
                      <input class="form-input text-xs" [(ngModel)]="v.motorEngatinhou" placeholder="Ex: 8 meses">
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ficou em Pé</label>
                      <input class="form-input text-xs" [(ngModel)]="v.motorFicouEmPe" placeholder="Ex: 10 meses">
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Andou</label>
                      <input class="form-input text-xs" [(ngModel)]="v.motorAndou" placeholder="Ex: 1 ano">
                    </div>
                  </div>

                  <!-- Dificuldades Motoras & Lateralidade -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tendência a cair?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim', 'Às vezes']; track opt) {
                          <button type="button" (click)="v.motorCair = opt"
                            class="chip-btn" [class.active]="v.motorCair === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Machucar-se com facilidade?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim', 'Às vezes']; track opt) {
                          <button type="button" (click)="v.motorMachucar = opt"
                            class="chip-btn" [class.active]="v.motorMachucar === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lateralidade Definida</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Destro', 'Canhoto', 'Ambidestro', 'Indefinida']; track opt) {
                          <button type="button" (click)="v.motorLateralidade = opt"
                            class="chip-btn" [class.active]="v.motorLateralidade === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Controle dos Esfíncteres -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">Controle dos Esfíncteres</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quando deixou as fraldas?</label>
                      <input class="form-input" [(ngModel)]="v.esfincterDesfralde" placeholder="Idade do desfralde">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aprendizagem do sanitário</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Com facilidade', 'Com dificuldade', 'Recusava']; track opt) {
                          <button type="button" (click)="v.esfincterAprendizagem = opt"
                            class="chip-btn" [class.active]="v.esfincterAprendizagem === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vesical Diurno (xixi)</label>
                      <div class="flex flex-col gap-1">
                        @for (opt of ['Controlado', 'Enurese / Escapa']; track opt) {
                          <button type="button" (click)="v.esfincterVesicalDiurno = opt"
                            class="chip-btn text-[11px]" [class.active]="v.esfincterVesicalDiurno === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Anal Diurno (fezes)</label>
                      <div class="flex flex-col gap-1">
                        @for (opt of ['Controlado', 'Encoprese / Escapa']; track opt) {
                          <button type="button" (click)="v.esfincterAnalDiurno = opt"
                            class="chip-btn text-[11px]" [class.active]="v.esfincterAnalDiurno === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vesical Noturno</label>
                      <div class="flex flex-col gap-1">
                        @for (opt of ['Controlado', 'Enurese Noturna']; track opt) {
                          <button type="button" (click)="v.esfincterVesicalNoturno = opt"
                            class="chip-btn text-[11px]" [class.active]="v.esfincterVesicalNoturno === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Anal Noturno</label>
                      <div class="flex flex-col gap-1">
                        @for (opt of ['Controlado', 'Escapa']; track opt) {
                          <button type="button" (click)="v.esfincterAnalNoturno = opt"
                            class="chip-btn text-[11px]" [class.active]="v.esfincterAnalNoturno === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 4: VII. LINGUAGEM & VIII. SOCIABILIDADE            -->
            <!-- ======================================================== -->
            @if (currentStep() === 4) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">record_voice_over</span>
                    VII. Linguagem e VIII. Sociabilidade
                  </h2>
                  <p class="text-xs text-slate-500">Desenvolvimento comunicativo, interação social e vínculo de amizades</p>
                </div>

                <!-- Linguagem -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">VII. Linguagem</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quando falou as primeiras palavras?</label>
                      <input class="form-input" [(ngModel)]="v.linguagemPrimeirasPalavras" placeholder="Idade e quais palavras">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Problemas de fala?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim (Trocas Fonológicas)', 'Sim (Gagueira/Disfluência)', 'Sim (Atraso)']; track opt) {
                          <button type="button" (click)="v.linguagemProblemas = opt"
                            class="chip-btn" [class.active]="v.linguagemProblemas === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Desde quando e qual a atitude dos pais?</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.linguagemAtitudePais" placeholder="Reação da família diante das dificuldades..."></textarea>
                  </div>
                </div>

                <!-- Sociabilidade -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">VIII. Sociabilidade</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Início da interação social (mãe, pai, outros)</label>
                      <input class="form-input" [(ngModel)]="v.socialInteracao" placeholder="Idade em que começou a interagir">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tem amigos?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Sim', 'Poucos', 'Não', 'Apenas mais velhos', 'Apenas mais novos']; track opt) {
                          <button type="button" (click)="v.socialAmigos = opt"
                            class="chip-btn" [class.active]="v.socialAmigos === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Que tipo de brincadeira prefere?</label>
                    <input class="form-input" [(ngModel)]="v.socialBrincadeiras" placeholder="Faz de conta, jogos de regra, eletrônicos/telas, ar livre...">
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Como se comporta com adultos?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Sociável', 'Tímido / Retraído', 'Opositor / Desafiador', 'Carinhoso']; track opt) {
                          <button type="button" (click)="v.socialAdultos = opt"
                            class="chip-btn" [class.active]="v.socialAdultos === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qual a atitude familiar?</label>
                      <input class="form-input" [(ngModel)]="v.socialAtitudeFamiliar" placeholder="Postura da família...">
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 5: IX. REAÇÕES, X. SEXUALIDADE & XI. MANIPULAÇÃO   -->
            <!-- ======================================================== -->
            @if (currentStep() === 5) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">mood</span>
                    IX. Emoções, X. Sexualidade e XI. Manipulação e Tiques
                  </h2>
                  <p class="text-xs text-slate-500">Regulação afetiva, curiosidades e hábitos sensoriomotores</p>
                </div>

                <!-- Reações Emocionais -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">IX. Reações Emocionais</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temperamento Predominante</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Calmo / Tranquilo', 'Agitado / Hiperativo', 'Ansioso', 'Explosivo / Irritadiço', 'Sensível']; track opt) {
                          <button type="button" (click)="v.emocionalTemperamento = opt"
                            class="chip-btn" [class.active]="v.emocionalTemperamento === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chora facilmente?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim', 'Às vezes']; track opt) {
                          <button type="button" (click)="v.emocionalChora = opt"
                            class="chip-btn" [class.active]="v.emocionalChora === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Medos manifestados e atitude dos pais</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.emocionalMedos" placeholder="Escuro, animais, separação, barulho..."></textarea>
                  </div>
                </div>

                <!-- Sexualidade -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">X. Sexualidade</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Manifesta curiosidades sexuais?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.sexualidadeCuriosidade = opt"
                            class="chip-btn" [class.active]="v.sexualidadeCuriosidade === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teve orientação? Por quem?</label>
                      <input class="form-input" [(ngModel)]="v.sexualidadeOrientacao" placeholder="Quem orientou e como foi">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Algum fato ou comportamento que gere preocupação?</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.sexualidadePreocupacao" placeholder="Relato..."></textarea>
                  </div>
                </div>

                <!-- Manipulações e Tiques -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XI. Manipulação e Tiques</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Usou chupeta?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.manipulacaoChupeta = opt"
                            class="chip-btn" [class.active]="v.manipulacaoChupeta === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Presença de tiques?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim (Motores)', 'Sim (Vocais)']; track opt) {
                          <button type="button" (click)="v.manipulacaoTiques = opt"
                            class="chip-btn" [class.active]="v.manipulacaoTiques === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Outras manipulações</label>
                      <input class="form-input" [(ngModel)]="v.manipulacaoOutras" placeholder="Roer unhas, puxar cabelos...">
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 6: XII. DOENÇAS & XIII. ANTECEDENTES FAMILIARES    -->
            <!-- ======================================================== -->
            @if (currentStep() === 6) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">medical_services</span>
                    XII. Histórico de Doenças e XIII. Antecedentes Familiares
                  </h2>
                  <p class="text-xs text-slate-500">Histórico patológico, cirúrgico, medicações e hereditariedade</p>
                </div>

                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XII. Doenças e Tratamentos</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Doenças infantis e cirurgias (idades)</label>
                      <input class="form-input" [(ngModel)]="v.doencasInfantisCirurgias" placeholder="Ex: Catapora aos 4 anos, adenoide...">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Traumatismos, quedas ou desmaios</label>
                      <input class="form-input" [(ngModel)]="v.doencasTraumatismos" placeholder="Histórico de quedas ou convulsões...">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tem alguma doença atualmente?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.doencasAtual = opt"
                            class="chip-btn" [class.active]="v.doencasAtual === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Toma alguma medicação e dosagem?</label>
                      <input class="form-input" [(ngModel)]="v.doencasMedicacao" placeholder="Nome do remédio e dose diária">
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tratamentos anteriores e atuais</label>
                    <textarea class="form-textarea" rows="2" [(ngModel)]="v.doencasTratamentos" placeholder="Fonoaudiologia, Terapia Ocupacional, Psicologia, Neuropediatria..."></textarea>
                  </div>
                </div>

                <!-- XIII. Antecedentes Familiares -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XIII. Antecedentes Familiares</h3>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Doenças na família (pais, avós, tios, primos: nervosismo, alcoolismo, def. mental, linguagem, outros)
                    </label>
                    <textarea class="form-textarea" rows="3" [(ngModel)]="v.antecedentesFamiliares" placeholder="Histórico de diagnósticos ou dificuldades em parentes de 1º e 2º grau..."></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- ======================================================== -->
            <!-- PASSO 7: XIV. ASPECTOS, XV. ESCOLA & XVI. CONCLUSÃO      -->
            <!-- ======================================================== -->
            @if (currentStep() === 7) {
              <div class="space-y-6">
                <div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-icons text-teal-600">school</span>
                    XIV. Dinâmica Familiar, XV. Escolaridade e XVI. Conclusão
                  </h2>
                  <p class="text-xs text-slate-500">Adaptação escolar, relacionamento e encerramento com local e data</p>
                </div>

                <!-- Aspectos Sócio-Culturais -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XIV. Aspectos Sócio-Culturais</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relacionamento do casal</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Harmonioso', 'Conflituoso', 'Separados Amigáveis', 'Separados em Litígio', 'Monoparental']; track opt) {
                          <button type="button" (click)="v.aspectosCasal = opt"
                            class="chip-btn" [class.active]="v.aspectosCasal === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Com quem da família melhor se relaciona?</label>
                      <input class="form-input" [(ngModel)]="v.aspectosMelhorVinculo" placeholder="Nome e parentesco">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Atividades de lazer da família</label>
                    <input class="form-input" [(ngModel)]="v.aspectosLazer" placeholder="Passeios, fins de semana, férias...">
                  </div>
                </div>

                <!-- Escolaridade -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XV. Escolaridade</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade de Início Escolar</label>
                      <input class="form-input" [(ngModel)]="v.escolaInicioIdade" placeholder="Ex: 2 anos">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Problemas de adaptação?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.escolaAdaptacao = opt"
                            class="chip-btn" [class.active]="v.escolaAdaptacao === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Histórico de Reprovação?</label>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        @for (opt of ['Não', 'Sim']; track opt) {
                          <button type="button" (click)="v.escolaReprovacao = opt"
                            class="chip-btn" [class.active]="v.escolaReprovacao === opt">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tarefas de casa (quem ajuda e reação)</label>
                      <input class="form-input" [(ngModel)]="v.escolaTarefas" placeholder="Autonomia, recusa, tempo...">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Opinião da professora e queixas da escola</label>
                      <input class="form-input" [(ngModel)]="v.escolaOpiniaoProfessora" placeholder="Comentários da coordenação...">
                    </div>
                  </div>
                </div>

                <!-- XVI. Outras Informações & Fechamento -->
                <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 class="text-sm font-black text-teal-700 dark:text-teal-400">XVI. Outras Informações Relevantes e Fechamento</h3>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Acontecimentos marcantes vividos pela família (lutos, perdas, separações, mudanças ou traumas)
                    </label>
                    <textarea class="form-textarea" rows="3" [(ngModel)]="v.outrasInformacoes" placeholder="Informações adicionais que julgar importantes..."></textarea>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cidade e Data de Emissão</label>
                      <input class="form-input" [(ngModel)]="v.cidadeDataEmissao" placeholder="Ex: Redenção, 18 de Novembro de 2026">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assinatura do Profissional</label>
                      <input class="form-input" [(ngModel)]="v.assinaturaProfissional" placeholder="Dra. Vilma Sousa • Neuropsicopedagoga">
                    </div>
                  </div>
                </div>
              </div>
            }

          </div>

          <!-- Bottom Stepper Navigation & Save Bar -->
          <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
            <button type="button" (click)="prevStep()" [disabled]="currentStep() === 0"
              class="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-40">
              <span class="material-icons text-sm align-middle mr-1">arrow_back</span>
              Anterior
            </button>

            <div class="flex items-center gap-2">
              @if (currentStep() < activeSteps().length - 1) {
                <button type="button" (click)="nextStep()"
                  class="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 active:scale-95">
                  Próximo
                  <span class="material-icons text-sm align-middle ml-1">arrow_forward</span>
                </button>
              }
              
              <button type="button" (click)="save()" [disabled]="saving()"
                class="px-7 py-2.5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 active:scale-95 flex items-center gap-2 disabled:opacity-50">
                <span class="material-icons text-base" [class.animate-spin]="saving()">save</span>
                <span>{{ saving() ? 'Salvando...' : 'Salvar Anamnese' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Histórico de Anamneses Salvas do Paciente -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <span class="material-icons">history</span>
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-white text-sm">Registros Anteriores do Paciente</h3>
                <p class="text-xs text-slate-500">{{ records().length }} anamnese(s) registradas</p>
              </div>
            </div>
          </div>

          @if (records().length === 0) {
            <div class="text-center py-8 text-slate-400">
              <span class="material-icons text-3xl">assignment_ind</span>
              <p class="text-xs font-medium mt-1">Nenhum registro anterior para este paciente.</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              @for (r of records(); track r.id) {
                <div class="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ r.queixaPrincipal || 'Anamnese Clínica' }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ r.createdAt | date:'dd/MM/yyyy • HH:mm' }} · {{ r.autor?.name || 'Profissional' }}</p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" (click)="loadForEdit(r)" class="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors" title="Editar">
                      <span class="material-icons text-base">edit</span>
                    </button>
                    <button type="button" (click)="deleteRecord(r)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors" title="Excluir">
                      <span class="material-icons text-base">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>

    <!-- Modal de Visualização & Impressão A4 Timbrado -->
    @if (showPrintModal()) {
      <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in">
        <div class="bg-white text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-10 my-8 space-y-6 relative border border-slate-200">
          
          <!-- Botões da Modal -->
          <div class="flex items-center justify-between border-b pb-4">
            <span class="text-xs font-black uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <span class="material-icons text-sm">print</span> Visualização A4 Timbrado Oficial
            </span>
            <div class="flex items-center gap-2">
              <button type="button" (click)="printDocument()"
                class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5">
                <span class="material-icons text-sm">print</span> Imprimir / Salvar PDF
              </button>
              <button type="button" (click)="showPrintModal.set(false)"
                class="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <!-- Folha A4 Timbrada -->
          <div id="anamnese-a4-print-sheet" class="p-8 bg-white border border-slate-300 rounded-xl text-xs space-y-4 font-sans leading-relaxed">
            <!-- Cabeçalho Oficial com a Logomarca da Vilma -->
            <div class="flex items-center justify-between border-b-2 border-slate-300 pb-4 mb-4">
              <div class="flex items-center gap-3">
                <img src="/assets/images/logo-vilma-transparente.png" alt="Vilma Sousa Neuropsicopedagoga"
                  class="h-16 w-auto max-w-[240px] object-contain">
              </div>
              <div class="text-right">
                <h3 class="font-black text-sm uppercase text-slate-800 tracking-tight">Anamnese Clínica</h3>
                <p class="text-[11px] text-slate-500 font-bold">Avaliação Neuropsicopedagógica</p>
                <p class="text-[10px] text-slate-400">Redenção - CE</p>
              </div>
            </div>

            <!-- Dados I -->
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p><strong>Paciente:</strong> {{ v.nomePaciente || '—' }} &nbsp;|&nbsp; <strong>Data Nasc:</strong> {{ v.dataNascimento | date:'dd/MM/yyyy' }} ({{ v.idadeFormatada || '—' }})</p>
              <p><strong>Escola:</strong> {{ v.escola || '—' }} &nbsp;|&nbsp; <strong>Série:</strong> {{ v.serie || '—' }} &nbsp;|&nbsp; <strong>Turno:</strong> {{ v.turno || '—' }}</p>
              <p><strong>Responsável:</strong> {{ v.nomeResponsavel || '—' }} &nbsp;|&nbsp; <strong>Telefones:</strong> {{ v.telefonesContato || '—' }}</p>
              <p><strong>Endereço:</strong> {{ v.enderecoResidencial || '—' }}</p>
            </div>

            <!-- II -->
            <div>
              <p class="font-bold text-slate-900 border-b pb-1">II. MOTIVO DA CONSULTA & QUEIXA</p>
              <p class="mt-1"><strong>Queixa Principal:</strong> {{ v.queixaPrincipal || '—' }}</p>
              <p class="mt-0.5"><strong>História da Queixa:</strong> {{ v.historiaQueixa || '—' }}</p>
            </div>

            <!-- IV -->
            <div>
              <p class="font-bold text-slate-900 border-b pb-1">IV. ANTECEDENTES PESSOAIS</p>
              <p class="mt-1">
                <strong>Concepção:</strong> Desejada: {{ v.concepcaoDesejada }} • Pré-natal: {{ v.concepcaoPrenatal }} • Idade gravidez: {{ v.idadeGravidez || '—' }}
              </p>
              <p><strong>Gestação:</strong> {{ v.gestacaoEmocional || 'Tranquila' }} • Complicações: {{ v.gestacaoComplicacoes }}</p>
              <p>
                <strong>Parto:</strong> {{ v.partoCondicao }} • Prematuro: {{ v.partoPrematuro }} • Peso/Medida: {{ v.partoPeso || '—' }}, {{ v.partoTamanhoApgar || '—' }}
              </p>
            </div>

            <!-- V e VI -->
            <div>
              <p class="font-bold text-slate-900 border-b pb-1">V e VI. DESENVOLVIMENTO PSICOMOTOR</p>
              <p class="mt-1">
                <strong>Marcos Motores:</strong> Sustentou cabeça ({{ v.motorCabeca || '—' }}), Sentou ({{ v.motorSentou || '—' }}), Engatinhou ({{ v.motorEngatinhou || '—' }}), Andou ({{ v.motorAndou || '—' }})
              </p>
              <p><strong>Lateralidade:</strong> {{ v.motorLateralidade }} • Desfralde: {{ v.esfincterDesfralde || '—' }}</p>
              <p>
                <strong>Esfíncteres:</strong> Vesical diurno ({{ v.esfincterVesicalDiurno }}), Anal diurno ({{ v.esfincterAnalDiurno }}), Vesical noturno ({{ v.esfincterVesicalNoturno }})
              </p>
            </div>

            <!-- VII a XI -->
            <div>
              <p class="font-bold text-slate-900 border-b pb-1">LINGUAGEM, SOCIABILIDADE E REAÇÕES</p>
              <p class="mt-1"><strong>Linguagem:</strong> Primeiras palavras: {{ v.linguagemPrimeirasPalavras || '—' }} • Dificuldades: {{ v.linguagemProblemas }}</p>
              <p><strong>Sociabilidade:</strong> Amigos: {{ v.socialAmigos }} • Com adultos: {{ v.socialAdultos }}</p>
              <p><strong>Temperamento:</strong> {{ v.emocionalTemperamento }} • Choro fácil: {{ v.emocionalChora }}</p>
            </div>

            <!-- XII e XV -->
            <div>
              <p class="font-bold text-slate-900 border-b pb-1">DOENÇAS E ESCOLARIDADE</p>
              <p class="mt-1"><strong>Medicação atual:</strong> {{ v.doencasMedicacao }} • {{ v.doencasTratamentos || 'Sem tratamentos prévios' }}</p>
              <p><strong>Adaptação Escolar:</strong> Dificuldades: {{ v.escolaAdaptacao }} • Reprovação: {{ v.escolaReprovacao }}</p>
            </div>

            <!-- Fechamento -->
            <div class="pt-8 text-right">
              <p>{{ v.cidadeDataEmissao || formattedCurrentDate() }}</p>
            </div>

            <div class="pt-10 text-center">
              <div class="w-64 border-t border-slate-900 mx-auto mb-1"></div>
              <p class="font-black text-slate-900">{{ v.assinaturaProfissional || 'Dra. Vilma Sousa' }}</p>
              <p class="text-[10px] text-slate-500">Neuropsicopedagoga Clínica • Avaliação e Intervenção do Neurodesenvolvimento</p>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- Modal Scanner IA -->
    @if (showScannerModal()) {
      <app-ficha-scanner-modal
        [title]="'Escanear Folha de Anamnese'"
        [tipoFicha]="'ANAMNESE'"
        (scanned)="onFichaScanned($event)"
        (cancelled)="showScannerModal.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
    .form-input {
      @apply w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all;
    }
    .form-textarea {
      @apply w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-y;
    }
    .chip-btn {
      @apply px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 active:scale-95 select-none;
    }
    .chip-btn.active {
      @apply bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/30;
    }
  `]
})
export class AnamneseFormComponent implements OnInit {
  private service = inject(AnamneseService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  isEdit = false;
  id = '';
  saving = signal(false);
  pacientes = signal<any[]>([]);
  records = signal<any[]>([]);
  editingId = signal('');
  currentStep = signal(0);
  showScannerModal = signal(false);
  showPrintModal = signal(false);
  selectedModel = signal<'vilma' | 'padrao'>('vilma');
  now = new Date();
  formattedCurrentDate = computed(() => {
    const d = new Date();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `Redenção, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  });

  // Model da Anamnese (16 Eixos)
  v: any = {
    nomePaciente: '',
    dataNascimento: '',
    idadeFormatada: '',
    serie: '',
    turno: 'Manhã',
    escola: '',
    telefoneEscola: '',
    enderecoEscola: '',
    nomeResponsavel: '',
    profissaoPai: '',
    idadePai: '',
    escolaridadePai: 'Médio',
    profissaoMae: '',
    idadeMae: '',
    escolaridadeMae: 'Superior',
    enderecoResidencial: '',
    telefonesContato: '',
    indicacaoTratamento: '',
    queixaPrincipal: '',
    historiaQueixa: '',
    constelacaoFamiliar: [] as any[],
    concepcaoDesejada: 'Sim',
    concepcaoPrenatal: 'Sim',
    idadeGravidez: '',
    observacoesConcepcao: '',
    gestacaoEmocional: 'Tranquila',
    gestacaoComplicacoes: 'Não',
    gestacaoMesComplicacao: '',
    gestacaoIntercorrencias: '',
    partoMaternidade: '',
    parto24h: '',
    partoCondicao: 'Cesárea',
    partoTempo: '',
    partoPrematuro: 'A Termo (Não)',
    partoPrematuroSemanas: '',
    partoPeso: '',
    partoTamanhoApgar: '',
    observacoesParto: '',
    recursosAdicionais: ['Nenhum'] as string[],
    recursosOutros: '',
    alimentacaoMamou: 'Sim',
    alimentacaoMamouTempo: '',
    alimentacaoSolidos: '',
    alimentacaoMamadeira: 'Não',
    alimentacaoDentes: '',
    alimentacaoProblemas: 'Não',
    alimentacaoAtitudeFamilia: '',
    sonoLocalNascimento: 'Berço no quarto dos pais',
    sonoQuartoSozinho: '',
    sonoInfancia: 'Tranquilo',
    sonoAtual: 'Bom / Contínuo',
    motorCabeca: '',
    motorSentou: '',
    motorEngatinhou: '',
    motorFicouEmPe: '',
    motorAndou: '',
    motorCair: 'Não',
    motorMachucar: 'Não',
    motorLateralidade: 'Destro',
    esfincterDesfralde: '',
    esfincterAprendizagem: 'Com facilidade',
    esfincterVesicalDiurno: 'Controlado',
    esfincterAnalDiurno: 'Controlado',
    esfincterVesicalNoturno: 'Controlado',
    esfincterAnalNoturno: 'Controlado',
    linguagemPrimeirasPalavras: '',
    linguagemProblemas: 'Não',
    linguagemAtitudePais: '',
    socialInteracao: '',
    socialAmigos: 'Sim',
    socialBrincadeiras: '',
    socialAdultos: 'Sociável',
    socialAtitudeFamiliar: '',
    emocionalTemperamento: 'Calmo / Tranquilo',
    emocionalChora: 'Não',
    emocionalMedos: '',
    sexualidadeCuriosidade: 'Não',
    sexualidadeOrientacao: '',
    sexualidadePreocupacao: '',
    manipulacaoChupeta: 'Não',
    manipulacaoTiques: 'Não',
    manipulacaoOutras: '',
    doencasInfantisCirurgias: '',
    doencasTraumatismos: '',
    doencasAtual: 'Não',
    doencasMedicacao: '',
    doencasTratamentos: '',
    antecedentesFamiliares: '',
    aspectosCasal: 'Harmonioso',
    aspectosMelhorVinculo: '',
    aspectosLazer: '',
    escolaInicioIdade: '',
    escolaAdaptacao: 'Não',
    escolaReprovacao: 'Não',
    escolaTarefas: '',
    escolaOpiniaoProfessora: '',
    outrasInformacoes: '',
    cidadeDataEmissao: 'Redenção, ' + new Date().toLocaleDateString('pt-BR'),
    assinaturaProfissional: 'Dra. Vilma Sousa • Neuropsicopedagoga'
  };

  form: any = {
    pacienteId: '',
    queixaPrincipal: '',
    historiaQueixa: '',
    turno: '',
    telefoneEscola: '',
    enderecoEscola: '',
    constelacaoFamiliar: []
  };

  stepsVilma = [
    { id: 'identificacao', title: '1. Identificação' },
    { id: 'constelacao', title: '2. Família' },
    { id: 'antecedentes', title: '3. Parto/Gestação' },
    { id: 'desenvolvimento', title: '4. Motor & Sono' },
    { id: 'linguagem', title: '5. Fala & Social' },
    { id: 'emocoes', title: '6. Emoções' },
    { id: 'saude', title: '7. Doenças' },
    { id: 'escola', title: '8. Escola & Conclusão' }
  ];

  stepsPadrao = [
    { id: 'identificacao', title: 'Identificação' },
    { id: 'constelacao', title: 'Constelação Familiar' },
    { id: 'motivo', title: 'Motivo da Consulta' },
    { id: 'saude', title: 'Saúde & Hábitos' },
    { id: 'desenvolvimento', title: 'Desenvolvimento' }
  ];

  activeSteps = computed(() => this.selectedModel() === 'vilma' ? this.stepsVilma : this.stepsPadrao);
  isVilmaModel = computed(() => this.selectedModel() === 'vilma');

  selectedPatient = computed(() => {
    return this.pacientes().find(p => p.id === this.form.pacienteId) || null;
  });

  calculatedAge = computed(() => {
    return this.v.idadeFormatada || '';
  });

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || '';
    this.isEdit = !!this.id;

    this.api.get('/pacientes').subscribe((res: any) => {
      this.pacientes.set(res.data || []);
      if (this.isEdit) {
        this.loadExisting();
      }
    });
  }

  loadExisting() {
    this.service.get(this.id).subscribe((res: any) => {
      this.form.pacienteId = res.pacienteId;
      this.form.queixaPrincipal = res.queixaPrincipal;
      this.form.historiaQueixa = res.historiaQueixa;

      if (res.observacoes && typeof res.observacoes === 'string' && res.observacoes.startsWith('{')) {
        try {
          const parsed = JSON.parse(res.observacoes);
          this.v = { ...this.v, ...parsed };
          if (parsed.constelacaoFamiliar) {
            this.v.constelacaoFamiliar = parsed.constelacaoFamiliar;
          }
        } catch {}
      } else {
        // Fallback campos normais
        this.v.queixaPrincipal = res.queixaPrincipal || '';
        this.v.historiaQueixa = res.historiaQueixa || '';
        this.v.turno = res.turno || 'Manhã';
        this.v.telefoneEscola = res.telefoneEscola || '';
      }

      this.onPacienteSelected();
      this.loadRecords();
    });
  }

  onPacienteSelected() {
    if (!this.form.pacienteId) return;

    this.api.get('/pacientes/' + this.form.pacienteId).subscribe((res: any) => {
      const p = res;
      this.v.nomePaciente = p.name || '';
      this.v.dataNascimento = p.birthDate || '';
      this.v.serie = p.grade || '';
      if (p.schoolShift) {
        this.v.turno = p.schoolShift === 'tarde' ? 'Tarde' : p.schoolShift === 'integral' ? 'Integral' : 'Manhã';
      }

      // Escola
      if (p.school) {
        this.v.escola = p.school.name || p.school;
        this.v.telefoneEscola = p.school.phone || '';
        if (p.school.street) {
          this.v.enderecoEscola = `${p.school.street}${p.school.number ? ', ' + p.school.number : ''} - ${p.school.city || ''}`;
        }
      }

      // Responsável
      if (p.responsible) {
        this.v.nomeResponsavel = p.responsible.name || '';
        this.v.telefonesContato = p.responsible.phones || p.phone || '';
        if (p.responsible.street) {
          this.v.enderecoResidencial = `${p.responsible.street}${p.responsible.number ? ', ' + p.responsible.number : ''} - ${p.responsible.city || ''}`;
        }
      } else {
        this.v.telefonesContato = p.phone || '';
      }

      if (p.notes && !this.v.queixaPrincipal) {
        this.v.queixaPrincipal = p.notes;
      }
      if (p.diagnosis && !this.v.doencasAtual) {
        this.v.doencasAtual = p.diagnosis;
      }

      this.recalculateAge();
      this.loadRecords();
    });
  }

  recalculateAge() {
    if (!this.v.dataNascimento) return;
    try {
      const bDate = new Date(this.v.dataNascimento);
      if (isNaN(bDate.getTime())) return;
      const now = new Date();
      let years = now.getFullYear() - bDate.getFullYear();
      let months = now.getMonth() - bDate.getMonth();
      if (now.getDate() < bDate.getDate()) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
      this.v.idadeFormatada = `${years} anos e ${months} meses`;
    } catch {}
  }

  addFamilyMember() {
    this.v.constelacaoFamiliar.push({ nome: '', parentesco: '', ocupacao: '', idade: '', sexo: 'F' });
  }

  removeFamilyMember(i: number) {
    this.v.constelacaoFamiliar.splice(i, 1);
  }

  toggleRecurso(r: string) {
    if (r === 'Nenhum') {
      this.v.recursosAdicionais = ['Nenhum'];
      return;
    }
    this.v.recursosAdicionais = this.v.recursosAdicionais.filter((x: string) => x !== 'Nenhum');
    const idx = this.v.recursosAdicionais.indexOf(r);
    if (idx >= 0) {
      this.v.recursosAdicionais.splice(idx, 1);
      if (this.v.recursosAdicionais.length === 0) this.v.recursosAdicionais.push('Nenhum');
    } else {
      this.v.recursosAdicionais.push(r);
    }
  }

  hasRecurso(r: string): boolean {
    return this.v.recursosAdicionais && this.v.recursosAdicionais.includes(r);
  }

  nextStep() {
    if (this.currentStep() < this.activeSteps().length - 1) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  openPrintPreview() {
    if (!this.form.pacienteId) {
      this.toast.warning('Selecione um paciente para visualizar a ficha timbrada.');
      return;
    }
    this.showPrintModal.set(true);
  }

  printDocument() {
    window.print();
  }

  loadRecords() {
    if (!this.form.pacienteId) return;
    this.api.get('/anamneses', { pacienteId: this.form.pacienteId }).subscribe((res: any) => {
      this.records.set(res.data || []);
    });
  }

  loadForEdit(r: any) {
    this.editingId.set(r.id);
    if (r.observacoes && typeof r.observacoes === 'string' && r.observacoes.startsWith('{')) {
      try {
        const parsed = JSON.parse(r.observacoes);
        this.v = { ...this.v, ...parsed };
      } catch {}
    } else {
      this.v.queixaPrincipal = r.queixaPrincipal || '';
      this.v.historiaQueixa = r.historiaQueixa || '';
    }
    this.currentStep.set(0);
    this.toast.info('Dados carregados no formulário');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  async deleteRecord(r: any) {
    const ok = await this.dialog.confirm('Excluir esta anamnese permanentemente?', 'Confirmar Exclusão', { dangerMode: true, confirmText: 'Excluir' });
    if (!ok) return;
    this.api.delete(`/anamneses/${r.id}`).subscribe({
      next: () => {
        this.toast.success('Anamnese excluída');
        this.loadRecords();
      },
      error: () => this.toast.error('Erro ao excluir')
    });
  }

  save() {
    if (!this.form.pacienteId) return this.toast.warning('Selecione um paciente');
    if (!this.v.queixaPrincipal) return this.toast.warning('Preencha a queixa principal');

    this.saving.set(true);

    const payload = {
      pacienteId: this.form.pacienteId,
      status: 'CONCLUIDA',
      queixaPrincipal: this.v.queixaPrincipal,
      historiaQueixa: this.v.historiaQueixa,
      turno: this.v.turno,
      telefoneEscola: this.v.telefoneEscola,
      enderecoEscola: this.v.enderecoEscola,
      indicacaoTratamento: this.v.indicacaoTratamento,
      profissaoPai: this.v.profissaoPai,
      idadePai: this.v.idadePai ? String(this.v.idadePai) : '',
      escolaridadePai: this.v.escolaridadePai,
      profissaoMae: this.v.profissaoMae,
      idadeMae: this.v.idadeMae ? String(this.v.idadeMae) : '',
      escolaridadeMae: this.v.escolaridadeMae,
      constelacaoFamiliar: JSON.stringify(this.v.constelacaoFamiliar || []),
      gestacao: `Emocional: ${this.v.gestacaoEmocional || ''} • Complicações: ${this.v.gestacaoComplicacoes || ''}`,
      parto: `Condição: ${this.v.partoCondicao} • Prematuro: ${this.v.partoPrematuro} • Peso: ${this.v.partoPeso || ''}`,
      desenvolvimentoMotor: `Cabeça: ${this.v.motorCabeca || ''} • Sentou: ${this.v.motorSentou || ''} • Andou: ${this.v.motorAndou || ''} • Lateralidade: ${this.v.motorLateralidade}`,
      sono: `Infância: ${this.v.sonoInfancia} • Atual: ${this.v.sonoAtual}`,
      alimentacao: `Mamou: ${this.v.alimentacaoMamou} (${this.v.alimentacaoMamouTempo || ''}) • Problemas: ${this.v.alimentacaoProblemas}`,
      desenvolvimentoLinguagem: `Primeiras palavras: ${this.v.linguagemPrimeirasPalavras || ''} • Problemas: ${this.v.linguagemProblemas}`,
      interacaoSocial: `Amigos: ${this.v.socialAmigos} • Brincadeiras: ${this.v.socialBrincadeiras || ''}`,
      observacoesComportamentais: `Temperamento: ${this.v.emocionalTemperamento} • Choro: ${this.v.emocionalChora}`,
      medicacoes: this.v.doencasMedicacao || '',
      historicoEscolar: `Início: ${this.v.escolaInicioIdade || ''} • Reprovação: ${this.v.escolaReprovacao}`,
      // Salva a estrutura completa serializada para reabertura com 100% de fidelidade
      observacoes: JSON.stringify(this.v)
    };

    const targetId = this.editingId() || (this.isEdit ? this.id : '');
    const req = targetId ? this.service.update(targetId, payload) : this.service.create(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Anamnese Oficial Dra. Vilma salva com sucesso!');
        this.loadRecords();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error('Erro ao salvar anamnese: ' + (err?.error?.error || err.message));
      }
    });
  }

  onFichaScanned(res: ScanResult) {
    this.showScannerModal.set(false);
    if (!res) return;
    if (res.anamnese) {
      const a = res.anamnese;
      if (a.queixaPrincipal) this.v.queixaPrincipal = a.queixaPrincipal;
      if (a.turno) this.v.turno = a.turno;
      if (a.telefoneEscola) this.v.telefoneEscola = a.telefoneEscola;
    }
    this.toast.success('Dados extraídos da imagem preenchidos!');
  }
}
