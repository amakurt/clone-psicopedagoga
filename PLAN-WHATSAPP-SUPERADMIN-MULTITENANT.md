# Plano de Implementação: Evolution API Multi-Tenant no Painel do Superadmin

## 🎯 Objetivo
Integrar o controle da **Evolution API** diretamente no **Painel do Superadmin (`/master`)**, permitindo o gerenciamento centralizado de instâncias de WhatsApp por clínica (Multi-Tenant nativo), provisionamento automático para planos **PRO e VIP**, visualização de QR Code na tela (tanto para o Superadmin quanto para a Clínica), e desconexão automática em caso de bloqueio ou rebaixamento de plano.

---

## 🏗️ Decisões Técnicas Alinhadas com o Usuário

1. **Acesso ao QR Code**: Ambos podem visualizar e escanear (Superadmin no `/master` e a própria clínica em `/app/whatsapp`).
2. **Provisionamento de Instância**: Automático quando a clínica estiver nos planos autorizados.
3. **Planos Permitidos**: Exclusivo para planos **`PRO`** e **`VIP`**.
4. **Downgrade / Bloqueio**: Se a clínica mudar para `BASICO` ou for `BLOQUEADO`, a instância na Evolution API é desconectada/pausada automaticamente, preservando o histórico de mensagens no banco de dados.

---

## 📋 Arquitetura das Fases

### Fase 1: Serviços Backend da Evolution API & Multi-Tenant
- Adicionar funções de integração no `backend/src/services/whatsapp-client.service.ts`:
  - `checkEvolutionHealth()`: verifica conexão na porta 8080.
  - `createEvolutionInstance(instanceName, webhookUrl)`: cria a instância com webhook configurado.
  - `getEvolutionInstanceStatus(instanceName)`: retorna estado (`open`, `close`, `connecting`).
  - `getEvolutionQrCode(instanceName)`: obtém base64 e code para pareamento.
  - `restartEvolutionInstance(instanceName)`: reinicia a instância.
  - `logoutEvolutionInstance(instanceName)`: desconecta a instância.
- Implementar verificação de elegibilidade de plano (`isPlanWhatsAppEligible(plan)`: PRO ou VIP).

### Fase 2: Rotas de Superadmin & Automação de Planos
- Em `backend/src/routes/superadmin.ts`:
  - `GET /api/superadmin/whatsapp/status`: Saúde do servidor Evolution API e resumo de instâncias.
  - `GET /api/superadmin/whatsapp/instances`: Listagem consolidada de tenants com plano, status de instância, telefone e última atividade.
  - `POST /api/superadmin/whatsapp/instances/:tenantId/provision`: Criar/provisionar instância sob demanda ou manual.
  - `GET /api/superadmin/whatsapp/instances/:tenantId/qrcode`: Buscar QR Code da instância do tenant.
  - `POST /api/superadmin/whatsapp/instances/:tenantId/restart`: Reiniciar instância do tenant.
  - `POST /api/superadmin/whatsapp/instances/:tenantId/disconnect`: Desconectar número da clínica.
- No endpoint `PATCH /api/superadmin/tenants/:id/plan` e `PATCH /api/superadmin/tenants/:id/status`:
  - Se alterado para PRO/VIP: provisiona automaticamente a instância caso não exista.
  - Se alterado para BASICO/TRIAL ou bloqueado: desconecta a instância no Evolution API.

### Fase 3: Validação de Plano e QR Code na Área da Clínica
- Em `backend/src/routes/whatsapp.ts`:
  - Verificar se o tenant logado possui plano PRO ou VIP.
  - Adicionar rota para a clínica obter seu próprio QR Code: `GET /api/whatsapp/qrcode`.
  - Permitir reiniciar sua própria instância: `POST /api/whatsapp/restart`.
- Em `src/app/modules/whatsapp/pages/whatsapp-config.component.ts`:
  - Se o plano não for PRO/VIP: exibir banner de bloqueio informando que o módulo WhatsApp está disponível nos planos PRO e VIP.
  - Se for PRO/VIP: exibir visualizador de QR Code integrado com atualização automática de status de pareamento.

### Fase 4: Interface do Painel Superadmin (`/master`)
- Em `src/app/core/services/superadmin.service.ts`:
  - Adicionar chamadas da API para o gateway e instâncias de WhatsApp.
- Em `src/app/modules/superadmin/pages/superadmin-dashboard.component.ts`:
  - Adicionar aba **"WhatsApp Multi-Clínica"**.
  - Monitor de status da Evolution API (online/offline, latência, versão).
  - Tabela rica e responsiva com todas as clínicas, plano, status da instância, telefone conectado e ações (Provisionar, QR Code, Reiniciar, Desconectar).
  - Modal com exibição de QR Code em tempo real.
  - Botão de atalho para o Evolution Manager nativo (`/manager`).

### Fase 5: Testes Automatizados e Validação
- Testar endpoints via script CLI.
- Validar builds do backend e frontend Angular.
