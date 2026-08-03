# EduPsych Pro - Clone Angular Session Notes

## Data: 03/08/2026 (Atualizado)

## Status: 100% Implementado + Documentos Clínicos + Bug Fix Signal

---

## Stack

### Original (Referência)
- React 19 + Vite + Supabase + Tailwind CSS + Recharts
- Localização: `/Users/amauri/psicopedagoga/`

### Clone (Implementado)
- Angular 18 + Express + Prisma/SQLite + Tailwind CSS + Chart.js
- Localização: `/Users/amauri/clone-psicopedagoga/`
- GitHub: `https://github.com/amakurt/clone-psicopedagoga`

---

## Módulos Implementados

| Módulo | Features | Status |
|--------|----------|--------|
| **Login** | Social buttons, seleção de perfil, JWT tokens | OK |
| **Dashboard** | Chart.js bar, activity feed, toast, cards clicáveis | OK |
| **Pacientes** | CPF/Phone/CEP masks, avatar, batch codes | OK |
| **Agenda** | 4 views (Day/Week/Month/Year) | OK |
| **Financeiro** | PDF receipts, monthly reports, confirm payment | OK |
| **Documentos** | Upload, categories, download, sign, share | OK |
| **Evoluções** | Star ratings, frequency PDF | OK |
| **Configurações** | Full page (profile, password, clinic) | OK |
| **Protocolos** | 200 items TEA, radar chart, classification, PDF | OK |
| **Planos** | Financial calc, frequency/duration, PDF | OK |
| **Biblioteca** | Grid view, filters, upload | OK |
| **Documentos Clínicos** | Diário, Fichas, Planos com export PDF | OK NOVO |
| **Guardian Portal** | Layout separado para responsáveis | OK |

---

## Dados de Teste Cadastrados (03/08)

### Responsáveis
- Maria Silva Santos (Mãe) - (11) 98765-4321
- João Oliveira Costa (Pai) - (11) 97654-3210

### Pacientes
- Lucas Silva Santos - 11 anos, 5º ano (filho da Maria)
- Ana Beatriz Oliveira Costa - 7 anos, 2º ano (filha do João)

---

## Infraestrutura

- **Tailwind CSS** v3.4.17 (dark mode, custom primary)
- **Chart.js** 4.4.7 (bar + radar)
- **html2pdf.js** para PDFs
- **Prisma** 20+ models, 28 rotas backend
- **Auth** middleware com JWT tokens
- **Modais** reutilizáveis criados
- **Notification Dropdown** criado

---

## Documentos Clínicos (NOVO - 03/08)

### Diário de Sessões
- Rota: `/documentos-clinicos/diario`
- Backend: `POST/GET/PUT/DELETE /api/session-diaries`
- Campos: Aluno, Nº sessão, Data, Profissional, Objetivo, Instrumentos, Comportamento, Atividades, Observações

### Ficha de Frequência
- Rota: `/documentos-clinicos/frequencia`
- Backend: `POST/GET/PUT/DELETE /api/frequency-sheets`
- Campos: Aluno, Data, Horário entrada/saída, Atividades, Instrumentos, Observações, Rubrica responsável

### Plano de Intervenção
- Rota: `/documentos-clinicos/plano`
- Backend: `POST/GET/PUT/DELETE /api/intervention-documents`
- 3 Passos: Avaliação → Habilidades → Roteiro
- Campos: Nº sessões, Valor/sessão, Valor total, Frequência, Duração

---

## Correções nesta Sessão

### 1. Protocolo TEA - professionalId vazio
- **Bug:** Erro `Foreign key constraint violated` ao salvar avaliação
- **Causa:** `professionalId` sendo enviado como string vazia `''`
- **Correção:** Injetado `AuthService` no componente para usar `this.auth.user()?.id`

### 2. Dashboard - Cards Clicáveis
- Cards do dashboard agora são botões clicáveis com navegação

### 3. Protocolo TEA - evaluations signal (CORREÇÃO CRÍTICA)
- **Bug:** Ao editar avaliação, apenas 2 itens apareciam quando todos foram preenchidos
- **Causa:** `evaluations` era um objeto plain `Record<string, number>`. Angular's change detection nao rastreia mutacoes em objetos plain, entao o `setScore()` nao atualizava a UI e o objeto nao acumulava corretamente
- **Correcao:** Convertido `evaluations` de plain object para `signal<Record<string, number>>({})`
- **Metodos atualizados:** `getScore()`, `setScore()`, `getCategoryScore()`, `getSubcategoryScore()`, `totalScore()`, `loadEvaluation()`, `save()`
- **Antes:** `this.evaluations[key] = score` (plain mutation)
- **Depois:** `this.evaluations.update(evals => ({ ...evals, [key]: score }))` (immutable signal update)

---

## Usuário de Teste
- Email: `admin@test.com` ou `sarah@edupsych.com`
- Senha: `123456`

---

## Para Continuar

### Backend
```bash
cd /Users/amauri/clone-psicopedagoga/backend
npm run dev
```

### Frontend
```bash
cd /Users/amauri/clone-psicopedagoga
npm start
```

### Acessar
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

---

## Arquivos Importantes

### Config
- `tailwind.config.js` - Tailwind config
- `postcss.config.js` - PostCSS config
- `src/styles.scss` - Global styles com Tailwind directives

### Frontend
- `src/app/modules/*/pages/*.component.ts` - Todos os módulos
- `src/app/modules/protocolos/pages/protocolo-form.component.ts` - Protocolo TEA (corrigido com signal)
- `src/app/modules/documentos-clinicos/` - Módulo de documentos clínicos
- `src/app/shared/components/` - Componentes reutilizáveis
- `src/app/core/services/` - Serviços (API, Auth)
- `src/app/core/interceptors/` - Error interceptor

### Backend
- `backend/src/index.ts` - Express server
- `backend/src/routes/` - 28 rotas REST
- `backend/src/middleware/auth.ts` - Auth middleware
- `backend/prisma/schema.prisma` - 20+ models

---

## Próximos Passos

1. Portal do Responsável (Guardian) - testes completos
2. Google OAuth - configurar credenciais reais
3. Listagem/histórico dos documentos clínicos salvos
4. Testes E2E
5. Deploy

---

## Comandos Úteis

```bash
# Build Angular
npx ng build

# Prisma push (sincronizar schema)
cd backend && npx prisma db push

# Seed database
cd backend && npx tsx src/seed.ts

# Git push
git add -A && git commit -m "message" && git push
```
