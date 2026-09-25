import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SuperAdminService, SuperAdminStats, TenantListItem } from '../../../core/services/superadmin.service';
import { ToastService } from '../../../shared/components/toast.component';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <!-- Topo / Header Master -->
      <div class="max-w-7xl mx-auto space-y-6">
        
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
              <span class="material-icons text-sm">shield_person</span>
              Painel Master SaaS
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestão Central de Clínicas
            </h1>
            <p class="text-slate-400 text-sm mt-1">
              Controle global de tenants, assinaturas, inadimplência, trials e modo suporte.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="loadAll()"
              [disabled]="loading()"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700/80 shadow-sm"
              title="Atualizar dados">
              <span class="material-icons text-base" [class.animate-spin]="loading()">refresh</span>
              Atualizar
            </button>

            <a
              routerLink="/app/dashboard"
              class="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20">
              <span class="material-icons text-base">domain</span>
              Entrar no App Clínico
            </a>
          </div>
        </header>

        <!-- Cockpit de Indicadores Globais (4 Cards) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: MRR Estimado -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Estimado</span>
              <div class="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <span class="material-icons text-lg">payments</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {{ stats()?.mrrFormatted || 'R$ 0,00' }}
              </p>
              <p class="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <span class="material-icons text-xs">trending_up</span>
                Receita recorrente mensal ativa
              </p>
            </div>
          </div>

          <!-- Card 2: Total de Clínicas -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Clínicas</span>
              <div class="size-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <span class="material-icons text-lg">domain</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {{ stats()?.tenantsTotal || 0 }}
              </p>
              <div class="flex items-center gap-2 text-xs font-medium mt-1">
                <span class="text-emerald-400">{{ stats()?.tenantsActive || 0 }} ativas</span>
                <span class="text-slate-600">·</span>
                <span class="text-red-400">{{ stats()?.tenantsBlocked || 0 }} bloqueadas</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Clínicas em Trial -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Período de Testes</span>
              <div class="size-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <span class="material-icons text-lg">hourglass_top</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {{ stats()?.tenantsTrial || 0 }}
              </p>
              <p class="text-xs text-amber-400 font-medium mt-1 flex items-center gap-1">
                <span class="material-icons text-xs">conversion_path</span>
                Clínicas em Trial (potenciais pagantes)
              </p>
            </div>
          </div>

          <!-- Card 4: Impacto na Rede -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Uso da Plataforma</span>
              <div class="size-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <span class="material-icons text-lg">groups</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {{ stats()?.totalPacientes || 0 }}
              </p>
              <p class="text-xs text-slate-400 font-medium mt-1">
                {{ stats()?.totalProfissionais || 0 }} profissionais · {{ stats()?.totalSessoes || 0 }} sessões
              </p>
            </div>
          </div>

        </div>

        <!-- Filtros e Barra de Busca -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-4">
          
          <!-- Campo de Busca -->
          <div class="relative flex-1 w-full">
            <span class="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadTenants()"
              placeholder="Buscar por nome da clínica, slug ou email do gestor..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <!-- Filtro Status -->
          <div class="flex items-center gap-2 w-full md:w-auto">
            <span class="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Status:</span>
            <select
              [(ngModel)]="selectedStatus"
              (change)="loadTenants()"
              class="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500">
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Apenas Ativas</option>
              <option value="BLOQUEADO">Apenas Bloqueadas</option>
            </select>
          </div>

          <!-- Filtro Plano -->
          <div class="flex items-center gap-2 w-full md:w-auto">
            <span class="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Plano:</span>
            <select
              [(ngModel)]="selectedPlan"
              (change)="loadTenants()"
              class="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500">
              <option value="TODOS">Todos os Planos</option>
              <option value="TRIAL">Trial 14d</option>
              <option value="BASICO">Básico</option>
              <option value="PRO">Profissional (PRO)</option>
              <option value="VIP">VIP Vitalício</option>
            </select>
          </div>

          <!-- Botão Filtrar -->
          <button
            (click)="loadTenants()"
            class="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors">
            Filtrar
          </button>
        </div>

        <!-- Lista de Clínicas -->
        <div class="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <span class="material-icons text-cyan-400 text-lg">apartment</span>
              Clínicas Cadastradas ({{ tenants().length }})
            </h2>
            <span class="text-xs text-slate-500 font-medium">
              Ambiente SaaS Isolado Multi-tenant
            </span>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <span class="material-icons text-3xl animate-spin text-cyan-400">sync</span>
              <p class="text-sm">Carregando dados das clínicas...</p>
            </div>
          } @else if (tenants().length === 0) {
            <!-- Empty State -->
            <div class="py-16 text-center text-slate-400 space-y-2">
              <span class="material-icons text-4xl text-slate-600">search_off</span>
              <p class="text-base font-bold text-slate-300">Nenhuma clínica encontrada</p>
              <p class="text-xs text-slate-500">Tente ajustar seus termos de busca ou filtros.</p>
            </div>
          } @else {

            <!-- 1. Visão Tabela Desktop (hidden md:block) -->
            <div class="hidden md:block overflow-x-auto custom-scrollbar">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th class="px-6 py-3.5">Clínica & Slug</th>
                    <th class="px-6 py-3.5">Gestor / Contato</th>
                    <th class="px-6 py-3.5">Plano</th>
                    <th class="px-6 py-3.5">Status</th>
                    <th class="px-6 py-3.5">Vencimento / Trial</th>
                    <th class="px-6 py-3.5 text-center">Volume (Pacientes / Sessões)</th>
                    <th class="px-6 py-3.5 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-medium">
                  @for (t of tenants(); track t.id) {
                    <tr class="hover:bg-slate-800/40 transition-colors group">
                      
                      <!-- Coluna Clínica -->
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            @if (t.logoUrl) {
                              <img [src]="t.logoUrl" class="size-full object-cover rounded-xl" />
                            } @else {
                              <span class="material-icons text-xl">domain</span>
                            }
                          </div>
                          <div>
                            <p class="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{{ t.name }}</p>
                            <p class="text-[11px] font-mono text-slate-400 mt-0.5">/{{ t.slug }}</p>
                          </div>
                        </div>
                      </td>

                      <!-- Coluna Gestor -->
                      <td class="px-6 py-4">
                        @if (t.owner) {
                          <p class="text-slate-200 font-semibold text-xs">{{ t.owner.name }}</p>
                          <p class="text-[11px] text-slate-400 font-mono mt-0.5">{{ t.owner.email }}</p>
                          @if (t.owner.phone) {
                            <p class="text-[10px] text-slate-500 mt-0.5">{{ t.owner.phone }}</p>
                          }
                        } @else {
                          <span class="text-slate-600 text-xs italic">Sem gestor vinculado</span>
                        }
                      </td>

                      <!-- Coluna Plano -->
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                          [ngClass]="getPlanBadgeClass(t.plan)">
                          @if (t.plan === 'VIP') {
                            <span class="material-icons text-xs">star</span>
                          }
                          {{ t.plan }}
                        </span>
                      </td>

                      <!-- Coluna Status -->
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          [ngClass]="getStatusBadgeClass(t.status)">
                          <span class="size-1.5 rounded-full"
                            [class.bg-emerald-400]="t.status === 'ATIVO'"
                            [class.bg-red-400]="t.status === 'BLOQUEADO'"></span>
                          {{ t.status }}
                        </span>
                      </td>

                      <!-- Coluna Vencimento / Trial -->
                      <td class="px-6 py-4 text-xs text-slate-300">
                        @if (t.plan === 'VIP') {
                          <span class="text-amber-400 font-semibold">Vitalício</span>
                        } @else if (t.plan === 'TRIAL' && t.trialEndsAt) {
                          <div class="space-y-0.5">
                            <span class="text-amber-400 font-bold block">{{ formatTrialDays(t.trialEndsAt) }}</span>
                            <span class="text-[10px] text-slate-500">{{ t.trialEndsAt | date:'dd/MM/yyyy' }}</span>
                          </div>
                        } @else if (t.subscription?.currentPeriodEnd) {
                          <span class="text-slate-300">{{ t.subscription?.currentPeriodEnd | date:'dd/MM/yyyy' }}</span>
                        } @else {
                          <span class="text-slate-600">—</span>
                        }
                      </td>

                      <!-- Coluna Volume -->
                      <td class="px-6 py-4 text-center">
                        <div class="inline-flex items-center gap-3 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                          <span title="Pacientes" class="flex items-center gap-1 text-slate-300">
                            <span class="material-icons text-xs text-cyan-400">face</span>
                            {{ t.stats.pacientes }}
                          </span>
                          <span class="text-slate-700">|</span>
                          <span title="Profissionais" class="flex items-center gap-1 text-slate-300">
                            <span class="material-icons text-xs text-emerald-400">badge</span>
                            {{ t.stats.profissionais }}
                          </span>
                          <span class="text-slate-700">|</span>
                          <span title="Sessões" class="flex items-center gap-1 text-slate-300">
                            <span class="material-icons text-xs text-amber-400">event_available</span>
                            {{ t.stats.sessoes }}
                          </span>
                        </div>
                      </td>

                      <!-- Coluna Ações Rápidas -->
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          
                          <!-- Botão Entrar como Clínica (Modo Suporte) -->
                          <button
                            (click)="impersonate(t)"
                            class="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Entrar como esta clínica (Modo Suporte)">
                            <span class="material-icons text-sm">support_agent</span>
                          </button>

                          <!-- Botão Prorrogar Trial -->
                          <button
                            (click)="openTrialModal(t)"
                            class="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Prorrogar dias de Trial">
                            <span class="material-icons text-sm">more_time</span>
                          </button>

                          <!-- Botão Alterar Plano -->
                          <button
                            (click)="openPlanModal(t)"
                            class="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Alterar plano manualmente">
                            <span class="material-icons text-sm">grade</span>
                          </button>

                          <!-- Botão Bloquear / Desbloquear -->
                          <button
                            (click)="toggleStatus(t)"
                            class="p-2 rounded-xl transition-all active:scale-95"
                            [ngClass]="getStatusButtonClass(t.status)"
                            [title]="t.status === 'ATIVO' ? 'Bloquear acesso da clínica' : 'Desbloquear clínica'">
                            <span class="material-icons text-sm">{{ t.status === 'ATIVO' ? 'lock' : 'lock_open' }}</span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- 2. Visão Cards Mobile (block md:hidden) -->
            <div class="block md:hidden divide-y divide-slate-800 p-3 space-y-3">
              @for (t of tenants(); track t.id) {
                <div class="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
                  
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div class="size-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                        <span class="material-icons text-xl">domain</span>
                      </div>
                      <div>
                        <p class="font-bold text-white text-sm">{{ t.name }}</p>
                        <p class="text-xs text-slate-400 font-mono">/{{ t.slug }}</p>
                      </div>
                    </div>

                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      [ngClass]="getStatusBadgeClass(t.status)">
                      {{ t.status }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div>
                      <span class="text-slate-500 block text-[10px] uppercase font-bold">Plano</span>
                      <span class="text-cyan-400 font-semibold">{{ t.plan }}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[10px] uppercase font-bold">Vencimento</span>
                      <span class="text-slate-300 font-semibold">
                        {{ t.plan === 'TRIAL' ? formatTrialDays(t.trialEndsAt) : (t.subscription?.currentPeriodEnd | date:'dd/MM/yyyy') || '—' }}
                      </span>
                    </div>
                    <div class="col-span-2 pt-1 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                      <span>{{ t.stats.pacientes }} pacientes</span>
                      <span>{{ t.stats.profissionais }} membros</span>
                      <span>{{ t.stats.sessoes }} sessões</span>
                    </div>
                  </div>

                  <!-- Ações no Mobile -->
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <button
                      (click)="impersonate(t)"
                      class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span class="material-icons text-sm text-cyan-400">support_agent</span>
                      Suporte
                    </button>
                    <button
                      (click)="openTrialModal(t)"
                      class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span class="material-icons text-sm text-amber-400">more_time</span>
                      + Trial
                    </button>
                    <button
                      (click)="openPlanModal(t)"
                      class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span class="material-icons text-sm text-emerald-400">grade</span>
                      Plano
                    </button>
                    <button
                      (click)="toggleStatus(t)"
                      class="px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                      [ngClass]="getStatusButtonClass(t.status)">
                      <span class="material-icons text-sm">{{ t.status === 'ATIVO' ? 'lock' : 'lock_open' }}</span>
                      {{ t.status === 'ATIVO' ? 'Bloquear' : 'Liberar' }}
                    </button>
                  </div>

                </div>
              }
            </div>

          }

        </div>

      </div>

      <!-- Modal 1: Prorrogar Trial -->
      @if (trialModalOpen()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span class="material-icons text-amber-400 text-xl">more_time</span>
                Prorrogar Trial da Clínica
              </h3>
              <button (click)="trialModalOpen.set(false)" class="text-slate-400 hover:text-white">
                <span class="material-icons">close</span>
              </button>
            </div>

            <p class="text-xs text-slate-400">
              Selecione quantos dias de teste gratuito deseja conceder para a clínica
              <strong class="text-white">{{ selectedTenant()?.name }}</strong>:
            </p>

            <div class="grid grid-cols-3 gap-3">
              @for (d of [7, 14, 30]; track d) {
                <button
                  (click)="trialDays.set(d)"
                  [ngClass]="trialDays() === d ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-200'"
                  class="py-3 rounded-xl font-bold text-sm transition-all border border-slate-700/60 hover:scale-105 active:scale-95">
                  +{{ d }} Dias
                </button>
              }
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                (click)="trialModalOpen.set(false)"
                class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors">
                Cancelar
              </button>
              <button
                (click)="confirmTrialExtension()"
                [disabled]="actionLoading()"
                class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
                @if (actionLoading()) {
                  <span class="material-icons text-sm animate-spin">sync</span>
                }
                Confirmar Prorrogação
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal 2: Alterar Plano -->
      @if (planModalOpen()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span class="material-icons text-emerald-400 text-xl">grade</span>
                Alterar Plano da Clínica
              </h3>
              <button (click)="planModalOpen.set(false)" class="text-slate-400 hover:text-white">
                <span class="material-icons">close</span>
              </button>
            </div>

            <p class="text-xs text-slate-400">
              Selecione o novo plano manual para a clínica
              <strong class="text-white">{{ selectedTenant()?.name }}</strong>:
            </p>

            <div class="space-y-2">
              @for (p of availablePlans; track p.code) {
                <button
                  (click)="newPlanCode.set(p.code)"
                  [ngClass]="newPlanCode() === p.code ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'"
                  class="w-full p-3 rounded-xl border hover:border-slate-700 flex items-center justify-between transition-all text-left">
                  <div>
                    <p class="text-sm font-bold text-white">{{ p.name }}</p>
                    <p class="text-[11px] text-slate-400">{{ p.desc }}</p>
                  </div>
                  <span class="text-xs font-bold text-cyan-400 font-mono">{{ p.price }}</span>
                </button>
              }
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                (click)="planModalOpen.set(false)"
                class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors">
                Cancelar
              </button>
              <button
                (click)="confirmPlanChange()"
                [disabled]="actionLoading()"
                class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2">
                @if (actionLoading()) {
                  <span class="material-icons text-sm animate-spin">sync</span>
                }
                Salvar Novo Plano
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private toast = inject(ToastService);
  private router = inject(Router);
  auth = inject(AuthService);

  loading = signal(false);
  actionLoading = signal(false);
  stats = signal<SuperAdminStats | null>(null);
  tenants = signal<TenantListItem[]>([]);

  searchQuery = '';
  selectedStatus = 'TODOS';
  selectedPlan = 'TODOS';

  trialModalOpen = signal(false);
  planModalOpen = signal(false);
  selectedTenant = signal<TenantListItem | null>(null);
  trialDays = signal(14);
  newPlanCode = signal('BASICO');

  availablePlans = [
    { code: 'TRIAL', name: 'Trial 14 Dias', desc: 'Período gratuito de degustação', price: 'R$ 0,00' },
    { code: 'BASICO', name: 'Plano Básico', desc: 'Até 100 pacientes e 10 profissionais', price: 'R$ 149,00/mês' },
    { code: 'PRO', name: 'Plano Profissional', desc: 'Ilimitado + Módulos avançados', price: 'R$ 299,00/mês' },
    { code: 'VIP', name: 'VIP Vitalício', desc: 'Sem cobrança, acesso liberado permanente', price: 'Cortesia' },
  ];

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.superAdminService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res);
      },
      error: () => {
        this.toast.error('Erro ao carregar métricas do painel');
      },
    });

    this.loadTenants();
  }

  loadTenants() {
    this.loading.set(true);
    this.superAdminService.getTenants({
      search: this.searchQuery,
      status: this.selectedStatus,
      plan: this.selectedPlan,
    }).subscribe({
      next: (res) => {
        this.tenants.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Erro ao listar clínicas');
        this.loading.set(false);
      },
    });
  }

  formatTrialDays(trialEndsAt: string | null): string {
    if (!trialEndsAt) return 'Trial';
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expirado';
    if (days === 0) return 'Expira hoje';
    return `${days} dias restantes`;
  }

  getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'TRIAL': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'BASICO': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'PRO': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'VIP': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ATIVO'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'bg-red-500/10 text-red-400 border border-red-500/20';
  }

  getStatusButtonClass(status: string): string {
    return status === 'ATIVO'
      ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white'
      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white';
  }

  toggleStatus(t: TenantListItem) {
    const nextStatus = t.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    const confirmMsg = nextStatus === 'BLOQUEADO'
      ? `Tem certeza que deseja BLOQUEAR o acesso da clínica "${t.name}"? Usuários não conseguirão fazer login.`
      : `Deseja DESBLOQUEAR e reativar o acesso da clínica "${t.name}"?`;

    if (!confirm(confirmMsg)) return;

    this.superAdminService.updateStatus(t.id, nextStatus).subscribe({
      next: () => {
        this.toast.success(`Clínica ${nextStatus === 'BLOQUEADO' ? 'bloqueada' : 'desbloqueada'} com sucesso`);
        this.loadAll();
      },
      error: () => {
        this.toast.error('Erro ao alterar status da clínica');
      },
    });
  }

  openTrialModal(t: TenantListItem) {
    this.selectedTenant.set(t);
    this.trialDays.set(14);
    this.trialModalOpen.set(true);
  }

  confirmTrialExtension() {
    const t = this.selectedTenant();
    if (!t) return;

    this.actionLoading.set(true);
    this.superAdminService.extendTrial(t.id, this.trialDays()).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Trial prorrogado com sucesso');
        this.trialModalOpen.set(false);
        this.actionLoading.set(false);
        this.loadAll();
      },
      error: () => {
        this.toast.error('Erro ao prorrogar trial');
        this.actionLoading.set(false);
      },
    });
  }

  openPlanModal(t: TenantListItem) {
    this.selectedTenant.set(t);
    this.newPlanCode.set(t.plan);
    this.planModalOpen.set(true);
  }

  confirmPlanChange() {
    const t = this.selectedTenant();
    if (!t) return;

    this.actionLoading.set(true);
    this.superAdminService.updatePlan(t.id, this.newPlanCode()).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Plano atualizado com sucesso');
        this.planModalOpen.set(false);
        this.actionLoading.set(false);
        this.loadAll();
      },
      error: () => {
        this.toast.error('Erro ao alterar plano');
        this.actionLoading.set(false);
      },
    });
  }

  impersonate(t: TenantListItem) {
    if (!confirm(`Entrar no modo suporte como a clínica "${t.name}"? Você visualizará o sistema como o gestor da clínica.`)) {
      return;
    }

    this.superAdminService.impersonate(t.id).subscribe({
      next: (res) => {
        this.toast.success(`Modo suporte ativado na clínica ${t.name}`);
        this.auth.startImpersonation(res.token, res.user, res.tenant);
      },
      error: (err) => {
        this.toast.error(err?.error?.error || 'Erro ao iniciar modo suporte');
      },
    });
  }
}
