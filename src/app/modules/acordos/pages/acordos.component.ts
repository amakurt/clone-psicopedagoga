import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var html2pdf: any;

interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
}

@Component({
  selector: 'app-acordos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Acordos Profissionais</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Calculadora de honorários, contratos e propostas comerciais</p>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-2">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab.set(tab.id)"
            class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
            [class]="activeTab() === tab.id
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-white dark:bg-slate-900 text-slate-500 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50'">
            <span class="material-icons text-[16px]">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        }
      </div>

      @if (activeTab() === 'calculadora') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-icons text-primary">calculate</span>
              Calculadora de Valor Hora
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Custo Mensal (R$)</label>
                <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="calc.custoMensal" placeholder="Ex: 8000">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Horas Trabalhadas / Semana</label>
                <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="calc.horasSemana" placeholder="Ex: 40">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dias Úteis / Mês</label>
                <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="calc.diasUteis" placeholder="Ex: 22">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Margem de Lucro (%)</label>
                <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="calc.margem" placeholder="Ex: 30">
              </div>
            </div>
            <button (click)="calcularValorHora()"
              class="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95">
              <span class="material-icons text-[18px]">calculate</span>
              Calcular
            </button>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-icons text-emerald-500">analytics</span>
              Resultado
            </h2>
            @if (resultadoCalc()) {
              <div class="space-y-4">
                <div class="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                  <p class="text-xs font-bold text-primary uppercase mb-1">Valor Hora Recomendado</p>
                  <p class="text-3xl font-black text-primary">R&#36; {{ resultadoCalc()!.valorHora | number:'1.2-2' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Horas / Mês</p>
                    <p class="text-lg font-bold text-slate-900 dark:text-white">{{ resultadoCalc()!.horasMes }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Custo / Hora</p>
                    <p class="text-lg font-bold text-slate-900 dark:text-white">R&#36; {{ resultadoCalc()!.custoHora | number:'1.2-2' }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Receita Mensal</p>
                    <p class="text-lg font-bold text-emerald-600">R&#36; {{ resultadoCalc()!.receitaMes | number:'1.2-2' }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Lucro Mensal</p>
                    <p class="text-lg font-bold text-emerald-600">R&#36; {{ resultadoCalc()!.lucroMes | number:'1.2-2' }}</p>
                  </div>
                </div>
              </div>
            } @else {
              <div class="text-center py-8">
                <span class="material-icons text-5xl text-slate-300">calculate</span>
                <p class="text-slate-500 mt-2 text-sm">Preencha os campos e clique em Calcular</p>
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'contratos') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (tpl of templates; track tpl.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-5 hover:ring-primary/30 transition-all">
              <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-2">{{ tpl.title }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ tpl.description }}</p>
              <div class="flex gap-2">
                <button (click)="viewTemplate(tpl)"
                  class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all">
                  <span class="material-icons text-sm">visibility</span> Ver
                </button>
                <button (click)="exportTemplate(tpl)"
                  class="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all">
                  <span class="material-icons text-sm">picture_as_pdf</span> PDF
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab() === 'objecoes') {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-amber-500">tips_and_updates</span>
            Respostas para Objeções de Preço
          </h2>
          <div class="space-y-4">
            @for (obj of objecoes; track obj.objecao) {
              <div class="p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                <p class="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span class="material-icons text-amber-500 text-sm">warning</span>
                  &#8220;{{ obj.objecao }}&#8221;
                </p>
                <p class="text-sm text-slate-600 dark:text-slate-400 ml-7">{{ obj.resposta }}</p>
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'proposta') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-icons text-primary">description</span>
              Gerar Proposta Comercial
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Paciente</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="proposta.paciente">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Responsável</label>
                <input class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="proposta.responsavel">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nº Sessões</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="proposta.sessoes">
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Valor por Sessão (R$)</label>
                  <input type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                    [(ngModel)]="proposta.valorSessao">
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Forma de Pagamento</label>
                <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  [(ngModel)]="proposta.pagamento">
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="credito">Cartão de Crédito</option>
                  <option value="transferencia">Transferência Bancária</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Observações</label>
                <textarea class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows="3" [(ngModel)]="proposta.observacoes" placeholder="Informações adicionais..."></textarea>
              </div>
            </div>
            <button (click)="exportProposta()"
              class="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95">
              <span class="material-icons text-[18px]">picture_as_pdf</span>
              Gerar Proposta PDF
            </button>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-icons text-emerald-500">preview</span>
              Pré-visualização
            </h2>
            @if (proposta.paciente || proposta.responsavel) {
              <div class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm space-y-3">
                <div class="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                  <p class="font-black text-primary text-lg">PROPOSTA COMERCIAL</p>
                  <p class="text-xs text-slate-500">EduPsych Pro</p>
                </div>
                <p><span class="font-bold text-slate-700 dark:text-slate-300">Paciente:</span> <span class="text-slate-900 dark:text-white">{{ proposta.paciente || '—' }}</span></p>
                <p><span class="font-bold text-slate-700 dark:text-slate-300">Responsável:</span> <span class="text-slate-900 dark:text-white">{{ proposta.responsavel || '—' }}</span></p>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p class="font-bold text-slate-700 dark:text-slate-300 mb-1">Detalhes</p>
                  <p><span class="font-bold">Sessões:</span> {{ proposta.sessoes || 0 }}</p>
                  <p><span class="font-bold">Valor por sessão:</span> R&#36; {{ proposta.valorSessao || 0 | number:'1.2-2' }}</p>
                  <p class="text-lg font-black text-primary mt-2">Total: R&#36; {{ (proposta.sessoes || 0) * (proposta.valorSessao || 0) | number:'1.2-2' }}</p>
                  <p><span class="font-bold">Pagamento:</span> {{ getPagamentoLabel(proposta.pagamento) }}</p>
                </div>
                @if (proposta.observacoes) {
                  <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p class="font-bold text-slate-700 dark:text-slate-300">Observações:</p>
                    <p class="text-slate-600 dark:text-slate-400">{{ proposta.observacoes }}</p>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <span class="material-icons text-5xl text-slate-300">preview</span>
                <p class="text-slate-500 mt-2 text-sm">Preencha os campos para ver a pré-visualização</p>
              </div>
            }
          </div>
        </div>
      }

      @if (selectedTemplate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="selectedTemplate.set(null)"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8">
            <button (click)="selectedTemplate.set(null)" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <span class="material-icons">close</span>
            </button>
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-4">{{ selectedTemplate()!.title }}</h2>
            <div class="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{{ selectedTemplate()!.content }}</div>
            <div class="mt-6 flex justify-end gap-3">
              <button (click)="selectedTemplate.set(null)"
                class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-400 transition-all">
                Fechar
              </button>
              <button (click)="exportTemplate(selectedTemplate()!)"
                class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95">
                <span class="material-icons text-[18px]">picture_as_pdf</span>
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AcordosComponent {
  activeTab = signal('calculadora');
  selectedTemplate = signal<ContractTemplate | null>(null);

  tabs = [
    { id: 'calculadora', label: 'Calculadora', icon: 'calculate' },
    { id: 'contratos', label: 'Contratos', icon: 'gavel' },
    { id: 'objecoes', label: 'Objeções', icon: 'tips_and_updates' },
    { id: 'proposta', label: 'Proposta', icon: 'description' },
  ];

  calc = { custoMensal: 8000, horasSemana: 40, diasUteis: 22, margem: 30 };
  resultadoCalc = signal<{ valorHora: number; custoHora: number; horasMes: number; receitaMes: number; lucroMes: number } | null>(null);

  proposta = { paciente: '', responsavel: '', sessoes: 12, valorSessao: 150, pagamento: 'pix', observacoes: '' };

  templates: ContractTemplate[] = [
    { id: 't1', title: 'Contrato de Prestação de Serviços Clínicos', description: 'Contrato padrão para atendimentos clínicos individuais',
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS CLÍNICOS\n\nCONTRATANTE: [Nome do Profissional], inscrito no CRP [nº], CNPJ [nº]\nCONTRATADO: [Nome do Paciente/Responsável], CPF [nº]\n\nCLÁUSULA 1ª - OBJETO\nO presente contrato tem por objeto a prestação de serviços de psicopedagogia, incluindo avaliação, diagnóstico e intervenção psicopedagógica.\n\nCLÁUSULA 2ª - DURAÇÃO\nO contrato terá duração de ___ meses, iniciando-se em ___/___/___.\n\nCLÁUSULA 3ª - HORÁRIO E FREQUÊNCIA\nAs sessões serão realizadas nas seguintes condições:\n- Dia(s): ___\n- Horário(s): ___\n- Frequência: ___ vez(es) por semana\n- Duração de cada sessão: ___ minutos\n\nCLÁUSULA 4ª - VALOR E FORMA DE PAGAMENTO\n- Valor da sessão: R$ ___\n- Forma de pagamento: ___\n- Vencimento: dia ___\n- Multa por atraso: 2% + juros de 1% ao mês\n\nCLÁUSULA 5ª - CANCELAMENTO E FALTAS\nFaltas com aviso prévio de 24h não serão cobradas. Faltas sem aviso serão cobradas integralmente.\n\nCLÁUSULA 6ª - SIGILLO E CONFIDENCIALIDADE\nTodos os dados e informações obtidos durante o atendimento são de caráter sigiloso, conforme Resolução CFP nº 06/2019.\n\nCLÁUSULA 7ª - RESCISÃO\nO contrato poderá ser rescindido por qualquer das partes, mediante comunicação prévia de 30 dias.\n\nLocal e data: ___/___/___\n\n___________________________  ___________________________\nProfissional                     Paciente/Responsável` },
    { id: 't2', title: 'Contrato Escolar - Atendimento Educacional', description: 'Contrato para atendimentos em contexto escolar',
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS\n\nCONTRATANTE: [Nome do Profissional], inscrito no CRP [nº]\nCONTRATADO: [Nome da Escola], CNPJ [nº]\nRepresentante Legal: [Nome], CPF [nº]\n\nCLÁUSULA 1ª - OBJETO\nPrestação de serviços de psicopedagogia em ambiente escolar, incluindo avaliação psicopedagógica, acompanhamento pedagógico e orientação a professores.\n\nCLÁUSULA 2ª - SERVIÇOS\n- Avaliação psicopedagógica\n- Elaboração e acompanhamento de PEI/PECEI\n- Orientação pedagógica e didática\n- Atendimento direto ao estudante\n- Reuniões com equipe escolar e família\n\nCLÁUSULA 3ª - PERÍODO\nVigência: ___/___/___ a ___/___/___\nFrequência: ___ sessão(ões) por semana\n\nCLÁUSULA 4ª - VALOR\n- Valor mensal: R$ ___\n- Pagamento até dia ___ de cada mês\n\nCLÁUSULA 5ª - SIGILLO\nOs profissionais comprometem-se a manter sigilo absoluto sobre informações obtidas durante os atendimentos.\n\nLocal e data: ___/___/___\n\n___________________________  ___________________________\nProfissional                     Representante da Escola` },
    { id: 't3', title: 'Termo de Consentimento - Avaliação', description: 'Termo para autorização de avaliação psicopedagógica',
      content: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO\n\nEu, ______________________________, CPF __________________, na qualidade de responsável legal pelo(a) menor ______________________________, nascido(a) em ___/___/___, AUTORIZO o profissional ______________________________, inscrito no CRP nº __________, a realizar Avaliação Psicopedagógica.\n\n1. OBJETIVO\nA avaliação tem por objetivo compreender o processo de aprendizagem e identificar fatores que possam estar interferindo no desenvolvimento educacional.\n\n2. PROCEDIMENTOS\nA avaliação incluirá:\n- Entrevista clínica com a família\n- Análise documental (relatórios escolares, laudos anteriores)\n- Aplicação de instrumentos psicopedagógicos\n- Observação clínica\n- Relatório escrito com conclusões e recomendações\n\n3. CONFIDENCIALIDADE\nTodas as informações são tratadas com sigilo absoluto, conforme Resolução CFP nº 06/2019.\n\n4. PRAZO\nO relatório será entregue em até ___ dias úteis após a conclusão da avaliação.\n\n5. CUSTOS\nValor total da avaliação: R$ ___\nForma de pagamento: ___\n\nLocal e data: ___/___/___\n\n___________________________  ___________________________\nProfissional                     Responsável Legal` },
    { id: 't4', title: 'Proposta Comercial - Pacote de Sessões', description: 'Proposta para pacotes de atendimento',
      content: `PROPOSTA COMERCIAL - PACOTE DE SESSÕES\n\nProfissional: [Nome], CRP [nº]\nData: ___/___/___\n\nPaciente: ______________________________\nResponsável: ______________________________\n\nPROPOSTA\n- Quantidade de sessões: ___\n- Duração de cada sessão: ___ minutos\n- Frequência: ___ vez(es) por semana\n- Valor por sessão: R$ ___\n- VALOR TOTAL DO PACOTE: R$ ___\n- Desconto para pagamento antecipado: ___%\n\nFORMA DE PAGAMENTO\n- PIX: [chave]\n- Boleto: [banco]\n- Cartão: [bandeiras]\n\nVALIDADE\nEsta proposta é válida por 15 dias a partir da data de emissão.\n\nSERVIÇOS INCLUSOS\n✓ Avaliação inicial detalhada\n✓ ___ sessões de atendimento individual\n✓ Relatórios de evolução\n✓ Reuniões com escola (quando necessário)\n✓ Contato com equipe multiprofissional\n\nLocal e data: ___/___/___\n\n___________________________  ___________________________\nProfissional                     Responsável` },
    { id: 't5', title: 'Acordo de Supervisão', description: 'Termo para supervisão profissional entre colegas',
      content: `ACORDO DE SUPERVISÃO PROFISSIONAL\n\nSUPERVISOR(A): __________________________, inscrito(a) no CRP nº __________\nSUPERVISIONADO(A): __________________________, inscrito(a) no CRP nº __________\n\nCLÁUSULA 1ª - OBJETO\nO presente acordo tem por objeto a supervisão profissional nas áreas de psicopedagogia e práticas baseadas em evidências.\n\nCLÁUSULA 2ª - FORMA\n- Modalidade: Presencial / Online\n- Frequência: ___ vez(es) por mês\n- Duração: ___ minutos por encontro\n- Investimento: R$ ___ por encontro\n\nCLÁUSULA 3ª - RESPONSABILIDADES DO(A) SUPERVISOR(A)\n- Orientar sobre práticas baseadas em evidências\n- Revisar documentos e relatórios\n- Fornecer feedback construtivo\n- Acompanhar casos clínicos\n\nCLÁUSULA 4ª - RESPONSABILIDADES DO(A) SUPERVISIONADO(A)\n- Cumprir as atividades propostas\n- Apresentar relatórios de supervisão\n- Manter sigilo sobre os casos discutidos\n\nCLÁUSULA 5ª - DURAÇÃO\nO acordo terá duração de ___ meses, iniciando-se em ___/___/___\n\nLocal e data: ___/___/___\n\n___________________________  ___________________________\nSupervisor(a)                     Supervisionado(a)` },
    { id: 't6', title: 'Termo de Sigilo e Confidencialidade', description: 'Compromisso de sigilo profissional',
      content: `TERMO DE SIGILO E CONFIDENCIALIDADE\n\nEu, ______________________________, inscrito(a) no CRP nº __________, DECLARO que me comprometo a manter absoluto sigilo sobre todas as informações obtidas durante o exercício profissional, incluindo:\n\n- Dados pessoais de pacientes e suas famílias\n- Registros clínicos e prontuários\n- Informações sobre casos em atendimento\n- Dados obtidos em avaliações psicopedagógicas\n- Comunicações com escolas e outros profissionais\n\nEste compromisso é irrevogável e se estende mesmo após o término do vínculo profissional, conforme:\n- Código de Ética do Psicólogo (Resolução CFP nº 010/2005)\n- Resolução CFP nº 06/2019 (Registros em Serviços de Saúde)\n- Lei Geral de Proteção de Dados (Lei nº 13.709/2018)\n\nExceções ao sigilo:\n- Autorização expressa do paciente ou responsável legal\n- Determinação judicial\n- Risco iminente à vida do paciente ou de terceiros\n\nData: ___/___/___\n\n___________________________\nProfissional - CRP nº ___` },
  ];

  objecoes = [
    { objecao: 'Muito caro, não posso pagar', resposta: 'Entendo sua preocupação. O investimento reflete a qualificação, especialização e o tempo dedicado ao seu caso. Oferecemos opções de pagamento parcelado e pacotes com desconto. Lembre-se que prevenção e intervenção precoce evitam custos maiores no futuro.' },
    { objecao: 'Vou procurar alguém mais barato', resposta: 'A qualidade do atendimento e a formação do profissional fazem toda a diferença nos resultados. Um profissional bem qualificado garante intervenções baseadas em evidências, evitando retrabalho e frustrações.' },
    { objecao: 'Preciso pensar melhor', resposta: 'Claro, é importante que se sinta confortável. Gostaria de agendar uma conversa gratuita para esclarecer suas dúvidas? Muitas vezes, uma pequena ação hoje evita dificuldades maiores amanhã.' },
    { objecao: 'Meu filho não precisa de ajuda', resposta: 'Identificar dificuldades precocemente é um ato de amor e responsabilidade. Muitas crianças se beneficiam enormemente de intervenções na primeira infância, quando o cérebro tem maior plasticidade.' },
    { objecao: 'Já fiz avaliação em outro lugar', resposta: 'Cada avaliação tem seu contexto e abordagem. Posso revisar os laudos anteriores e verificar se há necessidade de uma avaliação complementar ou de acompanhamento terapêutico.' },
    { objecao: 'Não acredito em terapia', resposta: 'Entendo sua posição. A psicopedagogia é baseada em evidências científicas com décadas de pesquisa. Posso apresentar dados sobre a eficácia das intervenções para que tome uma decisão informada.' },
    { objecao: 'Não tenho tempo para levar', resposta: 'Ofereço modalidades de atendimento que se adaptam à sua rotina, incluindo atendimento online e horários flexíveis. A saúde do seu filho não pode esperar.' },
  ];

  calcularValorHora() {
    const horasMes = this.calc.horasSemana * (this.calc.diasUteis / 5);
    const custoHora = this.calc.custoMensal / horasMes;
    const valorHora = custoHora * (1 + this.calc.margem / 100);
    const receitaMes = valorHora * horasMes;
    const lucroMes = receitaMes - this.calc.custoMensal;
    this.resultadoCalc.set({ valorHora, custoHora, horasMes, receitaMes, lucroMes });
  }

  viewTemplate(tpl: ContractTemplate) {
    this.selectedTemplate.set(tpl);
  }

  getPagamentoLabel(pagamento: string): string {
    const labels: Record<string, string> = { pix: 'PIX', boleto: 'Boleto', credito: 'Cartão de Crédito', transferencia: 'Transferência Bancária', parcelado: 'Parcelado' };
    return labels[pagamento] || pagamento;
  }

  exportTemplate(tpl: ContractTemplate) {
    this.exportToPdf(tpl.title, tpl.content);
  }

  exportProposta() {
    const total = (this.proposta.sessoes || 0) * (this.proposta.valorSessao || 0);
    const content = `PROPOSTA COMERCIAL\n\nPaciente: ${this.proposta.paciente || '—'}\nResponsável: ${this.proposta.responsavel || '—'}\n\nSessões: ${this.proposta.sessoes}\nValor por sessão: R$ ${this.proposta.valorSessao}\nTotal: R$ ${total}\nPagamento: ${this.getPagamentoLabel(this.proposta.pagamento)}\n\n${this.proposta.observacoes ? 'Observações: ' + this.proposta.observacoes : ''}`;
    this.exportToPdf('Proposta Comercial', content);
  }

  private exportToPdf(title: string, content: string) {
    const html = `<html><head><meta charset="utf-8"><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;font-size:13px;line-height:1.8;}
      h1{font-size:20px;color:#6366f1;margin-bottom:16px;text-align:center;}
      .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center;}</style></head>
      <body><h1>${title}</h1><pre style="white-space:pre-wrap;font-family:inherit;">${content}</pre>
      <div class="footer">Exportado em ${new Date().toLocaleDateString('pt-BR')} - EduPsych Pro</div></body></html>`;
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el);
    html2pdf().set({ margin: 10, filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save().then(() => document.body.removeChild(el));
  }
}
