import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WhatsAppService,
  WhatsAppConfig,
  WhatsAppLog,
  WhatsAppConversation,
  WhatsAppMessage,
} from '../services/whatsapp.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Cabeçalho Principal -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="size-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <span class="material-icons text-2xl">chat</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              WhatsApp & Atendimento Online
              @if (config.aiEnabled) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  IA Ativa
                </span>
              }
            </h2>
            <p class="text-xs text-slate-500">Gestão de conversas em tempo real, recepção inteligente com IA e lembretes de sessões</p>
          </div>
        </div>

        <!-- Seletor de Abas -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button (click)="activeTab.set('atendimento')"
            [ngClass]="tabBtnClass('atendimento')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span class="material-icons text-sm">smart_toy</span>
            Atendimentos (IA)
          </button>
          <button (click)="activeTab.set('configuracao')"
            [ngClass]="tabBtnClass('configuracao')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span class="material-icons text-sm">tune</span>
            Configuração & IA
          </button>
          <button (click)="activeTab.set('historico')"
            [ngClass]="tabBtnClass('historico')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span class="material-icons text-sm">history</span>
            Lembretes
          </button>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- ABA 1: ATENDIMENTOS ONLINE COM IA & CHAT EM TEMPO REAL         -->
      <!-- ============================================================== -->
      @if (activeTab() === 'atendimento') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          <!-- Lista de Conversas (4 colunas) -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <!-- Barra de Busca e Filtros -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
              <div class="relative">
                <span class="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                <input [(ngModel)]="searchQuery" (input)="filterConversations()"
                  placeholder="Buscar por nome ou número..."
                  class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              </div>

              <div class="flex items-center gap-1.5">
                <button (click)="statusFilter.set('ALL'); loadConversations()"
                  [ngClass]="statusFilter() === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors">
                  Todas
                </button>
                <button (click)="statusFilter.set('ACTIVE'); loadConversations()"
                  [ngClass]="statusFilter() === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors">
                  🤖 IA Ativa
                </button>
                <button (click)="statusFilter.set('MUTED_BY_AGENT'); loadConversations()"
                  [ngClass]="statusFilter() === 'MUTED_BY_AGENT' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors">
                  ⏸️ Transbordo
                </button>
                <button (click)="loadConversations()" title="Atualizar lista"
                  class="ml-auto p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <span class="material-icons text-sm">refresh</span>
                </button>
              </div>
            </div>

            <!-- Lista Rolável -->
            <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
              @if (loadingConversations()) {
                <div class="p-8 text-center text-slate-400 text-xs">
                  <span class="material-icons animate-spin text-lg mb-1">sync</span>
                  <p>Carregando conversas...</p>
                </div>
              } @else if (conversations().length === 0) {
                <div class="p-8 text-center text-slate-400 text-xs">
                  <span class="material-icons text-3xl mb-1 text-slate-300 dark:text-slate-600">chat_bubble_outline</span>
                  <p class="font-medium text-slate-600 dark:text-slate-400">Nenhuma conversa registrada ainda</p>
                  <p class="mt-1 text-[11px]">Quando pais ou responsáveis enviarem mensagens pelo WhatsApp, elas surgirão aqui.</p>
                </div>
              } @else {
                @for (conv of filteredConversations(); track conv.id) {
                  <div (click)="selectConversation(conv)"
                    [ngClass]="selectedConv()?.id === conv.id ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'"
                    class="p-3.5 cursor-pointer transition-colors flex items-start gap-3">
                    <div class="size-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs"
                      [ngClass]="avatarColorClass(conv.status)">
                      {{ (conv.contactName || conv.paciente?.name || conv.phone || '?').slice(0, 2).toUpperCase() }}
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {{ conv.contactName || conv.paciente?.name || conv.phone }}
                        </h4>
                        <span class="text-[10px] text-slate-400">
                          {{ conv.lastMessageAt | date:'HH:mm' }}
                        </span>
                      </div>

                      <div class="flex items-center gap-1.5 mb-1">
                        <span class="text-[10px] text-slate-500 font-mono">{{ conv.phone }}</span>
                        @if (conv.paciente) {
                          <span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {{ conv.paciente.name }}
                          </span>
                        }
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {{ conv.messages?.[0]?.message || 'Conversa iniciada' }}
                        </span>

                        <!-- Badge de Status -->
                        @if (conv.status === 'ACTIVE') {
                          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            IA Ativa
                          </span>
                        } @else if (conv.status === 'MUTED_BY_AGENT') {
                          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            Pede Atendente
                          </span>
                        } @else {
                          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Humano
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Chat Selecionado / Mensagens (7 colunas) -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            @if (selectedConv()) {
              <!-- Topo do Chat -->
              <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                    {{ (selectedConv()?.contactName || selectedConv()?.phone || '?').slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {{ selectedConv()?.contactName || selectedConv()?.paciente?.name || selectedConv()?.phone }}
                      @if (selectedConv()?.status === 'ACTIVE') {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          🤖 Respostas por IA
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          ⏸️ IA Pausada
                        </span>
                      }
                    </h3>
                    <p class="text-xs text-slate-500 flex items-center gap-2">
                      <span>{{ selectedConv()?.phone }}</span>
                      @if (selectedConv()?.paciente) {
                        <span>• Paciente: <strong>{{ selectedConv()?.paciente?.name }}</strong></span>
                      }
                    </p>
                  </div>
                </div>

                <!-- Botões de Ação da Secretária -->
                <div class="flex items-center gap-2">
                  <button (click)="toggleMuteSelected()"
                    [ngClass]="selectedConv()?.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                    class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <span class="material-icons text-sm">
                      {{ selectedConv()?.status === 'ACTIVE' ? 'pause_circle' : 'play_circle' }}
                    </span>
                    {{ selectedConv()?.status === 'ACTIVE' ? 'Pausar IA' : 'Reativar IA' }}
                  </button>
                </div>
              </div>

              <!-- Área de Mensagens (Rolável) -->
              <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-900/40">
                @if (loadingMessages()) {
                  <div class="py-12 text-center text-slate-400 text-xs">
                    <span class="material-icons animate-spin text-xl">sync</span>
                    <p class="mt-1">Carregando mensagens...</p>
                  </div>
                } @else if (currentMessages().length === 0) {
                  <div class="py-12 text-center text-slate-400 text-xs">
                    <p>Nenhuma mensagem trocada ainda.</p>
                  </div>
                } @else {
                  @for (msg of currentMessages(); track msg.id) {
                    <div class="flex flex-col"
                      [class.items-end]="msg.sender !== 'USER'"
                      [class.items-start]="msg.sender === 'USER'">
                      <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm"
                        [ngClass]="msgBubbleClass(msg.sender)">
                        <div class="flex items-center gap-1.5 mb-1 opacity-80 text-[10px] font-bold">
                          @if (msg.sender === 'USER') {
                            <span class="material-icons text-[12px]">person</span>
                            <span>Cliente / Família</span>
                          } @else if (msg.sender === 'AI') {
                            <span class="material-icons text-[12px]">smart_toy</span>
                            <span>Assistente IA</span>
                          } @else {
                            <span class="material-icons text-[12px]">support_agent</span>
                            <span>Secretária (Você)</span>
                          }
                          <span class="ml-auto opacity-70">{{ msg.createdAt | date:'HH:mm' }}</span>
                        </div>
                        <p class="whitespace-pre-wrap leading-relaxed">{{ msg.message }}</p>
                      </div>
                    </div>
                  }
                }
              </div>

              <!-- Barra Inferior de Envio Manual -->
              <div class="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div class="flex items-center gap-2">
                  <input [(ngModel)]="replyInput" (keyup.enter)="sendManualReply()"
                    placeholder="Escreva uma resposta manual pelo WhatsApp..."
                    class="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <button (click)="sendManualReply()" [disabled]="!replyInput.trim() || sendingReply()"
                    class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    @if (sendingReply()) {
                      <span class="material-icons text-sm animate-spin">sync</span>
                    } @else {
                      <span class="material-icons text-sm">send</span>
                    }
                    Enviar
                  </button>
                </div>
                <p class="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span class="material-icons text-[12px]">info</span>
                  Ao enviar uma mensagem manual, a IA será pausada automaticamente por 4h para este contato.
                </p>
              </div>
            } @else {
              <!-- Estado Vazio -->
              <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div class="size-16 rounded-3xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                  <span class="material-icons text-3xl">forum</span>
                </div>
                <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma conversa selecionada</h4>
                <p class="text-xs text-slate-500 max-w-sm mt-1">
                  Selecione uma conversa na coluna à esquerda para visualizar o histórico de mensagens trocadas e interagir com o paciente.
                </p>
              </div>
            }
          </div>
        </div>
      }

      <!-- ============================================================== -->
      <!-- ABA 2: CONFIGURAÇÃO DO GATEWAY & INTELIGÊNCIA ARTIFICIAL      -->
      <!-- ============================================================== -->
      @if (activeTab() === 'configuracao') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Gateway WhatsApp Evolution API (6 colunas) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-700">
                <span class="material-icons text-emerald-600 text-xl">phonelink_ring</span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">Gateway Evolution API</h3>
                  <p class="text-xs text-slate-500">Conexão com a instância do WhatsApp para envio e recebimento</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL da API (Evolution API)</label>
                <input [(ngModel)]="config.apiUrl"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="https://evoapi.suaclinica.com.br">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Token de Autenticação (apikey)</label>
                <input [(ngModel)]="config.token" type="password"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Seu token de autenticação da Evolution API">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Instância (Phone Number ID)</label>
                <input [(ngModel)]="config.phoneNumberId"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ex: clinica-principal">
              </div>

              <!-- Webhook URL Box -->
              <div class="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-1.5">
                <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span class="material-icons text-xs text-emerald-600">webhook</span>
                  URL do Webhook (Cole na sua Evolution API):
                </span>
                <div class="flex items-center gap-2">
                  <input readonly [value]="webhookUrl"
                    class="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <button (click)="copyWebhookUrl()"
                    class="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                    <span class="material-icons text-xs">{{ copied() ? 'check' : 'content_copy' }}</span>
                    {{ copied() ? 'Copiado!' : 'Copiar' }}
                  </button>
                </div>
                <p class="text-[10px] text-slate-500">Configure os eventos: <code>messages.upsert</code></p>
              </div>

              <!-- Teste de Envio -->
              <div class="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                <h4 class="font-semibold text-slate-900 dark:text-white text-xs">Teste de Conexão Rápido</h4>
                <div class="flex gap-2">
                  <input [(ngModel)]="testPhone" placeholder="DDD + Número (ex: 11999998888)"
                    class="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <button (click)="sendTest()" [disabled]="!testPhone"
                    class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors">
                    Testar
                  </button>
                </div>
                @if (testMessage()) {
                  <p class="text-xs" [class.text-emerald-600]="testSuccess()" [class.text-red-500]="!testSuccess()">
                    {{ testMessage() }}
                  </p>
                }
              </div>
            </div>
          </div>

          <!-- Configurações de IA (6 colunas) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-2.5">
                  <span class="material-icons text-emerald-600 text-xl">psychology</span>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">Motor de Atendimento com IA</h3>
                    <p class="text-xs text-slate-500">Google Gemini Flash integrado para acolhimento e triagem</p>
                  </div>
                </div>

                <!-- Switch Liga/Desliga IA -->
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="config.aiEnabled" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Horas de Pausa após Intervenção Humana (Hand-off)
                </label>
                <div class="flex items-center gap-3">
                  <input type="number" min="1" max="72" [(ngModel)]="config.autoMuteHours"
                    class="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs">
                  <span class="text-xs text-slate-500">horas (a IA não responderá enquanto a secretária estiver atendendo)</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chave Google Gemini (Opcional)
                </label>
                <input [(ngModel)]="config.geminiKey" type="password"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Deixe em branco para usar a chave global do sistema">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prompt Clínico Personalizado (Diretrizes da sua Clínica)
                </label>
                <textarea [(ngModel)]="config.aiPrompt" rows="6"
                  class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ex: Você é a secretária virtual acolhedora da Clínica EduPsych. Explique aos pais sobre avaliação psicopedagógica, acolha dúvidas sobre TEA/TDAH e ofereça agendamentos para terças e quintas..."></textarea>
                <p class="text-[10px] text-slate-400 mt-1">A IA usará estas diretrizes combinadas com dados de pacientes e horários da clínica.</p>
              </div>

              <div class="pt-2">
                <button (click)="saveAllConfig()" [disabled]="savingConfig()"
                  class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                  @if (savingConfig()) {
                    <span class="material-icons text-sm animate-spin">sync</span>
                  } @else {
                    <span class="material-icons text-sm">save</span>
                  }
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================== -->
      <!-- ABA 3: HISTÓRICO DE LEMBRETES DISPARADOS                      -->
      <!-- ============================================================== -->
      @if (activeTab() === 'historico') {
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Lembretes & Mensagens Enviadas</h3>
            <button (click)="loadHistory()"
              class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
              <span class="material-icons text-xs">refresh</span>
              Atualizar
            </button>
          </div>

          @if (loadingHistory()) {
            <div class="py-12 text-center text-slate-400 text-xs">
              <span class="material-icons animate-spin text-lg">sync</span>
              <p class="mt-1">Carregando histórico...</p>
            </div>
          } @else if (logs().length === 0) {
            <div class="py-12 text-center text-slate-400 text-xs">
              <p>Nenhum envio registrado até o momento.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-xs min-w-[600px]">
                <thead>
                  <tr class="text-left text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    <th class="pb-2 font-semibold">Paciente</th>
                    <th class="pb-2 font-semibold">Telefone</th>
                    <th class="pb-2 font-semibold">Mensagem</th>
                    <th class="pb-2 font-semibold">Status</th>
                    <th class="pb-2 font-semibold">Data/Hora</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                  @for (log of logs(); track log.id) {
                    <tr>
                      <td class="py-2.5 font-bold text-slate-900 dark:text-white">{{ log.paciente?.name || '-' }}</td>
                      <td class="py-2.5 font-mono text-slate-500">{{ log.phone }}</td>
                      <td class="py-2.5 text-slate-600 dark:text-slate-300 max-w-[280px] truncate">{{ log.message }}</td>
                      <td class="py-2.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [class.bg-emerald-100]="log.status === 'SENT'"
                          [class.text-emerald-700]="log.status === 'SENT'"
                          [class.bg-red-100]="log.status === 'FAILED'"
                          [class.text-red-700]="log.status === 'FAILED'">
                          {{ log.status === 'SENT' ? 'Enviado' : 'Falha' }}
                        </span>
                      </td>
                      <td class="py-2.5 text-slate-400">{{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class WhatsAppComponent implements OnInit {
  private whatsappService = inject(WhatsAppService);

  activeTab = signal<'atendimento' | 'configuracao' | 'historico'>('atendimento');

  // Configuração
  config: WhatsAppConfig = {
    apiUrl: '',
    token: '',
    phoneNumberId: '',
    aiEnabled: true,
    aiPrompt: '',
    geminiKey: '',
    autoMuteHours: 4,
  };
  savingConfig = signal(false);
  isConfigured = signal(false);

  // Teste
  testPhone = '';
  testMessage = signal('');
  testSuccess = signal(false);
  copied = signal(false);

  // Conversas Live
  conversations = signal<WhatsAppConversation[]>([]);
  filteredConversations = signal<WhatsAppConversation[]>([]);
  selectedConv = signal<WhatsAppConversation | null>(null);
  currentMessages = signal<WhatsAppMessage[]>([]);
  loadingConversations = signal(false);
  loadingMessages = signal(false);
  sendingReply = signal(false);
  replyInput = '';
  searchQuery = '';
  statusFilter = signal<'ALL' | 'ACTIVE' | 'MUTED_BY_AGENT' | 'MUTED_BY_HUMAN'>('ALL');

  // Histórico de disparos
  logs = signal<WhatsAppLog[]>([]);
  loadingHistory = signal(false);

  get webhookUrl(): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://suaclinica.com.br';
    const instance = this.config.phoneNumberId ? `/${this.config.phoneNumberId}` : '';
    return `${origin}/api/whatsapp/webhook${instance}`;
  }

  ngOnInit() {
    this.loadConfig();
    this.loadConversations();
    this.loadHistory();
  }

  tabBtnClass(tab: 'atendimento' | 'configuracao' | 'historico'): string {
    if (this.activeTab() === tab) {
      return 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm';
    }
    return 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white';
  }

  avatarColorClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'MUTED_BY_AGENT':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'MUTED_BY_HUMAN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  msgBubbleClass(sender: string): string {
    if (sender === 'USER') {
      return 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700';
    }
    if (sender === 'AI') {
      return 'bg-emerald-600 text-white';
    }
    return 'bg-blue-600 text-white';
  }

  loadConfig() {
    this.whatsappService.getConfig().subscribe({
      next: (res: any) => {
        this.isConfigured.set(res.configured);
        if (res.config) {
          this.config.apiUrl = res.config.apiUrl || '';
          this.config.phoneNumberId = res.config.phoneNumberId || '';
          this.config.aiEnabled = res.config.aiEnabled ?? false;
          this.config.aiPrompt = res.config.aiPrompt || '';
          this.config.autoMuteHours = res.config.autoMuteHours ?? 4;
        }
      },
    });
  }

  saveAllConfig() {
    this.savingConfig.set(true);
    this.whatsappService.saveConfig(this.config).subscribe({
      next: () => {
        this.savingConfig.set(false);
        this.isConfigured.set(true);
        this.testMessage.set('Configurações salvas com sucesso!');
        this.testSuccess.set(true);
      },
      error: (err: any) => {
        this.savingConfig.set(false);
        this.testMessage.set('Erro ao salvar configurações: ' + (err?.error?.message || 'Erro desconhecido'));
        this.testSuccess.set(false);
      },
    });
  }

  copyWebhookUrl() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.webhookUrl);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    }
  }

  sendTest() {
    if (!this.testPhone) return;
    this.testMessage.set('Enviando mensagem de teste...');
    this.testSuccess.set(false);

    this.whatsappService.sendTest(this.testPhone).subscribe({
      next: () => {
        this.testMessage.set('Mensagem de teste enviada com sucesso!');
        this.testSuccess.set(true);
      },
      error: (err: any) => {
        this.testMessage.set('Falha no envio: ' + (err?.error?.error || 'Verifique URL e Token'));
        this.testSuccess.set(false);
      },
    });
  }

  // Conversas
  loadConversations() {
    this.loadingConversations.set(true);
    const filter = this.statusFilter();
    const params: any = {};
    if (filter !== 'ALL') params.status = filter;

    this.whatsappService.getConversations(params).subscribe({
      next: (res) => {
        this.conversations.set(res.data || []);
        this.filterConversations();
        this.loadingConversations.set(false);

        // Se a conversa aberta ainda existe, atualiza-a
        if (this.selectedConv()) {
          const updated = res.data.find(c => c.id === this.selectedConv()!.id);
          if (updated) this.selectedConv.set(updated);
        }
      },
      error: () => this.loadingConversations.set(false),
    });
  }

  filterConversations() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredConversations.set(this.conversations());
      return;
    }
    this.filteredConversations.set(
      this.conversations().filter(
        c =>
          (c.contactName && c.contactName.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.paciente?.name && c.paciente.name.toLowerCase().includes(q))
      )
    );
  }

  selectConversation(conv: WhatsAppConversation) {
    this.selectedConv.set(conv);
    this.loadingMessages.set(true);
    this.whatsappService.getConversationMessages(conv.id).subscribe({
      next: (res) => {
        this.currentMessages.set(res.messages || []);
        this.loadingMessages.set(false);
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  toggleMuteSelected() {
    const conv = this.selectedConv();
    if (!conv) return;

    const willMute = conv.status === 'ACTIVE';
    this.whatsappService.toggleMute(conv.id, willMute, this.config.autoMuteHours || 4).subscribe({
      next: (res) => {
        this.selectedConv.set(res.conversation);
        this.loadConversations();
      },
    });
  }

  sendManualReply() {
    const conv = this.selectedConv();
    const text = this.replyInput.trim();
    if (!conv || !text || this.sendingReply()) return;

    this.sendingReply.set(true);
    this.whatsappService.sendMessage(conv.id, text).subscribe({
      next: (res) => {
        this.currentMessages.update(msgs => [...msgs, res.message]);
        this.replyInput = '';
        this.sendingReply.set(false);
        this.loadConversations();
      },
      error: () => this.sendingReply.set(false),
    });
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.whatsappService.getHistory().subscribe({
      next: (res) => {
        this.logs.set(res.data || []);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }
}
