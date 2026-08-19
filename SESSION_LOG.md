# Registro de Sessões - Projeto EduPsych Pro Clone

## Última Atualização: 18 de Agosto de 2026

---

## Sessão 20 - 18/08/2026 (Terça) — Sync GitHub + sistema no ar no Windows + Docker/Evolution API + "Registros Anteriores" em todos os módulos

### O que foi feito

#### 1. Sync com GitHub
- `git pull` de 11 commits (a1ca207 → 9ca8124): auditoria de segurança (helmet, rate limiting, XSS, OAuth code exchange), `.env` removidos do repo, docs e backups de sessão
- `backend/.env` e `evolution-api/.env` recriados localmente com os valores fornecidos pelo usuário (ignorados pelo git)

#### 2. Sistema no ar no Windows
- `npm install` no backend (helmet + express-rate-limit que vieram no pull)
- `environment.ts` ajustado: apiUrl `192.168.20.132` (Mac) → `192.168.0.100` (IP atual do Windows); FRONTEND_URL atualizada
- Backend :3000 + Frontend :4200 desanexados com logs; login validado (sarah@edupsych.com → Dra. Sarah Miller)

#### 3. Evolution API (WhatsApp)
- Docker Desktop instalado manualmente pelo usuário (winget falhou no UAC); CLI em `AppData\Local\Programs\DockerDesktop\resources\bin` (fora do PATH)
- `docker compose up -d` → postgres + redis + evolution-api v2.3.7 na :8080; instância `edupsych` criada (integration WHATSAPP-BAILEYS obrigatória) + QR salvo em `whatsapp-qr.png`
- Usuário decidiu não usar WhatsApp por enquanto — parear depois quando quiser

#### 4. "Registros Anteriores" nos 6 módulos restantes
- Backend: filtro `pacienteId` em `/laudos`, `/appointments`, `/encaminhamentos`; rotas `DELETE /prontuarios/:id` e `DELETE /encaminhamentos/:id` criadas
- Frontend: `evolucao-form` (badge de métricas colorido), `anamnese-form` (wizard + parse de endereço), `laudo-form` (badge de status), `prontuario` (editar/excluir), `agenda-form` (chip de status), **nova página** `encaminhamentos/novo` com form completo + registros anteriores (rota `novo` antes de `:id`, botão na lista, título no header)
- Bug FK: `paraUserId` vazio → `null` no payload
- Validado: `tsc` limpo, `ng build` limpo, ciclos API de criar/editar/DELETE 204 com dados do Theo

### Backup da conversa
- feito: `session-backup/2026-08-18-windows-sync-notificacoes.json` (export opencode da sessão completa)

### Commits
- `e88af76` — registros anteriores nos 6 módulos + notificações de encaminhamento + fix loop do gráfico ABA + docs

---

## Sessão 21 - 18/08/2026 (Terça, continuação) — Notificações de encaminhamento + fix do gráfico ABA

### O que foi feito

#### 1. Notificação ao profissional de destino no encaminhamento
- `POST /encaminhamentos`: destino (`paraUserId`) recebe "Novo encaminhamento" (autor, paciente e motivo no texto; type `encaminhamento`; pula se autor = destino)
- `PUT /encaminhamentos/:id`: quando o destino responde ou muda o status, o **autor** recebe "Encaminhamento atualizado" (status + resposta)
- Dropdown de notificações: type `encaminhamento` → ícone `forward` + cor sky
- Validado ponta a ponta via API real (Sarah → Maria José; Maria responde → Sarah); dados de teste removidos; `tsc` e `ng build` limpos

#### 2. Bug: gráfico dos programas ABA oscilava infinitamente
- Causa: Chart.js `responsive: true` + `maintainAspectRatio: false` + canvas `height="80"` dentro de container sem altura fixa → loop infinito de resize (ResizeObserver)
- Fix: wrapper `<div class="h-24">` + atributo `height` removido do canvas; `ng build` limpo

### Backup da conversa
- feito: `session-backup/2026-08-18-windows-sync-notificacoes.json` (export opencode da sessão completa)

### Commits
- `e88af76` (enviado no commit anterior) — este backup é o item pendente da Sessão 20

---

## Sessão 19 - 17/08/2026 (Segunda) — Dados de teste do Theo + listagem de registros nos documentos clínicos + exclusão com modal de perigo

### O que foi feito
- **Avaliações ABA do Theo** (id `cmsezw1em000f8882p6561p4b`): 6 avaliações (ABLLS-R 116→132, VB-MAPP 77→114, DENVER 62→87) em 2 rodadas (baseline 10/08 Carlos Eduardo + reavaliação 17/08 Ana Carolina), todos os itens pontuados
- **Bug fix ABA:** `assessedAt` precisava de ISO-8601 completo (data só dava 400 Prisma) + página não listava avaliações existentes → auto-load + chips + save com PUT quando já existe
- **Dados completos do Theo:** 3 laudos, 7 documentos, 1 anamnese, 2 prontuários, 6 evoluções, 1 protocolo TEA (200 itens/39%), 4 diários, 4 fichas de frequência, 2 planos de intervenção, 2 encaminhamentos, 3 financeiro, 3 agendamentos, 3 programas ABA com data points
- **Dedupe:** script rodou 2× → duplicatas removidas (API; prontuários/encaminhamentos sem rota DELETE → SQL direto no dev.db)
- **"Registros Anteriores"** em diario-sessao, frequencia-form e plano-intervencao-doc: listagem por paciente, editar (PUT), excluir (DELETE), resetForm, contador — páginas antes só de formulário
- **Documentos:** botão excluir (lixeira) + modal de perigo ("ação PERMANENTE, responsável perde acesso") com confirmText "Excluir definitivamente"
- `ng build` limpo; ciclo POST/PUT/DELETE validado via API; backup da conversa em `session-backup/2026-08-17-dados-testes-documentos-clinicos.json`

### Onde continuar (pós-almoço)
- Testar no navegador: `/app/documentos-clinicos/diario|frequencia|plano` (selecionar Theo → registros anteriores com editar/excluir) e `/app/documentos` (lixeira → modal de perigo → excluir)
- Candidatos naturais para o mesmo padrão "Registros Anteriores": evoluções (session-records), anamnese, laudos, prontuários, encaminhamentos, agendamentos

---

## Sessão 18 - 14/08/2026 (Sexta, noite) — Retomada no Windows: sync verificado + sistema no ar

### O que foi feito

#### 1. Verificação local vs GitHub
- `git fetch --all --prune`, `branch -a`, logs com autor/data — local (Windows) idêntico ao `origin/main` (`3d6d81f`), working tree limpo, 0 untracked
- Arquivos-chave do último commit de trabalho do Mac (`0e9d5f1` 13/08 17:00) confirmados no disco (`theme.ts`, `pix.ts`, `tailwind.config.js`, `configuracoes.component.ts`, `dev.db` 638KB)

#### 2. Sistema no ar localmente (Windows)
- Backend `npm run dev` (porta 3000) e frontend `npm start` (porta 4200) desanexados via `Start-Process cmd /c` (WindowStyle Hidden), logs `backend.log`/`frontend.log` na raiz
- Validado: login real `sarah@edupsych.com` → Dra. Sarah Miller (GESTOR); frontend HTTP 200

#### 3. Achado importante (pendência)
- Usuário relatou commit feito HOJE (14/08) no Mac que **não está no GitHub** (último lá: `0e9d5f1` 13/08) — push pendente do Mac (`git push origin main`); depois `git pull` aqui e reiniciar o sistema com as alterações novas

### Backup da conversa
- `session-backup/2026-08-14-retomada-windows.json` — histórico completo desta sessão (formato opencode, como os anteriores)

### Commits
- (registrado neste commit — backup da sessão 18)

---

## Sessão 17 - 14/08/2026 (Sexta) — Sincronização com o GitHub

### O que foi feito

#### 1. Pull de 30 commits do origin/main (fast-forward 3e0d2cd..0e9d5f1, 167 arquivos)
- Repo local (Windows) estava 30 commits atrás do trabalho feito no Mac — atualizado sem conflitos
- Chegaram: PIX próprio (QR EMV + copia-e-cola + "já paguei"), Asaas real fase 3a, SaaS multi-tenant fases 1-3 (scoping/planos/trial/seleção de clínica), `deploy/` (provision + setup + nginx + postgres + backup + migrador sqlite→postgres validado), chat polling + WhatsApp Evolution, Google OAuth real, verificação/redefinição de senha, tema escuro + accent configurável, menus expansíveis, `backend/prisma/dev.db` com dados reais

#### 2. Instalação de dependências
- `npm install` na raiz (+22 pacotes) e no backend (+2 pacotes; postinstall `protobufjs` bloqueado por allowScripts — inofensivo)
- `npx prisma generate` no backend (Prisma Client v5.22.0) após schema mudar bastante

#### 3. Validação
- `git status` limpo antes/depois; pull sem conflitos; build não revalidado nesta sessão (sem mudança de código)

### Backup da conversa
- `session-backup/2026-08-14-sync-github.json` — histórico completo desta sessão (formato opencode, como os anteriores)

### Commits
- (registrado neste commit — backup da sessão 14/08)

---

## Sessão 17c - 14/08/2026 (Sexta) — Sessão por navegador (fechar aba/navegador exige login)

---

## Sessão 16 - 13/08/2026 (Quinta) — Cobrança PIX própria + tema escuro completo + cor de destaque

### O que foi feito

#### 1. Cobrança via PIX própria do profissional (sem gateway)
- Cada profissional cadastra sua própria chave PIX (Configurações → Recebimento); o sistema monta o QR Code/copia-e-cola (EMV/BR Code estático, CRC-16 validado contra exemplo oficial do BCB `1D3D`); o profissional exibe/compartilha (WhatsApp); o portal do responsável (menu renomeado para "Cobranças") lista as cobranças e paga com "Já paguei" → notifica a equipe
- Schema: `User.pixKey/pixKeyType` + `FinanceiroSessao.paymentMethod/pixCopiaECola/pixKey/pixKeyType/chargeShared/payConfirmedByGuardian` (backend + raiz, `db push`)
- `backend/src/lib/pix.ts` (novo): gerador EMV estático + `normalizePixKey` por tipo; **PHONE → E.164 com +55** (o app do banco recusava "código inválido" porque o DICT armazena telefone com DDI)
- `financeiro.ts` reescrito: normaliza form↔schema, `GET /:id`, `DELETE /:id`, `POST /:id/generate-pix` (regenera se chave mudou ou código obsoleto); `auth.ts` valida formato da chave no PUT /profile; `guardian.ts` com `GET /charges` (isolamento validado) e `POST /charges/:id/pay`
- Frontend: `qrcode` instalado, `AuthService.updateUser()`, aba Recebimento com dicas por tipo, modal QR com copiar/compartilhar WhatsApp no financeiro-list, `guardian-financial` reescrito
- E2E via API validado (perfil → cobrança → PIX com `+5585988014049` → charges isoladas → pay com notificação) e dados de teste limpos

#### 2. Tema escuro completo
- Bug: texto de inputs ilegível (branco em branco) em páginas legadas → 13 telas com paleta `gray` fixa adaptadas via CSS scoped `.dark` + marcadoras `legacy-page`/`legacy-card` em `styles.scss` (cards, textos, bordas, inputs, placeholders, hovers, rings)
- Cabeçalhos de laudos (fora do card) corrigidos movendo a marcadora para a raiz; hover states remapeados
- Cor de destaque (Aparência) consertada: 3 bugs — variável morta `--color-primary`, Tailwind com hex fixo, cor não persistida no load → `tailwind.config.js` agora usa `rgb(var(--primary-rgb) / <alpha-value>)` + novo `src/app/core/utils/theme.ts` (`applyAccentColor` com triplets RGB e derivações) + aplicação no main-layout ngOnInit
- Botão "Salvar Alterações" invisível = estado HMR corrompido após troca do tailwind.config.js → reinício do dev server (pid 18354) + hard reload

#### 3. Validação
- `tsc --noEmit` (backend) e `ng build` limpos; CSS de produção e dev conferidos (regras `rgb(var(--primary-rgb)...)`, `:root` com triplets, remaps legacy)

---

## Sessão 15 - 13/08/2026 (Quinta) — Reorganização da navegação (menus expansíveis)

### O que foi feito

#### 1. Sistema no ar localmente (processos desanexados)
- `start-all.sh` subia os serviços, mas os processos morriam quando o shell encerrava (process group morto pelo tool do agente) → backend e frontend subidos com `start_new_session=True` (Python `subprocess.Popen`), logs em `logs/backend.log` e `logs/frontend.log`
- Login real validado (sarah@edupsych.com → JWT)

#### 2. Menu "Documentos" expansível com submenus (`main-layout.component.ts`)
- `navItems` plano → tipo `NavItem` com `children?` (movido para escopo do módulo — `type` dentro da classe quebra o compile do Angular); `menuOpen` signal + `toggleMenu`/`isExpanded`/`isGroupActive` + `syncExpandedMenus()` (auto-expande na rota ativa)
- Grupos renderizam button com chevron `expand_more` (rotate-180); sub-itens com `border-l-2`; `routerLinkActiveOptions="{ exact: true }"` no item Arquivos (evita conflito `/app/documentos` × `/app/documentos-clinicos`); submenu oculto com sidebar recolhida
- Grupo Documentos: Arquivos, Diário de Sessões, Frequência, Plano de Intervenção, Biblioteca, Laudos (novo item — rota existia sem menu), Solicitações, LGPD

#### 3. Menu "Protocolos" expansível
- Protocolo TEA, Avaliação ABA, Programas ABA

#### 4. Títulos do header por subrota
- `laudos` adicionado ao mapa; `documentos-clinicos/{diario,frequencia,plano}` e `protocolos-aba/{assessment,programs}` com títulos próprios

#### 5. `/app/plano` — planos ocultos para assinantes ativos
- Assinatura ATIVA → cards de planos somem; link sutil "Trocar de plano" expande/colapsa o grid (signal `showPlans` + `hasActiveSubscription()`); sem assinatura ativa os cards aparecem direto

#### 6. Validação
- `ng build` limpo; dev server no ar (http://localhost:4200)

### Backup da conversa
- `session-backup/2026-08-13-menu-documentos-protocolos.json` — export da sessão `ses_004e69997ffeg9vrVrfphdG0Ur`

### Commits
- (nenhum — pendente, inclui também `backend/prisma/dev.db` modificado)

---

## Sessão 14 - 12/08/2026 (Quarta) — SAAS Multi-tenant: Fase 5 (venda — landing com planos + registro de clínica self-service)

### O que foi feito

#### 1. Backend — `POST /auth/register-clinic`
- Helpers em `lib/tenant.ts`: `slugifyClinic` + `generateUniqueSlug` (sufixo numérico em colisão) + `createClinicWithAdmin` (Tenant TRIAL 14d + User GESTOR + Membership + Subscription TRIAL)
- Rota em `routes/auth.ts`: valida nome/email/senha/clinicName (email único, senha ≥6), reusa fluxo de ativação por email/WhatsApp, retorna `needsVerification` + `tenant`

#### 2. Frontend — login/registro + landing
- **Bug corrigido:** `?mode=register` da landing não era lido (form nunca abria em modo registro) — agora lê `mode` e `plan`
- Campo **"Nome da Clínica"** obrigatório para papéis profissionais no registro (→ `register-clinic`); RESPONSAVEL segue com `register`
- Pós-login com `plan` escolhido → redirect direto para `/app/plano`
- Landing: seção **Planos e Preços** (`#planos`) com cards dos 3 planos via `GET /billing/plans` (público), preço BRL, features, destaque BÁSICO, CTAs → `/login?mode=register&plan=CODE`; link "Planos" na navbar

#### 4. Remoção do Laboratório de Notificações
- Removida a seção de testes "Laboratório de Notificações" do `DashboardComponent` e seus métodos/sinais associados (`labNotifications`, `createTestNotification`, `showToast`).

### Commits
- `fix(dashboard): remover laboratorio de notificacoes`

---

## Sessão 13 - 10/08/2026 (Segunda) — SAAS Multi-tenant: Fase 3 (billing: planos, trial, limites, assinatura)

### O que foi feito

#### 1. Backend — Plan/Subscription + trial + enforcement
- Models `Plan`/`Subscription` (+`Tenant.subscription`); seed dos 3 planos (TRIAL R$0 10/2 14d; BASICO R$149 100/10; PRO R$299 ilimitado) com Clínica Principal em PRO ativa
- `lib/billing.ts`: trial lazy 14d no 1º acesso, `enforceTenantStatus` (401 sem assinatura / 403 vencido⇒BLOQUEADO / renovação reativa), `enforcePlanLimits` → 402, `checkoutPlan` (PIX mock), `activateSubscription` (+30d)
- `routes/billing.ts`: `GET /plans`, `GET /billing`, `POST /checkout`, `POST /mock-pay`, `POST /webhook` (token por header `X-Billing-Webhook-Token`)
- Enforcement plugado em: middleware auth (toda rota), login, POST pacientes, POST users

#### 2. REGRESSÃO CORRIGIDA — errorHandler nunca rodava (respostas de erro viravam HTML)
- Instrumentação (`X-Error-Handler` + log em `/tmp`) provou que o handler não era chamado; causa: wrapper do async-express tinha 3 params e o Express só trata error-middleware com `length >= 4`
- Correção: wrapper emite variante de 4 params quando `fn.length >= 4`; removido o aparato de debug (`routes/errTest.ts`, log, header)
- Teste de isolamento reforçado: agora exige corpo JSON nas respostas 404 — 19/19 PASS

#### 3. Frontend — página /app/plano
- Módulo `src/app/modules/billing/`: plano atual, barras de uso (pacientes/profissionais), cards dos 3 planos, PIX copia-e-cola + "Simular pagamento" (mock), rota em `app.routes.ts`, item "Plano e Assinatura" no sidebar
- `ng build` limpo

#### 4. Validações
- Checkout TRIAL→BASICO (PENDENTE, PIX gerado, 402 no limite 10/10), mock-pay ATIVA +30d, webhook com/sem token (200/401), login pós-vencimento 403 + renovação reativa, erros sempre JSON
- Tenants `clinica-limite` de teste removidos do banco

### Commits
- (na sessão 12 ficou pendente — commit desta fase inclui também as pendências da sessão 12)

---

## Sessão 12 - 10/08/2026 (Segunda) — SAAS Multi-tenant: Fase 2 (frontend multi-clínica)

### O que foi feito

#### 1. Backend — clínicas do usuário + troca por header
- `POST /auth/login` retorna `tenants[]` + `tenant` (default = 1ª não bloqueada); `GET /auth/tenants`; `POST /auth/select-tenant` (valida membership, 403 sem vínculo)
- Middleware `authenticate` aceita `X-Tenant-Id` (vínculo ativo obrigatório) e prefere clínica não bloqueada; `req.user.tenant` com {id, name, slug, plan, status, logoUrl, colors}

#### 2. Frontend — seleção no login + switcher no header
- `AuthService` com signals `tenants`/`tenant` (localStorage), `selectTenant()`, `refreshTenants()`; interceptor envia `X-Tenant-Id`
- Página nova `/auth/select-clinic` quando login tem >1 clínica (bloqueadas desabilitadas); callback do Google usa mesma lógica via refreshTenants
- Chip + dropdown de troca de clínica no header do `main-layout` e `guardian-layout` (troca → selectTenant + reload)

#### 3. Validação
- Login com 2 tenants ✓ · `GET /tenants` ✓ · select-tenant inválido 403 ✓ · **X-Tenant-Id: 5 pacientes (principal) → 0 (teste)** ✓ · `ng build` limpo · dados de teste removidos

### Commits
- (nenhum — pendente de commit junto com Fase 1)

---

## Sessão 11 - 10/08/2026 (Segunda) — SAAS Multi-tenant: Fase 1

### O que foi feito

#### 1. Scoping de todas as rotas de negócio (isolamento por tenantId)
- Helper `backend/src/lib/tenant.ts` com `scoped(prisma, tenantId)` que injeta `tenantId` em `where` e `data` de ~33 modelos de negócio
- Rotas convertidas (listadas na SESSION-NOTES, entrada 46); queries por id usam `where: { id, tenantId }` → 404 cruzado
- Globais (`User`, `Tenant`, `Membership`) e rotas públicas (`document-requests` por token) permanecem sem scoping por design
- `seed.ts` cria/resolve o Tenant "Clínica Principal" e planta dados escopados
- Backfill `backfill-tenant.ts` re-executado: 33 tabelas vinculadas, 7 memberships, sem órfãos
- Verificado: `tsc --noEmit` limpo + runtime (login/listagem/detalhe com tenantId correto)

#### 2. Teste de isolamento entre tenants — 16/16 PASS
- Script `backend/scripts/test-isolation.ts` (npm `test:isolation`, servidor próprio porta 3999): cria Tenant B + usuário B e valida POST injeta tenantId, listas não vazam, GET/PUT/DELETE cruzado → 404, cleanup automático
- **Bug latente encontrado e corrigido:** `backend/src/lib/async-express.ts` — Express 4 não propaga rejeições async para o errorHandler (PUT/DELETE cruzado em rota sem try/catch deixava o cliente pendurado); patch no protótipo do Router, carregado via `lib/prisma.ts` — 404 do scoped agora vira resposta real
- Dados de teste removidos (2 tenants/usuários órfãos da 1ª execução limpos; zero órfãos restantes)

#### 3. Backup da conversa
- `session-backup/2026-08-10-multitenant.json` (sessão atual) + `session-backup/2026-08-10-fase0-inicio.json` (sessão anterior/Fase 0), via `opencode export`

### Commits
- (nenhum — trabalho pendente de commit; `git status` mostra dezenas de arquivos modificados)

---

## Sessão 10 - 10/08/2026 (Segunda)

### O que foi feito

#### 1. Bug: "Marcar todas como lidas" das notificações só funcionava uma a uma
- **Investigação:** backend (`PUT /api/notifications/mark-all-read`) testado via curl → 200 OK; preflight CORS via origem LAN `http://192.168.0.106:4200` → 204 OK; teste em Chrome headless (Playwright) do fluxo completo no navegador → funcionando
- **Causa raiz encontrada (análise do git):** no commit `6da73c2` a rota `PUT /mark-all-read` era definida na linha 52, **depois** de `PUT /:id` (linha 37) → o Express casava a string literal `mark-all-read` como parâmetro `:id` → `prisma.notification.update` lançava erro → **HTTP 500** → botão nunca funcionava (só o clique individual, por rota diferente, funcionava)
- **Correção já aplicada:** no commit `d344c8b` a rota foi movida para a linha 32, **antes** de `PUT /:id` — ordem correta de registro no Express
- **Validação final (navegador real, sem refresh):** criadas 3 notificações não lidas → badge `3` + 3 itens destacados → clique em "Marcar todas" → 0 destacados, badge some, zero erros de console — testado via `localhost:4200` e via `http://192.168.0.106:4200` (mesma origem que o outro PC)
- **Limpeza:** notificações de teste removidas do banco
- **Orientação ao usuário:** se o outro PC ainda mostrar o problema, é bundle/cache antigo — hard refresh (Ctrl/Cmd + Shift + R)

### Commits
- (nenhum código novo — investigação e validação; documentação nesta sessão)

---

## Sessão 9 - 09/08/2026 (Domingo)

### O que foi feito

#### 1. Teste completo do Chat Flutuante (responsável ↔ equipe)
- Fluxo validado de ponta a ponta via API: envio do responsável → unread na equipe + notificação + WhatsApp real (Evolution API para Admin Teste) → marcação de leitura → resposta da equipe → unread no responsável + notificação → leitura pelo responsável
- Colima/Docker reiniciados (`colima start` + `docker compose up -d`); instância `edupsych` reconectada (`state: open`)

#### 2. Bug: chat não recebia mensagens sem refresh
- `reloadThread()` no `chat-floating.component.ts` só tratava o lado do responsável (equipe não recarregava o thread no polling)
- `loadGuardianConversations()` também não recarregava o thread aberto
- **Correção:** `reloadThread()` agora suporta STAFF (GET /chat + marcar lida); lado do responsável recarrega thread no polling → mensagens chegam em até 8s

#### 3. Acesso pela rede local (outro PC)
- Frontend com `--host 0.0.0.0` (antes preso em localhost)
- `environment.ts` com `apiUrl` apontando para `http://192.168.0.106:3000/api`
- CORS no backend aceita lista (`FRONTEND_URL` com múltiplas origins separadas por vírgula)
- Validado: login + preflight CORS por `http://192.168.0.106` (200/204)
- Limitações: IP DHCP pode mudar; Google OAuth só funciona no Mac (redirect registrado no console)

#### 4. Scripts start-all.sh / stop-all.sh
- `./start-all.sh [--host-ip=IP]`: sobe Colima + Evolution API (com verificação da instância), backend e frontend; detecta serviços já rodando; logs em `logs/`
- `./stop-all.sh`: derruba frontend, backend e Docker (compose down)
- `.gitignore`: adicionado `logs/`

#### 5. Agendamento — equipe confirma/cancela/finaliza
- Novo endpoint `PUT /api/appointments/:id/status` com matriz de transições (PENDENTE → CONFIRMADO/CANCELADO, CONFIRMADO → CONCLUIDO/CANCELADO, CANCELADO → CONFIRMADO, CONCLUIDO terminal) — transição inválida retorna 400
- Mudança de status notifica o responsável (Notification no app + WhatsApp best-effort)
- `agenda-detail`: botões contextuais Confirmar (PENDENTE/CANCELADO), Finalizar (CONFIRMADO), Cancelar (PENDENTE/CONFIRMADO) com toast
- Testado via API: solicitar → confirmar → finalizar → transição inválida → cancelar (tudo com notificações); dados de teste removidos

#### 6. Sino de notificações no Portal do Responsável
- Portal da Família não tinha UI de notificações (backend já criava para o responsável)
- Adicionado sino com badge de não lidas no header do `guardian-layout` (reuso do `NotificationDropdownComponent`) + polling de 15s em `GET /notifications?read=false`
- Testado: status alterado pela equipe → notificação aparece no sino do responsável em até 15s

#### 7. Bug: notificação da equipe só com refresh
- `loadCounts()` no `main-layout` rodava só no ngOnInit → sino da equipe não atualizava
- Adicionado polling de 10s (`setInterval` + `OnDestroy`): badge do sino e badge PENDENTE da Agenda atualizam sozinhos
- Testado: solicitação do responsável → notificação não lida + contador PENDENTE atualizados

#### 8. Responsável cancela/modifica agendamentos + Disponibilidade da equipe
- Guardian: `PUT /appointments/:id/cancel` e `PUT /appointments/:id/reschedule` (volta para PENDENTE p/ re-confirmação) — notificam a equipe
- Frontend do responsável: ícone de agenda no header, botões Modificar (modal) e Cancelar (2 passos) em PENDENTE/CONFIRMADO
- Novo model `Availability` (dia da semana, início, fim, ativo) + rotas CRUD `/api/availability`
- Aba "Disponibilidade" nas Configurações: lista com toggle ativo/inativo, excluir e adicionar horário
- Testado via API: solicitar → reagendar → cancelar → bloqueio de re-cancelamento + CRUD de disponibilidade; dados de teste removidos

### Commits
- `b955128` - feat: chat em tempo real via polling, acesso pela rede local, scripts start/stop-all + docs da sessão 09/08
- `0b533fa` - feat: equipe confirma/cancela/finaliza agendamentos solicitados pelo responsavel + notificacao ao responsavel
- `b2a45bb` - feat: sino de notificacoes no portal do responsavel (badge + dropdown + polling 15s)
- `f617c54` - fix: notificacoes da equipe em tempo real - polling de 10s no main-layout (sino + badge agenda)
- `21744f7` - feat: responsavel cancela/modifica agendamentos + disponibilidade da equipe (dias e horarios)

---

## Sessão 8 - 07/08/2026 (Sexta, Tarde)

### O que foi feito

#### 1. Solicitações de Formulário para Responsáveis (links públicos)
- Novo model `DocumentRequest` + `db push` + schema raiz sincronizado
- Profissional monta formulário com campos dinâmicos (texto, texto longo, número, data, lista, escolha única, checkbox)
- Sistema gera **link público único** enviado por email (SMTP Gmail) ou WhatsApp, ou copiado manualmente
- Responsável preenche **sem login** em `/formulario/:token`
- Profissional vê respostas e exporta PDF (html2pdf)

#### 2. Rotas backend (`/api/document-requests`)
- Públicas (sem auth): `GET /public/:token`, `POST /public/:token/submit`
- Autenticadas: `GET/`, `GET/:id`, `POST/`, `POST/:id/resend`, `DELETE/:id`
- Token de 20 bytes; 1 resposta por formulário (409 no duplo); expiração por dueDate

#### 3. Frontend
- Módulo `/app/solicitacoes`: lista (filtros por status), `novo` (construtor de campos), `:id` (respostas + link copiável + reenviar + PDF)
- Página pública `/formulario/:token` (especialista, valida campos obrigatórios, tela de sucesso)
- Menu lateral: novo item "Solicitações"

#### 4. Bugs corrigidos no desenvolvimento
- `sentVia` do Prisma x `sendVia` no código (envio por email retornava undefined)
- Ajustes de template Angular (acesso por índice em Record para status colors)

#### 5. Testes completos
- Criar → GET público → submit → 409 no duplo → detalhe com respostas → resend por EMAIL (Gmail real OK)

### Commits
- (a commitar)

---

## Sessão 7 - 07/08/2026 (Sexta)

### O que foi feito

#### 1. Verificação de conta no cadastro (email/WhatsApp)
- Novo model Prisma `VerificationCode` (codeHash, tokenHash, type, channel, expiresAt) + `db push` + schema raiz sincronizado
- Cadastro local agora cria conta `active: false` e envia link + código de 6 dígitos
- Login bloqueia conta não ativada (403) com botão "Reenviar link de ativação" no frontend

#### 2. Recuperação de senha
- `POST /auth/forgot-password`: usuário escolhe canal (EMAIL ou WHATSAPP)
- `POST /auth/reset-password`: valida token do link ou código + nova senha
- Link no email: `/auth/recuperar-senha?token=...` ativa direto o passo de nova senha

#### 3. Infraestrutura de email
- `nodemailer` instalado + `backend/src/lib/email.ts` (SMTP via .env)
- Sem SMTP configurado → modo dev loga código/link no console do backend (testável)
- `.env` e `.env.example` com bloco SMTP

#### 4. Frontend
- `/auth/verify`: ativação automática ao clicar no link ou formulário de código
- `/auth/recuperar-senha`: 3 passos (identificar conta + canal → código → nova senha)
- Login: link "Esqueceu sua senha?" + reenvio de ativação
- Register redireciona para `/auth/verify?email=...` (não loga mais automaticamente)

#### 5. Testes completos (curl)
- Registro → 403 no login → ativação por código ✓ → ativação por token ✓
- Forgot → reset por código ✓ → reset por token ✓ → código reuso bloqueado ✓
- Usuários de teste removidos do banco após os testes

### Commits
- (a commitar)

---

## Sessão 6 - 06/08/2026 (Tarde)

### O que foi feito

#### 1. Auditoria das 10 Funcionalidades Competitivas
- **Backend:** todos os endpoints das 10 funcionalidades testados via API (WhatsApp, Assinatura, ABA, Evolução comparativa, Consents, Permissões, NFS-e, Sala de Espera, Guardian, IA) — todos OK (200/201 com payloads corretos)
- **Frontend:** rotas e componentes verificados (12/12 rotas registradas, endpoints casam com o backend)

#### 2. Bugs corrigidos na auditoria
- **Painel TV** (`tv-sala-espera`): status `CHAMANDO`/`EM_ATENDIMENTO` que a API rejeita → `CHAMADO`/`EM_SESSAO` (envio e exibição)
- **Evolução Comparativa:** rota `comparar` adicionada (além de `comparativa`) + botão "Comparar" na lista de evoluções (página era inacessível)
- **Permissões:** botão `admin_panel_settings` por usuário em `users-list` (tela existia sem acesso)
- **LGPD:** link "Ver Histórico" corrigido de `/app/lgpd/log` → `/app/lgpd`

#### 3. Google OAuth configurado e testado
- Credenciais reais (Client ID + Secret) adicionadas ao `backend/.env`
- Fluxo completo validado: botão "Continuar com Google" → escolha de conta → callback → dashboard
- Cria usuário com role `PSICOPEDAGOGO`, avatar do Google e `SocialAccount` (não cria duplicata)
- Usuário criado: Iarlley Oliveira (iarlley.oliveira@gmail.com)
- Google Console: origem JS `http://localhost:4200` e redirect `http://localhost:3000/api/auth/google/callback`

#### 4. Senha para contas criadas via Google
- **Bug novo também encontrado:** `PUT /auth/profile` e `PUT /auth/password` não existiam (404 no frontend) — "Salvar Perfil/Alterar Senha" nas Configurações nunca funcionaram
- Criadas rotas `PUT /auth/profile` (perfil) e `PUT /auth/password` (define senha sem senha atual quando a conta não tem; exige senha atual quando tem)
- Payloads de login/registro/Google incluem `hasPassword`
- `phoneIsWhatsApp` adicionado ao model `User` + `db push`
- Frontend: aba Segurança adaptativa — "Definir Senha" (contas Google) vs "Alterar Senha" (com senha atual)

#### 5. Segurança e GitHub
- `backend/.env` **mantido rastreado no GitHub** (repo privado, apenas o dono) para trabalhar em outro PC
- `backend/.env.example` criado como referência

### Commits
- `081dc5a` - fix: auditoria das 10 funcionalidades
- `6d35d0a` - feat: Google OAuth configurado + .env fora do versionamento (revertido parcialmente — .env voltou) 
- Commit desta sessão: rotas de perfil/senha + definição de senha para contas Google

---

## Sessão 6 - 06/08/2026 (Manhã)

### O que foi feito

#### 1. Correção Busca de CEP (ViaCEP)
- `authInterceptor` enviava header `Authorization` para chamadas externas
- **Correção:** token só é adicionado quando a URL contém `/api/`

#### 2. Cadastro de Responsável corrigido
- Schema Prisma não tinha `city`, `state` e `phoneIsWhatsApp` → campos adicionados nos models `Responsible` e `Paciente`
- Backend POST/PUT tratava `pacienteIds` mas não persistia os vínculos corretamente
- Frontend: carregamento de endereço na edição (Prisma retorna campos planos, não objeto `address`)
- Toast de sucesso no save

#### 3. Páginas de Detalhe corrigidas
- `responsavel-detail`: exibe endereço (campos planos) + WhatsApp
- `paciente-detail`: usa `responsible.name` e `school.name` (GET `/api/pacientes/:id` agora inclui as relações `responsible` e `school`)

#### 4. Cadastro de Paciente corrigido
- Não envia mais vetores de relações (`prontuarios`, `anamneses`, etc.) no payload
- Envia JSON quando não há avatar (evita erro de multipart no backend)
- Mapeamento `responsavelId` (frontend) ↔ `responsibleId` (Prisma)

#### 5. Evolução de exemplo
- Criado registro mock de evolução para Gabriel Carvalho Lima via `session-records`

#### 6. Tooltips globais nos ícones
- Sistema em `app.component.ts` (evento delegado em `.material-icons`) com CSS em `styles.scss`
- Mapa de rótulos em português (`ICON_LABELS`) com fallback de capitalização do nome

#### 7. Métricas de estrelas no formulário de Evolução
- Adicionadas 4 métricas (Foco, Engajamento, Progresso, Comportamento) com seleção por estrelas 1–5
- Backend: `clinicalEvolution` e `conduct` agora persistidos no schema zod; `activities`/`observations` opcionais; PUT agora valida com `validate()`
- Load na edição sanitizado (evita enviar objeto `paciente` ao Prisma); data convertida para `YYYY-MM-DD`

#### 8. Contagem de pacientes nas Escolas
- Frontend mostrava `patientCount` (campo do banco sempre nulo); a API retorna o array `patients`
- **Correção:** `e.patients?.length || e.patientCount || 0` na lista (`escolas-list`) e no detail (`escola-detail`)

### Commits
- Commit desta sessão

---

## Sessão 5 - 05/08/2026 (Tarde)

### O que foi feito

#### 1. Toast Notifications Animado
- Barra de progresso no topo que encolhe conforme o tempo
- Animação de entrada lenta (0.6s) com bounce
- Animação de saída suave (0.5s) fade + slide
- 4 estados de animação: hidden → entering → visible → leaving

#### 2. Aba Aparência em Configurações
- 3 temas: Claro, Escuro, Sistema
- 6 cores de destaque选择aveis
- Salva no localStorage e aplica automaticamente

#### 3. Correção Salvar/Editar Escola
- Schema Prisma do backend incompatível com frontend
- Backend route: Zod schema atualizada + validação PUT
- Frontend: campos individuais de endereço
- schema.prisma raiz sincronizado

#### 4. Diário de Sessões Redesignado
- Cards arredondados com ícones coloridos
- Labels com ícones por seção
- Preview com cards coloridos

#### 5. Página-lista Documentos Clínicos
- 3 cards: Diário, Frequência, Plano de Intervenção
- Rota agora mostra lista (não redireciona)

#### 6. Sidebar Sempre Aberta
- Estado forçado para aberto no ngOnInit

#### 7. Ícone Docs Clínicos
- Trocado de clinical_notes para note

### Commits
- `cd2e59e` - feat: melhorias UI + tema/apperência + toast animado + documentos clínicos

### O que foi feito

#### 1. Análise completa das 10 funcionalidades competitivas
- Verificação de todos os componentes frontend e rotas backend
- Identificação de bugs críticos em 4 funcionalidades

#### 2. Bugs críticos corrigidos

##### 2.1 Modelos Prisma ausentes (CRÍTICO)
- **Problema:** 4 modelos não existiam no schema: `WhatsAppConfig`, `WhatsAppLog`, `Signature`, `ConsentLog`
- **Impacto:** Backend crashava ao acessar qualquer rota dessas funcionalidades
- **Correção:** Modelos adicionados ao `prisma/schema.prisma` + campo `permissions` no modelo `User`
- **Verificação:** `prisma db push` executado com sucesso

##### 2.2 Guardian - Colisão de rotas (ALTO)
- **Problema:** `GET /appointments` e `GET /appointments/:patientId` colidiam
- **Causa:** Rota sem parâmetro registrada DEPOIS da rota com parâmetro
- **Correção:** `GET /appointments` movido para ANTES de `GET /appointments/:patientId`

##### 2.3 UserForm - Navegação incorreta (ALTO)
- **Problema:** Após salvar/editar, navegava para `/users` em vez de `/app/users`
- **Correção:** `this.router.navigate(['/users'])` → `this.router.navigate(['/app/users'])`

##### 2.4 ABA DELETE sem tratamento de erro (MÉDIO)
- **Problema:** `DELETE /assessments/:id` não tinha try/catch
- **Correção:** Adicionado try/catch com retorno 404

#### 3. Testes de endpoints (todos OK)
- WhatsApp Config/History, Signatures, Consents, Permissions (GET/PUT)
- ABA Assessments/Programs, NFS-e, Waiting Room, AI Suggestions
- Dashboard (5 pacientes, 4 sessões)

#### 4. Rotas /app/app/ duplicadas (11 links corrigidos)
- **Problema:** 9 componentes tinham `[routerLink]="['/app/app/...']"` (prefixo duplicado)
- **Impacto:** Botões de editar/detalhe redirecionavam para landing page
- **Componentes afetados:**
  - protocolo-detail, recurso-detail, sessao-detail, agenda-detail
  - anamnese-detail, responsavel-detail, plano-detail, evolucao-detail
  - responsaveis-list (2 links)

#### 5. Melhoria gráfica Protocolo TEA

##### 5.1 Página de Detalhe (REESCRITA)
- **Antes:** Só texto (paciente, data, pontuação)
- **Agora:**
  - Círculo de progresso com % geral e cor dinâmica
  - Radar chart global (5 categorias)
  - Bar chart comparativo horizontal
  - 5 progress bars detalhadas por categoria
  - Card de classificação com interpretação clínica
  - Botão PDF com dados reais via API `protocol-stats`

##### 5.2 Página de Formulário (MELHORADA)
- **Adicionado no topo:**
  - Radar global com todas as 5 categorias
  - Painel de resumo com círculo de progresso
  - Indicadores visuais por categoria com progress bars
  - Atualização em tempo real ao marcar itens

##### 5.3 Página de Lista (PDF CORRIGIDO)
- **Antes:** PDF usava dados hardcoded com `Math.random()`
- **Agora:** PDF busca dados reais via `GET /api/protocol-evaluations/protocol-stats/:id`
- Tabela com categorias, cores e status reais

#### 6. Commits realizados
- `dea7387` - fix: corrigir bugs críticos - modelos Prisma ausentes, rotas Guardian, navegação users
- `e4ddd46` - feat: melhorar gráficos Protocolo TEA + corrigir rotas /app/app/ duplicadas
- `ef81f07` - docs: atualizar notas da sessão 05/08

---

## Sessão 3 - 05/08/2026

### O que foi feito

#### 1. Sincronização com GitHub (novo PC)
- `git pull` do commit `7595269` (111 arquivos, +8730 linhas)

#### 2. Setup do ambiente do zero (Windows)
- `npm install` no frontend e backend
- Scripts de instalação bloqueados pelo npm (allowScripts) foram aprovados e salvos no `package.json` para futuras instalações
- `npx prisma db push` - banco SQLite criado
- `npx tsx src/seed.ts` - dados de teste carregados (5 usuários, 5 pacientes, 5 responsáveis, 4 sessões, 2 protocolos ABA, etc.)

#### 3. Servidores iniciados
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:4200

#### 4. Testes de endpoints (todos OK)
- Login, dashboard (5 pacientes, 4 sessões, 2 protocolos TEA), pacientes, usuários, agenda, financeiro, waiting-room, consents, nfse, permissions, whatsapp, aba/assessments, aba/programs, evolution/compare, guardian/dashboard, ai-suggestions

#### 5. Bug corrigido - Módulo WhatsApp quebrava o backend
- **Problema:** `TypeError: Cannot read properties of undefined (reading 'findMany')` ao acessar rotas do WhatsApp
- **Causa:** Código usava `prisma.whatsappLog` e `prisma.whatsappConfig`, mas o modelo Prisma é `WhatsAppLog`/`WhatsAppConfig` — o acesso correto no client é `prisma.whatsAppLog`/`prisma.whatsAppConfig` (com "A" maiúsculo)
- **Correção:** 11 ocorrências corrigidas em `backend/src/routes/whatsapp.ts`
- **Verificação:** `/api/whatsapp/history` e `/api/whatsapp/config` → HTTP 200

#### 6. Ambiente: opencode.exe corrompido (fora do repo)
- `opencode.exe` global tinha sido substituído por stub de 479 bytes (postinstall bloqueado pelo npm)
- **Correção:** copiado binário real (174 MB, header MZ) de `opencode-windows-x64` para `opencode-ai/bin/opencode.exe`

---

## Sessão 1 - 03/08/2026

### O que foi feito

#### 1. Dados Fictícios Cadastrados
- **Responsáveis:**
  - Maria Silva Santos (Mãe) - (11) 98765-4321 - CPF: 123.456.789-00
  - João Oliveira Costa (Pai) - (11) 97654-3210 - CPF: 987.654.321-00
- **Pacientes:**
  - Lucas Silva Santos - 11 anos, 5º ano Fundamental (filho da Maria)
  - Ana Beatriz Oliveira Costa - 7 anos, 2º ano Fundamental (filha do João)
- **Credenciais:** admin@test.com / 123456

#### 2. Dashboard - Cards Clicáveis
- Cards do dashboard agora são botões clicáveis
- Navegação para módulos específicos

#### 3. Documentos Clínicos - Nova Feature
- **Backend:** 3 novas tabelas (SessionDiary, FrequencySheet, InterventionDocument)
- **Frontend:** 3 componentes (Diário, Ficha de Frequência, Plano de Intervenção)
- **Funcionalidade:** Preview em tempo real + Export PDF

#### 4. Correções
- **Protocolo TEA:** Corrigido `professionalId` vazio usando `AuthService`
- **Protocolo TEA:** Convertido `evaluations` para `signal` (bug crítico)

---

## Sessão 2 - 04/08/2026

### 10 Funcionalidades Competitivas Implementadas

#### 1. Integração WhatsApp (Lembretes Automáticos)
- **Rota:** `/app/whatsapp`
- **Backend:** `GET/POST/DELETE /api/whatsapp-logs`
- **Frontend:** `whatsapp-config.component.ts`, `whatsapp.service.ts`
- **Funcionalidade:** Envio de lembretes de agendamento via WhatsApp

#### 2. Assinatura Digital em Documentos
- **Componente:** `digital-signature.component.ts`, `signature-modal.component.ts`
- **Backend:** `GET/POST /api/signatures`
- **Funcionalidade:** Canvas para assinatura digital em laudos e documentos

#### 3. Protocolos ABA (ABLLS-R, VB-MAPP, Denver)
- **Rota:** `/app/protocolos-aba`
- **Frontend:** `aba-assessment.component.ts`, `aba-programs.component.ts`
- **Dados:** `ablls-r.ts` (165 habilidades), `vb-mapp.ts` (105 marcos), `denver.ts` (100 itens)
- **Funcionalidade:** Avaliação completa com gráficos de radar

#### 4. Gráficos Comparativos de Evolução
- **Rota:** `/app/evolucoes/comparar`
- **Frontend:** `evolucao-comparativa.component.ts`
- **Backend:** `GET /api/evolution-comparison`
- **Funcionalidade:** Comparação lado a lado entre dois períodos

#### 5. LGPD - Consentimento Digital
- **Rota:** `/app/lgpd`
- **Frontend:** `consent-form.component.ts`, `consent-log.component.ts`
- **Backend:** `GET/POST /api/consents`
- **Funcionalidade:** Termos de consentimento digital, registro de consentimentos

#### 6. Multi-profissional com Permissões
- **Rota:** `/app/usuarios/permissoes`
- **Frontend:** `user-permissions.component.ts`
- **Backend:** `GET/POST /api/permissions`
- **Funcionalidade:** Matrix de permissões por perfil

#### 7. NFS-e Integrada
- **Rota:** `/app/financeiro/nfse`
- **Frontend:** `nfse.component.ts`
- **Backend:** `GET/POST /api/nfse`
- **Funcionalidade:** Emissão de notas fiscais, geração PDF

#### 8. Sala de Espera Virtual
- **Rota:** `/app/agenda/sala-espera`
- **Frontend:** `sala-espera.component.ts`
- **Backend:** `GET/POST/PUT/DELETE /api/waiting-room`
- **Funcionalidade:** Check-in, fila de atendimento, chamada de pacientes

#### 9. Portal do Responsável - Melhorias
- **Rota:** `/guardian`
- **Frontend:** `guardian-appointments.component.ts`
- **Funcionalidade:** Agendamentos, resumo de sessões, download de documentos

#### 10. IA para Sugestão de Planos de Intervenção
- **Rota:** `/app/planos/ia`
- **Frontend:** `plano-ai.component.ts`
- **Backend:** `GET /api/ai-suggestions`
- **Funcionalidade:** Motor rule-based para sugestão automática de planos

---

### Painel TV - Sala de Espera (Nova Feature)

#### Funcionalidade
Display para TV na sala de espera com chamada de próximo atendimento.

#### Características
- **URL:** `http://localhost:4200/app/agenda/tv`
- **Tela escura** otimizada para TV
- **Atualização automática** a cada 5 segundos
- **Som de notificação** ao chamar paciente
- **Relógio e data** em tempo real
- **Fila de atendimento** com posições e status

#### Como usar
1. Acesse **Sala de Espera** no menu lateral
2. Clique no ícone 📺 ou acesse `/app/agenda/tv`
3. Abra em nova janela e maximize (tela cheia)
4. Conecte a TV via HDMI ou Chromecast

#### Fluxo
1. Paciente faz check-in → aparece na fila
2. Painel auto-chama próximo paciente → toca som
3. Status: AGUARDANDO → CHAMANDO → EM ATENDIMENTO

---

## Arquitetura Final

### Frontend (Angular 18)
```
src/app/modules/
├── auth/                  # Login e autenticação
├── dashboard/             # Dashboard principal
├── pacientes/             # Gestão de pacientes
├── agenda/                # Agenda + Sala de Espera + Painel TV
├── financeiro/            # Financeiro + NFS-e
├── documentos/            # Documentos
├── evolucoes/             # Evoluções + Comparativa
├── configuracoes/         # Configurações
├── protocolos-aba/        # Protocolos ABA (ABLLS-R, VB-MAPP, Denver)
├── protocolos-tea/        # Protocolos TEA
├── planos/                # Planos + IA
├── biblioteca/            # Biblioteca
├── documentos-clinicos/   # Documentos Clínicos
├── guardian/              # Portal do Responsável
├── whatsapp/              # Integração WhatsApp
├── lgpd/                  # LGPD
├── landing/               # Landing Page
└── users/                 # Usuários + Permissões
```

### Backend (Express + Prisma)
```
backend/src/routes/
├── auth.ts
├── patients.ts
├── appointments.ts
├── evolution-comparison.ts
├── whatsapp.ts
├── signatures.ts
├── aba-protocols.ts
├── consents.ts
├── permissions.ts
├── nfse.ts
├── waiting-room.ts
├── ai-suggestions.ts
└── ... (40+ rotas)
```

### Banco de Dados (SQLite)
- **25+ tabelas** incluindo: User, Paciente, Responsible, Appointment, Session, Document, WhatsAppLog, Signature, ABAAssessment, ConsentLog, Nfse, WaitingRoom

---

## Credenciais de Acesso

| Email | Senha | Perfil |
|-------|-------|--------|
| sarah@edupsych.com | 123456 | GESTOR |
| admin@test.com | 123456 | GESTOR |

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

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000
- **Painel TV:** http://localhost:4200/app/agenda/tv

---

## Pendências / Próximos Passos

1. Configurar SMTP real (Gmail app password ou Resend) para envio de emails em produção
2. Testar as 10 funcionalidades competitivas no navegador
3. Deploy em produção
4. Testes E2E completos
