# Histórico da Sessão e Registro de Continuidade

> **Data da Sessão:** 08 de Outubro de 2026  
> **Status:** Todas as alterações funcionais, testadas e compiladas com sucesso.  
> **Repositório:** `https://github.com/amakurt/clone-psicopedagoga.git` (Branch: `main`)

---

## 📌 1. Resumo das Tarefas Executadas Nesta Sessão

### Implementação Completa: Atendimento Online com IA via WhatsApp (Evolution API + Google Gemini)

#### A. Arquitetura e Decisões de Projeto
- **Assistente Completo de Secretaria**: Triagem de novos pais/pacientes, acolhimento humanizado com linguagem empática, tira-dúvidas institucionais sobre avaliações psicopedagógicas, consulta de horários e pré-agendamento de consultas na agenda (`Appointment`) com status `PENDENTE`.
- **Gateway do WhatsApp**: Conexão nativa com a **Evolution API** via Webhooks para eventos `messages.upsert` e envio via `/message/sendText`.
- **Motor de Inteligência Artificial**: Google Gemini com prompt clínico especializado, diretrizes da clínica, identificação automática do paciente/responsável pelo número de telefone e histórico contextual dos turnos anteriores.
- **Transbordo Inteligente e Pausa Automática (Hand-off)**:
  - Detecção imediata de intenção de atendimento humano (palavras-chave como *"falar com atendente"*, *"humano"*, *"secretária"*).
  - Pausa automática da IA por 4 horas quando a secretária responde à conversa diretamente no WhatsApp Web ou pelo painel, impedindo respostas sobrepostas.

#### B. Banco de Dados & Prisma ORM
- **`WhatsAppConfig` (`backend/prisma/schema.prisma`)**:
  - Adicionados campos `aiEnabled`, `aiPrompt`, `geminiKey`, `autoMuteHours` e `webhookSecret`.
- **`WhatsAppConversation`**:
  - Nova tabela relacionando telefone, paciente/responsável, status (`ACTIVE`, `MUTED_BY_AGENT`, `MUTED_BY_HUMAN`, `CLOSED`), tempo de mute e data da última mensagem.
- **`WhatsAppMessage`**:
  - Registro de mensagens trocadas (`sender: 'USER' | 'AI' | 'HUMAN'`).
- **Isolamento Multi-tenant**:
  - Novos modelos adicionados em `TENANT_MODELS` em `backend/src/lib/tenant.ts`.
- **Sincronização**:
  - `npx prisma db push` e `npx prisma generate` executados com sucesso.

#### C. Backend & Serviços Especializados
- **Serviço de IA (`backend/src/services/whatsapp-ai.service.ts`)**:
  - Vínculo inteligente de número de WhatsApp a registros de `Paciente` e `Responsible`.
  - Consulta de agenda (`Appointment`) e criação automática de pré-agendamentos pendentes sob demanda.
  - Fallback clínico acolhedor mesmo em caso de instabilidade na conexão externa.
- **Rotas de WhatsApp (`backend/src/routes/whatsapp.ts`)**:
  - `POST /api/whatsapp/webhook` e `POST /api/whatsapp/webhook/:instance`: Webhooks públicos para processamento de mensagens da Evolution API em tempo real.
  - `GET /api/whatsapp/conversations`: Listagem de conversas ativas/pausadas com busca e paginação.
  - `GET /api/whatsapp/conversations/:id/messages`: Histórico de mensagens do chat.
  - `POST /api/whatsapp/conversations/:id/toggle-mute`: Pausa e reativação manual da IA.
  - `POST /api/whatsapp/conversations/:id/send`: Envio de mensagem manual pela secretária direto do sistema.

#### D. Frontend & Interface do Usuário (Angular)
- **Serviço (`src/app/modules/whatsapp/services/whatsapp.service.ts`)**:
  - Métodos integrados para consulta de conversas, envio manual e chaveamento de status da IA.
- **Componente (`src/app/modules/whatsapp/pages/whatsapp-config.component.ts`)**:
  - **Aba 1 (Atendimentos & Live Chat)**:
    - Split-view moderna com lista de conversas, badges de status (`🤖 IA Ativa`, `⏸️ Transbordo`, `👤 Humano`).
    - Janela de mensagens com balões estilizados por remetente (`Cliente`, `IA`, `Secretária`).
    - Botão de Pausar/Reativar IA e barra de envio de mensagem manual.
  - **Aba 2 (Configuração & IA)**:
    - Credenciais Evolution API, teste de conexão, switch liga/desliga de IA, horas de auto-mute, campo de prompt clínico e card para copiar a URL do Webhook com 1 clique.
  - **Aba 3 (Lembretes)**:
    - Histórico e status de disparos de lembretes da clínica.

#### E. Validação Técnica
- **Backend Build**: Compilado com sucesso (`tsc`, código 0).
- **Frontend Build**: Bundle Angular gerado com 100% de sucesso (`npx ng build --configuration development`, código 0).
- **Testes Unitários & Integração**: Script de validação `backend/scripts/test-whatsapp-ai.ts` aprovado com persistência real no banco de dados e testes de fluxo.

---

## 🚀 2. Como Rodar no Computador do Trabalho

Ao baixar/clonar o repositório no PC do trabalho:

```bash
# 1. Puxar as últimas alterações
git pull origin main

# 2. Instalar dependências se necessário
npm install
cd backend && npm install && cd ..

# 3. Aplicar migrações do banco de dados (se SQLite novo)
cd backend
npx prisma generate
npx prisma db push
cd ..

# 4. Iniciar servidores de desenvolvimento
# Terminal 1 - Backend:
cd backend
npm run dev

# Terminal 2 - Frontend:
npm start
```

O sistema estará acessível em `http://localhost:4200`.  
Acesse `http://localhost:4200/app/configuracoes/whatsapp` para gerenciar os atendimentos com IA e configurar a Evolution API.
