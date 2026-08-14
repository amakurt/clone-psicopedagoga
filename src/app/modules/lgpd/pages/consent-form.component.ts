import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

declare var html2pdf: any;

@Component({
  selector: 'app-consent-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Termo de Consentimento</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">LGPD - Lei Geral de Proteção de Dados</p>
        </div>
        <div class="flex gap-3">
          <button (click)="printConsent()" class="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">print</span>
            <span>Imprimir</span>
          </button>
          <button (click)="exportPDF()" class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">picture_as_pdf</span>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Dados do Paciente</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Paciente *</label>
                <select [(ngModel)]="consent.patientId" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Selecione o paciente</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Responsável</label>
                <select [(ngModel)]="consent.responsibleId" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">N/A</option>
                  @for (r of responsaveis(); track r.id) {
                    <option [value]="r.id">{{ r.name }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Termo de Privacidade</h3>
            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p class="mb-3">Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), informamos que os dados pessoais coletados serão utilizados exclusivamente para fins de acompanhamento psicopedagógico.</p>
              <p class="mb-3">Seus dados são protegidos e não serão compartilhados com terceiros sem o seu consentimento expresso, exceto quando exigido por lei ou para cumprimento de obrigação legal.</p>
              <p class="mb-3">Você tem o direito de acessar, corrigir, anonimizar, bloquear ou eliminar seus dados pessoais, conforme estabelecido nos artigos 17 a 22 da LGPD.</p>
              <p>Para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail: dpo&#64;edupsych.pro</p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Consentimentos</h3>
            <div class="space-y-4">
              <label class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input type="checkbox" [(ngModel)]="consent.dataProcessing" class="mt-1 w-5 h-5 text-primary rounded focus:ring-primary">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white text-sm">Tratamento de Dados Pessoais</span>
                  <p class="text-xs text-slate-500 mt-1">Autorizo o tratamento dos meus dados pessoais para fins de acompanhamento psicopedagógico e elaboração de relatórios clínicos.</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input type="checkbox" [(ngModel)]="consent.marketing" class="mt-1 w-5 h-5 text-primary rounded focus:ring-primary">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white text-sm">Comunicações de Marketing</span>
                  <p class="text-xs text-slate-500 mt-1">Autorizo o recebimento de comunicações sobre eventos, cursos e novidades da clínica.</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input type="checkbox" [(ngModel)]="consent.research" class="mt-1 w-5 h-5 text-primary rounded focus:ring-primary">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white text-sm">Pesquisa Científica</span>
                  <p class="text-xs text-slate-500 mt-1">Autorizo o uso de dados anonimizados para fins de pesquisa científica e melhoria dos nossos serviços.</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input type="checkbox" [(ngModel)]="consent.shareWithSchool" class="mt-1 w-5 h-5 text-primary rounded focus:ring-primary">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white text-sm">Compartilhamento com Escola</span>
                  <p class="text-xs text-slate-500 mt-1">Autorizo o compartilhamento de informações relevantes com a instituição de ensino do paciente.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span class="text-sm text-slate-600 dark:text-slate-400">Dados Pessoais</span>
                <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="consent.dataProcessing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  {{ consent.dataProcessing ? 'Autorizado' : 'Pendente' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span class="text-sm text-slate-600 dark:text-slate-400">Marketing</span>
                <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="consent.marketing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  {{ consent.marketing ? 'Autorizado' : 'Pendente' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span class="text-sm text-slate-600 dark:text-slate-400">Pesquisa</span>
                <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="consent.research ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  {{ consent.research ? 'Autorizado' : 'Pendente' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span class="text-sm text-slate-600 dark:text-slate-400">Escola</span>
                <span class="text-xs font-bold px-2 py-1 rounded-full" [class]="consent.shareWithSchool ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  {{ consent.shareWithSchool ? 'Autorizado' : 'Pendente' }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Observações</h3>
            <textarea [(ngModel)]="consent.details" rows="4" placeholder="Adicione observações sobre o consentimento..."
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
          </div>

          <button (click)="saveConsent()" [disabled]="!consent.patientId" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:active:scale-100">
            <span class="material-icons text-[18px]">save</span>
            <span>Registrar Consentimento</span>
          </button>

          <a routerLink="/app/lgpd" class="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">history</span>
            <span>Ver Histórico</span>
          </a>
        </div>
      </div>
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg"
        [class]="toastType() === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">
        <span class="material-icons">{{ toastType() === 'success' ? 'check_circle' : 'error' }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ConsentFormComponent {
  private api = inject(ApiService);

  patients = signal<any[]>([]);
  responsaveis = signal<any[]>([]);

  consent = {
    patientId: '',
    responsibleId: '',
    dataProcessing: false,
    marketing: false,
    research: false,
    shareWithSchool: false,
    details: ''
  };

  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal('success');

  constructor() {
    this.loadPatients();
    this.loadResponsaveis();
  }

  loadPatients() {
    this.api.get('/pacientes').subscribe({
      next: (res: any) => this.patients.set(res.data || [])
    });
  }

  loadResponsaveis() {
    this.api.get('/responsaveis').subscribe({
      next: (res: any) => this.responsaveis.set(res.data || [])
    });
  }

  async saveConsent() {
    if (!this.consent.patientId) {
      this.showNotification('Selecione um paciente', 'error');
      return;
    }

    const consentsToSave = [];
    if (this.consent.dataProcessing) consentsToSave.push('DATA_PROCESSING');
    if (this.consent.marketing) consentsToSave.push('MARKETING');
    if (this.consent.research) consentsToSave.push('RESEARCH');
    if (this.consent.shareWithSchool) consentsToSave.push('SHARE_WITH_SCHOOL');

    if (consentsToSave.length === 0) {
      this.showNotification('Selecione pelo menos um consentimento', 'error');
      return;
    }

    try {
      for (const type of consentsToSave) {
        await this.api.post('/consents', {
          patientId: this.consent.patientId,
          responsibleId: this.consent.responsibleId || undefined,
          consentType: type,
          status: 'GRANTED',
          details: this.consent.details,
          ipAddress: await this.getIPAddress()
        }).toPromise();
      }
      this.showNotification('Consentimento registrado com sucesso!', 'success');
      this.resetForm();
    } catch {
      this.showNotification('Erro ao registrar consentimento', 'error');
    }
  }

  async getIPAddress(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return 'N/A';
    }
  }

  resetForm() {
    this.consent = {
      patientId: '',
      responsibleId: '',
      dataProcessing: false,
      marketing: false,
      research: false,
      shareWithSchool: false,
      details: ''
    };
  }

  printConsent() {
    window.print();
  }

  exportPDF() {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007F80; margin: 0;">EduPsych Pro</h1>
          <h2 style="color: #333; margin: 10px 0 0;">Termo de Consentimento - LGPD</h2>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 13px; color: #333; line-height: 1.6;">Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), o abaixo assinado autoriza o tratamento dos seus dados pessoais para fins de acompanhamento psicopedagógico.</p>
        <h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Consentimentos Autorizados</h3>
        <ul style="font-size: 13px; color: #333; line-height: 1.8;">
          ${this.consent.dataProcessing ? '<li>Tratamento de Dados Pessoais</li>' : ''}
          ${this.consent.marketing ? '<li>Comunicações de Marketing</li>' : ''}
          ${this.consent.research ? '<li>Pesquisa Científica</li>' : ''}
          ${this.consent.shareWithSchool ? '<li>Compartilhamento com Escola</li>' : ''}
        </ul>
        ${this.consent.details ? `<h3 style="color: #007F80; font-size: 14px; margin: 20px 0 10px;">Observações</h3><p style="font-size: 13px; color: #333;">${this.consent.details}</p>` : ''}
        <hr style="border: 1px solid #eee; margin: 30px 0 20px;">
        <p style="text-align: center; color: #999; font-size: 11px;">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;
      html2pdf().from(element).set({ filename: 'consentimento-lgpd.pdf', margin: 10 }).save();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  showNotification(message: string, type: string) {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
