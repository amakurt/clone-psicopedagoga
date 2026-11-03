import { Component, Input, Output, EventEmitter, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

export interface ScanResult {
  tipoIdentificado: 'PACIENTE' | 'ANAMNESE';
  confiancaGeral: 'ALTA' | 'MEDIA' | 'BAIXA';
  fileUrl?: string;
  paciente?: {
    name?: string;
    birthDate?: string;
    grade?: string;
    schoolName?: string;
    schoolShift?: string;
    cpf?: string;
    rg?: string;
    phone?: string;
    phoneIsWhatsApp?: boolean;
    diagnosis?: string;
    medications?: string;
    allergies?: string;
    notes?: string;
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      cep?: string;
    };
  };
  responsavel?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
    cpf?: string;
  };
  anamnese?: {
    pacienteNome?: string;
    dataNascimento?: string;
    turno?: string;
    escola?: string;
    telefoneEscola?: string;
    queixaPrincipal?: string;
    historicoGestacional?: string;
    desenvolvimentoMotor?: string;
    desenvolvimentoLinguagem?: string;
    sonoAlimentacao?: string;
    historicoEscolar?: string;
    historicoFamiliar?: string;
    observacoesComportamentais?: string;
  };
  camposPreenchidos?: string[];
}

@Component({
  selector: 'app-ficha-scanner-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden flex flex-col max-h-[92vh]" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
              <span class="material-icons text-xl">document_scanner</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                  IA Multimodal
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Tire foto da folha ou envie arquivo para preenchimento automático</p>
            </div>
          </div>
          <button (click)="cancel()" [disabled]="processing()" class="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
            <span class="material-icons text-xl">close</span>
          </button>
        </div>

        <!-- Body / Content -->
        <div class="p-6 flex flex-col items-center justify-center overflow-y-auto">

          <!-- Estado 1: Carregando / Processando IA -->
          @if (processing()) {
            <div class="w-full py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div class="relative size-20">
                <div class="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900 animate-pulse"></div>
                <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <span class="material-icons text-2xl animate-bounce">auto_awesome</span>
                </div>
              </div>
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Lendo caligrafia e dados clínicos...</h4>
                <p class="text-xs text-slate-500 max-w-xs">{{ loadingStatusText() }}</p>
              </div>
            </div>
          }

          <!-- Estado 2: Preview da imagem capturada -->
          @else if (previewSrc()) {
            <div class="w-full space-y-4">
              <div class="relative w-full max-h-[340px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-800">
                @if (isPdf()) {
                  <div class="py-16 flex flex-col items-center gap-3 text-white">
                    <span class="material-icons text-5xl text-rose-500">picture_as_pdf</span>
                    <span class="text-sm font-medium">{{ selectedFileName() || 'Documento PDF selecionado' }}</span>
                  </div>
                } @else {
                  <img [src]="previewSrc()" class="max-h-[340px] w-auto object-contain" alt="Ficha selecionada">
                }
                
                <button type="button" (click)="clearSelection()" 
                  class="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg">
                  <span class="material-icons text-sm">replay</span>
                  <span>Tirar outra</span>
                </button>
              </div>

              <!-- Dica de qualidade da foto -->
              <div class="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl text-teal-800 dark:text-teal-300 text-xs flex items-center gap-2">
                <span class="material-icons text-base text-teal-600">tips_and_updates</span>
                <span>Certifique-se de que a letra e os dados estejam nítidos e bem iluminados.</span>
              </div>
            </div>
          }

          <!-- Estado 3: Escolha de método (Câmera ou Galeria/Arquivo) -->
          @else {
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <!-- Opção 1: Câmera Fotográfica -->
              <button type="button" (click)="cameraInput.click()"
                class="group p-6 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-800/80 hover:border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex flex-col items-center text-center gap-3 transition-all active:scale-[0.98]">
                <div class="size-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:scale-110 transition-transform">
                  <span class="material-icons text-2xl">photo_camera</span>
                </div>
                <div>
                  <span class="block text-sm font-bold text-slate-800 dark:text-white">Tirar Foto com a Câmera</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Ideal para smartphone, tablet ou webcam</span>
                </div>
              </button>

              <!-- Opção 2: Enviar Arquivo / Galeria -->
              <button type="button" (click)="fileInput.click()"
                class="group p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex flex-col items-center text-center gap-3 transition-all active:scale-[0.98]">
                <div class="size-14 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span class="material-icons text-2xl">cloud_upload</span>
                </div>
                <div>
                  <span class="block text-sm font-bold text-slate-800 dark:text-white">Enviar Imagem ou PDF</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block">JPG, PNG ou PDF da ficha</span>
                </div>
              </button>
            </div>

            <!-- Inputs invisíveis para acionamento nativo -->
            <input type="file" accept="image/*" capture="environment" class="hidden" #cameraInput (change)="onFileSelected($event)">
            <input type="file" accept="image/*,application/pdf" class="hidden" #fileInput (change)="onFileSelected($event)">
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button type="button" (click)="cancel()" [disabled]="processing()" 
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-all">
            Cancelar
          </button>

          @if (previewSrc()) {
            <button type="button" (click)="processarComIA()" [disabled]="processing()"
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
              <span class="material-icons text-sm">auto_awesome</span>
              <span>Processar Ficha com IA</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class FichaScannerModalComponent {
  @Input() title: string = 'Digitalizar Ficha do Paciente';
  @Input() tipoFicha: 'PACIENTE' | 'ANAMNESE' = 'PACIENTE';
  @Output() scanned = new EventEmitter<ScanResult>();
  @Output() cancelled = new EventEmitter<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  previewSrc = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string>('');
  isPdf = signal<boolean>(false);
  processing = signal<boolean>(false);
  loadingStatusText = signal<string>('Decifrando caligrafia e dados cadastrais...');

  private intervalId: any = null;

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);
    this.isPdf.set(file.type === 'application/pdf');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewSrc.set(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF
      this.previewSrc.set('pdf-placeholder');
    }
  }

  clearSelection() {
    this.previewSrc.set(null);
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.isPdf.set(false);
  }

  cancel() {
    this.cancelled.emit();
  }

  processarComIA() {
    const file = this.selectedFile();
    if (!file && !this.previewSrc()) {
      this.toast.error('Selecione ou fotografe uma ficha primeiro.');
      return;
    }

    this.processing.set(true);
    this.startLoadingPhrases();

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (this.previewSrc()) {
      formData.append('imageBase64', this.previewSrc()!);
    }
    formData.append('tipoFicha', this.tipoFicha);

    this.api.postFormData<any>('/ai-ocr/scan', formData).subscribe({
      next: (res) => {
        this.processing.set(false);
        this.stopLoadingPhrases();

        if (res && res.success && res.data) {
          const result: ScanResult = {
            ...res.data,
            fileUrl: res.fileUrl
          };
          this.toast.success('Ficha interpretada com sucesso! Campos preenchidos no formulário.');
          this.scanned.emit(result);
        } else {
          this.toast.error('Não foi possível identificar os dados da ficha.');
        }
      },
      error: (err) => {
        this.processing.set(false);
        this.stopLoadingPhrases();
        console.error('Erro no OCR:', err);
        this.toast.error(err?.error?.error || 'Erro ao processar imagem da ficha com IA.');
      }
    });
  }

  private startLoadingPhrases() {
    const phrases = [
      'Analisando linhas e caligrafia manuscrita...',
      'Identificando nomes, datas e informações de contato...',
      'Estruturando dados clínicos e pedagógicos...',
      'Quase pronto! Organizando campos para o formulário...'
    ];
    let index = 0;
    this.intervalId = setInterval(() => {
      index = (index + 1) % phrases.length;
      this.loadingStatusText.set(phrases[index]);
    }, 2500);
  }

  private stopLoadingPhrases() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

