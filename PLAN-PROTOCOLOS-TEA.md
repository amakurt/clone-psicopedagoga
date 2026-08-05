# Plano: Melhoria Gráfica - Protocolo TEA

## Visão Geral
Melhorar a experiência visual do módulo Protocolo TEA em 3 páginas: Detalhe, Formulário e Lista.

---

## 1. Página de Detalhe (`protocolo-detail.component.ts`)

### Atual
- Só texto: paciente, data, pontuação média, observações
- Nenhum gráfico

### Novo
- **Radar Chart global** (5 categorias: Comunicação, Social, Motora, Funcional, Cognitiva)
- **Bar Chart** comparando categorias (horizontal)
- **5 Progress bars** com nome da categoria, pontuação e %
- **Card de classificação** com interpretação:
  - 0-33%: Grave (vermelho) - "Necessita intervenção intensiva"
  - 34-66%: Moderado (amarelo) - "Necessita intervenção moderada"
  - 67-100%: Leve (verde) - "Boa performance, manter acompanhamento"
- **Estatísticas resumo**: total de itens avaliados, itens sem avaliar
- **Botão PDF** com dados reais da avaliação
- **Botão Editar** mantido

### Dados necessários
- Usar endpoint existente: `GET /api/protocol-evaluations/protocol-stats/:id`
- Retorna: `categories[].{name, color, score, maxScore, percentage}`, `totalScore`, `totalMax`, `overallPercentage`

---

## 2. Página de Formulário (`protocolo-form.component.ts`)

### Atual
- Radar chart por categoria selecionada
- Sidebar com categorias e scores

### Novo (adicionar ao topo)
- **Radar Chart global** (todas as 5 categorias) - substitui o radar individual
- **Painel de resumo** com:
  - % geral com cor dinâmica
  - Barra de progresso animada
  - Contador de itens avaliados / total
  - Indicador visual por categoria (cores: azul, roxo, verde, amarelo, vermelho)
- Manter radar por categoria na seção inferior (opcional, pode remover se ficar pesado)

### Dados
- Usar os dados já calculados pelo componente (`getCategoryScore`, `getCategoryMax`, `overallPercentage`)

---

## 3. Página de Lista (`protocolos-list.component.ts`)

### Atual
- PDF export usa dados hardcoded (categories fixas com `Math.random()`)

### Novo
- Corrigir `exportPDF()` para buscar dados reais via `GET /api/protocol-evaluations/protocol-stats/:id`
- PDF incluir:
  - Radar chart (renderizado como imagem via canvas.toDataURL)
  - Tabela de categorias com pontuações reais
  - Classificação e interpretação
  - Dados do paciente e profissional

---

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/app/modules/protocolos/pages/protocolo-detail.component.ts` | Reescrever template + adicionar Chart.js |
| `src/app/modules/protocolos/pages/protocolo-form.component.ts` | Adicionar radar global + painel de resumo no topo |
| `src/app/modules/protocolos/pages/protocolos-list.component.ts` | Corrigir exportPDF para dados reais |

## Dependências
- Chart.js (já instalado e registrado)
- html2pdf.js (já declarado no componente de lista)
- Endpoint backend `protocol-stats/:id` (já implementado)

## Ordem de implementação
1. Detalhe (maior impacto visual)
2. Lista (correção do PDF)
3. Formulário (melhoria incremental)
