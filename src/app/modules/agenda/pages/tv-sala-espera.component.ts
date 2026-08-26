import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-tv-sala-espera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between">
      <!-- Header -->
      <div class="bg-primary/20 border-b border-primary/30 px-4 sm:px-8 py-4 shrink-0">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="material-icons text-primary text-3xl sm:text-4xl">monitoring</span>
            <div>
              <h1 class="text-xl sm:text-2xl font-black tracking-tight">Sala de Espera</h1>
              <p class="text-xs sm:text-sm text-slate-400">EduPsych Pro - Painel de Chamada</p>
            </div>
          </div>
          <div class="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
            <p class="text-2xl sm:text-3xl font-black text-primary">{{ currentTime() }}</p>
            <p class="text-xs sm:text-sm text-slate-400 capitalize">{{ currentDate() }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto min-h-[calc(100vh-200px)]">
          
          <!-- Chamando Agora -->
          <div class="lg:col-span-5 flex flex-col">
            <div class="bg-primary/10 border border-primary/30 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[280px]">
              <!-- Animated background -->
              <div class="absolute inset-0 opacity-20 pointer-events-none">
                <div class="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
              </div>
              
              @if (calling()) {
                <div class="relative z-10 text-center w-full px-2">
                  <div class="mb-4 sm:mb-6 animate-bounce">
                    <span class="material-icons text-primary text-6xl sm:text-8xl">record_voice_over</span>
                  </div>
                  <p class="text-base sm:text-xl text-slate-300 mb-1 sm:mb-2 uppercase tracking-widest font-bold">Chamando</p>
                  <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-primary mb-3 sm:mb-4 animate-pulse break-words leading-tight">{{ calling()?.patientName }}</h2>
                  <div class="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-6 text-slate-300">
                    <span class="material-icons text-slate-500 text-lg sm:text-xl">science</span>
                    <span class="text-sm sm:text-xl font-medium truncate">{{ calling()?.professionalName }}</span>
                  </div>
                  <div class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-2xl">
                    <span class="material-icons text-primary text-lg sm:text-xl">door_front</span>
                    <span class="text-sm sm:text-xl text-primary font-bold">Sala {{ calling()?.room || '1' }}</span>
                  </div>
                </div>
              } @else {
                <div class="relative z-10 text-center py-8">
                  <span class="material-icons text-slate-600 text-6xl sm:text-8xl mb-3 sm:mb-4">hourglass_empty</span>
                  <p class="text-lg sm:text-2xl text-slate-400 font-medium">Aguardando próximo paciente...</p>
                </div>
              }
            </div>
          </div>

          <!-- Fila de Atendimento -->
          <div class="lg:col-span-7 flex flex-col">
            <div class="bg-slate-800/50 border border-slate-700 rounded-3xl p-4 sm:p-6 flex-1 flex flex-col">
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <h3 class="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <span class="material-icons text-primary">queue</span>
                  Fila de Atendimento
                </h3>
                <span class="px-3 sm:px-4 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-bold">
                  {{ queue().length }} paciente(s)
                </span>
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar">
                @if (queue().length === 0) {
                  <div class="h-40 sm:h-full flex items-center justify-center">
                    <p class="text-slate-500 text-sm sm:text-lg">Nenhum paciente na fila</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (item of queue(); track item.id; let i = $index) {
                      <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-300"
                        [class]="i === 0 ? 'bg-primary/20 border border-primary/40 shadow-lg shadow-primary/10' : 'bg-slate-700/50 border border-slate-600/70'">
                        
                        <!-- Position -->
                        <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg shrink-0"
                          [class]="i === 0 ? 'bg-primary text-on-primary' : 'bg-slate-600 text-slate-300'">
                          {{ i + 1 }}
                        </div>
                        
                        <!-- Patient Info -->
                        <div class="flex-1 min-w-0">
                          <p class="font-bold text-sm sm:text-lg truncate" [class]="i === 0 ? 'text-primary' : 'text-white'">
                            {{ item.patientName }}
                          </p>
                          <p class="text-xs sm:text-sm text-slate-400 truncate">{{ item.professionalName }}</p>
                        </div>
                        
                        <!-- Status -->
                        <div class="text-right shrink-0">
                          @if (item.status === 'AGUARDANDO') {
                            <span class="px-2.5 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap">
                              AGUARDANDO
                            </span>
                            <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{{ item.waitTime }}</p>
                          } @else if (item.status === 'CHAMADO') {
                            <span class="px-2.5 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] sm:text-xs font-bold animate-pulse whitespace-nowrap">
                              CHAMADO
                            </span>
                          } @else if (item.status === 'EM_SESSAO') {
                            <span class="px-2.5 sm:px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap">
                              EM SESSÃO
                            </span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-8 py-3 shrink-0">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-500 text-center sm:text-left">
          <span>EduPsych Pro - Sistema de Gestão Clínica</span>
          <span class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Atualização automática a cada 5s
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0, 127, 128, 0.3); border-radius: 4px; }
  `]
})
export class TvSalaEsperaComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private interval: any;
  private clockInterval: any;

  queue = signal<any[]>([]);
  calling = signal<any>(null);
  currentTime = signal('');
  currentDate = signal('');

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.loadQueue();
    this.interval = setInterval(() => this.loadQueue(), 5000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  updateClock() {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
  }

  loadQueue() {
    this.api.get<any>('/waiting-room').subscribe({
      next: (res) => {
        const data = res.data || res || [];
        const filtro = data.filter((item: any) => item.status !== "CONCLUIDO")
        this.queue.set(filtro.map((item: any) => ({
          ...item,
          waitTime: this.getWaitTime(item.checkInAt)
        })));
        
        // Auto-call next patient
const nextPatient = filtro.find((item: any) => item.status === 'CHAMADO');        if (nextPatient) {
          this.calling.set(nextPatient);
        } else if (filtro.length > 0 && !this.calling()) {
          this.callNext(data[0]);
        }
      },
      error: () => {}
    });
  }

  getWaitTime(checkInAt: string): string {
    if (!checkInAt) return '';
    const checkIn = new Date(checkInAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  }

  callNext(patient: any) {
    this.api.put(`/waiting-room/${patient.id}/status`, { status: 'CHAMADO' }).subscribe({
      next: () => {
        this.calling.set(patient);
        // Play notification sound
        this.playSound();
      }
    });
  }

  playSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  }
}
