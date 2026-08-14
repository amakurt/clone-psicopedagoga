import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Permissões do Usuário</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ userName() }}</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/app/users" class="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">arrow_back</span>
            <span>Voltar</span>
          </a>
          <button (click)="savePermissions()" class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-2 rounded-xl font-bold text-sm transition-all">
            <span class="material-icons text-[18px]">save</span>
            <span>Salvar</span>
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Templates de Papel</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          @for (template of roleTemplates; track template.name) {
            <button (click)="applyTemplate(template)" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left hover:bg-primary/10 hover:border-primary border-2 border-transparent transition-all">
              <span class="material-icons text-2xl text-primary mb-2">{{ template.icon }}</span>
              <p class="font-bold text-sm text-slate-900 dark:text-white">{{ template.name }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ template.description }}</p>
            </button>
          }
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Matriz de Permissões</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Leitura</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Escrita</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Exclusão</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (module of modules; track module.key) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="material-icons text-slate-500">{{ module.icon }}</span>
                      <span class="text-sm font-bold text-slate-900 dark:text-white">{{ module.label }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [checked]="hasPermission(module.key, 'read')" (change)="togglePermission(module.key, 'read', $event)" class="sr-only peer">
                      <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [checked]="hasPermission(module.key, 'write')" (change)="togglePermission(module.key, 'write', $event)" class="sr-only peer">
                      <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [checked]="hasPermission(module.key, 'delete')" (change)="togglePermission(module.key, 'delete', $event)" class="sr-only peer">
                      <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Atribuição em Lote</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Selecionar Módulos</label>
            <div class="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              @for (module of modules; track module.key) {
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [checked]="bulkModules().includes(module.key)" (change)="toggleBulkModule(module.key)" class="w-4 h-4 text-primary rounded">
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ module.label }}</span>
                </label>
              }
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Permissão</label>
            <select [(ngModel)]="bulkPermission" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="read">Leitura</option>
              <option value="write">Escrita</option>
              <option value="delete">Exclusão</option>
            </select>
            <button (click)="applyBulkPermission()" [disabled]="bulkModules().length === 0" class="mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-on-primary px-4 py-2 rounded-xl font-bold text-sm transition-all">
              <span class="material-icons text-[18px]">done_all</span>
              <span>Aplicar Seleção</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showToast()) {
      <div class="fixed bottom-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 animate-in shadow-lg bg-emerald-500 text-white">
        <span class="material-icons">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class UserPermissionsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  userId = '';
  userName = signal('');
  permissions = signal<Record<string, string[]>>({});
  bulkModules = signal<string[]>([]);
  bulkPermission = 'read';

  showToast = signal(false);
  toastMessage = signal('');

  modules = [
    { key: 'pacientes', label: 'Pacientes', icon: 'people' },
    { key: 'evolucoes', label: 'Evoluções', icon: 'show_chart' },
    { key: 'sessoes', label: 'Sessões', icon: 'event' },
    { key: 'anamnese', label: 'Anamnese', icon: 'description' },
    { key: 'laudos', label: 'Laudos', icon: 'assignment' },
    { key: 'encaminhamentos', label: 'Encaminhamentos', icon: 'forward' },
    { key: 'documentos', label: 'Documentos', icon: 'folder' },
    { key: 'financeiro', label: 'Financeiro', icon: 'account_balance_wallet' },
    { key: 'agenda', label: 'Agenda', icon: 'calendar_month' },
    { key: 'comunicacao', label: 'Comunicação', icon: 'chat' },
    { key: 'responsaveis', label: 'Responsáveis', icon: 'person_add' },
    { key: 'escolas', label: 'Escolas', icon: 'school' },
    { key: 'protocolos', label: 'Protocolos', icon: 'fact_check' },
    { key: 'planos', label: 'Planos', icon: 'description' },
    { key: 'configuracoes', label: 'Configurações', icon: 'settings' },
    { key: 'users', label: 'Usuários', icon: 'manage_accounts' },
    { key: 'lgpd', label: 'LGPD', icon: 'gpp_good' }
  ];

  roleTemplates = [
    { name: 'Gestor', icon: 'admin_panel_settings', description: 'Acesso total', permissions: { all: ['read', 'write', 'delete'] } },
    { name: 'Psicopedagogo', icon: 'psychology', description: 'Acesso clínico', permissions: { pacientes: ['read', 'write'], evolucoes: ['read', 'write'], sessoes: ['read', 'write'], anamnese: ['read', 'write'], laudos: ['read', 'write'] } },
    { name: 'Secretaria', icon: 'headset_mic', description: 'Acesso administrativo', permissions: { pacientes: ['read'], agenda: ['read', 'write'], financeiro: ['read', 'write'], comunicacao: ['read', 'write'] } },
    { name: 'Estagiário', icon: 'school', description: 'Acesso limitado', permissions: { pacientes: ['read'], evolucoes: ['read'], sessoes: ['read'] } }
  ];

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
      this.loadPermissions();
    }
  }

  loadUser() {
    this.api.get(`/users/${this.userId}`).subscribe({
      next: (user: any) => this.userName.set(user.name || '')
    });
  }

  loadPermissions() {
    this.api.get(`/permissions/${this.userId}`).subscribe({
      next: (res: any) => this.permissions.set(res.permissions || {}),
      error: () => this.permissions.set({})
    });
  }

  hasPermission(module: string, action: string): boolean {
    return this.permissions()[module]?.includes(action) || false;
  }

  togglePermission(module: string, action: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.permissions()[module] || [];

    if (checked) {
      if (!current.includes(action)) {
        this.permissions.update(p => ({ ...p, [module]: [...current, action] }));
      }
    } else {
      this.permissions.update(p => ({ ...p, [module]: current.filter(a => a !== action) }));
    }
  }

  applyTemplate(template: any) {
    if (template.permissions.all) {
      const allPerms: Record<string, string[]> = {};
      this.modules.forEach(m => { allPerms[m.key] = [...template.permissions.all]; });
      this.permissions.set(allPerms);
    } else {
      this.permissions.set({ ...template.permissions });
    }
    this.showNotification(`Template "${template.name}" aplicado!`);
  }

  toggleBulkModule(module: string) {
    this.bulkModules.update(mods =>
      mods.includes(module) ? mods.filter(m => m !== module) : [...mods, module]
    );
  }

  applyBulkPermission() {
    const perms = { ...this.permissions() };
    this.bulkModules().forEach(module => {
      const current = perms[module] || [];
      if (!current.includes(this.bulkPermission)) {
        perms[module] = [...current, this.bulkPermission];
      }
    });
    this.permissions.set(perms);
    this.showNotification('Permissões aplicadas em lote!');
  }

  savePermissions() {
    this.api.put(`/permissions/${this.userId}`, { permissions: this.permissions() }).subscribe({
      next: () => this.showNotification('Permissões salvas com sucesso!'),
      error: () => this.showNotification('Erro ao salvar permissões')
    });
  }

  showNotification(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
