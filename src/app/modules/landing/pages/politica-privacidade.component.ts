import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-privacidade',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-700">
        
        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-slate-700 pb-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full mb-3">
              <span class="material-icons text-emerald-600 text-sm">lock</span>
              <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">LGPD & Segurança</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Política de Privacidade</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Conformidade estrita com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
          </div>
          <a routerLink="/" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shrink-0">
            <span class="material-icons text-sm">arrow_back</span>
            <span>Voltar ao Início</span>
          </a>
        </div>

        <!-- Conteúdo -->
        <div class="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          
          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">1. Compromisso com a Privacidade</h2>
            <p>
              A presente Política de Privacidade regula como a plataforma <strong>EduPsych Pro</strong> coleta, armazena, processa e protege os dados pessoais de psicopedagogos, terapeutas, pacientes e seus respectivos responsáveis legais.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">2. Tratamento de Dados Sensíveis de Saúde</h2>
            <p>
              Prontuários, diagnósticos, laudos e notas de evolução comportamental de crianças e adolescentes constituem dados de saúde altamente sensíveis (Art. 5º, II da LGPD). Todas essas informações são criptografadas em trânsito (TLS 1.3 / HTTPS) e isoladas com arquitetura multi-tenant, garantindo que nenhuma clínica tenha acesso aos registros de outra.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">3. Uso de Inteligência Artificial Responsável</h2>
            <p>
              Nenhum dado pessoal identificável de pacientes (como CPF, nome completo ou endereço) é utilizado para treinar modelos públicos de Inteligência Artificial. As requisições de auxílio na redação de laudos operam sob padrões rígidos de anonimização e isolamento de sessão.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">4. Direitos dos Titulares de Dados</h2>
            <p>
              Em conformidade com o Art. 18 da LGPD, os titulares de dados ou seus responsáveis legais podem, a qualquer momento, solicitar a confirmação da existência de tratamento, o acesso aos seus dados, a correção de dados incompletos ou a exclusão de seus prontuários diretamente junto ao profissional responsável pelo atendimento.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">5. Segurança da Informação e Monitoramento Anti-Ataque</h2>
            <p>
              Utilizamos firewalls avançados, proteção de cabeçalhos de rede, controle de taxa de requisições (rate limiting) e backups criptografados automáticos. Tentativas de exploração não autorizada, varredura de portas ou scraping automatizado são imediatamente bloqueadas e registradas para auditoria de segurança.
            </p>
          </section>

        </div>

        <!-- Footer -->
        <div class="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 EduPsych Pro. Todos os direitos reservados.</p>
          <div class="flex gap-4">
            <a routerLink="/termos" class="hover:text-primary transition-colors underline">Termos de Uso</a>
            <a routerLink="/" class="hover:text-primary transition-colors underline">Página Inicial</a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PoliticaPrivacidadeComponent {}
