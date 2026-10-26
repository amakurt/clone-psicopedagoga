import { Component, signal, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../shared/services/dialog.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class]="scrolled() ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span class="material-icons text-white text-xl">psychology</span>
            </div>
            <span class="text-xl font-black text-gray-900 dark:text-white">EduPsych<span class="text-primary">Pro</span></span>
          </a>

          <div class="hidden md:flex items-center gap-8">
            <a href="#features" (click)="scrollTo('features', $event)" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#planos" (click)="scrollTo('planos', $event)" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Planos</a>
            <a href="#testimonials" (click)="scrollTo('testimonials', $event)" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Depoimentos</a>
            <a href="#features" (click)="scrollTo('features', $event)" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Para Profissionais</a>
            <a href="#parents" (click)="scrollTo('parents', $event)" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Para Pais</a>
          </div>

          <div class="hidden md:flex items-center gap-3">
            <button (click)="openDemo()" [disabled]="loadingDemo()" 
              class="px-4 py-2 border-2 border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Acessar ambiente de teste com 1 clique">
              <span class="material-icons text-base">visibility</span>
              <span>{{ loadingDemo() ? 'Abrindo...' : 'Ver Demonstração' }}</span>
            </button>
            <a routerLink="/login" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-primary transition-colors">Entrar</a>
            <button (click)="scrollTo('planos', $event)" class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25 cursor-pointer">Começar Agora</button>
          </div>

          <button (click)="mobileMenu.set(!mobileMenu())" class="md:hidden p-2 text-gray-600 dark:text-slate-300">
            <span class="material-icons">{{ mobileMenu() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      @if (mobileMenu()) {
        <div class="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-4 space-y-3">
          <a href="#features" (click)="mobileMenu.set(false); scrollTo('features', $event)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Funcionalidades</a>
          <a href="#planos" (click)="mobileMenu.set(false); scrollTo('planos', $event)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Planos</a>
          <a href="#testimonials" (click)="mobileMenu.set(false); scrollTo('testimonials', $event)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Depoimentos</a>
          <a href="#features" (click)="mobileMenu.set(false); scrollTo('features', $event)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Para Profissionais</a>
          <a href="#parents" (click)="mobileMenu.set(false); scrollTo('parents', $event)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Para Pais</a>
          <hr class="border-gray-200 dark:border-slate-700">
          <button (click)="mobileMenu.set(false); openDemo()" [disabled]="loadingDemo()"
            class="w-full py-2.5 border-2 border-primary/40 text-primary rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
            <span class="material-icons text-base">visibility</span>
            <span>{{ loadingDemo() ? 'Abrindo Demonstração...' : 'Ver Demonstração ao Vivo' }}</span>
          </button>
          <a routerLink="/login" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Entrar</a>
          <button (click)="mobileMenu.set(false); scrollTo('planos', $event)" class="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold text-center">Começar Agora</button>
        </div>
      }
    </nav>

    <!-- Hero -->
    <section class="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#eff2f6] dark:bg-[#19212e]">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span class="material-icons text-primary text-sm">auto_awesome</span>
              <span class="text-sm font-semibold text-primary">A Nova Era da Psicopedagogia</span>
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              Gestão Clínica com
              <span class="text-primary relative">
                Inteligência
                <svg class="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 10 198 4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </span>
              e
              <span class="text-primary">Afeto.</span>
            </h1>

            <p class="mt-6 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              A plataforma completa para psicopedagogos, terapeutas e pais acompanharem o desenvolvimento de crianças com TEA e necessidades especiais.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <button (click)="scrollTo('planos', $event)" class="px-7 py-4 bg-primary hover:bg-primary-dark text-on-primary rounded-2xl font-bold text-base transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer">
                <span>Começar Agora</span>
                <span class="material-icons">arrow_forward</span>
              </button>
              <button (click)="openDemo()" [disabled]="loadingDemo()" class="px-6 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 rounded-2xl font-bold text-base transition-all border-2 border-primary/30 flex items-center gap-2 shadow-sm disabled:opacity-50">
                <span class="material-icons text-primary">visibility</span>
                <span>{{ loadingDemo() ? 'Abrindo Demo...' : 'Ver Demonstração' }}</span>
              </button>
              <button (click)="openVideoModal()" class="px-6 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-base transition-all border border-slate-300 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                <span class="material-icons text-rose-500">smart_display</span>
                <span>Vídeo Tour (2 min)</span>
              </button>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              @for (pill of heroPills; track pill) {
                <span class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                  <span class="material-icons text-primary text-base">check_circle</span>
                  {{ pill }}
                </span>
              }
            </div>
          </div>

          <div class="relative hidden lg:block">
            <div class="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-3xl rotate-12 animate-bounce"></div>
            <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/15 rounded-full animate-pulse"></div>
            <img src="images/hero-mockup.png" alt="EduPsych Pro Dashboard" class="relative rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700">
          </div>
        </div>
      </div>
    </section>

    <!-- Features - Professionals -->
    <section id="features" class="py-20 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span class="material-icons text-primary text-sm">science</span>
            <span class="text-sm font-semibold text-primary">Para Profissionais</span>
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Tudo que você precisa em um só lugar</h2>
          <p class="mt-4 text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Ferramentas pensadas para otimizar seu tempo e melhorar a qualidade do atendimento.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (feature of professionalFeatures; track feature.title) {
            <div class="group p-8 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 overflow-hidden" [class]="feature.bgClass">
                <span class="material-icons text-2xl" [class]="feature.iconClass">{{ feature.icon }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600 dark:text-slate-400 leading-relaxed">{{ feature.description }}</p>
            </div>
          }
        </div>

        <!-- Mobile UI Mockup -->
        <div class="mt-16 flex justify-center">
          <div class="relative w-64 bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-200 dark:border-slate-700">
            <div class="w-20 h-5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4"></div>
            <div class="space-y-3">
              <div class="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-primary text-sm">event</span>
                  </div>
                  <div class="flex-1">
                    <div class="h-3 bg-gray-200 dark:bg-slate-600 rounded w-24 mb-1"></div>
                    <div class="h-2 bg-gray-200 dark:bg-slate-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-primary text-sm">description</span>
                  </div>
                  <div class="flex-1">
                    <div class="h-3 bg-primary/30 rounded w-28 mb-1"></div>
                    <div class="h-2 bg-primary/20 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-sky-600 text-sm">trending_up</span>
                  </div>
                  <div class="flex-1">
                    <div class="h-3 bg-gray-200 dark:bg-slate-600 rounded w-20 mb-1"></div>
                    <div class="h-2 bg-gray-200 dark:bg-slate-600 rounded w-14"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating notification -->
            <div class="absolute -right-8 top-12 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-lg border border-gray-100 dark:border-slate-700 animate-bounce">
              <div class="flex items-center gap-2">
<div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-green-600 text-sm">verified</span>
                  </div>
                <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Atividade recebida!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features - Parents -->
    <section id="parents" class="py-20 bg-gray-50 dark:bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
            <span class="material-icons text-orange-600 text-sm">family_restroom</span>
            <span class="text-sm font-semibold text-orange-600">Para os Pais</span>
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Acompanhe cada passo do desenvolvimento</h2>
          <p class="mt-4 text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Transparência e conexão direta com o profissional que cuida do seu filho.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (feature of parentFeatures; track feature.title) {
            <div class="group p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 overflow-hidden" [class]="feature.bgClass">
                <span class="material-icons text-2xl" [class]="feature.iconClass">{{ feature.icon }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600 dark:text-slate-400 leading-relaxed">{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="planos" class="py-20 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span class="material-icons text-primary text-sm">workspace_premium</span>
            <span class="text-sm font-semibold text-primary">Planos e Preços</span>
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Planos simples e transparentes</h2>
          <p class="mt-4 text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sem fidelidade no plano mensal ou economize até 45% nos ciclos semestral e anual. Todos os recursos clínicos desbloqueados em todos os planos.
          </p>
        </div>

        <!-- Banner 7 Dias Grátis -->
        <div class="mb-12 max-w-4xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 via-primary/10 to-emerald-500/10 dark:from-slate-800 dark:to-slate-800 rounded-3xl border-2 border-primary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/5">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
              <span class="material-icons text-3xl">verified</span>
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary text-xs font-black uppercase rounded-full mb-1">
                Sem cartão de crédito
              </div>
              <h3 class="text-xl font-black text-gray-900 dark:text-white">Experimente 7 dias totalmente grátis</h3>
              <p class="text-sm text-gray-600 dark:text-slate-400 mt-1">Crie sua conta agora, explore todos os módulos e só assine se amar a plataforma.</p>
            </div>
          </div>
          <a routerLink="/login" [queryParams]="{mode: 'register', type: 'professional', plan: 'TRIAL'}"
            class="px-7 py-3.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-sm font-black transition-all shrink-0 flex items-center gap-2 shadow-lg shadow-primary/25 cursor-pointer">
            <span>Iniciar Teste Grátis</span>
            <span class="material-icons text-base">arrow_forward</span>
          </a>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          @for (plan of visiblePlans(); track plan.code) {
            <div class="relative flex flex-col p-8 rounded-3xl border transition-all duration-300"
              [class]="plan.code === 'SEMESTRAL'
                ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-2xl shadow-primary/20 md:-mt-4 md:mb-4 ring-2 ring-primary/30'
                : (plan.code === 'ANUAL'
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/40 shadow-xl'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:shadow-xl')">
              
              @if (planBadge(plan)) {
                <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-[11px] font-black uppercase tracking-wider rounded-full shadow-md whitespace-nowrap"
                  [class]="plan.code === 'SEMESTRAL'
                    ? 'bg-primary text-on-primary'
                    : (plan.code === 'ANUAL' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200')">
                  {{ planBadge(plan) }}
                </div>
              }

              <h3 class="text-xl font-black text-gray-900 dark:text-white">{{ plan.name }}</h3>
              
              <div class="mt-4 flex items-baseline gap-1.5">
                <span class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">{{ planMonthlyPrice(plan) }}</span>
                <span class="text-sm font-bold text-gray-500 dark:text-slate-400">/mês</span>
              </div>
              
              <p class="text-xs font-semibold text-primary dark:text-teal-400 mt-1 min-h-[1.25rem]">
                {{ planBillingCycleText(plan) }}
              </p>

              <hr class="my-6 border-gray-200 dark:border-slate-700">

              <ul class="space-y-3 flex-1">
                @for (feature of planFeatures(plan); track feature) {
                  <li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <span class="material-icons text-primary text-base mt-0.5 shrink-0">check_circle</span>
                    <span>{{ feature }}</span>
                  </li>
                }
              </ul>

              <a routerLink="/login" [queryParams]="{mode: 'register', type: 'professional', plan: plan.code}"
                class="mt-8 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-md"
                [class]="plan.code === 'SEMESTRAL'
                  ? 'bg-primary hover:bg-primary-dark text-on-primary shadow-lg shadow-primary/25'
                  : (plan.code === 'ANUAL'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600')">
                Assinar {{ plan.name }}
                <span class="material-icons text-base">arrow_forward</span>
              </a>
            </div>
          }
        </div>

        <!-- Banner Chamada para a Demonstração -->
        <div class="mt-14 p-6 sm:p-8 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl border border-teal-200/60 dark:border-slate-700 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span class="material-icons text-primary text-3xl">play_circle</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white text-base">Quer experimentar todas as funcionalidades agora?</h4>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">Acesse nosso ambiente de teste com 1 clique, com pacientes e laudos de exemplo prontos para você navegar.</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <button (click)="openVideoModal()"
              class="px-5 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <span class="material-icons text-rose-500 text-base">smart_display</span>
              <span>Ver Vídeo</span>
            </button>
            <button (click)="openDemo()" [disabled]="loadingDemo()"
              class="px-6 py-3.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
              <span class="material-icons text-lg">visibility</span>
              <span>{{ loadingDemo() ? 'Abrindo Demonstração...' : 'Testar Demonstração Grátis' }}</span>
            </button>
          </div>
        </div>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-slate-400">
          Pagamento via PIX instantâneo com ativação imediata. Todos os planos incluem prontuários, agenda, evoluções, laudos com IA, WhatsApp e suporte.
        </p>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="py-20 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span class="material-icons text-primary text-sm">format_quote</span>
            <span class="text-sm font-semibold text-primary">Depoimentos</span>
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">O que dizem sobre nos</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (testimonial of testimonials; track testimonial.name) {
            <div class="p-8 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
              <div class="flex gap-1 mb-4">
                @for (star of [1,2,3,4,5]; track star) {
                  <span class="material-icons text-orange-400 text-lg">star</span>
                }
              </div>
              <p class="text-gray-600 dark:text-slate-400 leading-relaxed mb-6 italic">"{{ testimonial.quote }}"</p>
              <div class="flex items-center gap-3">
                <img [src]="testimonial.avatar" [alt]="testimonial.name" class="w-12 h-12 rounded-full">
                <div>
                  <p class="font-bold text-gray-900 dark:text-white">{{ testimonial.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ testimonial.role }}</p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- CTA Banner -->
        <div class="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 class="text-2xl md:text-3xl font-black mb-4">Pronto para transformar sua clínica?</h3>
          <p class="text-white/80 mb-8 max-w-xl mx-auto">Escolha o plano ideal para a sua rotina ou experimente 7 dias grátis.</p>
          <button (click)="scrollTo('planos', $event)" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-dark rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg cursor-pointer">
            Escolher Meu Plano & Começar
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 dark:bg-slate-950 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-12">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span class="material-icons text-white text-xl">psychology</span>
              </div>
              <span class="text-xl font-black">EduPsych<span class="text-primary">Pro</span></span>
            </div>
            <p class="text-gray-400 max-w-sm leading-relaxed">A tecnologia a serviço do desenvolvimento humano.</p>
            <div class="flex gap-4 mt-6">
              <a href="https://www.instagram.com/amauricostacastro/" target="_blank" rel="noopener noreferrer"
                class="w-10 h-10 bg-gray-800 hover:bg-rose-600 rounded-xl flex items-center justify-center transition-colors"
                title="Siga no Instagram @amauricostacastro">
                <span class="material-icons text-lg">photo_camera</span>
              </a>
              <a href="https://wa.me/5585988014049?text=Ol%C3%A1!%20Gostaria%20de%20falar%20sobre%20o%20EduPsych%20Pro." target="_blank" rel="noopener noreferrer"
                class="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors"
                title="Fale no WhatsApp (85) 98801-4049">
                <span class="material-icons text-lg">chat</span>
              </a>
              <a href="mailto:amakurt@gmail.com"
                class="w-10 h-10 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-colors"
                title="E-mail: amakurt@gmail.com">
                <span class="material-icons text-lg">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 class="font-bold mb-4">Plataforma</h4>
            <ul class="space-y-3">
              <li><a href="#features" (click)="scrollTo('features', $event)" class="text-gray-400 hover:text-white transition-colors text-sm">Funcionalidades</a></li>
              <li><a href="#planos" (click)="scrollTo('planos', $event)" class="text-gray-400 hover:text-white transition-colors text-sm">Planos</a></li>
              <li><a href="#testimonials" (click)="scrollTo('testimonials', $event)" class="text-gray-400 hover:text-white transition-colors text-sm">Depoimentos</a></li>
              <li><a routerLink="/login" [queryParams]="{mode: 'register', type: 'professional', plan: 'TRIAL'}" class="text-gray-400 hover:text-white transition-colors text-sm">Criar Conta (7 Dias Grátis)</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-4">Suporte & Contato</h4>
            <ul class="space-y-3">
              <li>
                <a href="https://wa.me/5585988014049?text=Ol%C3%A1!%20Preciso%20de%20suporte%20com%20o%20EduPsych%20Pro." target="_blank" rel="noopener noreferrer"
                  class="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1.5">
                  <span class="material-icons text-emerald-400 text-sm">chat</span>
                  <span>(85) 98801-4049</span>
                </a>
              </li>
              <li>
                <a href="mailto:amakurt@gmail.com" class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
                  <span class="material-icons text-sm">mail</span>
                  <span>amakurt&#64;gmail.com</span>
                </a>
              </li>
              <li><a routerLink="/privacidade" class="text-gray-400 hover:text-white transition-colors text-sm">Privacidade</a></li>
              <li><a routerLink="/termos" class="text-gray-400 hover:text-white transition-colors text-sm">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        <hr class="border-gray-800 my-12">

        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-sm">2024 EduPsych Pro. Todos os direitos reservados.</p>
          <p class="text-gray-400 text-sm flex items-center gap-1">
            Feito com <span class="material-icons text-red-500 text-sm">favorite</span> para quem cuida de crianças especiais
          </p>
        </div>
      </div>
    </footer>

    <!-- Video Tour Modal -->
    @if (videoModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        (click)="closeVideoModal()">
        <div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          (click)="$event.stopPropagation()">
          
          <!-- Header Modal -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-icons text-xl">smart_display</span>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white">Vídeo Tour do EduPsych Pro</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Conheça os principais recursos em 2 minutos</p>
              </div>
            </div>
            <button (click)="closeVideoModal()" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors">
              <span class="material-icons text-xl">close</span>
            </button>
          </div>

          <!-- Video Presentation Showcase -->
          <div class="p-6 md:p-8 space-y-6">
            <div class="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center text-center p-6 border border-slate-800">
              <div class="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/10 animate-pulse">
                <span class="material-icons text-4xl">play_arrow</span>
              </div>
              <h4 class="text-xl font-bold text-white mb-2">Visão Geral dos Módulos Clínicos</h4>
              <p class="text-sm text-slate-300 max-w-md">
                Prontuários eletrônicos intuitivos, criação de PEI orientada por IA, relatórios de evolução automática e área exclusiva para a família.
              </p>
              <div class="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-white/90">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Demonstração Interativa Disponível com 1 Clique
              </div>
            </div>

            <!-- Features Highlights -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span class="material-icons text-primary text-xl">folder_shared</span>
                <p class="font-bold text-xs text-slate-800 dark:text-white mt-1">Prontuários & Anamneses</p>
                <p class="text-[11px] text-slate-500">Histórico completo e seguro</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span class="material-icons text-primary text-xl">auto_awesome</span>
                <p class="font-bold text-xs text-slate-800 dark:text-white mt-1">Laudos com IA</p>
                <p class="text-[11px] text-slate-500">Relatórios em minutos</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span class="material-icons text-primary text-xl">chat</span>
                <p class="font-bold text-xs text-slate-800 dark:text-white mt-1">WhatsApp Integrado</p>
                <p class="text-[11px] text-slate-500">Lembretes automáticos</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span class="material-icons text-primary text-xl">family_restroom</span>
                <p class="font-bold text-xs text-slate-800 dark:text-white mt-1">Portal da Família</p>
                <p class="text-[11px] text-slate-500">Engajamento dos pais</p>
              </div>
            </div>

            <!-- Modal Footer Actions -->
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button (click)="closeVideoModal(); scrollTo('planos', $event)" class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer">
                Ver tabela completa de planos
              </button>
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <button (click)="closeVideoModal(); openDemo()" [disabled]="loadingDemo()"
                  class="flex-1 sm:flex-initial px-5 py-2.5 border-2 border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50">
                  <span class="material-icons text-base">visibility</span>
                  <span>{{ loadingDemo() ? 'Abrindo...' : 'Testar Demonstração ao Vivo' }}</span>
                </button>
                <a routerLink="/login" [queryParams]="{mode: 'register', type: 'professional', plan: 'TRIAL'}" (click)="closeVideoModal()"
                  class="flex-1 sm:flex-initial px-6 py-2.5 bg-primary hover:bg-primary-dark text-on-primary rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20">
                  <span>Criar Conta (7 Dias Grátis)</span>
                  <span class="material-icons text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Floating WhatsApp Button -->
    <a href="https://wa.me/5585988014049?text=Ol%C3%A1!%20Conheci%20o%20EduPsych%20Pro%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20plataforma."
       target="_blank"
       rel="noopener noreferrer"
       class="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white pl-3.5 pr-4 py-3 rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300"
       title="Falar com suporte no WhatsApp">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
      <svg class="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.072-2.112-.513-1.619-.669-2.663-2.316-2.744-2.424-.08-.108-.654-.87-.654-1.659 0-.788.414-1.176.56-1.332.146-.156.32-.196.427-.196.107 0 .213.002.306.007.098.005.23-.037.36.275.133.32.454 1.107.494 1.187.04.08.067.174.013.281-.053.107-.08.174-.16.268-.08.093-.168.208-.24.281-.08.08-.163.167-.07.327.093.16.413.682.886 1.103.609.542 1.123.71 1.283.79.16.08.253.067.347-.04.093-.107.4-.467.507-.627.107-.16.213-.133.36-.08.147.053.934.44 1.094.52.16.08.267.12.307.187.04.067.04.387-.104.792zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.301C8.423 21.498 10.158 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.583 0-3.076-.442-4.359-1.21l-.312-.187-2.923.767.78-2.85-.205-.327C4.168 15.11 3.75 13.593 3.75 12c0-4.549 3.701-8.25 8.25-8.25 4.549 0 8.25 3.701 8.25 8.25 0 4.549-3.701 8.25-8.25 8.25z"/>
      </svg>
      <span class="text-xs sm:text-sm font-bold tracking-wide">Tirar Dúvidas</span>
    </a>
  `,
  styles: [`
    :host { display: block; }
    section[id] { scroll-margin-top: 84px; }
  `]
})
export class LandingPageComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  scrolled = signal(false);
  mobileMenu = signal(false);
  loadingDemo = signal(false);
  videoModalOpen = signal(false);
  plans = signal<any[]>([]);

  private defaultPlans = [
    {
      code: 'MENSAL',
      name: 'Plano Mensal',
      priceCents: 12700,
      active: true,
      features: JSON.stringify([
        'Pacientes e atendimentos ilimitados',
        'Prontuários e anamneses 100% digitais',
        'Agenda com confirmação e lembretes WhatsApp',
        'Elaboração de laudos, PEI e relatórios',
        'Acesso exclusivo ao Portal dos Pais',
        'Sem fidelidade ou carência (cancele a qualquer momento)'
      ])
    },
    {
      code: 'SEMESTRAL',
      name: 'Plano Semestral',
      priceCents: 9900,
      active: true,
      features: JSON.stringify([
        'Tudo do Plano Mensal incluído',
        'Economia de 22% (R$ 99/mês faturado semestralmente)',
        'Assistente de IA para redação de laudos e pareceres',
        'Modelos prontos de anamnese, PEI e escalas',
        'Suporte prioritário via WhatsApp',
        'Treinamento e onboarding guiado para a clínica'
      ])
    },
    {
      code: 'ANUAL',
      name: 'Plano Anual',
      priceCents: 6900,
      active: true,
      features: JSON.stringify([
        'Tudo do Plano Semestral incluído',
        'Super economia de 45% (R$ 69/mês faturado anualmente)',
        'IA ilimitada para geração de laudos e devolutivas',
        'Exportação profissional em PDF com logotipo personalizado',
        'Acesso antecipado a todos os novos recursos e módulos',
        'Consultoria de implantação e migração de prontuários'
      ])
    }
  ];

  ngOnInit() {
    this.plans.set(this.defaultPlans);
    fetch(`${environment.apiUrl}/billing/plans`)
      .then(res => res.ok ? res.json() : { data: [] })
      .then((data: any) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          this.plans.set(data.data);
        }
      })
      .catch(() => {
        // Keeps default plans fallback
      });
  }

  visiblePlans() {
    return this.plans().filter(p => p.code !== 'VIP' && p.active);
  }

  openVideoModal() {
    this.videoModalOpen.set(true);
  }

  closeVideoModal() {
    this.videoModalOpen.set(false);
  }

  async openDemo() {
    if (this.loadingDemo()) return;
    this.loadingDemo.set(true);
    try {
      const res = await fetch(`${environment.apiUrl}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao carregar ambiente de demonstração');
      }
      const data = await res.json();
      this.auth.login(data.token, data.user, data.tenants, data.tenant);
      this.router.navigate(['/app/dashboard']);
    } catch (err: any) {
      console.error('[DEMO_ERROR]', err);
      const isConnectionError = !err?.message || err.message.includes('fetch') || err.message.includes('NetworkError');
      const friendlyMsg = isConnectionError
        ? 'Não foi possível conectar ao servidor da demonstração. Verifique se o backend está ativo ou tente novamente em instantes.'
        : (err.message || 'Não foi possível iniciar a demonstração. Tente novamente.');

      this.dialog.error(friendlyMsg, 'Ambiente de Demonstração');
    } finally {
      this.loadingDemo.set(false);
    }
  }

  scrollTo(id: string, event?: Event) {
    event?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formatPrice(cents: number) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }

  planMonthlyPrice(plan: any): string {
    if (plan.code === 'MENSAL') return 'R$ 127';
    if (plan.code === 'SEMESTRAL') return 'R$ 99';
    if (plan.code === 'ANUAL') return 'R$ 69';
    return this.formatPrice(plan.priceCents);
  }

  planBillingCycleText(plan: any): string {
    if (plan.code === 'MENSAL') return 'Cobrança mensal flexível sem fidelidade';
    if (plan.code === 'SEMESTRAL') return 'Faturamento semestral de R$ 594 (22% OFF)';
    if (plan.code === 'ANUAL') return 'Faturamento anual de R$ 828 (45% OFF)';
    return 'Cobrança recorrente via PIX';
  }

  planBadge(plan: any): string {
    if (plan.code === 'MENSAL') return 'FLEXÍVEL';
    if (plan.code === 'SEMESTRAL') return 'MAIS POPULAR • 22% OFF';
    if (plan.code === 'ANUAL') return 'MELHOR VALOR • 45% OFF';
    return '';
  }

  planFeatures(plan: any): string[] {
    try {
      const parsed = JSON.parse(plan.features || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  heroPills = ['Prontuários Online', 'Agenda Inteligente', 'Relatórios Automáticos'];

  professionalFeatures = [
    {
      icon: 'description',
      title: 'Digitalização Completa',
      description: 'Prontuários, anamneses e laudos 100% digitais. Acesse de qualquer lugar, a qualquer momento.',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600'
    },
    {
      icon: 'event',
      title: 'Agenda Inteligente',
      description: 'Gerencie sessões, compromissos e lembretes automáticos em uma única interface visual.',
      bgClass: 'bg-teal-100 dark:bg-teal-900/30',
      iconClass: 'text-teal-600'
    },
    {
      icon: 'bar_chart',
      title: 'Relatórios em Segundos',
      description: 'Gere relatórios de evolução, financeiros e estatísticos com um único clique.',
      bgClass: 'bg-sky-100 dark:bg-sky-900/30',
      iconClass: 'text-sky-600'
    }
  ];

  parentFeatures = [
    {
      icon: 'show_chart',
      title: 'Acompanhamento Real',
      description: 'Veja a evolução do seu filho com gráficos claros e relatórios compartilhados pelo profissional.',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      iconClass: 'text-orange-600'
    },
    {
      icon: 'menu_book',
      title: 'Biblioteca de Apoio',
      description: 'Acesse materiais, artigos e atividades recomendadas para estimular o desenvolvimento em casa.',
      bgClass: 'bg-teal-100 dark:bg-teal-900/30',
      iconClass: 'text-teal-600'
    },
    {
      icon: 'chat',
      title: 'Canal Direto',
      description: 'Converse diretamente com o profissional responsável pelo atendimento do seu filho.',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600'
    }
  ];

  testimonials = [
    {
      name: 'Dra. Marcia Oliveira',
      role: 'Psicopedagoga Clínica',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcia',
      quote: 'O EduPsych Pro transformou minha prática clínica. Economizo horas por semana em documentação e consigo focar no que realmente importa: meus pacientes.'
    },
    {
      name: 'Ricardo Santos',
      role: 'Pai do Lucas',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo',
      quote: 'Finalmente consigo acompanhar de perto a evolução do meu filho. Os relatórios são claros e o canal de comunicação com a terapeuta é excelente.'
    },
    {
      name: 'Ana Carolina',
      role: 'Especialista em ABA',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      quote: 'A plataforma é intuitiva e completa. Recomendo para todos os profissionais que trabalham com intervenção comportamental.'
    }
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }
}

