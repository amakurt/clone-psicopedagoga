import { Injectable, signal } from '@angular/core';

export type DialogType = 'info' | 'warning' | 'error' | 'success' | 'confirm';

export interface DialogOptions {
  title?: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  dangerMode?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  isOpen = signal<boolean>(false);
  title = signal<string>('Atenção');
  message = signal<string>('');
  type = signal<DialogType>('info');
  confirmText = signal<string>('Entendido');
  cancelText = signal<string>('Cancelar');
  showCancel = signal<boolean>(false);
  dangerMode = signal<boolean>(false);

  private resolver: ((value: boolean) => void) | null = null;

  /**
   * Exibe uma modal de alerta/aviso padronizada no sistema (substitui window.alert).
   */
  alert(
    messageOrOptions: string | DialogOptions,
    title = 'Atenção',
    type: DialogType = 'info'
  ): Promise<void> {
    return new Promise((resolve) => {
      this.resolver = () => resolve();

      if (typeof messageOrOptions === 'string') {
        this.message.set(messageOrOptions);
        this.title.set(title);
        this.type.set(type);
        this.confirmText.set('Entendido');
        this.showCancel.set(false);
        this.dangerMode.set(false);
      } else {
        this.message.set(messageOrOptions.message || '');
        this.title.set(messageOrOptions.title || title);
        this.type.set(messageOrOptions.type || type);
        this.confirmText.set(messageOrOptions.confirmText || 'Entendido');
        this.showCancel.set(false);
        this.dangerMode.set(Boolean(messageOrOptions.dangerMode));
      }

      this.isOpen.set(true);
    });
  }

  /**
   * Atalho para alertas de erro
   */
  error(message: string, title = 'Ocorreu um erro'): Promise<void> {
    return this.alert({
      title,
      message,
      type: 'error',
      confirmText: 'Entendido',
      dangerMode: true,
    });
  }

  /**
   * Atalho para alertas de sucesso
   */
  success(message: string, title = 'Sucesso!'): Promise<void> {
    return this.alert({
      title,
      message,
      type: 'success',
      confirmText: 'OK',
    });
  }

  /**
   * Atalho para alertas de aviso
   */
  warning(message: string, title = 'Aviso'): Promise<void> {
    return this.alert({
      title,
      message,
      type: 'warning',
      confirmText: 'Entendido',
    });
  }

  /**
   * Atalho para alertas informativos
   */
  info(message: string, title = 'Informação'): Promise<void> {
    return this.alert({
      title,
      message,
      type: 'info',
      confirmText: 'Entendido',
    });
  }

  /**
   * Exibe uma modal de confirmação padronizada (substitui window.confirm).
   * Retorna Promise<boolean> que resolve true se confirmado ou false se cancelado.
   */
  confirm(
    message: string,
    title = 'Confirmar Ação',
    options?: { confirmText?: string; cancelText?: string; dangerMode?: boolean }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolver = resolve;
      this.message.set(message);
      this.title.set(title);
      this.type.set('confirm');
      this.confirmText.set(options?.confirmText || 'Confirmar');
      this.cancelText.set(options?.cancelText || 'Cancelar');
      this.showCancel.set(true);
      this.dangerMode.set(Boolean(options?.dangerMode));
      this.isOpen.set(true);
    });
  }

  /**
   * Fecha a modal resolvendo o resultado
   */
  close(result = false) {
    this.isOpen.set(false);
    if (this.resolver) {
      const res = this.resolver;
      this.resolver = null;
      res(result);
    }
  }

  confirmAction() {
    this.close(true);
  }

  cancelAction() {
    this.close(false);
  }
}
