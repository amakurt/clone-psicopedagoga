import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
            <a href="#features" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#testimonials" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Depoimentos</a>
            <a href="#professionals" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Para Profissionais</a>
            <a href="#parents" class="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">Para Pais</a>
          </div>

          <div class="hidden md:flex items-center gap-3">
            <a routerLink="/login" class="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-primary transition-colors">Entrar</a>
            <a routerLink="/login" [queryParams]="{mode: 'register'}" class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25">Começar Agora</a>
          </div>

          <button (click)="mobileMenu.set(!mobileMenu())" class="md:hidden p-2 text-gray-600 dark:text-slate-300">
            <span class="material-icons">{{ mobileMenu() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      @if (mobileMenu()) {
        <div class="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-4 space-y-3">
          <a href="#features" (click)="mobileMenu.set(false)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Funcionalidades</a>
          <a href="#testimonials" (click)="mobileMenu.set(false)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Depoimentos</a>
          <a href="#professionals" (click)="mobileMenu.set(false)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Para Profissionais</a>
          <a href="#parents" (click)="mobileMenu.set(false)" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Para Pais</a>
          <hr class="border-gray-200 dark:border-slate-700">
          <a routerLink="/login" class="block py-2 text-sm font-semibold text-gray-600 dark:text-slate-300">Entrar</a>
          <a routerLink="/login" [queryParams]="{mode: 'register'}" class="block py-3 bg-primary text-white rounded-xl text-sm font-bold text-center">Começar Agora</a>
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
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 10 198 4" stroke="#007F80" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </span>
              e
              <span class="text-primary">Afeto.</span>
            </h1>

            <p class="mt-6 text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              A plataforma completa para psicopedagogos, terapeutas e pais acompanharem o desenvolvimento de crianças com TEA e necessidades especiais.
            </p>

            <div class="mt-8 flex flex-wrap gap-4">
              <a routerLink="/login" [queryParams]="{mode: 'register'}" class="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
                Começar Agora Grátis
                <span class="material-icons">arrow_forward</span>
              </a>
              <a href="#features" class="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl font-bold text-base transition-all border border-gray-200 dark:border-slate-700">
                Ver Funcionalidades
              </a>
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
    <section id="features" id="professionals" class="py-20 bg-white dark:bg-slate-900">
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
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" [class]="feature.bgClass">
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
                  <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-purple-500 text-sm">trending_up</span>
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
                  <span class="material-icons text-green-500 text-sm">verified</span>
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
            <span class="material-icons text-orange-500 text-sm">family_restroom</span>
            <span class="text-sm font-semibold text-orange-500">Para os Pais</span>
          </span>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Acompanhe cada passo do desenvolvimento</h2>
          <p class="mt-4 text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Transparência e conexão direta com o profissional que cuida do seu filho.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (feature of parentFeatures; track feature.title) {
            <div class="group p-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" [class]="feature.bgClass">
                <span class="material-icons text-2xl" [class]="feature.iconClass">{{ feature.icon }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600 dark:text-slate-400 leading-relaxed">{{ feature.description }}</p>
            </div>
          }
        </div>
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
        <div class="mt-16 bg-gradient-to-r from-primary to-teal-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 class="text-2xl md:text-3xl font-black mb-4">Pronto para transformar sua clínica?</h3>
          <p class="text-white/80 mb-8 max-w-xl mx-auto">Comece a usar o EduPsych Pro hoje mesmo e leve seu atendimento para o próximo nível.</p>
          <a routerLink="/login" [queryParams]="{mode: 'register'}" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg">
            Começar Agora
            <span class="material-icons">arrow_forward</span>
          </a>
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
              <a href="#" class="w-10 h-10 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <span class="material-icons text-lg">photo_camera</span>
              </a>
              <a href="#" class="w-10 h-10 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <span class="material-icons text-lg">business</span>
              </a>
              <a href="#" class="w-10 h-10 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <span class="material-icons text-lg">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 class="font-bold mb-4">Plataforma</h4>
            <ul class="space-y-3">
              <li><a href="#features" class="text-gray-400 hover:text-white transition-colors text-sm">Funcionalidades</a></li>
              <li><a href="#testimonials" class="text-gray-400 hover:text-white transition-colors text-sm">Depoimentos</a></li>
              <li><a routerLink="/login" [queryParams]="{mode: 'register'}" class="text-gray-400 hover:text-white transition-colors text-sm">Criar Conta</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-4">Suporte</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Central de Ajuda</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Privacidade</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        <hr class="border-gray-800 my-12">

        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-500 text-sm">2024 EduPsych Pro. Todos os direitos reservados.</p>
          <p class="text-gray-500 text-sm flex items-center gap-1">
            Feito com <span class="material-icons text-red-500 text-sm">favorite</span> para quem cuida de crianças especiais
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
    html { scroll-behavior: smooth; }
  `]
})
export class LandingPageComponent {
  scrolled = signal(false);
  mobileMenu = signal(false);

  heroPills = ['Prontuários Online', 'Agenda Inteligente', 'Relatórios Automáticos'];

  professionalFeatures = [
    {
      icon: 'description',
      title: 'Digitalização Completa',
      description: 'Prontuários, anamneses e laudos 100% digitais. Acesse de qualquer lugar, a qualquer momento.',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-500'
    },
    {
      icon: 'event',
      title: 'Agenda Inteligente',
      description: 'Gerencie sessões, compromissos e lembretes automáticos em uma única interface visual.',
      bgClass: 'bg-teal-100 dark:bg-teal-900/30',
      iconClass: 'text-teal-500'
    },
    {
      icon: 'bar_chart',
      title: 'Relatórios em Segundos',
      description: 'Gere relatórios de evolução, financeiros e estatísticos com um único clique.',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      iconClass: 'text-purple-500'
    }
  ];

  parentFeatures = [
    {
      icon: 'monitoring',
      title: 'Acompanhamento Real',
      description: 'Veja a evolução do seu filho com gráficos claros e relatórios compartilhados pelo profissional.',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      iconClass: 'text-orange-500'
    },
    {
      icon: 'menu_book',
      title: 'Biblioteca de Apoio',
      description: 'Acesse materiais, artigos e atividades recomendadas para estimular o desenvolvimento em casa.',
      bgClass: 'bg-teal-100 dark:bg-teal-900/30',
      iconClass: 'text-teal-500'
    },
    {
      icon: 'chat',
      title: 'Canal Direto',
      description: 'Converse diretamente com o profissional responsável pelo atendimento do seu filho.',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-500'
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
