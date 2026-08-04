import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-digital-signature',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-container">
      @if (label) {
        <label class="signature-label">{{ label }}</label>
      }
      <div class="canvas-wrapper" [class.has-error]="hasError">
        <canvas
          #signatureCanvas
          [width]="canvasWidth"
          [height]="canvasHeight"
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="startDrawingTouch($event)"
          (touchmove)="drawTouch($event)"
          (touchend)="stopDrawing()">
        </canvas>
        @if (!hasDrawn) {
          <div class="canvas-placeholder">
            <span class="material-icons signature-icon">draw</span>
            <span class="placeholder-text">Assine aqui</span>
          </div>
        }
      </div>
      @if (hasError) {
        <p class="error-text">Por favor, assine antes de continuar</p>
      }
      <div class="signature-actions">
        <button type="button" class="btn-clear" (click)="clear()">
          <span class="material-icons">delete_outline</span>
          Limpar
        </button>
        <button type="button" class="btn-save" (click)="save()" [disabled]="!hasDrawn">
          <span class="material-icons">check</span>
          Confirmar Assinatura
        </button>
      </div>
    </div>
  `,
  styles: [`
    .signature-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .signature-label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 4px;
    }
    .canvas-wrapper {
      position: relative;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      background: #f8fafc;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .canvas-wrapper:hover {
      border-color: #007F80;
    }
    .canvas-wrapper.has-error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    canvas {
      display: block;
      cursor: crosshair;
      touch-action: none;
    }
    .canvas-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      gap: 8px;
    }
    .signature-icon {
      font-size: 40px;
      color: #94a3b8;
    }
    .placeholder-text {
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }
    .error-text {
      font-size: 12px;
      color: #ef4444;
      margin: 0;
    }
    .signature-actions {
      display: flex;
      gap: 8px;
    }
    .btn-clear, .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .btn-clear {
      background: #f1f5f9;
      color: #64748b;
    }
    .btn-clear:hover {
      background: #e2e8f0;
      color: #475569;
    }
    .btn-clear .material-icons {
      font-size: 16px;
    }
    .btn-save {
      background: #007F80;
      color: white;
      box-shadow: 0 2px 8px rgba(0, 127, 128, 0.25);
    }
    .btn-save:hover:not(:disabled) {
      background: #006666;
      box-shadow: 0 4px 12px rgba(0, 127, 128, 0.35);
    }
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-save .material-icons {
      font-size: 16px;
    }
  `]
})
export class DigitalSignatureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() canvasWidth = 500;
  @Input() canvasHeight = 200;
  @Input() label = 'Assinatura Digital';
  @Input() penColor = '#1e293b';
  @Input() penWidth = 3;
  @Output() signatureSaved = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  hasDrawn = false;
  hasError = false;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.penColor;
    this.ctx.lineWidth = this.penWidth;
  }

  ngOnDestroy() {}

  private getCanvasCoords(event: MouseEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    const coords = this.getCanvasCoords(event);
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.hasDrawn = true;
    this.hasError = false;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(event);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  startDrawingTouch(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    this.isDrawing = true;
    this.lastX = (touch.clientX - rect.left) * scaleX;
    this.lastY = (touch.clientY - rect.top) * scaleY;
    this.hasDrawn = true;
    this.hasError = false;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  drawTouch(event: TouchEvent) {
    event.preventDefault();
    if (!this.isDrawing) return;
    const touch = event.touches[0];
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasDrawn = false;
    this.hasError = false;
    this.cleared.emit();
  }

  save() {
    if (!this.hasDrawn) {
      this.hasError = true;
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    this.signatureSaved.emit(dataUrl);
  }
}
