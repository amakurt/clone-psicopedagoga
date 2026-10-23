#!/usr/bin/env bash
# =========================================================================
# EDUPSYCH PRO SAAS - SCRIPT DE ATUALIZAÇÃO RÁPIDA (SEM SOBRECARGA DE RAM)
# =========================================================================
# Execute no terminal da VPS: bash update-vps.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}        ATUALIZANDO EDUPSYCH PRO (BACKEND + BANCO + FRONTEND)         ${NC}"
echo -e "${BLUE}======================================================================${NC}"

ROOT_DIR=$(pwd)

# 1. Puxar alterações do Git
echo -e "\n${YELLOW}[1/4] Puxando últimos commits do GitHub...${NC}"
git pull origin main

# 2. Atualizar Banco de Dados (PostgreSQL) e Backend
echo -e "\n${YELLOW}[2/4] Sincronizando schema do banco de dados (Prisma)...${NC}"
cd "$ROOT_DIR/backend"
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push --accept-data-loss

echo -e "\n${YELLOW}[3/4] Recompilando backend e reiniciando PM2...${NC}"
npm run build
pm2 restart edupsych-backend

# 3. Compilar Frontend se solicitado ou necessário
echo -e "\n${YELLOW}[4/4] Atualizando Frontend Angular...${NC}"
cd "$ROOT_DIR"
npx ng build
cp -r dist/browser/* /var/www/edupsych/dist/browser/ 2>/dev/null || cp -r dist/* /var/www/edupsych/dist/
systemctl reload nginx

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}      ATUALIZAÇÃO CONCLUÍDA COM SUCESSO E SEM TRAVAMENTO!            ${NC}"
echo -e "${GREEN}======================================================================${NC}"
