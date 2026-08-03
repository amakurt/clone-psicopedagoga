# Registro de Sessão - 03 de Agosto de 2026

## Sessão de Implementação e Correções

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
- Navegação:
  - Pacientes Ativos → `/pacientes`
  - Documentos Pendentes → `/documentos`
  - Casos Arquivados → `/sessoes`
  - Protocolos TEA → `/protocolos`
- Adicionado `Router` injection e método `navigateTo()`

#### 3. Documentos Clínicos - Nova Feature
**Backend:**
- Nova tabela `SessionDiary` no Prisma (diário de sessões)
- Nova tabela `FrequencySheet` no Prisma (ficha de frequência)
- Nova tabela `InterventionDocument` no Prisma (plano de intervenção)
- Rotas CRUD: `/api/session-diaries`, `/api/frequency-sheets`, `/api/intervention-documents`

**Frontend - Módulo `documentos-clinicos`:**
- **Diário de Sessões** (`/documentos-clinicos/diario`):
  - Aluno, Nº sessão, Data, Profissional
  - Objetivo, Instrumentos, Comportamento do aluno, Atividades, Observações
  - Preview em tempo real + Export PDF (html2pdf.js)
  
- **Ficha de Frequência** (`/documentos-clinicos/frequencia`):
  - Aluno, Data, Horário entrada/saída
  - Atividades realizadas, Instrumentos, Observações
  - Rubrica do responsável + Export PDF
  
- **Plano de Intervenção** (`/documentos-clinicos/plano`):
  - Formulário multi-step (3 passos): Avaliação → Habilidades → Roteiro
  - Nº sessões, Valor/sessão, Valor total, Frequência, Duração
  - Preview + Export PDF

**Navegação:** Menu lateral → "Docs Clínicos" (ícone `clinical_notes`)

#### 4. Correção - Protocolo TEA
- **Bug:** Erro `Foreign key constraint violated` ao salvar avaliação
- **Causa:** `professionalId` sendo enviado como string vazia `''`
- **Correção:** Injetado `AuthService` no componente para usar `this.auth.user()?.id`

---

### Arquitetura Atual
```
clone-psicopedagoga/
├── backend/
│   ├── src/routes/ (28 arquivos)
│   │   ├── session-diaries.ts (NOVO)
│   │   ├── frequency-sheets.ts (NOVO)
│   │   └── intervention-documents.ts (NOVO)
│   └── prisma/schema.prisma (20+ models)
├── src/app/
│   ├── modules/ (21 módulos)
│   │   └── documentos-clinicos/ (NOVO)
│   │       ├── diario-sessao.component.ts
│   │       ├── frequencia-form.component.ts
│   │       └── plano-intervencao-doc.component.ts
│   └── layout/main-layout/ (sidebar com 13 itens)
```

### Banco de Dados - Tabelas
1. User, Paciente, Responsible, School
2. Prontuario, Anamnese, Sessao, Laudo
3. Encaminhamento, Comunicacao, FinanceiroSessao
4. Notification, Document, Appointment
5. LibraryResource, Transaction, SessionRecord
6. ProtocolEvaluation, InterventionPlan
7. ChatMessage, SocialAccount
8. **SessionDiary** (NOVO)
9. **FrequencySheet** (NOVO)
10. **InterventionDocument** (NOVO)

### Credenciais de Acesso
| Email | Senha | Perfil |
|-------|-------|--------|
| sarah@edupsych.com | 123456 | GESTOR |
| admin@test.com | 123456 | GESTOR |

### Como Rodar
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
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

### Pendências / Próximos Passos
1. Portal do Responsável (Guardian) - funcional mas precisa de testes
2. Google OAuth - credenciais não configuradas
3. Integrar upload de documentos nos novos formulários clínicos
4. Adicionar listagem/histórico dos documentos clínicos salvos
5. Testes E2E
6. Deploy
