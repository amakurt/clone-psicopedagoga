import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-termos-de-uso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-700">
        
        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-slate-700 pb-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <span class="material-icons text-primary text-sm">gavel</span>
              <span class="text-xs font-bold text-primary uppercase tracking-wider">Documento Jurídico</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Termos de Uso e Serviço</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Última atualização: 22 de Outubro de 2026 • EduPsych Pro SaaS</p>
          </div>
          <a routerLink="/" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shrink-0">
            <span class="material-icons text-sm">arrow_back</span>
            <span>Voltar ao Início</span>
          </a>
        </div>

        <!-- Conteúdo dos Termos -->
        <div class="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          
          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar, cadastrar-se ou utilizar a plataforma <strong>EduPsych Pro</strong>, você ("Usuário" ou "Contratante") declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com nossa Política de Privacidade. Caso não concorde com qualquer disposição, você não deve acessar ou utilizar nossos serviços.
            </p>
          </section>

          <section class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100">
            <div class="flex items-center gap-2 mb-2 font-bold text-amber-900 dark:text-amber-200">
              <span class="material-icons text-amber-600 text-xl">shield</span>
              <h2 class="text-base sm:text-lg">2. Propriedade Intelectual e Proteção Anti-Clonagem</h2>
            </div>
            <p class="mb-3">
              Todo o código-fonte, arquitetura de software, componentes visuais, prompts de Inteligência Artificial, fluxos de atendimento clínico, modelos de documentos e marcas vinculadas ao <strong>EduPsych Pro</strong> são de propriedade intelectual exclusiva protegida pela <strong>Lei nº 9.609/1998 (Lei do Software)</strong> e <strong>Lei nº 9.610/1998 (Direitos Autorais)</strong>.
            </p>
            <p class="font-semibold mb-2">É TERMINANTEMENTE PROIBIDO:</p>
            <ul class="list-disc list-inside space-y-1.5 text-xs sm:text-sm">
              <li>Descompilar, desmontar, realizar <strong>engenharia reversa</strong> ou tentar derivar o código-fonte de qualquer parte da plataforma.</li>
              <li>Utilizar robôs, spiders, crawlers, scrapers, agentes de Inteligência Artificial (ex: ferramentas automatizadas de extração e clonagem de software) para mapear rotas, copiar telas ou extrair algoritmos.</li>
              <li>Replicar comercialmente as interfaces, fluxos de triagem, prompts ou lógicas clínicas com o intuito de desenvolver ou distribuir produto concorrente.</li>
              <li>Burlar, tentar contornar ou desativar qualquer mecanismo de autenticação, limitação de requisições ou segurança técnica.</li>
            </ul>
            <p class="mt-3 text-xs italic">
              A violação comprovada destas proibições ensejará a rescisão imediata e motivada da conta de acesso, sem prejuízo da apuração de perdas e danos e das sanções cíveis e criminais aplicáveis.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">3. Uso do Ambiente de Demonstração (Demo)</h2>
            <p>
              O ambiente de demonstração interativo tem finalidade estritamente avaliativa e pedagógica. Os dados contidos na clínica modelo são fictícios e simulados. Qualquer tentativa de exploração de vulnerabilidades, injeção de scripts ou extração automatizada de dados dentro da demonstração resultará em bloqueio do IP do originador.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">4. Planos, Assinaturas e Pagamentos</h2>
            <p>
              Os serviços são disponibilizados sob a modalidade de assinatura nos ciclos <strong>Mensal</strong>, <strong>Semestral</strong> e <strong>Anual</strong>, processados com segurança via Pix através da instituição de pagamento homologada (Asaas). A ativação e renovação ocorrem mediante confirmação da liquidação do valor correspondente ao ciclo escolhido.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">5. Proteção de Dados e Sigilo Clínico (LGPD)</h2>
            <p>
              O EduPsych Pro atua na condição de Operador de Dados Pessoais nos termos da <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>. O profissional ou clínica contratante é o Controlador dos dados de seus pacientes, sendo responsável pela legitimidade do tratamento, sigilo profissional e obtenção de consentimento de pais e responsáveis legais.
            </p>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">6. Foro e Legislação Aplicável</h2>
            <p>
              Estes Termos são regidos exclusivamente pelas Leis da República Federativa do Brasil. Fica eleito o Foro da Comarca da sede da empresa para dirimir quaisquer controvérsias oriundas deste instrumento.
            </p>
          </section>

        </div>

        <!-- Footer -->
        <div class="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 AVA Systems. Todos os direitos reservados.</p>
          <div class="flex gap-4">
            <a routerLink="/privacidade" class="hover:text-primary transition-colors underline">Política de Privacidade</a>
            <a routerLink="/" class="hover:text-primary transition-colors underline">Página Inicial</a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class TermosDeUsoComponent {}
