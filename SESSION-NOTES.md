# EduPsych Pro - Clone Angular Session Notes

## Data: 05/08/2026 (Atualizado)

## Status: 100% Implementado + 10 Funcionalidades Competitivas + Painel TV + Correções de Rotas

---

## Sessão 05/08/2026

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

### 4. Testes de endpoints
- Todos os endpoints testados com sucesso (login, dashboard, pacientes, ABA, waiting-room, consents, nfse, permissions, evolution/compare, guardian, ai-suggestions)

### 5. Ambiente (fora do repo)
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
