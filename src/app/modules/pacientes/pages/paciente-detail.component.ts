import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PacientesService } from '../services/pacientes.service';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@shared/components/toast.component';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 legacy-page">
      <div class="max-w-5xl mx-auto">
        <div class="flex justify-between items-start mb-6">
          <a routerLink="/app/pacientes" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span class="material-icons text-lg">arrow_back</span> Voltar
          </a>
          <div class="flex gap-2">
            <a [routerLink]="['/app/pacientes', id, 'editar']" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span class="material-icons text-lg">edit</span> Editar
            </a>
            <a [routerLink]="['/app/pacientes', id, 'prontuario']" class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <span class="material-icons text-lg">description</span> Prontuário
            </a>
          </div>
        </div>

        @if (paciente()) {
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div class="p-6 flex items-center gap-6 border-b border-gray-100">
              <div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                [style.background]="getAvatarColor(paciente()?.name)">
                @if (paciente()?.avatar) {
                  <img [src]="paciente()?.avatar" class="w-full h-full rounded-full object-cover">
                } @else {
                  {{ getInitials(paciente()?.name) }}
                }
              </div>
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900">{{ paciente()?.name }}</h1>
                <div class="flex items-center gap-4 mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="paciente()?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ paciente()?.active ? 'Ativo' : 'Inativo' }}
                  </span>
                  @if (paciente()?.accessCode) {
                    <div class="flex items-center gap-1 text-sm text-gray-500">
                      <span class="material-icons text-sm">vpn_key</span>
                      <code class="px-2 py-0.5 bg-gray-100 rounded-lg font-mono text-xs">{{ paciente()?.accessCode }}</code>
                      <button class="text-gray-400 hover:text-blue-600 transition-colors" (click)="copyCode(paciente()?.accessCode)">
                        <span class="material-icons text-sm">content_copy</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          @if (insightsLoading()) {
            <div class="bg-white rounded-2xl shadow-sm p-8 flex justify-center mb-6">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          } @else if (insights()) {
            <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <span class="material-icons text-violet-600">auto_awesome</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Insights Automáticos</h3>
                  <p class="text-xs text-gray-500">Síntese gerada a partir dos registros do paciente</p>
                </div>
              </div>
              @if (insights()!.insights.length === 0 && insights()!.alertas.length === 0) {
                <p class="text-sm text-gray-400 py-2">Registre rastreios, evoluções, sessões ou avaliações para gerar insights.</p>
              }
              @if (insights()!.alertas.length > 0) {
                <div class="space-y-2 mb-3">
                  @for (a of insights()!.alertas; track $index) {
                    <div class="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                      <span class="material-icons text-[18px] text-red-500 mt-0.5">warning</span>
                      <p class="text-sm text-red-800">{{ a.text }}</p>
                    </div>
                  }
                </div>
              }
              @if (insights()!.insights.length > 0) {
                <div class="space-y-2">
                  @for (i of insights()!.insights; track $index) {
                    <div class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span class="material-icons text-[18px] text-slate-500 mt-0.5">{{ i.icon }}</span>
                      <p class="text-sm text-slate-700">{{ i.text }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl shadow-sm p-6">
              <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">Dados Pessoais</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Nascimento</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.birthDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Idade</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.birthDate ? calculateAge(paciente()?.birthDate) + ' anos' : '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">CPF</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.cpf || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">RG</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.rg || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Telefone</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.phone || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Tel. Secundário</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.phone2 || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm p-6">
              <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">Escolar</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Escola</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.school?.name || paciente()?.school || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Série</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.grade || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm p-6">
              <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">Responsável</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Nome</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.responsible?.name || paciente()?.guardianName || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Telefone</span>
                  <span class="text-sm font-medium text-gray-900">{{ paciente()?.responsible?.phones || paciente()?.responsible?.phone || paciente()?.guardianPhone || '—' }}</span>
                </div>
                @if (paciente()?.responsible?.relationship) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Parentesco</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.responsible?.relationship }}</span>
                  </div>
                }
                @if (paciente()?.responsible?.email) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Email</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.responsible?.email }}</span>
                  </div>
                }
              </div>
            </div>

            @if (paciente()?.street) {
              <div class="bg-white rounded-2xl shadow-sm p-6">
                <h3 class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">Endereço</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Rua</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.street }}, {{ paciente()?.number }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Bairro</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.neighborhood }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Cidade</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.city }}{{ paciente()?.state ? '/' + paciente()?.state : '' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">CEP</span>
                    <span class="text-sm font-medium text-gray-900">{{ paciente()?.cep }}</span>
                  </div>
                  @if (paciente()?.complement) {
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-500">Complemento</span>
                      <span class="text-sm font-medium text-gray-900">{{ paciente()?.complement }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PacienteDetailComponent implements OnInit {
  private service = inject(PacientesService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  id = '';
  paciente = signal<any>(null);
  insights = signal<any>(null);
  insightsLoading = signal(false);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => this.paciente.set(res));
    this.loadInsights();
  }

  loadInsights() {
    this.insightsLoading.set(true);
    this.api.get(`/insights/${this.id}`).subscribe({
      next: (res: any) => {
        this.insights.set(res);
        this.insightsLoading.set(false);
      },
      error: () => { this.insightsLoading.set(false); this.toast.error('Erro ao carregar insights'); }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#2563EB', '#6D28D9', '#BE185D', '#B45309', '#047857', '#B91C1C', '#0E7490', '#4D7C0F'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
  }
}
