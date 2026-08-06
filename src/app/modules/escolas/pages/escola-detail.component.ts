import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EscolasService } from '../services/escolas.service';

@Component({
  selector: 'app-escola-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/app/escolas" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <span class="material-icons text-gray-600 dark:text-slate-400">arrow_back</span>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ item()?.name }}</h1>
            <div class="flex flex-wrap gap-2 mt-1">
              @for (level of getLevels(); track level) {
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {{ getLevelLabel(level) }}
                </span>
              }
              @if (getLevels().length === 0) {
                <span class="text-sm text-gray-400">Sem nível definido</span>
              }
            </div>
          </div>
        </div>
        <a [routerLink]="['/app/escolas', id, 'editar']" 
          class="px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold flex items-center gap-2 transition-all">
          <span class="material-icons text-[18px]">edit</span>
          Editar
        </a>
      </div>

      @if (item()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-slate-400">Status</p>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                    [class]="item()?.status === 'Ativa' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                    {{ item()?.status }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-slate-400">Pacientes</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ item()?.patients?.length || item()?.patientCount || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-slate-400">Telefone</p>
                  <div class="flex items-center gap-2">
                    <p class="text-gray-900 dark:text-white">{{ item()?.phone || '—' }}</p>
                    @if (item()?.phoneIsWhatsApp) {
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-green-600">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    }
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-slate-400">Email</p>
                  <p class="text-gray-900 dark:text-white">{{ item()?.contactEmail || '—' }}</p>
                </div>
              </div>
            </div>

            @if (item()?.notes) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observações</h3>
                <p class="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{{ item()?.notes }}</p>
              </div>
            }
          </div>

          <!-- Address Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-icons text-primary">location_on</span>
                Endereço
              </h3>
              
              @if (item()?.street) {
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="material-icons text-gray-400 text-[18px] mt-0.5">home</span>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ item()?.street }}{{ item()?.number ? ', ' + item()?.number : '' }}
                      </p>
                      @if (item()?.complement) {
                        <p class="text-sm text-gray-500 dark:text-slate-400">{{ item()?.complement }}</p>
                      }
                    </div>
                  </div>

                  @if (item()?.neighborhood) {
                    <div class="flex items-start gap-3">
                      <span class="material-icons text-gray-400 text-[18px] mt-0.5">map</span>
                      <p class="text-sm text-gray-700 dark:text-slate-300">{{ item()?.neighborhood }}</p>
                    </div>
                  }

                  @if (item()?.city || item()?.state) {
                    <div class="flex items-start gap-3">
                      <span class="material-icons text-gray-400 text-[18px] mt-0.5">location_city</span>
                      <p class="text-sm text-gray-700 dark:text-slate-300">
                        {{ item()?.city }}{{ item()?.city && item()?.state ? ' - ' : '' }}{{ item()?.state }}
                      </p>
                    </div>
                  }

                  @if (item()?.cep) {
                    <div class="flex items-start gap-3">
                      <span class="material-icons text-gray-400 text-[18px] mt-0.5">markunread_mailbox</span>
                      <p class="text-sm text-gray-700 dark:text-slate-300">CEP: {{ item()?.cep }}</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-6">
                  <span class="material-icons text-4xl text-gray-300 dark:text-slate-600">location_off</span>
                  <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">Endereço não informado</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EscolaDetailComponent implements OnInit {
  private service = inject(EscolasService);
  private route = inject(ActivatedRoute);

  private levelMap: Record<string, string> = {
    'EDUCACAO_INFANTIL': 'Educação Infantil',
    'ANOS_INICIAIS': 'Anos Iniciais',
    'ANOS_FINAIS': 'Anos Finais',
    'ENSINO_MEDIO': 'Ensino Médio',
    'SUPERIOR': 'Superior',
    'PROFISSIONALIZANTE': 'Profissionalizante',
  };

  id = '';
  item = signal<any>(null);

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.service.get(this.id).subscribe((res: any) => this.item.set(res));
  }

  getLevels(): string[] {
    const item = this.item();
    if (!item?.levels) return [];
    try {
      return JSON.parse(item.levels);
    } catch {
      return item.levels ? [item.levels] : [];
    }
  }

  getLevelLabel(level: string): string {
    return this.levelMap[level] || level;
  }
}
