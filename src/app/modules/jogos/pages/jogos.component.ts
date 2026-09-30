import { Component, signal, OnDestroy, ElementRef, ViewChild, HostListener, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '@modules/pacientes/services/pacientes.service';
import { ToastService } from '@shared/components/toast.component';

export interface Jogo {
  id: number;
  name: string;
  category: string;
  difficulty: number;
  time: string;
  ageRange: string;
  description: string;
  type: string;
}

export const JOGOS_DATA: Jogo[] = [
  { id: 1, name: 'Caça à Estrela', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Encontre a estrela azul entre os círculos cinza', type: 'attention' },
  { id: 2, name: 'Contagem Rápida', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Toque nos frutos aparecendo na tela o mais rápido possível', type: 'tap' },
  { id: 3, name: 'Stroop Simples', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '6-10', description: 'Diga a cor da tinta, ignore a palavra escrita', type: 'stroop' },
  { id: 4, name: 'Atenção Dividida', category: 'Atenção', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Toque nos círculos azuis e ignore os vermelhos ao mesmo tempo', type: 'tap' },
  { id: 5, name: 'Inibir Resposta', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '6-10', description: 'Toque apenas nos quadrados — nunca nos círculos', type: 'tap' },
  { id: 6, name: 'Rastreamento Visual', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '5-9', description: 'Siga a estrela com o olhar e toque nela quando parar', type: 'tracking' },
  { id: 7, name: 'Memória de Cores', category: 'Atenção', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Lembre-se das cores mostradas e repita a sequência', type: 'sequence' },
  { id: 8, name: 'Sequência Numérica', category: 'Atenção', difficulty: 2, time: '3 min', ageRange: '5-9', description: 'Complete a sequência de números na ordem correta', type: 'number_sequence' },
  { id: 9, name: 'Memória de Posições', category: 'Atenção', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Lembre-se de onde cada emoji estava escondido', type: 'memory' },
  { id: 10, name: 'Caça Palavras', category: 'Atenção', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Encontre as letras que formam a palavra escondida', type: 'attention' },

  { id: 11, name: 'Jogo da Memória', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-8', description: 'Encontre os pares de frutas virando as cartas', type: 'memory' },
  { id: 12, name: 'Memória de Animais', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-7', description: 'Encontre os pares de animais escondidos', type: 'memory' },
  { id: 13, name: 'Memória de Números', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Lembre-se dos números e encontre os pares', type: 'memory' },
  { id: 14, name: 'Memória de Formas', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Encontre as formas geométricas iguais', type: 'memory' },
  { id: 15, name: 'Super Memória', category: 'Memória', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Grade 4x4 com 8 pares — desafio máximo', type: 'memory' },
  { id: 16, name: 'Blocos de Corsi (Sequências)', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Memorize a ordem dos blocos espaciais que acendem', type: 'corsi' },
  { id: 17, name: 'Lembre-se dos Objetos', category: 'Memória', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Quais objetos foram mostrados? Toque nos que lembra', type: 'object_recall' },
  { id: 18, name: 'Memória Visual', category: 'Memória', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Veja a imagem e encontre ela entre as opções', type: 'visual_matching' },
  { id: 19, name: 'Pares de Emojis', category: 'Memória', difficulty: 1, time: '5 min', ageRange: '3-7', description: 'Encontre os pares de emojis iguais', type: 'memory' },
  { id: 20, name: 'Memória de Trabalho', category: 'Memória', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Guarde 5 números na memória e repita ao contrário', type: 'tap' },

  { id: 21, name: 'Organize a Fila', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Organize os números de 1 a 6 na ordem correta', type: 'sequence' },
  { id: 22, name: 'Mude de Regra', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Às vezes clique no círculo, às vezes no quadrado — a regra muda!', type: 'tap' },
  { id: 23, name: 'Stroop Avançado', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Cores aparecem escritas em cores diferentes — responda rápido!', type: 'stroop' },
  { id: 24, name: 'Classificação', category: 'Funções Executivas', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Toque apenas nos animais — ignore os objetos', type: 'tap' },
  { id: 25, name: 'Sequência de Passos', category: 'Funções Executivas', difficulty: 1, time: '5 min', ageRange: '4-8', description: 'Ordene os passos de escovar os dentes na sequência certa', type: 'sequence' },
  { id: 26, name: 'Controle de Impulsos', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Toque quando o semáforo ficar verde — espere o sinal!', type: 'tap' },
  { id: 27, name: 'Flexibilidade Mental', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '7-12', description: 'Alternar entre contar vogais e consoantes sem errar', type: 'tap' },
  { id: 28, name: 'Tombe Switch', category: 'Funções Executivas', difficulty: 3, time: '5 min', ageRange: '8-12', description: 'Mude entre regras: às vezes cor, às vezes forma', type: 'tap' },
  { id: 29, name: 'Planejamento', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Encontre o caminho mais curto entre os pontos', type: 'tap' },
  { id: 30, name: 'Memória Operacional', category: 'Funções Executivas', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Guarde o número e Some +3 — teste de memória de trabalho', type: 'tap' },

  { id: 31, name: 'Rimas Básicas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Qual palavra rima com "SOLA"? Toque na resposta', type: 'phonology' },
  { id: 32, name: 'Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Separe a palavra em sílabas: CA-SA = 2 sílabas', type: 'phonology' },
  { id: 33, name: 'Som Inicial', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-6', description: 'Qual letra começa "MAÇÃ"? Toque na letra correta', type: 'phonology' },
  { id: 34, name: 'Som Final', category: 'Consciência Fonológica', difficulty: 2, time: '3 min', ageRange: '5-8', description: 'Qual letra termina "SOL"? Toque na resposta', type: 'phonology' },
  { id: 35, name: 'Contagem de Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Quantas sílabas tem "BOR-BO-CHA"? Toque no número', type: 'phonology' },
  { id: 36, name: 'Troca de Letras', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: 'Troque o M de "MATO" por R — qual palavra fica?', type: 'phonology' },
  { id: 37, name: 'Complete a Rima', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-8', description: '"Peixe ___" — qual palavra completa a rima?', type: 'phonology' },
  { id: 38, name: 'Fonemas', category: 'Consciência Fonológica', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Separe "SOL" em sons individuais: S-O-L', type: 'phonology' },
  { id: 39, name: 'Junte Sílabas', category: 'Consciência Fonológica', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'CA + SO = ? Toque na palavra formada', type: 'phonology' },
  { id: 40, name: 'Fonologia Avançada', category: 'Consciência Fonológica', difficulty: 3, time: '5 min', ageRange: '6-10', description: 'Misto: rimas, sílabas e sons — desafio completo', type: 'phonology' },

  { id: 41, name: 'Soma Simples', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Resolva somas de números de 1 a 20', type: 'math' },
  { id: 42, name: 'Subtração', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '5-8', description: 'Resolva subtrações simples com resultados positivos', type: 'math' },
  { id: 43, name: 'Comparação', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Maior, menor ou igual? Toque no símbolo correto', type: 'compare' },
  { id: 44, name: 'Contagem de Objetos', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Conte quantos frutos aparecem na tela', type: 'tap' },
  { id: 45, name: 'Tabuada', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Pratique multiplicações de 1 a 10', type: 'math' },
  { id: 46, name: 'Problemas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Resolva problemas escritos com operações simples', type: 'math' },
  { id: 47, name: 'Sequência Crescente', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Organize os números na ordem crescente', type: 'sequence' },
  { id: 48, name: 'Frações Visuais', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Qual fração representa a pizza colorida?', type: 'tap' },
  { id: 49, name: 'Formas Geométricas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Identifique: círculo, quadrado, triângulo, retângulo', type: 'tap' },
  { id: 50, name: 'Desafio Matemático', category: 'Matemática', difficulty: 3, time: '7 min', ageRange: '8-12', description: 'Misto: somas, subtrações e multiplicações difíceis', type: 'math' },

  { id: 51, name: 'Emoções no Rosto', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Identifique se a pessoa está feliz, triste ou com raiva', type: 'social' },
  { id: 52, name: 'Empatia', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '4-8', description: 'Como a pessoa se sente? Escolha a resposta certa', type: 'social' },
  { id: 53, name: 'Situações Sociais', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'O que fazer quando alguém está triste na escola?', type: 'social' },
  { id: 54, name: 'Respiração', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Siga o balão: inspire quando crescer, expire quando diminuir', type: 'tap' },
  { id: 55, name: 'Expressão de Sentimentos', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Como VOCÊ se sente agora? Toque na emoção', type: 'social' },
  { id: 56, name: 'Resolução de Conflitos', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Dois amigos brigaram pelo brinquedo — qual a solução pacífica?', type: 'social' },
  { id: 57, name: 'Cooperação', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-7', description: 'Aprenda sobre trabalhar junto e ajudar os amigos', type: 'social' },
  { id: 58, name: 'Paciência', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'Espere a vez sem interromper — exercício de paciência', type: 'tap' },
  { id: 59, name: 'Gratidão', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Pense em 3 coisas pelas quais você é grato hoje', type: 'social' },
  { id: 60, name: 'Autoconhecimento', category: 'Socioemocional', difficulty: 3, time: '7 min', ageRange: '7-12', description: 'Misto: emoções, conflitos e regulação — desafio completo', type: 'social' },
];

/** Sintetizador Nativo de Áudio Clínico (Web Audio API) */
class ClinicalSoundSynthesizer {
  private ctx: AudioContext | null = null;
  enabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jogos_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jogos_sound_enabled', String(this.enabled));
    }
    return this.enabled;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Garante que o contexto de áudio é desbloqueado no primeiro gesto do usuário */
  ensureUnlocked() {
    this.initContext();
  }

  playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playFlip() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.08);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (Tríade Maior agradável)
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      const noteT = t + i * 0.055;
      osc.frequency.setValueAtTime(freq, noteT);
      gain.gain.setValueAtTime(0.22, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + 0.24);
    });
  }

  /** Som especial cristalino de captura de estrela (Arpejo Brilhante) */
  playStarCollect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    // Notas ascendentes brilhantes: E5 (659.25), A5 (880.00), E6 (1318.51)
    const tones = [659.25, 880.00, 1318.51];
    tones.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = i === 2 ? 'sine' : 'triangle';
      const noteT = t + i * 0.06;
      const dur = 0.26;
      osc.frequency.setValueAtTime(freq, noteT);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, noteT + dur);
      gain.gain.setValueAtTime(0.24, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + dur);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + dur);
    });
  }

  playCombo(multiplier: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const baseFreq = Math.min(1080, 480 + multiplier * 65);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, t + 0.14);
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playError() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    // Tom clínico suave de desvio (duplo tom sutil e distinto, sem agredir)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.14);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      const noteT = t + idx * 0.08;
      osc.frequency.setValueAtTime(freq, noteT);
      gain.gain.setValueAtTime(0.24, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + 0.35);
    });
  }

  playCountdown(pitch: number = 440) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playMusicalNote(freq: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }
}


@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in">
      <!-- Header Superior -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">60 Jogos Cognitivos</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
              Pro Suite
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bateria de estimulação neuropsicopedagógica com métricas de tempo de reação, acurácia e parecer técnico clínico.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative w-full sm:w-72">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input class="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl text-xs sm:text-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              placeholder="Buscar por nome ou objetivo..." [(ngModel)]="searchTerm" (input)="filterGames()">
          </div>

          <button (click)="toggleSound()"
            class="p-2.5 rounded-2xl ring-1 transition-all flex items-center justify-center shrink-0"
            [class]="sound.enabled ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 ring-teal-200 dark:ring-teal-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 ring-slate-200 dark:ring-slate-700'"
            [title]="sound.enabled ? 'Som Ativo (Clique para silenciar)' : 'Som Mudo (Clique para ativar)'">
            <span class="material-icons text-xl">{{ sound.enabled ? 'volume_up' : 'volume_off' }}</span>
          </button>
        </div>
      </div>

      <!-- Filtros de Categorias -->
      <div class="flex flex-wrap gap-2 sm:gap-2.5">
        @for (cat of categories; track cat) {
          <button class="px-3.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5"
            [class]="filterCategory() === cat ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-1 ring-teal-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-teal-400/50'"
            (click)="filterCategory.set(cat); filterGames()">
            @if (cat) {
              <span class="material-icons text-sm opacity-80">{{ getCategoryIcon(cat) }}</span>
            }
            {{ cat || 'Todos os Jogos (60)' }}
          </button>
        }
      </div>

      <!-- Grade de Jogos -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        @for (jogo of filteredGames(); track jogo.id) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800/80 overflow-hidden hover:ring-teal-500/50 hover:-translate-y-1 transition-all flex flex-col justify-between group">
            <div>
              <div class="h-20 sm:h-24 flex items-center justify-center relative overflow-hidden" [class]="getCategoryBg(jogo.category)">
                <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <span class="material-icons text-3xl sm:text-4xl opacity-75 group-hover:scale-110 transition-transform duration-300">{{ getCategoryIcon(jogo.category) }}</span>
                <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight backdrop-blur-sm" [class]="getCategoryStyle(jogo.category)">
                  {{ jogo.category }}
                </span>
              </div>
              <div class="p-3.5 sm:p-4">
                <h3 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{{ jogo.name }}</h3>
                <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2.5 line-clamp-2">{{ jogo.description }}</p>

                <div class="flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-xs">
                  <div class="flex items-center">
                    @for (star of [1,2,3]; track star) {
                      <span class="material-icons text-[12px] sm:text-[13px]"
                        [class]="star <= jogo.difficulty ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'">star</span>
                    }
                  </div>
                  <span>·</span>
                  <span class="font-medium text-slate-500 dark:text-slate-400">{{ jogo.ageRange }} anos</span>
                  <span>·</span>
                  <span class="font-medium text-slate-500 dark:text-slate-400">{{ jogo.time }}</span>
                </div>
              </div>
            </div>

            <div class="p-3.5 sm:p-4 pt-0">
              <button class="w-full py-2 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                (click)="startGame(jogo)">
                <span class="material-icons text-base">play_arrow</span> Iniciar Sessão
              </button>
            </div>
          </div>
        }
      </div>

      @if (filteredGames().length === 0) {
        <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800">
          <span class="material-icons text-6xl text-slate-300 dark:text-slate-600">sports_esports</span>
          <p class="text-slate-600 dark:text-slate-400 font-semibold mt-3">Nenhum jogo encontrado</p>
          <p class="text-xs text-slate-400">Tente buscar por outro termo ou categoria</p>
        </div>
      }
    </div>

    <!-- Modal Interativo do Jogo -->
    @if (showGameModal()) {
      <!-- Bloqueio no modo retrato para aparelhos móveis -->
      @if (isPortraitMobile()) {
        <div class="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none animate-in">
          <div class="size-20 rounded-3xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-teal-500/20">
            <span class="material-icons text-5xl">screen_rotation</span>
          </div>
          <h3 class="text-2xl font-black mb-2 text-white">Gire seu aparelho</h3>
          <p class="text-slate-300 text-sm max-w-xs mb-8 leading-relaxed">
            Para garantir a precisão dos testes neurocognitivos e resposta motora rápida, por favor <strong class="text-white">vire o celular na horizontal (modo paisagem)</strong>.
          </p>
          <button (click)="closeGame()" class="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95">
            Cancelar e Fechar
          </button>
        </div>
      }

      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4" (click)="closeGame()">
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full sm:max-w-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[96vh] overflow-y-auto" (click)="$event.stopPropagation()">
          
          <!-- Durante a partida (HUD Cockpit Clínico) -->
          @if (!gameFinished()) {
            <!-- Barra Superior do Cockpit -->
            <div class="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">{{ currentGame()?.name }}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold" [class]="getCategoryStyle(currentGame()?.category || '')">
                    {{ currentGame()?.category }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Faixa: {{ currentGame()?.ageRange }} anos · Domínio: {{ getCognitiveDomain(currentGame()?.category || '') }}</p>
              </div>

              <div class="flex items-center gap-3 sm:gap-4 shrink-0 ml-3">
                <!-- Tempo -->
                <div class="text-center bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tempo</p>
                  <p class="text-xs sm:text-sm font-black text-teal-600 dark:text-teal-400 font-mono">{{ formatTime(gameTimer()) }}</p>
                </div>

                <!-- Pontuação & Combo -->
                <div class="text-center bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pontos</p>
                  <p class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {{ gameScore() }}
                    @if (gameMetrics.streak >= 2) {
                      <span class="text-[9px] text-amber-500 font-bold ml-0.5">x{{ gameMetrics.streak }}</span>
                    }
                  </p>
                </div>

                <!-- Precisão / Acurácia em Tempo Real -->
                <div class="hidden sm:block text-center bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Precisão</p>
                  <p class="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 font-mono">{{ currentAccuracy() }}%</p>
                </div>

                <!-- Som Toggle -->
                <button (click)="toggleSound()" class="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" [title]="sound.enabled ? 'Mutar' : 'Desmutar'">
                  <span class="material-icons text-lg">{{ sound.enabled ? 'volume_up' : 'volume_off' }}</span>
                </button>

                <!-- Fechar -->
                <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" (click)="closeGame()">
                  <span class="material-icons text-xl">close</span>
                </button>
              </div>
            </div>

            <!-- Área Central do Canvas / Jogo -->
            <div class="p-3 sm:p-5 relative">
              <div class="bg-slate-950 rounded-2xl p-2 sm:p-4 min-h-[240px] sm:min-h-[320px] flex flex-col items-center justify-center relative overflow-hidden shadow-inner ring-1 ring-slate-800">
                
                <!-- Pré-Jogo: Instruções e Iniciar -->
                @if (!gameStarted() && !isCountingDown()) {
                  <div class="text-center p-4 sm:p-6 max-w-md animate-in">
                    <div class="size-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
                      <span class="material-icons text-3xl">{{ getCategoryIcon(currentGame()?.category || '') }}</span>
                    </div>
                    <h4 class="text-lg sm:text-xl font-black text-white mb-2">{{ currentGame()?.name }}</h4>
                    <p class="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">{{ currentGame()?.description }}</p>
                    
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 mb-6">
                      <span class="material-icons text-sm text-teal-400">psychology</span>
                      Estimula: <strong class="text-slate-200">{{ getCognitiveDomain(currentGame()?.category || '') }}</strong>
                    </div>

                    <div>
                      <button class="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/30 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                        (click)="startCountdown()">
                        <span class="material-icons">play_arrow</span> Começar Atividade
                      </button>
                    </div>
                  </div>
                }

                <!-- Contagem Regressiva 3.. 2.. 1.. FOCO! -->
                @if (isCountingDown()) {
                  <div class="text-center animate-in select-none">
                    <p class="text-xs uppercase font-extrabold tracking-widest text-teal-400 mb-3">Preparar Paciente</p>
                    <div class="text-6xl sm:text-7xl font-black text-white font-mono animate-pulse">
                      {{ countdownValue() }}
                    </div>
                  </div>
                }

                <!-- Canvas Ativo -->
                <div [class.hidden]="!gameStarted()" class="flex flex-col items-center">
                  <canvas #gameCanvas class="rounded-xl shadow-2xl max-w-[500px] cursor-pointer" style="touch-action: none; -webkit-user-select: none; user-select: none;"></canvas>
                  <p class="text-xs sm:text-sm font-semibold text-slate-300 mt-3 text-center px-2 min-h-[20px] flex items-center gap-1.5">
                    <span class="material-icons text-sm text-teal-400">info</span>
                    {{ gameInstruction() }}
                  </p>
                </div>

              </div>
            </div>
          } @else {
            <!-- Relatório e Painel Clínico Pós-Jogo -->
            <div class="p-5 sm:p-7 animate-in">
              <!-- Topo com Troféu e Classificação Clínica -->
              <div class="text-center mb-6">
                <div class="size-16 bg-gradient-to-tr from-teal-600 to-emerald-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/20">
                  <span class="material-icons text-3xl">psychology</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sessão Cognitiva Concluída</h3>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ currentGame()?.name }} · {{ currentGame()?.category }}</p>

                <!-- Badge de Desempenho Clínico -->
                <div class="mt-3">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm"
                    [class]="clinicalRating().badgeClass">
                    <span class="material-icons text-sm">{{ clinicalRating().icon }}</span>
                    {{ clinicalRating().label }}
                  </span>
                </div>
              </div>

              <!-- Grid de 4 Métricas Neurocognitivas Reais -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                <!-- Precisão / Acurácia -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acurácia Geral</p>
                  <p class="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">{{ accuracyPercentage() }}%</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">{{ gameMetrics.correctHits }}/{{ gameMetrics.totalAttempts }} acertos</p>
                </div>

                <!-- Tempo Médio de Reação (TRm) -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tempo de Reação (TRm)</p>
                  <p class="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">{{ meanReactionTimeMs() }} <span class="text-xs font-semibold">ms</span></p>
                  <p class="text-[9px] text-slate-400 mt-0.5">velocidade motora</p>
                </div>

                <!-- Maior Sequência / Estabilidade -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Maior Combo</p>
                  <p class="text-xl sm:text-2xl font-black text-amber-500 font-mono mt-0.5">{{ gameMetrics.maxStreak }}x</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">atenção contínua</p>
                </div>

                <!-- Pontuação Final & Tempo -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pontos / Tempo</p>
                  <p class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{{ gameScore() }}</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">em {{ formatTime(gameTimer()) }}</p>
                </div>
              </div>

              <!-- Integração Clínica: Seleção de Paciente & Parecer Técnico -->
              <div class="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-teal-600 dark:text-teal-400 text-lg">description</span>
                    <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Parecer Neuropsicopedagógico Automático</h4>
                  </div>

                  <!-- Seletor do Paciente da Clínica -->
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-400 font-medium shrink-0">Paciente:</span>
                    <select [(ngModel)]="selectedPatientId" (change)="updateClinicalReport()"
                      class="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold ring-1 ring-slate-200 dark:ring-slate-700 outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200">
                      <option value="">-- Selecionar Paciente --</option>
                      @for (p of patients(); track p.id) {
                        <option [value]="p.id">{{ p.nome }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Textarea com Parecer Clínico Pronto para Prontuário -->
                <textarea [(ngModel)]="clinicalReportText" rows="3"
                  class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs sm:text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 dark:text-slate-200 resize-none leading-relaxed"
                  placeholder="Parecer gerado automaticamente..."></textarea>

                <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p class="text-[10px] text-slate-400">
                    <span class="material-icons text-[12px] align-middle text-teal-500 mr-0.5">verified</span>
                    Texto padronizado para evolução clínica e devolutiva aos pais.
                  </p>
                  <div class="flex items-center gap-2">
                    <button (click)="copyClinicalReport()"
                      class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700 transition-all flex items-center gap-1">
                      <span class="material-icons text-sm text-teal-600 dark:text-teal-400">content_copy</span> Copiar Parecer
                    </button>
                    <button (click)="saveToPatientHistory()"
                      [disabled]="!selectedPatientId"
                      class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                      <span class="material-icons text-sm">save</span> Salvar no Histórico
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botões Finais de Ação -->
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button class="w-full sm:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  (click)="startGame(currentGame()!)">
                  <span class="material-icons text-base">replay</span> Jogar Novamente
                </button>
                <button class="w-full sm:w-auto px-7 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  (click)="closeGame()">
                  <span class="material-icons text-base">check</span> Finalizar
                </button>
              </div>

            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class JogosComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private pacientesService = inject(PacientesService);
  private toast = inject(ToastService);

  sound = new ClinicalSoundSynthesizer();

  searchTerm = '';
  filterCategory = signal('');
  categories = ['', 'Atenção', 'Memória', 'Funções Executivas', 'Consciência Fonológica', 'Matemática', 'Socioemocional'];
  allGames = JOGOS_DATA;
  filteredGames = signal<Jogo[]>(JOGOS_DATA);
  showGameModal = signal(false);
  isPortraitMobile = signal(false);
  currentGame = signal<Jogo | null>(null);
  gameStarted = signal(false);
  gameFinished = signal(false);
  gameScore = signal(0);
  gameTimer = signal(0);
  gameInstruction = signal('');

  // Countdown pré-jogo
  isCountingDown = signal(false);
  countdownValue = signal<string | number>(3);

  // Lista de Pacientes da Clínica
  patients = signal<any[]>([]);
  selectedPatientId = '';
  clinicalReportText = '';

  // Métricas neurocognitivas
  gameMetrics = {
    totalAttempts: 0,
    correctHits: 0,
    streak: 0,
    maxStreak: 0,
    reactionTimes: [] as number[],
    lastStimulusTime: 0
  };

  currentAccuracy = signal(100);

  private timerInterval: any;
  private countdownInterval: any;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private gameData: any = {};
  private canvasPointerHandler: ((e: PointerEvent) => void) | null = null;
  private canvasTouchHandler: ((e: TouchEvent) => void) | null = null;
  private canvasClickHandler: ((e: MouseEvent) => void) | null = null;

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.pacientesService.list().subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.patients.set(list);
      },
      error: () => {}
    });
  }

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize() {
    this.checkOrientation();
    if (this.showGameModal() && this.gameStarted() && !this.isPortraitMobile()) {
      setTimeout(() => this.setupCanvas(), 100);
    }
  }

  ngOnDestroy() { 
    this.clearTimers(); 
    this.removeCanvasListeners(); 
    this.unlockOrientation();
  }

  toggleSound() {
    const isEnabled = this.sound.toggle();
    if (isEnabled) {
      this.sound.playClick();
      this.toast.show('Som dos jogos ativado', 'info');
    } else {
      this.toast.show('Som dos jogos silenciado', 'info');
    }
  }

  async lockOrientation() {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {}
  }

  unlockOrientation() {
    try {
      if (screen.orientation && 'unlock' in screen.orientation) {
        screen.orientation.unlock();
      }
    } catch {}
  }

  checkOrientation() {
    if (!this.showGameModal()) {
      this.isPortraitMobile.set(false);
      return;
    }
    const isMobile = window.innerWidth <= 900 || window.innerHeight <= 600 || ('ontouchstart' in window);
    const isPortrait = window.innerHeight > window.innerWidth;
    this.isPortraitMobile.set(isMobile && isPortrait);
  }

  removeCanvasListeners() {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      if (this.canvasPointerHandler) {
        canvas.removeEventListener('pointerdown', this.canvasPointerHandler);
        this.canvasPointerHandler = null;
      }
      if (this.canvasTouchHandler) {
        canvas.removeEventListener('touchstart', this.canvasTouchHandler);
        this.canvasTouchHandler = null;
      }
      if (this.canvasClickHandler) {
        canvas.removeEventListener('click', this.canvasClickHandler);
        this.canvasClickHandler = null;
      }
    }
  }

  getPointerPos(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const logicalW = this.gameData.logicalW || 500;
    const logicalH = this.gameData.logicalH || 300;
    const scaleX = rect.width > 0 ? logicalW / rect.width : 1;
    const scaleY = rect.height > 0 ? logicalH / rect.height : 1;
    return {
      x: Math.max(0, Math.min(logicalW, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(logicalH, (clientY - rect.top) * scaleY))
    };
  }

  setCanvasHandler(canvas: HTMLCanvasElement, handler: (x: number, y: number) => void) {
    this.removeCanvasListeners();
    let lastHandledTime = 0;

    const processPointer = (clientX: number, clientY: number, e: Event) => {
      this.sound.ensureUnlocked();
      const now = Date.now();
      if (now - lastHandledTime < 50) return;
      lastHandledTime = now;

      if (e.cancelable) {
        e.preventDefault();
      }
      const pos = this.getPointerPos(canvas, clientX, clientY);
      handler(pos.x, pos.y);
    };

    if (window.PointerEvent) {
      this.canvasPointerHandler = (e: PointerEvent) => processPointer(e.clientX, e.clientY, e);
      canvas.addEventListener('pointerdown', this.canvasPointerHandler, { passive: false });
    } else {
      this.canvasTouchHandler = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
          processPointer(e.touches[0].clientX, e.touches[0].clientY, e);
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          processPointer(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
        }
      };
      this.canvasClickHandler = (e: MouseEvent) => processPointer(e.clientX, e.clientY, e);
      canvas.addEventListener('touchstart', this.canvasTouchHandler, { passive: false });
      canvas.addEventListener('click', this.canvasClickHandler, { passive: false });
    }
  }

  filterGames() {
    const term = this.searchTerm.toLowerCase();
    const cat = this.filterCategory();
    this.filteredGames.set(
      this.allGames.filter(g => {
        const matchSearch = !term || g.name.toLowerCase().includes(term) || g.category.toLowerCase().includes(term) || g.description.toLowerCase().includes(term);
        const matchCat = !cat || g.category === cat;
        return matchSearch && matchCat;
      })
    );
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Atenção': 'visibility',
      'Memória': 'memory',
      'Funções Executivas': 'psychology',
      'Consciência Fonológica': 'record_voice_over',
      'Matemática': 'calculate',
      'Socioemocional': 'favorite',
    };
    return icons[category] || 'sports_esports';
  }

  getCategoryBg(category: string): string {
    const bgs: Record<string, string> = {
      'Atenção': 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
      'Memória': 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      'Funções Executivas': 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',
      'Consciência Fonológica': 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
      'Matemática': 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      'Socioemocional': 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    };
    return bgs[category] || 'bg-slate-500/15 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
  }

  getCategoryStyle(category: string): string {
    const styles: Record<string, string> = {
      'Atenção': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      'Memória': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      'Funções Executivas': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      'Consciência Fonológica': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      'Matemática': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      'Socioemocional': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    };
    return styles[category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }

  getCognitiveDomain(category: string): string {
    switch (category) {
      case 'Atenção': return 'Atenção Seletiva e Sustentada';
      case 'Memória': return 'Memória Operacional e Resgate Imediato';
      case 'Funções Executivas': return 'Controle Inibitório e Flexibilidade Cognitiva';
      case 'Consciência Fonológica': return 'Processamento Fonológico e Análise Auditiva';
      case 'Matemática': return 'Raciocínio Lógico-Matemático e Numeração';
      case 'Socioemocional': return 'Reconhecimento Emocional e Teoria da Mente';
      default: return 'Estimulação Neurocognitiva Global';
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Métricas
  recordAttempt(isCorrect: boolean, suppressSound: boolean = false) {
    this.gameMetrics.totalAttempts++;
    const now = Date.now();
    if (this.gameMetrics.lastStimulusTime > 0) {
      const rt = now - this.gameMetrics.lastStimulusTime;
      if (rt > 50 && rt < 30000) {
        this.gameMetrics.reactionTimes.push(rt);
      }
    }
    this.gameMetrics.lastStimulusTime = now;

    if (isCorrect) {
      this.gameMetrics.correctHits++;
      this.gameMetrics.streak++;
      if (this.gameMetrics.streak > this.gameMetrics.maxStreak) {
        this.gameMetrics.maxStreak = this.gameMetrics.streak;
      }
      if (!suppressSound) {
        if (this.gameMetrics.streak >= 2) {
          this.sound.playCombo(this.gameMetrics.streak);
        } else {
          this.sound.playSuccess();
        }
      }
    } else {
      this.gameMetrics.streak = 0;
      if (!suppressSound) {
        this.sound.playError();
      }
    }

    const acc = Math.round((this.gameMetrics.correctHits / Math.max(1, this.gameMetrics.totalAttempts)) * 100);
    this.currentAccuracy.set(acc);
  }

  accuracyPercentage(): number {
    if (this.gameMetrics.totalAttempts === 0) return 100;
    return Math.round((this.gameMetrics.correctHits / this.gameMetrics.totalAttempts) * 100);
  }

  meanReactionTimeMs(): number {
    if (this.gameMetrics.reactionTimes.length === 0) return 420;
    const sum = this.gameMetrics.reactionTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.gameMetrics.reactionTimes.length);
  }

  clinicalRating() {
    const acc = this.accuracyPercentage();
    if (acc >= 90) {
      return {
        label: 'Desempenho Superior / Excelente',
        icon: 'stars',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
        desc: 'Excelente precisão, controle de impulsos e retenção rápida.'
      };
    }
    if (acc >= 75) {
      return {
        label: 'Desempenho Esperado / Adequado',
        icon: 'check_circle',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700',
        desc: 'Boa assertividade dentro do padrão esperado para a etapa desenvolvimental.'
      };
    }
    if (acc >= 55) {
      return {
        label: 'Atenção / Desempenho Moderado',
        icon: 'trending_up',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
        desc: 'Apresentou oscilações atencionais ou hesitação na tomada de decisão.'
      };
    }
    return {
      label: 'Necessita Estimulação / Suporte',
      icon: 'priority_high',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
      desc: 'Dificuldade acentuada na tarefa; recomendado fracionamento em passos menores.'
    };
  }

  updateClinicalReport() {
    const jogo = this.currentGame();
    const pat = this.patients().find(p => p.id === this.selectedPatientId);
    const patName = pat ? pat.nome : 'O(a) paciente';
    const acc = this.accuracyPercentage();
    const trm = this.meanReactionTimeMs();
    const dom = this.getCognitiveDomain(jogo?.category || '');
    const rating = this.clinicalRating().label;
    const now = new Date().toLocaleDateString('pt-BR');

    this.clinicalReportText = `[EVOLUÇÃO CLÍNICA - ${now}]\n${patName} realizou a atividade de estimulação "${jogo?.name}" (${jogo?.category}), com foco em ${dom}.\n` +
      `• Acurácia Global: ${acc}% (${this.gameMetrics.correctHits}/${this.gameMetrics.totalAttempts} acertos)\n` +
      `• Tempo Médio de Reação: ${trm} ms\n` +
      `• Sequência Máxima de Foco Contínuo: ${this.gameMetrics.maxStreak} acertos consecutivos\n` +
      `• Classificação: ${rating}.\n` +
      `Observações: Demonstrou engajamento na tarefa, com ${acc >= 75 ? 'boa' : 'necessidade de reforço na'} resposta ao estímulo distrator e regulação motora.`;
  }

  copyClinicalReport() {
    if (!this.clinicalReportText) {
      this.updateClinicalReport();
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.clinicalReportText).then(() => {
        this.sound.playClick();
        this.toast.success('Parecer clínico copiado para a área de transferência!');
      });
    }
  }

  saveToPatientHistory() {
    if (!this.selectedPatientId) {
      this.toast.error('Selecione um paciente para registrar a atividade.');
      return;
    }
    const pat = this.patients().find(p => p.id === this.selectedPatientId);
    const storageKey = `paciente_jogos_${this.selectedPatientId}`;
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    history.unshift({
      date: new Date().toISOString(),
      gameId: this.currentGame()?.id,
      gameName: this.currentGame()?.name,
      category: this.currentGame()?.category,
      score: this.gameScore(),
      accuracy: this.accuracyPercentage(),
      reactionTimeMs: this.meanReactionTimeMs(),
      report: this.clinicalReportText
    });
    localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 50)));
    this.sound.playSuccess();
    this.toast.success(`Registro da atividade salvo no histórico de ${pat?.nome || 'paciente'}!`);
  }

  startGame(jogo: Jogo) {
    this.closeGame();
    setTimeout(() => {
      this.currentGame.set(jogo);
      this.gameScore.set(0);
      this.gameTimer.set(0);
      this.gameStarted.set(false);
      this.gameFinished.set(false);
      this.isCountingDown.set(false);
      this.showGameModal.set(true);

      this.gameMetrics = {
        totalAttempts: 0,
        correctHits: 0,
        streak: 0,
        maxStreak: 0,
        reactionTimes: [],
        lastStimulusTime: 0
      };
      this.currentAccuracy.set(100);

      this.lockOrientation();
      this.checkOrientation();
    }, 50);
  }

  startCountdown() {
    this.isCountingDown.set(true);
    let count = 3;
    this.countdownValue.set(count);
    this.sound.playCountdown(440);

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownValue.set(count);
        this.sound.playCountdown(440);
      } else if (count === 0) {
        this.countdownValue.set('FOCO!');
        this.sound.playCountdown(880);
      } else {
        clearInterval(this.countdownInterval);
        this.isCountingDown.set(false);
        this.initGame();
      }
    }, 800);
  }

  initGame() {
    this.gameStarted.set(true);
    this.startTimer();
    this.gameMetrics.lastStimulusTime = Date.now();
    setTimeout(() => this.setupCanvas(), 100);
  }

  startTimer() {
    this.clearTimers();
    this.timerInterval = setInterval(() => {
      this.gameTimer.update(t => t + 1);
    }, 1000);
  }

  clearTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.gameData?.activeTimeout) {
      clearTimeout(this.gameData.activeTimeout);
      this.gameData.activeTimeout = null;
    }
    if (this.gameData?.activeAnimFrame) {
      cancelAnimationFrame(this.gameData.activeAnimFrame);
      this.gameData.activeAnimFrame = null;
    }
  }

  finishGame() {
    this.clearTimers();
    const jogo = this.currentGame();
    if (jogo) {
      const scores = JSON.parse(localStorage.getItem('jogos_scores') || '{}');
      if (!scores[jogo.id] || this.gameScore() > scores[jogo.id]) {
        scores[jogo.id] = this.gameScore();
        localStorage.setItem('jogos_scores', JSON.stringify(scores));
      }
    }
    this.gameStarted.set(false);
    this.gameFinished.set(true);
    this.sound.playVictory();
    this.updateClinicalReport();
  }

  closeGame() {
    this.clearTimers();
    this.removeCanvasListeners();
    this.unlockOrientation();
    this.showGameModal.set(false);
    this.isPortraitMobile.set(false);
    this.currentGame.set(null);
    this.gameStarted.set(false);
    this.gameFinished.set(false);
    this.isCountingDown.set(false);
  }

  // --- MOTORES DE JOGO EM CANVAS ---

  setupCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth - 24 : 468;
    const maxAvailableH = window.innerHeight ? Math.max(180, window.innerHeight - 220) : 300;
    let logicalW = Math.min(500, containerWidth);
    let logicalH = Math.round(logicalW * 0.6);
    if (logicalH > maxAvailableH) {
      logicalH = maxAvailableH;
      logicalW = Math.round(logicalH / 0.6);
    }
    const dpr = window.devicePixelRatio || 1;

    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';

    this.canvasCtx = canvas.getContext('2d');
    if (this.canvasCtx) {
      this.canvasCtx.scale(dpr, dpr);
    }

    this.gameData.logicalW = logicalW;
    this.gameData.logicalH = logicalH;
    this.gameData.dpr = dpr;

    this.removeCanvasListeners();

    const jogo = this.currentGame();
    if (!jogo || !this.canvasCtx) return;
    switch (jogo.type) {
      case 'memory': this.setupMemoryGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'math': this.setupMathGame(canvas, logicalW, logicalH); break;
      case 'sequence': 
        if (jogo.id === 8) {
          this.setupNumberSequenceGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 16) {
          this.setupCorsiGame(canvas, logicalW, logicalH);
        } else {
          this.setupSequenceGame(canvas, logicalW, logicalH);
        }
        break;
      case 'number_sequence': this.setupNumberSequenceGame(canvas, logicalW, logicalH); break;
      case 'corsi': this.setupCorsiGame(canvas, logicalW, logicalH); break;
      case 'object_recall': this.setupObjectRecallGame(canvas, logicalW, logicalH); break;
      case 'visual_matching': this.setupVisualMatchingGame(canvas, logicalW, logicalH); break;
      case 'attention': this.setupAttentionGame(canvas, logicalW, logicalH); break;
      case 'phonology': this.setupPhonologyGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'social': this.setupSocialGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'stroop': this.setupStroopGame(canvas, logicalW, logicalH); break;
      case 'tracking': this.setupVisualTrackingGame(canvas, logicalW, logicalH); break;
      case 'tap': 
        if (jogo.id === 6) {
          this.setupVisualTrackingGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 17) {
          this.setupObjectRecallGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 18) {
          this.setupVisualMatchingGame(canvas, logicalW, logicalH);
        } else {
          this.setupTapGame(canvas, logicalW, logicalH, jogo.id);
        }
        break;
      case 'compare': this.setupCompareGame(canvas, logicalW, logicalH); break;
      default: this.setupMemoryGame(canvas, logicalW, logicalH, jogo.id);
    }
  }

  // 1. JOGO DA MEMÓRIA
  setupMemoryGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const EMOJI_SETS: Record<number, string[]> = {
      1: ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'],
      9: ['⭐','🌙','☀️','🌈','❄️','🔥','💧','🌸'],
      11: ['🍎','🍌','🍇','🍊','🍓','🍋','🥝','🍒'],
      12: ['🐶','🐱','🦁','🐰','🦊','🐻','🐼','🐵'],
      13: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'],
      14: ['⭐','🔷','🔶','🔺','⬛','⚪','🔻','💎'],
      15: ['🚀','🌟','👑','💎','🏆','🎯','🎈','🍀'],
      19: ['😀','😎','🤩','🥳','😴','🤔','😢','🤠'],
    };
    const set = EMOJI_SETS[gameId] || EMOJI_SETS[1];
    const numPairs = gameId === 15 ? 8 : 6;
    const pairs = set.slice(0, numPairs);
    const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    const cols = 4;
    const rows = numPairs <= 6 ? 3 : 4;
    this.gameData = { ...this.gameData, cards, flipped: [], matched: [], attempts: 0 };
    const w = W / cols, h = H / rows;
    const fontSize = Math.max(18, Math.min(32, Math.min(w, h) * 0.48));

    this.gameInstruction.set('Toque nas cartas para revelar e memorizar os pares');

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      cards.forEach((sym: string, i: number) => {
        const x = (i % cols) * w, y = Math.floor(i / cols) * h;
        const isFlipped = this.gameData.flipped.includes(i);
        const isMatched = this.gameData.matched.includes(i);
        const cx = x + 5, cy = y + 5, cw = w - 10, ch = h - 10;

        if (isMatched) {
          // Carta combinada com sucesso
          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cx, cy, cw, ch, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sym, cx + cw / 2, cy + ch / 2);

          // Selo discreto de acerto
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(cx + cw - 10, cy + 10, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (isFlipped) {
          // Carta virada para visualização
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(cx, cy, cw, ch, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sym, cx + cw / 2, cy + ch / 2);
        } else {
          // Verso da carta elegante (Gradiente Dark Slate / Cyan)
          const grad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#1e293b');
          ctx.fillStyle = grad;
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cx, cy, cw, ch, 12);
          ctx.fill();
          ctx.stroke();

          // Padrão geométrico central
          ctx.fillStyle = '#0d9488';
          ctx.beginPath();
          ctx.arc(cx + cw / 2, cy + ch / 2, Math.min(10, cw * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    draw();

    this.setCanvasHandler(canvas, (mx, my) => {
      const col = Math.floor(mx / w);
      const row = Math.floor(my / h);
      const idx = row * cols + col;
      if (idx < 0 || idx >= cards.length || this.gameData.flipped.includes(idx) || this.gameData.matched.includes(idx)) return;
      if (this.gameData.flipped.length >= 2) return;

      this.sound.playFlip();
      this.gameData.flipped.push(idx);
      draw();

      if (this.gameData.flipped.length === 2) {
        this.gameData.attempts++;
        const [a, b] = this.gameData.flipped;
        const match = cards[a] === cards[b];
        this.recordAttempt(match);

        if (match) {
          this.gameData.matched.push(a, b);
          this.gameScore.update(s => s + 15);
          this.gameData.flipped = [];
          draw();
          if (this.gameData.matched.length === cards.length) {
            this.gameScore.update(s => s + Math.max(0, 60 - this.gameData.attempts * 2));
            setTimeout(() => this.finishGame(), 500);
          }
        } else {
          setTimeout(() => {
            this.gameData.flipped = [];
            draw();
          }, 700);
        }
      }
    });
  }

  // 2. STROOP (CONTROLE INIBITÓRIO)
  setupStroopGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const colors = ['#ef4444', '#0284c7', '#10b981', '#f59e0b', '#0f766e'];
    const colorNames = ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO', 'TURQUESA'];
    let questionIndex = 0;
    const maxQuestions = 10;
    let isTransitioning = false;

    const showQuestion = () => {
      isTransitioning = false;
      if (questionIndex >= maxQuestions) {
        this.finishGame();
        return;
      }
      questionIndex++;
      const wordIdx = Math.floor(Math.random() * colorNames.length);
      let colorIdx = Math.floor(Math.random() * colors.length);
      while (colorIdx === wordIdx) colorIdx = Math.floor(Math.random() * colors.length);
      const answerColor = colors[colorIdx];

      ctx.clearRect(0, 0, W, H);

      // Topo instrução
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Toque na COR da tinta, ignore a palavra escrita!', W / 2, H * 0.16);

      // Palavra Estímulo Central
      ctx.fillStyle = colors[colorIdx];
      const wordFontSize = Math.max(34, Math.min(50, W * 0.09));
      ctx.font = `900 ${wordFontSize}px sans-serif`;
      ctx.fillText(colorNames[wordIdx], W / 2, H * 0.42);

      // Botões de Resposta
      const bw = Math.min(84, (W - 50) / colors.length);
      const bh = 48;
      const startX = (W - colors.length * (bw + 8)) / 2;
      const startY = H * 0.62;

      colors.forEach((c, i) => {
        const x = startX + i * (bw + 8);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(x, startY, bw, bh, 14);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(colorNames[i], x + bw / 2, startY + bh / 2);
      });

      this.gameInstruction.set(`Desafio ${questionIndex}/${maxQuestions} · Qual é a cor da tinta?`);

      this.setCanvasHandler(canvas, (mx, my) => {
        if (isTransitioning) return;
        colors.forEach((c, i) => {
          const x = startX + i * (bw + 8);
          if (mx >= x && mx <= x + bw && my >= startY && my <= startY + bh) {
            isTransitioning = true;
            const correct = c === answerColor;
            this.recordAttempt(correct);
            if (correct) {
              this.gameScore.update(s => s + 10);
            }
            setTimeout(showQuestion, 250);
          }
        });
      });
    };

    showQuestion();
  }

  // 3. MATEMÁTICA CLÍNICA
  setupMathGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    let currentQ = 0;
    const totalQ = 8;
    let a = 0, b = 0, op = '+', answer = 0;
    let input = '';
    const buttons = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];

    const newQuestion = () => {
      if (currentQ >= totalQ) {
        this.finishGame();
        return;
      }
      currentQ++;
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '-' && a < b) [a, b] = [b, a];
      answer = op === '+' ? a + b : a - b;
      input = '';
      this.gameInstruction.set(`Problema ${currentQ}/${totalQ}: Resolva o cálculo`);
      draw();
    };

    const bw = Math.min(68, (W - 120) / 4);
    const bh = 42;
    const startX = (W - (bw * 4 + 10 * 3)) / 2;
    const startY = H * 0.50;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Caixa do Cálculo
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 130, H * 0.08, 260, 90, 16);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${a} ${op} ${b} =`, W / 2, H * 0.18);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(input ? input : '_', W / 2, H * 0.32);

      // Teclado
      buttons.forEach((btn, i) => {
        const x = startX + (i % 4) * (bw + 10);
        const y = startY + Math.floor(i / 4) * (bh + 8);
        ctx.fillStyle = btn === 'OK' ? '#0d9488' : btn === '⌫' ? '#334155' : '#1e293b';
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn, x + bw / 2, y + bh / 2);
      });
    };

    newQuestion();

    this.setCanvasHandler(canvas, (mx, my) => {
      buttons.forEach((btn, i) => {
        const x = startX + (i % 4) * (bw + 10);
        const y = startY + Math.floor(i / 4) * (bh + 8);
        if (mx >= x && mx <= x + bw && my >= y && my <= y + bh) {
          this.sound.playClick();
          if (btn === '⌫') {
            input = input.slice(0, -1);
            draw();
          } else if (btn === 'OK') {
            if (input.length === 0) return;
            const correct = parseInt(input) === answer;
            this.recordAttempt(correct);
            if (correct) {
              this.gameScore.update(s => s + 12);
            }
            newQuestion();
          } else {
            if (input.length < 3) {
              input += btn;
              draw();
            }
          }
        }
      });
    });
  }

  // 4. ATENÇÃO E FOCO VISUAL (CAÇA À ESTRELA)
  setupAttentionGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    interface AttentionShape {
      x: number;
      y: number;
      isTarget: boolean;
      errorFlash?: boolean;
    }
    let shapes: AttentionShape[] = [];
    const totalRounds = 10;
    let roundsDone = 0;
    const radius = Math.max(20, Math.min(28, W * 0.052));
    let isTransitioning = false;
    let animFrameId: number | null = null;

    const renderBoard = () => {
      ctx.clearRect(0, 0, W, H);

      shapes.forEach((s) => {
        if (s.isTarget) {
          // Efeito de resplendor externo (Glow / Halo de Foco)
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.fill();

          // Anel de foco estelar
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();

          // Círculo central da estrela
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Estrela central brilhante
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(16, radius * 0.9)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', s.x, s.y + 0.5);
        } else {
          // Distratores (Círculos neutros com borda sutil ou flash de erro)
          ctx.fillStyle = s.errorFlash ? '#451a1a' : '#1e293b';
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius - 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = s.errorFlash ? '#ef4444' : '#334155';
          ctx.lineWidth = s.errorFlash ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, radius - 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    const animateCelebration = (centerX: number, centerY: number, onComplete: () => void) => {
      const startTime = performance.now();
      const duration = 240;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        renderBoard();

        // Onda de choque / anel de energia estelar
        const waveRadius = radius + progress * 32;
        const alpha = Math.max(0, 1 - progress);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 3 * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Pequenas partículas de brilho estelar saindo em 6 direções
        const particleDist = progress * 28;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = centerX + Math.cos(angle) * (radius + particleDist);
          const py = centerY + Math.sin(angle) * (radius + particleDist);
          ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          animFrameId = null;
          onComplete();
        }
      };

      animFrameId = requestAnimationFrame(step);
    };

    const newRound = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      isTransitioning = false;

      if (roundsDone >= totalRounds) {
        this.finishGame();
        return;
      }
      roundsDone++;

      // Geração de formas garantindo distância mínima (Sem sobreposição!)
      const shapeCount = 8;
      const minDistance = radius * 2.8;
      const paddingX = radius + 24;
      const paddingY = radius + 24;
      const generated: AttentionShape[] = [];

      for (let i = 0; i < shapeCount; i++) {
        let placed = false;
        let attempts = 0;
        let x = 0;
        let y = 0;

        while (!placed && attempts < 90) {
          attempts++;
          x = Math.random() * (W - paddingX * 2) + paddingX;
          y = Math.random() * (H - paddingY * 2) + paddingY;
          const overlap = generated.some(s => Math.hypot(s.x - x, s.y - y) < minDistance);
          if (!overlap) {
            placed = true;
          }
        }
        if (!placed) {
          // Fallback seguro em telas menores
          x = Math.random() * (W - paddingX * 2) + paddingX;
          y = Math.random() * (H - paddingY * 2) + paddingY;
        }
        generated.push({ x, y, isTarget: false });
      }

      const targetIdx = Math.floor(Math.random() * generated.length);
      generated[targetIdx].isTarget = true;
      shapes = generated;

      renderBoard();
      this.gameInstruction.set(`Rodada ${roundsDone}/${totalRounds} · Toque rápido na ESTRELA AZUL!`);
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;

      // 1. PRIORIDADE MÁXIMA AO ALVO (ESTRELA) com raio de toque generoso
      const targetShape = shapes.find(s => s.isTarget);
      if (targetShape) {
        const distTarget = Math.hypot(mx - targetShape.x, my - targetShape.y);
        const targetHitRadius = Math.max(radius + 16, 36);

        if (distTarget <= targetHitRadius) {
          isTransitioning = true;
          this.sound.playStarCollect();
          this.recordAttempt(true, true);
          this.gameScore.update(score => score + 10);

          animateCelebration(targetShape.x, targetShape.y, () => {
            newRound();
          });
          return;
        }
      }

      // 2. Verificação de distratores clicados
      const clickedDistractor = shapes.find(s => !s.isTarget && Math.hypot(mx - s.x, my - s.y) <= radius + 10);
      if (clickedDistractor) {
        this.sound.playError();
        this.recordAttempt(false);

        // Feedback visual imediato no distrator incorreto
        clickedDistractor.errorFlash = true;
        renderBoard();
        setTimeout(() => {
          clickedDistractor.errorFlash = false;
          renderBoard();
        }, 180);
      }
    });

    newRound();
  }

  // 5. SEQUÊNCIA COGNITIVA (MEMÓRIA DE CORES E TRABALHO)
  setupSequenceGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const padColors = ['#ef4444', '#0284c7', '#10b981', '#f59e0b', '#0d9488'];
    const padNotes = [261.63, 293.66, 329.63, 392.00, 440.00]; // Pentatônica suave
    const numPads = 5;

    // Progressão clínica em 5 níveis
    const levelLengths = [3, 4, 4, 5, 6];
    const totalLevels = levelLengths.length;
    let currentLevel = 0;
    let sequence: number[] = [];
    let userSeq: number[] = [];
    let isShowing = true;
    let isTransitioning = false;
    let activePadIndex = -1;
    let playbackInterval: any = null;
    let animFrameId: number | null = null;
    let activeTimeout: any = null;
    let attemptsOnCurrentLevel = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const cleanup = () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
      }
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };

    const padW = (W - 36) / numPads;
    const padH = Math.min(padW * 1.3, H * 0.42);
    const padY = (H - padH) / 2 + 10;

    const spawnSparkles = (cx: number, cy: number) => {
      const colors = ['#facc15', '#38bdf8', '#10b981', '#ffffff', '#fb923c'];
      for (let i = 0; i < 24; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1.5;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // 1. Badge de Nível no topo
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 150;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 10, badgeW, badgeH, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`NÍVEL ${currentLevel + 1} DE ${totalLevels}`, W / 2, 23);

      // 2. Progresso de toques na sequência (bolinhas indicadoras)
      const dotRadius = 5;
      const dotGap = 8;
      const totalSeqW = sequence.length * (dotRadius * 2 + dotGap) - dotGap;
      const dotStartX = (W - totalSeqW) / 2;
      const dotY = padY - 24;

      for (let s = 0; s < sequence.length; s++) {
        const dx = dotStartX + s * (dotRadius * 2 + dotGap) + dotRadius;
        ctx.beginPath();
        ctx.arc(dx, dotY, dotRadius, 0, Math.PI * 2);

        if (s < userSeq.length) {
          ctx.fillStyle = padColors[userSeq[s]];
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isShowing && s === activePadIndex) {
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          ctx.fillStyle = '#334155';
          ctx.fill();
        }
      }

      // 3. Desenho dos 5 Pads de Cores
      for (let i = 0; i < numPads; i++) {
        const x = 18 + i * padW;
        const isActive = activePadIndex === i;

        ctx.save();
        if (isActive) {
          ctx.fillStyle = padColors[i];
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = padColors[i];
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = padColors[i];
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.roundRect(x + 4, padY, padW - 8, padH, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (isActive) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + padW / 2, padY + padH / 2, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Renderizar partículas
      if (particles.length > 0) {
        for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
          const p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            particles.splice(pIdx, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    const startLevel = (level: number) => {
      currentLevel = level;
      userSeq = [];
      isShowing = true;
      isTransitioning = false;
      activePadIndex = -1;

      const len = levelLengths[level];
      sequence = [];
      for (let i = 0; i < len; i++) {
        let nextPad = Math.floor(Math.random() * numPads);
        if (i >= 2 && sequence[i - 1] === nextPad && sequence[i - 2] === nextPad) {
          nextPad = (nextPad + 1) % numPads;
        }
        sequence.push(nextPad);
      }

      this.gameInstruction.set(`👀 Nível ${level + 1}: Memorize a sequência de ${len} cores`);

      activeTimeout = setTimeout(() => {
        playPlayback();
      }, 700);
    };

    const playPlayback = () => {
      isShowing = true;
      userSeq = [];
      activePadIndex = -1;
      let step = 0;

      if (playbackInterval) clearInterval(playbackInterval);

      playbackInterval = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(playbackInterval);
          playbackInterval = null;
          isShowing = false;
          activePadIndex = -1;
          this.gameInstruction.set(`👉 Sua vez! Repita a sequência de ${sequence.length} cores`);
          return;
        }

        const currentPad = sequence[step];
        activePadIndex = currentPad;
        this.sound.playMusicalNote(padNotes[currentPad]);

        activeTimeout = setTimeout(() => {
          if (activePadIndex === currentPad) activePadIndex = -1;
        }, 380);

        step++;
      }, 680);
    };

    draw();
    startLevel(0);

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isShowing || isTransitioning) return;
      if (my < padY || my > padY + padH) return;

      const padIdx = Math.floor((mx - 18) / padW);
      if (padIdx < 0 || padIdx >= numPads) return;

      userSeq.push(padIdx);
      activePadIndex = padIdx;
      this.sound.playMusicalNote(padNotes[padIdx]);

      setTimeout(() => {
        if (activePadIndex === padIdx) activePadIndex = -1;
      }, 220);

      const currStep = userSeq.length - 1;
      const isCorrectSoFar = userSeq[currStep] === sequence[currStep];

      if (!isCorrectSoFar) {
        this.sound.playError();
        this.recordAttempt(false);
        attemptsOnCurrentLevel++;

        if (attemptsOnCurrentLevel < 2) {
          this.gameInstruction.set(`Ops! Vamos ver a sequência novamente...`);
          isShowing = true;
          activeTimeout = setTimeout(() => {
            playPlayback();
          }, 900);
        } else {
          this.gameInstruction.set(`Não se preocupe! Próximo desafio...`);
          isTransitioning = true;
          activeTimeout = setTimeout(() => {
            attemptsOnCurrentLevel = 0;
            if (currentLevel + 1 < totalLevels) {
              startLevel(currentLevel + 1);
            } else {
              cleanup();
              this.finishGame();
            }
          }, 1100);
        }
        return;
      }

      if (userSeq.length === sequence.length) {
        isTransitioning = true;
        this.sound.playSuccess();
        this.recordAttempt(true, true);
        this.gameScore.update(s => s + 25);
        attemptsOnCurrentLevel = 0;

        spawnSparkles(W / 2, padY + padH / 2);

        if (currentLevel + 1 < totalLevels) {
          this.gameInstruction.set(`⭐ Excelente! Nível ${currentLevel + 1} concluído!`);
          activeTimeout = setTimeout(() => {
            startLevel(currentLevel + 1);
          }, 1200);
        } else {
          this.gameInstruction.set(`🎉 Fantástico! Você dominou todos os 5 níveis de memória!`);
          activeTimeout = setTimeout(() => {
            cleanup();
            this.sound.playVictory();
            this.finishGame();
          }, 1400);
        }
      }
    });
  }

  // 5b. SEQUÊNCIA NUMÉRICA (RACIOCÍNIO LÓGICO E SENTIDO NUMÉRICO)
  setupNumberSequenceGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const totalRounds = 6;
    let currentRound = 0;
    let isTransitioning = false;
    let wrongOptionIdx: number | null = null;
    let animFrameId: number | null = null;
    let stepTimer: any = null;

    interface RoundData {
      sequence: (number | '?')[];
      originalSequence: number[];
      missingIdx: number;
      answer: number;
      options: number[];
      ruleName: string;
    }

    const generateRounds = (): RoundData[] => {
      const patterns = [
        { type: '+1', step: 1, name: 'Somando +1' },
        { type: '+2', step: 2, name: 'De 2 em 2 (+2)' },
        { type: '-1', step: -1, name: 'Contagem Regressiva (-1)' },
        { type: '+5', step: 5, name: 'De 5 em 5 (+5)' },
        { type: '+3', step: 3, name: 'De 3 em 3 (+3)' },
        { type: '-2', step: -2, name: 'Decrescente de 2 em 2 (-2)' }
      ];

      return patterns.map(p => {
        let start = 1;
        if (p.type === '+1') start = Math.floor(Math.random() * 10) + 1;
        else if (p.type === '+2') start = (Math.floor(Math.random() * 5) + 1) * 2;
        else if (p.type === '-1') start = Math.floor(Math.random() * 8) + 10;
        else if (p.type === '+5') start = (Math.floor(Math.random() * 3) + 1) * 5;
        else if (p.type === '+3') start = (Math.floor(Math.random() * 4) + 1) * 3;
        else if (p.type === '-2') start = (Math.floor(Math.random() * 5) + 8) * 2;

        const original = [start, start + p.step, start + p.step * 2, start + p.step * 3, start + p.step * 4];
        const missingIdx = Math.floor(Math.random() * 3) + 1;
        const answer = original[missingIdx];
        const displaySeq: (number | '?')[] = [...original];
        displaySeq[missingIdx] = '?';

        const distractors = new Set<number>();
        const candidates = [
          answer + 1,
          answer - 1,
          answer + Math.abs(p.step),
          answer - Math.abs(p.step),
          answer + 2,
          answer - 2,
          answer + 3
        ];

        for (const c of candidates) {
          if (c > 0 && c !== answer) {
            distractors.add(c);
            if (distractors.size === 3) break;
          }
        }

        let offset = 4;
        while (distractors.size < 3) {
          const fallback = answer + offset;
          if (fallback > 0 && fallback !== answer) distractors.add(fallback);
          offset++;
        }

        const options = [answer, ...Array.from(distractors)];
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        return {
          sequence: displaySeq,
          originalSequence: original,
          missingIdx,
          answer,
          options,
          ruleName: p.name
        };
      });
    };

    const rounds = generateRounds();
    let currentData = rounds[0];
    let isCorrectRevealed = false;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const cleanup = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (stepTimer) {
        clearTimeout(stepTimer);
        stepTimer = null;
      }
    };

    const cardW = Math.min(64, (W - 50) / 5);
    const cardH = Math.min(74, H * 0.28);
    const cardGap = Math.max(6, (W - (cardW * 5)) / 6);
    const cardStartX = (W - (cardW * 5 + cardGap * 4)) / 2;
    const cardY = H * 0.23;

    const optW = Math.min(84, (W - 50) / 4);
    const optH = 46;
    const optGap = Math.max(8, (W - (optW * 4)) / 5);
    const optStartX = (W - (optW * 4 + optGap * 3)) / 2;
    const optY = H * 0.65;

    const spawnConfetti = (centerX: number, centerY: number) => {
      const colors = ['#38bdf8', '#facc15', '#10b981', '#ffffff', '#fb923c'];
      particles = [];
      for (let i = 0; i < 28; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 2;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // 1. Badge superior de rodada
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 140;
      const badgeH = 24;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 10, badgeW, badgeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`RODADA ${currentRound + 1} DE ${totalRounds}`, W / 2, 22);

      // Instrução no topo
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        isCorrectRevealed ? `✨ Muito bem! Padrão: ${currentData.ruleName}` : 'Qual número completa a sequência?',
        W / 2,
        cardY - 18
      );

      // 2. Fileira de 5 Cartas da Sequência
      for (let i = 0; i < 5; i++) {
        const cx = cardStartX + i * (cardW + cardGap);
        const isMissing = i === currentData.missingIdx;

        ctx.save();

        if (isMissing) {
          if (isCorrectRevealed) {
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
            ctx.shadowBlur = 12;
          } else {
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.6 + pulse * 0.4})`;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
            ctx.shadowBlur = 8 + pulse * 6;
          }
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
        }

        ctx.beginPath();
        ctx.roundRect(cx, cardY, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isMissing) {
          if (isCorrectRevealed) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(String(currentData.answer), cx + cardW / 2, cardY + cardH / 2);
          } else {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText('?', cx + cardW / 2, cardY + cardH / 2);
          }
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(String(currentData.sequence[i]), cx + cardW / 2, cardY + cardH / 2);
        }

        if (i < 4) {
          const arrowX = cx + cardW + cardGap / 2;
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('→', arrowX, cardY + cardH / 2);
        }
      }

      // 3. Área de Opções de Resposta
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOQUE NO NÚMERO CORRETO:', W / 2, optY - 18);

      for (let i = 0; i < currentData.options.length; i++) {
        const ox = optStartX + i * (optW + optGap);
        const val = currentData.options[i];
        const isWrong = wrongOptionIdx === i;

        ctx.save();
        if (isWrong) {
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
        } else if (isCorrectRevealed && val === currentData.answer) {
          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.8;
        }

        ctx.beginPath();
        ctx.roundRect(ox, optY, optW, optH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), ox + optW / 2, optY + optH / 2);
      }

      // 4. Renderizar partículas se houver
      if (particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();
    this.gameInstruction.set('Descubra o padrão e complete a sequência numérica');

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;

      for (let i = 0; i < currentData.options.length; i++) {
        const ox = optStartX + i * (optW + optGap);
        if (mx >= ox && mx <= ox + optW && my >= optY && my <= optY + optH) {
          const chosen = currentData.options[i];

          if (chosen === currentData.answer) {
            isTransitioning = true;
            isCorrectRevealed = true;
            wrongOptionIdx = null;

            this.sound.playSuccess();
            this.recordAttempt(true, true);
            this.gameScore.update(s => s + 20);

            const targetCardX = cardStartX + currentData.missingIdx * (cardW + cardGap) + cardW / 2;
            const targetCardY = cardY + cardH / 2;
            spawnConfetti(targetCardX, targetCardY);

            this.gameInstruction.set(`⭐ Perfeito! O padrão é ${currentData.ruleName}`);

            stepTimer = setTimeout(() => {
              currentRound++;
              if (currentRound >= totalRounds) {
                cleanup();
                this.sound.playVictory();
                this.finishGame();
              } else {
                currentData = rounds[currentRound];
                isCorrectRevealed = false;
                isTransitioning = false;
                this.gameInstruction.set('Qual número completa a sequência?');
              }
            }, 1000);

          } else {
            wrongOptionIdx = i;
            this.sound.playError();
            this.recordAttempt(false);
            this.gameInstruction.set(`Tente novamente! Olhe a diferença entre os números.`);

            setTimeout(() => {
              if (wrongOptionIdx === i) wrongOptionIdx = null;
            }, 500);
          }
          break;
        }
      }
    });
  }

  // 5c. MEMÓRIA VISUOESPACIAL DE SEQUÊNCIAS (TESTE DOS BLOCOS DE CORSI)
  setupCorsiGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    // 9 blocos com distribuição espacial assimétrica padronizada (paradigma Corsi)
    const blockNormPositions = [
      { nx: 0.20, ny: 0.25 }, // Bloco 0 (superior esquerdo)
      { nx: 0.52, ny: 0.18 }, // Bloco 1 (superior centro-alto)
      { nx: 0.82, ny: 0.24 }, // Bloco 2 (superior direito)
      { nx: 0.34, ny: 0.45 }, // Bloco 3 (médio esquerdo)
      { nx: 0.68, ny: 0.42 }, // Bloco 4 (médio centro-direito)
      { nx: 0.16, ny: 0.70 }, // Bloco 5 (inferior esquerdo)
      { nx: 0.50, ny: 0.66 }, // Bloco 6 (inferior centro)
      { nx: 0.84, ny: 0.65 }, // Bloco 7 (inferior direito)
      { nx: 0.36, ny: 0.84 }  // Bloco 8 (base inferior)
    ];

    const blockNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
    const numBlocks = 9;

    // Progressão clínica de Span (amplitude visuoespacial de 2 a 6 itens)
    const spanLevels = [2, 3, 4, 5, 6];
    const totalLevels = spanLevels.length;
    let currentLevel = 0;
    let sequence: number[] = [];
    let userSeq: number[] = [];
    let isShowing = true;
    let isTransitioning = false;
    let activeBlockIdx = -1;
    let errorBlockIdx: number | null = null;
    let playbackInterval: any = null;
    let animFrameId: number | null = null;
    let activeTimeout: any = null;
    let attemptsOnCurrentLevel = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const cleanup = () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
      }
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };

    const blockSize = Math.min(52, Math.max(38, Math.min(W * 0.12, H * 0.17)));

    const spawnSparkles = (cx: number, cy: number) => {
      const colors = ['#38bdf8', '#facc15', '#10b981', '#ffffff', '#fb923c'];
      for (let i = 0; i < 26; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1.8;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.8,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // 1. Badge Superior de Nível e Span
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 200;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 8, badgeW, badgeH, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`NÍVEL ${currentLevel + 1} DE ${totalLevels} · SPAN: ${sequence.length} BLOCOS`, W / 2, 21);

      // 2. Indicadores de sequência
      const dotR = 4;
      const dotGap = 6;
      const totalDotW = sequence.length * (dotR * 2 + dotGap) - dotGap;
      const dotStartX = (W - totalDotW) / 2;
      const dotY = 46;

      for (let s = 0; s < sequence.length; s++) {
        const dx = dotStartX + s * (dotR * 2 + dotGap) + dotR;
        ctx.beginPath();
        ctx.arc(dx, dotY, dotR, 0, Math.PI * 2);

        if (s < userSeq.length) {
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (isShowing && s === activeBlockIdx) {
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        } else {
          ctx.fillStyle = '#334155';
          ctx.fill();
        }
      }

      // 3. Desenho dos 9 Blocos de Corsi
      for (let i = 0; i < numBlocks; i++) {
        const pos = blockNormPositions[i];
        const bx = Math.round(W * pos.nx - blockSize / 2);
        const by = Math.round(H * pos.ny - blockSize / 2 + 10);

        const isActive = activeBlockIdx === i;
        const isError = errorBlockIdx === i;
        const wasTappedInSeq = !isShowing && userSeq.includes(i);

        ctx.save();
        if (isError) {
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
          ctx.shadowBlur = 15;
        } else if (isActive) {
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
          ctx.shadowBlur = 20;
        } else if (wasTappedInSeq) {
          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.8;
        }

        ctx.beginPath();
        ctx.roundRect(bx, by, blockSize, blockSize, 12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isActive) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx + blockSize / 2, by + blockSize / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (wasTappedInSeq) {
          const tapOrder = userSeq.indexOf(i) + 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(String(tapOrder), bx + blockSize / 2, by + blockSize / 2);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(bx + blockSize / 2, by + blockSize / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Renderizar partículas
      if (particles.length > 0) {
        for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
          const p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            particles.splice(pIdx, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    const startLevel = (level: number) => {
      currentLevel = level;
      userSeq = [];
      isShowing = true;
      isTransitioning = false;
      activeBlockIdx = -1;
      errorBlockIdx = null;

      const span = spanLevels[level];
      sequence = [];
      for (let i = 0; i < span; i++) {
        let nextBlock = Math.floor(Math.random() * numBlocks);
        if (i > 0 && sequence[i - 1] === nextBlock) {
          nextBlock = (nextBlock + 1) % numBlocks;
        }
        sequence.push(nextBlock);
      }

      this.gameInstruction.set(`👀 Nível ${level + 1}: Observe a sequência dos ${span} blocos...`);

      activeTimeout = setTimeout(() => {
        playPlayback();
      }, 750);
    };

    const playPlayback = () => {
      isShowing = true;
      userSeq = [];
      activeBlockIdx = -1;
      errorBlockIdx = null;
      let step = 0;

      if (playbackInterval) clearInterval(playbackInterval);

      playbackInterval = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(playbackInterval);
          playbackInterval = null;
          isShowing = false;
          activeBlockIdx = -1;
          this.gameInstruction.set(`👉 Sua vez! Toque nos blocos na mesma ordem (0/${sequence.length})`);
          return;
        }

        const currentBlock = sequence[step];
        activeBlockIdx = currentBlock;
        this.sound.playMusicalNote(blockNotes[currentBlock]);

        activeTimeout = setTimeout(() => {
          if (activeBlockIdx === currentBlock) activeBlockIdx = -1;
        }, 440);

        step++;
      }, 720);
    };

    draw();
    startLevel(0);

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isShowing || isTransitioning) return;

      for (let i = 0; i < numBlocks; i++) {
        const pos = blockNormPositions[i];
        const bx = Math.round(W * pos.nx - blockSize / 2);
        const by = Math.round(H * pos.ny - blockSize / 2 + 10);

        const hitPadding = 12;
        if (
          mx >= bx - hitPadding &&
          mx <= bx + blockSize + hitPadding &&
          my >= by - hitPadding &&
          my <= by + blockSize + hitPadding
        ) {
          if (userSeq.length > 0 && userSeq[userSeq.length - 1] === i) return;

          userSeq.push(i);
          activeBlockIdx = i;
          this.sound.playMusicalNote(blockNotes[i]);

          setTimeout(() => {
            if (activeBlockIdx === i) activeBlockIdx = -1;
          }, 240);

          const currStep = userSeq.length - 1;
          const isCorrectSoFar = userSeq[currStep] === sequence[currStep];

          if (!isCorrectSoFar) {
            errorBlockIdx = i;
            this.sound.playError();
            this.recordAttempt(false);
            attemptsOnCurrentLevel++;

            if (attemptsOnCurrentLevel < 2) {
              this.gameInstruction.set(`Ops! Vamos rever a sequência dos blocos...`);
              isShowing = true;
              activeTimeout = setTimeout(() => {
                playPlayback();
              }, 900);
            } else {
              this.gameInstruction.set(`Não se preocupe! Próximo nível...`);
              isTransitioning = true;
              activeTimeout = setTimeout(() => {
                attemptsOnCurrentLevel = 0;
                if (currentLevel + 1 < totalLevels) {
                  startLevel(currentLevel + 1);
                } else {
                  cleanup();
                  this.finishGame();
                }
              }, 1100);
            }
            return;
          }

          this.gameInstruction.set(`👉 Muito bem! (${userSeq.length}/${sequence.length})`);

          if (userSeq.length === sequence.length) {
            isTransitioning = true;
            this.sound.playSuccess();
            this.recordAttempt(true, true);
            this.gameScore.update(s => s + 25);
            attemptsOnCurrentLevel = 0;

            const finalPos = blockNormPositions[i];
            spawnSparkles(W * finalPos.nx, H * finalPos.ny + 10);

            if (currentLevel + 1 < totalLevels) {
              this.gameInstruction.set(`⭐ Excelente! Span de ${sequence.length} blocos alcançado!`);
              activeTimeout = setTimeout(() => {
                startLevel(currentLevel + 1);
              }, 1200);
            } else {
              this.gameInstruction.set(`🎉 Fantástico! Você dominou o Teste de Corsi completo!`);
              activeTimeout = setTimeout(() => {
                cleanup();
                this.sound.playVictory();
                this.finishGame();
              }, 1400);
            }
          }
          break;
        }
      }
    });
  }

  // 5d. RECONHECIMENTO VISUAL IMEDIATO / MATCH-TO-SAMPLE (MEMÓRIA VISUAL - ID 18)
  setupVisualMatchingGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const totalRounds = 5;
    let currentRound = 0;
    let phase: 'SHOW' | 'RECALL' = 'SHOW';
    let isTransitioning = false;
    let wrongOptionIdx: number | null = null;
    let animFrameId: number | null = null;
    let roundTimer: any = null;
    let showStartTime = 0;
    const showDurationMs = 2600;

    const itemPool = ['🚀', '⛵', '🏰', '🚁', '🦁', '🎸', '🎨', '🧸', '🚂', '🛸', '👑', '💎', '🦄', '🎯', '🚲', '🌴'];

    interface MatchRound {
      target: string;
      options: string[];
    }

    const generateRounds = (): MatchRound[] => {
      const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
      const rounds: MatchRound[] = [];

      for (let r = 0; r < totalRounds; r++) {
        const target = shuffled[r % shuffled.length];
        const others = itemPool.filter(it => it !== target).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [target, ...others].sort(() => Math.random() - 0.5);
        rounds.push({ target, options });
      }
      return rounds;
    };

    const rounds = generateRounds();
    let currentData = rounds[0];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const cleanup = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (roundTimer) {
        clearTimeout(roundTimer);
        roundTimer = null;
      }
    };

    const spawnSparkles = (cx: number, cy: number) => {
      const colors = ['#38bdf8', '#facc15', '#10b981', '#ffffff', '#fb923c'];
      for (let i = 0; i < 28; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1.8;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        });
      }
    };

    const centerCardSize = Math.min(108, Math.min(W * 0.32, H * 0.38));
    const centerX = (W - centerCardSize) / 2;
    const centerY = H * 0.18;

    const optW = Math.min(84, (W - 50) / 4);
    const optH = 54;
    const optGap = Math.max(8, (W - (optW * 4)) / 5);
    const optStartX = (W - (optW * 4 + optGap * 3)) / 2;
    const optY = H * 0.66;

    const startShowPhase = (roundIdx: number) => {
      currentRound = roundIdx;
      currentData = rounds[roundIdx];
      phase = 'SHOW';
      isTransitioning = false;
      wrongOptionIdx = null;
      showStartTime = performance.now();

      this.gameInstruction.set(`👀 Memorize o objeto com atenção!`);

      if (roundTimer) clearTimeout(roundTimer);
      roundTimer = setTimeout(() => {
        phase = 'RECALL';
        this.gameInstruction.set(`👉 Qual objeto você acabou de ver? Toque na opção correta!`);
      }, showDurationMs);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // 1. Badge Superior de Rodada
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 160;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 8, badgeW, badgeH, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`RODADA ${currentRound + 1} DE ${totalRounds}`, W / 2, 21);

      // 2. Card Central
      ctx.save();
      if (phase === 'SHOW') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        ctx.shadowBlur = 18;
      } else if (isTransitioning) {
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
        ctx.shadowBlur = 20;
      } else {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.5 + pulse * 0.5})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 10 + pulse * 6;
      }

      ctx.beginPath();
      ctx.roundRect(centerX, centerY, centerCardSize, centerCardSize, 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (phase === 'SHOW' || isTransitioning) {
        ctx.font = `${Math.round(centerCardSize * 0.52)}px sans-serif`;
        ctx.fillText(currentData.target, centerX + centerCardSize / 2, centerY + centerCardSize / 2);

        if (phase === 'SHOW') {
          const elapsed = performance.now() - showStartTime;
          const remainingPct = Math.max(0, 1 - elapsed / showDurationMs);
          const barW = centerCardSize - 16;
          const barH = 4;
          const barX = centerX + 8;
          const barY = centerY + centerCardSize - 12;

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barH, 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW * remainingPct, barH, 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText('?', centerX + centerCardSize / 2, centerY + centerCardSize / 2);
      }

      // 3. Opções
      if (phase === 'RECALL') {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ESCOLHA O OBJETO QUE VOCÊ VIU:', W / 2, optY - 18);

        for (let i = 0; i < currentData.options.length; i++) {
          const ox = optStartX + i * (optW + optGap);
          const item = currentData.options[i];
          const isWrong = wrongOptionIdx === i;
          const isCorrect = isTransitioning && item === currentData.target;

          ctx.save();
          if (isWrong) {
            ctx.fillStyle = '#7f1d1d';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
          } else if (isCorrect) {
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.8;
          }

          ctx.beginPath();
          ctx.roundRect(ox, optY, optW, optH, 14);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item, ox + optW / 2, optY + optH / 2);
        }
      }

      // 4. Partículas
      if (particles.length > 0) {
        for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
          const p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            particles.splice(pIdx, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();
    startShowPhase(0);

    this.setCanvasHandler(canvas, (mx, my) => {
      if (phase !== 'RECALL' || isTransitioning) return;

      for (let i = 0; i < currentData.options.length; i++) {
        const ox = optStartX + i * (optW + optGap);
        if (mx >= ox && mx <= ox + optW && my >= optY && my <= optY + optH) {
          const chosen = currentData.options[i];

          if (chosen === currentData.target) {
            isTransitioning = true;
            wrongOptionIdx = null;

            this.sound.playSuccess();
            this.recordAttempt(true, true);
            this.gameScore.update(s => s + 20);

            spawnSparkles(centerX + centerCardSize / 2, centerY + centerCardSize / 2);
            this.gameInstruction.set(`⭐ Muito bem! Você acertou o objeto!`);

            roundTimer = setTimeout(() => {
              if (currentRound + 1 < totalRounds) {
                startShowPhase(currentRound + 1);
              } else {
                cleanup();
                this.sound.playVictory();
                this.finishGame();
              }
            }, 1100);
          } else {
            wrongOptionIdx = i;
            this.sound.playError();
            this.recordAttempt(false);
            this.gameInstruction.set(`Não foi esse! Tente lembrar da forma ou cor.`);

            setTimeout(() => {
              if (wrongOptionIdx === i) wrongOptionIdx = null;
            }, 500);
          }
          break;
        }
      }
    });
  }

  // 5e. RECORDAÇÃO LIVRE DE MÚLTIPLOS ITENS (LEMBRE-SE DOS OBJETOS - ID 17)
  setupObjectRecallGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const showcaseCounts = [3, 3, 4, 5];
    const totalRounds = showcaseCounts.length;
    let currentRound = 0;
    let phase: 'SHOW' | 'RECALL' = 'SHOW';
    let isTransitioning = false;
    let animFrameId: number | null = null;
    let roundTimer: any = null;
    let showStartTime = 0;
    const showDurationMs = 3600;

    const itemCatalog = [
      '⚽', '🚗', '🍎', '🧸', '🎸', '🎈', '🐶', '🍦',
      '🚀', '👑', '🍌', '🍕', '🚲', '🎨', '🐱', '🔔'
    ];

    interface ObjectRecallRound {
      targets: string[];
      trayOptions: string[];
    }

    const generateRound = (roundIdx: number): ObjectRecallRound => {
      const count = showcaseCounts[roundIdx];
      const shuffled = [...itemCatalog].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, count);
      const others = shuffled.slice(count, count + (8 - count));
      const trayOptions = [...targets, ...others].sort(() => Math.random() - 0.5);
      return { targets, trayOptions };
    };

    let currentData = generateRound(0);
    const foundTargets = new Set<string>();
    let wrongOptionIdx: number | null = null;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const cleanup = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (roundTimer) {
        clearTimeout(roundTimer);
        roundTimer = null;
      }
    };

    const spawnSparkles = (cx: number, cy: number) => {
      const colors = ['#38bdf8', '#facc15', '#10b981', '#ffffff', '#fb923c'];
      for (let i = 0; i < 28; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1.8;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2
        });
      }
    };

    const startShowPhase = (roundIdx: number) => {
      currentRound = roundIdx;
      currentData = generateRound(roundIdx);
      foundTargets.clear();
      phase = 'SHOW';
      isTransitioning = false;
      wrongOptionIdx = null;
      showStartTime = performance.now();

      this.gameInstruction.set(`👀 Memorize os ${currentData.targets.length} objetos da vitrine!`);

      if (roundTimer) clearTimeout(roundTimer);
      roundTimer = setTimeout(() => {
        phase = 'RECALL';
        this.gameInstruction.set(`👉 Toque nos objetos que estavam na vitrine! (0/${currentData.targets.length})`);
      }, showDurationMs);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // 1. Badge Superior de Rodada
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const badgeW = 160;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 8, badgeW, badgeH, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`RODADA ${currentRound + 1} DE ${totalRounds}`, W / 2, 21);

      // 2. Vitrine de Objetos (Showcase)
      const targetCount = currentData.targets.length;
      const showcaseW = Math.min(W - 32, targetCount * 68 + 24);
      const showcaseH = 68;
      const showcaseX = (W - showcaseW) / 2;
      const showcaseY = 46;

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = phase === 'SHOW' ? '#38bdf8' : '#334155';
      ctx.lineWidth = phase === 'SHOW' ? 2.5 : 1.5;
      if (phase === 'SHOW') {
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.roundRect(showcaseX, showcaseY, showcaseW, showcaseH, 16);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Slots da vitrine
      const slotSize = 50;
      const slotGap = (showcaseW - 20 - targetCount * slotSize) / Math.max(1, targetCount - 1);
      const slotStartX = showcaseX + 10;

      for (let s = 0; s < targetCount; s++) {
        const sx = slotStartX + s * (slotSize + slotGap);
        const sy = showcaseY + (showcaseH - slotSize) / 2;
        const targetItem = currentData.targets[s];
        const isFound = foundTargets.has(targetItem);

        ctx.save();
        if (phase === 'SHOW') {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(sx, sy, slotSize, slotSize, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(targetItem, sx + slotSize / 2, sy + slotSize / 2);
        } else {
          if (isFound) {
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(sx, sy, slotSize, slotSize, 12);
            ctx.fill();
            ctx.stroke();

            ctx.font = '26px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(targetItem, sx + slotSize / 2, sy + slotSize / 2);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.roundRect(sx, sy, slotSize, slotSize, 12);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#475569';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', sx + slotSize / 2, sy + slotSize / 2);
          }
        }
        ctx.restore();
      }

      if (phase === 'SHOW') {
        const elapsed = performance.now() - showStartTime;
        const remainingPct = Math.max(0, 1 - elapsed / showDurationMs);
        const barW = showcaseW - 20;
        const barH = 4;
        const barX = showcaseX + 10;
        const barY = showcaseY + showcaseH - 8;

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * remainingPct, barH, 2);
        ctx.fill();
      }

      // 3. Grade de 8 Opções de Objetos
      if (phase === 'RECALL') {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TOQUE NOS OBJETOS QUE ESTAVAM NA VITRINE:', W / 2, 134);

        const cols = 4;
        const btnW = Math.min(64, (W - 48) / 4);
        const btnH = 48;
        const gapX = Math.max(8, (W - (btnW * 4)) / 5);
        const gapY = 10;
        const startX = (W - (btnW * 4 + gapX * 3)) / 2;
        const startY = 150;

        for (let i = 0; i < currentData.trayOptions.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const bx = startX + col * (btnW + gapX);
          const by = startY + row * (btnH + gapY);

          const item = currentData.trayOptions[i];
          const isFound = foundTargets.has(item);
          const isWrong = wrongOptionIdx === i;

          ctx.save();
          if (isWrong) {
            ctx.fillStyle = '#7f1d1d';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
          } else if (isFound) {
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.8;
          }

          ctx.beginPath();
          ctx.roundRect(bx, by, btnW, btnH, 12);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item, bx + btnW / 2, by + btnH / 2);
        }
      }

      // 4. Renderizar partículas
      if (particles.length > 0) {
        for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
          const p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            particles.splice(pIdx, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();
    startShowPhase(0);

    this.setCanvasHandler(canvas, (mx, my) => {
      if (phase !== 'RECALL' || isTransitioning) return;

      const cols = 4;
      const btnW = Math.min(64, (W - 48) / 4);
      const btnH = 48;
      const gapX = Math.max(8, (W - (btnW * 4)) / 5);
      const gapY = 10;
      const startX = (W - (btnW * 4 + gapX * 3)) / 2;
      const startY = 150;

      for (let i = 0; i < currentData.trayOptions.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = startX + col * (btnW + gapX);
        const by = startY + row * (btnH + gapY);

        if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
          const item = currentData.trayOptions[i];

          if (foundTargets.has(item)) return;

          if (currentData.targets.includes(item)) {
            foundTargets.add(item);
            this.sound.playStarCollect();
            this.recordAttempt(true);
            this.gameScore.update(s => s + 10);

            spawnSparkles(bx + btnW / 2, by + btnH / 2);

            this.gameInstruction.set(
              `⭐ Encontrou! (${foundTargets.size}/${currentData.targets.length})`
            );

            if (foundTargets.size === currentData.targets.length) {
              isTransitioning = true;
              this.sound.playSuccess();
              this.recordAttempt(true, true);
              this.gameScore.update(s => s + 15);

              spawnSparkles(W / 2, 70);

              if (currentRound + 1 < totalRounds) {
                this.gameInstruction.set(`🎉 Perfeito! Você lembrou de toda a vitrine!`);
                roundTimer = setTimeout(() => {
                  startShowPhase(currentRound + 1);
                }, 1300);
              } else {
                this.gameInstruction.set(`🏆 Incrível! Você completou todas as vitrines!`);
                roundTimer = setTimeout(() => {
                  cleanup();
                  this.sound.playVictory();
                  this.finishGame();
                }, 1400);
              }
            }
          } else {
            wrongOptionIdx = i;
            this.sound.playError();
            this.recordAttempt(false);
            this.gameInstruction.set(`Esse objeto não estava na vitrine! Procure outro.`);

            setTimeout(() => {
              if (wrongOptionIdx === i) wrongOptionIdx = null;
            }, 500);
          }
          break;
        }
      }
    });
  }

  // 6. CONSCIÊNCIA FONOLÓGICA
  setupPhonologyGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const WORD_SETS: Record<number, Array<{word: string, options: string[]}>> = {
      31: [{word:'SOLA',options:['SOLA','MOLA','BOLA','FOLA']},{word:'CARO',options:['CARO','CAVO','CARRO','CASA']},{word:'PATO',options:['PATO','PATA','MATO','RATO']}],
      32: [{word:'CA-SA',options:['CA-SA','CASA','CA-SA','CAS-A']},{word:'BO-LA',options:['BO-LA','BOLA','BO-LA','BOL-A']},{word:'PA-TO',options:['PA-TO','PATO','PA-TO','PAT-O']}],
      33: [{word:'MAÇÃ',options:['M','A','Ã','Ç']},{word:'BOLA',options:['B','O','L','A']},{word:'SOL',options:['S','O','L','Z']}],
      34: [{word:'SOL',options:['L','O','S','Z']},{word:'PÉ',options:['É','P','E','X']},{word:'MAR',options:['R','A','M','L']}],
      35: [{word:'BOR-BO-LE-TA',options:['4','3','2','5']},{word:'CA-SA',options:['2','1','3','4']},{word:'PA-TO',options:['2','1','3','4']}],
      36: [{word:'MATO→RATO',options:['RATO','MATO','BATO','SATO']},{word:'CASA→CANA',options:['CANA','CASA','CATA','CALA']},{word:'BOLA→BOTA',options:['BOTA','BOLA','BONA','BOCA']}],
      37: [{word:'Peixe ___',options:['AZUL','DENTE','MOLHO','VERDE']},{word:'Amor ___',options:['DOURADO','TEMPO','COR','ÁGUA']},{word:'Copo ___',options:['D\'ÁGUA','GRANDE','MESA','AZUL']}],
      38: [{word:'SOL',options:['S-O-L','S-O','SOL','S-L-O']},{word:'CASA',options:['C-A-S-A','C-AS-A','CA-S-A','CASA']},{word:'PATO',options:['P-A-T-O','PA-T-O','PATO','P-A-TO']}],
      39: [{word:'CA+SO',options:['CASO','CASSO','CAÇO','CALO']},{word:'BO+LA',options:['BOLA','BOLHA','BOALA','BOA']},{word:'PA+TO',options:['PATO','PACTO','PATTO','PATOA']}],
      40: [{word:'P_TO',options:['PATO','PETO','PITO','PUTO']},{word:'M_R',options:['MAR','MOR','MUR','MER']},{word:'C_S_',options:['CASA','COSA','CUSA','CESA']}],
    };
    const words = WORD_SETS[gameId] || WORD_SETS[31];
    let currentIdx = 0;

    const btnW = Math.min(210, (W - 70) / 2);
    const btnH = 50;
    const gap = 14;
    const startX = (W - (btnW * 2 + gap)) / 2;
    const startY = H * 0.44;

    let isTransitioning = false;
    const drawQuestion = () => {
      isTransitioning = false;
      if (currentIdx >= words.length) {
        this.finishGame();
        return;
      }
      const q = words[currentIdx];
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Desafio Fonológico ${currentIdx + 1}/${words.length}`, W / 2, H * 0.14);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(q.word, W / 2, H * 0.30);

      q.options.forEach((opt, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 10);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0d9488';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(65 + i), x + 20, y + btnH / 2 + 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(opt, x + btnW / 2 + 6, y + btnH / 2 + 4);
      });

      this.gameInstruction.set(`Pergunta ${currentIdx + 1}/${words.length} · Toque na opção correta`);
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;
      const q = words[currentIdx];
      if (!q) return;
      q.options.forEach((opt, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 10);
        if (mx >= x && mx <= x + btnW && my >= y && my <= y + btnH) {
          isTransitioning = true;
          const correct = opt === q.options[0]; // primeira opção do set é o alvo
          this.recordAttempt(correct);
          if (correct) {
            this.gameScore.update(s => s + 15);
          }
          currentIdx++;
          setTimeout(drawQuestion, 300);
        }
      });
    });

    drawQuestion();
  }

  // 7. SOCIOEMOCIONAL (TEORIA DA MENTE E EMPATIA)
  setupSocialGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const SCENARIOS: Record<number, Array<{situation: string, options: string[], correct: number}>> = {
      51: [
        {situation:'A pessoa está sorrindo e dançando. Ela está...',options:['Feliz e alegre','Triste','Com raiva','Com medo'],correct:0},
        {situation:'O colega caiu e machucou o joelho. O que ele sente?',options:['Muita dor e tristeza','Alegria','Tédio','Animado'],correct:0},
        {situation:'Alguém respirou fundo com calma. Ela está...',options:['Relaxada e tranquila','Brava','Com pressa','Assustada'],correct:0},
      ],
      52: [
        {situation:'Seu colega perdeu o lápis favorito. Como ajudar?',options:['Ajudar a procurar com calma','Zombar dele','Ignorar','Esconder outro lápis'],correct:0},
        {situation:'Uma criança nova chegou na escola sozinha. O que fazer?',options:['Convidar para brincar junto','Ignorar','Dizer que não pode','Rir'],correct:0},
        {situation:'Ganhou um presente inesperado. Como se expressa?',options:['Agradecer com um sorriso','Reclamar','Jogar no chão','Sair correndo'],correct:0},
      ]
    };
    const scenarios = SCENARIOS[gameId] || SCENARIOS[51];
    let currentIdx = 0;
    let isTransitioning = false;

    const btnW = Math.min(220, (W - 60) / 2);
    const btnH = 50;
    const gap = 12;
    const startX = (W - (btnW * 2 + gap)) / 2;
    const startY = H * 0.44;

    const drawScenario = () => {
      isTransitioning = false;
      if (currentIdx >= scenarios.length) {
        this.finishGame();
        return;
      }
      const s = scenarios[currentIdx];
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Cenário Social ${currentIdx + 1}/${scenarios.length}`, W / 2, H * 0.14);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(s.situation, W / 2, H * 0.28);

      s.options.forEach((opt, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 10);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, btnW, btnH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opt, x + btnW / 2, y + btnH / 2);
      });

      this.gameInstruction.set('Analise o sentimento e escolha a melhor atitude empática');
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;
      const s = scenarios[currentIdx];
      if (!s) return;
      s.options.forEach((_, i) => {
        const x = startX + (i % 2) * (btnW + gap);
        const y = startY + Math.floor(i / 2) * (btnH + 10);
        if (mx >= x && mx <= x + btnW && my >= y && my <= y + btnH) {
          isTransitioning = true;
          const correct = i === s.correct;
          this.recordAttempt(correct);
          if (correct) {
            this.gameScore.update(score => score + 15);
          }
          currentIdx++;
          setTimeout(drawScenario, 300);
        }
      });
    });

    drawScenario();
  }

  // 8. TAP / REAÇÃO RÁPIDA / GO-NO-GO (ATENÇÃO DIVIDIDA E INIBIÇÃO)
  setupTapGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;

    interface TapItemTrial {
      symbol: string;
      isTarget: boolean;
    }

    // Gerador de baralho equilibrado e clinicamente estruturado
    const buildSequence = (): { trials: TapItemTrial[]; instruction: string; durationMs: number } => {
      if (gameId === 4) {
        // Atenção Dividida (70% Círculos Azuis [Alvos], 30% Círculos Vermelhos [Ignorar])
        // 14 rodadas: 10 azuis e 4 vermelhos. A primeira é SEMPRE azul!
        const pool: TapItemTrial[] = [];
        for (let i = 0; i < 9; i++) pool.push({ symbol: '🔵', isTarget: true });
        for (let i = 0; i < 4; i++) pool.push({ symbol: '🔴', isTarget: false });
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return {
          trials: [{ symbol: '🔵', isTarget: true }, ...pool],
          instruction: 'Toque no CÍRCULO AZUL! Ignore o vermelho!',
          durationMs: 1800
        };
      }

      if (gameId === 5) {
        // Inibir Resposta (Toque apenas nos quadrados)
        const distractors = ['🔴', '🟢', '🔵'];
        const pool: TapItemTrial[] = [];
        for (let i = 0; i < 7; i++) pool.push({ symbol: '⬜', isTarget: true });
        for (let i = 0; i < 4; i++) pool.push({ symbol: distractors[i % distractors.length], isTarget: false });
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return {
          trials: [{ symbol: '⬜', isTarget: true }, ...pool],
          instruction: 'Toque apenas no QUADRADO! Ignore os círculos!',
          durationMs: 1800
        };
      }

      if (gameId === 26) {
        // Controle de Impulsos (Semáforo Verde)
        const distractors = ['🟡', '🔴'];
        const pool: TapItemTrial[] = [];
        for (let i = 0; i < 7; i++) pool.push({ symbol: '🟢', isTarget: true });
        for (let i = 0; i < 4; i++) pool.push({ symbol: distractors[i % distractors.length], isTarget: false });
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return {
          trials: [{ symbol: '🟢', isTarget: true }, ...pool],
          instruction: 'Toque quando for VERDE! Espere se for amarelo ou vermelho!',
          durationMs: 1900
        };
      }

      if (gameId === 24) {
        // Classificação (Animais vs Objetos)
        const animals = ['🐶', '🐱', '🐰', '🦊', '🐻'];
        const objects = ['🚗', '⚽', '📱', '🎸'];
        const pool: TapItemTrial[] = [];
        for (let i = 0; i < 7; i++) pool.push({ symbol: animals[i % animals.length], isTarget: true });
        for (let i = 0; i < 4; i++) pool.push({ symbol: objects[i % objects.length], isTarget: false });
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return {
          trials: [{ symbol: animals[0], isTarget: true }, ...pool],
          instruction: 'Toque nos ANIMAIS! Ignore os objetos!',
          durationMs: 2000
        };
      }

      if (gameId === 6) {
        // Rastreamento Estelar
        const trials: TapItemTrial[] = Array.from({ length: 10 }, () => ({ symbol: '⭐', isTarget: true }));
        return {
          trials,
          instruction: 'Toque na estrela quando ela surgir!',
          durationMs: 2500
        };
      }

      if (gameId === 44) {
        // Reação Rápida
        const fruits = ['🍎', '🍌', '🍇', '🍊'];
        const trials: TapItemTrial[] = Array.from({ length: 10 }, (_, i) => ({ symbol: fruits[i % fruits.length], isTarget: true }));
        return {
          trials,
          instruction: 'Toque no item antes que ele desapareça!',
          durationMs: 1500
        };
      }

      // Padrão (Game 2 - Contagem Rápida)
      const fruits = ['🍎', '🍌', '🍇', '🍊', '🍓'];
      const trials: TapItemTrial[] = Array.from({ length: 12 }, (_, i) => ({ symbol: fruits[i % fruits.length], isTarget: true }));
      return {
        trials,
        instruction: 'Toque nas frutas o mais rápido que puder!',
        durationMs: 2200
      };
    };

    const session = buildSequence();
    let currentIndex = 0;
    let isTransitioning = false;
    const radius = Math.max(26, Math.min(38, W * 0.08));
    const hitRadius = Math.max(56, radius * 1.5);

    // Registro ÚNICO do event listener no canvas
    let currentHandler: ((mx: number, my: number) => void) | null = null;
    this.setCanvasHandler(canvas, (mx, my) => {
      if (currentHandler) {
        currentHandler(mx, my);
      }
    });

    const drawItem = (symbol: string, x: number, y: number, isTarget: boolean, pulseColor: string | null = null) => {
      ctx.clearRect(0, 0, W, H);

      if (symbol === '🔵') {
        // CÍRCULO AZUL VETORIAL (Alvo de Atenção Dividida - 100% garantido e visível)
        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fill();

        ctx.strokeStyle = pulseColor || '#38bdf8';
        ctx.lineWidth = pulseColor ? 4 : 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ponto de brilho interno para efeito tridimensional
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.32, y - radius * 0.32, radius * 0.24, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      if (symbol === '🔴') {
        // CÍRCULO VERMELHO VETORIAL (Distrator de Inibição - 100% garantido e visível)
        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fill();

        ctx.strokeStyle = pulseColor || '#f87171';
        ctx.lineWidth = pulseColor ? 4 : 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ponto de brilho interno
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.32, y - radius * 0.32, radius * 0.24, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      if (symbol === '🟢') {
        // CÍRCULO VERDE
        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.fill();

        ctx.strokeStyle = pulseColor || '#34d399';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      if (symbol === '🟡') {
        // CÍRCULO AMARELO
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      if (symbol === '⬜') {
        // QUADRADO VETORIAL
        const size = radius * 1.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 8);
        ctx.fill();
        ctx.strokeStyle = pulseColor || '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();
        return;
      }

      if (symbol === '⭐') {
        // ESTRELA DOURADA
        ctx.beginPath();
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${Math.max(20, radius * 1.0)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x, y + 1);
        return;
      }

      // Emojis de animais / frutas
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.font = `${Math.max(30, radius * 1.25)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, x, y + 2);
    };

    const spawnNext = () => {
      if (this.gameData.activeTimeout) {
        clearTimeout(this.gameData.activeTimeout);
        this.gameData.activeTimeout = null;
      }

      if (currentIndex >= session.trials.length) {
        this.finishGame();
        return;
      }

      isTransitioning = false;
      const trial = session.trials[currentIndex];
      currentIndex++;

      const paddingX = radius + 24;
      const paddingY = radius + 24;
      const safeW = Math.max(20, W - paddingX * 2);
      const safeH = Math.max(20, H - paddingY * 2);
      const x = Math.random() * safeW + paddingX;
      const y = Math.random() * safeH + paddingY;
      const duration = session.durationMs;

      this.gameInstruction.set(`${session.instruction} (${currentIndex}/${session.trials.length})`);

      // Renderiza o item imediatamente na tela
      drawItem(trial.symbol, x, y, trial.isTarget);

      // Define o manipulador do toque no item atual
      currentHandler = (mx, my) => {
        if (isTransitioning) return;
        const dist = Math.hypot(mx - x, my - y);

        if (dist <= hitRadius) {
          isTransitioning = true;
          if (this.gameData.activeTimeout) {
            clearTimeout(this.gameData.activeTimeout);
            this.gameData.activeTimeout = null;
          }
          currentHandler = null;

          if (trial.isTarget) {
            // ACERTO NO ALVO
            if (trial.symbol === '⭐') {
              this.sound.playStarCollect();
              this.recordAttempt(true, true);
            } else {
              this.recordAttempt(true);
            }
            this.gameScore.update(s => s + 10);

            // Halo ciano de acerto
            drawItem(trial.symbol, x, y, true, '#38bdf8');
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // ERRO DE COMISSÃO (Tocou no vermelho/distrator que devia ignorar!)
            this.sound.playError();
            this.recordAttempt(false);

            // Anel vermelho de erro
            drawItem(trial.symbol, x, y, false, '#ef4444');
          }

          this.gameData.activeTimeout = setTimeout(spawnNext, 240);
        }
      };

      // TIMEOUT DE APRESENTAÇÃO
      this.gameData.activeTimeout = setTimeout(() => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentHandler = null;

        if (!trial.isTarget) {
          // SUCESSO DE INIBIÇÃO! (O jogador ignorou corretamente o círculo vermelho!)
          this.sound.playSuccess();
          this.recordAttempt(true, true);
          this.gameScore.update(s => s + 10);

          // Feedback visual de sucesso inibitório
          drawItem(trial.symbol, x, y, false, '#10b981');
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✓ Foco mantido!', x, y - radius - 14);

          this.gameData.activeTimeout = setTimeout(spawnNext, 340);
        } else {
          // OMISSÃO! (O jogador não tocou a tempo no alvo)
          this.recordAttempt(false);
          ctx.clearRect(0, 0, W, H);
          this.gameData.activeTimeout = setTimeout(spawnNext, 180);
        }
      }, duration);
    };

    spawnNext();
  }

  // 10. RASTREAMENTO VISUAL (SEGUIMENTO OCULAR SUAVE E FIXAÇÃO SACÁDICA)
  setupVisualTrackingGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const totalRounds = 8;
    let roundsDone = 0;
    let isMoving = false;
    let isStopped = false;
    let isTransitioning = false;
    let animFrameId: number | null = null;
    let stopTimeout: any = null;
    let roundTimeout: any = null;

    const starRadius = Math.max(22, Math.min(32, W * 0.065));
    const hitRadius = Math.max(50, starRadius * 1.6);
    let targetX = W / 2;
    let targetY = H / 2;

    const cleanup = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
      }
      if (roundTimeout) {
        clearTimeout(roundTimeout);
        roundTimeout = null;
      }
      if (this.gameData?.activeTimeout) {
        clearTimeout(this.gameData.activeTimeout);
        this.gameData.activeTimeout = null;
      }
    };

    const drawStar = (x: number, y: number, stopped: boolean, pulseProgress: number = 0) => {
      // 1. Efeito de resplendor / brilho
      ctx.beginPath();
      ctx.arc(x, y, starRadius + (stopped ? 10 + pulseProgress * 6 : 6), 0, Math.PI * 2);
      ctx.fillStyle = stopped
        ? `rgba(56, 189, 248, ${0.25 - pulseProgress * 0.1})`
        : 'rgba(56, 189, 248, 0.18)';
      ctx.fill();

      // 2. Anel de foco se estiver parada (convidando ao toque)
      if (stopped) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, starRadius + 4 + pulseProgress * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Núcleo da estrela (círculo azul profundo)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(x, y, starRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Estrela dourada no centro
      ctx.fillStyle = '#facc15';
      ctx.font = `bold ${Math.max(18, starRadius * 0.95)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', x, y + 1);
    };

    const newRound = () => {
      cleanup();
      isTransitioning = false;
      isStopped = false;
      isMoving = true;

      if (roundsDone >= totalRounds) {
        this.finishGame();
        return;
      }
      roundsDone++;

      // Cria trajetória cinemática clínica para esta rodada
      const padding = starRadius + 30;
      const startX = Math.random() > 0.5 ? padding : W - padding;
      const startY = Math.random() * (H - padding * 2) + padding;
      const endX = startX === padding ? W - padding : padding;
      const endY = Math.random() * (H - padding * 2) + padding;

      // Ponto de controle para curva Bezier suave
      const ctrlX = W / 2 + (Math.random() - 0.5) * (W * 0.35);
      const ctrlY = Math.random() > 0.5 ? padding : H - padding;

      // Duração da movimentação (2.4 a 2.8 segundos - velocidade ideal para rastreamento visual)
      const travelDuration = 2600;
      const moveStartTime = performance.now();
      const trailPoints: Array<{ x: number; y: number }> = [];

      this.gameInstruction.set(`Rodada ${roundsDone}/${totalRounds} · 👀 Siga a estrela com os olhos...`);

      const animateMove = (now: number) => {
        const elapsed = now - moveStartTime;
        const t = Math.min(1, elapsed / travelDuration);

        // Interpolação suave Bezier com aceleração e desaceleração gradual
        const te = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const currentX = (1 - te) * (1 - te) * startX + 2 * (1 - te) * te * ctrlX + te * te * endX;
        const currentY = (1 - te) * (1 - te) * startY + 2 * (1 - te) * te * ctrlY + te * te * endY;

        targetX = currentX;
        targetY = currentY;

        // Adiciona ponto de rastro luminoso
        trailPoints.push({ x: currentX, y: currentY });
        if (trailPoints.length > 20) trailPoints.shift();

        ctx.clearRect(0, 0, W, H);

        // Desenha cauda de poeira estelar suave (Trail)
        trailPoints.forEach((pt, i) => {
          const ratio = i / trailPoints.length;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, starRadius * (0.2 + ratio * 0.45), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${ratio * 0.25})`;
          ctx.fill();
        });

        // Desenha a estrela em movimento
        drawStar(currentX, currentY, false);

        if (t < 1) {
          animFrameId = requestAnimationFrame(animateMove);
        } else {
          onStarStopped(endX, endY);
        }
      };

      const onStarStopped = (finalX: number, finalY: number) => {
        isMoving = false;
        isStopped = true;
        targetX = finalX;
        targetY = finalY;

        this.sound.playClick();
        this.gameInstruction.set(`Rodada ${roundsDone}/${totalRounds} · ⭐ PAROU! Toque rápido na estrela!`);

        const stopStartTime = performance.now();
        const pulseLoop = (now: number) => {
          if (!isStopped || isTransitioning) return;
          const stopElapsed = (now - stopStartTime) / 1000;
          const pulse = (Math.sin(stopElapsed * 6) + 1) / 2;

          ctx.clearRect(0, 0, W, H);
          drawStar(targetX, targetY, true, pulse);

          animFrameId = requestAnimationFrame(pulseLoop);
        };
        animFrameId = requestAnimationFrame(pulseLoop);

        // Se o paciente não tocar em 4.5 segundos, avisa e avança
        roundTimeout = setTimeout(() => {
          if (!isStopped || isTransitioning) return;
          isTransitioning = true;
          this.recordAttempt(false);
          newRound();
        }, 4500);
      };

      animFrameId = requestAnimationFrame(animateMove);
    };

    // Handler de toque no canvas
    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;

      if (isMoving) {
        // Tocou enquanto ainda estava se movendo
        this.sound.playClick();
        this.gameInstruction.set(`Rodada ${roundsDone}/${totalRounds} · Espere ela parar! Continue seguindo com os olhos 👀`);
        return;
      }

      if (isStopped) {
        const dist = Math.hypot(mx - targetX, my - targetY);
        if (dist <= hitRadius) {
          isTransitioning = true;
          isStopped = false;
          cleanup();

          this.sound.playStarCollect();
          this.recordAttempt(true, true);
          this.gameScore.update(s => s + 15);

          // Efeito de celebração no acerto
          const hitStart = performance.now();
          const burstAnim = (now: number) => {
            const burstElapsed = now - hitStart;
            const progress = Math.min(1, burstElapsed / 260);

            ctx.clearRect(0, 0, W, H);

            // Anel expansivo
            ctx.beginPath();
            ctx.arc(targetX, targetY, starRadius + progress * 32, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - progress})`;
            ctx.lineWidth = 3.5 * (1 - progress * 0.5);
            ctx.stroke();

            // Estrelinhas saindo em 6 direções
            const pDist = progress * 30;
            for (let i = 0; i < 6; i++) {
              const ang = (i * Math.PI) / 3;
              const px = targetX + Math.cos(ang) * (starRadius + pDist);
              const py = targetY + Math.sin(ang) * (starRadius + pDist);
              ctx.fillStyle = `rgba(250, 204, 21, ${1 - progress})`;
              ctx.beginPath();
              ctx.arc(px, py, 2.5 * (1 - progress * 0.4), 0, Math.PI * 2);
              ctx.fill();
            }

            drawStar(targetX, targetY, true, 0);

            if (progress < 1) {
              animFrameId = requestAnimationFrame(burstAnim);
            } else {
              setTimeout(newRound, 120);
            }
          };

          animFrameId = requestAnimationFrame(burstAnim);
        }
      }
    });

    newRound();
  }

  // 9. COMPARAÇÃO MATEMÁTICA (< , = , >)
  setupCompareGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    let currentQ = 0;
    const totalQ = 8;
    const btnW = Math.min(84, (W - 70) / 3);
    const bh = 54;
    const symbols = ['<', '=', '>'];

    const showQuestion = () => {
      if (currentQ >= totalQ) {
        this.finishGame();
        return;
      }
      currentQ++;
      const a = Math.floor(Math.random() * 20) + 1;
      let b = Math.floor(Math.random() * 20) + 1;
      while (b === a) b = Math.floor(Math.random() * 20) + 1;
      const correctSym = a > b ? '>' : a < b ? '<' : '=';

      ctx.clearRect(0, 0, W, H);

      // Caixa de Comparação
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 130, H * 0.12, 260, 75, 16);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${a}   ?   ${b}`, W / 2, H * 0.12 + 38);

      const startX = (W - 3 * (btnW + 12)) / 2;
      const startY = H * 0.52;

      symbols.forEach((sym, i) => {
        const x = startX + i * (btnW + 12);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, startY, btnW, bh, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sym, x + btnW / 2, startY + bh / 2);
      });

      this.gameInstruction.set(`Comparação ${currentQ}/${totalQ}: Qual símbolo completa a sentença?`);

      this.setCanvasHandler(canvas, (mx, my) => {
        symbols.forEach((sym, i) => {
          const x = startX + i * (btnW + 12);
          if (mx >= x && mx <= x + btnW && my >= startY && my <= startY + bh) {
            const correct = sym === correctSym;
            this.recordAttempt(correct);
            if (correct) {
              this.gameScore.update(s => s + 10);
            }
            setTimeout(showQuestion, 250);
          }
        });
      });
    };

    showQuestion();
  }
}
