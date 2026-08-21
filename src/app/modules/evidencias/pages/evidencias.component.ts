import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var html2pdf: any;

interface EvidenceItem {
  id: string;
  title: string;
  content: string;
  author?: string;
  source?: string;
  category?: string;
  favorite: boolean;
}

@Component({
  selector: 'app-evidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in">
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Central de Evidências</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Referências para prática clínica em psicopedagogia</p>
        </div>
        <button (click)="exportAllFavorites()"
          class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95">
          <span class="material-icons text-[18px]">picture_as_pdf</span>
          Exportar Favoritos
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
          [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Buscar em todas as abas...">
      </div>

      <!-- Tabs -->
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

      <!-- Content -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div class="p-6">
          @if (filteredItems().length === 0) {
            <div class="text-center py-12">
              <span class="material-icons text-6xl text-slate-300">search_off</span>
              <p class="text-slate-500 mt-3">Nenhum item encontrado</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (item of filteredItems(); track item.id) {
                <div class="p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 hover:ring-primary/30 transition-all">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ item.title }}</h3>
                        @if (item.category) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{{ item.category }}</span>
                        }
                      </div>
                      @if (item.author) {
                        <p class="text-xs text-primary font-semibold mb-1">{{ item.author }}</p>
                      }
                      @if (item.source) {
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">{{ item.source }}</p>
                      }
                      <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ item.content }}</p>
                    </div>
                    <button (click)="toggleFavorite(item.id)"
                      class="p-2 rounded-xl transition-all shrink-0"
                      [class]="item.favorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'">
                      <span class="material-icons text-xl">{{ item.favorite ? 'star' : 'star_border' }}</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class EvidenciasComponent implements OnInit {
  activeTab = signal('citacoes');
  searchTerm = '';

  tabs = [
    { id: 'citacoes', label: 'Citações', icon: 'format_quote' },
    { id: 'legislacao', label: 'Legislação', icon: 'gavel' },
    { id: 'fundamentacao', label: 'Fundamentação', icon: 'psychology' },
    { id: 'protocolos', label: 'Protocolos', icon: 'fact_check' },
    { id: 'glossario', label: 'Glossário', icon: 'menu_book' },
  ];

  private allItems: EvidenceItem[] = [
    { id: 'c1', title: 'A educação como prática da liberdade', content: '"Não há embriaguez nem anestesia que explique a infelicidade do oprimido." A educação deve ser uma prática de libertação, não de acomodação.', author: 'Paulo Freire', source: 'Pedagogia do Oprimido, 1970', favorite: false },
    { id: 'c2', title: 'O desafio de ensinar', content: '"O bom professor é aquele que consegue transformar a vida difícil em vida possível para seus alunos." O desafio pedagógico é adaptar o conteúdo à realidade do estudante.', author: 'Philippe Meirieu', source: 'O escolhido e o condenado, 2004', favorite: false },
    { id: 'c3', title: 'Psicopedagogia clínica', content: '"A psicopedagogia não se ocupa apenas da aprendizagem, mas de toda a construção do sujeito que aprende." A intervenção é multifatorial e sistêmica.', author: 'Celina Lima Mello', source: 'Psicopedagogia: uma visão contemporânea, 2000', favorite: false },
    { id: 'c4', title: 'Neurociência e aprendizagem', content: '"O cérebro é um órgão social que se forma pelas interações." O ambiente e as relações afetivas são determinantes para o desenvolvimento neural e cognitivo.', author: 'Celina Mello & Deborah Pollak', source: 'Como as crianças aprendem a ler e a escrever, 2012', favorite: false },
    { id: 'c5', title: 'Mediação pedagógica', content: '"O professor deve ser um mediador entre o conhecimento e o aluno, não apenas um transmissor de informações." A mediação é a chave para a aprendizagem significativa.', author: 'Angela Botta', source: 'Psicopedagogia: novas contribuições teóricas, 2003', favorite: false },
    { id: 'c6', title: 'Avaliação psicopedagógica', content: '"A avaliação psicopedagógica deve ser um processo contínuo, global e integrado, que busque compreender o sujeito e seu processo de aprendizagem."', author: 'Jorge Visca', source: 'Psicopedagogia: um novo campo da educação, 1987', favorite: false },
    { id: 'c7', title: 'Sujeito aprendente', content: '"Todo sujeito é um sujeito aprendente, em constante construção de si mesmo e do mundo." A aprendizagem é um processo identitário e existencial.', author: 'Marilyn Arapovich & Jurema Alcione Cencek', source: 'Processos Aprendentes, 2008', favorite: false },
    { id: 'c8', title: 'Programas ABA', content: '"O ensino baseado em aplicação do comportamento (ABA) é a ciência de ensinar e aprender, fundamentada em princípios do comportamento." Intervenção baseada em evidências para TEA.', author: 'Ivar Lovaas', source: 'Teaching Individuals with Developmental Delays, 2003', favorite: false },
    { id: 'c9', title: 'Vygotsky e ZDP', content: '"A zona de desenvolvimento proximal é a distância entre o que o aluno pode fazer sozinho e o que pode fazer com auxílio." O ensino deve atuar nessa zona.', author: 'Lev Vygotsky', source: 'A Formação Social da Mente, 1978', favorite: false },
    { id: 'c10', title: 'Importância do brincar', content: '"A brincadeira é a fonte de desenvolvimento da criança, criando uma zona de desenvolvimento proximal em cada criança."', author: 'Lev Vygotsky', source: 'Play and its role in the mental development of the child, 1967', favorite: false },
    { id: 'l1', title: 'Lei 9394/96 - LDB', content: 'Lei de Diretrizes e Bases da Educação Nacional. Dispõe sobre a educação. O art. 28 garante a corrreção de fluxo e a aprendizagem efetiva como objetivos da educação. O art. 30 assegura atendimento educacional especializado a pessoas com deficiência.', source: 'Lei nº 9.394, de 20 de dezembro de 1996', favorite: false },
    { id: 'l2', title: 'Marco Civil da Internet', content: 'Lei 12.965/14. Estabelece princípios e garantias para o uso da internet no Brasil. Protege a privacidade e os dados pessoais dos usuários, especialmente de crianças e adolescentes (Art. 7º).', source: 'Lei nº 12.965, de 23 de abril de 2014', favorite: false },
    { id: 'l3', title: 'Estatuto da Criança e do Adolescente', content: 'Lei 8.069/90. Assegura direitos fundamentais à educação (Art. 53), à dignidade (Art. 4º), e atendimento diferenciado a crianças com deficiência (Art. 4º, inciso XXV).', source: 'Lei nº 8.069, de 13 de julho de 1990', favorite: false },
    { id: 'l4', title: 'LGPD Art. 14 - Tratamento de dados de crianças', content: 'O tratamento de dados pessoais de crianças e adolescentes deverá ser realizado em seu melhor interesse. É necessária autorização específica do responsável legal.', source: 'Lei nº 13.709/18 (LGPD), Art. 14', favorite: false },
    { id: 'l5', title: 'Estatuto da Pessoa com Deficiência', content: 'Lei 13.146/15. Garante direitos à educação inclusiva (Art. 27), à assistência (Art. 23), e à formação profissional (Art. 28). Elimina barreiras para a participação plena.', source: 'Lei nº 13.146, de 6 de julho de 2015', favorite: false },
    { id: 'l6', title: 'INEP - Orientações para Avaliação', content: 'O INEP determina que a avaliação deve ser contínua, diagnóstica e processual, contemplando aspectos cognitivos, afetivos e sociais do estudante.', source: 'INEP/MEC - Documentos Orientadores', favorite: false },
    { id: 'f1', title: 'TEA - Transtorno do Espectro Autista (DSM-5)', content: 'Deficiência no funcionamento social e padrões restritos e repetitivos de comportamento. Classificação em 3 níveis de suporte. Acomete 1 em cada 54 crianças (CDC, 2020). Diagnóstico multidisciplinar entre 18-36 meses.', source: 'Manual Diagnóstico e Estatístico de Transtornos Mentais, 5ª edição', favorite: false },
    { id: 'f2', title: 'TDAH - Transtorno de Déficit de Atenção com Hiperatividade', content: 'Padrão persistente de desatenção e/ou hiperatividade-impulsividade. Predominantemente desatento, hiperativo/impulsivo ou combinado. Afeta 5-7% das crianças em idade escolar. Tratamento multimodal.', source: 'DSM-5, F90', favorite: false },
    { id: 'f3', title: 'Dislexia', content: 'Distúrbio específico de aprendizagem com dificuldade na leitura. Características: inversões, omissões, trocas de letras, lentidão na leitura. Prevalência: 5-12%. Base neurológica comprovada.', source: 'DSM-5 - Distúrbios Específicos de Aprendizagem', favorite: false },
    { id: 'f4', title: 'Deficiência Intelectual', content: 'Limitações no funcionamento intelectual e comportamento adaptativo, iniciadas antes dos 18 anos. Classificação: leve, moderada, severa, profunda. Intervenção baseada em habilidades adaptativas.', source: 'DSM-5, F70-F79', favorite: false },
    { id: 'f5', title: 'Transtorno Opositor Desafiador (TOD)', content: 'Padrão de humor irritável e comportamento desafiador. Prevalência: 1-16%. Comorbidade frequente com TDAH e TOD. Tratamento: intervenção familiar e escolar.', source: 'DSM-5, F91.3', favorite: false },
    { id: 'p1', title: 'M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised)', content: 'Instrumento de rastreio para TEA em crianças de 16-30 meses. 20 itens. Tempo de aplicação: 2-5 minutos. Classificação: baixo, moderado ou alto risco. Sensibilidade: 85-98%.', source: 'Robins et al., 2014', favorite: false },
    { id: 'p2', title: 'SNAP-IV', content: 'Questionário de rastreio para TDAH e TOD. 18 itens baseados nos critérios do DSM. Versão para pais e professores. Pontuação: desatenção (itens 1-9), hiperatividade (itens 10-18).', source: 'Swanson et al., 2001', favorite: false },
    { id: 'p3', title: 'ATA - Avaliação Temperamental e Adaptativa', content: 'Instrumento que avalia temperamento e comportamento adaptativo em crianças. Auxilia no planejamento de intervenções individualizadas.', source: 'Thompson & Suiter, adaptado por David & Souza', favorite: false },
    { id: 'p4', title: 'ABLLS-R (Assessment of Basic Language and Learning Skills)', content: 'Sistema de avaliação de habilidades básicas de linguagem e aprendizagem. 500+ habilidades em 28 áreas. Usado em programas ABA para determinar nível de funcionalidade e planejar intervenções.', source: 'Partington, 2008', favorite: false },
    { id: 'p5', title: 'VB-MAPP (Verbal Behavior Milestones Assessment and Placement Program)', content: 'Avaliação baseada na Análise do Comportamento Aplicada. 170 marcos de desenvolvimento. 3 níveis de funcionalidade. Complementar ao ABLLS-R.', source: 'Sundberg, 2008', favorite: false },
    { id: 'g1', title: 'ABA', content: 'Análise do Comportamento Aplicada. Ciência do comportamento aplicada a situações sociais relevantes. Base para intervenções em TEA e deficiências intelectuais.', favorite: false },
    { id: 'g2', title: 'PEI', content: 'Plano Educacional Individualizado. Documento que formaliza as adaptações e modificações curriculares para o estudante com necessidades especiais.', favorite: false },
    { id: 'g3', title: 'PECEI', content: 'Plano de Estimulação Comportamental e Educacional Individualizado. Documento que detalha as intervenções comportamentais para o estudante.', favorite: false },
    { id: 'g4', title: 'TEA', content: 'Transtorno do Espectro Autista. Condição do neurodesenvolvimento caracterizada por déficits na comunicação social e padrões restritos/repetitivos de comportamento.', favorite: false },
    { id: 'g5', title: 'TDAH', content: 'Transtorno de Déficit de Atenção com Hiperatividade. Condição neurológica que afeta atenção, controle de impulsos e regulação da atividade motora.', favorite: false },
    { id: 'g6', title: 'Dislexia', content: 'Dificuldade de aprendizagem que afeta especificamente a leitura e escrita, não associada a déficits intelectuais ou sensoriais.', favorite: false },
    { id: 'g7', title: 'Deficiência Intelectual', content: 'Condição caracterizada por limitações significativas no funcionamento intelectual e no comportamento adaptativo.', favorite: false },
    { id: 'g8', title: 'Fonoaudiologia', content: 'Profissional que atua na prevenção, avaliação e reabilitação das funções da comunicação, linguagem, motricidade orofacial, voz, audição e deglutição.', favorite: false },
    { id: 'g9', title: 'Psicopedagogia', content: 'Área do conhecimento que estuda os processos de aprendizagem e seus interferentes. Atua na prevenção, diagnóstico e intervenção em dificuldades de aprendizagem.', favorite: false },
    { id: 'g10', title: 'Terapia Ocupacional', content: 'Profissional que atua na promoção da independência e participação social através de atividades significativas e adaptativas.', favorite: false },
    { id: 'g11', title: 'Comportamento Funcional', content: 'Análise do comportamento que identifica a função de um comportamento (escapismo, acesso tangível, atenção, sensory).', favorite: false },
    { id: 'g12', title: 'Manding', content: 'Habilidade de fazer um pedido ou solicitação de forma funcional e adequada ao contexto social.', favorite: false },
    { id: 'g13', title: 'DTT', content: 'Discrete Trial Training. Procedimento estruturado de ensino com ensino direto e tentativas discretas.', favorite: false },
    { id: 'g14', title: 'NET', content: 'Natural Environment Teaching. Ensino realizado em ambiente natural, utilizando rotinas e atividades do dia a dia.', favorite: false },
    { id: 'g15', title: 'PECS', content: 'Sistema de Comunicação por Troca de Figuras. Método de comunicação alternativa para indivíduos com TEA.', favorite: false },
  ];

  filteredItems = signal<EvidenceItem[]>([]);

  private tabEffect = effect(() => {
    this.activeTab();
    this.filterItems();
  });

  ngOnInit() {
    this.loadFavorites();
    this.filterItems();
  }

  onSearchChange() {
    this.filterItems();
  }

  filterItems() {
    const tab = this.activeTab();
    const term = this.searchTerm.toLowerCase();
    this.filteredItems.set(
      this.allItems.filter(item => {
        const tabMatch = this.getTabForItem(item.id) === tab;
        const searchMatch = !term ||
          item.title.toLowerCase().includes(term) ||
          item.content.toLowerCase().includes(term) ||
          (item.author && item.author.toLowerCase().includes(term)) ||
          (item.source && item.source.toLowerCase().includes(term)) ||
          (item.category && item.category.toLowerCase().includes(term));
        return tabMatch && searchMatch;
      })
    );
  }

  private getTabForItem(id: string): string {
    if (id.startsWith('c')) return 'citacoes';
    if (id.startsWith('l')) return 'legislacao';
    if (id.startsWith('f')) return 'fundamentacao';
    if (id.startsWith('p')) return 'protocolos';
    if (id.startsWith('g')) return 'glossario';
    return '';
  }

  toggleFavorite(id: string) {
    const item = this.allItems.find(i => i.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.saveFavorites();
      this.filterItems();
    }
  }

  private saveFavorites() {
    const favIds = this.allItems.filter(i => i.favorite).map(i => i.id);
    localStorage.setItem('evidencias_favorites', JSON.stringify(favIds));
  }

  private loadFavorites() {
    const favIds = JSON.parse(localStorage.getItem('evidencias_favorites') || '[]') as string[];
    this.allItems.forEach(item => {
      item.favorite = favIds.includes(item.id);
    });
  }

  exportAllFavorites() {
    const favItems = this.allItems.filter(i => i.favorite);
    if (favItems.length === 0) {
      alert('Nenhum item favorito para exportar.');
      return;
    }
    const html = `
      <html><head><meta charset="utf-8"><title>Evidências Favoritas</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;}
      h1{font-size:24px;color:#6366f1;margin-bottom:8px;}
      h2{font-size:14px;color:#64748b;font-weight:normal;margin-bottom:24px;}
      .item{margin-bottom:20px;padding:16px;border:1px solid #e2e8f0;border-radius:12px;}
      .title{font-weight:bold;font-size:14px;color:#1e293b;margin-bottom:4px;}
      .author{font-size:12px;color:#6366f1;font-weight:600;}
      .source{font-size:11px;color:#94a3b8;font-style:italic;margin-bottom:8px;}
      .content{font-size:13px;color:#475569;line-height:1.6;}
      .footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center;}</style></head>
      <body><h1>Evidências Favoritas</h1><h2>Central de Evidências - EduPsych Pro</h2>
      ${favItems.map(i => `<div class="item"><div class="title">${i.title}</div>${i.author ? `<div class="author">${i.author}</div>` : ''}${i.source ? `<div class="source">${i.source}</div>` : ''}<div class="content">${i.content}</div></div>`).join('')}
      <div class="footer">Exportado em ${new Date().toLocaleDateString('pt-BR')} - EduPsych Pro</div></body></html>`;
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el);
    html2pdf().set({ margin: 10, filename: 'evidencias-favoritas.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save().then(() => document.body.removeChild(el));
  }
}
