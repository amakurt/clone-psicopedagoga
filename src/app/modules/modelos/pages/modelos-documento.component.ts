import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DOC_TEMPLATES,
  DOC_CATEGORIES,
  DocTemplate,
  replaceDocPlaceholders,
  formatDocBlankPlaceholders
} from '@core/data/doc-templates.data';
import { ClinicalDocEditorComponent } from '@shared/components/clinical-doc-editor/clinical-doc-editor.component';
import { ToastService } from '@shared/components/toast.component';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-modelos-documento',
  standalone: true,
  imports: [CommonModule, FormsModule, ClinicalDocEditorComponent],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Modelos de Documentos Clínicos</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {{ allItems.length }} disponíveis
            </span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Templates profissionais categorizados para diagnósticos, avaliações, pareceres, PEI, contratos e recibos
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openNewTemplateModal()"
            class="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95">
            <span class="material-icons text-sm">add_circle</span>
            Novo Modelo Personalizado
          </button>
        </div>
      </div>

      <!-- Quick Metrics / Stats Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">verified</span>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Modelos Oficiais</div>
            <div class="text-lg font-black text-slate-900 dark:text-white">{{ officialCount }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">bookmark</span>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Meus Modelos</div>
            <div class="text-lg font-black text-slate-900 dark:text-white">{{ customTemplates().length }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">folder_special</span>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Categorias</div>
            <div class="text-lg font-black text-slate-900 dark:text-white">{{ categories.length }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">star</span>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Favoritos</div>
            <div class="text-lg font-black text-slate-900 dark:text-white">{{ favoriteCount }}</div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white shadow-sm"
          [(ngModel)]="searchTerm" (ngModelChange)="filterItems()" placeholder="Buscar modelos por nome, diagnóstico, CID, lei ou categoria...">
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap gap-2">
        <button (click)="filterCategory.set(''); filterItems()"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          [class]="filterCategory() === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
          Todos ({{ allItems.length }})
        </button>

        <!-- Custom Only filter pill -->
        @if (customTemplates().length > 0) {
          <button (click)="filterCategory.set('MEUS_MODELOS'); filterItems()"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            [class]="filterCategory() === 'MEUS_MODELOS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800 hover:ring-amber-500'">
            <span class="material-icons text-[14px]">bookmark</span>
            Meus Modelos ({{ customTemplates().length }})
          </button>
        }

        @for (cat of categories; track cat.value) {
          <button (click)="filterCategory.set(cat.value); filterItems()"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            [class]="filterCategory() === cat.value ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
            {{ cat.label }} ({{ getCategoryCount(cat.value) }})
          </button>
        }
      </div>

      <!-- Grid of Templates -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (item of filteredItems(); track item.id) {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:ring-primary/40 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group relative">
            <div>
              <div class="h-24 flex items-center justify-center transition-transform group-hover:scale-105 relative" [class]="getCategoryBg(item.category)">
                <span class="material-icons text-3xl opacity-70">{{ getCategoryIcon(item.category) }}</span>

                <!-- Badge: Custom vs Oficial -->
                <div class="absolute top-3 left-3">
                  @if (item.isCustom) {
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                      <span class="material-icons text-[12px]">edit</span> Meu Modelo
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/70 text-white backdrop-blur-sm">
                      <span class="material-icons text-[12px]">verified</span> Oficial
                    </span>
                  }
                </div>
              </div>

              <div class="p-5">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors">
                    {{ item.name }}
                  </h3>
                  <button (click)="toggleFavorite(item.id)"
                    class="p-1 rounded-lg transition-all shrink-0"
                    [class]="item.favorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'"
                    title="Favoritar modelo">
                    <span class="material-icons text-lg">{{ item.favorite ? 'star' : 'star_border' }}</span>
                  </button>
                </div>

                <div class="flex items-center gap-1.5 mb-2.5 flex-wrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [class]="getCategoryStyle(item.category)">
                    {{ item.category }}
                  </span>
                  @if (item.isCustom) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Sincronizado no banco
                    </span>
                  }
                </div>

                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {{ item.description || 'Modelo clínico completo com estrutura validada.' }}
                </p>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="p-5 pt-0 space-y-2">
              <div class="flex gap-2">
                <button (click)="useTemplate(item)"
                  class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                  <span class="material-icons text-sm">edit_note</span> Visualizar & Editar
                </button>
                <button (click)="openPatientSelector(item, 'print')"
                  class="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                  title="Imprimir Modelo (com Paciente ou em Branco)">
                  <span class="material-icons text-sm">print</span>
                </button>
                <button (click)="openPatientSelector(item, 'download')"
                  class="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-500 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                  title="Baixar em PDF">
                  <span class="material-icons text-sm">picture_as_pdf</span>
                </button>
                <button (click)="createLaudoFromTemplate(item)"
                  class="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                  title="Criar Laudo com este Modelo">
                  <span class="material-icons text-sm">send</span>
                </button>
              </div>

              <!-- Delete custom model button if custom -->
              @if (item.isCustom) {
                <div class="flex justify-end pt-1">
                  <button (click)="deleteCustomTemplate(item)"
                    class="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors">
                    <span class="material-icons text-xs">delete</span> Excluir meu modelo
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (filteredItems().length === 0) {
        <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">search_off</span>
          <p class="text-slate-500 font-semibold mt-3">Nenhum modelo encontrado para sua busca</p>
          <button (click)="searchTerm = ''; filterCategory.set(''); filterItems()"
            class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold">
            Limpar Filtros
          </button>
        </div>
      }

      <!-- Interactive A4 Editor Modal -->
      @if (editingTemplate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="closeEditorModal()"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-hidden flex flex-col z-10 animate-in border border-slate-200 dark:border-slate-800">
            
            <!-- Modal Header -->
            <div class="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-icons">description</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {{ editingTemplate()!.name }}
                    </h2>
                    @if (editingTemplate()!.isCustom) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                        Meu Modelo
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                        Modelo Oficial
                      </span>
                    }
                  </div>
                  <p class="text-xs text-slate-500">Editor Visual A4 • Categoria {{ editingTemplate()!.category }}</p>
                </div>
              </div>

              <!-- Header Action Buttons -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Save Copy / Save Changes -->
                @if (editingTemplate()!.isCustom) {
                  <button (click)="updateCustomTemplate(editingTemplate()!.id)" [disabled]="isSaving()"
                    class="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Salvar alterações no banco de dados da clínica">
                    <span class="material-icons text-sm">save</span>
                    {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
                  </button>
                } @else {
                  <button (click)="saveAsCopy(editingTemplate()!)" [disabled]="isSaving()"
                    class="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Salvar uma cópia personalizada editável no banco da clínica">
                    <span class="material-icons text-sm">content_copy</span>
                    {{ isSaving() ? 'Copiando...' : 'Salvar como Cópia' }}
                  </button>
                }

                <!-- Print with quick selector -->
                <button (click)="openPatientSelector(editingTemplate()!, 'print', editContent)"
                  class="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                  title="Imprimir documento">
                  <span class="material-icons text-sm">print</span>
                  Imprimir
                </button>

                <!-- PDF with quick selector -->
                <button (click)="openPatientSelector(editingTemplate()!, 'download', editContent)"
                  class="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                  title="Baixar em PDF">
                  <span class="material-icons text-sm text-red-500">picture_as_pdf</span>
                  PDF
                </button>

                <!-- Create Laudo from Template -->
                <button (click)="createLaudoFromTemplate(editingTemplate()!)"
                  class="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-xs transition-all shadow-md active:scale-95">
                  <span class="material-icons text-sm">assignment</span>
                  Criar Laudo
                </button>

                <!-- Close Modal -->
                <button (click)="closeEditorModal()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>

            <!-- Modal Content (Clinical A4 Document Editor) -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60">
              <app-clinical-doc-editor
                [content]="editContent"
                (contentChange)="editContent = $event">
              </app-clinical-doc-editor>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Quick Patient Selector for Print & PDF -->
      @if (showPatientSelectorModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showPatientSelectorModal.set(false)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 z-10 animate-in border border-slate-200 dark:border-slate-800 space-y-5">
            
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  [class]="patientSelectorAction() === 'print' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : 'bg-red-50 dark:bg-red-950/40 text-red-600'">
                  <span class="material-icons text-2xl">
                    {{ patientSelectorAction() === 'print' ? 'print' : 'picture_as_pdf' }}
                  </span>
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">
                    {{ patientSelectorAction() === 'print' ? 'Imprimir Documento' : 'Gerar Documento em PDF' }}
                  </h3>
                  <p class="text-xs text-slate-500">
                    {{ targetTemplate()?.name }}
                  </p>
                </div>
              </div>
              <button (click)="showPatientSelectorModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Como você deseja preparar este documento antes de {{ patientSelectorAction() === 'print' ? 'imprimir' : 'baixar' }}?
            </p>

            <!-- Option 1: Autofill with real registered patient -->
            <div class="p-4 rounded-2xl border-2 transition-all"
              [class]="useBlankSheet() ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30' : 'border-primary bg-primary/5 dark:bg-primary/10'">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="fillType" [checked]="!useBlankSheet()" (change)="useBlankSheet.set(false)" class="mt-1 text-primary focus:ring-primary">
                <div class="flex-1">
                  <div class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span class="material-icons text-base text-primary">person</span>
                    Preencher Automaticamente com Paciente Real
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Substitui tags como nome, idade, escola e responsável pelos dados cadastrados.
                  </p>

                  @if (!useBlankSheet()) {
                    <div class="mt-3">
                      <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Selecione o Paciente:
                      </label>
                      <select [(ngModel)]="selectedPatientId"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                        <option value="">-- Escolha um paciente cadastrado --</option>
                        @for (p of pacientes(); track p.id) {
                          <option [value]="p.id">
                            {{ p.name }} {{ p.grade ? '• ' + p.grade : '' }} {{ p.school?.name ? '• ' + p.school.name : '' }}
                          </option>
                        }
                      </select>

                      @if (selectedPatientId()) {
                        @let p = getSelectedPatient();
                        @if (p) {
                          <div class="mt-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-700">
                            <div><strong>Nome:</strong> {{ p.name }}</div>
                            <div><strong>Responsável:</strong> {{ p.responsible?.name || p.responsibleName || 'Não informado' }}</div>
                            <div><strong>Escola:</strong> {{ p.school?.name || p.schoolName || 'Não informada' }}</div>
                          </div>
                        }
                      }
                    </div>
                  }
                </div>
              </label>
            </div>

            <!-- Option 2: Blank / Handwriting sheet -->
            <div class="p-4 rounded-2xl border-2 transition-all"
              [class]="useBlankSheet() ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="fillType" [checked]="useBlankSheet()" (change)="useBlankSheet.set(true)" class="mt-1 text-primary focus:ring-primary">
                <div class="flex-1">
                  <div class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span class="material-icons text-base text-amber-500">edit_note</span>
                    Gerar em Branco (Ficha para Preenchimento Manual)
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Substitui as tags por linhas e campos em branco para preenchimento manual com caneta durante a consulta ou visita escolar.
                  </p>
                </div>
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button (click)="showPatientSelectorModal.set(false)"
                class="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Cancelar
              </button>

              <button (click)="executeFinalExport()" [disabled]="!useBlankSheet() && !selectedPatientId()"
                class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
                <span class="material-icons text-sm">
                  {{ patientSelectorAction() === 'print' ? 'print' : 'download' }}
                </span>
                {{ patientSelectorAction() === 'print' ? 'Prosseguir para Impressão' : 'Baixar PDF Agora' }}
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Modal: Create New Custom Template from Scratch -->
      @if (showNewTemplateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showNewTemplateModal.set(false)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 z-10 animate-in border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-icons">post_add</span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">Novo Modelo Personalizado</h3>
                  <p class="text-xs text-slate-500">Crie um novo template e salve no banco da clínica</p>
                </div>
              </div>
              <button (click)="showNewTemplateModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
                <span class="material-icons">close</span>
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Modelo *</label>
                <input [(ngModel)]="newTemplateName" placeholder="Ex: Roteiro de Entrevista com Professores"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                <select [(ngModel)]="newTemplateCategory"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                  @for (cat of categories; track cat.value) {
                    <option [value]="cat.value">{{ cat.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição Breve</label>
                <input [(ngModel)]="newTemplateDescription" placeholder="Ex: Modelo de avaliação comportamental e cognitiva"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button (click)="showNewTemplateModal.set(false)"
                class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                Cancelar
              </button>
              <button (click)="createNewCustomTemplate()" [disabled]="!newTemplateName.trim() || isSaving()"
                class="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-md active:scale-95 disabled:opacity-50">
                <span class="material-icons text-sm">check</span>
                {{ isSaving() ? 'Criando...' : 'Criar & Abrir no Editor' }}
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ModelosDocumentoComponent implements OnInit {
  private router = inject(Router);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  searchTerm = '';
  filterCategory = signal('');
  editingTemplate = signal<DocTemplate | null>(null);
  editContent = '';
  isSaving = signal(false);

  // Custom templates fetched from database
  customTemplates = signal<DocTemplate[]>([]);
  officialTemplates: DocTemplate[] = DOC_TEMPLATES;
  allItems: DocTemplate[] = DOC_TEMPLATES;
  filteredItems = signal<DocTemplate[]>(this.allItems);

  // Patients for autofill
  pacientes = signal<any[]>([]);

  // Modals state
  showPatientSelectorModal = signal(false);
  patientSelectorAction = signal<'print' | 'download'>('print');
  targetTemplate = signal<DocTemplate | null>(null);
  targetContent = signal<string>('');
  selectedPatientId = signal<string>('');
  useBlankSheet = signal<boolean>(false);

  // New template modal
  showNewTemplateModal = signal(false);
  newTemplateName = '';
  newTemplateCategory = 'Avaliação';
  newTemplateDescription = '';

  categories = DOC_CATEGORIES;

  get officialCount(): number {
    return this.officialTemplates.length;
  }

  get favoriteCount(): number {
    return this.allItems.filter(i => i.favorite).length;
  }

  ngOnInit() {
    this.refreshAllItems();
    this.loadCustomTemplates();
    this.loadPacientes();
  }

  loadCustomTemplates() {
    this.api.get('/modelos').subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        const mapped: DocTemplate[] = list.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          category: item.category || 'Avaliação',
          favorite: !!item.favorite,
          isCustom: true,
          content: item.content
        }));
        this.customTemplates.set(mapped);
        this.refreshAllItems();
      },
      error: (err) => {
        console.warn('Não foi possível carregar modelos customizados:', err);
      }
    });
  }

  loadPacientes() {
    this.api.get('/pacientes').subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.pacientes.set(list);
      },
      error: (err) => {
        console.warn('Erro ao carregar lista de pacientes:', err);
      }
    });
  }

  refreshAllItems() {
    this.allItems = [...this.customTemplates(), ...this.officialTemplates];
    this.filterItems();
  }

  getCategoryCount(cat: string): number {
    return this.allItems.filter(i => i.category === cat).length;
  }

  filterItems() {
    const term = this.searchTerm.toLowerCase().trim();
    const cat = this.filterCategory();

    this.filteredItems.set(
      this.allItems.filter(item => {
        let catMatch = true;
        if (cat === 'MEUS_MODELOS') {
          catMatch = !!item.isCustom;
        } else if (cat) {
          catMatch = item.category === cat;
        }

        const searchMatch = !term ||
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          item.category.toLowerCase().includes(term);

        return catMatch && searchMatch;
      })
    );
  }

  toggleFavorite(id: string) {
    const item = this.allItems.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      if (item.isCustom) {
        this.api.put(`/modelos/${item.id}`, { favorite: item.favorite }).subscribe({
          next: () => {},
          error: () => {}
        });
      }
      this.filterItems();
    }
  }

  useTemplate(item: DocTemplate) {
    this.editingTemplate.set(item);
    this.editContent = item.content;
  }

  closeEditorModal() {
    this.editingTemplate.set(null);
  }

  // Save official template as a custom copy in database
  saveAsCopy(item: DocTemplate) {
    this.isSaving.set(true);
    const copyName = item.isCustom ? `${item.name} (Cópia)` : `${item.name} (Minha Cópia)`;
    const body = {
      name: copyName,
      description: item.description || `Cópia personalizada baseada no modelo "${item.name}"`,
      category: item.category,
      content: this.editContent || item.content,
      favorite: false
    };

    this.api.post('/modelos', body).subscribe({
      next: (created: any) => {
        this.isSaving.set(false);
        this.toast.success(`Modelo "${copyName}" salvo em "Meus Modelos"!`);
        const mapped: DocTemplate = {
          id: created.id,
          name: created.name,
          description: created.description,
          category: created.category,
          favorite: created.favorite,
          isCustom: true,
          content: created.content
        };
        this.customTemplates.set([mapped, ...this.customTemplates()]);
        this.refreshAllItems();
        // Update current editing template to the newly saved copy
        this.editingTemplate.set(mapped);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Erro ao salvar cópia do modelo:', err);
        this.toast.error('Erro ao salvar cópia do modelo no servidor.');
      }
    });
  }

  // Update existing custom template
  updateCustomTemplate(id: string, newContent?: string) {
    this.isSaving.set(true);
    const contentToSave = newContent || this.editContent;
    const current = this.editingTemplate();
    const body = {
      content: contentToSave,
      name: current?.name,
      description: current?.description,
      category: current?.category
    };

    this.api.put(`/modelos/${id}`, body).subscribe({
      next: (updated: any) => {
        this.isSaving.set(false);
        this.toast.success('Modelo atualizado com sucesso no banco!');
        this.customTemplates.set(
          this.customTemplates().map(t => t.id === id ? { ...t, content: contentToSave } : t)
        );
        this.refreshAllItems();
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Erro ao atualizar modelo:', err);
        this.toast.error('Erro ao atualizar o modelo.');
      }
    });
  }

  // Delete custom template
  deleteCustomTemplate(item: DocTemplate) {
    if (!confirm(`Deseja realmente excluir o modelo "${item.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.api.delete(`/modelos/${item.id}`).subscribe({
      next: () => {
        this.toast.success(`Modelo "${item.name}" excluído.`);
        this.customTemplates.set(this.customTemplates().filter(t => t.id !== item.id));
        this.refreshAllItems();
        if (this.editingTemplate()?.id === item.id) {
          this.editingTemplate.set(null);
        }
      },
      error: (err) => {
        console.error('Erro ao excluir modelo:', err);
        this.toast.error('Não foi possível excluir o modelo.');
      }
    });
  }

  // Open modal to create brand new template
  openNewTemplateModal() {
    this.newTemplateName = '';
    this.newTemplateCategory = 'Avaliação';
    this.newTemplateDescription = '';
    this.showNewTemplateModal.set(true);
  }

  createNewCustomTemplate() {
    if (!this.newTemplateName.trim()) return;
    this.isSaving.set(true);

    const baseContent = `<h2>${this.newTemplateName.toUpperCase()}</h2>
<h3>1. DADOS DE IDENTIFICAÇÃO</h3>
<p><strong>Paciente:</strong> {nome_paciente}</p>
<p><strong>Data de Nascimento:</strong> {data_nascimento} (Idade: {idade})</p>
<p><strong>Instituição de Ensino:</strong> {escola} — Série/Ano: {serie}</p>
<p><strong>Responsável:</strong> {nome_responsavel}</p>
<p><strong>Data:</strong> {data_atual}</p>
<br>
<h3>2. OBJETIVO & PROCEDIMENTOS</h3>
<p>Descreva aqui o objetivo do documento e os procedimentos realizados...</p>
<br>
<h3>3. OBSERVAÇÕES CLÍNICAS</h3>
<p>Registre aqui o desenvolvimento e observações...</p>
<br>
<p style="text-align: center;">{data_atual}</p>
<p style="text-align: center;">____________________________________________________<br>
<strong>{profissional_nome}</strong><br>
Registro: {registro_profissional}</p>`;

    const body = {
      name: this.newTemplateName.trim(),
      category: this.newTemplateCategory,
      description: this.newTemplateDescription.trim() || 'Modelo personalizado criado pela clínica',
      content: baseContent,
      favorite: false
    };

    this.api.post('/modelos', body).subscribe({
      next: (created: any) => {
        this.isSaving.set(false);
        this.showNewTemplateModal.set(false);
        this.toast.success(`Modelo "${created.name}" criado com sucesso!`);
        const mapped: DocTemplate = {
          id: created.id,
          name: created.name,
          description: created.description,
          category: created.category,
          favorite: created.favorite,
          isCustom: true,
          content: created.content
        };
        this.customTemplates.set([mapped, ...this.customTemplates()]);
        this.refreshAllItems();
        this.useTemplate(mapped);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Erro ao criar modelo:', err);
        this.toast.error('Erro ao salvar novo modelo.');
      }
    });
  }

  // Quick Patient Selector Modal
  openPatientSelector(item: DocTemplate, action: 'print' | 'download', currentEditContent?: string) {
    this.targetTemplate.set(item);
    this.targetContent.set(currentEditContent || item.content);
    this.patientSelectorAction.set(action);
    this.selectedPatientId.set('');
    this.useBlankSheet.set(false);
    this.showPatientSelectorModal.set(true);
  }

  getSelectedPatient(): any {
    const id = this.selectedPatientId();
    if (!id) return null;
    return this.pacientes().find(p => p.id === id);
  }

  executeFinalExport() {
    const template = this.targetTemplate();
    const rawContent = this.targetContent();
    if (!template || !rawContent) return;

    let finalContent = '';
    const user = this.auth.user();
    const profData = {
      name: user?.name || 'Dra. Vilma Rossi',
      councilNumber: user?.councilNumber || 'ABPp 1234/SP'
    };
    const clinicData = {
      name: this.auth.tenant()?.name || 'Clínica de Psicopedagogia & Neuroeducação'
    };

    if (this.useBlankSheet()) {
      finalContent = formatDocBlankPlaceholders(rawContent, profData);
    } else {
      const paciente = this.getSelectedPatient();
      finalContent = replaceDocPlaceholders(rawContent, paciente, profData, clinicData);
    }

    const action = this.patientSelectorAction();
    this.showPatientSelectorModal.set(false);

    if (action === 'print') {
      this.triggerSafePrint(template.name, finalContent);
    } else {
      this.triggerPdfDownload(template.name, finalContent);
    }
  }

  triggerSafePrint(title: string, content: string) {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              color: #0f172a;
              background: #f8fafc;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.6;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print-bar {
              position: sticky;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: #ffffff;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
              z-index: 99999;
            }
            .no-print-bar button {
              cursor: pointer;
              font-family: inherit;
              font-size: 13px;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 8px;
              border: none;
              transition: opacity 0.2s;
            }
            .btn-back {
              background: #ffffff;
              color: #0f172a;
            }
            .btn-print {
              background: #007F80;
              color: #ffffff;
            }
            .a4-page {
              max-width: 800px;
              margin: 24px auto;
              background: #ffffff;
              padding: 40px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              border-radius: 12px;
            }
            h1, h2, h3, h4 {
              color: #0f172a;
              margin-top: 1.2em;
              margin-bottom: 0.5em;
              page-break-after: avoid;
              break-after: avoid;
            }
            p, table, ul, ol, li, blockquote {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 14px 0;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
            }
            @media print {
              body {
                background: #ffffff;
              }
              .no-print-bar {
                display: none !important;
              }
              .a4-page {
                box-shadow: none;
                margin: 0;
                padding: 0;
                border-radius: 0;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <button class="btn-back" onclick="window.close()">← Voltar ao Sistema</button>
            <span style="font-size: 12px; color: #94a3b8;">Dica: Selecione "Salvar como PDF" na tela de impressão para gerar arquivo digital</span>
            <button class="btn-print" onclick="window.print()">Imprimir Agora</button>
          </div>
          <div class="a4-page">
            ${content}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  triggerPdfDownload(title: string, content: string) {
    const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.background = '#ffffff';
    container.style.padding = '32px 36px';
    container.style.color = '#0f172a';
    container.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
    container.style.fontSize = '13px';
    container.style.lineHeight = '1.6';
    container.innerHTML = content;
    document.body.appendChild(container);

    const opt = {
      margin: [10, 12, 10, 12],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    this.toast.info('Gerando arquivo PDF...');

    import('html2pdf.js')
      .then((html2pdfModule: any) => {
        const html2pdf = html2pdfModule.default || html2pdfModule;
        html2pdf()
          .set(opt)
          .from(container)
          .save()
          .then(() => {
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            this.toast.success(`PDF "${filename}" baixado com sucesso!`);
          })
          .catch((err: any) => {
            console.error('Erro html2pdf:', err);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            this.toast.error('Erro ao gerar PDF. Abrindo tela para impressão...');
            this.triggerSafePrint(title, content);
          });
      })
      .catch((err: any) => {
        console.error('Erro ao carregar html2pdf.js:', err);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        this.triggerSafePrint(title, content);
      });
  }

  createLaudoFromTemplate(item: DocTemplate) {
    sessionStorage.setItem('template_title', item.name);
    sessionStorage.setItem('template_content', this.editContent || item.content);
    this.editingTemplate.set(null);
    this.toast.info(`Modelo "${item.name}" transferido para o novo laudo.`);
    this.router.navigate(['/app/laudos/novo']);
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      'Diagnóstico': 'medical_services',
      'Avaliação': 'assessment',
      'Intervenção': 'handyman',
      'Escolar': 'school',
      'Jurídico': 'gavel',
      'Família': 'family_restroom',
      'Financeiro': 'payments'
    };
    return icons[cat] || 'description';
  }

  getCategoryBg(cat: string): string {
    const bgs: Record<string, string> = {
      'Diagnóstico': 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      'Avaliação': 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      'Intervenção': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      'Escolar': 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      'Jurídico': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
      'Família': 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      'Financeiro': 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
    };
    return bgs[cat] || 'bg-slate-50 dark:bg-slate-800 text-slate-600';
  }

  getCategoryStyle(cat: string): string {
    const styles: Record<string, string> = {
      'Diagnóstico': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Avaliação': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Intervenção': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Escolar': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Jurídico': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Família': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      'Financeiro': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    };
    return styles[cat] || 'bg-slate-100 text-slate-700';
  }
}
