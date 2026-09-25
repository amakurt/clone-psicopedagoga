# Plano de Implementação: Painel do Superadmin (Master SaaS)

## 🎯 Objetivo
Implementar o Painel de Controle Master do SaaS (`/master`) para o Superadmin (Dono do SaaS), permitindo a gestão centralizada, visualização de métricas de receita (MRR), auditoria de uso e controle operacional de todas as clínicas cadastradas no **EduPsych Pro**.

---

## 🏗️ Arquitetura e Decisões Técnicas

### 1. Autenticação e Permissão
- **Papel de Acesso**: Adicionar papel `SUPERADMIN` no sistema.
- **Middleware**: Criar middleware `authorizeSuperAdmin` no backend que valida se o usuário possui `role === 'SUPERADMIN'`.
- **Rota no Frontend**: Rota protegida `/master` com guard `superAdminGuard`.
- **Menu**: Link especial "Painel Master" (ícone `shield_person`) exibido no sidebar do sistema exclusivamente quando o usuário logado for `SUPERADMIN`.
- **Comando de Promoção**: Script CLI ou rota segura para definir/promover o primeiro usuário a `SUPERADMIN` via linha de comando (`node backend/scripts/promote-superadmin.js <email>`).

### 2. Backend API (`backend/src/routes/superadmin.ts`)
- `GET /api/superadmin/stats`:
  - Total de clínicas (Total, Ativas, Em Trial, Bloqueadas).
  - Total de pacientes cadastrados na plataforma.
  - Total de profissionais cadastrados.
  - MRR Estimado (Faturamento Recorrente Mensal baseado nos planos ativos).
- `GET /api/superadmin/tenants`:
  - Listagem com busca (nome, slug, email) e paginação.
  - Agregações por clínica: contagem de pacientes, profissionais (memberships), sessões e data da última atividade.
  - Detalhes de assinatura: Plano atual, status (`ATIVO` / `BLOQUEADO`), data de expiração do trial / vencimento.
- `PATCH /api/superadmin/tenants/:id/status`:
  - Alternar status da clínica entre `ATIVO` e `BLOQUEADO` (com revogação imediata de sessões se bloqueado).
- `PATCH /api/superadmin/tenants/:id/trial`:
  - Prorrogar dias de Trial (+7, +14, +30 dias ou data customizada).
- `PATCH /api/superadmin/tenants/:id/plan`:
  - Alterar plano manualmente (`TRIAL`, `BASICO`, `PRO`, `VIP Vitalício`).
- `POST /api/superadmin/tenants/:id/impersonate`:
  - Gerar token JWT temporário de impersonação da clínica alvo com claim `isImpersonated: true`, permitindo ao Superadmin navegar no sistema exatamente como o Gestor daquela clínica para suporte técnico.

### 3. Frontend Angular (`/master`)
- **Layout Exclusivo e Profissional**:
  - Estética refinada com gradientes Slate, Teal e Cyan (sem tons roxos genéricos).
  - Header com indicador de status de Administrador Master e botão de retorno rápido.
- **Cockpit de Métricas (KPIs do SaaS)**:
  - Card 1: Total de Clínicas (com badge de Ativas vs Bloqueadas).
  - Card 2: Clínicas em Trial Ativo.
  - Card 3: MRR Estimado (R$/mês) e projeção.
  - Card 4: Volume Total de Pacientes e Atendimentos na Rede.
- **Tabela / Cards Responsivos de Clínicas**:
  - Campo de busca em tempo real com filtros por Status e Plano.
  - Visualização em tabela rica para desktop (`min-w-[800px] overflow-x-auto`) e cards verticais ergonômicos para mobile.
  - Ações rápidas por clínica:
    - 🔒 **Bloquear / Desbloquear Acesso** (com modal de confirmação e Toast).
    - ⏳ **Prorrogar Trial** (+7, +14, +30 dias).
    - ⭐ **Mudar Plano** (dropdown / modal seletor).
    - 👤 **Entrar como a Clínica (Modo Suporte)**.
- **Banner Flutuante de Modo Suporte (Impersonate)**:
  - Quando em modo suporte, exibir banner fixo no topo da aplicação:
    *"🔧 Modo Suporte: Conectado na clínica [Nome da Clínica] — [Sair do Modo Suporte]"*
  - O botão "Sair" restaura imediatamente a sessão do Superadmin e retorna para `/master`.

---

## 📋 Fases de Execução

### Fase 1: Backend & Segurança
- [ ] Criar script seguro para promover usuário a `SUPERADMIN` (`promote-superadmin.js`).
- [ ] Implementar middleware `superAdminGuard` em `backend/src/middleware/auth.ts`.
- [ ] Criar `backend/src/routes/superadmin.ts` com todos os endpoints (`/stats`, `/tenants`, `/status`, `/trial`, `/plan`, `/impersonate`).
- [ ] Registrar nova rota em `backend/src/index.ts`.
- [ ] Validar compilação do TypeScript no backend (`npm run build --prefix backend`).

### Fase 2: Frontend & Serviços
- [ ] Criar serviço `SuperAdminService` em `src/app/core/services/superadmin.service.ts`.
- [ ] Implementar guard de rota `superAdminGuard` em `src/app/core/guards/superadmin.guard.ts`.
- [ ] Adicionar suporte a token de suporte/impersonate no `AuthService` com persistência segura de retorno.

### Fase 3: Interface do Painel Master
- [ ] Criar componente do Painel Master `SuperAdminComponent` em `src/app/modules/superadmin/pages/superadmin-dashboard.component.ts`.
- [ ] Adicionar cards de KPI (Clínicas, Trial, MRR, Pacientes).
- [ ] Implementar tabela desktop e cards móveis com ações (Bloquear, Trial, Plano, Impersonate).
- [ ] Criar componente do Banner de Impersonação para ser exibido globalmente quando ativo.
- [ ] Adicionar link "Painel Master" no sidebar para usuários com permissão `SUPERADMIN`.
- [ ] Configurar rotas em `src/app/app.routes.ts`.

### Fase 4: Testes, Auditoria e Validação
- [ ] Testar fluxo completo de bloqueio e desbloqueio.
- [ ] Testar extensão de trial e troca de plano.
- [ ] Testar fluxo de suporte/impersonação e retorno ao painel master.
- [ ] Validar build do Angular (`npx ng build --configuration=development`).
- [ ] Executar auditoria de segurança das novas rotas.
