import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-documentos-clinicos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Documentos Clínicos</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Acesse e gerencie os documentos clínicos dos pacientes</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (doc of documents; track doc.id) {
          <a [routerLink]="doc.route"
             class="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:shadow-xl hover:ring-primary/30 transition-all duration-300 hover:-translate-y-1">
            <div class="p-8">
              <div class="size-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                [style.background]="doc.bgColor">
                <span class="material-icons text-3xl" [style.color]="doc.iconColor">{{ doc.icon }}</span>
              </div>
              <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">{{ doc.title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ doc.description }}</p>
            </div>
            <div class="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ doc.category }}</span>
              <span class="material-icons text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class DocumentosClinicosListComponent {
  documents = [
    {
      id: 'diario',
      title: 'Diário de Sessões',
      description: 'Registro detalhado de cada sessão de acompanhamento com objetivo, instrumentos e observações.',
      icon: 'edit_note',
      iconColor: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      category: 'Registro',
      route: '/app/documentos-clinicos/diario'
    },
    {
      id: 'frequencia',
      title: 'Frequência',
      description: 'Controle de presença e frequência dos pacientes nas sessões agendadas.',
      icon: 'fact_check',
      iconColor: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      category: 'Controle',
      route: '/app/documentos-clinicos/frequencia'
    },
    {
      id: 'plano',
      title: 'Plano de Intervenção',
      description: 'Planejamento detalhado das intervenções terapêuticas com metas e estratégias.',
      icon: 'assignment',
      iconColor: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      category: 'Planejamento',
      route: '/app/documentos-clinicos/plano'
    },
  ];
}
