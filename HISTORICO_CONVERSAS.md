# Histórico de Conversas e Sessões - EduPsych Pro Clone

> **Repositório:** `https://github.com/amakurt/clone-psicopedagoga.git`  
> **Branch Principal:** `main`  
> **Última Atualização:** 04 de Novembro de 2026

---

## 📌 Sumário Executivo

Este documento consolida o histórico cronológico de conversas, decisões técnicas, arquitetura implementada e procedimentos de teste do projeto **EduPsych Pro Clone**.

---

## 💬 Sessão 81: 04 de Novembro de 2026

### 1. Interação do Usuário: Correção de Rota ao Adicionar Atalho à Tela de Início no iPhone
- **Solicitação do Usuário:**  
  *"Quando vou adicionar pelo safari no iphone pra ficar como aplicativo na tela dde inicio como favorito não está indo pra tela de login logo, vai primeiro pra landpage"*
- **Decisões & Implementações:**
  - **Identificação da Causa:** Manifestos PWA apontavam `start_url: "/"` e rota vazia apontava incondicionalmente para `LandingPageComponent`.
  - **Criação do `rootGuard`:** Verifica se o acesso é feito por aplicativo standalone (iPhone Tela de Início / PWA) ou pelo subdomínio `app.edupsychpro.tech`. Caso positivo, redireciona para `/app/dashboard` (se logado) ou `/login` (se deslogado), sem exibir a landing page.
  - **Ajuste de Manifestos:** `start_url: "/app"`, `scope: "/"` e `<meta name="apple-mobile-web-app-title">`.
  - **LoginComponent:** Usuários com sessão ativa não veem formulário de login e são encaminhados diretamente ao dashboard.

---

## 💬 Sessão 80: 03 de Novembro de 2026

### 1. Interação do Usuário: Configuração de Chave de IA Própria por Clínica & Unificação dos Módulos
- **Solicitação do Usuário:**  
  *"Não encontrei esse caminho da opção B e outra coisa Ideal pra não gastar meu limite seria pedir pra profissional criar um api key propria"* / *"Shoow de bola, essa chave serve para os demais locais do sistema que precisam de IA? se sim já podemos configurar também"*
- **Decisões & Implementações:**
  - **Isolamento de Cota de IA:** Removido o fallback automático para a chave mestra ou global do SaaS. Cada clínica opera com sua própria chave gratuita da Google (1.500 leituras/dia grátis sem cartão de crédito).
  - **Unificação para Todos os Módulos de IA:** A mesma chave agora alimenta automaticamente:
    1. **Digitalizador de Fichas (OCR):** Pacientes e Anamneses impressas ou manuscritas.
    2. **Gerador de Planos de Intervenção:** Metas SMART e estratégias ABA/TEA (`/ai-suggestions/plan-suggestion`).
    3. **Gerador de PEI:** Plano Educacional Individualizado (`/ai-suggestions/generate-pei`).
    4. **Assistente Virtual do WhatsApp:** Atendimento e agendamento para pais (`whatsapp-ai.service.ts`).
  - **Assistente na Modal de Escaneamento (`app-ficha-scanner-modal`):** Fluxo direto de 2 passos com link para Google AI Studio e campo com two-way binding corrigido.
  - **Nova Aba em Configurações (`/app/configuracoes`):** Aba "Inteligência Artificial (Google Gemini)" para gerenciar a chave da clínica a qualquer momento.
  - **Validação:** Backend e frontend compilados com 100% de sucesso.

---

## 💬 Sessão Atual: 08 de Outubro de 2026

### 1. Interação do Usuário: Sincronização Inicial e Leitura de Sessão
- **Solicitação do Usuário:**  
  *"boa noite, puxe o ultimo comit que foi feito logo apos leia o aruivo de sessão e nosso histórico de conversas pra continuarmos"*
- **Ações Realizadas:**
  - Executado `git pull origin main`, aplicando *fast-forward* de 34 commits.
  - Sincronizado o schema do Prisma com `npx prisma generate` no backend.
  - Realizada verificação estática de TypeScript (`npx tsc --noEmit`), concluída com 0 erros.
  - Leitura integral de `SESSION_LOG.md` e `SESSION_NOTES.md`.
  - Apresentado resumo detalhado das implementações recentes:
    - Sessão 61: Engines dedicadas dos Jogos Cognitivos 27, 29 (TMT arrastar e conectar) e 30 (Memória Operacional).
    - Módulo de Atendimento com IA via WhatsApp (Evolution API + Google Gemini).

---

### 2. Interação do Usuário: Subida dos Servidores para Teste
- **Solicitação do Usuário:**  
  *"coloque o sistema no ar pra teste"*
- **Ações Realizadas:**
  - Verificação de portas locais (3000, 4200 livres).
  - Inicialização do servidor Backend Express na porta `3000` via processo em segundo plano (`npm run dev`).
  - Inicialização do Frontend Angular 18 na porta `4200` via processo em segundo plano (`npm start`).
  - Verificação de conectividade HTTP:
    - Frontend respondendo em `http://localhost:4200/` com bundle completo gerado.
    - Backend respondendo em `http://localhost:3000/api/` e autenticação testada com sucesso para `sarah@edupsych.com`.
  - Fornecidas ao usuário as URLs de acesso e credenciais de teste (`sarah@edupsych.com` / `admin@test.com`).

---

### 3. Interação do Usuário: Testes do Módulo de WhatsApp
- **Solicitação do Usuário:**  
  *"como podemos testar o whatsaap"*
- **Diagnóstico e Correções Técnicas Aplicadas:**
  - **Correção dos Modelos Gemini:** Atualizada a lista de modelos em `backend/src/services/whatsapp-ai.service.ts` para suportar as versões ativas do Google Gemini (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`), resolvendo o erro 404 de modelos legados.
  - **Resiliência do Webhook:** Em `backend/src/routes/whatsapp.ts`, o despacho para instâncias externas da Evolution API foi protegido com `try/catch`. Dessa forma, mesmo em ambientes de desenvolvimento ou sem instância Evolution configurada, a mensagem é processada pela IA e salva no banco de dados SQLite com exibição imediata no painel.
  - **Script de Validação:** Adicionado `import 'dotenv/config'` em `backend/scripts/test-whatsapp-ai.ts`.
- **Roteiro de Testes Entregue ao Usuário:**
  - **Opção 1 (Interface Web):** Acesso em `http://localhost:4200/app/configuracoes/whatsapp` para ver a aba *Atendimentos & Live Chat*, balões de mensagem de IA e Cliente, botão de pausa/transbordo e configurações.
  - **Opção 2 (Simulação de Webhook):** Script PowerShell para simular envio de mensagem de um pai/mãe pelo WhatsApp e receber a resposta imediata da IA.
  - **Opção 3 (Script Automatizado):** Execução de `npx tsx scripts/test-whatsapp-ai.ts` no backend cobrindo os 3 cenários clínicos.
  - **Opção 4 (Ambiente Real):** Apontamento do Webhook da Evolution API para `https://seu-dominio/api/whatsapp/webhook`.

---

### 4. Interação do Usuário: Registro de Sessão e Publicação no GitHub
- **Solicitação do Usuário:**  
  *"salvar sessão historico de conversas e mandar tudo para o github"*
- **Ações Realizadas:**
  - Atualizado `SESSION_LOG.md` com o registro da Sessão 62.
  - Atualizado `SESSION_NOTES.md` com o status e instruções vigentes.
  - Criado este arquivo `HISTORICO_CONVERSAS.md` documentando o ciclo completo.
  - Commit semântico e envio para o repositório remoto via `git push origin main`.

---

## 💬 Sessão: 19 de Outubro de 2026

### 1. Interação do Usuário: Auditoria, Avaliação de Necessidades e Segurança
- **Solicitação do Usuário:**  
  *"você que está comigo nesse desenvolvimento a tanto tempo o que acha? falta algo? tem coisas sem necessidades e como. tá a segurança do sistema? (...) faça os três na mesma ordem sugerida"*
- **Ações Realizadas:**
  - **Passo 1 (Limpeza):**
    - Remoção da pasta `session-backup/` do rastreamento do Git (`git rm -r --cached session-backup`), eliminando 23 JSONs legados com dados de histórico.
    - Atualização do `.gitignore` bloqueando pastas de backup e notas temporárias.
    - Remoção do arquivo duplicado `SESSION-NOTES.md` em favor do `SESSION_LOG.md`.
  - **Passo 2 (Segurança & Uploads):**
    - Configuração de `trust proxy` no Express para detecção correta de IP sob Nginx/VPS.
    - Validação de *Magic Bytes* (assinatura binária) em `backend/src/routes/upload.ts` cobrindo PDFs, imagens (PNG/JPEG/GIF/WebP) e documentos Office/CSV.
    - Correção de 8 vulnerabilidades via `npm audit fix` no backend.
    - Correção de tipagem em `backend/src/routes/superadmin.ts`.
  - **Passo 3 (Dual-Engine SQLite & PostgreSQL):**
    - Criação de `backend/prisma/schema.sqlite.prisma` e alinhamento com `schema.postgres.prisma`.
    - Novos scripts no `package.json` (`npm run db:sqlite`, `npm run db:postgres`, `npm run db:push:sqlite`, `npm run db:push:postgres`).
    - Validação dos 19 testes de isolamento multi-tenant (`test:isolation`) e 6/6 de superadmin (`test:superadmin`).
    - Compilação do Backend e Frontend com 100% de sucesso.

---

## 🛠️ Arquitetura e Modelos de Dados do WhatsApp

### Tabelas Criadas / Atualizadas no Prisma (`backend/prisma/schema.prisma`):
- `WhatsAppConfig`:
  - `apiUrl`, `token`, `phoneNumberId`
  - `aiEnabled` (Boolean)
  - `aiPrompt` (String?)
  - `geminiKey` (String?)
  - `autoMuteHours` (Int @default(4))
  - `webhookSecret` (String?)
- `WhatsAppConversation`:
  - `phone`, `contactName`
  - `status` (`ACTIVE` | `MUTED_BY_AGENT` | `MUTED_BY_HUMAN` | `CLOSED`)
  - `mutedUntil` (DateTime?)
  - `pacienteId`, `responsibleId`
  - `lastMessageAt`
- `WhatsAppMessage`:
  - `sender` (`USER` | `AI` | `HUMAN`)
  - `message` (String)
  - `messageId` (String?)
  - `conversationId`, `tenantId`, `createdAt`

---

## 💬 Sessão: 26 de Outubro de 2026

### 1. Interação do Usuário: Recuperação Pós-Queda de Energia & Subida dos Servidores
- **Solicitação do Usuário:**  
  *"leia o arquivo de sessão e o histórico de conversas pra continuarmos pois ouve uma queda de energia e o pc reiniciou"* -> *"1"* (iniciar servidores).
- **Ações Realizadas:**
  - Leitura detalhada de `SESSION_LOG.md`, `HISTORICO_CONVERSAS.md` e verificação da integridade do Git (100% limpo e sincronizado no commit `4d127be`).
  - Inicialização dos servidores locais em background persistente (Backend na porta `3000` e Frontend Angular na porta `4200`).
  - Verificação de conectividade HTTP 200 no Frontend e API ativa.

### 2. Interação do Usuário: Estratégia de Divulgação e Integração dos Canais de Contato
- **Solicitação do Usuário:**  
  *"não tem muito o que fazer aqui por enquanto é aguardar pessoal contratar utilizar e reportar os bug, então vamos pra parte de ddivulgação, canais e o que fazer em cada canal pra divulgar, e onde vou está recebendo e analisando tudo"*
- **Ações Realizadas:**
  - Elaboração de plano detalhado de Go-To-Market cobrindo:
    1. Painel SuperAdmin (`/app/superadmin`) como cockpit de controle para acompanhar novos trials de 7 dias e métricas em tempo real.
    2. Estratégia nos 5 principais canais (Instagram, Grupos de WhatsApp/Telegram, Facebook, Prospecção 1 a 1 via Google Maps e Anúncios).
    3. Funil de conversão (Visitante -> Demonstração -> Trial de 7 Dias -> Assinatura).
  - Identificada a ausência de canais reais na Landing Page e configurados os dados oficiais fornecidos:
    - WhatsApp: `(85) 98801-4049` (`5585988014049`).
    - Instagram: `https://www.instagram.com/amauricostacastro/`.
    - E-mail: `amakurt@gmail.com`.
  - Implementado **Botão Flutuante de WhatsApp** pulsante no canto inferior direito da Landing Page com mensagem pré-formatada.
  - Atualizados links do rodapé e botão de suporte no módulo de configurações.
  - Validação completa com TypeScript (`npx tsc --noEmit`, 0 erros).

---

## 💬 Sessão: 03 de Novembro de 2026

### 1. Interação do Usuário: Alerta de Segurança Hostinger (CVE-2026-98432 no Kernel Linux)
- **Solicitação do Usuário:**  
  *"Bom dia, recebi um e-mail da Hosting com esse conteúdo: Atualização de segurança · CVE-2026-98432..."*
- **Ações Realizadas:**
  - Orientação imediata quanto à mitigação ativa pela infraestrutura da Hostinger.
  - Validação da configuração do PM2 (`pm2 startup` e `pm2 save`).
  - Atualização do kernel do Linux e pacotes do Ubuntu no servidor de produção.
  - Execução de `reboot` com subida automática bem-sucedida do novo kernel (`6.8.0-147-generic`), PM2 online (94.6 MB) e Nginx ativo.
  - Testes externos de conectividade aprovados para `edupsychpro.tech` e `app.edupsychpro.tech`.

### 2. Interação do Usuário: Sincronização e Acesso ao Painel Master
- **Solicitação do Usuário:**  
  *"em relação ao github aqui e na vps está tudo na mesma versão do nosso sistema?"* e *"quais as credencias para acessar como Administrador e o link"*
- **Ações Realizadas:**
  - Auditoria dos 3 ambientes confirmando paridade exata no commit `98365d2`.
  - Fornecidos links do painel de login (`/login`) e painel master (`/master`).
  - O usuário autenticou-se com sucesso com sua conta oficial no painel SuperAdmin de produção.

### 3. Interação do Usuário: Nova Funcionalidade — Escaneamento Inteligente de Fichas com IA
- **Solicitação do Usuário:**  
  *"Tem uma nova funcionalidade que quero implementar e testar: uma opção do Profissional escanear uma ficha impressa ou escrita de um Paciente e já preencher diretamente no sistema"*
- **Ações Realizadas:**
  - Aplicação do Portão Socrático para alinhamento clínico e arquitetural (Ambos Paciente/Anamnese, Câmera + Arquivo, preenchimento com conferência prévia e botão na listagem).
  - Criação do plano formal `.agent/tasks/smart-ficha-scanner.md`.
  - Backend: Criação de `backend/src/routes/ai-ocr.ts` (`POST /api/ai-ocr/scan`) integrando a API REST Multimodal do Google Gemini, leitura de caligrafia e retenção física de imagens em `/uploads/fichas/`.
  - Resolução Dinâmica de Chaves: Suporte à chave da própria clínica (`WhatsAppConfig.geminiKey`), chave mestre ou `.env`, além de suporte aos modelos oficiais `gemini-1.5-flash`, `gemini-2.0-flash` e `gemini-2.5-flash`.
  - Frontend: Criação do modal reutilizável `<app-ficha-scanner-modal>` com câmera nativa traseira (`capture="environment"`), upload de imagens e PDF.
  - Módulo de Pacientes: Botões em `pacientes-list.component.ts` e `paciente-form.component.ts`, integração automática de dados cadastrais/clínicos, vinculação de responsável/escola e badges visuais "✨ IA".
  - Módulo de Anamnese: Botão em `anamnese-form.component.ts` com distribuição estruturada dos dados nas etapas de anamnese.
  - Builds (`tsc` e `ng build`) validados com 100% de sucesso.


