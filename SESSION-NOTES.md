# EduPsych Pro - Clone Angular Session Notes

---

## Sessão 21/08/2026 (Sexta) — Implementação das 12 features do iPsy Tools

### 95. Análise do iPsy Tools (ipsybr.com.br)
- Fetch da landing page do iPsy Tools e comparação feature-a-feature com nosso sistema
- 12 features identificadas como faltantes: Blindagem LGPD com IA, PEI com IA, Planner de Sessões, Central de Evidências, Acordos Profissionais, 37 modelos de documento, 60 jogos cognitivos, 247 materiais, iPsy Finance DRE, Academia iPsy, Kit Docente, Comunidade

### 96. Blindagem LGPD com IA
- Backend: `POST /relatorios/audit-lgpd` — auditoria rule-based de documentos clínicos
  - Verifica: CPF/telefone/email/CEP expostos, diagnóstico fechado, linguagem arriscada, dados de terceiros, consentimento LGPD, estrutura do documento
  - Retorna: score 0-100, riskLevel (ALTO/MEDIO/BAIXO), findings[] com severity/category/message/suggestion
- Frontend: botão "Auditar LGPD" no `laudo-form.component.ts` ao lado de "Gerar rascunho com IA"
  - Painel de resultado com cores por severidade (vermelho/ âmbar/ verde), ícones, sugestões
  - `[ngClass]` object syntax (não ternário — Angular template parser não suporta ternário aninhado em `[class]`)

### 97. Gerador de PEI com IA
- Backend: `POST /ai/generate-pei` — gera PEI completo com 4 fases (Montar→Ativar→Acompanhar→Renovar)
  - Objetivos por categoria (Comunicação, Comportamento, Socialização, Autorregulação, Acadêmico)
  - Check-ins programados, recomendações gerais
- Frontend: botão "Gerar PEI" no `plano-ai.component.ts` (novo, ao lado de "Gerar Plano")
  - Trilho visual de 4 fases com ícones, cores e status
  - Tabela de objetivos com indicadores e atividades
  - Tabela de check-ins programados
- Schema: campo `phase` (MONTAR/ATIVAR/ACOMPANHAR/RENOVAR) + `phaseHistory` no model `InterventionPlan`
- `prisma db push` OK

### 98. Planner de Sessões com Cronômetro
- Backend: `POST /session-planner/generate-cycle` — gera ciclo de sessões
  - 5 fases por sessão: Aquecimento (5min), Avaliação Rápida (10min), Intervenção Principal (25min), Generalização (10min), Encerramento (5min)
  - Endpoints para iniciar/concluir fases
- Frontend: `/app/session-planner` — componente completo com:
  - Formulário de geração (paciente, frequência, total de sessões, objetivos)
  - Timer digital em tempo real (MM:SS) com controles Iniciar/Pausar/Concluir
  - Barra de progresso por fase
  - Lista de sessões do ciclo
  - Notas por fase
  - CSS class `bg-primary` (não `bg-primary/90` — incompleto no template)

### 99. Central de Evidências
- `/app/evidencias` — 5 tabs: Citações, Legislação, Fundamentação Teórica, Protocolos, Glossário
- ~50 itens hardcoded (autores brasileiros, LDB, Estatuto Criança, LGPD Art. 14, DSM-5, instrumentos)
- Busca, favoritos (localStorage), exportação PDF

### 100. Acordos Profissionais
- `/app/acordos` — calculadora de valor-hora, 6 modelos de contrato editáveis, respostas para objeções de preço, gerador de propostas com preview

### 101. 37 Modelos de Documento
- `/app/modelos` — grid com 37 templates em 7 categorias (Diagnóstico, Avaliação, Intervenção, Escolar, Jurídico, Família, Financeiro)
- Busca, filtro por categoria, favoritos, modal de preview e editor

### 102. 60 Jogos Cognitivos
- `/app/jogos` — 60 jogos em 6 categorias (Atenção, Memória, Funções Executivas, Consciência Fonológica, Matemática, Socioemocional)
- Modal de jogo com Canvas API, timer, pontuação, ranking (localStorage), reflexão clínica pós-jogo

### 103. 247 Materiais Expandidos
- `/app/materiais` — 247 materiais em 12 subcategorias com busca, filtro por subcategoria/idade, favoritos

### 104. iPsy Finance DRE
- `/app/financeiro/dre` — Demonstração do Resultado do Exercício, KPIs, Previsto vs Realizado (CSS bar chart), cobranças, 5 relatórios com exportação PDF

### 105. Academia iPsy
- `/app/academia` — 8 casos clínicos interativos "Escolha sua Aventura" com 4 pontos de decisão, pontuação, explicações, quiz final

### 106. Kit Docente
- `/app/kit-docente` — gerador de links, devolutiva para professores, matriz de responsabilidades, treino rápido, template de email

### 107. Comunidade
- `/app/comunidade` — fórum Q&A com 5 categorias, posts, comentários, votos, favoritos (localStorage), 5 posts seed fictícios

### 108. Menu Financeiro reorganizado
- DRE e NFS-e movidos para submenu expansível do Financeiro (padrão Documentos/Protocolos)
- 3 itens: Financeiro principal, NFS-e, DRE

### 109. Validação
- `tsc --noEmit` backend: warnings pré-existentes (whatsapp.ts) · `ng build` frontend: OK (763.95 kB)

---

## Sessão 20/08/2026 (Quinta) — Validação no navegador + rastreios com busca ampliada e ocultar/mostrar todos

### 92. Sistema no ar + validação das features da sessão 19/08
- Backend (`tsx watch` :3000, pid 6342) e frontend (`ng serve` :4200, pid 6386) subidos; login validado (sarah@edupsych.com / 123456)
- **Rastreios:** 5 já criados no browser (Theo Mendes Rocha) — M-CHAT-R ALTO, ATA ELEVADO, SNAP-IV MODERADO, Habilidades Sociais MODERADO, ASRS-18 BAIXO; scoring automático correto (GET /screenings/instruments OK)
- **Laudo IA:** `POST /relatorios/generate-draft` OK — rascunho com identificação, queixa, histórico escolar e dificuldades do Theo
- **Insights:** `GET /insights/:id` OK — 4 insights (último rastreio, evolução ABA +37, 6 evoluções, sessões) + 3 alertas (protocolo TEA 10%, encaminhamento pendente, cobrança pendente)

### 93. Rastreios: busca ampliada + ocultar rastreios (backend)
- `schema.prisma`: campo `hidden Boolean @default(false)` no model `ScreeningAssessment` (arquivado/oculto da lista); `prisma db push` OK
- `routes/screenings.ts`: `GET /` passa a excluir ocultos por padrão (`hidden=false` no where; `includeHidden=true` no query para listar tudo); `PATCH /:id/hide` (por item); **`PATCH /hide-all`** (`updateMany`, body `{hidden: bool}`) para ocultar/mostrar em massa
- Validado via API: ocultar 5 → lista padrão total 0 → `includeHidden=true` total 5 → mostrar 5 → lista normal

### 94. Rastreios: busca ampliada + botão único ocultar/mostrar (frontend)
- **Busca ampliada** (`rastreios-list`): antes só por paciente; agora busca também em instrumento (nome), informante (label) e resumo — `haystack` montado no `applyFilters`
- **Iteração 1:** botão `visibility_off` por item + badge "Oculto" + checkbox "Mostrar ocultos" — **bug:** a lista nunca renderizava os ocultos (records guardava só não-ocultos), então "mostrar de novo" não funcionava
- **Iteração 2 (final):** ocultar por-item e checkbox removidos; **um único botão alternável** na barra de filtros — "Ocultar todos" (`visibility_off`) quando há visíveis → vira "Mostrar todos" (`visibility`) quando todos estão ocultos (signal `allHidden` = hiddenCount === total); sem modal de confirmação (pedido do usuário); aviso "N rastreio(s) oculto(s)" quando parcial
- `rastreio.service.ts`: métodos `hide(id, hidden)` e `hideAll(hidden)` (`PATCH /screenings/hide-all`)
- `tsc --noEmit` backend EXIT 0 · `ng build` frontend OK

---

## Sessão 19/08/2026 (Quarta) — Sistema no ar no Mac (backend :3000 + frontend :4200) + rastreios com scoring automático (backend e frontend completos) + IA de laudos + insights no perfil do paciente

### 88. Sistema no ar no Mac + "Failed to fetch" resolvido
- `environment.ts`: `apiUrl` apontava para o IP do Windows (`192.168.0.100`) → trocado para `http://localhost:3000/api`; login real validado (sarah@edupsych.com / 123456, Dra. Sarah Miller)
- **Atenção:** antes de push/Windows, decidir se o `environment.ts` fica com localhost ou volta ao IP da máquina atual (gera diff no git)

### 89. Backend: rastreios de triagem com scoring automático (completo e validado)
- `prisma/schema.prisma`: model `ScreeningAssessment` (id, tenantId, pacienteId, profissionalId, instrument, respondent, answers/scores como JSON string, riskLevel, summary, notes, assessedAt, createdAt/updatedAt) + relações em Tenant (`screeningAssessments`), User (`screeningAssessments`) e Paciente; `npx prisma db push` OK
- `tenant.ts`: `screeningAssessment` adicionado ao `TENANT_MODELS` (scoping por tenant)
- **`lib/screening-instruments.ts`** (novo): 5 instrumentos — **M-CHAT-R** (20 itens, críticos q2/q7/q9/q13/q14/q15, q2 reverse; ≥8 ALTO, ≥3 MODERADO), **SNAP-IV** (26 itens em 3 dimensões desatento/hiperativo/oposição; ≥6 sintomas com nota ≥2 = ELEVADO, ≥3 = MODERADO; subtipos combinado/desatento/hiperativo), **ATA** (23 itens, 46 pontos; ≥15 ELEVADO, ≥8 MODERADO), **ASRS-18** (parte A desatenção / parte B hiperatividade; A≥14 ou B≥15 ELEVADO; A≥9 ou B≥10 MODERADO), **Habilidades Sociais** (12 itens em 4 dimensões; ≥75% BAIXO, ≥50% MODERADO) — todos com dimensões, opções e textos; resultados **indicativos** (não substituem diagnóstico)
- **`routes/screenings.ts`**: `GET /instruments`, `GET /instruments/:code`, `GET /` (filtro pacienteId/instrument), `GET/PUT/DELETE /:id`, `POST /` — scoring automático no POST/PUT; **respostas normalizadas** (`trim().toLowerCase()`) — bug pego no teste com `"Nao"` maiúsculo
- **`routes/relatorios.ts`**: `POST /generate-draft` ({ pacienteId, tipo }) — template rule-based: identificação, queixa (anamnese), instrumentos (rastreios + protocolo TEA + ABA), evolução (últimas 6), síntese e conduta; `Sessao` usa `objective` (não `objetivo`)
- **`routes/insights.ts`**: `GET /:pacienteId` — insights (evolução ABA, sessões, protocolo TEA, evoluções) + alertas (rastreio de risco alto, recuo ABA, métricas em queda, encaminhamentos/cobranças pendentes)
- Rotas registradas em `routes/index.ts`; `tsc --noEmit` limpo; **tiebreaker `createdAt desc`** adicionado nos 3 `findMany` de screenings (mesmo `assessedAt` embaralhava o "último rastreio")
- Ciclo validado via API: MCHAT MODERADO (3 falhas/3 críticas), relatório gerado, insights OK; dados de teste excluídos (total 0)

### 90. Frontend: módulo Rastreios (novo) + IA no laudo + insights no perfil
- **Módulo `src/app/modules/rastreios/`** (rota `/app/rastreios`, menu Protocolos → "Rastreios", ícone `biotech`): `rastreios.routes.ts` ('' lista, 'novo' form), `rastreio.service.ts`, `rastreios-list.component.ts` (busca, filtros por instrumento/risco, badges de risco, editar via `sessionStorage 'rastreio_edit'`, excluir), `rastreio-form.component.ts` (paciente/instrumento/informante/data, itens agrupados por dimensão, **preview de score em tempo real** `computePreview()`, **radar Chart.js** com `ViewChild`, registros anteriores com editar/excluir, POST/PUT)
- Bug fix no form: scroll para `.preview` após salvar removido (painel some no resetForm)
- **Laudo:** botão "Gerar rascunho com IA" (`auto_awesome`, violeta) acima do conteúdo — `POST /relatorios/generate-draft` preenche título + conteúdo; `generating` signal com spinner
- **Perfil do paciente** (`paciente-detail`): card "Insights Automáticos" (violeta) com alertas (vermelho, `warning`) e insights (slate, ícone dinâmico por tipo); loading spinner; chamada `GET /insights/:id`
- **`main-layout`**: navItem `proto-rastreios` no grupo Protocolos + título "Rastreios"/"Novo Rastreio" no `updatePageTitle`
- **`app.routes.ts`**: rota lazy `rastreios` registrada após `protocolos-aba`
- `ng build` limpo (warning pré-existente NG8107 em solicitacoes-list + CommonJS qrcode/html2pdf.js)

### 91. Validação final
- `tsc --noEmit` backend: EXIT 0 · `ng build` frontend: OK · API: criação MCHAT_R (MODERADO, scoring correto pós-normalização), relatório, insights com rastreio mais recente correto, DELETE 204 × 2, total 0 registros restantes

---

## Sessão 18/08/2026 (Terça) — Sync com GitHub + sistema no ar no Windows + Evolution API via Docker Desktop + padrão "Registros Anteriores" nos 6 módulos restantes

### 83. Sync com GitHub (11 commits do Mac) + .env restaurados
- `git pull` fast-forward `a1ca207..9ca8124` (96 arquivos, +40k linhas): auditoria de segurança (helmet, express-rate-limit, escape.ts, file-url.ts, OAuth com code exchange, rate limiting, XSS nos exports HTML), docs (SESSION-NOTES/SESSION_LOG), backups de sessão, `.env` **removidos do repo** (auditoria 68: `git rm --cached` + gitignore)
- Usuário forneceu os valores → recriados localmente: `backend/.env` (JWT/SESSION secrets, Google OAuth, FRONTEND_URL, SMTP Gmail, `ALLOW_INSECURE_EMAIL=true`) e `evolution-api/.env` (API key + instance `edupsych`) — cobertos pelo `.gitignore`

### 84. Sistema no ar no Windows
- Backend precisou de `npm install` no `backend/` (helmet@8.3 + express-rate-limit@8.6 — vieram no pull); aviso postinstall do `protobufjs` bloqueado por allowScripts (inofensivo, já conhecido)
- **Trap do `backend.log`:** o arquivo ficou com lock do primeiro crash (MODULE_NOT_FOUND) e os `Start-Process` seguintes não truncavam/escreviam nele → o backend subiu com log `backend-test2.log` (o processo real rodando em `..\backend-test2.log`)
- `environment.ts`: `apiUrl` apontava para o IP do Mac (`192.168.20.132`) → trocado para o IP atual do Windows (`http://192.168.0.100:3000/api`); `FRONTEND_URL` no `.env` ganhou `http://192.168.0.100:4200`
- Frontend: `npm start -- --host 0.0.0.0` (porta 4200, log `frontend.log`); validado login real (sarah@edupsych.com → Dra. Sarah Miller GESTOR) + frontend HTTP 200
- Acesso: `http://localhost:4200` ou `http://192.168.0.100:4200` na LAN

### 85. Evolution API — Docker Desktop instalado manualmente + instância criada
- **Docker não existia no Windows**; `winget install Docker.DockerDesktop` falhou (exit 4294967291 — UAC) e o download manual pendurou → o usuário baixou o instalador (`https://desktop.docker.com/win/main/amd64/236836/Docker Desktop Installer.exe`) e instalou manualmente (4.87.0, instalado em `C:\Users\Usuario\AppData\Local\Programs\DockerDesktop\` — **não** no `Program Files`)
- CLI do docker fora do PATH do shell → prefixo `C:\Users\Usuario\AppData\Local\Programs\DockerDesktop\resources\bin` + `docker-credential-desktop` no PATH
- `docker compose up -d` (evolution-api/docker-compose.yml): postgres:16 + redis:7-alpine + `evoapicloud/evolution-api:v2.3.7` na porta 8080; servidor 29.7.2 no contexto desktop-linux
- Instância `edupsych` não existia no volume novo → `POST /instance/create` com `integration: WHATSAPP-BAILEYS` obrigatório na v2.x (sem ele: 400 "Invalid integration"); QR Code gerado (`GET /instance/connect/edupsych`) e salvo em `whatsapp-qr.png` na raiz
- **Decisão do usuário:** WhatsApp NÃO será usado por enquanto — instância segue `close`, é só parear com o QR quando quiser

### 86. Padrão "Registros Anteriores" estendido para os 6 módulos restantes
- **Backend:** `GET /laudos` ganhou filtro `pacienteId`; `GET /appointments` idem; `GET /encaminhamentos` idem; **`DELETE /prontuarios/:id`** criado; **`DELETE /encaminhamentos/:id`** criado (os dois não existiam — eram os que causaram limpeza via SQL na sessão 79)
- **`evolucao-form`:** lista por paciente com badge de métricas (média colorida: verde ≥4, âmbar ≥3, vermelho <3), editar (PUT), excluir, resetForm preserva paciente
- **`anamnese-form`:** lista com queixa principal/status/autor; editar carrega o wizard completo e faz parse de `enderecoEscola` JSON (r.route parseAddress); excluir
- **`laudo-form`:** lista com badge de status (RASCUNHO âmbar / FINALIZADO verde / ASSINADO azul); editar/excluir
- **`prontuario`:** anotações ganharam editar (PUT) + excluir (DELETE) + empty state; formulário vira "Editar Anotação"/"Salvar Alteração"
- **`agenda-form`:** lista por paciente ordenada por data+horário desc com chip de status (PENDENTE/CONFIRMADO/CONCLUIDO/CANCELADO); editar/excluir
- **`encaminhamentos` (não tinha form):** nova página `/app/encaminhamentos/novo` — campos Paciente, De (auto usuário logado, readonly), Para (select `/users/members`), Motivo, Resposta, Status (edit) + Registros Anteriores; rota `novo` registrada ANTES de `:id`; botão "Novo Encaminhamento" na lista; título "Encaminhamentos" no header (main-layout)
- **Bug FK descoberto no caminho:** `paraUserId: ''` quebrava o Prisma (FK) → payload converte para `null` quando vazio
- **Forms agora ficam na página após salvar** (antes navegavam para a lista) — sem navegação, `router` não é mais injetado nos 4 forms; `ActivatedRoute` mantido
- **Validação:** `tsc --noEmit` backend limpo; `ng build` limpo (avisos pré-existentes de html2pdf.js/html2canvas); ciclo API validado com dados do Theo (3 laudos, 3 consultas, 6 evoluções, 1 anamnese, 2 prontuários, 2 encaminhamentos) + criar/DELETE 204 real em prontuários e encaminhamentos (dados de teste removidos)

### 87. Notificações de encaminhamento (profissional de destino + autor)
- **`POST /encaminhamentos`:** quando o encaminhamento tem `paraUserId`, o profissional de destino recebe notificação **"Novo encaminhamento"** — "Dra. Sarah Miller encaminhou Theo Mendes Rocha para você: 'motivo'" (type `encaminhamento`; pula se o autor for o próprio destino)
- **`PUT /encaminhamentos/:id`:** quando o destino responde (`resposta`) ou muda o `status`, o autor recebe **"Encaminhamento atualizado"** com o status e a resposta
- **Dropdown de notificações:** type `encaminhamento` ganhou ícone `forward` + cor sky (antes caía no fallback `notifications` cinza)
- **Validado ponta a ponta:** criar como Sarah → notificação chegou à Maria José (maria@edupsych.com); responder/ACEITO como Maria → notificação chegou à Sarah; dados de teste removidos (encaminhamento + 2 notificações)

### 88. Fix: gráfico ABA "mexendo" infinitamente
- **Causa:** Chart.js `responsive: true` + `maintainAspectRatio: false` observa o container via ResizeObserver; o `<canvas>` tinha `height="80"` e estava dentro de `<div class="mt-4">` **sem altura fixa** → o resize do canvas alterava o container → observer disparava de novo → loop infinito (gráfico oscilando + CPU alta)
- **Fix:** canvas envolvido em `<div class="h-24">` com altura fixa e atributo `height` removido (`aba-programs.component.ts`)
- O radar de `aba-assessment` usa `maintainAspectRatio: true` + `width/height=400` explícitos (caso mais seguro) — observar se algum dia apresentar o mesmo comportamento

---

## Sessão 17/08/2026 (Segunda) — Dados de teste do Theo (módulos clínicos completos) + listagem de registros nos documentos clínicos + exclusão com modal de perigo em Documentos

### 78. Dados de teste completos do Theo Mendes Rocha (id `cmsezw1em000f8882p6561p4b`)
- **Avaliações ABA (2 rodadas × 3 protocolos = 6):** ABLLS-R 116→132, VB-MAPP 77→114, DENVER 62→87; baseline 10/08 (Carlos Eduardo `cmsezw1du00038882y8j151yr`) + reavaliação 17/08 (Ana Carolina `cmsezw1dr00028882hv5std1k`); todos os itens pontuados com variação orgânica (scripts `fill-aba.py`/`fill-aba2.py` em `/var/folders/.../T/opencode/`)
- **Documentos clínicos:** 3 laudos (TEA F84.0 CONCLUIDO/Iarlley `cmshxmfll0000pnbsxwtpb2ww`; Relatório Psicopedagógico CONCLUIDO/Maria José `cmsezw1dy00048882s26cj41j`; Neuropsicológico RASCUNHO/Carlos); 3 documentos novos (Termo Consentimento LGPD, Declaração de Matrícula, Cronograma ABA) + 4 existentes = 7; 1 anamnese completa; 2 prontuários; 6 evoluções (10–17/08, estrelas 2–5); 1 protocolo TEA (200 itens, 156 pts/39%); 4 diários de sessão; 4 fichas de frequência; 2 planos de intervenção; 2 encaminhamentos; 3 financeiro (2 PIX PAGO, 1 PENDENTE); 3 agendamentos futuros (19/20/22/08); 3 programas ABA novos com 6 data points cada + 2 pré-existentes (script `fill-theo.py`)
- **Dedupe:** script rodou 2× criou duplicatas → removidas via API onde existe DELETE; **prontuários e encaminhamentos NÃO têm rota DELETE** → limpeza via `sqlite3 backend/prisma/dev.db` (script `dedupe-theo.py`)

### 79. Bugs corrigidos na avaliação ABA
- `assessedAt` com só data (dd/mm/aaaa) dava **400 do Prisma** — precisa ISO-8601 completo → fix em `aba-assessment.component.ts` (`toISOString()`)
- Frontend **não carregava avaliações existentes** ao selecionar paciente/protocolo → auto-load + **chips "Avaliações salvas"** clicáveis + save com **PUT** quando a avaliação já existe (em vez de duplicar)

### 80. Páginas de documentos clínicos eram só formulário → seção "Registros Anteriores"
- **diario-sessao, frequencia-form e plano-intervencao-doc** (módulo `documentos-clinicos`): signals `records`/`editingId`; `loadRecords()` (GET `?pacienteId=`), **Editar** (carrega no form → save vira PUT), **Excluir** (confirm + DELETE + reload), `resetForm()` (preserva pacienteId), `(change)="loadRecords()"` no select de paciente, contador de registros no header
- Ciclo POST/PUT/DELETE **validado via API** (cria→edita→exclui, 201/200/204)

### 81. Documentos: botão excluir + modal de aviso de perigo
- `documentos-list.component.ts`: botão **lixeira** na coluna Ações (usando `DocumentosService.delete` → `DELETE /documentos/:id`, rota já existia)
- Modal `dangerMode: true` (ícone `delete_forever` vermelho): *"ATENÇÃO: esta ação é PERMANENTE e não pode ser desfeita. O documento será removido definitivamente e, se já estiver compartilhado, o responsável perderá o acesso a ele."* — confirmText **"Excluir definitivamente"**

### 82. Ambiente e backup
- Serviços: backend :3000, frontend :4200, Evolution API :8080 (login sarah@edupsych.com/123456, token em `/tmp/edupsych_token`)
- `npx ng build` limpo após todas as mudanças
- Backup da conversa: `session-backup/2026-08-17-dados-testes-documentos-clinicos.json` (137 mensagens)

---

## Data: 14/08/2026

## Status: 100% Implementado + Verificação de Conta + Recuperação de Senha + Solicitações de Formulário Online + Agenda (Solicitação com Notificação) + WhatsApp Integrado + Chat em Tempo Real (polling) + Acesso pela Rede Local + "Marcar todas como lidas" validado + **Fases 1-2 SAAS multi-tenant concluídas (scoping + teste de isolamento) + Fase 3 billing (planos/trial/limite/assinatura, page /app/plano) concluída + Fase 3a gateway real Asaas (Pix recorrente) concluída + Fase 5 venda concluída (landing com planos e preços + registro de clínica self-service) + Navegação reorganizada (menu Documentos e Protocolos expansíveis com submenus; /app/plano sem cards de planos para assinantes ativos) + **Cobrança PIX própria (sem gateway) validada de ponta a ponta** + **Tema escuro completo (páginas legadas + cor de destaque configurável)** — Fase 4 adiada — deploy pausado (Oracle A1 sem capacidade; continuamos no ambiente local; pacote `deploy/` pronto + migração SQLite→Postgres validada: 321 linhas/40 tabelas)**

---

## Sessão 14/08/2026 (Sexta) — Fluxo de aprovação de documentos pelo profissional

### 75. Documento enviado pelo portal da família agora tem status AGUARDANDO_APROVAÇÃO
- **Backend `POST /guardian/documents`:** documento criado com `status: 'AGUARDANDO_APROVACAO'`. Notificação enviada à equipe do clínica (gestor, profissional, psicopedagogo, secretária).
- **Backend `PATCH /api/documentos/:id/aprovar`:** só staff pode aprovar (`APROVADO`) ou recusar (`RECUSADO`, com `feedback?`). Ao aprovar/recusar, o sistema notifica o responsável (autor do documento) via `notification.create` — mensagem "Seu documento 'X' foi aprovado/recusado", com opcional motivo da recusa.

### 76. Interface clínica: listagem e aprovação de documentos pendentes
- `documentos-list.component.ts`: botões **Aprovar** e **Recusar** aparecem quando `status === 'AGUARDANDO_APROVACAO'` (coluna ações).
- Modal de aprovação (confirma "Aprovar documento enviado pela família?").
- Modal de recusa: campo **textarea** de feedback + confirmação "Recusar documento" → família recebe o motivo.
- `getStatusLabel()` traduz: 'Aguardando aprovação', 'Aprovado', 'Recusado'.
- `getStatusClass()` define cores: azul (aguardando), verde (aprovado), vermelho (recusado).

### 77. Interface portal da família: visualização do status
- `guardian-documents.component.ts`: badge de status abaixo do nome do documento.
- Se `status === 'RECUSADO'` e houver `approvalFeedback`, exibe o motivo da recusa em um card estilizado (âmbar/vermelho).
- O responsável vê se seu documento foi aceito ou rejeitado com motivo.

---

### 73. Botão "Abrir" do portal da família quebrava (Cannot GET /api/uploads/...)
- **Causa:** `fileUrl` é salvo relativo (`/api/uploads/...`) e os componentes usavam `[href]` direto — em dev (frontend :4200, backend :3000) o link resolvia contra o frontend, que não serve `/api/uploads`
- **Fix:** novo helper `src/app/core/utils/file-url.ts` (`resolveFileUrl`) — prefixa `environment.apiUrl` quando a URL é relativa; em produção (`apiUrl: '/api'`) mantém o caminho relativo
- **Aplicado em:** `guardian-documents`, `documento-detail` (abrir/baixar/img), `documento-form` (prévia após upload)

### 74. Notificação ao profissional quando a família envia documento
- `POST /guardian/documents` agora cria notificação `type: 'document'` para toda a equipe do tenant (`getTenantStaff`: GESTOR/PROFISSIONAL/PSICOPEDAGOGO/SECRETARIA): "Novo documento enviado pela família — {responsável} enviou \"{nome}\" para {paciente}"
- `notification-dropdown.component.ts`: ícone `description` + cor âmbar para tipo `document`
- **Validado via API:** documento criado (201) + 3 notificações no banco; URL resolvida responde 200

---

### 72. Portal da família: envio de documento salvava mas não aparecia
- **Relato:** usuário enviou um documento pelo portal da família e "nada aconteceu"
- **Causa raiz:** `POST /guardian/documents` (`guardian.ts`) criava o documento com `isShared: false`, mas `GET /guardian/documents/:patientId` listava **apenas** `isShared: true` → o envio gravava no banco, porém nunca aparecia na lista
- **Fix:** `isShared: true` ao criar documento pelo responsável (afinal, ele compartilhou com a clínica); a listagem da clínica (`documentos.ts`) não filtra `isShared`, então o documento passa a aparecer nos dois lados
- **Validado via API:** upload (200) → criar documento (201) → listar mostra o documento ✓
- **Dado migrado:** o documento já enviado pelo usuário ("Declaração de Frequência") teve `isShared` atualizado para `true` no banco, passando a aparecer no portal
- **Nota de ambiente:** havia **dois backends rodando** na porta 3000 (um de 09:59, um de 12:04) com `.env`/estado divergentes → todos os processos `tsx watch` foram encerrados e um único backend foi reiniciado

---

### 71. Sessão movida de localStorage → sessionStorage
- **Relato do usuário:** logado como profissional no Chrome, colou a URL no Safari e "logou direto" — investigado: não era vazamento entre navegadores (contexto limpo redireciona para /login), mas sim sessão antiga do próprio Safari (JWT de 7 dias persistia no localStorage)
- **Decisão:** credenciais (`auth_token`, `auth_user`, `auth_tenants`, `auth_tenant`) movidas de `localStorage` para `sessionStorage` — fechar aba/navegador limpa a sessão e pede login de novo; F5 mantém a sessão
- **Arquivos:** `auth.service.ts` (todas as leituras/escritas de credenciais → sessionStorage + migração: remove chaves antigas do localStorage no constructor); `guardian-settings.component.ts` (duplicação `auth_user` manual → `auth.updateUser()`); `error.interceptor.ts` (401 → limpa sessionStorage + chaves legadas de auth, sem apagar preferências como tema/cor)
- **Preferências não-sensíveis permanecem no localStorage:** `theme`, `accentColor`, `sidebar_open`, `guardian_patient_id`, `clinic_config`, `notification_prefs`
- **Validação:** `ng build` limpo + Playwright: login → dashboard ✓; F5 mantém ✓; fechar contexto (novo navegador) → `/login` ✓; localStorage sem `auth_*` ✓

---

### 67. Auditoria: escopo e metodologia
- Skills usadas: `security-scan` (OWASP Top 10/secrets/misconfig) + subagente de análise frontend; testes dinâmicos na API real (`:3000`) com token real
- **Pontos fortes verificados:** tenant isolation via `scoped()` sólida (findUnique→findFirst com tenantId, update/delete checam existência); guardian valida vínculo responsável-paciente em todas as rotas; bcrypt com salt; JWT verify + user ativo + membership; CORS restrito a origens configuradas; uploads exigem auth

### 68. CRÍTICOS encontrados e corrigidos
- **Broken Access Control (A01) — confirmado dinamicamente:** `GET /users` e `GET /users/:id` sem `authorize('GESTOR')` — qualquer role (PROFISSIONAL) listava TODOS os usuários de todas as clínicas com **hash bcrypt de senha + chave PIX** no response → adicionado `authorize('GESTOR')` + `select` com campos seguros (sem password/pixKey/permissions); criado `GET /users/members` (scoped ao tenant, campos seguros) para o select da NFS-e (frontend ajustado)
- **Segredos no git:** `.env`, `backend/.env` e `evolution-api/.env` rastreados no repositório (com valores reais no histórico desde 03/08) → `git rm --cached` + `.gitignore` atualizado; **ALERTA: rotacionar JWT_SECRET/SESSION_SECRET/SMTP/Google OAuth/Evolution API** (histórico não reescrito)

### 69. ALTOS encontrados e corrigidos
- **Sem rate limiting em nenhuma rota** → `express-rate-limit`: global 300 req/min na API + `strictLimiter` (20 req/15min) em login/register/register-clinic/verify-account/resend-verification/forgot-password/reset-password/google-exchange + `linkLimiter` (30 req/15min) no `POST /guardian/link` (anti brute-force do accessCode de 6 dígitos) — validado: 429 após estouro
- **Stored XSS nos exports HTML (12 arquivos):** dados de API/usuário interpolados sem escape em `innerHTML`/`document.write` (pior: guardian-evolutions — cross-user) → novo `src/app/core/utils/escape.ts` (`escapeHtml`) aplicado em 10 arquivos (protocolo-detail, evolucoes-list, plano-ai, planos-list, aba-assessment, evolucao-comparativa, financeiro-list, consent-form, consent-log, protocolos-list); nfse.component deixa `res.html` cru de propósito (quebraria layout)
- **JWT + dados do usuário no query param do callback Google OAuth** (vazava via Referer/histórico) → fluxo trocado por `code` de curta duração (`purpose: 'oauth-exchange'`, 5 min) + `POST /auth/google/exchange` (com strictLimiter); frontend atualizado
- **Fallbacks hardcoded** `JWT_SECRET`/`SESSION_SECRET` (`'psicopedagoga-secret-key-2026'`) → fail-fast com erro claro se env ausente

### 70. MÉDIOS corrigidos + pendências
- **Path traversal teórico** em `GET/DELETE /uploads/:filename` → `path.basename()` (validado: `..%2f` → 404)
- **Security headers ausentes** → `helmet()` (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, CSP, Referrer-Policy: no-referrer)
- **Pendências documentadas (não corrigidas nesta sessão):** token de reset de senha na URL (migrar p/ código curto); JWT em localStorage (mitigado pelos fixes de XSS; cookie HttpOnly é migração maior); `environments/environment.ts` com IP da LAN em HTTP; self-XSS em consent-form (baixo)
- **Validação:** `tsc --noEmit` + `ng build` limpos; reteste dinâmico (403 no /users p/ PROFISSIONAL, sem password/pixKey no response, 429 no login/link, 404 no traversal, headers presentes); regressão UI Playwright (login → dashboard → NFS-e → configurações OK)

---

### 63. Causa raiz: `bg-primary` transparente no runtime (bug herdado da sessão 13)
- **Sintoma:** no tema claro, textos e ícones teal sumiam em botões/badges da landing e páginas internas — o usuário relatou "fontes e ícones não visíveis"
- **Causa raiz:** a sessão 13 mudou `tailwind.config.js` para `rgb(var(--primary-rgb) / <alpha-value>)` — sintaxe inválida quando a variável contém vírgulas (`0, 127, 128`); o browser descarta a regra inteira → **todo `bg-primary`/`text-primary` ficou transparente** (texto branco sobre fundo transparente sobre fundo branco = invisível). O botão "Salvar" que parecia HMR corrompido era, na verdade, esse bug generalizado
- **Correção:** `tailwind.config.js` → `rgba(var(--primary-rgb), <alpha-value>)` (vírgula em vez de barra) para `primary`/`primary.dark`/`primary.light` + nova cor `on-primary`; validado no CSS compilado e com Playwright (cor computada correta + contraste)

### 64. `--on-primary` por luminância (texto do accent legível sempre)
- **Problema:** o texto dos botões era `text-white` fixo — com accent claro (ex.: amber-500) branco sobre âmbar falha contraste (2.2:1)
- **Correção:** `src/app/core/utils/theme.ts` ganhou `luminance()` + `onPrimaryColor()`; `applyAccentColor` agora seta `--on-primary`/`--on-primary-rgb` (branco para accents escuros, `#0F172A` para claros) + fallbacks no `:root` de `styles.scss`; `text-white` → `text-on-primary` em 55 arquivos (script Python: só onde `bg-primary` está na mesma string de classe, sem conflito com `dark:bg-slate`/`dark:bg-gray`; caso `file:bg-primary file:text-white` manual)
- **Swatches de accent escurecidos** em Configurações: indigo-600, purple-700, pink-700, emerald-700, amber-700, red-700 (branco sempre ≥4.5:1)

### 65. Auditoria WCAG automatizada (Playwright) + correções de contraste
- **Ferramenta:** script Python (`/tmp/audit-final.py`) que computa o contraste real de TODOS os elementos visíveis (compondo alfa dos fundos, ignorando decorativos) — usado para iterar até passar
- **Landing:** SVG underline `stroke="#007F80"` → `currentColor`; CTA do banner `to-teal-600` → `to-primary-dark`; botão do banner `text-primary` → `text-primary-dark`; footer `text-gray-500` → `text-gray-400`; ícones de features `*-500` → `*-600` (blue/teal/purple/orange); badge "Para os Pais" orange-600
- **Login/select-clinic:** `to-[#007F80]` → `to-primary`; `text-red-600`→`text-red-700`; `text-emerald-600`→`text-emerald-700`; `text-slate-400`→`text-slate-500`
- **Global:** `text-slate-400` → `text-slate-500` em todos os módulos (cabeçalhos de tabela 2.52:1 → 4.83:1, labels, ícones de ação, dias da semana da agenda) preservando `dark:text-slate-*` (perl com lookbehind); estrelas de avaliação `amber-400`→`amber-600`; `text-slate-200`→`text-slate-400`
- **Paletas de avatar** (getAvatarColor em 7 listas): tons 500 → tons 700 (`#2563EB, #6D28D9, #BE185D, #B45309, #047857, #B91C1C, #0E7490, #4D7C0F`) — iniciais brancas ≥4.5:1
- **Dashboard:** labels dos cards, empty states (`text-slate-200`→`text-slate-400`), ícones `amber-600`→`amber-700`, badge `red-500`→`red-600`
- **Configurações:** tabs inativas `slate-500`→`slate-600`; avatar `slate-500`→`slate-600`; "Encerrar sessão" `slate-500`→`slate-600`; main-layout: logout `red-500`→`red-600`, badges `red-500`→`red-600`, chevron do sidebar `slate-400`→`slate-500`, avatar placeholder `slate-300`→`slate-600`; phone-input: "WhatsApp" `gray-500`→`gray-600`
- **Financeiro:** totais e valores de receita `emerald-600`→`emerald-700` (3.60:1 → 5.9:1); botão "Gerar Códigos" (pacientes) `amber-600`→`amber-700`
- **Resultado final:** Landing/Login/Dashboard/Configurações/Agenda/Pacientes/Sessões/Financeiro/Evoluções/Planos — 0 problemas reais de contraste (restantes são ícones decorativos ≥3:1, itens borderline 4.2-4.3, ou overlay de foto por design)

### 66. Validação
- `ng build` limpo após cada rodada; dev server reiniciado após mudança no tailwind.config.js (lição da sessão 13 mantida); auditorias Playwright re-executadas em todas as páginas principais (10 telas, tema claro) com contraste composto real

---

## Sessão 14/08/2026 (Sexta, noite) — Retomada no Windows: verificação de sync + sistema no ar local

### 64. Verificação local vs GitHub + subida do sistema no Windows
- **Verificação:** `git fetch --all --prune`, `branch -a` e logs — local (Windows) é **idêntico** ao `origin/main` (`3d6d81f`); working tree limpo, 0 untracked; arquivos-chave do último commit de trabalho do Mac (`0e9d5f1` 13/08 17:00 — PIX/tema escuro) presentes no disco (`src/app/core/utils/theme.ts`, `backend/src/lib/pix.ts`, `tailwind.config.js`, `configuracoes.component.ts` 40KB) e `backend/prisma/dev.db` (638KB) versionado
- **Sistema no ar (Windows):** backend `npm run dev` (tsx watch, porta 3000) e frontend `npm start` (ng serve, porta 4200) subidos desanexados via `Start-Process cmd /c ...` (Hidden) — logs `backend.log`/`frontend.log` na raiz; validado login real (`sarah@edupsych.com` → Dra. Sarah Miller, GESTOR) e frontend HTTP 200
- **Achado importante:** o usuário relatou que fez um **commit HOJE (14/08) no Mac** que não existe no GitHub (último lá é `0e9d5f1` de 13/08) — ou seja, o push não foi feito do Mac; quando ele ligar o Mac: `git push origin main` e depois `git pull` aqui para trazer as alterações novas
- **Backup da conversa:** `session-backup/2026-08-14-retomada-windows.json`
- **Pendência:** receber o push do Mac (commit de 14/08) → pull aqui → reiniciar o sistema

---

## Sessão 14/08/2026 (Sexta) — Sincronização com o GitHub (atualização do repositório)

### 63. Git pull de 30 commits + npm install + prisma generate
- Repo local estava **30 commits atrás** do `origin/main` (fast-forward `3e0d2cd..0e9d5f1`, 167 arquivos, +115k linhas) — trabalho feito em outro PC (Mac) foi trazido para o Windows
- **O que veio:** billing/PIX próprio (QR EMV + copia-e-cola + "já paguei" no portal do responsável), Asaas real (fase 3a), SaaS multi-tenant fases 1-3 (scoping, planos, trial 14d, limites, seleção de clínica), migrador SQLite→Postgres (`deploy/migrate/`), pacote `deploy/` completo, chat em tempo real (polling) + WhatsApp Evolution API, Google OAuth real, verificação de conta/recuperação de senha, tema escuro + cor de destaque configurável, menus expansíveis Documentos/Protocolos, `backend/prisma/dev.db` com dados reais (25 pacientes, 8 usuários, plano PRO ativo)
- **Comandos executados:** `git fetch` → `git pull origin main` (fast-forward limpo, sem conflitos — working tree estava limpo) → `npm install` na raiz (+22 pacotes) e no `backend/` (+2 pacotes; aviso inofensivo do postinstall do `protobufjs` bloqueado por allowScripts) → `npx prisma generate` no backend (Prisma Client v5.22.0 ok)
- **Estado final:** repo em `0e9d5f1`, dependências instaladas, Prisma Client gerado — pronto para rodar (`npm run start` / backend `npm run dev`)
- **Backup da conversa:** `session-backup/2026-08-14-sync-github.json`
- **Validação:** `git status` limpo antes e depois do pull; npm install sem erros; prisma generate concluído

---

## Sessão 13/08/2026 (Quinta) — PIX próprio (cobrança sem gateway) + tema escuro completo

### 61. Cobrança via PIX própria do profissional — validada de ponta a ponta
- **Decisão:** sem gateway — cada profissional cadastra sua própria chave PIX em Configurações → Recebimento; o sistema monta o QR Code/copia-e-cola (padrão EMV/BR Code estático); o profissional exibe/compartilha (WhatsApp); o portal do responsável recebe as cobranças e paga ("Já paguei" notifica a equipe). Asaas segue só para a assinatura do dono do sistema
- **Schema (backend + raiz sincronizados, `db push` ok):** `User.pixKey/pixKeyType`; `FinanceiroSessao.paymentMethod/pixCopiaECola/pixKey/pixKeyType/chargeShared/payConfirmedByGuardian`
- **`backend/src/lib/pix.ts` (novo):** `generatePixCopiaECola` — payload EMV estático (GUI `br.gov.bcb.pix`, MCC 0000, moeda 986, valor, txid, CRC-16/CCITT-FALSE validado contra exemplo oficial do BCB `1D3D`) + `normalizePixKey` por tipo (EMAIL/RANDOM preservam; CPF/CNPJ só dígitos; **PHONE → E.164 com +55 automaticamente**)
- **`financeiro.ts` reescrito:** normaliza form↔schema (`value/type/status/date` ↔ `valor/tipo/STATUS/dataPagamento`), `GET /:id`, `DELETE /:id`, `POST /:id/generate-pix` (400 sem chave configurada; snapshot da chave no registro; regenera se a chave mudou ou o código está obsoleto — `pixCopiaECola.includes(chaveNormalizada)`)
- **`auth.ts` PUT /profile:** aceita `pixKey/pixKeyType` + **validação de formato** (CPF 11 díg, CNPJ 14, email regex, telefone 10-13, EVP 10-32)
- **`guardian.ts`:** `GET /charges` (só cobranças PIX dos pacientes vinculados — isolamento validado: Arley viu a do Gabriel, não a do Davi) + `POST /charges/:id/pay` (marca confirmado + notifica toda a equipe — campo `title` obrigatório do model Notification)
- **Frontend:** `qrcode@^1.5.4` instalado; `AuthService.updateUser()`; Configurações → aba **Recebimento** (select tipo + input + dicas contextuais por tipo); financeiro-list → botão QR em pendentes + modal (QR, copia-e-cola, copiar, compartilhar WhatsApp via `paciente.responsible.phone`); `guardian-financial` reescrito (lista Cobranças + modal pagar + "Já paguei"); menu do responsável renomeado para **"Cobranças"**
- **Bug chave de telefone (relatado pelo usuário):** app do banco dizia "código inválido" — o DICT armazena telefone como E.164 **com DDI** (`+5585988014049`); o payload saía sem `+55` → chave não encontrada no DICT → corrigido com prefixo automático; CRC do meu gerador já validado contra exemplo oficial do BCB
- **Validação:** `tsc` backend + `ng build` limpos; E2E via API: login → PUT profile (chave PHONE) → criar receita pendente → generate-pix (payload `0114+5585988014049`, CRC ok) → guardian/charges (isolamento ✓) → charges/:id/pay (notificação "Pagamento informado" na equipe) → limpeza dos testes; dev server reiniciado (pid 18354)

### 62. Tema escuro — páginas legadas + cor de destaque (accent) configurável
- **Bug relatado:** ao editar transação no tema escuro, texto dos campos ilegível (branco em branco) — inputs não definiam cor própria e herdavam `var(--text)` (branco no escuro) sobre fundo branco
- **13 telas legadas** com paleta `gray` fixa sem `dark:` (financeiro-form, anamnese-form, paciente-detail, laudos form/detail/list, signature-modal, formulario, auth login/select-clinic/verify/reset/callback) → **solução scoped:** bloco CSS em `styles.scss` sob `.dark` + marcadoras `legacy-page` (página com fundo próprio, aplica `var(--bg)`) / `legacy-card` (superfície sobre layout/modal, aplica `var(--card-bg)`) — remap de `bg-white`, `bg-gray-50/100/200`, `bg-slate-50/100`, `text-gray-*`, `text-slate-*`, bordas, inputs/selects/textareas (fundo gray-800 + texto claro + placeholder), `option`, hover states, ring; especificidade (0,3,0) não afeta páginas modernas com `dark:`
- **Fix adicional:** cabeçalhos de laudos (título, Voltar, ícones) estavam FORA do card marcado → marcadora movida para a raiz das 3 páginas + regra de fundo condicionada a `.bg-gray-50` (laudos vivem dentro do layout, sem pintura extra); TV da sala de espera é escura por design (mantida)
- **Cor de destaque quebrada (3 bugs):** 1) gravava `--color-primary` (variável morta — o tema usa `--primary`/`--primary-rgb`); 2) Tailwind compilava `bg-primary` como hex fixo `#007F80` (impossível mudar em runtime); 3) cor só era aplicada ao abrir Configurações, nunca no load
- **Correção:** `tailwind.config.js` → `primary: { DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)', dark/light análogos }` (padrão oficial — opacidade `bg-primary/90`/`shadow-primary/20` regeneram com `rgb(var(--primary-rgb) / X)` e mudam em runtime; validado no build: antes das classes de opacidade somem, depois aparecem); novo `src/app/core/utils/theme.ts` com `applyAccentColor` (calcula `--primary-rgb`, `--primary-dark-rgb`, `--primary-light-rgb` via hexToRgb/shade/mix); `styles.scss :root` ganhou fallbacks `--primary-dark-rgb`/`--primary-light-rgb`; aplicado em `setAccentColor`/`ngOnInit` (Configurações) e `ngOnInit` (main-layout — persiste entre reloads)
- **Bug botão "Salvar Alterações" invisível:** causa = estado HMR corrompido no navegador após troca do tailwind.config.js (regra `.bg-primary` sumiu, `text-white` ficou → botão transparente com texto branco); CSS servido pelo dev server estava íntegro → **reinício do dev server** (pid 18354) resolve; instruído hard reload (Cmd+Shift+R)
- **Validação:** `ng build` limpo (produção + dev server); CSS compilado confere: `.bg-primary{background-color:rgb(var(--primary-rgb)/var(--tw-bg-opacity,1))}`, `:root` com todos os triplets, regras legacy presentes

---

## Sessão 13/08/2026 (Quinta) — Reorganização da navegação (menus expansíveis)

### 59. Sistema no ar localmente + menu Documentos expansível com submenus
- **Sistema no ar:** `start-all.sh` subiu Evolution API/backend/frontend, mas os processos morriam quando o shell encerrava (o tool do agente mata o process group ao terminar o comando) → subidos desanexados com `start_new_session=True` via Python (`logs/backend.log`/`logs/frontend.log`); validado login real (sarah@edupsych.com → JWT)
- **Sidebar (`main-layout.component.ts`):** `navItems` era um array 100% plano (sem suporte a submenu) → criado tipo `NavItem` com `children?` (fora da classe — `type` dentro de classe não compila no Angular) + `menuOpen` signal (Set de ids expandidos) + `toggleMenu`/`isExpanded`/`isGroupActive` + `syncExpandedMenus()` (auto-expande o grupo quando a rota atual está dentro dele)
- **Template:** grupos renderizam `<button>` com chevron `expand_more` (rotate-180) e sub-itens em coluna com borda esquerda (`border-l-2` + `pl-3`); `routerLinkActiveOptions="{ exact: true }"` no item "Arquivos" (`/app/documentos` não pode casar com `/app/documentos-clinicos`); sidebar recolhida (`w-20`) esconde submenu; badge de count preservado (`item.count && item.count() > 0`)
- **Grupo Documentos:** Arquivos, Diário de Sessões, Frequência, Plano de Intervenção (sub-itens diretos — o hub de cards deixou de ser necessário no menu), Biblioteca, **Laudos (novo item de menu — a rota `/app/laudos` existia mas não aparecia)**, Solicitações, LGPD — itens removidos do nível raiz: documentos-clinicos, biblioteca, solicitacoes, lgpd
- **Grupo Protocolos:** Protocolo TEA, Avaliação ABA (`/app/protocolos-aba/assessment`), Programas ABA (`/app/protocolos-aba/programs`)
- **Títulos do header:** mapa `titles` ganhou `laudos` + títulos por subrota (`documentos-clinicos` → Diário de Sessões/Frequência/Plano de Intervenção; `protocolos-aba` → Avaliação ABA/Programas ABA)
- **Validação:** 2 erros de build corrigidos — `type` alias dentro da classe ("Unexpected token") movido para escopo do módulo; `count` opcional no tipo exigiu `?.count?.set()` no `loadCounts`; `ng build` limpo

### 60. /app/plano — planos disponíveis ocultos para assinantes ativos
- **Problema:** página mostrava os 3 cards de planos sempre, inclusive para quem já assinou (ex.: trial) — poluição visual
- **Correção (`plano.component.ts`):** novo signal `showPlans` + `hasActiveSubscription()` (`subStatus === 'ATIVA'`); com assinatura ativa, os cards somem e aparece um link sutil "Trocar de plano" (swap_horiz + chevron, `hover:text-primary`) que expande o grid ao clicar (vira "Ocultar planos" para recolher); sem assinatura ativa (PENDENTE/CANCELADA) os cards continuam visíveis direto, como antes
- **Validação:** `ng build` limpo

---

## Sessão 12/08/2026 (Quarta) — Fase 5: Venda (landing com planos + registro de clínica self-service)

### 58. Evoluções — modal de compartilhamento por redes + modo gráfico no quadro
- **Antes:** botão de compartilhar abria só um modal de confirmação e marcava `sharedWithGuardian: true` no backend
- **LGPD em primeiro lugar:** a pedido do usuário, o modal foi reestruturado — **"Compartilhar com o responsável" (portal do app, seguro) virou a opção principal** em destaque; redes sociais ficaram recolhidas em seção expansível "Redes sociais (desaconselhado)" que só libera os botões após **checkbox de reconhecimento LGPD obrigatório** (Lei 13.709/2018) — mensagem editável + aviso reconhecem exposição pública; estado de reconhecimento/expansão resetam a cada abertura do modal
- **Modo gráfico:** toggle Lista/Gráfico no cabeçalho — Chart.js line chart das 4 métricas (Foco, Engajamento, Progresso, Comportamento) por data, eixo 0-5★, legenda de cores, filtro por paciente (select); "Todos os pacientes" agrega média por data; grid em `chartPoints()`, render via `setTimeout` pós-@if
- **Validação:** `ng build` limpo; API `/session-records` única evolução (Gabriel, 4/4/3/4, shared ✓) — gráfico com 1 ponto inicial até novas evoluções

### 57. Bug listas duplicadas — causa raiz no seed + deduplicação do banco
- **Problema:** lista de pacientes mostrava 25 registros que eram 5 cópias idênticas (Gabriel, Helena, Theo, Manuela x5 + Davi x4 + Lucas) — gerado pela execução repetida do seed (08/04, 08/10 x4), que usava `create` para responsáveis/pacientes/escolas e filhos
- **Causa raiz:** seed NÃO era idempotente para dados demo (só usuários via upsert); cada `npm run seed` recriava o bloco inteiro
- **Correção (`seed.ts`):** guard `if (!demoSeeded)` no início do bloco demo (checa paciente "Gabriel Carvalho Lima" no tenant) — re-run pula criação; testado 2x seguidos (⏭️ pular)
- **Deduplicação (`backend/scripts/dedupe-patients.js`, novo):** grupos por (nome, tenantId) → mantém o registro com mais dados relacionados (desempate: mais antigo) → deleta filhos em ordem segura (ABADataPoint antes de ABAProgram; ConsentLog/WhatsAppLog descobertos via PRAGMA foreign_key_list) → pacientes → responsáveis/escolas órfãs. Descobertos nomes Prisma `aBAAssessment`/`aBAProgram`/`aBADataPoint` (ABAAssessment → camelCase) e `whatsAppLog`/`consentLog`
- **Resultado:** 19 pacientes duplicados + 67 filhos removidos, 20 responsáveis e 8 escolas órfãos limpos → restam **6 pacientes, 6 responsáveis, 3 escolas** (dados reais preservados: 2 agendamentos e waiting-room apontam para o paciente mantido cmsezw1e); API validada (lista 6 únicos com responsável/escola corretos, dashboard 6 pacientes/4 sessões)
- Backup pré-limpeza: `/var/folders/.../opencode/dev-backup-pre-dedupe.db` (restaurar = copiar sobre `backend/prisma/dev.db`)

### 56. Dashboard complementada (cards extras + agenda de hoje + sala de espera + uso do plano + skeletons)
- **Análise:** backend de `/dashboard` já retornava `totalSessoes`/`totalEncaminhamentos` sem uso na UI; faltavam agenda, sala de espera, uso do plano, skeletons e havia fallback com `Math.random()` no gráfico (dados falsos apresentados como reais)
- **Cards (4 → 6):** Pacientes Ativos, Sessões, Documentos Pendentes, Encaminhamentos, Casos Arquivados, Protocolos TEA — layout `xl:grid-cols-6`, todos clicáveis
- **Agenda de hoje:** `GET /appointments?date=YYYY-MM-DD` (exclui CANCELADO, ordenado por horário, top 6 + link "Ver +N") — horário, dot de status, nome, tipo, chip de status; link para `/app/agenda/:id`
- **Sala de espera:** `GET /waiting-room` (filtra CONCLUIDO) — nome, tempo de espera relativo ("há 12 min"), ícone/chip por status; link para a página
- **Uso do plano:** `GET /billing` — nome do plano + vencimento + barras de uso pacientes/profissionais (PRO = "ilimitado" quando max ≥ 1000); botão "Gerenciar assinatura"
- **Skeleton loading** (animate-pulse) em todos os 6 blocos; gráfico com estado de erro + "Tentar novamente" e estado vazio "Sem movimentações financeiras" (sem dados falsos)
- **Header:** saudação com data em pt-BR + link "Ver agenda completa"
- **Validação:** endpoints testados via API real (login sarah@edupsych.com: 25 pacientes, 20 sessões, waiting-room 1, billing PRO ilimitado); `ng build` limpo; ícones novos adicionados ao mapa global de tooltips

### 54. Landing de venda + `POST /auth/register-clinic` (clínica própria com trial)
- **Backend (`lib/tenant.ts`):** `slugifyClinic` (normaliza acentos, minúsculas, hífens) + `generateUniqueSlug` (sufixo numérico em colisão) + `createClinicWithAdmin` — cria Tenant (plan TRIAL, status ATIVO, `trialEndsAt` +14d) + User GESTOR (active false) + Membership + Subscription TRIAL com o mesmo período
- **Backend (`routes/auth.ts`):** `POST /auth/register-clinic` — valida nome/email/senha/clinicName (senha ≥6, email único), reusa o fluxo de ativação por email/WhatsApp (VerificationCode + sendVerificationMessage), retorna `needsVerification` + `tenant` (payload com role GESTOR) — mesma experiência do `register`
- **Frontend login (`login.component.ts`):** bug corrigido junto — a landing mandava `?mode=register` mas o componente **não lia** o queryParam (o form nunca abria em modo registro); agora lê `mode` (abre registro) e `plan` (guarda o plano escolhido). Novo campo **"Nome da Clínica"** obrigatório no registro para papéis profissionais (chama `register-clinic`); papel RESPONSAVEL continua com `register` normal. Pós-login com `plan` → redirect direto para `/app/plano` (antes sempre `/app/dashboard`)
- **Landing (`landing-page.component.ts`):** nova seção **Planos e Preços** (`#planos`) — cards dos 3 planos carregados de `GET /billing/plans` (rota pública, sem auth), preço em BRL (`formatPrice`), features do `plan.features` (JSON), destaque "MAIS POPULAR" no BÁSICO, CTA "Assinar X"/"Começar Grátis" → `/login?mode=register&plan=CODE`; navbar ganhou link "Planos" (desktop + mobile); texto de trial grátis sem cartão
- **Validado via API (backend real):** register-clinic → **403** no login antes de ativar → ativação por código (440791, email fake bloqueado → DEV log sem envio real) → login retorna o tenant novo (TRIAL/ATIVO) → `GET /billing` com subscription TRIAL e `trialEndsAt` +14d; **email duplicado → 400**, **sem clinicName → 400**, **slug colidido → `clinica-fase5-teste-2`**; `tsc --noEmit` e `ng build` limpos; dados de teste removidos (tenant + usuários, via deleção de verificationCode → membership → user → subscription → tenant)
- **Checkout:** a cobrança em si já existe em `/app/plano` (Fase 3/3a — Pix mock / Asaas recorrente); a landing direciona o cliente recém-logado para lá
- **Pendências pós-deploy:** domínio real + HTTPS; pricing com link recorrente Asaas direto na landing quando a conta Asaas de produção existir

### 55. Remoção do Laboratório de Notificações (`DashboardComponent`)
- **Remoção da feature de testes:** removido completamente o card `Laboratório de Notificações` da interface do Dashboard (`dashboard.component.ts`), limpando botões de teste, formulários locais, notificações temporárias e estado em memória (`labNotifications`, `createTestNotification`, `showToast`, `toastMessage`, `toastType`).
- **Validação:** `ng build` limpo sem nenhum aviso/erro de compilação.

---

## Sessão 11/08/2026 (Terça) — Fase 3a: Gateway real Asaas (Pix recorrente)

### 51. Asaas real — customer + subscription PIX mensal + QR Code + webhook assinado
- **`backend/src/lib/asaas.ts` (novo):** client da API Asaas v3 — `getOrCreateCustomer` (dedup por `externalReference=tenantId`), `createSubscription` (`billingType: PIX`, `cycle: MONTHLY`, `nextDueDate` hoje), `getSubscriptionFirstPayment` (`GET /subscriptions/:id/payments`), `getPixQrCode` (`GET /payments/:id/pixQrCode` → `payload` copia-e-cola, `encodedImage` base64, `expirationDate`), `isWebhookAuthorized` (header **`asaas-access-token`** vs `ASAAS_WEBHOOK_TOKEN` — assinatura oficial do Asaas, docs confirmada)
- **`lib/billing.ts`:** `checkoutPlan` modo asaas cria Customer → Subscription → 1ª cobrança → QR; grava `providerId` (id da assinatura), `providerCustomerId`, `providerPaymentId`, `pixCopiaECola`, `pixQrImage`, `pixExpiresAt`. `activateSubscription` estende a partir do `currentPeriodEnd` vigente (renovação não encurta) e limpa dados do PIX. `processWebhookEvent`: `PAYMENT_CONFIRMED/RECEIVED/ANTICIPATED` → ativa; **idempotência por `providerPaymentId`** (mesma cobrança reentregue = ignorar; cobrança nova = renovar +30d); `PAYMENT_OVERDUE` → PENDENTE; assinatura desconhecida não quebra
- **Schema:** `Subscription` + `providerCustomerId`, `providerPaymentId`, `pixQrImage` (nullable); `prisma db push` + schema raiz sincronizado (40 models)
- **Rotas billing:** webhook aceita `X-Billing-Webhook-Token` (dev) **ou** `asaas-access-token` (produção) — **bug corrigido:** `X-Billing-Webhook-Token` não era reconhecido (só `x-webhook-token`/`x-billing-token`); `GET /billing` retorna `provider`; `mock-pay` só com `provider === mock` (400 caso contrário — antes permitia em PENDENTE real)
- **Frontend `/app/plano`:** imagem do QR Code (base64) quando houve, polling de 15s enquanto PENDENTE (ativa sozinha ao confirmar), "Simular pagamento" apenas no modo mock (`isMock` agora usa `provider`, antes usava status PENDENTE — mostrava o botão até para cobrança real)
- **Validado:** modo mock intacto (checkout → mock-pay → webhook 401 sem token / 200 com token); scenario test com assinatura Asaas simulada — confirmação ativa (ATIVA + tenant ATIVO), duplicado ignorado, **renovação mensal estende período (+~30d)** — bug de renovação encontrado no teste (evento novo era tratado como duplicado) e corrigido, overdue → PENDENTE, dados de teste limpos; `tsc --noEmit` e `ng build` limpos
- **Pendências para produção:** criar conta Asaas + chave de API (`ASAAS_API_KEY`), webhook com `authToken` (32-255 chars) apontando para `POST /api/billing/webhook` + `ASAAS_WEBHOOK_TOKEN`, `ASAAS_ENV=prod`; (Fase 3a nota original: "landing de venda" segue na Fase 5)

---

## Sessão 11/08/2026 (Terça) — Fase 4: Deploy na Oracle Free Tier (em preparação)

### 52. Plano de deploy: Postgres de produção + pacote `deploy/` pronto
- **Decisão:** produção com **Postgresql** (container postgres:16 em Docker interno, porta 127.0.0.1:5432, usuário `edupsych`, senha gerada por `openssl rand`); repositório mantém `provider = "sqlite"` no dev — o `setup.sh` troca via `sed` no servidor no primeiro deploy
- **Pacote (`deploy/`):** `provision.sh` (nginx, git, unzip, ca-cert, curl, gnupg, cron, certbot, python3-certbot-nginx, **build-essential+python3** p/ compilar better-sqlite3; **pgloader removido**), `setup.sh` (Mac → servidor: build ng → rsync frontend/backend/migrate → .env → postgres up → swap provider → npm ci → generate → db push → **migração** → seed → build → pm2 → nginx → certbot → evolution → cron backup), `nginx-edupsych.conf`, `evolution-compose.yml`, `postgres-compose.yml`, `backend.env.example`, `backup.sh` (pg_dump + uploads, cron 3h, retém 14)
- **OracLA Free Tier:** tenancy `sa-saopaulo-1`, limite A1 = **2 OCPU/12 GB** (não 4/24); **AD-1 sem capacidade** para `VM.Standard.A1.Flex` ("out of capacity" — mesmo com 1 OCPU/6 GB; só AD-1 disponível, não há seletor de AD) → plano B: retentar fora de pico; alternativa: Hetzner (CAX ARM). Instância AMD existente `instance-20260616-1438` @ `137.131.160.171` (1 GB RAM, gincana 24/7) **não pode ser apagada**; SSH nova instância = `~/.ssh/id_ed25519`
- **Sem domínio ainda:** `DOMAIN=` vazio → nginx no IP (HTTP), certbot depois com domínio

### 53. Migração SQLite→Postgres: pgloader descartado + `deploy/migrate/migrate.js` validado
- **pgloader FALHOU:** datas do Prisma (epoch-ms `1785868323317`) viram `"1785868323317-01-01"` → COPY aborta → ~1 linha/tabela → descartado
- **`deploy/migrate/migrate.js` (novo):** lê `schema.prisma` (parse de campos escalares: String/Int/Float/Boolean/DateTime/Json), converte por linha: DateTime (ms → `Date`), Boolean (0/1 → bool), Json (TEXT → JSON.parse); insere com `ON CONFLICT ("id") DO NOTHING` (idempotente), desabilita FK checks durante a carga + reativa, paddings: colegas com FKs órfãs ficam para último. Modo: `node migrate.js <dev.db> <pg-url> <schema.prisma>`
- **Bug encontrado e corrigido:** regex do parser exigia espaço após o tipo (`(\?)?\s`) → campos sem default no fim da linha (`date DateTime`) não eram parseados → coluna ia cru (ms) → `date/time field value out of range` com valor 1785589200000; corrigido para `(?=\s|$)` (padrão lookahead)
- **Teste real:** container local `edup-test-pg` (postgres:16, porta 5433) + cópia do backend com provider pg (`/tmp/backend-pg-test`) → `prisma db push` + `migrate.js` → **321 linhas em 40/40 tabelas, sem erros**; re-run idempotente (mesmo total, sem duplicar); **backend de teste rodou 100% contra o Postgres:** login OK (sarah@edupsych.com), 25 pacientes, billing PRO ativo com vencimento 10/10/2026, 17 notificações não lidas, waiting-room 200, conversa de chat presente
- **`setup.sh` atualizado:** primeiro deploy = .env → postgres up → swap provider → npm ci → generate → **db push (cria tabelas) → migrate.js** → seed idempotente → build → pm2; `deploy/migrate/` entra no rsync (sem node_modules — `npm ci` no servidor) ; passo pgloader removido
- **Ambiente de teste limpo** (container, `/tmp/backend-pg-test`, `/tmp/migration-test.db`, log)

---

## Sessão 10/08/2026 (Segunda) — Parte 2: SAAS Multi-tenant

### 46. Fase 1 — Scoping das 40+ rotas (isolamento por tenant)
- **Helper `backend/src/lib/tenant.ts`:** `scoped(prisma, tenantId)` devolve um client com `where: { tenantId }` e `data: { tenantId }` injetados; getUserById usa `select`; `TENANT_MODELS` centraliza os ~33 modelos de negócio
- **Todas as rotas de negócio convertidas a usar `scoped(prisma, req.user?.tenantId)`:** pacientes, responsaveis, escolas, dag, laudos, evolucoes, anamnese, sessoes, encaminhamentos, comunicacao, risco, financeiro, nfse, documentos, biblioteca, agenda, espera, aba-protocols, evolution-comparison, protocol-evaluations, planos, diario-sessoes, presencas, documentos-intervencao, lgpd, mensagens, whatsapp, disponibilidade, assinatura (+ helper task-create)
- **Queries por id** usam `where: { id, tenantId }` — registro de outro tenant vira 404 (ou 400 no update via P2025)
- **Globais (sem tenantId no schema):** User, Tenant, Membership, VerificationCode, SocialAccount → `users.ts`/`permissions.ts`/`auth.ts` intocados
- **Intencionalmente não-escopadas:** `reset.ts` (drop) e `document-requests.ts` (rotas públicas por token único, sem auth)
- **Seed atualizado:** resolve/cria o Tenant "Clínica Principal" (slug `clinica-principal`) e cria todos os dados com o client escopado
- **Backfill re-executado** (`backend/src/backfill-tenant.ts`, idempotente): 33 tabelas → tenant principal, 7 memberships, sem órfãos
- **Verificações:** `tsc --noEmit` limpo; runtime OK (login + GET pacientes + GET sessão por id retornam tenantId correto)
- **Teste de isolamento:** `backend/scripts/test-isolation.ts` (ver entrada 47)

### 47. Teste oficial de isolamento entre tenants — EXECUTADO: 16/16 PASS
- Script `backend/scripts/test-isolation.ts` (npm script `test:isolation`; sobe servidor próprio na porta 3999 e limpa tudo ao final)
- Validado via API: POST injeta `tenantId` do A e do B; listas não vazam entre tenants; GET/PUT/DELETE cruzados → 404; A continua vendo/apagando o próprio registro

### 48. Bug latente corrigido — Express 4 não propaga rejeições async
- **Problema descoberto pelo teste de isolamento:** `PUT/DELETE` cruzado em rotas sem try/catch (ex.: `pacientes.ts`) rejeitava o promise do `scoped` e o Express 4 NÃO encaminhava ao errorHandler → cliente ficava esperando resposta para sempre
- **Correção:** `backend/src/lib/async-express.ts` — patch no protótipo do Router (get/post/put/delete/patch/all/use) que envolve cada handler com `Promise.resolve(fn).catch(next)`; carregado via import no topo de `lib/prisma.ts` (avaliado antes de qualquer rota ser definida)
- **Resultado:** erro `{status:404}` do scoped agora chega ao errorHandler → resposta 404 real; cobre todas as rotas, com ou sem try/catch (sem dependência nova)

### 49. Fase 2 — Frontend multi-clínica v1 (seleção + troca de clínica)
- **Backend:**
  - `POST /auth/login` agora retorna `tenants[]` (memberships ativas com tenant: plan/status/logo/role) + `tenant` (default = 1ª clínica não bloqueada)
  - `GET /auth/tenants` (autenticado) — lista atual das clínicas do usuário
  - `POST /auth/select-tenant` — valida membership ativa e retorna o tenant
  - Middleware `authenticate`: aceita header **`X-Tenant-Id`** (se o usuário tem vínculo ativo lá); sem header → primeira membership **não bloqueada** (antes era a primeira, podendo cair em clínica bloqueada com 403 injusto); `req.user.tenant` agora inclui {id, name, slug, plan, status, logoUrl, colors}
- **Frontend:**
  - `AuthService`: signals `tenants`/`tenant` persistidos no localStorage (`auth_tenants`/`auth_tenant`); `selectTenant()` e `refreshTenants()`; login antigo sem tenants auto-recupera via refresh
  - Interceptor envia `X-Tenant-Id` em todas as chamadas `/api/`
  - Login: se o usuário tem **>1 clínica** → vai para nova página `/auth/select-clinic` (cards com logo/nome/plano/status, bloqueadas desabilitadas); senão redirect direto
  - Google OAuth: callback agora busca os tenants via `refreshTenants()` e usa a mesma lógica
  - Header (main-layout e guardian-layout): chip com o nome da clínica atual (logo quando houver) + dropdown para trocar — troca chama `selectTenant` + reload
- **Validado:** login retorna 2 tenants; `GET /tenants` lista as duas; `select-tenant` inválido → 403; validado → tenant; **switch via X-Tenant-Id: clínica principal 5 pacientes → clínica de teste 0 pacientes** (isolamento por header OK); `ng build` limpo
- **Limpeza:** tenant/membership de teste removidos (sarah voltou a ter 1 membership)

### 50. Fase 3 — Billing: planos, trial, limite e assinatura (backend + frontend)
- **Models** (`schema.prisma` + `prisma db push`): `Plan` (code, name, priceCents, maxPacientes, maxProfissionais, trialDays, features) e `Subscription` (tenantId, planId, status `PENDENTE|ATIVA|CANCELADA`, currentPeriodEnd, providerId)
- **Seed:** `TRIAL` R$0 (10 pacientes / 2 profs / 14d), `BASICO` R$149 (100/10), `PRO` R$299 (ilimitado) — Clínica Principal com `PRO` ATIVA
- **`lib/billing.ts`:** `getOrCreateSubscription` cria trial lazy (14d) no 1º login/request; `enforceTenantStatus` (401 assinatura ausente, 403 tenant vencido ⇒ `Tenant.status=BLOQUEADO`, renovação reativa); `getUsage`; `enforcePlanLimits` → 402 "Limite do plano atingido"; `checkoutPlan` (PIX mock com `pixCopiaECola`); `activateSubscription` (+30d via mock-pay)
- **Rotas** `routes/billing.ts`: `GET /billing/plans`, `GET /billing` (status + uso), `POST /billing/checkout`, `POST /billing/mock-pay`, `POST /billing/webhook` (protegida por header `X-Billing-Webhook-Token`; default dev `BILLING_WEBHOOK_TOKEN`); enforcement plugado em `middleware/auth.ts`, `routes/auth.ts` (login), POST `pacientes` e POST `users`
- **REGRESSÃO ENCONTRADA E CORRIGIDA — errorHandler não rodava:** respostas de erro voltavam como HTML default do Express (teste de isolamento só validava status; 404 JSON nunca tinha sido verificado de verdade; `X-Error-Handler` + log em `/tmp/errorhandler.log` provaram que o handler nunca era chamado). **Causa:** o patch `async-express` envolve todo handler com wrapper de 3 parâmetros → Express não reconhece error-middleware (exige `length >= 4`). **Correção:** wrapper agora emite variante de 4 params quando `fn.length >= 4`. **Validado:** `errTest` sync+async 418 JSON, 404 cruzado JSON, 402 limite JSON
- **Frontend:** módulo `src/app/modules/billing/` — página `/app/plano` (plano atual + barras de uso pacientes/profissionais + cards dos 3 planos com preço + PIX copia-e-cola + botão "Simular pagamento" quando PENDENTE + feedback de erro/successo); rota em `app.routes.ts`; item "Plano e Assinatura" (credit_card) no sidebar e breadcrumb do main-layout; `ng build` limpo
- **Validado via API:** checkout TRIAL→BASICO (PENDENTE + 402 no limite de 10/10), mock-pay ATIVA +30d, webhook com/sem token 200/401, login pós-vencimento 403, renovação reativa; teste de isolamento agora também exige corpo JSON nas respostas 404 — 19/19 PASS; tenants temporários `clinica-limite` removidos do banco
- **Pendência (Fase 3a):** trocar `createProviderCheckout`/`processWebhookEvent` (stubs mock) por Pix recorrente real (Asaas/Mercado Pago)

### Backup da conversa
- `session-backup/2026-08-10-multitenant.json` — export completo da sessão atual (`opencode export ses_01440a6a3ffeXFGyzCOLTTJ5UY`)
- `session-backup/2026-08-10-fase0-inicio.json` — sessão anterior (início da Fase 0, models Tenant/Membership)

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
