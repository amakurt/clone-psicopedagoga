# Registro de Sessões - Projeto EduPsych Pro Clone

## Última Atualização: 06 de Agosto de 2026

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

1. Testar todas as 10 funcionalidades competitivas
2. Google OAuth - configurar credenciais reais
3. Deploy em produção
4. Testes E2E completos
