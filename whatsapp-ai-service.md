# Plano de Implementação: Atendimento Online com IA via WhatsApp (Evolution API + Gemini)

## Visão Geral
Implementar atendimento automatizado inteligente via WhatsApp para a clínica, integrando **Evolution API** (Webhooks e envio de mensagens) com o **Google Gemini** para triagem, tira-dúvidas institucionais, consulta de horários e pré-agendamento de consultas com transbordo humano seguro.

---

## Decisões Arquiteturais Validadas
1. **Papel da IA**: Assistente Completo de Secretaria (Triagem de novos pacientes + acolhimento + consulta de horários + pré-agendamentos).
2. **Gateway WhatsApp**: Evolution API (recepção de eventos via Webhook e envio via `/message/sendText`).
3. **Provedor de IA**: Google Gemini (Flash) com contexto clínico, prompt de recepção humanizada e dados da clínica.
4. **Transbordo Humano (Hand-off)**: Quando o responsável pede para falar com atendente ou quando a secretária envia mensagem na conversa, a IA entra em pausa temporária configurável (ex: 4h) para evitar interrupções.
5. **Autonomia de Agendamento**: A IA consulta a agenda e registra novos agendamentos com status `PENDENTE`, notificando a recepção para validação final.

---

## Fases de Execução

### Fase 1: Modelagem de Dados no Prisma (Database)
- [ ] Atualizar `backend/prisma/schema.prisma`:
  - Expandir `WhatsAppConfig`: adicionar `aiEnabled` (Boolean), `aiPrompt` (String?), `geminiKey` (String?), `autoMuteHours` (Int @default(4)), `webhookSecret` (String?).
  - Criar `WhatsAppConversation`: id, tenantId, phone, contactName, status (`ACTIVE`, `MUTED_BY_AGENT`, `MUTED_BY_HUMAN`, `CLOSED`), `mutedUntil` (DateTime?), `pacienteId` (String?), `lastMessageAt` (DateTime).
  - Criar `WhatsAppMessage`: id, conversationId, tenantId, sender (`USER`, `AI`, `HUMAN`), message (String), messageId (String?), createdAt.
- [ ] Executar `npx prisma db push` e `npx prisma generate`.
- **Verificação**: Prisma Client atualizado com os novos modelos sem erros de tipagem.

### Fase 2: Motor de IA e Raciocínio Clínico de Recepção (Backend)
- [ ] Criar serviço `backend/src/services/whatsapp-ai.service.ts`:
  - Montagem de prompt do sistema para recepção clínica humanizada (acolhimento, especialidades da clínica, regras de horários, valores aproximados, empatia com os pais).
  - Consulta contextual: busca se o telefone pertence a um paciente/responsável existente no tenant.
  - Verificação de intenções:
    - *Transbordo*: Se solicitou atendente humano, retorna mensagem de transbordo e sinaliza `mute`.
    - *Agendamento*: Consulta horários livres na tabela `Appointment` e gera registro `PENDENTE`.
    - *Dúvidas/Triagem*: Responde com acolhimento baseado nas diretrizes da clínica.
  - Chamada ao Gemini com histórico das últimas 8 mensagens da conversa.
- **Verificação**: Teste unitário/simulado do motor com prompt e retorno estruturado.

### Fase 3: Webhook da Evolution API e Roteamento de Mensagens (Backend)
- [ ] Atualizar `backend/src/routes/whatsapp.ts`:
  - Adicionar rota pública (sem auth JWT de usuário, com validação de secret/instância): `POST /api/whatsapp/webhook`.
  - Processamento do evento `messages.upsert`:
    - Filtrar mensagens de status/grupos.
    - Se `fromMe === true`: marcar conversa como `MUTED_BY_HUMAN` (secretária respondeu).
    - Se `fromMe === false`: obter ou criar `WhatsAppConversation`. Verificar se `status` está ativo e `mutedUntil` expirado.
    - Se IA ativa: disparar `processWhatsAppAIMessage()` e enviar resposta via `sendWhatsAppMessage()`.
  - Adicionar rotas autenticadas para gerenciamento de conversas:
    - `GET /api/whatsapp/conversations` (listar conversas e status).
    - `GET /api/whatsapp/conversations/:id/messages` (ver histórico do chat).
    - `POST /api/whatsapp/conversations/:id/toggle-mute` (secretária pausar/despausar IA manualmente).
- **Verificação**: `npm run build` no backend com compilação bem-sucedida.

### Fase 4: Interface do Usuário no Frontend (Angular)
- [ ] Expandir tela de configuração `src/app/modules/whatsapp/pages/whatsapp-config.component.ts`:
  - Seção "Atendimento com Inteligência Artificial":
    - Switch liga/desliga da IA.
    - Campo para URL do Webhook a ser colada na Evolution API (`https://suaclinica.../api/whatsapp/webhook`).
    - Campo do Prompt de Atendimento (personalização do tom de voz e regras da clínica).
    - Tempo de pausa automática após resposta humana (horas).
    - Chave Gemini (opcional, fallback para a global).
  - Aba ou seção "Conversas do WhatsApp":
    - Lista de chats recentes com status visual (🤖 IA Ativa / 👤 Pausada / ⏸️ Mute).
    - Botão de Pausar/Reativar IA por conversa.
    - Visualizador de histórico de mensagens trocadas.
- [ ] Atualizar `src/app/modules/whatsapp/services/whatsapp.service.ts` com os novos métodos.
- **Verificação**: `npx ng build --configuration development` com 0 erros de compilação.

### Fase 5: Validação E2E, Teste de Webhook & Checklist
- [ ] Testar simulação de webhook com payload da Evolution API (`POST /api/whatsapp/webhook`).
- [ ] Validar resposta gerada pela IA, registro no banco e envio simulado.
- [ ] Testar transbordo e pausa automática.
- [ ] Atualizar `SESSION_LOG.md` e realizar commit git.
