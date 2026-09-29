import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden flex flex-col max-h-[92vh]" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-icons text-xl">crop</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Arraste e ajuste o tamanho e a área da foto</p>
            </div>
          </div>
          <button (click)="cancel()" class="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span class="material-icons text-xl">close</span>
          </button>
        </div>

        <!-- Cropper Viewport -->
        <div class="p-6 flex flex-col items-center bg-slate-50 dark:bg-slate-950/50 select-none overflow-hidden">
          <div class="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center cursor-move"
               (mousedown)="startDrag($event)"
               (touchstart)="startTouchDrag($event)"
               (wheel)="onWheel($event)">
            
            <!-- Canvas with live transform -->
            <canvas #cropCanvas class="absolute pointer-events-none"></canvas>

            <!-- Circular Mask Overlay -->
            <div class="absolute inset-0 pointer-events-none">
              <svg class="w-full h-full" viewBox="0 0 320 320">
                <defs>
                  <mask id="cropper-hole-mask">
                    <rect width="320" height="320" fill="white" />
                    <circle cx="160" cy="160" r="140" fill="black" />
                  </mask>
                </defs>
                <rect width="320" height="320" fill="rgba(15, 23, 42, 0.65)" mask="url(#cropper-hole-mask)" />
                <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2" stroke-dasharray="6 4" />
                <circle cx="160" cy="160" r="140" fill="none" stroke="var(--color-primary, #007F80)" stroke-width="2" opacity="0.6" />
              </svg>
            </div>

            <!-- Helpful drag prompt when idle -->
            <div class="absolute bottom-2 inset-x-0 text-center pointer-events-none">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white/90 shadow backdrop-blur-sm">
                <span class="material-icons text-[12px] align-middle mr-0.5">pan_tool</span> Arraste para mover
              </span>
            </div>
          </div>

          <!-- Live Preview & Zoom Controls -->
          <div class="w-full max-w-sm mt-5 space-y-4">
            <!-- Zoom slider -->
            <div class="flex items-center gap-3">
              <button (click)="zoomStep(-0.1)" class="size-8 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all" title="Reduzir zoom">
                <span class="material-icons text-base">zoom_out</span>
              </button>
              
              <div class="flex-1 flex items-center gap-2">
                <input type="range" [min]="minZoom" [max]="maxZoom" step="0.02" [(ngModel)]="zoom" (ngModelChange)="draw()"
                  class="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer">
              </div>

              <button (click)="zoomStep(0.1)" class="size-8 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all" title="Aumentar zoom">
                <span class="material-icons text-base">zoom_in</span>
              </button>

              <span class="text-xs font-mono font-bold text-slate-500 w-12 text-right">{{ (zoom * 100).toFixed(0) }}%</span>
            </div>

            <!-- Tool buttons: Rotate & Reset & Preview -->
            <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <button (click)="rotateClockwise()" class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all" title="Girar 90 graus">
                  <span class="material-icons text-sm">rotate_right</span>
                  <span>Girar</span>
                </button>
                <button (click)="resetTransform()" class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all" title="Centralizar e restaurar">
                  <span class="material-icons text-sm">center_focus_strong</span>
                  <span>Resetar</span>
                </button>
              </div>

              <!-- Mini circular preview -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prévia:</span>
                <div class="size-10 rounded-full overflow-hidden ring-2 ring-primary shadow-sm bg-slate-800 flex items-center justify-center">
                  @if (previewUrl()) {
                    <img [src]="previewUrl()" class="size-full object-cover">
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <button (click)="cancel()" class="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            Cancelar
          </button>
          
          <button (click)="confirmCrop()" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
            <span class="material-icons text-lg">check</span>
            <span>Confirmar e Aplicar</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class ImageCropperModalComponent implements AfterViewInit, OnChanges {
  @Input() imageSrc: string = '';
  @Input() title: string = 'Ajustar Foto do Paciente';
  @Output() cropped = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('cropCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  previewUrl = signal<string | null>(null);

  // Transformations
  zoom = 1;
  minZoom = 0.5;
  maxZoom = 3;
  rotation = 0; // in degrees (0, 90, 180, 270)
  offsetX = 0;
  offsetY = 0;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private imageElement: HTMLImageElement | null = null;
  private viewportSize = 320;
  private cropRadius = 140; // radius of crop circle

  ngAfterViewInit() {
    this.loadImage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageSrc'] && !changes['imageSrc'].firstChange) {
      this.loadImage();
    }
  }

  private loadImage() {
    if (!this.imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.imageElement = img;
      this.resetTransform();
    };
    img.src = this.imageSrc;
  }

  resetTransform() {
    if (!this.imageElement) return;
    this.rotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    // Scale so smallest dimension covers the crop circle (diameter = cropRadius * 2)
    const cropDiameter = this.cropRadius * 2;
    const scaleX = cropDiameter / this.imageElement.width;
    const scaleY = cropDiameter / this.imageElement.height;
    const initialFit = Math.max(scaleX, scaleY);
    this.minZoom = Math.max(0.2, initialFit * 0.7);
    this.maxZoom = Math.max(4, initialFit * 4);
    this.zoom = initialFit;

    this.draw();
  }

  zoomStep(delta: number) {
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom + delta));
    this.draw();
  }

  rotateClockwise() {
    this.rotation = (this.rotation + 90) % 360;
    this.draw();
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
    this.zoomStep(zoomFactor);
  }

  startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = e.clientX - this.offsetX;
    this.dragStartY = e.clientY - this.offsetY;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.offsetX = e.clientX - this.dragStartX;
    this.offsetY = e.clientY - this.dragStartY;
    this.draw();
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  startTouchDrag(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = e.touches[0].clientX - this.offsetX;
      this.dragStartY = e.touches[0].clientY - this.offsetY;
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (!this.isDragging || e.touches.length !== 1) return;
    this.offsetX = e.touches[0].clientX - this.dragStartX;
    this.offsetY = e.touches[0].clientY - this.dragStartY;
    this.draw();
  }

  @HostListener('window:touchend')
  onTouchEnd() {
    this.isDragging = false;
  }

  draw() {
    if (!this.canvasRef || !this.imageElement) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = this.viewportSize;
    canvas.height = this.viewportSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Move origin to center of viewport + user drag offset
    ctx.translate(canvas.width / 2 + this.offsetX, canvas.height / 2 + this.offsetY);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.zoom, this.zoom);

    // Draw image centered at the origin
    const w = this.imageElement.width;
    const h = this.imageElement.height;
    ctx.drawImage(this.imageElement, -w / 2, -h / 2, w, h);
    ctx.restore();

    this.updateLivePreview();
  }

  private updateLivePreview() {
    const croppedData = this.generateCroppedDataUrl(80);
    if (croppedData) {
      this.previewUrl.set(croppedData);
    }
  }

  private generateCroppedDataUrl(outputSize = 400): string | null {
    if (!this.imageElement) return null;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outputSize;
    outCanvas.height = outputSize;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return null;

    // Scale ratio between output size and viewport crop diameter
    const cropDiameter = this.cropRadius * 2;
    const ratio = outputSize / cropDiameter;

    outCtx.save();
    // Center of output
    outCtx.translate(outputSize / 2, outputSize / 2);
    // Apply user translation scaled by ratio
    outCtx.translate(this.offsetX * ratio, this.offsetY * ratio);
    outCtx.rotate((this.rotation * Math.PI) / 180);
    outCtx.scale(this.zoom * ratio, this.zoom * ratio);

    const w = this.imageElement.width;
    const h = this.imageElement.height;
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(this.imageElement, -w / 2, -h / 2, w, h);
    outCtx.restore();

    return outCanvas.toDataURL('image/jpeg', 0.9);
  }

  confirmCrop() {
    const result = this.generateCroppedDataUrl(400);
    if (result) {
      this.cropped.emit(result);
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}
