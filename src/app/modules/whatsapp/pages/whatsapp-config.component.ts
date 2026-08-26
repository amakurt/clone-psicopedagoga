import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsAppService, WhatsAppLog } from '../services/whatsapp.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="size-10 bg-green-500 rounded-xl flex items-center justify-center">
            <span class="material-icons text-white text-xl">chat</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">WhatsApp - Configuração</h3>
            <p class="text-xs text-slate-500">Configure a API do WhatsApp para envio de lembretes</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">URL da API</label>
              <input [(ngModel)]="config.apiUrl"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://evoapi.example.com.br">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Token da API</label>
              <input [(ngModel)]="config.token" type="password"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Seu token de autenticação">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number ID</label>
              <input [(ngModel)]="config.phoneNumberId"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ID do número WhatsApp">
            </div>
            <button (click)="saveConfig()"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm">
              Salvar Configuração
            </button>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h4 class="font-semibold text-slate-900 dark:text-white text-sm mb-2">Teste de Conexão</h4>
              <div class="flex gap-2">
                <input [(ngModel)]="testPhone" placeholder="Número para teste"
                  class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <button (click)="sendTest()"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap">
                  Testar
                </button>
              </div>
              @if (testMessage()) {
                <p class="mt-2 text-xs" [class.text-green-600]="testSuccess()" [class.text-red-500]="!testSuccess()">
                  {{ testMessage() }}
                </p>
              }
            </div>

            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h4 class="font-semibold text-slate-900 dark:text-white text-sm mb-2">Status</h4>
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full" [class.bg-green-500]="isConfigured()" [class.bg-red-500]="!isConfigured()"></span>
                <span class="text-sm text-slate-600 dark:text-slate-400">
                  {{ isConfigured() ? 'API Configurada' : 'Não Configurada' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Histórico de Mensagens</h3>
          <button (click)="loadHistory()"
            class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors">
            Atualizar
          </button>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="size-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (logs().length === 0) {
          <div class="text-center py-8 text-slate-500">
            <span class="material-icons text-4xl mb-2">inbox</span>
            <p class="text-sm">Nenhuma mensagem enviada ainda</p>
          </div>
        } @else {
          <div class="overflow-x-auto custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
            <table class="w-full text-sm min-w-[600px]">
              <thead>
                <tr class="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th class="pb-2 font-semibold">Paciente</th>
                  <th class="pb-2 font-semibold">Telefone</th>
                  <th class="pb-2 font-semibold">Mensagem</th>
                  <th class="pb-2 font-semibold">Status</th>
                  <th class="pb-2 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logs(); track log.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-700/50">
                    <td class="py-2.5 text-slate-900 dark:text-white font-medium">{{ log.paciente?.name || '-' }}</td>
                    <td class="py-2.5 text-slate-500">{{ log.phone }}</td>
                    <td class="py-2.5 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{{ log.message }}</td>
                    <td class="py-2.5">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        [class.bg-green-100]="log.status === 'SENT'"
                        [class.text-green-700]="log.status === 'SENT'"
                        [class.bg-red-100]="log.status === 'FAILED'"
                        [class.text-red-700]="log.status === 'FAILED'"
                        [class.bg-blue-100]="log.status === 'DELIVERED'"
                        [class.text-blue-700]="log.status === 'DELIVERED'">
                        {{ log.status }}
                      </span>
                    </td>
                    <td class="py-2.5 text-slate-500 text-xs">{{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class WhatsAppComponent implements OnInit {
  private whatsappService = inject(WhatsAppService);

  config = { apiUrl: '', token: '', phoneNumberId: '' };
  testPhone = '';
  testMessage = signal('');
  testSuccess = signal(false);
  isConfigured = signal(false);
  loading = signal(false);
  logs = signal<WhatsAppLog[]>([]);

  ngOnInit() {
    this.loadConfig();
    this.loadHistory();
  }

  loadConfig() {
    this.whatsappService.getConfig().subscribe({
      next: (res: any) => {
        this.isConfigured.set(res.configured);
        if (res.config) {
          this.config.apiUrl = res.config.apiUrl || '';
          this.config.phoneNumberId = res.config.phoneNumberId || '';
        }
      },
    });
  }

  saveConfig() {
    this.whatsappService.saveConfig(this.config).subscribe({
      next: () => {
        this.isConfigured.set(true);
        this.testMessage.set('Configuração salva com sucesso!');
        this.testSuccess.set(true);
      },
      error: () => {
        this.testMessage.set('Erro ao salvar configuração');
        this.testSuccess.set(false);
      },
    });
  }

  sendTest() {
    if (!this.testPhone) return;
    this.whatsappService.sendTest(this.testPhone).subscribe({
      next: () => {
        this.testMessage.set('Mensagem de teste enviada!');
        this.testSuccess.set(true);
      },
      error: (err: any) => {
        this.testMessage.set(err.error?.error || 'Erro ao enviar mensagem');
        this.testSuccess.set(false);
      },
    });
  }

  loadHistory() {
    this.loading.set(true);
    this.whatsappService.getHistory().subscribe({
      next: (res: any) => {
        this.logs.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
