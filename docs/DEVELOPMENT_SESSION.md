# Histórico de Desenvolvimento - Clone Psicopedagoga

## Sessão: 03/08/2026

### Resumo
Migração completa de um sistema React/Supabase para Angular 18 + Express.js + Prisma + SQLite. Implementação de documentos clínicos e correções.

---

## Fase 1: Estrutura Base
- Removido `@prisma/client` do frontend
- Criadas 18 interfaces em `core/models/index.ts`
- Auth com bcrypt + JWT
- Role guard com GESTOR, PSICOPEDAGOGO, SECRETARIA
- Services dedicados: financeiro, comunicacao, configuracoes, users
- Login com validação reativa

## Fase 2: Login Social
- Passport.js + Google OAuth (`src/config/passport.ts`)
- Tabela `social_accounts` no Prisma
- Rotas `GET /auth/google` + `GET /auth/google/callback`
- Componente `AuthCallbackComponent` frontend
- Botão Google no login

## Fase 3: Portal do Responsável
- Backend: rotas guardian (link, dashboard, patients, evolutions, financial, documents, appointments, chat, profile)
- Frontend: módulo Guardian com layout independente, dashboard, evoluções, financeiro, documentos, chat, configurações

## Fase 4: Protocolo TEA
- 200 itens (5 categorias × 4 subcategorias × 10 itens)
- Gráfico radar
- Sidebar com navegação por categorias
- Busca e filtros
- Estatísticas por avaliação

## Fase 5: Planos de Intervenção
- Formulário multi-step (3 etapas: Avaliação, Habilidades, Roteiro)
- Calculadora financeira
- Exportação PDF via html2pdf.js

## Fase 6: Upload de Documentos
- Multer + UUID para filenames
- Rotas: POST /upload, POST /upload/multiple, GET /uploads/:filename, DELETE /uploads/:filename
- Componente drag & drop com preview
- Suporte: PDF, DOCX, XLSX, JPG, PNG, GIF, CSV (10MB max)

## Fase 7: Endereços Separados
- Componente compartilhado `AddressFormComponent` com busca CEP via ViaCEP
- Atualizados: Escola, Paciente, Responsável, Anamnese, Configurações
- Schema Prisma: campos separados (cep, street, neighborhood, number, complement, city, state)

## Fase 8: Telefone com Máscara e WhatsApp
- Componente compartilhado `PhoneInputComponent`
- Máscara automática: `(00) 00000-0000`
- Checkbox WhatsApp ao lado
- Atualizados: Escola, Paciente, Responsável, Configurações

## Fase 9: Níveis de Ensino Multi-seleção
- Checkboxes para selecionar múltiplos níveis
- Opções: Educação Infantil, Anos Iniciais, Anos Finais, Ensino Médio, Superior, Profissionalizante
- Salva como JSON array no banco

## Fase 10: Busca e Cadastro Rápido
- **Paciente → Responsável**: campo de busca com dropdown + modal para novo responsável
- **Responsável → Paciente**: seção "Pacientes Vinculados" + modal para novo paciente

---

## Fase 11: Dados de Teste (03/08/2026)
- Cadastrados 2 responsáveis fictícios
- Cadastrados 2 pacientes fictícios vinculados aos responsáveis
- Credenciais: admin@test.com / 123456

## Fase 12: Dashboard - Cards Clicáveis
- Cards do dashboard convertidos de `<div>` para `<button>`
- Navegação para módulos relacionados
- Efeito hover com `hover:-translate-y-1`

## Fase 13: Documentos Clínicos (03/08/2026)
- **Diário de Sessões**: Formulário + preview + export PDF
- **Ficha de Frequência**: Formulário + horários + export PDF
- **Plano de Intervenção**: Multi-step (3 passos) + cálculos financeiros + export PDF
- Novas tabelas no Prisma: SessionDiary, FrequencySheet, InterventionDocument
- Rotas CRUD: /api/session-diaries, /api/frequency-sheets, /api/intervention-documents

## Fase 14: Correção - Protocolo TEA
- Corrigido bug: `professionalId` vazio causava erro de foreign key
- Solução: Injetar AuthService para obter ID do usuário logado

---

## Stack Utilizada

### Frontend
- Angular 18
- Angular Material
- Tailwind CSS
- html2pdf.js
- Chart.js (gráfico radar + bar)

### Backend
- Express.js + TypeScript
- Prisma ORM (20+ models)
- SQLite
- Passport.js (Google OAuth)
- Multer (upload)
- jsonwebtoken
- bcrypt

---

## Credenciais de Acesso

| Email | Senha | Perfil |
|-------|-------|--------|
| sarah@edupsych.com | 123456 | GESTOR |
| admin@test.com | 123456 | GESTOR |

---

## Arquivos Importantes

- `backend/src/routes/upload.ts` - Rotas de upload
- `backend/src/config/passport.ts` - Google OAuth
- `backend/src/routes/guardian.ts` - Portal do responsável
- `backend/src/routes/session-diaries.ts` - Diário de sessões
- `backend/src/routes/frequency-sheets.ts` - Fichas de frequência
- `backend/src/routes/intervention-documents.ts` - Planos de intervenção
- `backend/src/seed.ts` - Seed do banco
- `backend/prisma/schema.prisma` - Schema do banco (20+ models)
- `src/app/modules/documentos-clinicos/` - Módulo de documentos clínicos
- `src/app/core/components/address-form.component.ts` - Componente endereço
- `src/app/core/components/phone-input.component.ts` - Componente telefone
- `src/app/core/guards/role.guard.ts` - Guard de permissões

---

## Como Rodar

```bash
# Backend
cd backend
npm install
npx prisma db push
npx tsx src/seed.ts
npm run dev

# Frontend (outra aba)
npm install
npm run start
```

Acesse: http://localhost:4200/
