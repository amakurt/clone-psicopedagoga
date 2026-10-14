import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResponsaveisService } from '../services/responsaveis.service';

@Component({
  selector: 'app-responsavel-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 animate-in">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/app/responsaveis" class="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all text-slate-600 dark:text-slate-300">
            <span class="material-icons text-xl">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-slate-900 dark:text-white">{{ item()?.name || 'Responsável' }}</h1>
              @if (item()?.relationship) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {{ item()?.relationship }}
                </span>
              }
              @if (item()?.userId) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span class="material-icons text-[14px]">verified</span> Portal Ativo
                </span>
              }
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Perfil detalhado e informações de contato do responsável</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a [routerLink]="['/app/responsaveis', id, 'editar']" 
            class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
            <span class="material-icons text-lg">edit</span>
            <span>Editar Dados</span>
          </a>
        </div>
      </div>

      @if (item()) {
        <!-- Perfil Card Header -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div class="size-24 rounded-full overflow-hidden bg-primary/10 text-primary border-4 border-slate-100 dark:border-slate-800 shadow-inner flex items-center justify-center shrink-0">
            @if (item()?.avatarUrl) {
              <img [src]="item()?.avatarUrl" [alt]="item()?.name" class="size-full object-cover">
            } @else {
              <span class="text-3xl font-black">{{ getInitials(item()?.name) }}</span>
            }
          </div>
          <div class="flex-1 text-center sm:text-left space-y-1">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ item()?.name }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>Parentesco: <strong class="text-slate-700 dark:text-slate-300">{{ item()?.relationship || 'Não informado' }}</strong></span>
              @if (item()?.birthDate) {
                <span>• Nasc.: <strong class="text-slate-700 dark:text-slate-300">{{ item()?.birthDate }}</strong></span>
              }
            </p>
          </div>
        </div>

        <!-- Informações Pessoais & Contatos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Card Dados Pessoais & Documentos -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="material-icons text-primary text-xl">badge</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documentos & Identificação</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">CPF</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.cpf || '—' }}</p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">RG</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.rg || '—' }}</p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data de Nascimento</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.birthDate || '—' }}</p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Parentesco / Vínculo</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.relationship || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Card Contatos & Portal -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="material-icons text-primary text-xl">contact_phone</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contatos & Portal</h3>
            </div>
            
            <div class="space-y-3">
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Telefone</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-2">
                  <span>{{ item()?.phones || item()?.phone || '—' }}</span>
                  @if (item()?.phoneIsWhatsApp) {
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">WhatsApp</span>
                  }
                </p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">E-mail</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.email || '—' }}</p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Acesso ao Portal da Família</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  @if (item()?.userId) {
                    <span class="material-icons text-emerald-500 text-base">check_circle</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold">Habilitado (Login via e-mail)</span>
                  } @else {
                    <span class="material-icons text-slate-400 text-base">radio_button_unchecked</span>
                    <span class="text-slate-500">Não configurado (edite para habilitar)</span>
                  }
                </p>
              </div>
            </div>
          </div>

          <!-- Card Endereço -->
          <div class="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="material-icons text-primary text-xl">home</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Endereço Residencial</h3>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Logradouro</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {{ item()?.street || '—' }}{{ item()?.number ? ', ' + item()?.number : '' }}{{ item()?.complement ? ' (' + item()?.complement + ')' : '' }}
                </p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bairro</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.neighborhood || '—' }}</p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cidade / UF</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {{ item()?.city || '—' }}{{ item()?.state ? ' / ' + item()?.state : '' }}
                </p>
              </div>
              <div>
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">CEP</span>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ item()?.cep || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Card Pacientes Vinculados (Filhos / Crianças) -->
          <div class="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="material-icons text-primary text-xl">child_care</span>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pacientes Vinculados (Filhos / Assistidos)</h3>
              </div>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ item()?.patients?.length || 0 }} vinculado(s)
              </span>
            </div>

            @if (item()?.patients && item()?.patients.length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (p of item()?.patients; track p.id) {
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {{ getInitials(p.name) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ p.name }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ p.grade || 'Série não informada' }} • {{ p.phone || 'Sem telefone' }}</p>
                      </div>
                    </div>
                    <a [routerLink]="['/app/pacientes', p.id]" 
                      class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1 shrink-0">
                      <span>Ver Prontuário</span>
                      <span class="material-icons text-sm">arrow_forward</span>
                    </a>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <span class="material-icons text-4xl text-slate-300 dark:text-slate-600">person_off</span>
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">Nenhum paciente vinculado a este responsável</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Edite o responsável para vincular as crianças atendidas na clínica.</p>
              </div>
            }
          </div>

        </div>
      }
    </div>
  `
})
export class ResponsavelDetailComponent implements OnInit {
  private service = inject(ResponsaveisService);
  private route = inject(ActivatedRoute);

  id = '';
  item = signal<any>(null);

  getInitials(name?: string): string {
    if (!name) return 'R';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => this.item.set(res));
  }
}
