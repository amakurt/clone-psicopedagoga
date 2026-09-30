import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, signal, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DOC_TEMPLATES, DOC_CATEGORIES, DocTemplate, replaceDocPlaceholders } from '@core/data/doc-templates.data';
import { ToastService } from '@shared/components/toast.component';
import { AuthService } from '@core/services/auth.service';

declare var html2pdf: any;

@Component({
  selector: 'app-clinical-doc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Top Actions Bar -->
      <div class="top-actions-bar flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Button: Open Template Selector -->
          <button type="button" (click)="showTemplatesModal.set(true)"
            class="inline-flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all active:scale-95">
            <span class="material-icons text-[18px]">library_books</span>
            Inserir Modelo (37)
          </button>

          <!-- Dropdown: Smart Variables / Tags -->
          <div class="relative">
            <button type="button" (click)="toggleVariablesMenu()"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all">
              <span class="material-icons text-[16px] text-amber-500">alternate_email</span>
              Tags Inteligentes
              <span class="material-icons text-[14px]">expand_more</span>
            </button>

            @if (showVariablesMenu()) {
              <div class="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Inserir no Texto</p>
                <div class="space-y-1">
                  @for (v of availableVariables; track v.tag) {
                    <button type="button" (click)="insertVariable(v.value)"
                      class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between">
                      <span class="font-medium text-slate-800 dark:text-slate-200">{{ v.label }}</span>
                      <span class="text-[10px] font-mono text-slate-400 truncate max-w-[100px]">{{ v.preview }}</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Toggle: Letterhead Timbre -->
          <button type="button" (click)="showLetterhead.set(!showLetterhead())"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            [class]="showLetterhead() ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">
            <span class="material-icons text-[16px]">{{ showLetterhead() ? 'check_circle' : 'radio_button_unchecked' }}</span>
            Papel Timbrado Oficial
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Button: Imprimir Documento A4 -->
          <button type="button" (click)="printDocument()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Imprimir folha A4 limpa (sem menus do sistema)">
            <span class="material-icons text-[16px]">print</span>
            Imprimir A4
          </button>

          <!-- Button: Export PDF -->
          <button type="button" (click)="exportToPdf()" [disabled]="exportingPdf()"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Baixar arquivo PDF">
            <span class="material-icons text-[16px] text-red-400">picture_as_pdf</span>
            {{ exportingPdf() ? 'Gerando PDF...' : 'Exportar PDF' }}
          </button>
        </div>
      </div>

      <!-- Rich Formatting Toolbar -->
      <div class="formatting-toolbar sticky top-2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-wrap items-center gap-1">
        <!-- Undo / Redo -->
        <button type="button" (click)="execCommand('undo')" class="toolbar-btn" title="Desfazer">
          <span class="material-icons text-[18px]">undo</span>
        </button>
        <button type="button" (click)="execCommand('redo')" class="toolbar-btn" title="Refazer">
          <span class="material-icons text-[18px]">redo</span>
        </button>

        <div class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- Headings / Blocks -->
        <button type="button" (click)="execCommand('formatBlock', '<h2>')" class="toolbar-btn text-xs font-bold px-2.5" title="Título Principal">
          H1
        </button>
        <button type="button" (click)="execCommand('formatBlock', '<h3>')" class="toolbar-btn text-xs font-bold px-2.5" title="Subtítulo">
          H2
        </button>
        <button type="button" (click)="execCommand('formatBlock', '<p>')" class="toolbar-btn text-xs font-semibold px-2" title="Parágrafo Normal">
          Texto
        </button>

        <div class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- Formatting: Bold, Italic, Underline, Strikethrough -->
        <button type="button" (click)="execCommand('bold')" class="toolbar-btn font-bold" title="Negrito (Ctrl+B)">
          <span class="material-icons text-[18px]">format_bold</span>
        </button>
        <button type="button" (click)="execCommand('italic')" class="toolbar-btn italic" title="Itálico (Ctrl+I)">
          <span class="material-icons text-[18px]">format_italic</span>
        </button>
        <button type="button" (click)="execCommand('underline')" class="toolbar-btn underline" title="Sublinhado (Ctrl+U)">
          <span class="material-icons text-[18px]">format_underlined</span>
        </button>
        <button type="button" (click)="execCommand('strikeThrough')" class="toolbar-btn line-through" title="Tachado">
          <span class="material-icons text-[18px]">strikethrough_s</span>
        </button>

        <div class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- Highlighting / Colors -->
        <button type="button" (click)="execCommand('hiliteColor', '#fef08a')" class="toolbar-btn group" title="Marca-texto Amarelo">
          <span class="material-icons text-[18px] text-amber-500">border_color</span>
        </button>
        <button type="button" (click)="execCommand('hiliteColor', '#bbf7d0')" class="toolbar-btn group" title="Marca-texto Verde">
          <span class="material-icons text-[18px] text-emerald-500">border_color</span>
        </button>
        <button type="button" (click)="execCommand('foreColor', '#007F80')" class="toolbar-btn" title="Cor Primária">
          <span class="w-3.5 h-3.5 rounded-full bg-primary inline-block"></span>
        </button>
        <button type="button" (click)="execCommand('removeFormat')" class="toolbar-btn text-slate-400 hover:text-red-500" title="Limpar Formatação">
          <span class="material-icons text-[18px]">format_clear</span>
        </button>

        <div class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- Alignments -->
        <button type="button" (click)="execCommand('justifyLeft')" class="toolbar-btn" title="Alinhar à Esquerda">
          <span class="material-icons text-[18px]">format_align_left</span>
        </button>
        <button type="button" (click)="execCommand('justifyCenter')" class="toolbar-btn" title="Centralizar">
          <span class="material-icons text-[18px]">format_align_center</span>
        </button>
        <button type="button" (click)="execCommand('justifyRight')" class="toolbar-btn" title="Alinhar à Direita">
          <span class="material-icons text-[18px]">format_align_right</span>
        </button>
        <button type="button" (click)="execCommand('justifyFull')" class="toolbar-btn" title="Justificar">
          <span class="material-icons text-[18px]">format_align_justify</span>
        </button>

        <div class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- Lists & Extras -->
        <button type="button" (click)="execCommand('insertUnorderedList')" class="toolbar-btn" title="Lista com Marcadores">
          <span class="material-icons text-[18px]">format_list_bulleted</span>
        </button>
        <button type="button" (click)="execCommand('insertOrderedList')" class="toolbar-btn" title="Lista Numerada">
          <span class="material-icons text-[18px]">format_list_numbered</span>
        </button>
        <button type="button" (click)="insertTable()" class="toolbar-btn" title="Inserir Tabela Clínica">
          <span class="material-icons text-[18px]">table_chart</span>
        </button>
        <button type="button" (click)="execCommand('insertHorizontalRule')" class="toolbar-btn" title="Linha Divisória">
          <span class="material-icons text-[18px]">horizontal_rule</span>
        </button>
        <button type="button" (click)="insertPageBreak()" class="toolbar-btn text-primary hover:bg-primary/10 gap-1 px-2.5" title="Inserir Quebra de Página (Iniciar em Nova Folha A4)">
          <span class="material-icons text-[18px]">insert_page_break</span>
          <span class="text-[11px] font-bold hidden sm:inline">Nova Folha</span>
        </button>
      </div>

      <!-- Workbench Area (A4 Sheet Presentation) -->
      <div class="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-center overflow-x-auto min-h-[900px]">
        
        <!-- Physical A4 Canvas Element -->
        <div #printableArea id="clinical-a4-sheet"
          class="clinical-a4-sheet bg-white text-slate-900 w-full max-w-[820px] min-h-[1050px] shadow-2xl p-8 sm:p-12 rounded-sm transition-all font-sans relative border border-slate-200 block">
          
          <!-- 1. Official Header Timbrado (Rendered when active) -->
          @if (showLetterhead()) {
            <div class="letterhead-header border-b-2 border-slate-200 pb-5 mb-6 select-none">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  @if (clinicLogo) {
                    <img [src]="clinicLogo" alt="Logo Clínica" class="h-12 w-auto max-w-[160px] object-contain rounded-lg shrink-0" crossorigin="anonymous" />
                  } @else {
                    <img src="/favicon-96x96.png" alt="EduPsych Pro" class="w-12 h-12 rounded-xl object-contain shadow-sm shrink-0" crossorigin="anonymous" />
                  }
                  <div>
                    <h2 class="text-base font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                      {{ clinicName || 'EduPsych Pro • Centro de Neuroaprendizagem' }}
                    </h2>
                    <p class="text-[11px] text-slate-500 font-medium">Clínica Especializada em Psicopedagogia, ABA e Desenvolvimento Infantil</p>
                  </div>
                </div>
                <div class="text-right text-[10px] text-slate-400 font-mono hidden sm:block">
                  <p>Documento Clínico Oficial</p>
                  <p>Autenticação Segura</p>
                </div>
              </div>

              <!-- Patient ID Card Box -->
              @if (paciente) {
                <div class="patient-id-card mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Paciente</span>
                    <strong class="text-slate-900 text-sm font-bold">{{ paciente.name }}</strong>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Idade / Nasc.</span>
                    <span>{{ paciente.age || '—' }} ({{ paciente.birthDate || '—' }})</span>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Escola / Série</span>
                    <span>{{ paciente.school?.name || 'Não informada' }} {{ paciente.grade ? '• ' + paciente.grade : '' }}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase font-bold text-slate-400">Responsável</span>
                    <span>{{ paciente.responsible?.name || '—' }}</span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- 2. WYSIWYG Editable Document Body -->
          <div #editorElement
            contenteditable="true"
            (input)="onEditorInput()"
            class="a4-editor-content outline-none min-h-[450px] text-slate-800 text-sm leading-relaxed max-w-none focus:outline-none"
            placeholder="Digite ou carregue o modelo do laudo aqui...">
          </div>

          <!-- 3. Official Footer Timbrado (no final do documento) -->
          @if (showLetterhead()) {
            <div class="letterhead-footer border-t border-slate-200 pt-5 mt-8 select-none">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-center sm:text-left">
                  <div class="w-48 border-b border-slate-400 mb-1.5 mx-auto sm:mx-0"></div>
                  <p class="text-xs font-bold text-slate-900">{{ professionalName || 'Dra. Sarah Miller' }}</p>
                  <p class="text-[11px] text-slate-500">{{ professionalSpecialty || 'Psicopedagoga Clínica & Especialista em Neuroaprendizagem' }}</p>
                  <p class="text-[10px] font-mono text-slate-400">{{ professionalRegistry || 'CBO 2394-25 • ABPp Nacional' }}</p>
                </div>

                <div class="text-right text-[10px] text-slate-400">
                  <p class="flex items-center gap-1 justify-center sm:justify-end">
                    <span class="material-icons text-[13px] text-emerald-600">verified</span>
                    Assinatura Digital Auditável
                  </p>
                  <p class="mt-0.5">Emitido em: {{ currentDate }}</p>
                  <p class="text-[9px] text-slate-300 mt-1">Conforme Lei Geral de Proteção de Dados (LGPD nº 13.709/18)</p>
                </div>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- Modal: Templates Catalog (37 Modelos) -->
      @if (showTemplatesModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="showTemplatesModal.set(false)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[88vh] overflow-hidden flex flex-col z-10 animate-in">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-icons">library_books</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Modelos Clínicos Prontos (37)</h2>
                  <p class="text-xs text-slate-500">Selecione um template para carregar e preencher com os dados do paciente</p>
                </div>
              </div>
              <button (click)="showTemplatesModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <span class="material-icons">close</span>
              </button>
            </div>

            <!-- Search & Filters -->
            <div class="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
              <div class="relative">
                <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  [(ngModel)]="templateSearch" placeholder="Buscar por TEA, TDAH, Parecer, Relatório...">
              </div>

              <!-- Categories Pills -->
              <div class="flex flex-wrap gap-1.5">
                <button (click)="selectedCategory.set('')"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                  [class]="selectedCategory() === '' ? 'bg-primary text-on-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                  Todos (37)
                </button>
                @for (c of categories; track c.value) {
                  <button (click)="selectedCategory.set(c.value)"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                    [class]="selectedCategory() === c.value ? 'bg-primary text-on-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
                    {{ c.label }} ({{ c.count }})
                  </button>
                }
              </div>
            </div>

            <!-- Templates List Grid -->
            <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (tpl of filteredTemplates(); track tpl.id) {
                <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-slate-800/60 hover:shadow-lg transition-all flex flex-col justify-between group">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-1.5">
                      <h4 class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{{ tpl.name }}</h4>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary/10 text-primary shrink-0">
                        {{ tpl.category }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{{ tpl.description }}</p>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                    <button type="button" (click)="loadTemplate(tpl)"
                      class="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95">
                      <span class="material-icons text-[15px]">input</span>
                      Carregar no Editor
                    </button>
                  </div>
                </div>
              }
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .toolbar-btn {
      @apply p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors flex items-center justify-center;
    }
    .a4-editor-content {
      min-height: 650px;
    }
    .a4-editor-content:empty:before {
      content: attr(placeholder);
      color: #94a3b8;
      pointer-events: none;
      display: block;
    }
    .a4-editor-content h1,
    .a4-editor-content h2,
    .a4-editor-content h3,
    .a4-editor-content h4,
    .a4-editor-content h5,
    .a4-editor-content h6 {
      margin-bottom: 0.15rem !important; /* Espaço bem reduzido abaixo do título */
      line-height: 1.25 !important;
    }
    .a4-editor-content h2 {
      font-size: 1.15rem !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      margin-top: 1.1rem !important;
      margin-bottom: 0.18rem !important;
    }
    .a4-editor-content h3 {
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin-top: 0.85rem !important;
      margin-bottom: 0.12rem !important;
    }
    .a4-editor-content h4 {
      font-size: 0.875rem !important;
      font-weight: 700 !important;
      color: #334155 !important;
      margin-top: 0.7rem !important;
      margin-bottom: 0.08rem !important;
    }
    .a4-editor-content p {
      margin-top: 0 !important;
      margin-bottom: 0.25rem !important;
      line-height: 1.45 !important;
    }
    .a4-editor-content ul {
      list-style-type: disc;
      padding-left: 1.25rem !important;
      margin-top: 0.15rem !important;
      margin-bottom: 0.35rem !important;
    }
    .a4-editor-content ol {
      list-style-type: decimal;
      padding-left: 1.25rem !important;
      margin-top: 0.15rem !important;
      margin-bottom: 0.35rem !important;
    }
    .a4-editor-content li {
      margin-top: 0 !important;
      margin-bottom: 0.15rem !important;
      line-height: 1.4 !important;
    }
    .a4-editor-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.75rem 0 !important;
    }
    .a4-editor-content table, .a4-editor-content th, .a4-editor-content td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
    }
    .a4-editor-content th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .a4-editor-content p,
    .a4-editor-content h2,
    .a4-editor-content h3,
    .a4-editor-content h4,
    .a4-editor-content ul,
    .a4-editor-content ol,
    .a4-editor-content li,
    .a4-editor-content table,
    .a4-editor-content tr,
    .a4-editor-content blockquote,
    .patient-id-card,
    .signature-box,
    .letterhead-header,
    .letterhead-footer,
    .heading-protected-group {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .a4-editor-content h2,
    .a4-editor-content h3,
    .a4-editor-content h4 {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .page-break,
    .force-page-break {
      page-break-before: always !important;
      break-before: always !important;
    }
    .page-break {
      border-top: 2px dashed #94a3b8;
      margin: 18px 0 12px 0;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
      font-weight: bold;
      user-select: none;
      padding: 4px 0;
    }
  `]
})
export class ClinicalDocEditorComponent implements OnInit, OnChanges {
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  @ViewChild('editorElement') editorElement!: ElementRef<HTMLDivElement>;
  @ViewChild('printableArea') printableArea!: ElementRef<HTMLDivElement>;

  @Input() content: string = '';
  @Input() paciente: any = null;
  @Input() clinicName: string = '';
  @Input() clinicLogo: string = '';
  @Input() professionalName: string = '';
  @Input() professionalSpecialty: string = '';
  @Input() professionalRegistry: string = '';

  @Output() contentChange = new EventEmitter<string>();

  showLetterhead = signal(true);
  showTemplatesModal = signal(false);
  showVariablesMenu = signal(false);
  exportingPdf = signal(false);

  templateSearch = '';
  selectedCategory = signal('');
  categories = DOC_CATEGORIES;
  allTemplates = DOC_TEMPLATES;

  currentDate: string = '';

  ngOnInit() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const user = this.auth.user();
    if (!this.professionalName && user?.name) {
      this.professionalName = user.name;
    }
    const tenant = this.auth.tenant();
    if (!this.clinicName && tenant?.name) {
      this.clinicName = tenant.name;
    }
    if (!this.clinicLogo && tenant?.logoUrl) {
      this.clinicLogo = tenant.logoUrl;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && this.editorElement) {
      const el = this.editorElement.nativeElement;
      if (el.innerHTML !== this.content) {
        el.innerHTML = this.content || '';
      }
    }
  }

  onEditorInput() {
    if (this.editorElement) {
      const html = this.editorElement.nativeElement.innerHTML;
      this.contentChange.emit(html);
    }
  }

  execCommand(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    this.onEditorInput();
  }

  insertTable() {
    const tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin:12px 0;">
        <thead>
          <tr>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc; font-weight:bold; text-align:left;">Área / Domínio Avaliado</th>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc; font-weight:bold; text-align:center;">Resultado Obtido</th>
            <th style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc; font-weight:bold; text-align:left;">Classificação / Conduta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Atenção Concentrada & Foco</td>
            <td style="border:1px solid #cbd5e1; padding:8px; text-align:center;">Média 82%</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Adequado para a idade</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:8px;">Memória Operacional Visual</td>
            <td style="border:1px solid #cbd5e1; padding:8px; text-align:center;">Média 55%</td>
            <td style="border:1px solid #cbd5e1; padding:8px;">Estimulação recomendada</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    this.execCommand('insertHTML', tableHtml);
  }

  insertPageBreak() {
    const pageBreakHtml = `
      <div class="page-break" contenteditable="false" style="page-break-before: always; break-before: always; border-top: 2px dashed #94a3b8; margin: 18px 0 12px 0; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold; user-select: none; padding: 4px 0;">
        ✂ --- Início da Próxima Folha A4 ---
      </div>
      <p></p>
    `;
    this.execCommand('insertHTML', pageBreakHtml);
    this.toast.info('Quebra de página inserida. O conteúdo a seguir iniciará na próxima folha.');
  }

  toggleVariablesMenu() {
    this.showVariablesMenu.set(!this.showVariablesMenu());
  }

  get availableVariables() {
    return [
      { label: 'Nome do Paciente', tag: '{nome_paciente}', value: this.paciente?.name || '{nome_paciente}', preview: this.paciente?.name || 'Theo Mendes' },
      { label: 'Idade', tag: '{idade}', value: this.paciente?.age || '{idade}', preview: this.paciente?.age || '8 anos' },
      { label: 'Data de Nascimento', tag: '{data_nascimento}', value: this.paciente?.birthDate || '{data_nascimento}', preview: this.paciente?.birthDate || '12/04/2018' },
      { label: 'Escola', tag: '{escola}', value: this.paciente?.school?.name || '{escola}', preview: this.paciente?.school?.name || 'Escola' },
      { label: 'Série / Ano Escolar', tag: '{serie}', value: this.paciente?.grade || '{serie}', preview: this.paciente?.grade || '3º Ano' },
      { label: 'Nome do Responsável', tag: '{nome_responsavel}', value: this.paciente?.responsible?.name || '{nome_responsavel}', preview: this.paciente?.responsible?.name || 'Responsável' },
      { label: 'Data de Hoje', tag: '{data_atual}', value: this.currentDate, preview: this.currentDate },
      { label: 'Profissional Logado', tag: '{profissional_nome}', value: this.professionalName, preview: this.professionalName || 'Profissional' },
      { label: 'Registro ABPp / CRP', tag: '{registro_profissional}', value: this.professionalRegistry || 'ABPp nº 1234', preview: this.professionalRegistry || 'ABPp' },
    ];
  }

  insertVariable(value: string) {
    this.execCommand('insertText', value);
    this.showVariablesMenu.set(false);
  }

  filteredTemplates(): DocTemplate[] {
    return this.allTemplates.filter(t => {
      const matchCat = !this.selectedCategory() || t.category === this.selectedCategory();
      const matchSearch = !this.templateSearch || 
        t.name.toLowerCase().includes(this.templateSearch.toLowerCase()) || 
        t.description.toLowerCase().includes(this.templateSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  loadTemplate(template: DocTemplate) {
    const formatted = replaceDocPlaceholders(
      template.content,
      this.paciente,
      { name: this.professionalName, councilNumber: this.professionalRegistry },
      { name: this.clinicName }
    );

    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = formatted;
      this.onEditorInput();
    }
    this.showTemplatesModal.set(false);
    this.toast.success(`Modelo "${template.name}" inserido com sucesso!`);
  }

  async exportToPdf() {
    if (!this.printableArea) return;
    this.exportingPdf.set(true);

    const originalElement = this.printableArea.nativeElement;
    const title = this.paciente?.name 
      ? `Laudo_${this.paciente.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      : `Documento_Clinico_${new Date().toISOString().slice(0, 10)}.pdf`;

    // 1. Criar clone isolado para renderização precisa do PDF sem distorção da tela
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // 2. Normalizar estilos no clone para garantir proporção A4 e reduzir o espaço ocioso no rodapé
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.minHeight = 'auto';
    clone.style.height = 'auto';
    clone.style.padding = '22px 32px 8px 32px'; // Espaço de baixo reduzido significativamente
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#0f172a';
    clone.style.display = 'block';

    // Normalizar o editor no clone para altura automática (sem min-height que empurre conteúdo)
    const editorInClone = clone.querySelector('.a4-editor-content') as HTMLElement;
    if (editorInClone) {
      editorInClone.style.minHeight = 'auto';
      editorInClone.style.height = 'auto';
    }

    // Regras de títulos e blocos no clone para fluxo contínuo, limpo e elegante
    const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasManualPageBreak = clone.querySelector('.page-break') !== null;

    headings.forEach((h: any, idx: number) => {
      h.style.pageBreakAfter = 'avoid';
      h.style.breakAfter = 'avoid';

      const text = h.textContent?.trim() || '';
      // Se não houver quebra manual, o Tópico 8 (Plano de Intervenção/Recomendações) inicia a Página 2
      // mantendo os tópicos 1 a 7 (incluindo 5, 6 e 7) completamente na Página 1
      const isTopic8 = /^(8[\.\-–\)]|8º|VIII[\.\-–\)])\s+/i.test(text) || text.includes('PLANO DE INTERVENÇÃO') || text.includes('ENCAMINHAMENTOS E RECOMENDAÇÕES');

      if (!hasManualPageBreak && isTopic8) {
        h.classList.add('force-page-break');
        h.style.pageBreakBefore = 'always';
        h.style.breakBefore = 'always';
        h.style.marginTop = '10px';
      } else if (idx === 0) {
        h.style.marginTop = '10px';
      } else {
        h.style.marginTop = '13px'; // Distância calibrada para acomodar com folga os tópicos 1 a 7 na folha 1
      }
      h.style.marginBottom = '2px'; // Espaço compacto entre título e texto
      h.style.lineHeight = '1.25';
    });

    const paragraphs = clone.querySelectorAll('p');
    paragraphs.forEach((p: any) => {
      p.style.marginTop = '0px';
      p.style.marginBottom = '3px';
      p.style.lineHeight = '1.45';
      p.style.pageBreakInside = 'avoid';
      p.style.breakInside = 'avoid';
    });

    const lists = clone.querySelectorAll('ul, ol');
    lists.forEach((l: any) => {
      l.style.marginTop = '3px';
      l.style.marginBottom = '6px';
      l.style.paddingLeft = '18px';
    });

    const listItems = clone.querySelectorAll('li');
    listItems.forEach((li: any) => {
      li.style.marginTop = '0px';
      li.style.marginBottom = '2px';
      li.style.lineHeight = '1.4';
      li.style.pageBreakInside = 'avoid';
      li.style.breakInside = 'avoid';
    });

    // Limpeza profunda de <br> vazios adjacentes a títulos no clone
    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h: any) => {
      let next = h.nextSibling;
      while (next && ((next.nodeType === 3 && !next.textContent?.trim()) || next.nodeName === 'BR')) {
        const toRemove = next;
        next = next.nextSibling;
        if (toRemove.nodeName === 'BR') {
          toRemove.remove();
        }
      }
      let prev = h.previousSibling;
      while (prev && ((prev.nodeType === 3 && !prev.textContent?.trim()) || prev.nodeName === 'BR')) {
        const toRemove = prev;
        prev = prev.previousSibling;
        if (toRemove.nodeName === 'BR') {
          toRemove.remove();
        }
      }
    });

    // Remover parágrafos vazios residuais que geram lacunas excessivas
    clone.querySelectorAll('p').forEach((p: any) => {
      const text = p.textContent?.trim() || '';
      if (text === '' && (p.children.length === 0 || (p.children.length === 1 && p.firstElementChild?.tagName === 'BR'))) {
        p.remove();
      }
    });

    // Proteger elementos indivisíveis (tabelas, cartões, bloco de assinatura, linhas de texto e listas)
    const indivisibles = clone.querySelectorAll('table, tr, li, p, blockquote, .patient-id-card, .letterhead-footer, .signature-box');
    indivisibles.forEach((el: any) => {
      el.style.pageBreakInside = 'avoid';
      el.style.breakInside = 'avoid';
    });

    // Ajustar rodapé no clone
    const footers = clone.querySelectorAll('.letterhead-footer');
    footers.forEach((f: any) => {
      f.style.marginTop = '22px';
      f.style.paddingTop = '12px';
      f.style.pageBreakInside = 'avoid';
      f.style.breakInside = 'avoid';
    });

    // 4. Pré-carregar e converter imagens para Base64 no clone para renderização 100% perfeita
    const images = clone.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        if (!img.src.startsWith('data:')) {
          const imgObj = new Image();
          imgObj.crossOrigin = 'anonymous';
          imgObj.src = img.src;
          await new Promise((resolve) => {
            imgObj.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = imgObj.naturalWidth || 96;
                canvas.height = imgObj.naturalHeight || 96;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(imgObj, 0, 0);
                  img.src = canvas.toDataURL('image/png');
                }
              } catch (err) {
                // Se falhar canvas, mantém o src
              }
              resolve(true);
            };
            imgObj.onerror = () => resolve(false);
          });
        }
      } catch (e) {
        // Fallback mantém src existente
      }
    }

    // 5. Inserir clone em container oculto fora da viewport
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '794px';
    container.style.zIndex = '-1000';
    container.appendChild(clone);
    document.body.appendChild(container);

    const opt = {
      margin: [8, 10, 8, 10], // Margens balanceadas A4
      filename: title,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['css', 'legacy'],
        before: ['.page-break', '.force-page-break'],
        avoid: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
          'p', 'li', 'ul', 'ol', 'table', 'tr', 'blockquote',
          '.patient-id-card', '.letterhead-footer', '.signature-box'
        ]
      }
    };

    import('html2pdf.js')
      .then((html2pdfModule: any) => {
        const html2pdf = html2pdfModule.default || html2pdfModule;
        html2pdf()
          .set(opt)
          .from(clone)
          .save()
          .then(() => {
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            this.exportingPdf.set(false);
            this.toast.success('PDF timbrado gerado e baixado com sucesso!');
          })
          .catch((err: any) => {
            console.error('Erro html2pdf save:', err);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            this.exportingPdf.set(false);
            this.toast.error('Erro ao gerar arquivo PDF. Abrindo folha para impressão...');
            this.printDocument();
          });
      })
      .catch((err: any) => {
        console.error('Erro ao importar html2pdf.js:', err);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        this.exportingPdf.set(false);
        this.toast.info('Abrindo visualização limpa para impressão A4...');
        this.printDocument();
      });
  }

  printDocument() {
    if (!this.printableArea) return;
    const printContents = this.printableArea.nativeElement.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const docTitle = this.paciente?.name 
      ? `Documento_${this.paciente.name.replace(/\s+/g, '_')}` 
      : 'Documento Clínico';

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${docTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 8mm 12mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.6;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .a4-print-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              padding: 4px;
            }
            .page-break {
              page-break-before: always !important;
              break-before: always !important;
              border: none !important;
              color: transparent !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
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
            h1, h2, h3, h4, h5, h6 {
              color: #0f172a;
              margin-top: 1.2em;
              margin-bottom: 0.5em;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            p, ul, ol, li, table, tr, blockquote, .patient-id-card, .signature-box, .letterhead-header, .letterhead-footer, .heading-protected-group {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              orphans: 3;
              widows: 3;
            }
            p, ul, ol {
              margin-bottom: 0.8em;
            }
            ul, ol {
              padding-left: 24px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .border-b-2 { border-bottom: 2px solid #e2e8f0; }
            .border-t-2 { border-top: 2px solid #e2e8f0; }
            .pb-6 { padding-bottom: 24px; }
            .pt-6 { padding-top: 24px; }
            .mb-8 { margin-bottom: 32px; }
            .mt-12 { margin-top: 48px; }
            .text-xs { font-size: 11px; }
            .text-sm { font-size: 13px; }
            .text-base { font-size: 15px; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .uppercase { text-transform: uppercase; }
            .text-slate-400 { color: #94a3b8; }
            .text-slate-500 { color: #64748b; }
            .text-slate-900 { color: #0f172a; }
            .text-primary { color: #007F80; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
          </style>
        </head>
        <body>
          <div class="a4-print-container">
            ${printContents}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
