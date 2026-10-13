import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  SuperAdminService,
  SuperAdminStats,
  TenantListItem,
  EvolutionGatewayStatus,
  ClinicWhatsAppInstance,
  WhatsAppQrCodeResponse,
} from '../../../core/services/superadmin.service';
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
              Gestão Central da Plataforma
            </h1>
            <p class="text-slate-400 text-sm mt-1">
              Controle global de clínicas, assinaturas, gateway Evolution API e WhatsApp multi-tenant.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="refreshCurrentTab()"
              [disabled]="loading() || whatsappLoading()"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700/80 shadow-sm"
              title="Atualizar dados">
              <span class="material-icons text-base" [class.animate-spin]="loading() || whatsappLoading()">refresh</span>
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

        <!-- Seletor de Abas Master -->
        <div class="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto custom-scrollbar">
          <button
            (click)="setTab('tenants')"
            [ngClass]="activeTab() === 'tenants' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 whitespace-nowrap">
            <span class="material-icons text-base">domain</span>
            Clínicas & Assinaturas
          </button>

          <button
            (click)="setTab('whatsapp')"
            [ngClass]="activeTab() === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 whitespace-nowrap">
            <span class="material-icons text-base">chat</span>
            WhatsApp Multi-Clínica (Evolution API)
            @if (gatewayStatus()?.health?.online) {
              <span class="size-2 rounded-full bg-emerald-400 animate-pulse" title="Gateway Online"></span>
            } @else if (gatewayStatus()) {
              <span class="size-2 rounded-full bg-red-400" title="Gateway Offline"></span>
            }
          </button>
        </div>

        <!-- ============================================================== -->
        <!-- ABA 1: CLÍNICAS & ASSINATURAS (SAAS MASTER)                   -->
        <!-- ============================================================== -->
        @if (activeTab() === 'tenants') {
          <div class="space-y-6 animate-fadeIn">
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
                  <option value="TRIAL">Trial</option>
                  <option value="BASICO">Básico</option>
                  <option value="PRO">Profissional (PRO)</option>
                  <option value="VIP">VIP Vitalício</option>
                </select>
              </div>

            </div>

            <!-- Tabela / Cards de Clínicas -->
            <div class="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              
              @if (loading()) {
                <div class="p-12 text-center text-slate-400 space-y-3">
                  <span class="material-icons animate-spin text-3xl text-cyan-500">sync</span>
                  <p class="text-sm font-medium">Carregando dados das clínicas...</p>
                </div>
              } @else if (tenants().length === 0) {
                <div class="p-12 text-center text-slate-400 space-y-3">
                  <span class="material-icons text-4xl text-slate-600">domain_disabled</span>
                  <p class="text-sm font-medium text-slate-300">Nenhuma clínica encontrada com os filtros selecionados.</p>
                </div>
              } @else {

                <!-- Tabela Desktop -->
                <div class="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table class="w-full text-left text-xs text-slate-300">
                    <thead class="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                      <tr>
                        <th class="py-3.5 px-4">Clínica & Gestor</th>
                        <th class="py-3.5 px-4">Plano</th>
                        <th class="py-3.5 px-4">Status</th>
                        <th class="py-3.5 px-4">Pacientes / Usuários</th>
                        <th class="py-3.5 px-4">Período / Trial</th>
                        <th class="py-3.5 px-4 text-right">Ações de Gestão</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60">
                      @for (t of tenants(); track t.id) {
                        <tr class="hover:bg-slate-800/40 transition-colors">
                          
                          <!-- Nome da Clínica -->
                          <td class="py-4 px-4">
                            <div class="flex items-center gap-3">
                              <div class="size-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-700">
                                {{ (t.name || '?').slice(0, 2).toUpperCase() }}
                              </div>
                              <div>
                                <p class="font-bold text-white text-sm">{{ t.name }}</p>
                                <p class="text-slate-500 text-[11px]">slug: {{ t.slug }} · {{ t.owner?.email || 'Sem email' }}</p>
                              </div>
                            </div>
                          </td>

                          <!-- Plano -->
                          <td class="py-4 px-4">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" [ngClass]="getPlanBadgeClass(t.plan)">
                              {{ t.plan }}
                            </span>
                          </td>

                          <!-- Status -->
                          <td class="py-4 px-4">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" [ngClass]="getStatusBadgeClass(t.status)">
                              {{ t.status }}
                            </span>
                          </td>

                          <!-- Métricas de Uso -->
                          <td class="py-4 px-4">
                            <div class="space-y-0.5">
                              <p class="font-semibold text-slate-200">{{ t.stats.pacientes }} pacientes</p>
                              <p class="text-slate-500 text-[11px]">{{ t.stats.profissionais }} profissionais · {{ t.stats.sessoes }} sessões</p>
                            </div>
                          </td>

                          <!-- Período / Vencimento -->
                          <td class="py-4 px-4">
                            <p class="text-slate-300 font-medium">
                              {{ t.plan === 'VIP' ? 'Vitalício' : formatTrialDays(t.trialEndsAt) }}
                            </p>
                            <p class="text-slate-500 text-[10px]">Cadastrada em {{ t.createdAt | date:'dd/MM/yyyy' }}</p>
                          </td>

                          <!-- Ações -->
                          <td class="py-4 px-4 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              
                              <!-- Entrar como a Clínica (Impersonate) -->
                              <button
                                (click)="impersonate(t)"
                                class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                                title="Entrar no sistema como esta clínica (Modo Suporte)">
                                <span class="material-icons text-base">support_agent</span>
                              </button>

                              <!-- Prorrogar Trial -->
                              <button
                                (click)="openTrialModal(t)"
                                class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                                title="Prorrogar dias de Trial">
                                <span class="material-icons text-base">more_time</span>
                              </button>

                              <!-- Mudar Plano -->
                              <button
                                (click)="openPlanModal(t)"
                                class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                                title="Alterar plano">
                                <span class="material-icons text-base">grade</span>
                              </button>

                              <!-- Bloquear / Desbloquear -->
                              <button
                                (click)="toggleStatus(t)"
                                class="p-2 rounded-xl transition-colors"
                                [ngClass]="t.status === 'ATIVO' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'"
                                [title]="t.status === 'ATIVO' ? 'Bloquear Clínica' : 'Desbloquear Clínica'">
                                <span class="material-icons text-base">{{ t.status === 'ATIVO' ? 'lock' : 'lock_open' }}</span>
                              </button>

                            </div>
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Cards Mobile -->
                <div class="lg:hidden divide-y divide-slate-800/80">
                  @for (t of tenants(); track t.id) {
                    <div class="p-4 space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h4 class="font-bold text-white text-sm">{{ t.name }}</h4>
                          <p class="text-slate-500 text-xs">{{ t.owner?.email || t.slug }}</p>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="getPlanBadgeClass(t.plan)">
                            {{ t.plan }}
                          </span>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="getStatusBadgeClass(t.status)">
                            {{ t.status }}
                          </span>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span class="text-slate-500 text-[10px] block">Período</span>
                          {{ t.plan === 'VIP' ? 'Vitalício' : formatTrialDays(t.trialEndsAt) }}
                        </div>
                        <div>
                          <span class="text-slate-500 text-[10px] block">Cadastro</span>
                          {{ t.createdAt | date:'dd/MM/yyyy' }}
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
        }

        <!-- ============================================================== -->
        <!-- ABA 2: WHATSAPP MULTI-CLÍNICA (EVOLUTION API GATEWAY)         -->
        <!-- ============================================================== -->
        @if (activeTab() === 'whatsapp') {
          <div class="space-y-6 animate-fadeIn">
            
            <!-- Cockpit da Evolution API (4 Cards) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <!-- Card 1: Status do Servidor Evolution -->
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-xl pointer-events-none"
                  [ngClass]="gatewayStatus()?.health?.online ? 'bg-emerald-500/10' : 'bg-red-500/10'"></div>
                
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway Evolution</span>
                  <div class="size-9 rounded-xl flex items-center justify-center border"
                    [ngClass]="gatewayStatus()?.health?.online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                    <span class="material-icons text-lg">router</span>
                  </div>
                </div>

                <div class="mt-4">
                  <div class="flex items-center gap-2">
                    <span class="size-2.5 rounded-full"
                      [ngClass]="gatewayStatus()?.health?.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'"></span>
                    <p class="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {{ gatewayStatus()?.health?.online ? 'ONLINE' : 'OFFLINE' }}
                    </p>
                  </div>
                  <p class="text-xs text-slate-400 font-mono mt-1">
                    Porta 8080 · {{ gatewayStatus()?.health?.version || 'v2' }} · {{ gatewayStatus()?.health?.latencyMs || 0 }}ms
                  </p>
                </div>
              </div>

              <!-- Card 2: Instâncias Conectadas -->
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Instâncias Ativas</span>
                  <div class="size-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <span class="material-icons text-lg">phonelink_ring</span>
                  </div>
                </div>
                <div class="mt-4">
                  <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {{ gatewayStatus()?.counts?.open || 0 }}
                    <span class="text-sm font-normal text-slate-500">/ {{ gatewayStatus()?.counts?.total || 0 }} criadas</span>
                  </p>
                  <p class="text-xs text-emerald-400 font-medium mt-1">
                    {{ gatewayStatus()?.counts?.open || 0 }} conectadas no WhatsApp
                  </p>
                </div>
              </div>

              <!-- Card 3: Clínicas Elegíveis (PRO e VIP) -->
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Planos com WhatsApp</span>
                  <div class="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <span class="material-icons text-lg">verified</span>
                  </div>
                </div>
                <div class="mt-4">
                  <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {{ eligibleClinicsCount() }}
                  </p>
                  <p class="text-xs text-slate-400 font-medium mt-1">
                    Clínicas autorizadas (Planos PRO e VIP)
                  </p>
                </div>
              </div>

              <!-- Card 4: Atalho Evolution Manager -->
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/60 p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gerenciador Nativo</span>
                    <div class="size-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                      <span class="material-icons text-lg">open_in_new</span>
                    </div>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Acesso direto ao painel web nativo da Evolution API no navegador.
                  </p>
                </div>
                
                <div class="pt-3">
                  <a
                    href="http://localhost:8080/manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700">
                    <span class="material-icons text-sm">settings</span>
                    Abrir Evolution Manager
                  </a>
                </div>
              </div>

            </div>

            <!-- Filtros e Barra de Busca para Instâncias -->
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-4">
              
              <!-- Busca -->
              <div class="relative flex-1 w-full">
                <span class="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                <input
                  type="text"
                  [(ngModel)]="whatsappSearch"
                  placeholder="Buscar clínica por nome, slug ou identificador da instância..."
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <!-- Filtro Plano -->
              <div class="flex items-center gap-2 w-full md:w-auto">
                <span class="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Plano:</span>
                <select
                  [(ngModel)]="whatsappPlanFilter"
                  class="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
                  <option value="TODOS">Todos os Planos</option>
                  <option value="ELEGIVEIS">Apenas PRO e VIP</option>
                  <option value="PRO">Plano PRO</option>
                  <option value="VIP">Plano VIP</option>
                  <option value="BASICO">Básico (Sem WhatsApp)</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>

              <!-- Filtro Conexão -->
              <div class="flex items-center gap-2 w-full md:w-auto">
                <span class="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Conexão:</span>
                <select
                  [(ngModel)]="whatsappStateFilter"
                  class="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
                  <option value="TODOS">Todos os Estados</option>
                  <option value="open">Conectadas (open)</option>
                  <option value="connecting">Aguardando QR Code</option>
                  <option value="close">Desconectadas (close)</option>
                  <option value="not_provisioned">Não Provisionadas</option>
                </select>
              </div>

            </div>

            <!-- Tabela / Cards de Instâncias por Clínica -->
            <div class="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              
              @if (whatsappLoading()) {
                <div class="p-12 text-center text-slate-400 space-y-3">
                  <span class="material-icons animate-spin text-3xl text-emerald-500">sync</span>
                  <p class="text-sm font-medium">Consultando instâncias no gateway Evolution API...</p>
                </div>
              } @else if (filteredWhatsappInstances().length === 0) {
                <div class="p-12 text-center text-slate-400 space-y-3">
                  <span class="material-icons text-4xl text-slate-600">speaker_notes_off</span>
                  <p class="text-sm font-medium text-slate-300">Nenhuma instância encontrada com os filtros selecionados.</p>
                </div>
              } @else {

                <!-- Tabela Desktop -->
                <div class="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table class="w-full text-left text-xs text-slate-300">
                    <thead class="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                      <tr>
                        <th class="py-3.5 px-4">Clínica & Plano</th>
                        <th class="py-3.5 px-4">Instância Evolution</th>
                        <th class="py-3.5 px-4">Status no WhatsApp</th>
                        <th class="py-3.5 px-4">Número Pareado</th>
                        <th class="py-3.5 px-4">IA & Atendimento</th>
                        <th class="py-3.5 px-4 text-right">Ações da Instância</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60">
                      @for (inst of filteredWhatsappInstances(); track inst.tenantId) {
                        <tr class="hover:bg-slate-800/40 transition-colors">
                          
                          <!-- Clínica & Plano -->
                          <td class="py-4 px-4">
                            <div class="flex items-center gap-3">
                              <div class="size-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-700">
                                {{ (inst.tenantName || '?').slice(0, 2).toUpperCase() }}
                              </div>
                              <div>
                                <p class="font-bold text-white text-sm">{{ inst.tenantName }}</p>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="getPlanBadgeClass(inst.plan)">
                                    {{ inst.plan }}
                                  </span>
                                  @if (!inst.eligible) {
                                    <span class="text-[10px] text-amber-400 flex items-center gap-0.5" title="WhatsApp restrito aos planos PRO e VIP">
                                      <span class="material-icons text-xs">lock</span>
                                      Upgrade necessário
                                    </span>
                                  }
                                </div>
                              </div>
                            </div>
                          </td>

                          <!-- Instância Evolution -->
                          <td class="py-4 px-4">
                            <div class="font-mono text-xs text-slate-200 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                              {{ inst.instanceName }}
                            </div>
                          </td>

                          <!-- Status de Conexão -->
                          <td class="py-4 px-4">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5"
                              [ngClass]="getWhatsappStateBadge(inst.state)">
                              @if (inst.state === 'open') {
                                <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Conectado
                              } @else if (inst.state === 'connecting') {
                                <span class="size-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Aguardando QR
                              } @else if (inst.state === 'close') {
                                <span class="size-1.5 rounded-full bg-red-400"></span>
                                Desconectado
                              } @else if (inst.state === 'not_provisioned') {
                                <span class="size-1.5 rounded-full bg-slate-400"></span>
                                Não Criado
                              } @else {
                                {{ inst.state }}
                              }
                            </span>
                          </td>

                          <!-- Número Pareado -->
                          <td class="py-4 px-4">
                            @if (inst.ownerPhone) {
                              <div class="space-y-0.5">
                                <p class="font-bold text-slate-200 font-mono text-xs">+{{ inst.ownerPhone }}</p>
                                @if (inst.profileName) {
                                  <p class="text-[11px] text-slate-500 truncate max-w-[150px]">{{ inst.profileName }}</p>
                                }
                              </div>
                            } @else {
                              <span class="text-slate-500 text-xs italic">Nenhum aparelho pareado</span>
                            }
                          </td>

                          <!-- IA & Atendimento -->
                          <td class="py-4 px-4">
                            <div class="space-y-0.5">
                              @if (inst.aiEnabled) {
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  IA Ativa
                                </span>
                              } @else {
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                                  IA Desligada
                                </span>
                              }
                              <p class="text-[11px] text-slate-500 mt-1">{{ inst.conversationsCount }} conversas registradas</p>
                            </div>
                          </td>

                          <!-- Ações -->
                          <td class="py-4 px-4 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              
                              <!-- Gerar / Ver QR Code -->
                              <button
                                (click)="openQrModal(inst)"
                                [disabled]="!inst.eligible"
                                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                                title="Ver QR Code na tela para escanear">
                                <span class="material-icons text-sm text-emerald-400">qr_code_scanner</span>
                                QR Code
                              </button>

                              <!-- Reiniciar Instância -->
                              <button
                                (click)="restartInstance(inst)"
                                [disabled]="!inst.isProvisioned"
                                class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-cyan-400 transition-colors"
                                title="Reiniciar conexão da instância">
                                <span class="material-icons text-base">restart_alt</span>
                              </button>

                              <!-- Desconectar (Logout) -->
                              @if (inst.state === 'open') {
                                <button
                                  (click)="disconnectInstance(inst)"
                                  class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                  title="Desconectar WhatsApp (Logout)">
                                  <span class="material-icons text-base">logout</span>
                                </button>
                              }

                              <!-- Provisionar caso ainda não exista -->
                              @if (!inst.isProvisioned && inst.eligible) {
                                <button
                                  (click)="provisionInstance(inst)"
                                  class="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-600/20"
                                  title="Criar instância na Evolution API">
                                  <span class="material-icons text-sm">add_link</span>
                                  Criar
                                </button>
                              }

                            </div>
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Cards Mobile para Instâncias -->
                <div class="lg:hidden divide-y divide-slate-800/80">
                  @for (inst of filteredWhatsappInstances(); track inst.tenantId) {
                    <div class="p-4 space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h4 class="font-bold text-white text-sm">{{ inst.tenantName }}</h4>
                          <p class="text-xs font-mono text-slate-400">instância: {{ inst.instanceName }}</p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" [ngClass]="getWhatsappStateBadge(inst.state)">
                          {{ inst.state === 'open' ? 'Conectado' : (inst.state === 'connecting' ? 'Aguardando QR' : 'Desconectado') }}
                        </span>
                      </div>

                      <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span class="text-slate-500 text-[10px] block">Plano</span>
                          <span class="font-bold" [ngClass]="inst.eligible ? 'text-emerald-400' : 'text-slate-400'">{{ inst.plan }}</span>
                        </div>
                        <div>
                          <span class="text-slate-500 text-[10px] block">Aparelho</span>
                          {{ inst.ownerPhone ? '+' + inst.ownerPhone : 'Não pareado' }}
                        </div>
                      </div>

                      <div class="flex items-center gap-2 pt-1">
                        <button
                          (click)="openQrModal(inst)"
                          [disabled]="!inst.eligible"
                          class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700">
                          <span class="material-icons text-sm text-emerald-400">qr_code_scanner</span>
                          Ver QR Code
                        </button>
                        <button
                          (click)="restartInstance(inst)"
                          [disabled]="!inst.isProvisioned"
                          class="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center">
                          <span class="material-icons text-sm">restart_alt</span>
                        </button>
                        @if (inst.state === 'open') {
                          <button
                            (click)="disconnectInstance(inst)"
                            class="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center">
                            <span class="material-icons text-sm">logout</span>
                          </button>
                        }
                      </div>

                    </div>
                  }
                </div>

              }

            </div>
          </div>
        }

      </div>

      <!-- ============================================================== -->
      <!-- MODAL 1: PRORROGAR TRIAL                                      -->
      <!-- ============================================================== -->
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
                  class="py-3 rounded-xl text-sm font-bold border border-slate-700/80 transition-all flex flex-col items-center justify-center gap-0.5">
                  <span>+{{ d }}</span>
                  <span class="text-[10px] uppercase tracking-wider font-semibold opacity-80">dias</span>
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
                Confirmar Extensão
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================== -->
      <!-- MODAL 2: MUDAR PLANO                                           -->
      <!-- ============================================================== -->
      @if (planModalOpen()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span class="material-icons text-cyan-400 text-xl">grade</span>
                Alterar Plano da Clínica
              </h3>
              <button (click)="planModalOpen.set(false)" class="text-slate-400 hover:text-white">
                <span class="material-icons">close</span>
              </button>
            </div>

            <p class="text-xs text-slate-400">
              Selecione o novo plano para <strong class="text-white">{{ selectedTenant()?.name }}</strong>.
              (Planos PRO e VIP habilitam automaticamente o módulo WhatsApp integrado).
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

      <!-- ============================================================== -->
      <!-- MODAL 3: PAREAMENTO QR CODE DO WHATSAPP                       -->
      <!-- ============================================================== -->
      @if (qrModalOpen()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <span class="material-icons text-emerald-400 text-xl">qr_code_2</span>
                  Conexão WhatsApp
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Clínica: <strong class="text-slate-200">{{ selectedInstanceForQr()?.tenantName }}</strong>
                </p>
              </div>
              <button (click)="qrModalOpen.set(false)" class="text-slate-400 hover:text-white">
                <span class="material-icons">close</span>
              </button>
            </div>

            <!-- Conteúdo Central do QR Code -->
            <div class="text-center py-2 space-y-4">
              
              @if (qrLoading()) {
                <div class="py-12 space-y-3">
                  <span class="material-icons animate-spin text-4xl text-emerald-400">sync</span>
                  <p class="text-xs text-slate-400 font-medium">Gerando QR Code da Evolution API...</p>
                </div>
              } @else if (qrData()?.state === 'open') {
                
                <!-- Já conectado com sucesso -->
                <div class="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                  <div class="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <span class="material-icons text-3xl">verified</span>
                  </div>
                  <h4 class="text-sm font-bold text-white">Aparelho Conectado com Sucesso!</h4>
                  <p class="text-xs text-slate-300">
                    A instância <code class="font-mono text-emerald-300">{{ qrData()?.instanceName }}</code> está ativa e recebendo mensagens normalmente.
                  </p>
                </div>

              } @else if (qrData()?.base64) {
                
                <!-- Imagem do QR Code -->
                <div class="inline-block p-4 bg-white rounded-2xl shadow-xl mx-auto border border-slate-200">
                  <img
                    [src]="qrData()?.base64"
                    alt="QR Code WhatsApp"
                    class="size-60 object-contain mx-auto"
                  />
                </div>

                <div class="space-y-1.5 text-xs text-slate-400 max-w-xs mx-auto">
                  <p class="font-semibold text-slate-200 flex items-center justify-center gap-1">
                    <span class="material-icons text-xs text-emerald-400">smartphone</span>
                    Instruções para Parear:
                  </p>
                  <ol class="text-left text-[11px] space-y-1 list-decimal list-inside text-slate-400">
                    <li>Abra o WhatsApp no celular da clínica;</li>
                    <li>Toque em <strong>Configurações</strong> &gt; <strong>Aparelhos Conectados</strong>;</li>
                    <li>Toque em <strong>Conectar um Aparelho</strong> e aponte a câmera.</li>
                  </ol>
                </div>

              } @else {
                
                <div class="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <span class="material-icons text-3xl text-amber-400">info</span>
                  <p class="text-xs text-slate-300">
                    {{ qrData()?.error || 'Aguardando o gateway gerar o código de pareamento...' }}
                  </p>
                </div>

              }

            </div>

            <!-- Rodapé do Modal -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                (click)="refreshQrCode()"
                [disabled]="qrLoading()"
                class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <span class="material-icons text-sm" [class.animate-spin]="qrLoading()">refresh</span>
                Atualizar QR Code
              </button>

              <button
                (click)="qrModalOpen.set(false)"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20">
                Concluído
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

  // Navegação de Abas
  activeTab = signal<'tenants' | 'whatsapp'>('tenants');

  // Estado da Aba 1 (Clínicas & SaaS)
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

  // Estado da Aba 2 (WhatsApp Gateway Multi-Clínica)
  whatsappLoading = signal(false);
  gatewayStatus = signal<EvolutionGatewayStatus | null>(null);
  whatsappInstances = signal<ClinicWhatsAppInstance[]>([]);
  whatsappSearch = '';
  whatsappPlanFilter = 'TODOS';
  whatsappStateFilter = 'TODOS';

  qrModalOpen = signal(false);
  selectedInstanceForQr = signal<ClinicWhatsAppInstance | null>(null);
  qrData = signal<WhatsAppQrCodeResponse | null>(null);
  qrLoading = signal(false);

  availablePlans = [
    { code: 'TRIAL', name: 'Trial 14 Dias', desc: 'Período gratuito de degustação', price: 'R$ 0,00' },
    { code: 'BASICO', name: 'Plano Básico', desc: 'Até 100 pacientes e 10 profissionais', price: 'R$ 149,00/mês' },
    { code: 'PRO', name: 'Plano Profissional', desc: 'WhatsApp + IA + Ilimitado', price: 'R$ 299,00/mês' },
    { code: 'VIP', name: 'VIP Vitalício', desc: 'Acesso permanente liberado com WhatsApp', price: 'Cortesia' },
  ];

  ngOnInit() {
    this.loadAll();
    // Checa status preliminar do gateway para exibir badge
    this.superAdminService.getWhatsAppGatewayStatus().subscribe({
      next: (res) => this.gatewayStatus.set(res),
      error: () => {},
    });
  }

  setTab(tab: 'tenants' | 'whatsapp') {
    this.activeTab.set(tab);
    if (tab === 'whatsapp') {
      this.loadWhatsAppGateway();
    }
  }

  refreshCurrentTab() {
    if (this.activeTab() === 'tenants') {
      this.loadAll();
    } else {
      this.loadWhatsAppGateway();
    }
  }

  // --- MÉTODOS DA ABA 1 (CLÍNICAS) ---

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
      ? `Tem certeza que deseja BLOQUEAR o acesso da clínica "${t.name}"? O WhatsApp dela também será desconectado.`
      : `Deseja DESBLOQUEAR e reativar o acesso da clínica "${t.name}"?`;

    if (!confirm(confirmMsg)) return;

    this.superAdminService.updateStatus(t.id, nextStatus).subscribe({
      next: () => {
        this.toast.success(`Clínica ${nextStatus === 'BLOQUEADO' ? 'bloqueada' : 'desbloqueada'} com sucesso`);
        this.loadAll();
        if (this.activeTab() === 'whatsapp') this.loadWhatsAppGateway();
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
        if (this.activeTab() === 'whatsapp') this.loadWhatsAppGateway();
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

  // --- MÉTODOS DA ABA 2 (WHATSAPP MULTI-TENANT) ---

  loadWhatsAppGateway() {
    this.whatsappLoading.set(true);
    
    // 1. Status do Servidor
    this.superAdminService.getWhatsAppGatewayStatus().subscribe({
      next: (res) => this.gatewayStatus.set(res),
      error: () => this.toast.error('Falha ao checar status da Evolution API'),
    });

    // 2. Instâncias das Clínicas
    this.superAdminService.getWhatsAppInstances().subscribe({
      next: (res) => {
        this.whatsappInstances.set(res.instances);
        this.whatsappLoading.set(false);
      },
      error: () => {
        this.toast.error('Erro ao carregar instâncias de WhatsApp');
        this.whatsappLoading.set(false);
      },
    });
  }

  eligibleClinicsCount(): number {
    return this.whatsappInstances().filter(i => i.eligible).length;
  }

  filteredWhatsappInstances(): ClinicWhatsAppInstance[] {
    let list = this.whatsappInstances();
    
    // Busca
    if (this.whatsappSearch.trim()) {
      const q = this.whatsappSearch.trim().toLowerCase();
      list = list.filter(i => 
        i.tenantName.toLowerCase().includes(q) ||
        i.tenantSlug.toLowerCase().includes(q) ||
        i.instanceName.toLowerCase().includes(q) ||
        (i.ownerPhone && i.ownerPhone.includes(q))
      );
    }

    // Filtro de Plano
    if (this.whatsappPlanFilter === 'ELEGIVEIS') {
      list = list.filter(i => i.eligible);
    } else if (this.whatsappPlanFilter !== 'TODOS') {
      list = list.filter(i => i.plan === this.whatsappPlanFilter);
    }

    // Filtro de Conexão
    if (this.whatsappStateFilter !== 'TODOS') {
      list = list.filter(i => i.state === this.whatsappStateFilter);
    }

    return list;
  }

  getWhatsappStateBadge(state: string): string {
    switch (state) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'connecting':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'close':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'not_provisioned':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  openQrModal(inst: ClinicWhatsAppInstance) {
    this.selectedInstanceForQr.set(inst);
    this.qrModalOpen.set(true);
    this.refreshQrCode();
  }

  refreshQrCode() {
    const inst = this.selectedInstanceForQr();
    if (!inst) return;

    this.qrLoading.set(true);
    this.superAdminService.getWhatsAppQrCode(inst.tenantId).subscribe({
      next: (res) => {
        this.qrData.set(res);
        this.qrLoading.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.error || 'Erro ao carregar QR Code');
        this.qrLoading.set(false);
      },
    });
  }

  restartInstance(inst: ClinicWhatsAppInstance) {
    if (!confirm(`Deseja reiniciar a instância "${inst.instanceName}" da clínica ${inst.tenantName}?`)) {
      return;
    }

    this.superAdminService.restartWhatsAppInstance(inst.tenantId).subscribe({
      next: () => {
        this.toast.success(`Instância ${inst.instanceName} reiniciada com sucesso`);
        this.loadWhatsAppGateway();
      },
      error: () => {
        this.toast.error('Erro ao reiniciar instância');
      },
    });
  }

  disconnectInstance(inst: ClinicWhatsAppInstance) {
    if (!confirm(`Tem certeza que deseja desconectar (logout) o WhatsApp da clínica ${inst.tenantName}? A sessão será encerrada no aparelho.`)) {
      return;
    }

    this.superAdminService.disconnectWhatsAppInstance(inst.tenantId).subscribe({
      next: () => {
        this.toast.success(`Instância ${inst.instanceName} desconectada com sucesso`);
        this.loadWhatsAppGateway();
      },
      error: () => {
        this.toast.error('Erro ao desconectar instância');
      },
    });
  }

  provisionInstance(inst: ClinicWhatsAppInstance) {
    this.superAdminService.provisionWhatsAppInstance(inst.tenantId).subscribe({
      next: (res) => {
        this.toast.success(`Instância provisionada com sucesso: ${res.instanceName || inst.instanceName}`);
        this.loadWhatsAppGateway();
      },
      error: (err) => {
        this.toast.error(err?.error?.error || 'Erro ao provisionar instância');
      },
    });
  }
}
