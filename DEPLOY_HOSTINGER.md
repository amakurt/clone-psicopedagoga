# 🚀 Guia de Deploy - Hostinger VPS KVM 2 (EduPsych Pro SaaS)

Este guia contém o passo a passo exato e simplificado para colocar o **EduPsych Pro** no ar na sua VPS Hostinger KVM 2 (Ubuntu 24.04).

---

## 📋 Resumo da Infraestrutura Instalada
- **Frontend**: Angular 18 (Compilação SPA ultra-rápida servida por Nginx com gzip)
- **Backend**: Node.js / Express (Gerenciado por PM2 na porta 3000 com reinicialização automática)
- **Banco de Dados**: PostgreSQL 16 (Container Docker com persistência NVMe)
- **WhatsApp Multi-Clínica**: Evolution API v2 (Container Docker com persistência de sessões)
- **Segurança**: SSL HTTPS automático e gratuito via Let's Encrypt (Certbot)

---

## ⚡ Passo 1: Conectar na sua VPS Hostinger via Terminal

Abra o terminal do seu Mac e conecte via SSH com o IP e senha fornecidos no painel da Hostinger:
```bash
ssh root@SEU_IP_DA_HOSTINGER
```

---

## ⚡ Passo 2: Clonar o Repositório do Projeto

Dentro da VPS, execute:
```bash
git clone https://github.com/amakurt/clone-psicopedagoga.git
cd clone-psicopedagoga
```

---

## ⚡ Passo 3: Executar o Script Automático de Deploy

O script cuidará de tudo automaticamente (instalação do Node 22, Docker, PostgreSQL, Nginx, PM2, migração do banco e compilação do sistema):
```bash
bash deploy-vps.sh
```

> ⏱️ *Esse processo leva cerca de 3 a 5 minutos na primeira vez.*

---

## ⚡ Passo 4: Configurar seu Domínio e Ativar o SSL (HTTPS Gratuito)

1. No painel de controle onde você registrou o seu domínio (ex: Registro.br ou Hostinger):
   * Crie uma entrada DNS do tipo **A**:
     * **Nome**: `app` (ou `@` se quiser no domínio raiz)
     * **Destino/IP**: O IP da sua VPS Hostinger.
2. Aguarde 2 a 5 minutos para o DNS propagar.
3. No terminal da VPS, execute o comando do Certbot para ativar o HTTPS com cadeado verde:
```bash
certbot --nginx -d app.seudominio.com.br
```
*O Certbot pedirá seu e-mail e configurará a renovação automática de segurança vitalícia!*

---

## ⚡ Passo 5: Cadastrar a sua Primeira Cliente!

1. Acesse no seu navegador: `https://app.seudominio.com.br/master`
2. No menu **"Clínicas & Assinaturas"**, clique em **"+ Nova Clínica"**:
   * Preencha o nome da clínica da sua cliente.
   * Escolha o plano (ex: **PRO** ou **BÁSICO**).
   * Defina os dias de Trial ou ative a assinatura.
3. Na aba **"WhatsApp Multi-Clínica"**:
   * Localize a clínica dela e clique em **"Conectar WhatsApp"**.
   * Peça para ela escanear o QR Code direto pelo WhatsApp do consultório.
4. Na aba **"Financeiro & Faturamento SaaS"**:
   * Emita a primeira fatura mensal dela e envie o lembrete com a sua Chave PIX direto no WhatsApp com 1 clique!

---

## 🛠️ Comandos Úteis do Dia a Dia

* **Ver status do Backend**:
  ```bash
  pm2 status
  ```
* **Ver logs em tempo real do Backend**:
  ```bash
  pm2 logs edupsych-backend
  ```
* **Reiniciar o Backend**:
  ```bash
  pm2 restart edupsych-backend
  ```
* **Ver status dos containers (PostgreSQL e WhatsApp Evolution)**:
  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```
* **Ver logs do WhatsApp Evolution API**:
  ```bash
  docker logs -f edupsych-evolution
  ```
* **Atualizar o sistema após novas alterações no GitHub**:
  ```bash
  git pull origin main
  bash deploy-vps.sh
  ```
