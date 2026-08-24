import { Injectable, signal } from '@angular/core';
import { MATERIAIS_REAIS, MaterialTerapeutico, SUBCATEGORIES_MATERIAIS, CATEGORY_COLORS } from '@core/data/materiais-reais.data';

declare const html2pdf: any;

@Injectable({
  providedIn: 'root'
})
export class MateriaisService {
  private materialsList = MATERIAIS_REAIS;
  readonly subcategories = SUBCATEGORIES_MATERIAIS;
  readonly categoryColors = CATEGORY_COLORS;

  favorites = signal<number[]>([]);

  constructor() {
    this.loadFavorites();
  }

  loadFavorites() {
    try {
      const saved = localStorage.getItem('materiais_favorites');
      if (saved) {
        this.favorites.set(JSON.parse(saved));
      }
    } catch {
      this.favorites.set([]);
    }
  }

  toggleFavorite(id: number) {
    const current = this.favorites();
    const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    this.favorites.set(next);
    localStorage.setItem('materiais_favorites', JSON.stringify(next));
  }

  isFavorite(id: number): boolean {
    return this.favorites().includes(id);
  }

  getAll(): MaterialTerapeutico[] {
    const favs = this.favorites();
    return this.materialsList.map(m => ({
      ...m,
      favorite: favs.includes(m.id)
    }));
  }

  getById(id: number | string): MaterialTerapeutico | undefined {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const item = this.materialsList.find(m => m.id === numId);
    if (!item) return undefined;
    return {
      ...item,
      favorite: this.isFavorite(item.id)
    };
  }

  filter(term: string = '', subcategory: string = '', ageRange: string = '', favoritesOnly: boolean = false): MaterialTerapeutico[] {
    const cleanTerm = term.toLowerCase().trim();
    const favs = this.favorites();

    return this.materialsList
      .map(m => ({ ...m, favorite: favs.includes(m.id) }))
      .filter(m => {
        const matchesTerm = !cleanTerm ||
          m.name.toLowerCase().includes(cleanTerm) ||
          m.subcategory.toLowerCase().includes(cleanTerm) ||
          m.description.toLowerCase().includes(cleanTerm) ||
          m.targetSkills.some(s => s.toLowerCase().includes(cleanTerm)) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(cleanTerm)));

        const matchesSub = !subcategory || m.subcategory === subcategory;
        const matchesAge = !ageRange || m.ageRange === ageRange;
        const matchesFav = !favoritesOnly || m.favorite;

        return matchesTerm && matchesSub && matchesAge && matchesFav;
      });
  }

  suggestForObjectives(objectives: string[]): MaterialTerapeutico[] {
    if (!objectives || objectives.length === 0) return this.getAll().slice(0, 4);

    const keywords = objectives.join(' ').toLowerCase();
    const scored = this.materialsList.map(m => {
      let score = 0;
      m.targetSkills.forEach(skill => {
        if (keywords.includes(skill.toLowerCase())) score += 3;
      });
      if (m.tags && m.tags.some(t => keywords.includes(t.toLowerCase()))) score += 2;
      if (keywords.includes(m.subcategory.toLowerCase())) score += 2;
      return { material: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).slice(0, 4).map(s => s.material);
  }

  async generateMaterialPdf(material: MaterialTerapeutico, patientName?: string, clinicName: string = 'EduPsych Pro - Clínica Psicopedagógica') {
    const container = document.createElement('div');
    container.style.padding = '30px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#1e293b';
    container.style.background = '#ffffff';
    container.style.lineHeight = '1.5';

    container.innerHTML = `
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0;">${clinicName}</h1>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Recursos Terapêuticos e Neuropsicopedagógicos Clínicos</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">
            ${material.subcategory}
          </span>
          <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 0 0;">Faixa Etária: ${material.ageRange} anos</p>
        </div>
      </div>

      ${patientName ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px; margin-bottom: 20px; font-size: 12px;">
        <strong>Paciente / Aluno:</strong> ${patientName} &nbsp;|&nbsp; <strong>Data de Aplicação:</strong> ${new Date().toLocaleDateString('pt-BR')}
      </div>
      ` : ''}

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">${material.name}</h2>
        <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0;">${material.description}</p>
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: bold; color: #15803d; margin: 0 0 6px 0; text-transform: uppercase;">🎯 Habilidades-Alvo Trabalhadas</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${material.targetSkills.map(s => `<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">✓ ${s}</span>`).join(' ')}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          📋 Guia de Aplicação Passo a Passo (Terapeuta / Educador)
        </h3>
        <p style="font-size: 12px; color: #334155; margin: 0; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #f1f5f9;">
          ${material.applicationGuide}
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          📦 Estrutura do Material e Folhas de Registro
        </h3>
        <ul style="font-size: 12px; color: #334155; margin: 0; padding-left: 20px;">
          ${material.contentOutline.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
        </ul>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
        <h4 style="font-size: 12px; font-weight: bold; color: #b45309; margin: 0 0 4px 0;">📝 Registro de Observação Clínica na Sessão</h4>
        <div style="border-bottom: 1px dashed #cbd5e1; height: 35px;"></div>
        <div style="border-bottom: 1px dashed #cbd5e1; height: 35px;"></div>
        <div style="border-bottom: 1px dashed #cbd5e1; height: 35px;"></div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span><strong>Fonte / Referência Teórica:</strong> ${material.source}</span>
        <span>EduPsych Pro Clinical Library</span>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `${material.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(container).save();
      } else {
        const html2pdfModule = await import('html2pdf.js');
        const generator = html2pdfModule.default || html2pdfModule;
        generator().set(opt).from(container).save();
      }
    } catch {
      // Fallback printable window
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`
          <html>
            <head>
              <title>${material.name}</title>
              <style>
                @media print {
                  body { margin: 0; padding: 15mm; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 20px;">${container.innerHTML}</body>
          </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => printWin.print(), 500);
      }
    }
  }
}
