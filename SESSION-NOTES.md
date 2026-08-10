# EduPsych Pro - Clone Angular Session Notes

## Data: 10/08/2026

## Status: 100% Implementado + Verificação de Conta + Recuperação de Senha + Solicitações de Formulário Online + Agenda (Solicitação com Notificação) + WhatsApp Integrado + Chat em Tempo Real (polling) + Acesso pela Rede Local + "Marcar todas como lidas" validado

---

## Sessão 10/08/2026 (Segunda)

### 45. Bug "Marcar todas como lidas" — causa raiz encontrada e validada
- **Problema relatado:** no painel da equipe, "Marcar todas como lidas" nas notificações só funcionava clicando uma por uma
- **Investigações descartadas:** backend via curl (200 OK), preflight CORS via origem LAN (204 OK), teste em Chrome headless do fluxo completo (funcionando) — nada indicava problema em runtime
- **Causa raiz (análise do git):** no commit `6da73c2` a rota `PUT /mark-all-read` estava registrada **depois** de `PUT /:id` → Express casava `mark-all-read` como `:id` → erro do Prisma → **500**
- **Correção:** já aplicada no commit `d344c8b` (rota movida para antes de `PUT /:id`)
- **Validação no navegador (Playwright/Chrome headless):** 3 notificações não lidas criadas → badge `3` + 3 itens destacados → clique em "Marcar todas" → 0 destacados + badge some + zero erros de console; repetido pela origem LAN `192.168.0.106:4200` (a do outro PC)
- **Observação:** notificações de teste removidas; usuário deve dar hard refresh (Ctrl/Cmd+Shift+R) se ainda vir o comportamento antigo (bundle cacheado)

---

## Sessão 09/08/2026 (Domingo)

### 37. Teste completo do Chat Flutuante (Responsável ↔ Profissional)
- **Fluxo validado de ponta a ponta via API (backend + WhatsApp real):**
  - Responsável (Arley) envia mensagem → `senderRole: RESPONSAVEL`, `readByStaff: false`, `readByGuardian: true`
  - Equipe vê `unreadCount=1` na lista de conversas + notificação "Nova mensagem do responsável"
  - WhatsApp (Evolution API) envia alerta real para Admin Teste (+5585982254910)
  - Equipe marca como lida (`POST /chat/conversations/:pacienteId/read`) → unread→0
  - Equipe responde → `senderRole: STAFF`, `readByGuardian: false`
  - Responsável vê `unread-count=1` + notificação "Nova mensagem da equipe"
  - Responsável abre o chat (`GET /guardian/chat/:patientId`) → mensagens completas + unread→0
- **Infra:** Colima/Docker estavam desligados → `colima start` + `docker compose up -d` (instância `edupsych` reconectada, `state: open`)

### 38. Bug corrigido — Chat não recebia mensagens sem atualizar a página
- **Problema:** com o chat aberto, mensagens novas só apareciam após refresh da página
- **Causa:** o polling (8s) chamava `reloadThread()`, mas esse método **só tratava o lado do responsável** — a equipe não recarregava o thread; e no lado do responsável `loadGuardianConversations()` também não recarregava o thread aberto
- **Correção** (`chat-floating.component.ts`):
  - `reloadThread()` agora trata STAFF (recarrega via `GET /chat?pacienteId=` + marca como lida)
  - `loadGuardianConversations()` agora chama `reloadThread()` quando há conversa aberta e janela visível
- **Resultado:** mensagens chegam sozinhas em até ~8s nos dois lados

### 39. Acesso pela rede local (outro PC na mesma rede)
- **Problemas:** frontend preso em `localhost`; `apiUrl` hardcoded `http://localhost:3000/api` (outro PC chamaria o próprio localhost); CORS só aceitava `localhost:4200`
- **Correções:**
  - Frontend roda com `--host 0.0.0.0` (escuta em todas as interfaces)
  - `src/environments/environment.ts`: `apiUrl` → `http://192.168.0.106:3000/api`
  - `backend/src/index.ts`: CORS aceita lista separada por vírgula via `FRONTEND_URL`
  - `backend/.env`: `FRONTEND_URL="http://localhost:4200,http://192.168.0.106:4200"`
- **Validação:** login via `http://192.168.0.106:3000` com origin da LAN → 200; preflight CORS OK para ambas as origins
- **Limitações:** IP pode mudar (DHCP); Google OAuth não funciona fora do Mac (redirect localhost registrado no Google Console)

### 44. Agendamentos — Responsável cancela/modifica + Disponibilidade da equipe
- **Backend (`guardian.ts`):**
  - `PUT /guardian/appointments/:id/cancel` — só PENDENTE/CONFIRMADO → CANCELADO; nota no histórico; bloqueado em CONCLUIDO
  - `PUT /guardian/appointments/:id/reschedule` — nova data/horário; volta para **PENDENTE** (equipe re-confirma); nota "Reagendado pelo responsável"
  - Ambas validam que o agendamento pertence aos pacientes do responsável e notificam a equipe (Notification + WhatsApp best-effort): "Agendamento cancelado/modificado pelo responsável"
- **Frontend (`guardian-appointments`):** ícone `calendar_month` no cabeçalho da página; botões **Modificar** (modal com data/hora pré-preenchidos) e **Cancelar** (2 passos: "Confirmar cancelamento?" com timeout de 5s); visíveis apenas em PENDENTE/CONFIRMADO; toasts
- **Disponibilidade da equipe:**
  - Novo model Prisma `Availability` (userId, dayOfWeek 0-6, startTime, endTime, active) + `db push` + schema raiz sincronizado
  - `backend/src/routes/availability.ts`: GET/POST/PUT/DELETE (por usuário logado, duplicata bloqueada com 400)
  - Aba **Disponibilidade** nas Configurações: lista de horários por dia com toggle Ativo/Inativo e exclusão + formulário de novo horário (dia, início, fim)
- **Testes via API:** solicitar → reagendar (volta PENDENTE) → cancelar → cancelar de novo bloqueado (400) → equipe recebeu 3 notificações ("Nova solicitação", "Modificado", "Cancelado"); CRUD de disponibilidade completo (criar/duplicar 400/update/delete); dados de teste removidos

### 43. Bug corrigido — Notificação da equipe só chegava após refresh
- **Problema:** solicitação de agendamento do responsável criava a notificação, mas o painel da equipe não atualizava o sino até recarregar a página
- **Causa:** `loadCounts()` no `main-layout` rodava só no `ngOnInit` e ao fechar o dropdown — sem polling
- **Correção:** `setInterval(() => this.loadCounts(), 10000)` no `MainLayoutComponent` (com `OnDestroy`/`clearInterval`) — atualiza badge do sino e badge PENDENTE da Agenda a cada 10s
- **Testado:** solicitação → equipe com "Nova solicitação de agendamento" não lida + contador PENDENTE da agenda atualizado

### 42. Sino de notificações no Portal do Responsável
- **Problema:** backend já criava notificação ao responsável quando a equipe mudava o status do agendamento, mas o Portal da Família **não tinha UI para exibi-las** (só o chat flutuante tinha badge)
- **Correção** (`guardian-layout.component.ts`): sino de notificações no header com badge de não lidas, dropdown reutilizando `NotificationDropdownComponent` (já era genérico via token) e polling a cada 15s em `GET /notifications?read=false`
- **Testado:** equipe confirmou agendamento → `total: 12` não lidas no responsável, primeira sendo "Agendamento confirmado: Gabriel Carvalho Lima (2026-08-16 10:00)"
- Fluxo completo: responsável solicita → equipe confirma/cancela/finaliza → responsável vê no sino em até 15s + WhatsApp best-effort

### 41. Agendamento — Equipe confirma/cancela/finaliza solicitações do responsável
- **Problema:** solicitação do responsável criava agendamento PENDENTE, mas a equipe só podia editar — sem opção de Confirmar, Cancelar ou Finalizar
- **Backend (`appointments.ts`):** `PUT /api/appointments/:id/status` com matriz de transições válidas:
  - `PENDENTE → CONFIRMADO | CANCELADO`
  - `CONFIRMADO → CONCLUIDO | CANCELADO`
  - `CANCELADO → CONFIRMADO` (reabrir)
  - `CONCLUIDO → nenhuma` (terminal)
  - Transição inválida → 400 com lista de permitidas
- **Notificação ao responsável:** status alterado → `Notification` (app, tipo appointment) + WhatsApp best-effort via Evolution API
- **Frontend (`agenda-detail`):** botões contextuais conforme status — Confirmar (verde, PENDENTE/CANCELADO), Finalizar (azul, CONFIRMADO), Cancelar (vermelho, PENDENTE/CONFIRMADO); estado CONCLUIDO mostra aviso "sem ações pendentes"; toast de sucesso/erro
- **Testes via API:** solicitar → PENDENTE ✓ → confirmar ✓ (notificação) → finalizar ✓ (notificação) → transição inválida 400 ✓ → cancelar ✓ (notificação); agendamentos de teste removidos
- **Observação:** WhatsApp do Arley falha (número não existe no WhatsApp real) — esperado, notificação no app sempre criada

### 40. Scripts de inicialização
- **`start-all.sh`**: sobe tudo (Colima/Docker/Evolution API + backend + frontend) com detecção de serviços já rodando, flag `--host-ip=IP` para expor na rede, verificação da instância `edupsych` e logs em `logs/`
- **`stop-all.sh`**: derruba frontend, backend e `docker compose down`
- `.gitignore` ganhou `logs/`

---

## Sessão 07/08/2026 (Sexta) — Parte 3

### 30. Cadastro RESPONSAVEL gera registro de Responsável (vínculo)
- **Problema:** usuário que se cadastra com papel `RESPONSAVEL` criava só o `User`; a lista de Responsáveis e o vínculo por código de acesso lêem a tabela `Responsible` → não aparecia no dashboard
- **Correção:** helper `ensureResponsibleForUser()` em `auth.ts` — no registro com papel RESPONSAVEL vincula por email a um `Responsible` existente ou cria um novo (nome, email, telefone, userId)
- **Backfill:** script pontual criou o registro para usuário já existente (Arley) — `GET /api/responsaveis` voltou a listá-lo com `userId` ligado

### 31. Bloqueio de e-mails fictícios (evita bounce no SMTP real)
- **Problema:** e-mails com dados fictícios (ex: `@email.com`) iam pro Gmail real → `Mail Delivery Subsystem` com bounce de volta ao remetente
- **Correção:** `isFakeEmail()` em `lib/email.ts` detecta domínios fictícios (`email.com`, `example.com`, `test.com`) e local-parts com `test/fake/demo/exemplo` — nesses casos só loga no console, não envia
- **Config:** `SMTP_FAKE_DOMAINS` no `.env` (documentado no `.env.example`) para adicionar domínios
- **Validação:** `patricia.rocha@email.com` loga; `@gmail.com` envia normalmente

### 32. Agenda — Solicitação de agendamento do RESPONSAVEL notifica equipe + WhatsApp
- **Problema:** `POST /guardian/appointments/request` (usado pelo portal do responsável) não criava notificação — admin não ficava sabendo
- **Correção:** `notifyStaffOnAppointmentRequest()` em `guardian.ts` — cria `Notification` (tipo appointment) para toda a equipe ativa (GESTOR, PROFISSIONAL, PSICOPEDAGOGO, SECRETARIA) + WhatsApp best-effort via `sendWhatsAppMessage` para quem tiver `phoneIsWhatsApp`
- Agendamento continua PENDENTE → aparece em âmbar na Agenda (com contador no menu)
- **Retroativo:** pedido já pendente do Arley ganhou notificações para a equipe

### 33. WhatsApp — Evolution API real + Docker (Colima)
- Instalado `colima`, `docker`, `docker-compose` via Homebrew (`~/.docker/config.json` com cliPluginsExtraDirs)
- Stack `evolution-api/docker-compose.yml` (imagem oficial `evoapicloud/evolution-api:v2.3.7` + Postgres 16 + Redis 7) na porta 8080
- Instância `edupsych` com `AUTHENTICATION_API_KEY=edupsych-localtest-apikey-2026`
- **Pareamento:** WhatsApp bloqueou QR por limite de aparelhos → desvincular um "Aparelho conectado" no celular e escanear de novo resolveu
- Config no app: URL `http://localhost:8080`, Token `edupsych-localtest-apikey-2026`, Phone ID `edupsych` (salva via `POST /whatsapp/config`)
- Admin Teste: `+558584882254910` com `phoneIsWhatsApp: true`; Responsável Arley com número pessoal
- **Teste completo:** solicitação do Arley → notificação da equipe (sino) + `[WHATSAPP] Notificação enviada para Admin Teste (+55...)` real
- `notifyStaffOnAppointmentRequest` loga sucesso e falha; teste de envio via `POST /whatsapp/test`
- **Aviso de segurança:** API não oficial — usar número dedicado; só recebem aviso usuários com `phoneIsWhatsApp: true` (apenas admin hoje)

### 35. Teste do acesso do responsável Arley + senha de teste
- **Problema:** login do Arley (`arleyoliveiracastro@gmail.com`) retornava "Credenciais inválidas" — o hash não batia com `123456` (senha real definida por ele: `@Exodo22`)
- **Correção:** senha restaurada para `@Exodo22` via SQL direto no `backend/prisma/dev.db` com bcrypt gerado pelo backend (login 200 confirmado)
- **Validação:** `POST /auth/login` com `@Exodo22` → 200 + `GET /guardian/patients` e `GET /guardian/appointments` retornando os dados do Gabriel — fluxo completo do portal do responsável OK

### 36. Refatoração da Feature de Mensagens entre Responsável e Profissional (Chat Flutuante + Notificações + APIs)
- **Model Prisma:** `ChatMessage` atualizado com `senderRole` ('RESPONSAVEL' | 'STAFF'), `readByStaff` (Boolean) e `readByGuardian` (Boolean). DB SQLite atualizado via `prisma db push`.
- **Backend Chat (`chat.ts` & `guardian.ts`):**
  - `GET /api/chat/conversations`: Agrupa mensagens por paciente para a equipe com `unreadCount`, última mensagem e data.
  - `POST /api/chat/conversations/:pacienteId/read`: Marca conversa como lida pela equipe (`readByStaff: true`).
  - `POST /api/chat/send`: Envia mensagem como `STAFF` e notifica o usuário do responsável no app.
  - `GET /api/guardian/chat/unread-count`: Retorna total de não lidas para o portal do responsável.
  - `GET /api/guardian/chat/:patientId`: Marca mensagens como lidas pelo responsável (`readByGuardian: true`).
  - `POST /api/guardian/chat`: Envia mensagem do responsável, notifica a equipe no app e dispara alerta por WhatsApp (Evolution API) para profissionais ativos com `phoneIsWhatsApp: true`.
- **Frontend (`ChatFloatingComponent`):**
  - Componente flutuante unificado (`<app-chat-floating>`) com botão no canto inferior direito, badge de não lidas, drawer interativo com lista de conversas e janela de chat.
  - Suporte a Dual Mode (`guardian` true/false) para atuar no painel da clínica ou no portal do responsável.
  - Polling a cada 8s e auto-scroll ao enviar/carregar mensagens.
- **Layouts e Notificações:**
  - `<app-chat-floating>` adicionado em `MainLayoutComponent` e `GuardianLayoutComponent`.
  - Sino de notificações em `MainLayoutComponent` integrado com `NotificationDropdownComponent` e suporte visual para tipo `message`/`chat`.

---


## Sessão 07/08/2026 (Sexta) — Parte 2

### 29. Solicitações de Formulário para Responsáveis (link público)
- **Model Prisma:** `DocumentRequest` (professionalId, responsibleId, patientId, title, templateJson, token único, status, dueDate, sentVia, answersJson, submittedAt)
- **Fluxo:** profissional cria formulário com campos dinâmicos → sistema gera link público único → envia por email (SMTP Gmail) ou WhatsApp (Evolution API) ou só copia link → responsável preenche sem login → profissional vê respostas e exporta PDF
- **Tipos de campo:** text, textarea, number, date, select, radio, checkbox (com obrigatoriedade e opções)
- **Backend:** `document-requests.ts` — rotas públicas `GET/POST /public/:token` (sem auth) + CRUD autenticado + `POST /:id/resend`
- **Segurança:** token aleatório de 20 bytes no link; formulário só aceita 1 resposta (409); expiração por dueDate
- **Frontend:** módulo `/app/solicitacoes` (lista com filtros por status, formulário com construtor de campos, detalhe com respostas/PDF/link/copiar/reenviar) + página pública `/formulario/:token` (fora do guard de auth)
- **Menu lateral:** item "Solicitações" (ícone assignment_turned_in)
- **Bug corrigido:** `sentVia` vs `sendVia` (campo Prisma x leitura) — envio por email validado com Gmail real
- **Testes:** criar → GET público → submit → 409 duplo → detalhe com respostas → resend EMAIL (log "[DOC REQUEST] Email enviado")

---

## Sessão 07/08/2026 (Sexta) — Parte 1

### 28. Ativação de Conta + Recuperação de Senha (código/link por email ou WhatsApp)
- **Model Prisma:** `VerificationCode` (userId, type, channel, codeHash, tokenHash, expiresAt, attempts, usedAt)
- **Registro local:** cria usuário com `active: false` → envia link + código de 6 dígitos por email (ou WhatsApp) → login bloqueado com 403 "Conta não ativada" até ativar
- **Rotas novas:** `POST /auth/verify-account` (por token do link OU código+email/phone), `POST /auth/resend-verification`, `POST /auth/forgot-password` (escolha EMAIL/WHATSAPP), `POST /auth/reset-password` (token do link OU código + nova senha)
- **Email:** `lib/email.ts` com nodemailer (SMTP no .env); sem SMTP configurado → modo dev loga código/link no console do backend
- **WhatsApp:** reutiliza `sendWhatsAppMessage` exportado de whatsapp.ts
- **Segurança:** código com hash SHA-256, token de 32 bytes com hash, expiração (24h ativação / 10min reset), invalidação após uso (código não reusável)
- **Frontend:** páginas `/auth/verify` (ativação por link ou código) e `/auth/recuperar-senha` (3 passos: identificar → código → nova senha); login com botão "Reenviar link de ativação" e link "Esqueceu sua senha?"
- **Testes via curl:** registro → 403 no login → ativação por código OK → ativação por token OK → forgot → reset por código OK → reset por token OK → reuso de código bloqueado
- **Google OAuth:** continua criando usuários `active: true` (email já comprovado pelo Google)

---

## Sessão 06/08/2026 (Tarde)

### 23. Auditoria das 10 Funcionalidades Competitivas
- **Backend:** 13 endpoints testados via API com payloads reais — WhatsApp, Signatures (GET/POST), ABA assessments/programs, evolution/compare, consents, permissions, nfse, waiting-room, ai/plan-suggestion, guardian/dashboard — todos OK
- **Frontend:** rotas e componentes das 10 funcionalidades conferidas (12/12); endpoints frontend casam com o backend em 8/8 fluxos de API

### 24. Correções da auditoria
- **Painel TV:** status `CHAMANDO` não era aceito pela API → `CHAMADO` (envio e exibição); `EM_ATENDIMENTO` → `EM_SESSAO`
- **Comparativa:** alias `comparar` em `evolucoes.routes.ts` + botão "Comparar" na lista
- **Permissões:** botão `admin_panel_settings` em `users-list` navegando para `:id/permissoes`
- **LGPD:** link "Ver Histórico" → `/app/lgpd` (era `/app/lgpd/log` inexistente)

### 25. Google OAuth (credenciais reais)
- `.env` com Client ID/Secret do Google Cloud Console
- Fluxo testado no navegador: escolha de conta → callback → dashboard
- Conta criada via Google: Iarlley Oliveira (PSICOPEDAGOGO, avatar do Google)
- Origem JS e redirect URI configurados no console

### 26. Senha para contas sem senha (Google)
- **Bugs descobertos:** `PUT /auth/profile` e `PUT /auth/password` não existiam no backend (400/404) — perfil e senha nas Configurações nunca funcionaram
- Rotas criadas: `PUT /auth/profile` (nome/email/telefone/registro/bio) e `PUT /auth/password` (define sem senha atual se a conta não tem; exige com validação se tem)
- `phoneIsWhatsApp` adicionado no model `User`
- `hasPassword` em login/registro/callback Google
- Aba Segurança adaptativa: "Definir Senha" vs "Alterar Senha"
- Testado: usuário Google definiu senha e logou com email+senha

### 27. Observação de segurança
- `backend/.env` **rastreado no GitHub** por decisão do usuário (repo privado, único dono) para continuar o trabalho em outro PC; `.env.example` criado como modelo

---

## Sessão 06/08/2026 (Manhã)

### 16. Tooltips globais nos ícones
- Sistema global em `app.component.ts` com evento delegado em `.material-icons`
- Mapa `ICON_LABELS` (rótulos em português) + fallback que capitaliza o nome do ícone
- CSS em `styles.scss` (posição, fundo escuro, fade)

### 17. Cadastro de Responsável corrigido
- **Prisma:** adicionados `city`, `state` e `phoneIsWhatsApp` nos models `Responsible` e `Paciente`
- **Backend:** POST/PUT com `pacienteIds` para vincular pacientes existentes
- **Frontend:** load do endereço na edição (campos planos do Prisma); toast de sucesso no save

### 18. Cadastro de Paciente corrigido
- **Backend:** POST/PUT mapeiam `responsavelId` → `responsibleId`; GET `/api/pacientes/:id` inclui `responsible` e `school`
- **Frontend:** payload sem vetores de relações (`prontuarios`, `anamneses`, etc.); JSON quando não há avatar

### 19. Páginas de Detalhe corrigidas
- `responsavel-detail`: endereço em campos planos + badge WhatsApp
- `paciente-detail`: `responsible.name` e `school.name` (antes usava `responsavel` inexistente)

### 20. Métricas de estrelas no formulário de Evolução
- Campos `focus`, `engagement`, `skillProgress`, `behavior` (1–5) com estrelas clicáveis
- Backend zod: `clinicalEvolution`/`conduct` persistidos; `activities`/`observations` opcionais; PUT com `validate()`
- Edição: load sanitizado + data em `YYYY-MM-DD`

### 21. Contagem de pacientes nas Escolas
- **Problema:** frontend lia `patientCount` (nulo no banco); API retorna array `patients`
- **Correção:** `e.patients?.length || e.patientCount || 0` em `escolas-list` e `escola-detail`

### 22. Correções diversas
- Busca de CEP (ViaCEP): `authInterceptor` não envia mais `Authorization` para URLs fora de `/api/`
- Evolução mock criada para Gabriel Carvalho Lima via `session-records`

---

## Sessão 05/08/2026 (Continuação - Tarde)

### 9. Toast Notifications Animado
- Barra de progresso no topo que encolhe de 100% até 0%
- Animação de entrada lenta (0.6s) com efeito bounce
- Animação de saída suave (0.5s) fade + slide
- 4 estados: hidden → entering → visible → leaving → hidden
- Cores da barra diferenciadas por tipo (verde escuro, vermelho escuro, marrom, azul escuro)

### 10. Aba Aparência em Configurações
- 3 temas: Claro, Escuro, Sistema (segue preferência do SO)
- 6 cores de destaque选择aveis (indigo, violeta, rosa, esmeralda, âmbar, vermelho)
- Salva no localStorage e aplica automaticamente
- Botão "Alternar Tema" removido da sidebar

### 11. Correção Salvar/Editar Escola
- **Problema:** Schema Prisma do backend (`levels`, `cep`, `street`...) incompatível com frontend (`level`, `location`)
- **Correção:** 
  - Backend route: Zod schema atualizada com campos corretos + validação no PUT
  - Frontend: `save()` envia campos individuais de endereço
  - `ngOnInit`: carrega endereço corretamente ao editar
  - `schema.prisma` raiz sincronizado com backend

### 12. Diário de Sessões Redesignado
- Cards arredondados (3xl) com ícones coloridos por seção
- Labels com ícones (flag, build, psychology, assignment, sticky_note_2)
- Preview do documento com cards coloridos e ícones
- Padronizado com o resto do sistema

### 13. Página-lista Documentos Clínicos
- 3 cards: Diário de Sessões, Frequência, Plano de Intervenção
- Cada card com ícone, descrição, categoria e seta
- Rota `/app/documentos-clinicos` agora mostra a lista (não redireciona)

### 14. Sidebar Sempre Aberta
- `sidebarOpen` forçado para `true` no ngOnInit
- Limpa estado anterior do localStorage

### 15. Ícone Docs Clínicos
- Trocado de `clinical_notes` (parecia traços) para `note` (ícone de documento mais claro)

### 1. Sincronização com GitHub (novo PC)
- `git pull` do commit `7595269` (111 arquivos, +8730 linhas)

### 2. Setup do ambiente (Windows)
- `npm install` (frontend + backend) com allowScripts aprovados e salvos no package.json
- `prisma db push` + `seed.ts` concluídos

### 3. Bug corrigido - WhatsApp (quebra crítica)
- **Problema:** `TypeError: Cannot read properties of undefined (reading 'findMany')` derrubava o backend
- **Causa:** `prisma.whatsappLog`/`prisma.whatsappConfig` (errado) vs modelo `WhatsAppLog`/`WhatsAppConfig` → client gera `prisma.whatsAppLog`/`prisma.whatsAppConfig`
- **Correção:** 11 ocorrências em `backend/src/routes/whatsapp.ts`
- **Verificação:** rotas `/api/whatsapp/*` → HTTP 200

### 4. Bugs críticos corrigidos (05/08)
- **Modelos Prisma ausentes:** Adicionados `WhatsAppConfig`, `WhatsAppLog`, `Signature`, `ConsentLog` + campo `permissions` no `User`
- **Guardian rotas:** `GET /appointments` movido antes de `GET /appointments/:patientId` para evitar colisão
- **UserForm:** Navegação corrigida de `/users` para `/app/users`
- **ABA DELETE:** Adicionado try/catch para evitar crash

### 5. Rotas /app/app/ duplicadas (11 links corrigidos)
- 9 componentes tinham `[routerLink]="['/app/app/...']"` (duplicado)
- Corrigidos: protocolo-detail, recurso-detail, sessao-detail, agenda-detail, anamnese-detail, responsavel-detail, plano-detail, evolucao-detail, responsaveis-list

### 6. Melhoria gráfica Protocolo TEA
- **Detalhe:** Radar global (5 categorias), bar chart horizontal, progress bars, card de classificação com interpretação, PDF com dados reais
- **Formulário:** Radar global no topo, painel de resumo com círculo de progresso e indicadores por categoria
- **Lista:** PDF export corrigido com dados reais via `protocol-stats` API (não mais hardcoded com Math.random)

### 7. Testes de endpoints
- Todos os endpoints testados com sucesso (login, dashboard, pacientes, ABA, waiting-room, consents, nfse, permissions, evolution/compare, guardian, ai-suggestions)

### 8. Ambiente (fora do repo)
- `opencode.exe` global corrompido (stub de 479 bytes por postinstall bloqueado) → restaurado binário real de 174 MB

---

## Correções desta Sessão (04/08/2026)

### 1. Rotas com prefixo /app faltando (22 rotas corrigidas)
- **Problema:** Links de editar/visualizar redirecionavam para a landing page
- **Causa:** routerLink usava `/modulo/id` em vez de `/app/modulo/id`
- **Correção:** Adicionado prefixo `/app/` em todas as rotas dinâmicas
- **Arquivos afetados:**
  - financeiro-list.component.ts
  - pacientes-list.component.ts
  - paciente-detail.component.ts
  - prontuario.component.ts
  - planos-list.component.ts
  - escolas-list.component.ts
  - escola-detail.component.ts
  - anamnese-list.component.ts
  - evolucoes-list.component.ts
  - documentos-list.component.ts
  - documento-detail.component.ts
  - sessoes-list.component.ts
  - biblioteca-list.component.ts
  - laudos-list.component.ts
  - laudo-detail.component.ts
  - protocolos-list.component.ts
  - responsaveis-list.component.ts
  - responsavel-detail.component.ts
  - plano-detail.component.ts
  - anamnese-detail.component.ts
  - evolucao-detail.component.ts
  - sessao-detail.component.ts
  - recurso-detail.component.ts
  - agenda-detail.component.ts
  - protocolo-detail.component.ts

### 2. Dashboard - documentosPendentes não contabilizava
- **Problema:** Card "Documentos Pendentes" mostrava sempre 0
- **Causa:** Rota `/api/dashboard` não retornava `documentosPendentes`
- **Correção:** Adicionado `prisma.document.count({ where: { status: 'PENDENTE' } })` na query

### 3. Avaliação ABA - ABLLS-R não carregava habilidades
- **Problema:** Domínios apareciam vazios ao selecionar protocolo ABLLS-R
- **Causa:** ABLLS-R usa propriedade `skills` mas componente esperava `items`
- **Correção:** `ABLLS_R_DOMAINS.map(d => ({ ...d, items: d.skills }))`

### 4. Responsável - Vincular paciente existente
- **Problema:** Só era possível criar novo paciente, não vincular existente
- **Correção:** Adicionado modal "Vincular Paciente Existente" com busca

### 5. Seed - Dados de teste atualizados
- **Problema:** Nomes repetidos entre pacientes e responsáveis
- **Correção:** Todos os nomes únicos com dados fictícios completos (email, telefone, endereço)

### 6. Painel TV Sala de Espera
- **Funcionalidade:** Display para TV com chamada de próximo paciente
- **URL:** `/app/agenda/tv`
- **Características:** Tela escura, atualização a cada 5s, som de notificação

### 7. Node.js v26.6.0
- **Status:** Projeto funciona normalmente
- **Nota:** Erro 524 era timeout da conversa, não do projeto

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
| **Evoluções** | Star ratings, frequency PDF, comparativa entre períodos | OK |
| **Configurações** | Full page (profile, password, clinic) | OK |
| **Protocolos** | 200 items TEA, radar chart, classification, PDF | OK |
| **Planos** | Financial calc, frequency/duration, PDF, IA sugestões | OK |
| **Biblioteca** | Grid view, filters, upload | OK |
| **Documentos Clínicos** | Diário, Fichas, Planos com export PDF | OK |
| **Guardian Portal** | Layout separado para responsáveis | OK |
| **WhatsApp** | Lembretes automáticos de agendamento | OK NOVO |
| **Protocolos ABA** | ABLLS-R, VB-MAPP, Denver assessment | OK NOVO |
| **LGPD** | Termos de consentimento, consent logs | OK NOVO |
| **NFS-e** | Emissão de notas fiscais | OK NOVO |
| **Sala de Espera** | Check-in, fila, chamada, Painel TV | OK NOVO |
| **Permissões** | Multi-profissional, matrix de permissões | OK NOVO |
| **Assinatura Digital** | Canvas para assinatura em documentos | OK NOVO |
| **Painel TV** | Display para TV da sala de espera | OK NOVO |

---

## 10 Funcionalidades Competitivas (04/08)

### 1. Integração WhatsApp (Lembretes Automáticos)
- **Rota:** `/app/whatsapp`
- **Backend:** `GET/POST/DELETE /api/whatsapp-logs`
- **Frontend:** `whatsapp-config.component.ts`, `whatsapp.service.ts`
- **Funcionalidade:** Envio de lembretes de agendamento via WhatsApp (compatível com Evolution API)
- **Configurações:** URL do servidor, token API, mensagem personalizada

### 2. Assinatura Digital em Documentos
- **Componente:** `digital-signature.component.ts`, `signature-modal.component.ts`
- **Backend:** `GET/POST /api/signatures`
- **Funcionalidade:** Canvas para assinatura digital em laudos, relatórios e documentos
- **Exportação:** PNG da assinatura salva no documento

### 3. Protocolos ABA (ABLLS-R, VB-MAPP, Denver)
- **Rota:** `/app/protocolos-aba`
- **Frontend:** `aba-assessment.component.ts`, `aba-programs.component.ts`
- **Dados:** `ablls-r.ts` (15 áreas, 165 habilidades), `vb-mapp.ts` (105 marcos), `denver.ts` (100 itens)
- **Funcionalidade:** Avaliação completa com gráficos de radar, exportação PDF

### 4. Gráficos Comparativos de Evolução
- **Rota:** `/app/evolucoes/comparar`
- **Frontend:** `evolucao-comparativa.component.ts`
- **Backend:** `GET /api/evolution-comparison`
- **Funcionalidade:** Comparação lado a lado entre dois períodos de avaliação

### 5. LGPD - Consentimento Digital
- **Rota:** `/app/lgpd`
- **Frontend:** `consent-form.component.ts`, `consent-log.component.ts`
- **Backend:** `GET/POST /api/consents`
- **Funcionalidade:** Termos de consentimento digital, registro de consentimentos

### 6. Multi-profissional com Permissões
- **Rota:** `/app/usuarios/permissoes`
- **Frontend:** `user-permissions.component.ts`
- **Backend:** `GET/POST /api/permissions`
- **Funcionalidade:** Matrix de permissões por perfil (ADMIN, GESTOR, PROFISSIONAL, etc.)

### 7. NFS-e Integrada
- **Rota:** `/app/financeiro/nfse`
- **Frontend:** `nfse.component.ts`
- **Backend:** `GET/POST /api/nfse`
- **Funcionalidade:** Emissão de notas fiscais, geração PDF, status de envio

### 8. Sala de Espera Virtual
- **Rota:** `/app/agenda/sala-espera`
- **Frontend:** `sala-espera.component.ts`
- **Backend:** `GET/POST/PUT/DELETE /api/waiting-room`
- **Funcionalidade:** Check-in, fila de atendimento, chamada de pacientes

### 9. Portal do Responsável - Melhorias
- **Rota:** `/guardian`
- **Frontend:** `guardian-appointments.component.ts`, `guardian-dashboard.component.ts`
- **Funcionalidade:** Agendamentos, resumo de sessões, download de documentos

### 10. IA para Sugestão de Planos de Intervenção
- **Rota:** `/app/planos/ia`
- **Frontend:** `plano-ai.component.ts`
- **Backend:** `GET /api/ai-suggestions`
- **Funcionalidade:** Motor rule-based para sugestão automática de planos TEA/ABA

---

## Painel TV - Sala de Espera (04/08)

### Funcionalidade
Display para TV na sala de espera com chamada de próximo atendimento.

### Características
- **URL:** `http://localhost:4200/app/agenda/tv`
- **Tela escura** otimizada para TV
- **Atualização automática** a cada 5 segundos
- **Som de notificação** ao chamar paciente
- **Relógio e data** em tempo real
- **Fila de atendimento** com posições e status

### Como usar
1. Acesse **Sala de Espera** no menu lateral
2. Clique no ícone 📺 ou acesse `/app/agenda/tv`
3. Abra em nova janela e maximize (tela cheia)
4. Conecte a TV via HDMI ou Chromecast

### Fluxo
1. Paciente faz check-in → aparece na fila
2. Painel auto-chama próximo paciente → toca som
3. Status: AGUARDANDO → CHAMANDO → EM ATENDIMENTO

---

## Dados de Teste Cadastrados

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
- **Prisma** 25+ models, 40+ rotas backend
- **Auth** middleware com JWT tokens
- **Modais** reutilizáveis criados
- **Notification Dropdown** criado
- **Digital Signature** canvas component
- **TV Display** para sala de espera

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
- Painel TV: http://localhost:4200/app/agenda/tv

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
- `src/app/modules/whatsapp/` - Integração WhatsApp
- `src/app/modules/protocolos-aba/` - Protocolos ABA (ABLLS-R, VB-MAPP, Denver)
- `src/app/modules/lgpd/` - LGPD consentimento
- `src/app/modules/agenda/pages/tv-sala-espera.component.ts` - Painel TV sala de espera
- `src/app/shared/components/digital-signature.component.ts` - Assinatura digital
- `src/app/shared/components/signature-modal.component.ts` - Modal de assinatura
- `src/app/core/services/` - Serviços (API, Auth)
- `src/app/core/interceptors/` - Error interceptor

### Backend
- `backend/src/index.ts` - Express server
- `backend/src/routes/` - 40+ rotas REST
- `backend/src/middleware/auth.ts` - Auth middleware
- `backend/prisma/schema.prisma` - 25+ models

---

## Próximos Passos

1. Testar todas as 10 funcionalidades competitivas
2. Google OAuth - configurar credenciais reais
3. Deploy em produção
4. Testes E2E completos

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
