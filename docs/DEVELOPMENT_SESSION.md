# Histórico de Desenvolvimento - Clone Psicopedagoga

## Última Atualização: 04/08/2026

---

## Resumo Geral
Migração completa de um sistema React/Supabase para Angular 18 + Express.js + Prisma + SQLite. Implementação de 10 funcionalidades competitivas, Painel TV para sala de espera e correções críticas.

---

## Fase 1-15: Migração Base (03/08/2026)

### Fase 1: Estrutura Base
- Removido `@prisma/client` do frontend
- Criadas 18 interfaces em `core/models/index.ts`
- Auth com bcrypt + JWT
- Role guard com GESTOR, PSICOPEDAGOGO, SECRETARIA
- Services dedicados: financeiro, comunicacao, configuracoes, users
- Login com validação reativa

### Fase 2: Login Social
- Passport.js + Google OAuth (`src/config/passport.ts`)
- Tabela `social_accounts` no Prisma
- Rotas `GET /auth/google` + `GET /auth/google/callback`
- Componente `AuthCallbackComponent` frontend
- Botão Google no login

### Fase 3: Portal do Responsável
- Backend: rotas guardian (link, dashboard, patients, evolutions, financial, documents, appointments, chat, profile)
- Frontend: módulo Guardian com layout independente, dashboard, evoluções, financeiro, documentos, chat, configurações

### Fase 4: Protocolo TEA
- 200 itens (5 categorias × 4 subcategorias × 10 itens)
- Gráfico radar
- Sidebar com navegação por categorias
- Busca e filtros
- Estatísticas por avaliação

### Fase 5: Planos de Intervenção
- Formulário multi-step (3 etapas: Avaliação, Habilidades, Roteiro)
- Calculadora financeira
- Exportação PDF via html2pdf.js

### Fase 6: Upload de Documentos
- Multer + UUID para filenames
- Rotas: POST /upload, POST /upload/multiple, GET /uploads/:filename, DELETE /uploads/:filename
- Componente drag & drop com preview
- Suporte: PDF, DOCX, XLSX, JPG, PNG, GIF, CSV (10MB max)

### Fase 7: Endereços Separados
- Componente compartilhado `AddressFormComponent` com busca CEP via ViaCEP
- Atualizados: Escola, Paciente, Responsável, Anamnese, Configurações
- Schema Prisma: campos separados (cep, street, neighborhood, number, complement, city, state)

### Fase 8: Telefone com Máscara e WhatsApp
- Componente compartilhado `PhoneInputComponent`
- Máscara automática: `(00) 00000-0000`
- Checkbox WhatsApp ao lado
- Atualizados: Escola, Paciente, Responsável, Configurações

### Fase 9: Níveis de Ensino Multi-seleção
- Checkboxes para selecionar múltiplos níveis
- Opções: Educação Infantil, Anos Iniciais, Anos Finais, Ensino Médio, Superior, Profissionalizante
- Salva como JSON array no banco

### Fase 10: Busca e Cadastro Rápido
- **Paciente → Responsável**: campo de busca com dropdown + modal para novo responsável
- **Responsável → Paciente**: seção "Pacientes Vinculados" + modal para novo paciente

### Fase 11: Dados de Teste (03/08/2026)
- Cadastrados 2 responsáveis fictícios
- Cadastrados 2 pacientes fictícios vinculados aos responsáveis
- Credenciais: admin@test.com / 123456

### Fase 12: Dashboard - Cards Clicáveis
- Cards do dashboard convertidos de `<div>` para `<button>`
- Navegação para módulos relacionados
- Efeito hover com `hover:-translate-y-1`

### Fase 13: Documentos Clínicos (03/08/2026)
- **Diário de Sessões**: Formulário + preview + export PDF
- **Ficha de Frequência**: Formulário + horários + export PDF
- **Plano de Intervenção**: Multi-step (3 passos) + cálculos financeiros + export PDF
- Novas tabelas no Prisma: SessionDiary, FrequencySheet, InterventionDocument
- Rotas CRUD: /api/session-diaries, /api/frequency-sheets, /api/intervention-documents

### Fase 14: Correção - Protocolo TEA - professionalId
- Corrigido bug: `professionalId` vazio causava erro de foreign key
- Solução: Injetar AuthService para obter ID do usuário logado

### Fase 15: Correção CRÍTICA - Protocolo TEA - evaluations signal
- **Bug:** Ao editar avaliação, apenas 2 itens apareciam quando todos foram preenchidos
- **Causa raiz:** `evaluations` era um objeto plain
- **Correcao:** Convertido para `signal<Record<string, number>>({})`

---

## Fase 16-25: 10 Funcionalidades Competitivas (04/08/2026)

### Fase 16: Integração WhatsApp (Lembretes Automáticos)
- **Rota:** `/app/whatsapp`
- **Backend:** `GET/POST/DELETE /api/whatsapp-logs`
- **Frontend:** `whatsapp-config.component.ts`, `whatsapp.service.ts`
- **Funcionalidade:** Envio de lembretes de agendamento via WhatsApp
- **Configurações:** URL do servidor, token API, mensagem personalizada

### Fase 17: Assinatura Digital em Documentos
- **Componente:** `digital-signature.component.ts`, `signature-modal.component.ts`
- **Backend:** `GET/POST /api/signatures`
- **Funcionalidade:** Canvas para assinatura digital em laudos e documentos
- **Exportação:** PNG da assinatura salva no documento

### Fase 18: Protocolos ABA (ABLLS-R, VB-MAPP, Denver)
- **Rota:** `/app/protocolos-aba`
- **Frontend:** `aba-assessment.component.ts`, `aba-programs.component.ts`
- **Dados:**
  - `ablls-r.ts`: 15 áreas, 165 habilidades
  - `vb-mapp.ts`: 105 marcos de desenvolvimento
  - `denver.ts`: 100 itens de avaliação
- **Funcionalidade:** Avaliação completa com gráficos de radar, exportação PDF

### Fase 19: Gráficos Comparativos de Evolução
- **Rota:** `/app/evolucoes/comparar`
- **Frontend:** `evolucao-comparativa.component.ts`
- **Backend:** `GET /api/evolution-comparison`
- **Funcionalidade:** Comparação lado a lado entre dois períodos de avaliação

### Fase 20: LGPD - Consentimento Digital
- **Rota:** `/app/lgpd`
- **Frontend:** `consent-form.component.ts`, `consent-log.component.ts`
- **Backend:** `GET/POST /api/consents`
- **Funcionalidade:** Termos de consentimento digital, registro de consentimentos

### Fase 21: Multi-profissional com Permissões
- **Rota:** `/app/usuarios/permissoes`
- **Frontend:** `user-permissions.component.ts`
- **Backend:** `GET/POST /api/permissions`
- **Funcionalidade:** Matrix de permissões por perfil (ADMIN, GESTOR, PROFISSIONAL, etc.)

### Fase 22: NFS-e Integrada
- **Rota:** `/app/financeiro/nfse`
- **Frontend:** `nfse.component.ts`
- **Backend:** `GET/POST /api/nfse`
- **Funcionalidade:** Emissão de notas fiscais, geração PDF, status de envio

### Fase 23: Sala de Espera Virtual
- **Rota:** `/app/agenda/sala-espera`
- **Frontend:** `sala-espera.component.ts`
- **Backend:** `GET/POST/PUT/DELETE /api/waiting-room`
- **Funcionalidade:** Check-in, fila de atendimento, chamada de pacientes

### Fase 24: Portal do Responsável - Melhorias
- **Rota:** `/guardian`
- **Frontend:** `guardian-appointments.component.ts`
- **Funcionalidade:** Agendamentos, resumo de sessões, download de documentos

### Fase 25: IA para Sugestão de Planos de Intervenção
- **Rota:** `/app/planos/ia`
- **Frontend:** `plano-ai.component.ts`
- **Backend:** `GET /api/ai-suggestions`
- **Funcionalidade:** Motor rule-based para sugestão automática de planos TEA/ABA

---

## Fase 26: Painel TV - Sala de Espera (04/08/2026)

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

## Stack Utilizada

### Frontend
- Angular 18
- Angular Material
- Tailwind CSS
- html2pdf.js
- Chart.js (gráfico radar + bar + line)

### Backend
- Express.js + TypeScript
- Prisma ORM (25+ models)
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

### Config
- `backend/src/routes/upload.ts` - Rotas de upload
- `backend/src/config/passport.ts` - Google OAuth
- `backend/src/routes/guardian.ts` - Portal do responsável
- `backend/src/routes/session-diaries.ts` - Diário de sessões
- `backend/src/routes/frequency-sheets.ts` - Fichas de frequência
- `backend/src/routes/intervention-documents.ts` - Planos de intervenção
- `backend/src/seed.ts` - Seed do banco
- `backend/prisma/schema.prisma` - Schema do banco (25+ models)

### Frontend
- `src/app/modules/protocolos/pages/protocolo-form.component.ts` - Protocolo TEA
- `src/app/modules/documentos-clinicos/` - Módulo de documentos clínicos
- `src/app/modules/whatsapp/` - Integração WhatsApp
- `src/app/modules/protocolos-aba/` - Protocolos ABA
- `src/app/modules/lgpd/` - LGPD consentimento
- `src/app/modules/agenda/pages/tv-sala-espera.component.ts` - Painel TV sala de espera
- `src/app/shared/components/digital-signature.component.ts` - Assinatura digital
- `src/app/shared/components/signature-modal.component.ts` - Modal de assinatura
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

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000
- **Painel TV:** http://localhost:4200/app/agenda/tv
