import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-sala-espera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Sala de Espera Virtual</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Acompanhamento em tempo real da fila de atendimento</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
            <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ queue().length }} na fila</span>
          </div>
          <button (click)="openTvDisplay()" title="Abrir Painel TV"
            class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-2xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">tv</span>
          </button>
          <button (click)="showCheckinForm.set(true)"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">person_add</span> Check-in
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
          <p class="text-3xl font-black text-amber-600">{{ waitingCount() }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aguardando</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
          <p class="text-3xl font-black text-blue-600">{{ calledCount() }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Chamados</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
          <p class="text-3xl font-black text-purple-600">{{ inSessionCount() }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Em Sessão</p>
        </div>
        <div class="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 text-center">
          <p class="text-3xl font-black text-emerald-600">{{ avgWait() }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Min Médio</p>
        </div>
      </div>

      <!-- Queue -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Fila de Atendimento</h2>
          <button class="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all" (click)="load()">
            <span class="material-icons">refresh</span>
          </button>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (queue().length === 0) {
          <div class="text-center py-16">
            <span class="material-icons text-7xl text-slate-200 dark:text-slate-700">event_seat</span>
            <p class="text-slate-400 dark:text-slate-500 mt-4 text-lg">Nenhum paciente na sala de espera</p>
            <p class="text-slate-300 dark:text-slate-600 text-sm">Pacientes que fizerem check-in aparecerão aqui</p>
          </div>
        } @else {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (item of queue(); track item.id; let i = $index) {
              <div class="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                [ngClass]="{'bg-amber-50 dark:bg-amber-900/10': item.status === 'AGUARDANDO', 'bg-blue-50 dark:bg-blue-900/10': item.status === 'CHAMADO', 'bg-purple-50 dark:bg-purple-900/10': item.status === 'EM_SESSAO'}">
                <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white truncate">{{ item.paciente?.name || '—' }}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      [class]="getStatusLabelClass(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Check-in: {{ formatTime(item.checkInAt) }} • Aguardando {{ getWaitTime(item.checkInAt) }}
                  </p>
                  @if (item.notes) {
                    <p class="text-xs text-slate-400 mt-1 italic">"{{ item.notes }}"</p>
                  }
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  @if (item.status === 'AGUARDANDO') {
                    <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                      (click)="callPatient(item.id)">
                      <span class="material-icons text-sm mr-1">volume_up</span> Chamar
                    </button>
                  }
                  @if (item.status === 'CHAMADO') {
                    <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                      (click)="startSession(item.id)">
                      <span class="material-icons text-sm mr-1">play_arrow</span> Iniciar
                    </button>
                  }
                  @if (item.status === 'EM_SESSAO') {
                    <button class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                      (click)="completeSession(item.id)">
                      <span class="material-icons text-sm mr-1">check</span> Concluir
                    </button>
                  }
                  <button class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    (click)="removeFromQueue(item.id)" title="Remover">
                    <span class="material-icons text-lg">close</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Check-in Modal -->
    @if (showCheckinForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="showCheckinForm.set(false)">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 ring-1 ring-slate-200 dark:ring-slate-800" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span class="material-icons text-primary text-2xl">person_add</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Check-in Paciente</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Registrar entrada na sala de espera</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Paciente *</label>
              <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="checkinForm.patientId">
                <option value="">Selecione o paciente</option>
                @for (p of pacientes(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
              <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                [(ngModel)]="checkinForm.notes" placeholder="Observações (opcional)">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" (click)="showCheckinForm.set(false)">Cancelar</button>
            <button class="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              (click)="checkin()" [disabled]="saving()">
              {{ saving() ? 'Registrando...' : 'Fazer Check-in' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class SalaEsperaComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private refreshInterval: any;

  queue = signal<any[]>([]);
  loading = signal(true);
  showCheckinForm = signal(false);
  saving = signal(false);
  pacientes = signal<any[]>([]);
  showToast = signal(false);
  toastMessage = signal('');

  checkinForm: any = { patientId: '', notes: '' };

  ngOnInit() {
    this.load();
    this.api.get('/pacientes').subscribe((res: any) => this.pacientes.set(res.data || []));
    this.refreshInterval = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  load() {
    this.api.get('/waiting-room').subscribe({
      next: (res: any) => { this.queue.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  waitingCount() { return this.queue().filter(i => i.status === 'AGUARDANDO').length; }
  calledCount() { return this.queue().filter(i => i.status === 'CHAMADO').length; }
  inSessionCount() { return this.queue().filter(i => i.status === 'EM_SESSAO').length; }

  avgWait(): string {
    const waiting = this.queue().filter(i => i.status === 'AGUARDANDO');
    if (waiting.length === 0) return '0';
    const totalMin = waiting.reduce((sum, i) => sum + this.getMinutesDiff(i.checkInAt), 0);
    return Math.round(totalMin / waiting.length).toString();
  }

  getMinutesDiff(dateStr: string): number {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }

  getWaitTime(dateStr: string): string {
    const mins = this.getMinutesDiff(dateStr);
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}min`;
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { 'AGUARDANDO': 'Aguardando', 'CHAMADO': 'Chamado', 'EM_SESSAO': 'Em Sessão', 'CONCLUIDO': 'Concluído' };
    return map[status] || status;
  }

  getStatusLabelClass(status: string): string {
    const map: Record<string, string> = {
      'AGUARDANDO': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'CHAMADO': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'EM_SESSAO': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'CONCLUIDO': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || '';
  }

  checkin() {
    if (!this.checkinForm.patientId) return;
    this.saving.set(true);
    this.api.post('/waiting-room/checkin', this.checkinForm).subscribe({
      next: () => { this.showCheckinForm.set(false); this.saving.set(false); this.checkinForm = { patientId: '', notes: '' }; this.load(); this.notify('Check-in realizado!'); },
      error: (err) => { this.saving.set(false); this.notify(err.error?.error || 'Erro ao fazer check-in'); }
    });
  }

  callPatient(id: string) { this.updateStatus(id, 'CHAMADO'); }
  startSession(id: string) { this.updateStatus(id, 'EM_SESSAO'); }
  completeSession(id: string) { this.updateStatus(id, 'CONCLUIDO'); }

  updateStatus(id: string, status: string) {
    this.api.put(`/waiting-room/${id}/status`, { status }).subscribe({
      next: () => { this.load(); this.notify('Status atualizado!'); },
      error: () => this.notify('Erro ao atualizar status')
    });
  }

  removeFromQueue(id: string) {
    if (confirm('Remover paciente da fila?')) {
      this.api.delete(`/waiting-room/${id}`).subscribe({ next: () => this.load() });
    }
  }

  openTvDisplay() {
    window.open('/app/agenda/tv', '_blank', 'width=1920,height=1080,fullscreen=yes');
  }

  notify(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
