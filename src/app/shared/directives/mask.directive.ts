import { Directive, ElementRef, HostListener, Input, OnInit, Optional, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MaskType, formatByMask } from '@core/utils/masks';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective implements OnInit {
  @Input('appMask') maskType: MaskType = 'cpf';

  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  ngOnInit() {
    const input = this.el.nativeElement;
    
    switch (this.maskType) {
      case 'cpf':
        input.maxLength = 14;
        input.inputMode = 'numeric';
        if (!input.placeholder) input.placeholder = '000.000.000-00';
        break;
      case 'cnpj':
        input.maxLength = 18;
        input.inputMode = 'numeric';
        if (!input.placeholder) input.placeholder = '00.000.000/0000-00';
        break;
      case 'rg':
        input.maxLength = 12;
        if (!input.placeholder) input.placeholder = '00.000.000-0';
        break;
      case 'phone':
        input.maxLength = 15;
        input.inputMode = 'tel';
        if (!input.placeholder) input.placeholder = '(00) 00000-0000';
        break;
      case 'cep':
        input.maxLength = 9;
        input.inputMode = 'numeric';
        if (!input.placeholder) input.placeholder = '00000-000';
        break;
    }

    // Formata o valor inicial do input caso já venha carregado
    setTimeout(() => {
      if (input.value) {
        this.applyMask(input.value);
      }
    }, 50);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    this.applyMask(input.value);
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    if (input.value) {
      this.applyMask(input.value);
    }
  }

  private applyMask(rawValue: string) {
    const input = this.el.nativeElement;
    const formatted = formatByMask(rawValue, this.maskType);
    
    if (input.value !== formatted) {
      input.value = formatted;
    }

    if (this.ngControl?.control && this.ngControl.control.value !== formatted) {
      this.ngControl.control.setValue(formatted, { emitModelToViewChange: false });
    }
  }
}
