import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgendaService } from '../services/agenda.service';

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Agenda</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Consultas e sessões</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <div class="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            @for (view of views; track view.id) {
              <button class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                [class]="currentView() === view.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
                (click)="currentView.set(view.id)">
                {{ view.label }}
              </button>
            }
          </div>
          <a routerLink="/app/agenda/novo"
            class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
            <span class="material-icons text-[18px]">add</span>
            <span>Novo</span>
          </a>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all text-sm font-semibold"
          (click)="navigate(-1)">
          <span class="material-icons text-lg">chevron_left</span>
        </button>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ currentTitle() }}</h2>
        <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 transition-all text-sm font-semibold"
          (click)="navigate(1)">
          <span class="material-icons text-lg">chevron_right</span>
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center p-12 text-slate-400">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else {
        <!-- Month View -->
        @if (currentView() === 'month') {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
              @for (day of weekDays; track day) {
                <div class="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ day }}</div>
              }
            </div>
            <div class="grid grid-cols-7">
              @for (day of calendarDays(); track $index) {
                <div class="min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-colors"
                  [class]="day.isCurrentMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'"
                  [class.ring-2]="day.isToday"
                  [class.ring-primary]="day.isToday">
                  <p class="text-xs font-bold mb-1"
                    [class]="day.isCurrentMonth ? 'text-slate-900 dark:text-white' : 'text-slate-400'"
                    [class.text-primary]="day.isToday"
                    [class.font-black]="day.isToday">
                    {{ day.date }}
                  </p>
                  <div class="space-y-1">
                    @for (apt of day.appointments.slice(0, 3); track apt.id) {
                      <div class="px-2 py-1 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all hover:opacity-80"
                        [class]="getStatusClass(apt.status)"
                        (click)="viewAppointment(apt)">
                        {{ apt.startTime }} {{ apt.paciente?.name || 'Paciente' }}
                      </div>
                    }
                    @if (day.appointments.length > 3) {
                      <p class="text-[10px] text-slate-400 font-bold">+{{ day.appointments.length - 3 }} mais</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Week View -->
        @if (currentView() === 'week') {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <div class="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
              <div class="p-3"></div>
              @for (day of weekDaysFull(); track day.date) {
                <div class="p-3 text-center"
                  [class]="day.isToday ? 'bg-primary/5' : ''">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ day.dayName }}</p>
                  <p class="text-lg font-black mt-1"
                    [class]="day.isToday ? 'text-primary' : 'text-slate-900 dark:text-white'">
                    {{ day.date }}
                  </p>
                </div>
              }
            </div>
            <div class="grid grid-cols-8">
              <div class="border-r border-slate-200 dark:border-slate-800">
                @for (hour of hours; track hour) {
                  <div class="h-16 p-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400">
                    {{ hour }}
                  </div>
                }
              </div>
              @for (day of weekDaysFull(); track day.date; let i = $index) {
                <div class="border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                  @for (hour of hours; track hour) {
                    <div class="h-16 border-b border-slate-100 dark:border-slate-800 p-1 relative">
                      @for (apt of getAppointmentsForDayAndHour(day.fullDate, hour); track apt.id) {
                        <div class="absolute inset-x-1 rounded-lg px-2 py-1 text-[10px] font-bold truncate cursor-pointer transition-all hover:opacity-80"
                          [class]="getStatusClass(apt.status)"
                          (click)="viewAppointment(apt)">
                          {{ apt.paciente?.name || 'Paciente' }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Day View -->
        @if (currentView() === 'day') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div class="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 class="font-bold text-slate-900 dark:text-white">Timeline do Dia</h3>
              </div>
              <div class="p-6">
                @for (hour of hours; track hour) {
                  <div class="flex gap-4 mb-4">
                    <div class="w-16 text-xs font-bold text-slate-400 pt-2">{{ hour }}</div>
                    <div class="flex-1 min-h-[60px] border-l-2 border-slate-200 dark:border-slate-700 pl-4 relative">
                      @for (apt of getAppointmentsForHour(hour); track apt.id) {
                        <div class="absolute inset-x-0 -top-1 rounded-xl px-4 py-3 cursor-pointer transition-all hover:shadow-md"
                          [class]="getStatusClass(apt.status)"
                          (click)="viewAppointment(apt)">
                          <p class="font-bold text-sm">{{ apt.paciente?.name || 'Paciente' }}</p>
                          <p class="text-xs opacity-75">{{ apt.type }} • {{ apt.startTime }} - {{ apt.endTime }}</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Summary Sidebar -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
              <h3 class="font-bold text-slate-900 dark:text-white mb-4">Resumo do Dia</h3>
              <div class="space-y-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p class="text-2xl font-black text-slate-900 dark:text-white">{{ dayAppointments().length }}</p>
                </div>
                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                  <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Confirmados</p>
                  <p class="text-2xl font-black text-emerald-600">{{ confirmedCount() }}</p>
                </div>
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                  <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pendentes</p>
                  <p class="text-2xl font-black text-amber-600">{{ pendingCount() }}</p>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Year View -->
        @if (currentView() === 'year') {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (month of yearMonths(); track month.name) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-4 cursor-pointer transition-all hover:ring-primary/50 hover:-translate-y-1"
                (click)="goToMonth(month.index)">
                <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">{{ month.name }}</p>
                <div class="flex items-end justify-between">
                  <p class="text-3xl font-black text-primary">{{ month.count }}</p>
                  <p class="text-[10px] font-bold text-slate-400">consultas</p>
                </div>
                <div class="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full transition-all" [style.width.%]="month.percentage"></div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AgendaListComponent implements OnInit {
  private service = inject(AgendaService);
  items = signal<any[]>([]);
  loading = signal(true);
  currentView = signal<'day' | 'week' | 'month' | 'year'>('month');
  currentDate = signal(new Date());

  views = [
    { id: 'day' as const, label: 'Dia' },
    { id: 'week' as const, label: 'Semana' },
    { id: 'month' as const, label: 'Mês' },
    { id: 'year' as const, label: 'Ano' },
  ];

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res: any) => { this.items.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  currentTitle() {
    const d = this.currentDate();
    if (this.currentView() === 'day') return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (this.currentView() === 'week') {
      const start = this.getWeekStart(d);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (this.currentView() === 'month') return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return d.getFullYear().toString();
  }

  navigate(direction: number) {
    const d = new Date(this.currentDate());
    const view = this.currentView();
    if (view === 'day') d.setDate(d.getDate() + direction);
    else if (view === 'week') d.setDate(d.getDate() + (direction * 7));
    else if (view === 'month') d.setMonth(d.getMonth() + direction);
    else d.setFullYear(d.getFullYear() + direction);
    this.currentDate.set(d);
  }

  calendarDays() {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = prevMonth.getDate() - i;
      days.push({ date, isCurrentMonth: false, isToday: false, appointments: [] });
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const appointments = this.items().filter(a => a.date?.startsWith(dateStr));
      days.push({ date: i, isCurrentMonth: true, isToday, appointments });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false, appointments: [] });
    }

    return days;
  }

  weekDaysFull() {
    const start = this.getWeekStart(this.currentDate());
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        date: d.getDate(),
        dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        fullDate: d.toISOString().split('T')[0],
        isToday: today.toISOString().split('T')[0] === d.toISOString().split('T')[0]
      });
    }
    return days;
  }

  getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  }

  getAppointmentsForDayAndHour(dateStr: string, hour: string) {
    const h = parseInt(hour.split(':')[0]);
    return this.items().filter(a => {
      if (!a.date?.startsWith(dateStr)) return false;
      const aptHour = parseInt(a.startTime?.split(':')[0] || '0');
      return aptHour === h;
    });
  }

  getAppointmentsForHour(hour: string) {
    const h = parseInt(hour.split(':')[0]);
    const dateStr = this.currentDate().toISOString().split('T')[0];
    return this.items().filter(a => {
      if (!a.date?.startsWith(dateStr)) return false;
      const aptHour = parseInt(a.startTime?.split(':')[0] || '0');
      return aptHour === h;
    });
  }

  dayAppointments() {
    const dateStr = this.currentDate().toISOString().split('T')[0];
    return this.items().filter(a => a.date?.startsWith(dateStr));
  }

  confirmedCount() {
    return this.dayAppointments().filter(a => a.status === 'CONFIRMADO').length;
  }

  pendingCount() {
    return this.dayAppointments().filter(a => a.status === 'PENDENTE').length;
  }

  yearMonths() {
    const year = this.currentDate().getFullYear();
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const maxCount = Math.max(1, ...months.map((_, i) =>
      this.items().filter(a => {
        const d = new Date(a.date || a.createdAt);
        return d.getFullYear() === year && d.getMonth() === i;
      }).length
    ));

    return months.map((name, i) => {
      const count = this.items().filter(a => {
        const d = new Date(a.date || a.createdAt);
        return d.getFullYear() === year && d.getMonth() === i;
      }).length;
      return { name, index: i, count, percentage: (count / maxCount) * 100 };
    });
  }

  goToMonth(month: number) {
    const d = new Date(this.currentDate());
    d.setMonth(month);
    this.currentDate.set(d);
    this.currentView.set('month');
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CONFIRMADO': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'PENDENTE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CANCELADO': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'CONCLUIDO': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  viewAppointment(apt: any) {
    window.location.href = `/agenda/${apt.id}`;
  }
}
