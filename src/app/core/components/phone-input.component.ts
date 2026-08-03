import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PhoneNumber {
  number: string;
  isWhatsApp: boolean;
}

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">{{ label }}</label>
      <div class="flex gap-2">
        <input 
          [ngModel]="phone" 
          (ngModelChange)="onPhoneChange($event)"
          class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          [placeholder]="placeholder"
          [maxlength]="maxlength">
        <label class="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-600 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-500 transition-all"
          [class]="isWhatsApp ? 'bg-green-100 dark:bg-green-900/30' : ''">
          <input type="checkbox" [ngModel]="isWhatsApp" (ngModelChange)="onWhatsAppChange($event)" class="hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"
            [class]="isWhatsApp ? 'text-green-600' : 'text-gray-400'">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span class="text-xs font-medium" [class]="isWhatsApp ? 'text-green-700 dark:text-green-400' : 'text-gray-500'">WhatsApp</span>
        </label>
      </div>
    </div>
  `
})
export class PhoneInputComponent {
  @Input() phone = '';
  @Input() isWhatsApp = false;
  @Input() label = 'Telefone';
  @Input() placeholder = '(00) 00000-0000';
  @Output() phoneChange = new EventEmitter<PhoneNumber>();

  maxlength = '15';

  onPhoneChange(value: string) {
    const formatted = this.formatPhone(value);
    this.phoneChange.emit({ number: formatted, isWhatsApp: this.isWhatsApp });
  }

  onWhatsAppChange(value: boolean) {
    this.phoneChange.emit({ number: this.phone, isWhatsApp: value });
  }

  formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : '';
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    // Mobile (11 digits)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}
