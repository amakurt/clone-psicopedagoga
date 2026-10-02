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
  { id: 44, name: 'Contagem de Objetos', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '3-6', description: 'Conte os objetos na tela e toque no número correto', type: 'counting' },
  { id: 45, name: 'Tabuada', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Pratique multiplicações de 1 a 10', type: 'math' },
  { id: 46, name: 'Problemas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '6-10', description: 'Resolva historinhas e desafios matemáticos do cotidiano', type: 'problems' },
  { id: 47, name: 'Sequência Crescente', category: 'Matemática', difficulty: 1, time: '3 min', ageRange: '4-7', description: 'Organize os números na ordem crescente', type: 'sequence' },
  { id: 48, name: 'Frações Visuais', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '7-10', description: 'Qual fração representa a pizza colorida?', type: 'fractions' },
  { id: 49, name: 'Formas Geométricas', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '5-9', description: 'Identifique: círculo, quadrado, triângulo, retângulo', type: 'shapes' },
  { id: 50, name: 'Desafio Matemático', category: 'Matemática', difficulty: 2, time: '5 min', ageRange: '8-12', description: 'Misto progressivo: somas, subtrações e tabuadas práticas', type: 'math' },

  { id: 51, name: 'Emoções no Rosto', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Reconheça a expressão do rosto: feliz, triste, bravo, assustado ou surpreso', type: 'social' },
  { id: 52, name: 'Empatia', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '4-8', description: 'Como a pessoa se sente? Escolha a resposta certa', type: 'social' },
  { id: 53, name: 'Situações Sociais', category: 'Socioemocional', difficulty: 2, time: '5 min', ageRange: '5-10', description: 'O que fazer quando alguém está triste na escola?', type: 'social' },
  { id: 54, name: 'Respiração', category: 'Socioemocional', difficulty: 1, time: '3 min', ageRange: '3-8', description: 'Siga o ritmo do balão: inspire ao crescer, segure e expire ao diminuir', type: 'breathing' },
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

  playCalmChime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const notes = [523.25, 659.25, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      const noteT = t + idx * 0.08;
      const dur = 1.1;
      osc.frequency.setValueAtTime(freq, noteT);
      gain.gain.setValueAtTime(0.14, noteT);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteT + dur);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteT);
      osc.stop(noteT + dur);
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
                <div [class.hidden]="!gameStarted()" class="w-full flex flex-col items-center">
                  <canvas #gameCanvas class="rounded-2xl shadow-2xl w-full max-w-[580px] cursor-pointer" style="touch-action: none; -webkit-user-select: none; user-select: none;"></canvas>
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
    if (this.gameData.breathingAnimId) {
      cancelAnimationFrame(this.gameData.breathingAnimId);
      this.gameData.breathingAnimId = null;
    }
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
    const parentContainer = container?.parentElement;
    const measuredW = Math.max(container?.clientWidth || 0, (parentContainer?.clientWidth || 0) - 32);
    const containerWidth = measuredW > 320 ? measuredW : 560;
    const jogo = this.currentGame();
    const isExpandedGame = jogo?.type === 'social' || jogo?.type === 'breathing' || jogo?.type === 'math' || jogo?.type === 'shapes' || jogo?.type === 'fractions' || jogo?.type === 'problems' || jogo?.type === 'counting';
    const maxAvailableH = window.innerHeight 
      ? Math.max(340, window.innerHeight - (isExpandedGame ? 160 : 220)) 
      : (isExpandedGame ? 460 : 320);

    let logicalW = Math.min(isExpandedGame ? 580 : 500, containerWidth);
    const targetAspect = (jogo?.type === 'fractions' || jogo?.type === 'problems' || jogo?.type === 'counting') ? 0.76 : (isExpandedGame ? 0.74 : 0.6);
    let logicalH = Math.round(logicalW * targetAspect);
    if (logicalH > maxAvailableH) {
      logicalH = maxAvailableH;
      logicalW = Math.min(logicalW, Math.round(logicalH / targetAspect));
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
    if (!jogo || !this.canvasCtx) return;
    switch (jogo.type) {
      case 'memory': this.setupMemoryGame(canvas, logicalW, logicalH, jogo.id); break;
      case 'math': 
        if (jogo.id === 46) {
          this.setupProblemsGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 44) {
          this.setupObjectCountingGame(canvas, logicalW, logicalH);
        } else {
          this.setupMathGame(canvas, logicalW, logicalH, jogo.id);
        }
        break;
      case 'problems': this.setupProblemsGame(canvas, logicalW, logicalH); break;
      case 'counting': this.setupObjectCountingGame(canvas, logicalW, logicalH); break;
      case 'shapes': this.setupShapesGame(canvas, logicalW, logicalH); break;
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
      case 'social': 
        if (jogo.id === 51) {
          this.setupEmotionFaceGame(canvas, logicalW, logicalH);
        } else {
          this.setupSocialGame(canvas, logicalW, logicalH, jogo.id);
        }
        break;
      case 'breathing': this.setupBreathingGame(canvas, logicalW, logicalH); break;
      case 'stroop': this.setupStroopGame(canvas, logicalW, logicalH); break;
      case 'tracking': this.setupVisualTrackingGame(canvas, logicalW, logicalH); break;
      case 'fractions': this.setupFractionsGame(canvas, logicalW, logicalH); break;
      case 'tap': 
        if (jogo.id === 6) {
          this.setupVisualTrackingGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 17) {
          this.setupObjectRecallGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 18) {
          this.setupVisualMatchingGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 44) {
          this.setupObjectCountingGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 46) {
          this.setupProblemsGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 48) {
          this.setupFractionsGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 49) {
          this.setupShapesGame(canvas, logicalW, logicalH);
        } else if (jogo.id === 54) {
          this.setupBreathingGame(canvas, logicalW, logicalH);
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
  setupMathGame(canvas: HTMLCanvasElement, W: number, H: number, gameId?: number) {
    const ctx = this.canvasCtx!;
    let currentQ = 0;
    const totalQ = 8;
    let a = 0, b = 0, op = '+', answer = 0;
    let input = '';
    let feedbackStatus: 'none' | 'success' | 'error' = 'none';
    let problemContext = '';

    // Teclado em 3 linhas x 4 colunas (ergonômico e compacto verticalmente):
    // Linha 1: 1, 2, 3, 4
    // Linha 2: 5, 6, 7, 8
    // Linha 3: 9, 0, ⌫, =
    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫', '='];

    const newQuestion = () => {
      if (currentQ >= totalQ) {
        this.finishGame();
        return;
      }
      currentQ++;
      feedbackStatus = 'none';
      input = '';

      if (gameId === 41) {
        // Soma Simples (1 a 15)
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        op = '+';
        answer = a + b;
        problemContext = 'Soma Simples';
      } else if (gameId === 42) {
        // Subtração (resultados positivos)
        a = Math.floor(Math.random() * 18) + 4;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        op = '-';
        answer = a - b;
        problemContext = 'Subtração';
      } else if (gameId === 45) {
        // Tabuada (multiplicação de 1 a 10)
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 1;
        op = '×';
        answer = a * b;
        problemContext = 'Tabuada';
      } else if (gameId === 46) {
        // Problemas matemáticos contextualizados
        const contextType = Math.floor(Math.random() * 3);
        if (contextType === 0) {
          a = Math.floor(Math.random() * 10) + 3;
          b = Math.floor(Math.random() * 8) + 2;
          op = '+';
          answer = a + b;
          problemContext = `Tenho ${a} lápis e ganhei ${b}`;
        } else if (contextType === 1) {
          a = Math.floor(Math.random() * 15) + 5;
          b = Math.floor(Math.random() * (a - 2)) + 1;
          op = '-';
          answer = a - b;
          problemContext = `Havia ${a} balões e estouraram ${b}`;
        } else {
          a = Math.floor(Math.random() * 6) + 2;
          b = Math.floor(Math.random() * 5) + 2;
          op = '×';
          answer = a * b;
          problemContext = `${a} caixas com ${b} itens cada`;
        }
      } else {
        // Desafio Matemático (Game 50 e padrão - progressão pedagógica com andaime cognitivo)
        // Fase 1 (Questões 1-2): Aquecimento com somas e subtrações até 20 (fatos básicos)
        // Fase 2 (Questões 3-4): Tabuadas amigáveis (2, 3, 5, 10) e padrões numéricos
        // Fase 3 (Questões 5-6): Cálculo mental com dezenas acessíveis até 35
        // Fase 4 (Questões 7-8): Desafio estimulante equilibrado (sem sobrecarga de memória)
        if (currentQ <= 2) {
          problemContext = 'Aquecimento';
          if (currentQ === 1 || Math.random() < 0.5) {
            a = Math.floor(Math.random() * 8) + 4; // 4 a 11
            b = Math.floor(Math.random() * 7) + 2; // 2 a 8
            op = '+';
            answer = a + b;
          } else {
            a = Math.floor(Math.random() * 8) + 12; // 12 a 19
            b = Math.floor(Math.random() * 6) + 2;  // 2 a 7
            op = '-';
            answer = a - b;
          }
        } else if (currentQ <= 4) {
          problemContext = 'Tabuadas e Padrões';
          const easyTables = [2, 3, 5, 10];
          const chosenTable = easyTables[Math.floor(Math.random() * easyTables.length)];
          const mult = Math.floor(Math.random() * 7) + 2; // 2 a 8
          if (Math.random() < 0.75) {
            a = chosenTable;
            b = mult;
            op = '×';
            answer = a * b;
          } else {
            a = chosenTable * 2;
            b = Math.floor(Math.random() * 8) + 1;
            op = '+';
            answer = a + b;
          }
        } else if (currentQ <= 6) {
          problemContext = 'Cálculo Mental';
          const type = Math.random();
          if (type < 0.45) {
            // Somas amigáveis até 35
            a = Math.floor(Math.random() * 10) + 12; // 12 a 21
            b = Math.floor(Math.random() * 8) + 3;   // 3 a 10
            op = '+';
            answer = a + b;
          } else if (type < 0.75) {
            // Subtração sem empréstimo confuso
            a = Math.floor(Math.random() * 12) + 20; // 20 a 31
            b = Math.floor(Math.random() * 8) + 4;   // 4 a 11
            op = '-';
            answer = a - b;
          } else {
            // Tabuadas do 3 ou 4
            a = Math.random() < 0.5 ? 3 : 4;
            b = Math.floor(Math.random() * 5) + 3; // 3 a 7
            op = '×';
            answer = a * b;
          }
        } else {
          problemContext = 'Desafio Final';
          const type = Math.random();
          if (type < 0.5) {
            // Multiplicação estimulante e acessível (ex: 4x6, 5x7, 6x4, 3x8)
            const baseA = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
            const baseB = Math.floor(Math.random() * 5) + 3; // 3 a 7
            a = baseA;
            b = baseB;
            op = '×';
            answer = a * b;
          } else if (type < 0.8) {
            // Subtração de dezenas redondas
            a = [25, 30, 35, 40, 50][Math.floor(Math.random() * 5)];
            b = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
            op = '-';
            answer = a - b;
          } else {
            // Adição estruturada de dezenas
            a = Math.floor(Math.random() * 8) + 14; // 14 a 21
            b = Math.floor(Math.random() * 8) + 11; // 11 a 18
            op = '+';
            answer = a + b;
          }
        }
      }

      this.gameInstruction.set(
        problemContext
          ? `${problemContext} • Questão ${currentQ}/${totalQ}: Calcule e aperte '='`
          : `Problema ${currentQ}/${totalQ}: Calcule e aperte '='`
      );
      draw();
    };

    // Geometria Responsiva
    // Visor superior
    const dispY = Math.max(8, Math.floor(H * 0.03));
    const dispH = Math.min(84, Math.max(50, Math.floor(H * 0.22)));
    const dispW = Math.min(380, W - 28);
    const dispX = Math.floor((W - dispW) / 2);

    // Teclado (sempre com margem de segurança no final para nunca cortar)
    const keypadTop = dispY + dispH + Math.max(8, Math.floor(H * 0.03));
    const bottomMargin = Math.max(10, Math.floor(H * 0.035));
    const availableKeypadH = H - keypadTop - bottomMargin;

    const rows = 3;
    const cols = 4;
    const gapY = Math.min(10, Math.max(5, Math.floor((availableKeypadH - 3 * 34) / 4)));
    const bh = Math.min(50, Math.max(34, Math.floor((availableKeypadH - (rows - 1) * gapY) / rows)));
    const actualKeypadH = rows * bh + (rows - 1) * gapY;
    const startY = keypadTop + Math.max(0, Math.floor((availableKeypadH - actualKeypadH) / 2));

    const gapX = Math.min(12, Math.max(6, Math.floor((dispW - 4 * 46) / 3)));
    const bw = Math.min(82, Math.max(46, Math.floor((dispW - (cols - 1) * gapX) / cols)));
    const actualKeypadW = cols * bw + (cols - 1) * gapX;
    const startX = Math.floor((W - actualKeypadW) / 2);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Caixa do Visor / Cálculo
      ctx.save();
      ctx.fillStyle = feedbackStatus === 'success' 
        ? '#064e3b' 
        : feedbackStatus === 'error' 
        ? '#450a0a' 
        : '#0f172a';
      ctx.strokeStyle = feedbackStatus === 'success' 
        ? '#10b981' 
        : feedbackStatus === 'error' 
        ? '#ef4444' 
        : '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(dispX, dispY, dispW, dispH, 14);
      ctx.fill();
      ctx.stroke();

      // Linha superior: Expressão matemática ou contexto
      const exprY = dispY + Math.floor(dispH * 0.36);
      const inputY = dispY + Math.floor(dispH * 0.76);

      ctx.fillStyle = '#94a3b8';
      const exprFontSz = Math.min(18, Math.max(12, Math.floor(dispH * 0.28)));
      ctx.font = `bold ${exprFontSz}px 'Outfit', monospace, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const exprText = problemContext && gameId === 46
        ? `${problemContext} → ${a} ${op} ${b} =`
        : `${a} ${op} ${b} =`;
      ctx.fillText(exprText, W / 2, exprY);

      // Linha inferior: Resposta digitada pelo usuário
      const inputFontSz = Math.min(30, Math.max(18, Math.floor(dispH * 0.44)));
      ctx.font = `bold ${inputFontSz}px monospace, sans-serif`;
      ctx.fillStyle = feedbackStatus === 'success' ? '#34d399' : feedbackStatus === 'error' ? '#f87171' : '#38bdf8';
      ctx.fillText(input ? input : '?', W / 2, inputY);
      ctx.restore();

      // Renderizar Teclado
      buttons.forEach((btn, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (bw + gapX);
        const y = startY + row * (bh + gapY);

        ctx.save();
        // Cores diferenciadas por tipo de tecla:
        // '=' em destaque verde/teal brilhante
        // '⌫' em slate escuro com texto claro
        // Números em fundo card sofisticado
        const isEqual = btn === '=';
        const isBack = btn === '⌫';

        if (isEqual) {
          ctx.fillStyle = '#0d9488';
          ctx.strokeStyle = '#14b8a6';
        } else if (isBack) {
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#475569';
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
        }

        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 10);
        ctx.fill();
        ctx.stroke();

        // Texto do Botão
        ctx.fillStyle = '#ffffff';
        const btnFontSz = isEqual 
          ? Math.min(24, Math.floor(bh * 0.54)) 
          : isBack 
          ? Math.min(20, Math.floor(bh * 0.46)) 
          : Math.min(18, Math.floor(bh * 0.44));
        ctx.font = `bold ${btnFontSz}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn, x + bw / 2, y + bh / 2);
        ctx.restore();
      });
    };

    newQuestion();

    const handleConfirm = () => {
      if (input.length === 0 || feedbackStatus !== 'none') return;
      const parsed = parseInt(input, 10);
      const correct = parsed === answer;
      this.recordAttempt(correct);

      if (correct) {
        feedbackStatus = 'success';
        this.sound.playSuccess();
        this.gameScore.update(s => s + 15);
        draw();
        this.gameData.activeTimeout = setTimeout(() => {
          newQuestion();
        }, 400);
      } else {
        feedbackStatus = 'error';
        this.sound.playError();
        draw();
        this.gameData.activeTimeout = setTimeout(() => {
          feedbackStatus = 'none';
          input = '';
          draw();
        }, 600);
      }
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (feedbackStatus !== 'none') return;

      buttons.forEach((btn, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (bw + gapX);
        const y = startY + row * (bh + gapY);

        if (mx >= x && mx <= x + bw && my >= y && my <= y + bh) {
          this.sound.playClick();

          if (btn === '⌫') {
            input = input.slice(0, -1);
            draw();
          } else if (btn === '=') {
            handleConfirm();
          } else {
            if (input.length < 4) {
              input += btn;
              draw();
            }
          }
        }
      });
    });
  }

  // 3.1 FORMAS GEOMÉTRICAS (JOGO 49)
  setupShapesGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    interface GeometricShape {
      id: string;
      name: string;
      color: string;
      borderColor: string;
      lightColor: string;
      draw: (c: CanvasRenderingContext2D, cx: number, cy: number, size: number) => void;
    }

    const ALL_SHAPES: GeometricShape[] = [
      {
        id: 'circulo',
        name: 'Círculo',
        color: '#ef4444',
        borderColor: '#f87171',
        lightColor: 'rgba(239, 68, 68, 0.18)',
        draw: (c, cx, cy, size) => {
          const r = size * 0.40;
          c.beginPath();
          c.arc(cx, cy, r, 0, Math.PI * 2);
          c.fillStyle = '#ef4444';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#fca5a5';
          c.stroke();
        }
      },
      {
        id: 'quadrado',
        name: 'Quadrado',
        color: '#3b82f6',
        borderColor: '#60a5fa',
        lightColor: 'rgba(59, 130, 246, 0.18)',
        draw: (c, cx, cy, size) => {
          const s = size * 0.68;
          c.beginPath();
          c.roundRect(cx - s / 2, cy - s / 2, s, s, 8);
          c.fillStyle = '#3b82f6';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#93c5fd';
          c.stroke();
        }
      },
      {
        id: 'triangulo',
        name: 'Triângulo',
        color: '#f59e0b',
        borderColor: '#fbbf24',
        lightColor: 'rgba(245, 158, 11, 0.18)',
        draw: (c, cx, cy, size) => {
          const s = size * 0.74;
          c.beginPath();
          c.moveTo(cx, cy - s * 0.52);
          c.lineTo(cx + s * 0.48, cy + s * 0.40);
          c.lineTo(cx - s * 0.48, cy + s * 0.40);
          c.closePath();
          c.fillStyle = '#f59e0b';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#fde68a';
          c.stroke();
        }
      },
      {
        id: 'retangulo',
        name: 'Retângulo',
        color: '#10b981',
        borderColor: '#34d399',
        lightColor: 'rgba(16, 185, 129, 0.18)',
        draw: (c, cx, cy, size) => {
          const rw = size * 0.82;
          const rh = size * 0.48;
          c.beginPath();
          c.roundRect(cx - rw / 2, cy - rh / 2, rw, rh, 8);
          c.fillStyle = '#10b981';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#a7f3d0';
          c.stroke();
        }
      },
      {
        id: 'estrela',
        name: 'Estrela',
        color: '#eab308',
        borderColor: '#fde047',
        lightColor: 'rgba(234, 179, 8, 0.18)',
        draw: (c, cx, cy, size) => {
          const spikes = 5;
          const outerR = size * 0.44;
          const innerR = size * 0.21;
          let rot = (Math.PI / 2) * 3;
          let x = cx;
          let y = cy;
          const step = Math.PI / spikes;
          c.beginPath();
          c.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerR;
            y = cy + Math.sin(rot) * outerR;
            c.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            c.lineTo(x, y);
            rot += step;
          }
          c.lineTo(cx, cy - outerR);
          c.closePath();
          c.fillStyle = '#eab308';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#fef08a';
          c.stroke();
        }
      },
      {
        id: 'losango',
        name: 'Losango',
        color: '#ec4899',
        borderColor: '#f472b6',
        lightColor: 'rgba(236, 72, 153, 0.18)',
        draw: (c, cx, cy, size) => {
          const dw = size * 0.66;
          const dh = size * 0.78;
          c.beginPath();
          c.moveTo(cx, cy - dh / 2);
          c.lineTo(cx + dw / 2, cy);
          c.lineTo(cx, cy + dh / 2);
          c.lineTo(cx - dw / 2, cy);
          c.closePath();
          c.fillStyle = '#ec4899';
          c.fill();
          c.lineWidth = 3;
          c.strokeStyle = '#fbcfe8';
          c.stroke();
        }
      }
    ];

    let currentRound = 0;
    const totalRounds = 10;
    let targetShape: GeometricShape = ALL_SHAPES[0];
    let currentOptions: GeometricShape[] = [];
    let feedbackStatus: 'none' | 'success' | 'error' = 'none';
    let feedbackIndex = -1;

    // Layout Responsivo (Grid 2x2 de Cartões)
    const headerH = Math.min(68, Math.max(48, Math.floor(H * 0.18)));
    const headerY = Math.max(6, Math.floor(H * 0.02));
    const headerW = Math.min(480, W - 24);
    const headerX = Math.floor((W - headerW) / 2);

    const gridY = headerY + headerH + Math.max(8, Math.floor(H * 0.025));
    const bottomGap = Math.max(8, Math.floor(H * 0.025));
    const availGridH = H - gridY - bottomGap;

    const gridW = Math.min(480, W - 24);
    const gridX = Math.floor((W - gridW) / 2);

    const cardGap = Math.min(12, Math.max(8, Math.floor(W * 0.02)));
    const cardW = Math.floor((gridW - cardGap) / 2);
    const cardH = Math.min(130, Math.max(78, Math.floor((availGridH - cardGap) / 2)));
    const actualGridH = cardH * 2 + cardGap;
    const actualGridY = gridY + Math.max(0, Math.floor((availGridH - actualGridH) / 2));

    const newRound = () => {
      if (currentRound >= totalRounds) {
        this.finishGame();
        return;
      }
      currentRound++;
      feedbackStatus = 'none';
      feedbackIndex = -1;

      // Escolher forma alvo
      const targetIdx = Math.floor(Math.random() * ALL_SHAPES.length);
      targetShape = ALL_SHAPES[targetIdx];

      // Escolher 3 distratores distintos
      const distractors = ALL_SHAPES.filter(s => s.id !== targetShape.id);
      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }

      currentOptions = [targetShape, distractors[0], distractors[1], distractors[2]];
      // Embaralhar opções nas 4 posições da grade
      for (let i = currentOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentOptions[i], currentOptions[j]] = [currentOptions[j], currentOptions[i]];
      }

      this.gameInstruction.set(`Rodada ${currentRound}/${totalRounds}: Toque no(a) ${targetShape.name.toUpperCase()}`);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Header Card (Painel da Pergunta)
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(headerX, headerY, headerW, headerH, 12);
      ctx.fill();
      ctx.stroke();

      // Mini badge da forma alvo no cabeçalho
      const badgeSize = Math.floor(headerH * 0.58);
      const badgeX = headerX + 16 + badgeSize / 2;
      const badgeY = headerY + headerH / 2;
      targetShape.draw(ctx, badgeX, badgeY, badgeSize);

      // Texto de Instrução
      ctx.fillStyle = '#94a3b8';
      const promptLabelSz = Math.min(13, Math.max(10, Math.floor(headerH * 0.22)));
      ctx.font = `600 ${promptLabelSz}px 'Outfit', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`DESAFIO GEOMÉTRICO • RODADA ${currentRound}/${totalRounds}`, headerX + 28 + badgeSize, headerY + 10);

      ctx.fillStyle = '#f8fafc';
      const promptTitleSz = Math.min(18, Math.max(14, Math.floor(headerH * 0.32)));
      ctx.font = `bold ${promptTitleSz}px 'Outfit', sans-serif`;
      ctx.fillText(`Encontre o(a): ${targetShape.name.toUpperCase()}`, headerX + 28 + badgeSize, headerY + 12 + promptLabelSz + 4);
      ctx.restore();

      // 2. Grid 2x2 com as 4 opções
      currentOptions.forEach((shape, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = gridX + col * (cardW + cardGap);
        const cy = actualGridY + row * (cardH + cardGap);

        ctx.save();
        const isClicked = feedbackIndex === i;
        const isSuccess = isClicked && feedbackStatus === 'success';
        const isError = isClicked && feedbackStatus === 'error';

        // Fundo do cartão
        if (isSuccess) {
          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
        } else if (isError) {
          ctx.fillStyle = '#450a0a';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
        }

        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();

        // Desenhar forma geométrica vetorial no centro do cartão
        const shapeAreaH = cardH * 0.62;
        const shapeCenterX = cx + cardW / 2;
        const shapeCenterY = cy + shapeAreaH * 0.52 + 4;
        const shapeSize = Math.min(shapeAreaH * 0.88, cardW * 0.52);

        shape.draw(ctx, shapeCenterX, shapeCenterY, shapeSize);

        // Nome da forma geométrica no rodapé do cartão
        ctx.fillStyle = isSuccess ? '#34d399' : isError ? '#f87171' : '#f1f5f9';
        const labelFontSz = Math.min(15, Math.max(12, Math.floor(cardH * 0.17)));
        ctx.font = `bold ${labelFontSz}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shape.name, cx + cardW / 2, cy + cardH - 14);

        ctx.restore();
      });
    };

    newRound();

    this.setCanvasHandler(canvas, (mx, my) => {
      if (feedbackStatus !== 'none') return;

      currentOptions.forEach((shape, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = gridX + col * (cardW + cardGap);
        const cy = actualGridY + row * (cardH + cardGap);

        if (mx >= cx && mx <= cx + cardW && my >= cy && my <= cy + cardH) {
          feedbackIndex = i;
          const isCorrect = shape.id === targetShape.id;
          this.recordAttempt(isCorrect);

          if (isCorrect) {
            feedbackStatus = 'success';
            this.sound.playSuccess();
            this.gameScore.update(s => s + 15);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              newRound();
            }, 450);
          } else {
            feedbackStatus = 'error';
            this.sound.playError();
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              feedbackStatus = 'none';
              feedbackIndex = -1;
              draw();
            }, 600);
          }
        }
      });
    });
  }

  // 3.2 FRAÇÕES VISUAIS (JOGO 48 - DISCO/PIZZA FRACIONÁRIA)
  setupFractionsGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    interface FractionOption {
      num: number;
      den: number;
      name: string;
      sub: string;
      isCorrect: boolean;
    }

    const TRIALS_DATA: { 
      num: number; 
      den: number; 
      name: string; 
      sub: string; 
      altOptions: { num: number; den: number; name: string; sub: string }[] 
    }[] = [
      {
        num: 1, den: 2, name: 'Um Meio', sub: '1 de 2 (Metade)',
        altOptions: [
          { num: 1, den: 4, name: 'Um Quarto', sub: '1 de 4 fatias' },
          { num: 2, den: 2, name: 'Dois Meios', sub: '2 de 2 (Inteiro)' },
          { num: 1, den: 3, name: 'Um Terço', sub: '1 de 3 fatias' }
        ]
      },
      {
        num: 1, den: 4, name: 'Um Quarto', sub: '1 de 4 fatias',
        altOptions: [
          { num: 3, den: 4, name: 'Três Quartos', sub: '3 de 4 fatias' },
          { num: 1, den: 2, name: 'Um Meio', sub: '1 de 2 (Metade)' },
          { num: 2, den: 4, name: 'Dois Quartos', sub: '2 de 4 fatias' }
        ]
      },
      {
        num: 3, den: 4, name: 'Três Quartos', sub: '3 de 4 fatias',
        altOptions: [
          { num: 1, den: 4, name: 'Um Quarto', sub: '1 de 4 fatias' },
          { num: 2, den: 4, name: 'Dois Quartos', sub: '2 de 4 fatias' },
          { num: 3, den: 8, name: 'Três Oitavos', sub: '3 de 8 fatias' }
        ]
      },
      {
        num: 1, den: 3, name: 'Um Terço', sub: '1 de 3 fatias',
        altOptions: [
          { num: 2, den: 3, name: 'Dois Terços', sub: '2 de 3 fatias' },
          { num: 1, den: 2, name: 'Um Meio', sub: '1 de 2 (Metade)' },
          { num: 1, den: 6, name: 'Um Sexto', sub: '1 de 6 fatias' }
        ]
      },
      {
        num: 2, den: 3, name: 'Dois Terços', sub: '2 de 3 fatias',
        altOptions: [
          { num: 1, den: 3, name: 'Um Terço', sub: '1 de 3 fatias' },
          { num: 3, den: 3, name: 'Três Terços', sub: '3 de 3 (Inteiro)' },
          { num: 2, den: 4, name: 'Dois Quartos', sub: '2 de 4 fatias' }
        ]
      },
      {
        num: 2, den: 4, name: 'Dois Quartos', sub: '2 de 4 fatias',
        altOptions: [
          { num: 1, den: 4, name: 'Um Quarto', sub: '1 de 4 fatias' },
          { num: 3, den: 4, name: 'Três Quartos', sub: '3 de 4 fatias' },
          { num: 2, den: 6, name: 'Dois Sextos', sub: '2 de 6 fatias' }
        ]
      },
      {
        num: 4, den: 6, name: 'Quatro Sextos', sub: '4 de 6 fatias',
        altOptions: [
          { num: 2, den: 6, name: 'Dois Sextos', sub: '2 de 6 fatias' },
          { num: 3, den: 6, name: 'Três Sextos', sub: '3 de 6 fatias' },
          { num: 4, den: 8, name: 'Quatro Oitavos', sub: '4 de 8 fatias' }
        ]
      },
      {
        num: 3, den: 8, name: 'Três Oitavos', sub: '3 de 8 fatias',
        altOptions: [
          { num: 5, den: 8, name: 'Cinco Oitavos', sub: '5 de 8 fatias' },
          { num: 3, den: 4, name: 'Três Quartos', sub: '3 de 4 fatias' },
          { num: 1, den: 8, name: 'Um Oitavo', sub: '1 de 8 fatias' }
        ]
      },
      {
        num: 5, den: 8, name: 'Cinco Oitavos', sub: '5 de 8 fatias',
        altOptions: [
          { num: 3, den: 8, name: 'Três Oitavos', sub: '3 de 8 fatias' },
          { num: 7, den: 8, name: 'Sete Oitavos', sub: '7 de 8 fatias' },
          { num: 5, den: 6, name: 'Cinco Sextos', sub: '5 de 6 fatias' }
        ]
      },
      {
        num: 3, den: 6, name: 'Três Sextos', sub: '3 de 6 (Metade)',
        altOptions: [
          { num: 2, den: 6, name: 'Dois Sextos', sub: '2 de 6 fatias' },
          { num: 4, den: 6, name: 'Quatro Sextos', sub: '4 de 6 fatias' },
          { num: 1, den: 6, name: 'Um Sexto', sub: '1 de 6 fatias' }
        ]
      }
    ];

    // Embaralhar banco de desafios
    const pool = [...TRIALS_DATA];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let currentRound = 0;
    const totalRounds = 8;
    let currentTrial = pool[0];
    let currentOptions: FractionOption[] = [];
    let feedbackStatus: 'none' | 'success' | 'error' = 'none';
    let feedbackIndex = -1;

    // GEOMETRIA GARANTIDA E ANCORADA DE BAIXO PARA CIMA (BOTTOM-UP)
    // As caixas de baixo NUNCA são cortadas porque são calculadas a partir da base do canvas.
    const bottomPad = 12;
    const cardGap = 10;
    const cardH = Math.min(56, Math.max(46, Math.floor(H * 0.155)));
    const gridH = cardH * 2 + cardGap;
    const gridY = H - bottomPad - gridH;

    const gridW = Math.min(520, W - 20);
    const gridX = Math.floor((W - gridW) / 2);
    const cardW = Math.floor((gridW - cardGap) / 2);

    // Área nobre superior para a Pizza Fracionária
    const topPad = 8;
    const availPizzaH = gridY - topPad;
    const pizzaCx = W / 2;
    const pizzaCy = topPad + Math.floor(availPizzaH * 0.44);
    const pizzaR = Math.min(76, Math.max(42, Math.floor(Math.min(availPizzaH * 0.38, (W - 32) * 0.22))));
    const badgeY = pizzaCy + pizzaR + Math.min(18, Math.max(11, Math.floor((gridY - (pizzaCy + pizzaR)) / 2)));

    const getOptionBounds = (i: number) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return {
        bx: gridX + col * (cardW + cardGap),
        by: gridY + row * (cardH + cardGap),
        bw: cardW,
        bh: cardH
      };
    };

    const newRound = () => {
      if (currentRound >= totalRounds) {
        this.finishGame();
        return;
      }
      currentRound++;
      feedbackStatus = 'none';
      feedbackIndex = -1;

      currentTrial = pool[(currentRound - 1) % pool.length];

      const correctOpt: FractionOption = {
        num: currentTrial.num,
        den: currentTrial.den,
        name: currentTrial.name,
        sub: currentTrial.sub,
        isCorrect: true
      };

      const distractorOpts: FractionOption[] = currentTrial.altOptions.map(alt => ({
        num: alt.num,
        den: alt.den,
        name: alt.name,
        sub: alt.sub,
        isCorrect: false
      }));

      currentOptions = [correctOpt, ...distractorOpts];
      for (let i = currentOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentOptions[i], currentOptions[j]] = [currentOptions[j], currentOptions[i]];
      }

      this.gameInstruction.set(`Rodada ${currentRound}/${totalRounds}: Qual fração representa a parte colorida da pizza?`);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Pizza Fracionária Vetorial
      // Crosta externa assada
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      ctx.arc(pizzaCx, pizzaCy, pizzaR + 6, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309'; // crosta assada
      ctx.fill();

      // Fundo das fatias vazias
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.arc(pizzaCx, pizzaCy, pizzaR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.restore();

      // Fatias
      const step = (Math.PI * 2) / currentTrial.den;
      const baseAngle = -Math.PI / 2;

      for (let i = 0; i < currentTrial.den; i++) {
        const startA = baseAngle + i * step;
        const endA = startA + step;
        const isColored = i < currentTrial.num;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pizzaCx, pizzaCy);
        ctx.arc(pizzaCx, pizzaCy, pizzaR, startA, endA);
        ctx.closePath();

        if (isColored) {
          // Queijo dourado e textura de recheio
          const grad = ctx.createRadialGradient(pizzaCx, pizzaCy, pizzaR * 0.15, pizzaCx, pizzaCy, pizzaR);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.45, '#f59e0b');
          grad.addColorStop(1, '#d97706');
          ctx.fillStyle = grad;
          ctx.fill();

          // Detalhe de tomate da pizza
          const midAngle = startA + step / 2;
          const toppingDist = pizzaR * 0.60;
          const tx = pizzaCx + Math.cos(midAngle) * toppingDist;
          const ty = pizzaCy + Math.sin(midAngle) * toppingDist;

          ctx.beginPath();
          ctx.arc(tx, ty, Math.max(3, pizzaR * 0.08), 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(tx - 1, ty - 1, Math.max(1, pizzaR * 0.03), 0, Math.PI * 2);
          ctx.fillStyle = '#fca5a5';
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fill();
        }

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Linhas divisórias radiais
      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < currentTrial.den; i++) {
        const ang = baseAngle + i * step;
        ctx.beginPath();
        ctx.moveTo(pizzaCx, pizzaCy);
        ctx.lineTo(pizzaCx + Math.cos(ang) * (pizzaR + 6), pizzaCy + Math.sin(ang) * (pizzaR + 6));
        ctx.stroke();
      }
      ctx.restore();

      // Centro da pizza (pino central)
      ctx.save();
      ctx.beginPath();
      ctx.arc(pizzaCx, pizzaCy, Math.max(8, pizzaR * 0.14), 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
      ctx.restore();

      // Legenda pedagógica
      ctx.save();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🍕 ${currentTrial.num} de ${currentTrial.den} fatias coloridas`, pizzaCx, badgeY);
      ctx.restore();

      // 2. Cartões de Alternativas (Grid 2x2 com Pílula de Fração + Título e Subtítulo)
      currentOptions.forEach((opt, i) => {
        const { bx, by, bw, bh } = getOptionBounds(i);

        ctx.save();
        const isSelected = feedbackIndex === i;

        if (isSelected) {
          if (feedbackStatus === 'success') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.strokeStyle = '#10b981';
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.strokeStyle = '#ef4444';
          }
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
        }

        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();

        // Pílula da Fração no lado esquerdo
        const pillW = Math.min(52, Math.max(42, Math.floor(bw * 0.22)));
        const pillH = bh - 12;
        const pillX = bx + 6;
        const pillY = by + 6;

        ctx.fillStyle = isSelected && feedbackStatus === 'success' 
          ? 'rgba(16, 185, 129, 0.35)' 
          : isSelected && feedbackStatus === 'error'
          ? 'rgba(239, 68, 68, 0.35)'
          : 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8);
        ctx.fill();

        // Fração clássica dentro da pílula
        const fracX = pillX + pillW / 2;
        const midY = pillY + pillH / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isSelected && feedbackStatus === 'success' ? '#34d399' : '#ffffff';
        ctx.font = 'bold 15px Outfit, monospace, sans-serif';

        // Numerador
        ctx.fillText(`${opt.num}`, fracX, midY - 9);
        // Linha de fração
        ctx.strokeStyle = isSelected && feedbackStatus === 'success' ? '#34d399' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fracX - 10, midY);
        ctx.lineTo(fracX + 10, midY);
        ctx.stroke();
        // Denominador
        ctx.fillText(`${opt.den}`, fracX, midY + 10);

        // Bloco de texto no lado direito (Nome principal + Subtítulo)
        const textX = pillX + pillW + 10;
        const availTextW = bw - (textX - bx) - 8;

        ctx.textAlign = 'left';
        // Linha 1: Nome principal (ex.: "Três Quartos")
        ctx.fillStyle = isSelected && feedbackStatus === 'success' ? '#6ee7b7' : '#ffffff';
        const nameFontSz = Math.min(14, Math.max(12, Math.floor(bw * 0.065)));
        ctx.font = `bold ${nameFontSz}px 'Outfit', sans-serif`;
        ctx.fillText(opt.name, textX, by + bh * 0.36, availTextW);

        // Linha 2: Subtítulo (ex.: "3 de 4 fatias")
        ctx.fillStyle = isSelected && feedbackStatus === 'success' ? '#a7f3d0' : '#94a3b8';
        const subFontSz = Math.min(11, Math.max(10, Math.floor(bw * 0.052)));
        ctx.font = `500 ${subFontSz}px 'Outfit', sans-serif`;
        ctx.fillText(opt.sub, textX, by + bh * 0.72, availTextW);

        ctx.restore();
      });
    };

    newRound();

    this.setCanvasHandler(canvas, (mx, my) => {
      if (feedbackStatus !== 'none') return;

      currentOptions.forEach((opt, i) => {
        const { bx, by, bw, bh } = getOptionBounds(i);

        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
          feedbackIndex = i;
          const isCorrect = opt.isCorrect;
          this.recordAttempt(isCorrect);

          if (isCorrect) {
            feedbackStatus = 'success';
            this.sound.playSuccess();
            this.gameScore.update(s => s + 15);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              newRound();
            }, 480);
          } else {
            feedbackStatus = 'error';
            this.sound.playError();
            this.gameInstruction.set(`Dica: Conte as fatias pintadas (${currentTrial.num}) sobre o total de fatias (${currentTrial.den})!`);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              feedbackStatus = 'none';
              feedbackIndex = -1;
              this.gameInstruction.set(`Rodada ${currentRound}/${totalRounds}: Qual fração representa a parte colorida da pizza?`);
              draw();
            }, 750);
          }
        }
      });
    });
  }

  // 3.1 PROBLEMAS MATEMÁTICOS CONTEXTUALIZADOS (HISTORINHAS ACESSÍVEIS PARA 6-10 ANOS)
  setupProblemsGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    interface ProblemTrial {
      emoji: string;
      theme: string;
      line1: string;
      line2: string;
      equation: string;
      unit: string;
      correctVal: number;
      distractors: number[];
    }

    const PROBLEMS_DATA: ProblemTrial[] = [
      {
        emoji: '🍎',
        theme: 'Cesta de Maçãs',
        line1: 'Lucas colheu 5 maçãs no pomar.',
        line2: 'Ganhou mais 3 da mamãe. Quantas tem agora?',
        equation: '5 + 3 = ?',
        unit: 'maçãs',
        correctVal: 8,
        distractors: [7, 9, 6]
      },
      {
        emoji: '🎈',
        theme: 'Festa de Balões',
        line1: 'Havia 9 balões coloridos na sala.',
        line2: '4 balões estouraram. Quantos sobraram?',
        equation: '9 - 4 = ?',
        unit: 'balões',
        correctVal: 5,
        distractors: [6, 4, 7]
      },
      {
        emoji: '✏️',
        theme: 'Estojo Escolar',
        line1: 'Ana tinha 6 lápis de cor no estojo.',
        line2: 'Ganhou mais 6 de presente. Quantos tem?',
        equation: '6 + 6 = ?',
        unit: 'lápis',
        correctVal: 12,
        distractors: [10, 11, 14]
      },
      {
        emoji: '🚗',
        theme: 'Garagem de Brinquedo',
        line1: 'Pedro tinha 10 carrinhos na pista.',
        line2: 'Guardou 3 na caixa. Quantos ficaram?',
        equation: '10 - 3 = ?',
        unit: 'carrinhos',
        correctVal: 7,
        distractors: [8, 6, 9]
      },
      {
        emoji: '🍪',
        theme: 'Biscoitos da Vovó',
        line1: 'A vovó assou 8 biscoitos quentinhos.',
        line2: 'Comemos 5 no café. Quantos sobraram?',
        equation: '8 - 5 = ?',
        unit: 'biscoitos',
        correctVal: 3,
        distractors: [4, 2, 5]
      },
      {
        emoji: '🐦',
        theme: 'Passarinhos no Galho',
        line1: 'Havia 4 passarinhos no galho da árvore.',
        line2: 'Chegaram mais 5 amigos. Quantos estão lá?',
        equation: '4 + 5 = ?',
        unit: 'passarinhos',
        correctVal: 9,
        distractors: [8, 10, 7]
      },
      {
        emoji: '🍬',
        theme: 'Caixas de Doces',
        line1: 'Sofia tem 2 caixinhas de bombons.',
        line2: 'Cada caixinha tem 4 bombons. Quantos no total?',
        equation: '2 × 4 = ?',
        unit: 'bombons',
        correctVal: 8,
        distractors: [6, 9, 10]
      },
      {
        emoji: '⚽',
        theme: 'Gols do Recreio',
        line1: 'O time fez 7 gols no primeiro tempo.',
        line2: 'No segundo tempo fez mais 4. Quantos ao todo?',
        equation: '7 + 4 = ?',
        unit: 'gols',
        correctVal: 11,
        distractors: [10, 12, 13]
      },
      {
        emoji: '⭐',
        theme: 'Álbum de Figurinhas',
        line1: 'Léo tinha 12 figurinhas repetidas.',
        line2: 'Ele deu 5 para um colega. Quantas restaram?',
        equation: '12 - 5 = ?',
        unit: 'figurinhas',
        correctVal: 7,
        distractors: [8, 6, 9]
      },
      {
        emoji: '🧁',
        theme: 'Bandeja de Bolinhos',
        line1: 'Mamãe arrumou 3 pratos na mesa.',
        line2: 'Colocou 3 bolinhos em cada prato. Quantos são?',
        equation: '3 × 3 = ?',
        unit: 'bolinhos',
        correctVal: 9,
        distractors: [6, 8, 12]
      }
    ];

    // Embaralhar banco de desafios
    const pool = [...PROBLEMS_DATA];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let currentRound = 0;
    const totalRounds = 8;
    let currentTrial = pool[0];
    let currentOptions: { val: number; label: string; isCorrect: boolean }[] = [];
    let feedbackStatus: 'none' | 'success' | 'error' = 'none';
    let feedbackIndex = -1;

    // GEOMETRIA GARANTIDA E ANCORADA DE BAIXO PARA CIMA (BOTTOM-UP)
    const bottomPad = 12;
    const cardGap = 10;
    const cardH = Math.min(56, Math.max(46, Math.floor(H * 0.155)));
    const gridH = cardH * 2 + cardGap;
    const gridY = H - bottomPad - gridH;

    const gridW = Math.min(520, W - 20);
    const gridX = Math.floor((W - gridW) / 2);
    const cardW = Math.floor((gridW - cardGap) / 2);

    // Área do Card da História no Topo (aproveita todo o espaço superior sem sobreposições)
    const topPad = 8;
    const storyCardX = gridX;
    const storyCardY = topPad;
    const storyCardW = gridW;
    const storyCardH = gridY - topPad - 10;

    const getOptionBounds = (i: number) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return {
        bx: gridX + col * (cardW + cardGap),
        by: gridY + row * (cardH + cardGap),
        bw: cardW,
        bh: cardH
      };
    };

    const newRound = () => {
      if (currentRound >= totalRounds) {
        this.finishGame();
        return;
      }
      currentRound++;
      feedbackStatus = 'none';
      feedbackIndex = -1;

      currentTrial = pool[(currentRound - 1) % pool.length];

      const opts: { val: number; label: string; isCorrect: boolean }[] = [
        {
          val: currentTrial.correctVal,
          label: `${currentTrial.correctVal} ${currentTrial.unit}`,
          isCorrect: true
        },
        ...currentTrial.distractors.map(d => ({
          val: d,
          label: `${d} ${currentTrial.unit}`,
          isCorrect: false
        }))
      ];

      // Embaralhar alternativas
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      currentOptions = opts;

      this.gameInstruction.set(`Problema ${currentRound}/${totalRounds}: Leia a historinha e toque na resposta certa!`);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Cartão da Historinha (Topo)
      ctx.save();
      const cardGrad = ctx.createLinearGradient(storyCardX, storyCardY, storyCardX, storyCardY + storyCardH);
      cardGrad.addColorStop(0, '#1e293b');
      cardGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = cardGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(storyCardX, storyCardY, storyCardW, storyCardH, 14);
      ctx.fill();
      ctx.stroke();

      // Topo do card: Emoji + Tema + Badge de Rodada
      const headerY = storyCardY + 22;

      // Emoji
      ctx.font = '20px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentTrial.emoji, storyCardX + 14, headerY);

      // Badge de Rodada (Direita)
      const badgeText = `Problema ${currentRound}/${totalRounds}`;
      ctx.font = '600 11px "Outfit", sans-serif';
      const badgeW = ctx.measureText(badgeText).width + 16;
      const badgeH = 20;
      const badgeX = storyCardX + storyCardW - 14 - badgeW;
      const badgeY = headerY - badgeH / 2;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, badgeX + badgeW / 2, headerY);

      // Tema (com largura máxima para nunca colidir com a badge)
      const maxThemeW = Math.max(50, badgeX - (storyCardX + 44) - 10);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(currentTrial.theme, storyCardX + 42, headerY, maxThemeW);

      // Linha Divisória
      const divY = storyCardY + 44;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(storyCardX + 14, divY);
      ctx.lineTo(storyCardX + storyCardW - 14, divY);
      ctx.stroke();

      // Pílula da Equação / Dica Simbólica (Base do Card da História)
      const eqH = 26;
      const eqW = Math.min(140, Math.max(100, Math.floor(storyCardW * 0.26)));
      const eqX = storyCardX + (storyCardW - eqW) / 2;
      const eqY = storyCardY + storyCardH - eqH - 10;

      // Texto da Historinha (Linha 1 e Linha 2 com centralização vertical no espaço livre)
      const storyAreaTop = divY + 6;
      const storyAreaBottom = eqY - 6;
      const storyCenterY = storyAreaTop + (storyAreaBottom - storyAreaTop) / 2;
      const lineSpacing = Math.min(26, Math.max(20, Math.floor((storyAreaBottom - storyAreaTop) * 0.34)));
      const line1Y = storyCenterY - lineSpacing / 2;
      const line2Y = storyCenterY + lineSpacing / 2;
      const storyFontSz = Math.min(15, Math.max(12, Math.floor(storyCardW * 0.035)));

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 ${storyFontSz}px 'Outfit', sans-serif`;
      ctx.fillText(currentTrial.line1, storyCardX + storyCardW / 2, line1Y, storyCardW - 28);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `500 ${storyFontSz}px 'Outfit', sans-serif`;
      ctx.fillText(currentTrial.line2, storyCardX + storyCardW / 2, line2Y, storyCardW - 28);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(eqX, eqY, eqW, eqH, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 13px "Outfit", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentTrial.equation, eqX + eqW / 2, eqY + eqH / 2);
      ctx.restore();

      // 2. Cartões de Alternativas (Grid 2x2 Ancorado de Baixo para Cima)
      currentOptions.forEach((opt, i) => {
        const { bx, by, bw, bh } = getOptionBounds(i);

        ctx.save();
        const isSelected = feedbackIndex === i;

        if (isSelected) {
          if (feedbackStatus === 'success') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.strokeStyle = '#10b981';
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.strokeStyle = '#ef4444';
          }
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
        }

        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();

        // Pílula do Número no Lado Esquerdo
        const pillW = Math.min(46, Math.max(34, Math.floor(bw * 0.2)));
        const pillH = bh - 12;
        const pillX = bx + 6;
        const pillY = by + 6;

        ctx.fillStyle = isSelected && feedbackStatus === 'success'
          ? 'rgba(16, 185, 129, 0.35)'
          : isSelected && feedbackStatus === 'error'
          ? 'rgba(239, 68, 68, 0.35)'
          : 'rgba(51, 65, 85, 0.5)';
        ctx.strokeStyle = isSelected && feedbackStatus === 'success'
          ? '#34d399'
          : isSelected && feedbackStatus === 'error'
          ? '#f87171'
          : 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected && feedbackStatus === 'success' ? '#6ee7b7' : '#ffffff';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${opt.val}`, pillX + pillW / 2, pillY + pillH / 2);

        // Bloco de Texto no Lado Direito (Ex: "8 maçãs")
        const textX = pillX + pillW + 10;
        const availTextW = bw - (textX - bx) - 8;

        ctx.textAlign = 'left';
        ctx.fillStyle = isSelected && feedbackStatus === 'success' ? '#6ee7b7' : '#f1f5f9';
        const optFontSz = Math.min(14, Math.max(11, Math.floor(bw * 0.062)));
        ctx.font = `bold ${optFontSz}px 'Outfit', sans-serif`;
        ctx.fillText(opt.label, textX, by + bh / 2, availTextW);

        ctx.restore();
      });
    };

    newRound();

    this.setCanvasHandler(canvas, (mx, my) => {
      if (feedbackStatus !== 'none') return;

      currentOptions.forEach((opt, i) => {
        const { bx, by, bw, bh } = getOptionBounds(i);

        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
          feedbackIndex = i;
          const isCorrect = opt.isCorrect;
          this.recordAttempt(isCorrect);

          if (isCorrect) {
            feedbackStatus = 'success';
            this.sound.playSuccess();
            this.gameScore.update(s => s + 15);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              newRound();
            }, 480);
          } else {
            feedbackStatus = 'error';
            this.sound.playError();
            this.gameInstruction.set(`Dica: Veja a continha ${currentTrial.equation.replace('?', '...')} e tente outra opção!`);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              feedbackStatus = 'none';
              feedbackIndex = -1;
              this.gameInstruction.set(`Problema ${currentRound}/${totalRounds}: Leia a historinha e toque na resposta certa!`);
              draw();
            }, 750);
          }
        }
      });
    });
  }

  // 3.2 CONTAGEM DE OBJETOS COM SUPORTE SEMIÓTICO E CORRESPONDÊNCIA BIUNÍVOCA (3 A 6 ANOS)
  setupObjectCountingGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    interface CountingItem {
      x: number;
      y: number;
      r: number;
      counted: boolean;
      countOrder?: number;
    }

    interface CountingTrial {
      emoji: string;
      theme: string;
      question: string;
      unit: string;
      targetCount: number;
      options: number[];
    }

    const COUNTING_DATA: CountingTrial[] = [
      {
        emoji: '🦆',
        theme: 'Patinhos',
        question: 'Quantos patinhos você vê na lagoa?',
        unit: 'patinhos',
        targetCount: 2,
        options: [2, 1, 3, 4]
      },
      {
        emoji: '🍎',
        theme: 'Maçãs',
        question: 'Quantas maçãs vermelhas na fruteira?',
        unit: 'maçãs',
        targetCount: 3,
        options: [3, 2, 4, 1]
      },
      {
        emoji: '⭐',
        theme: 'Estrelas',
        question: 'Quantas estrelinhas estão brilhando?',
        unit: 'estrelas',
        targetCount: 4,
        options: [4, 3, 5, 2]
      },
      {
        emoji: '🚗',
        theme: 'Carrinhos',
        question: 'Quantos carrinhos têm na pista?',
        unit: 'carrinhos',
        targetCount: 3,
        options: [3, 4, 2, 5]
      },
      {
        emoji: '🦋',
        theme: 'Borboletas',
        question: 'Quantas borboletas voando no jardim?',
        unit: 'borboletas',
        targetCount: 5,
        options: [5, 4, 6, 3]
      },
      {
        emoji: '🎈',
        theme: 'Balões',
        question: 'Quantos balões coloridos na festa?',
        unit: 'balões',
        targetCount: 4,
        options: [4, 5, 3, 6]
      },
      {
        emoji: '🐶',
        theme: 'Cachorrinhos',
        question: 'Quantos cachorrinhos no parque?',
        unit: 'cachorrinhos',
        targetCount: 5,
        options: [5, 6, 4, 7]
      },
      {
        emoji: '🍪',
        theme: 'Biscoitos',
        question: 'Quantos biscoitos têm no pratinho?',
        unit: 'biscoitos',
        targetCount: 6,
        options: [6, 5, 7, 4]
      },
      {
        emoji: '🐠',
        theme: 'Peixinhos',
        question: 'Quantos peixinhos nadando no aquário?',
        unit: 'peixinhos',
        targetCount: 5,
        options: [5, 4, 6, 3]
      },
      {
        emoji: '🌸',
        theme: 'Florzinhas',
        question: 'Quantas florzinhas você pode contar?',
        unit: 'florzinhas',
        targetCount: 7,
        options: [7, 6, 8, 5]
      }
    ];

    // Configurações simétricas de posições relativas (rx, ry) para cada quantidade N (1 a 8)
    const SLOT_CONFIGS: Record<number, [number, number][]> = {
      1: [[0.5, 0.5]],
      2: [[0.34, 0.5], [0.66, 0.5]],
      3: [[0.24, 0.5], [0.5, 0.5], [0.76, 0.5]],
      4: [[0.34, 0.34], [0.66, 0.34], [0.34, 0.66], [0.66, 0.66]],
      5: [[0.26, 0.32], [0.74, 0.32], [0.5, 0.5], [0.26, 0.68], [0.74, 0.68]],
      6: [[0.24, 0.34], [0.5, 0.34], [0.76, 0.34], [0.24, 0.66], [0.5, 0.66], [0.76, 0.66]],
      7: [[0.22, 0.32], [0.5, 0.32], [0.78, 0.32], [0.5, 0.5], [0.22, 0.68], [0.5, 0.68], [0.78, 0.68]],
      8: [[0.2, 0.34], [0.4, 0.34], [0.6, 0.34], [0.8, 0.34], [0.2, 0.66], [0.4, 0.66], [0.6, 0.66], [0.8, 0.66]]
    };

    // Embaralhar desafios
    const pool = [...COUNTING_DATA];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let currentRound = 0;
    const totalRounds = 8;
    let currentTrial = pool[0];
    let items: CountingItem[] = [];
    let currentOptions: number[] = [];
    let feedbackStatus: 'none' | 'success' | 'error' = 'none';
    let feedbackIndex = -1;
    let countedCount = 0;

    // GEOMETRIA RESPONSIVA BOTTOM-UP
    const bottomPad = 12;
    const btnH = Math.min(56, Math.max(46, Math.floor(H * 0.145)));
    const btnGap = 10;
    const gridW = Math.min(520, W - 20);
    const gridX = Math.floor((W - gridW) / 2);
    const btnW = Math.floor((gridW - 3 * btnGap) / 4);
    const btnY = H - bottomPad - btnH;

    // Header superior
    const topPad = 8;
    const headerH = 34;

    // Bandeja de contagem / Vitrine no centro
    const showcaseX = gridX;
    const showcaseY = topPad + headerH + 6;
    const showcaseW = gridW;
    const showcaseH = btnY - showcaseY - 10;

    const getBtnBounds = (i: number) => ({
      bx: gridX + i * (btnW + btnGap),
      by: btnY,
      bw: btnW,
      bh: btnH
    });

    const newRound = () => {
      if (currentRound >= totalRounds) {
        this.finishGame();
        return;
      }
      currentRound++;
      feedbackStatus = 'none';
      feedbackIndex = -1;
      countedCount = 0;

      currentTrial = pool[(currentRound - 1) % pool.length];

      // Embaralhar alternativas
      const opts = [...currentTrial.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      currentOptions = opts;

      // Calcular coordenadas dos objetos
      const slots = SLOT_CONFIGS[currentTrial.targetCount] || SLOT_CONFIGS[4];
      const itemR = Math.min(36, Math.max(26, Math.floor(showcaseH * 0.155)));
      items = slots.map(slot => ({
        x: showcaseX + Math.floor(slot[0] * showcaseW),
        y: showcaseY + Math.floor(slot[1] * showcaseH),
        r: itemR,
        counted: false
      }));

      this.gameInstruction.set(`Rodada ${currentRound}/${totalRounds}: Toque nos itens para contar e escolha o número certo!`);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // 1. Header Superior
      ctx.save();
      const headerY = topPad + headerH / 2;

      // Emoji e Pergunta
      ctx.font = '20px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentTrial.emoji, showcaseX + 4, headerY);

      // Badge de Rodada (Direita)
      const badgeText = `Rodada ${currentRound}/${totalRounds}`;
      ctx.font = '600 11px "Outfit", sans-serif';
      const badgeW = ctx.measureText(badgeText).width + 16;
      const badgeH = 20;
      const badgeX = showcaseX + showcaseW - badgeW;
      const badgeY = headerY - badgeH / 2;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, badgeX + badgeW / 2, headerY);

      // Pergunta
      const maxQWidth = badgeX - (showcaseX + 34) - 10;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(currentTrial.question, showcaseX + 32, headerY, maxQWidth);
      ctx.restore();

      // 2. Vitrine de Objetos (Showcase Tray)
      ctx.save();
      const trayGrad = ctx.createLinearGradient(showcaseX, showcaseY, showcaseX, showcaseY + showcaseH);
      trayGrad.addColorStop(0, '#1e293b');
      trayGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = trayGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(showcaseX, showcaseY, showcaseW, showcaseH, 16);
      ctx.fill();
      ctx.stroke();

      // Dica sutil no topo da bandeja se nenhum item foi tocado ainda
      if (countedCount === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '500 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Toque nos objetos para contar um por um!', showcaseX + showcaseW / 2, showcaseY + 16);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Contados: ${countedCount} de ${currentTrial.targetCount} ${currentTrial.unit}`, showcaseX + showcaseW / 2, showcaseY + 16);
      }

      // Renderizar cada objeto
      const emojiFontSz = Math.min(42, Math.max(28, Math.floor(items[0]?.r * 1.35 || 32)));
      items.forEach(item => {
        // Halo de fundo
        ctx.save();
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);

        if (item.counted) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.lineWidth = 1.2;
        }
        ctx.fill();
        ctx.stroke();

        // Emoji do Objeto
        ctx.font = `${emojiFontSz}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentTrial.emoji, item.x, item.y + 2);

        // Badge de contagem (se já foi tocado)
        if (item.counted && item.countOrder !== undefined) {
          const badgeR = 11;
          const bx = item.x + item.r * 0.65;
          const by = item.y - item.r * 0.65;

          ctx.beginPath();
          ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${item.countOrder}`, bx, by + 0.5);
        }
        ctx.restore();
      });
      ctx.restore();

      // 3. Barra de Botões com Alternativas (Bottom-Up)
      currentOptions.forEach((val, i) => {
        const { bx, by, bw, bh } = getBtnBounds(i);

        ctx.save();
        const isSelected = feedbackIndex === i;

        if (isSelected) {
          if (feedbackStatus === 'success') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
            ctx.strokeStyle = '#10b981';
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.strokeStyle = '#ef4444';
          }
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
        }

        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 14);
        ctx.fill();
        ctx.stroke();

        // Número da opção
        ctx.fillStyle = isSelected && feedbackStatus === 'success' 
          ? '#6ee7b7' 
          : isSelected && feedbackStatus === 'error'
          ? '#f87171'
          : '#ffffff';
        const numFontSz = Math.min(26, Math.max(20, Math.floor(bh * 0.44)));
        ctx.font = `bold ${numFontSz}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${val}`, bx + bw / 2, by + bh / 2);

        ctx.restore();
      });
    };

    newRound();

    this.setCanvasHandler(canvas, (mx, my) => {
      if (feedbackStatus !== 'none') return;

      // 1. Verificar toque em objetos na vitrine (correspondência 1-para-1)
      for (const item of items) {
        const dist = Math.hypot(mx - item.x, my - item.y);
        if (dist <= item.r + 4) {
          if (!item.counted) {
            item.counted = true;
            countedCount++;
            item.countOrder = countedCount;
            this.sound.playCountdown(440 + countedCount * 60);

            if (countedCount === currentTrial.targetCount) {
              this.gameInstruction.set(`Excelente! Você contou todos os ${currentTrial.targetCount}! Agora toque no número ${currentTrial.targetCount} embaixo!`);
            } else {
              this.gameInstruction.set(`Contou ${countedCount}! Continue contando até terminar...`);
            }
            draw();
          }
          return;
        }
      }

      // 2. Verificar clique nos botões numéricos de resposta
      currentOptions.forEach((val, i) => {
        const { bx, by, bw, bh } = getBtnBounds(i);

        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
          feedbackIndex = i;
          const isCorrect = val === currentTrial.targetCount;
          this.recordAttempt(isCorrect);

          if (isCorrect) {
            feedbackStatus = 'success';
            this.sound.playSuccess();
            this.gameScore.update(s => s + 15);
            items.forEach((it, idx) => {
              it.counted = true;
              it.countOrder = idx + 1;
            });
            this.gameInstruction.set(`Parabéns! São exatamente ${currentTrial.targetCount} ${currentTrial.unit}! 🎉`);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              newRound();
            }, 520);
          } else {
            feedbackStatus = 'error';
            this.sound.playError();
            this.gameInstruction.set(`Dica: Conte um por um tocando nos objetos com o dedo!`);
            draw();
            this.gameData.activeTimeout = setTimeout(() => {
              feedbackStatus = 'none';
              feedbackIndex = -1;
              this.gameInstruction.set(`Rodada ${currentRound}/${totalRounds}: Toque nos itens para contar e escolha o número certo!`);
              draw();
            }, 750);
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

  // 7. SOCIOEMOCIONAL (TEORIA DA MENTE, EMPATIA E AUTOCONHECIMENTO)
  setupSocialGame(canvas: HTMLCanvasElement, W: number, H: number, gameId: number) {
    const ctx = this.canvasCtx!;
    const SCENARIOS: Record<number, Array<{ situation: string; options: string[]; correct: number }>> = {
      51: [
        { situation: 'A pessoa está sorrindo com os olhos brilhando e dançando. Ela está...', options: ['Feliz e alegre', 'Triste e chorando', 'Com muita raiva', 'Com muito sono'], correct: 0 },
        { situation: 'O colega caiu no pátio e machucou o joelho. O que ele está sentindo?', options: ['Dor e precisando de ajuda', 'Alegria e festa', 'Tédio', 'Muito animado'], correct: 0 },
        { situation: 'Alguém respirou fundo bem devagar para se acalmar. Ela está...', options: ['Relaxada e tranquila', 'Brava e gritando', 'Com muita pressa', 'Assustada'], correct: 0 },
        { situation: 'Uma criança cruzou os braços e fechou a cara após perder a vez. Ela está...', options: ['Frustrada ou com raiva', 'Muito contente', 'Dando risada', 'Aliviada'], correct: 0 }
      ],
      52: [
        { situation: 'Seu colega perdeu o lápis favorito e começou a chorar. Como ajudar?', options: ['Ajudar a procurar com calma', 'Zombar do choro dele', 'Fingir que não viu nada', 'Esconder outro lápis dele'], correct: 0 },
        { situation: 'Uma criança nova chegou na escola e está sozinha no recreio. O que fazer?', options: ['Convidar para brincar junto', 'Dizer para não falarem com ela', 'Ignorar a presença dela', 'Rir dela de longe'], correct: 0 },
        { situation: 'Você ganhou um presente surpresa de um amigo. Como se expressar?', options: ['Agradecer com carinho e sorriso', 'Reclamar do que ganhou', 'Jogar no chão com desdém', 'Sair correndo sem falar'], correct: 0 },
        { situation: 'Um amigo tirou uma nota baixa e ficou desanimado. Como apoiá-lo?', options: ['Incentivar e propor estudar juntos', 'Dizer que ele não sabe nada', 'Ficar se gabando da sua nota', 'Zombar dele'], correct: 0 }
      ],
      53: [
        { situation: 'Você quer usar o brinquedo que outro colega já está usando. O que fazer?', options: ['Esperar sua vez ou propor revezar', 'Arrancar o brinquedo da mão dele', 'Gritar e espernear no chão', 'Empurrar o colega'], correct: 0 },
        { situation: 'Durante a explicação do professor surgiu uma dúvida importante. O que fazer?', options: ['Levantar a mão e aguardar a vez', 'Gritar no meio da aula', 'Interromper o colega que fala', 'Jogar papel no professor'], correct: 0 },
        { situation: 'Você acidentalmente esbarrou em alguém no corredor. Como reagir?', options: ['Pedir desculpas educadamente', 'Sair correndo sem falar nada', 'Colocar a culpa na outra pessoa', 'Ficar bravo e discutir'], correct: 0 }
      ],
      55: [
        { situation: 'Quando algo dá muito errado e vem uma onda de raiva, o que é mais saudável?', options: ['Respirar fundo e falar o que sente', 'Quebrar objetos ao redor', 'Bater em quem estiver perto', 'Guardar tudo calado com rancor'], correct: 0 },
        { situation: 'Como demonstrar para a família que você está muito contente hoje?', options: ['Dar um abraço e conversar alegremente', 'Se trancar no quarto isolado', 'Ficar emburrado reclamando', 'Gritar com as pessoas'], correct: 0 },
        { situation: 'Se você sente ciúmes ou inveja de um amigo, qual a melhor saída?', options: ['Conversar com alguém de confiança', 'Estragar o brinquedo do amigo', 'Falar mal dele pelas costas', 'Tratar o amigo com desprezo'], correct: 0 }
      ],
      56: [
        { situation: 'Dois colegas querem o mesmo jogo de tabuleiro ao mesmo tempo. Qual a solução?', options: ['Jogar juntos ou combinar turnos', 'Disputar na força até rasgar', 'Ficar brigados para sempre', 'Destruir as peças do jogo'], correct: 0 },
        { situation: 'Um amigo disse algo que te chateou muito. Como resolver pacificamente?', options: ['Dizer com calma como você se sentiu', 'Partir para agressão física', 'Inventar mentiras sobre ele', 'Gritar ofensas no pátio'], correct: 0 },
        { situation: 'Em uma brincadeira em grupo houve desacordo sobre as regras. O que propor?', options: ['Revisar as regras juntos com diálogo', 'Abandonar o jogo com raiva', 'Inventar regras só para vencer', 'Chorar e culpar os outros'], correct: 0 }
      ],
      57: [
        { situation: 'A sala de aula ficou bagunçada depois de uma atividade coletiva. O que fazer?', options: ['Todos ajudarem a arrumar juntos', 'Deixar para uma pessoa só fazer', 'Chutar as coisas para debaixo do armário', 'Ir embora sem guardar nada'], correct: 0 },
        { situation: 'Em um trabalho em equipe, um colega tem mais dificuldade. Como cooperar?', options: ['Explicar com paciência e incentivá-lo', 'Excluir o colega do trabalho', 'Fazer tudo sozinho e reclamar', 'Zombar das dúvidas dele'], correct: 0 },
        { situation: 'O grupo precisa tomar uma decisão sobre o projeto. Qual a atitude colaborativa?', options: ['Ouvir as ideias de todos e votar', 'Impor somente a própria vontade', 'Não deixar ninguém opinar', 'Ignorar o que o grupo decide'], correct: 0 }
      ],
      59: [
        { situation: 'Alguém preparou um lanche com muito carinho para você. O que fazer?', options: ['Agradecer e valorizar o cuidado', 'Reclamar sem nem experimentar', 'Comer e sair sem agradecer', 'Exigir outra coisa grosseiramente'], correct: 0 },
        { situation: 'Seu amigo te emprestou um casaco quando você estava com frio. O que dizer?', options: ['Muito obrigado por me emprestar!', 'Você demorou demais para me dar', 'Nem estava tão frio assim', 'Jogar o casaco no chão depois'], correct: 0 },
        { situation: 'Ao final de um dia corrido, qual hábito traz bem-estar emocional?', options: ['Lembrar das coisas boas pelas quais é grato', 'Ficar remoendo apenas aborrecimentos', 'Reclamar de tudo e de todos', 'Ignorar quem te ajudou no dia'], correct: 0 }
      ],
      60: [
        { situation: 'Quando você comete um erro importante em uma prova ou tarefa, qual a atitude madura?', options: ['Reconhecer, aprender com o erro e corrigir', 'Culpar o colega de classe pelo erro', 'Fingir que não foi você e mentir', 'Ficar com raiva e desistir de estudar'], correct: 0 },
        { situation: 'Você percebe que está muito irritado antes de responder a alguém. O que fazer?', options: ['Pausar, respirar fundo e pensar antes', 'Gritar para desabafar imediatamente', 'Bater portas e guardar rancor', 'Dizer palavras duras para magoar'], correct: 0 },
        { situation: 'O que significa desenvolver "autoconhecimento" no seu cotidiano?', options: ['Compreender seus limites, forças e emoções', 'Achar que você é perfeito e nunca erra', 'Querer ser superior a todos os colegas', 'Fazer tudo apenas para agradar aos outros'], correct: 0 },
        { situation: 'Quando um desafio parece muito difícil, o que demonstra inteligência emocional?', options: ['Dividir em etapas e pedir apoio se precisar', 'Desistir no primeiro obstáculo difícil', 'Achar que não tem capacidade para nada', 'Esperar que façam tudo em seu lugar'], correct: 0 },
        { situation: 'Se você descobre um talento seu (desenho, matemática ou esporte), como agir?', options: ['Praticar com dedicação e humildade', 'Se gabar e humilhar quem tem dificuldade', 'Ter vergonha e nunca mais praticar', 'Parar de se esforçar no resto'], correct: 0 }
      ]
    };

    const rawScenarios = SCENARIOS[gameId] || SCENARIOS[60] || SCENARIOS[51];

    // Embaralha as opções de cada cenário mantendo o rastreamento do índice correto
    const scenarios = rawScenarios.map(s => {
      const items = s.options.map((opt, i) => ({ opt, isCorrect: i === s.correct }));
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return {
        situation: s.situation,
        options: items.map(item => item.opt),
        correct: items.findIndex(item => item.isCorrect)
      };
    });

    let currentIdx = 0;
    let isTransitioning = false;
    let feedback: { clickedIdx: number; isCorrect: boolean } | null = null;
    let optionRects: Array<{ x: number; y: number; w: number; h: number }> = [];

    // Função utilitária para quebra de texto em múltiplas linhas
    const wrapText = (text: string, maxWidth: number, font: string): string[] => {
      ctx.font = font;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const drawScenario = () => {
      if (currentIdx >= scenarios.length) {
        this.finishGame();
        return;
      }
      const s = scenarios[currentIdx];
      ctx.clearRect(0, 0, W, H);

      const isCompact = W < 420;

      // 1. Cabeçalho / Indicador de Progresso
      const progressText = `Cenário ${currentIdx + 1} de ${scenarios.length}`;
      ctx.fillStyle = '#38bdf8';
      ctx.font = isCompact ? 'bold 11.5px sans-serif' : 'bold 12.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(progressText, W / 2, 7);

      // 2. Card da Situação (Tipografia Ampla e Alto Contraste)
      const cardX = 14;
      const cardW = W - 28;
      const cardY = 25;

      const sitFont = isCompact ? '600 14px system-ui, -apple-system, sans-serif' : '600 15.5px system-ui, -apple-system, sans-serif';
      const sitLineH = isCompact ? 19 : 22;
      const sitLines = wrapText(s.situation, cardW - 28, sitFont);
      const sitTextH = sitLines.length * sitLineH;

      // Altura do card adaptada ao texto com padding confortável
      const cardH = Math.min(Math.max(52, sitTextH + 20), Math.round(H * 0.36));

      // Fundo do Card da Situação
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Linhas da Situação dentro do Card
      ctx.fillStyle = '#ffffff';
      ctx.font = sitFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textStartY = cardY + (cardH - sitTextH) / 2 + sitLineH / 2;
      sitLines.forEach((line, lIdx) => {
        ctx.fillText(line, W / 2, textStartY + lIdx * sitLineH);
      });

      // 3. Grid de Opções (Layout Inteligente: 4 Linhas Full-Width para Leitura Confortável)
      const optionsStartY = cardY + cardH + 10;
      const availableH = H - optionsStartY - 8;
      optionRects = [];

      const useVerticalList = availableH >= 170;

      if (useVerticalList) {
        // Modo 4 Linhas Completas (Empilhadas) - Altíssima Legibilidade e Espaço
        const gapY = Math.min(8, Math.max(4, Math.floor((availableH - 160) / 4)));
        const btnW = cardW;
        const btnH = Math.min(52, Math.max(38, Math.floor((availableH - 3 * gapY) / 4)));
        const optFont = isCompact ? '600 12.5px system-ui, -apple-system, sans-serif' : '600 14px system-ui, -apple-system, sans-serif';
        const optLineH = isCompact ? 16 : 18;

        s.options.forEach((opt, i) => {
          const bx = cardX;
          const by = optionsStartY + i * (btnH + gapY);
          optionRects.push({ x: bx, y: by, w: btnW, h: btnH });

          let bgColor = '#1e293b';
          let strokeColor = '#334155';
          let textColor = '#f8fafc';
          let badgeBg = '#0f172a';
          let badgeBorder = '#475569';
          let badgeText = '#38bdf8';

          if (feedback) {
            if (i === s.correct) {
              bgColor = '#064e3b';
              strokeColor = '#10b981';
              textColor = '#ecfdf5';
              badgeBg = '#065f46';
              badgeBorder = '#34d399';
              badgeText = '#ffffff';
            } else if (i === feedback.clickedIdx && !feedback.isCorrect) {
              bgColor = '#7f1d1d';
              strokeColor = '#ef4444';
              textColor = '#fef2f2';
              badgeBg = '#991b1b';
              badgeBorder = '#f87171';
              badgeText = '#ffffff';
            }
          }

          // Card do Botão
          ctx.fillStyle = bgColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bx, by, btnW, btnH, 10);
          ctx.fill();
          ctx.stroke();

          // Badge de Letra (A, B, C, D)
          const badgeRadius = isCompact ? 11 : 12;
          const badgeCenterX = bx + (isCompact ? 18 : 22);
          const badgeCenterY = by + btnH / 2;
          ctx.fillStyle = badgeBg;
          ctx.strokeStyle = badgeBorder;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = badgeText;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String.fromCharCode(65 + i), badgeCenterX, badgeCenterY + 0.5);

          // Texto da Opção com Quebra de Linha Alinhado à Esquerda
          const textStartX = bx + (isCompact ? 36 : 42);
          const maxTextW = btnW - (isCompact ? 46 : 52);
          const optLines = wrapText(opt, maxTextW, optFont);
          const optTextH = optLines.length * optLineH;
          const optStartY = by + (btnH - optTextH) / 2 + optLineH / 2;

          ctx.fillStyle = textColor;
          ctx.font = optFont;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          optLines.forEach((line, lIdx) => {
            ctx.fillText(line, textStartX, optStartY + lIdx * optLineH);
          });
        });
      } else {
        // Modo 2x2 para telas com altura muito restrita (paisagem móvel)
        const gapX = 10;
        const gapY = 6;
        const btnW = (cardW - gapX) / 2;
        const btnH = Math.min(48, Math.max(34, Math.floor((availableH - gapY) / 2)));
        const optFont = isCompact ? '600 11.5px system-ui, -apple-system, sans-serif' : '600 13px system-ui, -apple-system, sans-serif';
        const optLineH = isCompact ? 14 : 16;

        s.options.forEach((opt, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const bx = cardX + col * (btnW + gapX);
          const by = optionsStartY + row * (btnH + gapY);
          optionRects.push({ x: bx, y: by, w: btnW, h: btnH });

          let bgColor = '#1e293b';
          let strokeColor = '#334155';
          let textColor = '#f8fafc';

          if (feedback) {
            if (i === s.correct) {
              bgColor = '#064e3b';
              strokeColor = '#10b981';
              textColor = '#ecfdf5';
            } else if (i === feedback.clickedIdx && !feedback.isCorrect) {
              bgColor = '#7f1d1d';
              strokeColor = '#ef4444';
              textColor = '#fef2f2';
            }
          }

          ctx.fillStyle = bgColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bx, by, btnW, btnH, 8);
          ctx.fill();
          ctx.stroke();

          const optLines = wrapText(opt, btnW - 14, optFont);
          const optTextH = optLines.length * optLineH;
          const optStartY = by + (btnH - optTextH) / 2 + optLineH / 2;

          ctx.fillStyle = textColor;
          ctx.font = optFont;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          optLines.forEach((line, lIdx) => {
            ctx.fillText(line, bx + btnW / 2, optStartY + lIdx * optLineH);
          });
        });
      }

      this.gameInstruction.set('Leia a situação e escolha a atitude com maior maturidade socioemocional');
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;
      const s = scenarios[currentIdx];
      if (!s) return;

      optionRects.forEach((rect, i) => {
        if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
          isTransitioning = true;
          const correct = i === s.correct;
          this.recordAttempt(correct);
          if (correct) {
            this.gameScore.update(score => score + 15);
          }

          feedback = { clickedIdx: i, isCorrect: correct };
          drawScenario();

          setTimeout(() => {
            currentIdx++;
            feedback = null;
            isTransitioning = false;
            drawScenario();
          }, 600);
        }
      });
    });

    drawScenario();
  }

  // 7.0 RECONHECIMENTO VISUAL DE EMOÇÕES NO ROSTO (JOGO 51)
  setupEmotionFaceGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;

    interface EmotionItem {
      id: string;
      name: string;
      emoji: string;
      headGradTop: string;
      headGradBottom: string;
      eyebrows: 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'calm';
      eyes: 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'calm';
      mouth: 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'calm';
      cheeks?: boolean;
      tear?: boolean;
      sweat?: boolean;
    }

    const ALL_EMOTIONS: EmotionItem[] = [
      {
        id: 'feliz',
        name: 'Feliz',
        emoji: '😄',
        headGradTop: '#fef08a',
        headGradBottom: '#eab308',
        eyebrows: 'happy',
        eyes: 'happy',
        mouth: 'happy',
        cheeks: true
      },
      {
        id: 'triste',
        name: 'Triste',
        emoji: '😢',
        headGradTop: '#bfdbfe',
        headGradBottom: '#60a5fa',
        eyebrows: 'sad',
        eyes: 'sad',
        mouth: 'sad',
        tear: true
      },
      {
        id: 'bravo',
        name: 'Bravo',
        emoji: '😡',
        headGradTop: '#fecaca',
        headGradBottom: '#ef4444',
        eyebrows: 'angry',
        eyes: 'angry',
        mouth: 'angry'
      },
      {
        id: 'assustado',
        name: 'Assustado',
        emoji: '😨',
        headGradTop: '#e0e7ff',
        headGradBottom: '#818cf8',
        eyebrows: 'scared',
        eyes: 'scared',
        mouth: 'scared',
        sweat: true
      },
      {
        id: 'surpreso',
        name: 'Surpreso',
        emoji: '😲',
        headGradTop: '#fed7aa',
        headGradBottom: '#f97316',
        eyebrows: 'surprised',
        eyes: 'surprised',
        mouth: 'surprised'
      },
      {
        id: 'tranquilo',
        name: 'Tranquilo',
        emoji: '😌',
        headGradTop: '#bbf7d0',
        headGradBottom: '#22c55e',
        eyebrows: 'calm',
        eyes: 'calm',
        mouth: 'calm',
        cheeks: true
      }
    ];

    // Embaralha as rodadas da sessão (6 rodadas clínicas)
    const shuffledTrials = [...ALL_EMOTIONS].sort(() => Math.random() - 0.5);

    // Constrói cada rodada com a emoção alvo e 3 distratores aleatórios
    const rounds = shuffledTrials.map(target => {
      const distractors = ALL_EMOTIONS.filter(e => e.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      const correctIdx = options.findIndex(o => o.id === target.id);
      return { target, options, correctIdx };
    });

    let currentRound = 0;
    let isTransitioning = false;
    let feedback: { clickedIdx: number; isCorrect: boolean } | null = null;
    let optionRects: Array<{ x: number; y: number; w: number; h: number }> = [];

    // Desenha o rosto vetorial expressivo em alta definição
    const drawFace = (cx: number, cy: number, r: number, emotion: EmotionItem) => {
      ctx.save();

      // 1. Cabeça com gradiente esférico tridimensional
      const grad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, r * 0.1, cx, cy, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, emotion.headGradTop);
      grad.addColorStop(1, emotion.headGradBottom);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Bochechas coradas
      if (emotion.cheeks) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.46, cy + r * 0.18, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cx + r * 0.46, cy + r * 0.18, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Sobrancelhas expressivas
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      const leftEbX1 = cx - r * 0.46;
      const leftEbX2 = cx - r * 0.14;
      const rightEbX1 = cx + r * 0.14;
      const rightEbX2 = cx + r * 0.46;
      const ebY = cy - r * 0.32;

      ctx.beginPath();
      if (emotion.eyebrows === 'happy') {
        ctx.moveTo(leftEbX1, ebY + 2);
        ctx.quadraticCurveTo((leftEbX1 + leftEbX2) / 2, ebY - 7, leftEbX2, ebY + 2);
        ctx.moveTo(rightEbX1, ebY + 2);
        ctx.quadraticCurveTo((rightEbX1 + rightEbX2) / 2, ebY - 7, rightEbX2, ebY + 2);
      } else if (emotion.eyebrows === 'sad') {
        ctx.moveTo(leftEbX1, ebY + 6);
        ctx.lineTo(leftEbX2, ebY - 3);
        ctx.moveTo(rightEbX1, ebY - 3);
        ctx.lineTo(rightEbX2, ebY + 6);
      } else if (emotion.eyebrows === 'angry') {
        ctx.moveTo(leftEbX1, ebY - 5);
        ctx.lineTo(leftEbX2, ebY + 5);
        ctx.moveTo(rightEbX1, ebY + 5);
        ctx.lineTo(rightEbX2, ebY - 5);
      } else if (emotion.eyebrows === 'scared') {
        ctx.moveTo(leftEbX1, ebY + 2);
        ctx.lineTo(leftEbX2, ebY - 5);
        ctx.moveTo(rightEbX1, ebY - 5);
        ctx.lineTo(rightEbX2, ebY + 2);
      } else if (emotion.eyebrows === 'surprised') {
        ctx.moveTo(leftEbX1, ebY - 8);
        ctx.quadraticCurveTo((leftEbX1 + leftEbX2) / 2, ebY - 15, leftEbX2, ebY - 8);
        ctx.moveTo(rightEbX1, ebY - 8);
        ctx.quadraticCurveTo((rightEbX1 + rightEbX2) / 2, ebY - 15, rightEbX2, ebY - 8);
      } else {
        ctx.moveTo(leftEbX1, ebY);
        ctx.lineTo(leftEbX2, ebY);
        ctx.moveTo(rightEbX1, ebY);
        ctx.lineTo(rightEbX2, ebY);
      }
      ctx.stroke();

      // 4. Olhos expressivos
      const eyeY = cy - r * 0.12;
      const leftEyeX = cx - r * 0.28;
      const rightEyeX = cx + r * 0.28;

      if (emotion.eyes === 'happy') {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY + 4, r * 0.14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.moveTo(rightEyeX + r * 0.14 * Math.cos(Math.PI * 1.15), eyeY + 4 + r * 0.14 * Math.sin(Math.PI * 1.15));
        ctx.arc(rightEyeX, eyeY + 4, r * 0.14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else if (emotion.eyes === 'calm') {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY - 2, r * 0.13, Math.PI * 0.15, Math.PI * 0.85);
        ctx.moveTo(rightEyeX + r * 0.13 * Math.cos(Math.PI * 0.15), eyeY - 2 + r * 0.13 * Math.sin(Math.PI * 0.15));
        ctx.arc(rightEyeX, eyeY - 2, r * 0.13, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      } else {
        const eyeR = emotion.eyes === 'scared' || emotion.eyes === 'surprised' ? r * 0.18 : r * 0.14;
        
        [leftEyeX, rightEyeX].forEach(ex => {
          ctx.beginPath();
          ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.stroke();

          const pupilR = emotion.eyes === 'scared' ? eyeR * 0.35 : eyeR * 0.55;
          ctx.beginPath();
          ctx.arc(ex, eyeY + 1, pupilR, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ex - pupilR * 0.35, eyeY - pupilR * 0.35, pupilR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      // 5. Boca expressiva
      const mouthY = cy + r * 0.34;

      if (emotion.mouth === 'happy') {
        ctx.beginPath();
        ctx.arc(cx, mouthY - 4, r * 0.34, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.rect(cx - r * 0.22, mouthY - 4, r * 0.44, r * 0.08);
        ctx.fill();
      } else if (emotion.mouth === 'sad') {
        ctx.beginPath();
        ctx.arc(cx, mouthY + r * 0.22, r * 0.26, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (emotion.mouth === 'angry') {
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.28, mouthY - r * 0.08, r * 0.56, r * 0.18, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        for (let i = 1; i <= 3; i++) {
          const tx = cx - r * 0.28 + (r * 0.56 * i) / 4;
          ctx.moveTo(tx, mouthY - r * 0.08);
          ctx.lineTo(tx, mouthY + r * 0.10);
        }
        ctx.moveTo(cx - r * 0.28, mouthY);
        ctx.lineTo(cx + r * 0.28, mouthY);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (emotion.mouth === 'surprised') {
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 2, r * 0.15, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (emotion.mouth === 'scared') {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.24, mouthY);
        ctx.quadraticCurveTo(cx - r * 0.12, mouthY - 4, cx, mouthY);
        ctx.quadraticCurveTo(cx + r * 0.12, mouthY + 4, cx + r * 0.24, mouthY);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, mouthY - r * 0.06, r * 0.22, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }

      // 6. Lágrima
      if (emotion.tear) {
        const tearX = cx + r * 0.32;
        const tearY = cy + r * 0.08;
        ctx.beginPath();
        ctx.arc(tearX, tearY + 8, 5, 0, Math.PI);
        ctx.lineTo(tearX, tearY);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      // 7. Gota de Suor Frio
      if (emotion.sweat) {
        const sweatX = cx + r * 0.54;
        const sweatY = cy - r * 0.36;
        ctx.beginPath();
        ctx.arc(sweatX, sweatY + 7, 5, 0, Math.PI);
        ctx.lineTo(sweatX, sweatY);
        ctx.closePath();
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
      }

      ctx.restore();
    };

    const drawRound = () => {
      if (currentRound >= rounds.length) {
        this.finishGame();
        return;
      }
      const round = rounds[currentRound];
      ctx.clearRect(0, 0, W, H);

      const isCompact = W < 420;

      // 1. Cabeçalho Clínico
      ctx.fillStyle = '#38bdf8';
      ctx.font = isCompact ? 'bold 11.5px sans-serif' : 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Desafio ${currentRound + 1} de ${rounds.length} · Que emoção este rosto está mostrando?`, W / 2, 7);

      // 2. Card do Rosto Expressivo em Destaque
      const cardW = Math.min(W - 28, 380);
      const cardX = (W - cardW) / 2;
      const cardY = 24;
      const cardH = Math.min(150, Math.floor(H * 0.40));

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Centro do rosto dentro do card
      const faceCx = W / 2;
      const faceCy = cardY + cardH * 0.50;
      const faceR = Math.min(48, Math.floor(cardH * 0.36));
      drawFace(faceCx, faceCy, faceR, round.target);

      // Badge com emoji de apoio no canto superior direito do card
      const badgeX = cardX + cardW - 28;
      const badgeY = cardY + 26;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(round.target.emoji, badgeX, badgeY);

      // 3. Grid de Opções (2 colunas x 2 linhas com Emojis Grandes e Nomes)
      const optionsStartY = cardY + cardH + 12;
      const availableH = H - optionsStartY - 8;
      const gapX = 12;
      const gapY = 8;
      const gridW = W - 28;
      const btnW = (gridW - gapX) / 2;
      const btnH = Math.min(62, Math.max(48, Math.floor((availableH - gapY) / 2)));
      const startX = 14;

      optionRects = [];
      round.options.forEach((opt, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = startX + col * (btnW + gapX);
        const by = optionsStartY + row * (btnH + gapY);
        optionRects.push({ x: bx, y: by, w: btnW, h: btnH });

        let bgColor = '#1e293b';
        let strokeColor = '#334155';
        let textColor = '#f8fafc';

        if (feedback) {
          if (i === round.correctIdx) {
            bgColor = '#064e3b';
            strokeColor = '#10b981';
            textColor = '#ecfdf5';
          } else if (i === feedback.clickedIdx && !feedback.isCorrect) {
            bgColor = '#7f1d1d';
            strokeColor = '#ef4444';
            textColor = '#fef2f2';
          }
        }

        // Card da Alternativa
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, btnW, btnH, 12);
        ctx.fill();
        ctx.stroke();

        // Emoji Grande à Esquerda
        const emojiX = bx + 28;
        const emojiY = by + btnH / 2;
        ctx.font = isCompact ? '24px sans-serif' : '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opt.emoji, emojiX, emojiY);

        // Nome da Emoção em Destaque ao Lado
        const textX = bx + 54;
        ctx.fillStyle = textColor;
        ctx.font = isCompact ? 'bold 14px system-ui, -apple-system, sans-serif' : 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(opt.name, textX, emojiY);
      });

      this.gameInstruction.set('Olhe a expressão do rosto e toque na emoção correta');
    };

    this.setCanvasHandler(canvas, (mx, my) => {
      if (isTransitioning) return;
      const round = rounds[currentRound];
      if (!round) return;

      optionRects.forEach((rect, i) => {
        if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
          isTransitioning = true;
          const correct = i === round.correctIdx;
          this.recordAttempt(correct);
          if (correct) {
            this.gameScore.update(s => s + 15);
            this.sound.playSuccess();
          } else {
            this.sound.playError();
          }

          feedback = { clickedIdx: i, isCorrect: correct };
          drawRound();

          setTimeout(() => {
            currentRound++;
            feedback = null;
            isTransitioning = false;
            drawRound();
          }, 700);
        }
      });
    });

    drawRound();
  }

  // 7.1 RESPIRAÇÃO GUIADA E AUTORREGULAÇÃO EMOCIONAL (JOGO 54)
  setupBreathingGame(canvas: HTMLCanvasElement, W: number, H: number) {
    const ctx = this.canvasCtx!;
    const totalCycles = 5;
    let currentCycle = 0;
    let cyclePhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';
    let phaseStartTime = performance.now();
    let isFinished = false;

    // Fases em milissegundos
    const PHASE_DURATIONS = {
      inhale: 4000,
      hold: 2500,
      exhale: 4000,
      rest: 1500
    };

    const cx = W / 2;
    const cy = H * 0.48;
    const minR = Math.max(38, Math.min(W * 0.14, H * 0.16));
    const maxR = Math.max(88, Math.min(W * 0.28, H * 0.32));

    // Partículas flutuantes relaxantes
    interface BreathParticle {
      angle: number;
      dist: number;
      speed: number;
      size: number;
      alpha: number;
    }
    const particles: BreathParticle[] = [];
    for (let i = 0; i < 18; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: minR + Math.random() * (maxR - minR + 40),
        speed: 0.4 + Math.random() * 0.6,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.5
      });
    }

    // Ondas táteis expansivas geradas ao tocar na tela
    interface TapRipple {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    }
    const ripples: TapRipple[] = [];

    // Interatividade ao tocar no balão
    this.setCanvasHandler(canvas, (mx, my) => {
      if (isFinished) return;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= maxR * 1.3) {
        ripples.push({
          x: mx,
          y: my,
          r: 10,
          maxR: 65,
          alpha: 0.8
        });
        this.sound.playClick();
      }
    });

    const render = (now: number) => {
      if (isFinished) return;

      const elapsed = now - phaseStartTime;
      const duration = PHASE_DURATIONS[cyclePhase];

      // Transição de fases
      if (elapsed >= duration) {
        phaseStartTime = now;
        if (cyclePhase === 'inhale') {
          cyclePhase = 'hold';
        } else if (cyclePhase === 'hold') {
          cyclePhase = 'exhale';
        } else if (cyclePhase === 'exhale') {
          cyclePhase = 'rest';
          this.sound.playCalmChime();
          this.recordAttempt(true);
          this.gameScore.update(s => s + 20);
        } else if (cyclePhase === 'rest') {
          currentCycle++;
          if (currentCycle >= totalCycles) {
            isFinished = true;
            this.finishGame();
            return;
          }
          cyclePhase = 'inhale';
        }
      }

      ctx.clearRect(0, 0, W, H);

      // 1. Fundo Gradiente Sutil e Noturno Relaxante
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, W * 0.7);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Cabeçalho Clínico e Indicador dos 5 Ciclos de Calma
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`EXERCÍCIO DE AUTORREGULAÇÃO · CICLO ${Math.min(currentCycle + 1, totalCycles)} DE ${totalCycles}`, W / 2, 10);

      // Bolinhas de progresso dos ciclos
      const dotSpacing = 20;
      const dotsStartX = cx - ((totalCycles - 1) * dotSpacing) / 2;
      for (let c = 0; c < totalCycles; c++) {
        const dx = dotsStartX + c * dotSpacing;
        const dy = 28;
        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        if (c < currentCycle) {
          ctx.fillStyle = '#10b981'; // Concluído
          ctx.fill();
        } else if (c === currentCycle) {
          const pulse = (Math.sin(now / 200) + 1) * 0.5;
          ctx.fillStyle = '#38bdf8'; // Em andamento
          ctx.fill();
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#334155'; // Futuro
          ctx.fill();
        }
      }

      // 3. Cálculo Dinâmico do Raio e da Cor da Fase
      const phaseProgress = Math.min(1, Math.max(0, elapsed / duration));
      let curR = minR;
      let phaseTitle = 'INSPIRE';
      let phaseSub = 'Puxe o ar pelo nariz bem devagar...';
      let phaseColor = '#38bdf8';
      let phaseColorDark = '#0284c7';
      const secondsRemaining = Math.max(1, Math.ceil((duration - elapsed) / 1000));

      if (cyclePhase === 'inhale') {
        const ease = 0.5 - 0.5 * Math.cos(phaseProgress * Math.PI);
        curR = minR + (maxR - minR) * ease;
        phaseTitle = 'INSPIRE';
        phaseSub = 'Puxe o ar suavemente pelo nariz...';
        phaseColor = '#38bdf8';
        phaseColorDark = '#0369a1';
      } else if (cyclePhase === 'hold') {
        const breathePulse = Math.sin(now / 350) * 3;
        curR = maxR + breathePulse;
        phaseTitle = 'SEGURE';
        phaseSub = 'Mantenha o ar no pulmão com tranquilidade...';
        phaseColor = '#34d399';
        phaseColorDark = '#047857';
      } else if (cyclePhase === 'exhale') {
        const ease = 0.5 - 0.5 * Math.cos(phaseProgress * Math.PI);
        curR = maxR - (maxR - minR) * ease;
        phaseTitle = 'EXPIRE';
        phaseSub = 'Solte o ar pela boca bem devagar...';
        phaseColor = '#10b981';
        phaseColorDark = '#065f46';
      } else if (cyclePhase === 'rest') {
        curR = minR;
        phaseTitle = 'RELAXE';
        phaseSub = 'Muito bem! Sinta a calma no seu corpo...';
        phaseColor = '#a7f3d0';
        phaseColorDark = '#14b8a6';
      }

      // 4. Efeito de Aura e Halos Translúcidos
      const haloAlpha = 0.12 + 0.08 * Math.sin(now / 400);
      ctx.beginPath();
      ctx.arc(cx, cy, curR * 1.32, 0, Math.PI * 2);
      ctx.fillStyle = phaseColor;
      ctx.globalAlpha = haloAlpha * 0.5;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, curR * 1.16, 0, Math.PI * 2);
      ctx.fillStyle = phaseColor;
      ctx.globalAlpha = haloAlpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // 5. Partículas de Fluxo Respiratório
      particles.forEach(p => {
        if (cyclePhase === 'inhale') {
          p.dist -= p.speed * 0.9;
          if (p.dist < minR * 0.8) p.dist = maxR * 1.4;
        } else if (cyclePhase === 'exhale') {
          p.dist += p.speed * 0.9;
          if (p.dist > maxR * 1.4) p.dist = minR * 0.8;
        } else {
          p.angle += 0.005;
        }
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = phaseColor;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 6. Ondas Táteis (Ripples) ao Tocar no Balão
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rip = ripples[rIdx];
        rip.r += 1.6;
        rip.alpha *= 0.94;
        if (rip.alpha <= 0.02 || rip.r >= rip.maxR) {
          ripples.splice(rIdx, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 7. O Balão Terapêutico Central (Gradiente Esférico High-DPI)
      const lightOffsetX = cx - curR * 0.28;
      const lightOffsetY = cy - curR * 0.28;
      const ballGrad = ctx.createRadialGradient(lightOffsetX, lightOffsetY, curR * 0.1, cx, cy, curR);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.25, phaseColor);
      ballGrad.addColorStop(1, phaseColorDark);

      ctx.save();
      ctx.shadowColor = phaseColor;
      ctx.shadowBlur = Math.min(30, curR * 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, curR, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.fill();

      // Borda sutil de destaque luminoso
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 8. Textos Centrais e Cronômetro
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 21px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(phaseTitle, cx, cy - (cyclePhase === 'rest' ? 0 : 8));

      if (cyclePhase !== 'rest') {
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${secondsRemaining}s`, cx, cy + 14);
      }
      ctx.shadowBlur = 0;

      // 9. Instrução Abaixo do Balão
      const subY = Math.min(H - 18, cy + maxR + 24);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13.5px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(phaseSub, cx, subY);

      this.gameInstruction.set(`Siga o balão: ${phaseTitle.toLowerCase()} quando indicado · Ciclo ${Math.min(currentCycle + 1, totalCycles)}/5`);

      this.gameData.breathingAnimId = requestAnimationFrame(render);
    };

    this.gameData.breathingAnimId = requestAnimationFrame(render);
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
