import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../../services/billing.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-plano',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Plano e Assinatura</h2>
          <p class="text-sm text-slate-500 mt-1">{{ auth.tenant()?.name }}</p>
        </div>
        <span class="px-3 py-1.5 rounded-full text-xs font-bold"
          [class]="status() === 'BLOQUEADO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'">
          {{ status() === 'BLOQUEADO' ? 'Bloqueado' : 'Ativo' }}
        </span>
      </div>

      @if (error()) {
        <div class="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{{ error() }}</div>
      }
      @if (success()) {
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm">{{ success() }}</div>
      }

      <!-- Plano atual -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Plano atual</p>
          <div class="mt-3 flex items-end justify-between">
            <div>
              <p class="text-2xl font-black text-slate-900 dark:text-white">{{ currentPlan()?.name || '—' }}</p>
              <p class="text-sm text-slate-500 mt-1">
                {{ currentPlan()?.priceCents ? 'R$ ' + (currentPlan()?.priceCents / 100).toFixed(2) + '/mês' : 'Grátis (trial)' }}
              </p>
            </div>
          </div>
          <div class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Vence em: <strong>{{ periodEnd() }}</strong></p>
            <p>Status da assinatura: <strong>{{ subStatus() }}</strong></p>
          </div>
        </div>

        <!-- Uso -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Uso da clínica</p>
          <div class="mt-4 space-y-4">
            <div>
              <div class="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span>Pacientes</span>
                <span>{{ usage().pacientes || 0 }} / {{ maxPacientes() }}</span>
              </div>
              <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all" [style.width.%]="usagePercent(usage().pacientes, maxPacientes())"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span>Profissionais</span>
                <span>{{ usage().profissionais || 0 }} / {{ maxProfissionais() }}</span>
              </div>
              <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all" [style.width.%]="usagePercent(usage().profissionais, maxProfissionais())"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Planos disponíveis -->
      <div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">Planos disponíveis</h3>
        <div class="grid md:grid-cols-3 gap-4">
          @for (plan of plans(); track plan.code) {
            <div class="rounded-2xl border p-5 flex flex-col"
              [class]="plan.code === currentPlan()?.code
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'">
              <p class="font-bold text-slate-900 dark:text-white">{{ plan.name }}</p>
              <p class="text-2xl font-black mt-2 text-slate-900 dark:text-white">
                {{ plan.priceCents ? 'R$ ' + (plan.priceCents / 100).toFixed(2) : 'Grátis' }}
                <span class="text-sm font-semibold text-slate-400">/mês</span>
              </p>
              <p class="text-xs text-slate-500 mt-1">{{ plan.maxPacientes >= 100000 ? 'Pacientes ilimitados' : plan.maxPacientes + ' pacientes' }} · {{ plan.maxProfissionais >= 1000 ? 'Profissionais ilimitados' : plan.maxProfissionais + ' profissionais' }}</p>
              <div class="mt-4 text-sm text-slate-600 dark:text-slate-300 space-y-1 flex-1">
                @for (feature of planFeatures(plan); track feature) {
                  <p class="flex items-center gap-2">
                    <span class="material-icons text-primary text-[16px]">check_circle</span> {{ feature }}
                  </p>
                }
              </div>
              <button
                class="mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                [class]="plan.code === currentPlan()?.code
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary hover:bg-primary-dark text-white'"
                [disabled]="plan.code === currentPlan()?.code || loading()"
                (click)="subscribe(plan)">
                {{ plan.code === currentPlan()?.code ? 'Plano atual' : (plan.priceCents ? 'Assinar' : 'Iniciar trial') }}
              </button>
            </div>
          }
        </div>
      </div>

      <!-- PIX gerado -->
      @if (pix()) {
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-icons text-primary text-3xl">qr_code_2</span>
            <div>
              <p class="font-bold text-slate-900 dark:text-white">Pix Gerado — {{ selectedPlan()?.name }}</p>
              <p class="text-xs text-slate-500">Pagamento pendente. Ao confirmar, sua assinatura é ativada na hora.</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <input [value]="pix()" readonly
              class="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-mono" />
            <button (click)="copyPix()" class="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold">Copiar</button>
            @if (isMock()) {
              <button (click)="mockPay()" class="px-5 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold">Simular pagamento</button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PlanoComponent implements OnInit {
  private billing = inject(BillingService);
  auth = inject(AuthService);

  currentPlan = signal<any>(null);
  plans = signal<any[]>([]);
  usage = signal<any>({ pacientes: 0, profissionais: 0 });
  maxPacientes = signal(0);
  maxProfissionais = signal(0);
  subStatus = signal('');
  periodEnd = signal('');
  status = signal('ATIVO');
  pix = signal('');
  selectedPlan = signal<any>(null);
  loading = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.billing.getStatus().subscribe({
      next: (res: any) => {
        this.currentPlan.set(res.plan);
        this.usage.set(res.usage);
        this.maxPacientes.set(res.maxPacientes);
        this.maxProfissionais.set(res.maxProfissionais);
        this.subStatus.set(res.subscription.status);
        this.status.set(res.tenant?.status || 'ATIVO');
        this.periodEnd.set(new Date(res.subscription.currentPeriodEnd).toLocaleDateString('pt-BR'));
      },
      error: () => this.error.set('Erro ao carregar informações do plano'),
    });
    this.billing.getPlans().subscribe({
      next: (res: any) => this.plans.set(res.data || []),
    });
  }

  subscribe(plan: any) {
    this.loading.set(true);
    this.error.set('');
    this.billing.checkout(plan.code).subscribe({
      next: (res: any) => {
        this.selectedPlan.set(plan);
        this.pix.set(res.pixCopiaECola || '');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao gerar cobrança');
        this.loading.set(false);
      },
    });
  }

  mockPay() {
    this.loading.set(true);
    this.billing.mockPay().subscribe({
      next: () => {
        this.pix.set('');
        this.selectedPlan.set(null);
        this.loading.set(false);
        this.success.set('Pagamento confirmado! Assinatura ativada.');
        this.load();
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao confirmar pagamento');
        this.loading.set(false);
      },
    });
  }

  copyPix() {
    navigator.clipboard?.writeText(this.pix());
    this.success.set('Código Pix copiado!');
  }

  isMock() {
    return this.subStatus() === 'PENDENTE';
  }

  usagePercent(value: number, max: number) {
    if (!max) return 0;
    return Math.min(100, Math.round((value / max) * 100));
  }

  planFeatures(plan: any) {
    try {
      return JSON.parse(plan.features || '[]');
    } catch {
      return [];
    }
  }
}