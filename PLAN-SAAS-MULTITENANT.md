# PLANO SAAS MULTI-TENANT

## Objetivo
Transformar o EduPsych Pro (atualmente single-tenant, uma clínica por instalação) em um SaaS multi-tenant por assinatura mensal, estilo Netflix — cada clínica/profissional paga mensalidade.

**Estratégia escolhida:** Shared database com `tenantId` em todas as tabelas de negócio (1 banco, N clínicas isoladas por `tenantId`).

**Tenant = Clínica/Empresa.** Usuários podem pertencer a várias clínicas (Membership + role por clínica).

---

## Fase 0 — Fundação de dados (Prisma)

### Modelos novos
- **`Tenant`**: id, name, slug, plan (`TRIAL|BASICO|PRO`), status (`ATIVO|BLOQUEADO`), trialEndsAt, logoUrl, colors, createdAt, updatedAt
- **`Membership`**: id, tenantId, userId, role, active (`@@unique([tenantId, userId])`)

### Alterações existentes
- `tenantId String` em **todas as tabelas de negócio** (~30):
  Paciente, Responsible, School, Prontuario, Anamnese, Sessao, Laudo, Encaminhamento, Comunicacao, FinanceiroSessao, Notification, Document, Appointment, LibraryResource, Transaction, SessionRecord, ABAAssessment, ABAProgram, ABADataPoint, ProtocolEvaluation, InterventionPlan, ChatMessage, SessionDiary, FrequencySheet, InterventionDocument, ConsentLog, Nfse, WaitingRoom, DocumentRequest, Availability
- Índice composto `@@index([tenantId])` (ou `[tenantId, createdBy]`) — evita scan full-table
- **Não recebem tenantId**: User, Tenant, Membership, VerificationCode, SocialAccount (globais/pessoais)

### Migração do banco existente
- Script de backfill: cria Tenant `"Clínica Principal"` → preenche `tenantId` em todos os registros existentes → cria Membership do admin atual
- Dados de teste/uso preservados

### Banco
- v1: **SQLite** (dados atuais, sem migração de dados)
- Produção/venda: **Postgres** (troca do provider, sem mudança de código — helper scoped já abstrai)

---

## Fase 1 — Backend (scoping de dados)

- JWT carrega `tenantId` + roles por tenant (via Membership)
- Middleware `tenantGuard`: valida token → `Tenant.status != BLOQUEADO` → anexa `req.tenantId`
- Helper `lib/tenant.ts` (obrigatório em TODAS as queries de negócio):
  ```ts
  scoped(prisma, req).paciente.findMany() // injeta where: { tenantId }
  ```
  Revisão das 40+ rotas — 1 falha = vazamento entre clínicas (crítico)
- Relacionamentos validam mesmo tenant (paciente/responsável/agendamento)
- `POST /auth/register-clinic`: cria Tenant (trial 14d) + User admin + Membership
- Login existente valida Membership ativa

---

## Fase 2 — Frontend

- Seleção de clínica no login quando usuário tem múltiplas Memberships (dropdown) → token scoped
- Header mostra nome/logo da clínica (do token)
- Portal `/guardian` também scoped
- (Futuro) subdomínio por clínica `clinicax.app.seuclinica.com` — requer wildcard DNS + hostName na URL: postergado para v2

---

## Fase 3 — Planos e cobrança

- `Plan` (código, preço, limites de pacientes/profissionais) + `Subscription` (tenantId, plano, vencimento, providerId)
- **Asaas / Mercado Pago — Pix recorrente** (padrão clínicas BR): webhook `POST /api/billing/webhook` confirma pagamento
- Vencimento → `Tenant.status = BLOQUEADO` → login recusa; renovação reativa
- Limites aplicados no backend (bloqueio acima do plano)
- Trial 14 dias automático no registro

---

## Fase 4 — Deploy Oracle + domínio

- Domínio `seuclinica.com` (registro.br ~R$40/ano): `app.seuclinica.com` (sistema) + raiz (landing)
- Instância ARM Ubuntu: nginx (Angular estático + proxy `/api`) + PM2 (backend) + Docker (Evolution API)
- **Risco:** WhatsApp costuma bloquear IP de datacenter (Oracle) — testar com número descartável
- Let's Encrypt + security list OCI (80/443) + `FRONTEND_URL` com domínio
- Backups: cron `pg_dump` quando em Postgres

---

## Fase 5 — Venda

- Landing com pricing + checkout Asaas (link recorrente)
- Página "Minha conta" da clínica: assinatura, fatura, upgrade

---

## Esforço estimado
- Fase 0-2: 1-2 dias (scoping de 40 rotas é o grosso)
- Fase 3: 1 dia
- Fase 4: 1 dia
- Fase 5: 1/2 dia

## Riscos principais
1. **Isolamento entre clínicas** (query sem tenantId) — mitigado pelo helper scoped + auditoria
2. **WhatsApp em IP de datacenter** — testar cedo
3. **LGPD** — base legal para dados de pacientes em cloud (DPA) + ConsentLog por tenant

---

## Status
- [x] Fase 0 — models Tenant/Membership + tenantId | **concluída 10/08/2026**
- [x] Fase 0 — backfill do banco atual (Tenant "Clínica Principal", 33 tabelas, 7 memberships, sem órfãos)
- [x] Fase 1 — backend scoping (helper `scoped` em todas as rotas de negócio, queries por id com `{ id, tenantId }`, seed escopado, teste de isolamento `backend/scripts/test-isolation.ts`) | **concluída 10/08/2026**
- [x] Fase 2 — frontend multi-clínica v1 (seleção de clínica no login, switcher no header, X-Tenant-Id) | **concluída 10/08/2026**
- [ ] Fase 3 — billing
- [ ] Fase 3a — gateway real (Asaas/Mercado Pago) + landing de venda
- [ ] Fase 4 — deploy
- [ ] Fase 5 — venda

## Notas Fase 3 (billing)
- **Models:** `Plan` (code, name, priceCents, maxPacientes, maxProfissionais, trialDays, features) + `Subscription` (tenantId, planId, status PENDENTE|ATIVA|CANCELADA, currentPeriodEnd, providerId)
- **Seed:** 3 planos → `TRIAL` (R$0, 10 pacientes/2 profs, 14 dias), `BASICO` (R$149, 100/10), `PRO` (R$299, ilimitado) e `PRO` ativo na Clínica Principal
- **Trial lazy:** `lib/billing.ts` cria a subscription da 1ª vez que um usuário da clínica faz login/requisição (vencimento = now + 14d)
- **Enforcement:** middleware auth `enforceTenantStatus` (401 sem assinatura, 403 tenant BLOQUEADO/vencido) + `enforcePlanLimits` nos POSTs de pacientes/users (402 "Limite do plano atingido")
- **Rotas** `routes/billing.ts`: `GET /plans`, `GET /billing` (status + uso), `POST /checkout` (PIX mock com `pixCopiaECola`), `POST /mock-pay` (ativa +30d; produção: Asaas/MercadoPago), `POST /webhook` (proteção por header `X-Billing-Webhook-Token`, default dev `BILLING_WEBHOOK_TOKEN`)
- **Fix errorHandler:** o wrapper async-express tinha 3 parâmetros e quebrava o reconhecimento de error-middleware (4 params) do Express — respostas de erro viravam HTML default; agora o wrap emite variante de 4 params quando `fn.length >= 4` e toda resposta de erro é JSON
- **Frontend:** rota `/app/plano` (`modules/billing`) — plano atual, barras de uso (pacientes/profissionais), cards dos 3 planos com preços, PIX copia-e-cola + botão "Simular pagamento" (mock), item "Plano e Assinatura" no sidebar
- **Validado:** checkout TRIAL→BASICO (PENDENTE + 402 no limite de 10), mock-pay ATIVA +30d, webhook com/sem token (200/401), assinatura vencida → login 403 (renovação reativa), erros sempre JSON
- **Pendência (fase 3a):** `checkoutPlan`/`createProviderCheckout` é stub mock — trocar por Pix recorrente real, `processWebhookEvent` por verificação de assinatura do payload no provider

## Notas Fase 2
- Backend: `POST /auth/login` retorna `tenants[]` + `tenant` (default = 1ª clínica não bloqueada); `GET /auth/tenants` (autenticado) devolve as clínicas ativas; `POST /auth/select-tenant` valida membership e devolve o tenant
- **Seleção por request:** o JWT não carrega tenantId — a middleware resolve a membership a cada request e aceita o header `X-Tenant-Id` (se o usuário tem vínculo ativo lá); sem header → primeira clínica não bloqueada
- `req.user.tenant` agora carrega {id, name, slug, plan, status, logoUrl, colors}
- Frontend: page `/auth/select-clinic` (cards de clínica) quando login tem >1 membership; chip com dropdown de troca no header do `main-layout` e `guardian-layout`; `AuthService` guarda `auth_tenants`/`auth_tenant` no localStorage; interceptor envia `X-Tenant-Id`
- Limitação v1: lista de clínicas só atualiza no próximo login (sem polling); Google OAuth busca tenants via `refreshTenants()` no callback

## Notas Fase 1
- Globais sem scoping: `User`, `Tenant`, `Membership`, `VerificationCode`, `SocialAccount` (não têm tenantId no schema)
- Intencionalmente não escopadas: `reset.ts` (drop do banco) e `document-requests.ts` (rotas públicas por token único, sem auth)
- `users.ts` e `permissions.ts` só acessam `prisma.user` (global) — sem mudança
- Teste: `cd backend && npm run test:isolation` (sobe servidor na 3999, valida 16 cenários, limpa tudo)
- `lib/async-express.ts` (carregado via `lib/prisma.ts`): Express 4 não propaga rejeições async — envolvimento de handlers garante 404/erros reais no errorHandler; sem dependência nova
- Fase 2 (frontend): seleção de clínica no login via Memberships múltiplas; header com nome/logo da clínica; token JWT carrega tenantId — hoje a `authenticate` já resolve a membership por request (usa a primeira ativa)

## Notas Fase 0
- `tenantId` usa `@default("")` (necessário p/ db push não-destrutivo no SQLite); backfill é idempotente (`backend/src/backfill-tenant.ts`) — reexecutar ao final da Fase 1 para capturar registros criados com tenant vazio
- `Nfse.number` segue globalmente único (por tenant seria `@@unique([tenantId, number])` — pendente p/ Postgres)