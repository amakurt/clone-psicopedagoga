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
echo -e "\n${YELLOW}[1/5] Puxando últimos commits do GitHub...${NC}"
git checkout -- backend/prisma/schema.prisma 2>/dev/null || true
git fetch origin main
git reset --hard origin/main

# 2. Garantir containers Docker ativos (PostgreSQL e Evolution API)
echo -e "\n${YELLOW}[2/5] Garantindo containers Docker ativos (PostgreSQL & Evolution API)...${NC}"
docker compose -f docker-compose.prod.yml up -d
sleep 3
docker exec -i edupsych-postgres psql -U edupsych -d edupsych_prod -c "CREATE SCHEMA IF NOT EXISTS evolution;" 2>/dev/null || true

# 3. Atualizar Banco de Dados (PostgreSQL) e Backend
echo -e "\n${YELLOW}[3/5] Instalando dependências e sincronizando banco (Prisma)...${NC}"
cd "$ROOT_DIR/backend"
npm install --omit=dev --no-audit --no-fund
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push --accept-data-loss

# Garantir Usuário SuperAdmin Master ativo (admin@edupsychpro.tech e admin@edupsych.tech)
node scripts/setup-master-admin.js 2>/dev/null || true
docker exec -i edupsych-postgres psql -U edupsych -d edupsych_prod -c "INSERT INTO \"User\" (id, name, email, password, role, active, \"createdAt\", \"updatedAt\") VALUES ('cm_superadmin_master', 'Administrador Master', 'admin@edupsychpro.tech', '\$2b\$10\$cBImV1uB4Ho6K4ALJ2RzR.wyvAKZUh0Y0zptCK0wncpKR.I02QGx.', 'SUPERADMIN', true, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'SUPERADMIN', active = true;" 2>/dev/null || true
docker exec -i edupsych-postgres psql -U edupsych -d edupsych_prod -c "INSERT INTO \"User\" (id, name, email, password, role, active, \"createdAt\", \"updatedAt\") VALUES ('cm_superadmin_alt', 'Administrador Master', 'admin@edupsych.tech', '\$2b\$10\$cBImV1uB4Ho6K4ALJ2RzR.wyvAKZUh0Y0zptCK0wncpKR.I02QGx.', 'SUPERADMIN', true, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'SUPERADMIN', active = true;" 2>/dev/null || true

# Garantir logomarcas públicas no backend uploads e banco
mkdir -p "$ROOT_DIR/backend/uploads"
cp -n "$ROOT_DIR/src/assets/images/logo-vilma-transparente"* "$ROOT_DIR/backend/uploads/" 2>/dev/null || true
cp -n "$ROOT_DIR/src/assets/images/clinica-vilma-logo"* "$ROOT_DIR/backend/uploads/" 2>/dev/null || true
docker exec -i edupsych-postgres psql -U edupsych -d edupsych_prod -c "UPDATE \"Tenant\" SET \"logoUrl\" = '/api/uploads/public/logo-vilma-transparente.png' WHERE (LOWER(name) LIKE '%vilma%' OR LOWER(slug) LIKE '%vilma%' OR id IN (SELECT \"tenantId\" FROM \"Membership\" m JOIN \"User\" u ON m.\"userId\" = u.id WHERE LOWER(u.name) LIKE '%vilma%' OR LOWER(u.email) LIKE '%vilma%') OR id IN (SELECT \"tenantId\" FROM \"Paciente\" WHERE LOWER(name) LIKE '%will%'));" 2>/dev/null || true

echo -e "\n${YELLOW}[4/5] Recompilando backend e reiniciando PM2...${NC}"
npm run build
pm2 restart edupsych-backend

# 5. Compilar Frontend Angular e Publicar
echo -e "\n${YELLOW}[5/5] Atualizando Frontend Angular...${NC}"
cd "$ROOT_DIR"
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build || npx ng build

echo -e "${YELLOW}Publicando bundle limpo em /var/www/edupsych/dist/browser/...${NC}"
mkdir -p /var/www/edupsych/dist/browser
rm -rf /var/www/edupsych/dist/browser/*
cp -r dist/browser/* /var/www/edupsych/dist/browser/
chown -R www-data:www-data /var/www/edupsych

# Configurar Nginx para evitar cache estrito de index.html
if [ -f "/etc/nginx/sites-available/edupsych" ]; then
  if ! grep -q "location = /index.html" /etc/nginx/sites-available/edupsych; then
    sed -i '/location \/ {/i \    location = /index.html {\n        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";\n        expires off;\n    }\n' /etc/nginx/sites-available/edupsych 2>/dev/null || true
  fi
fi

nginx -t 2>/dev/null && systemctl reload nginx || systemctl restart nginx || true

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}      ATUALIZAÇÃO CONCLUÍDA COM SUCESSO E SEM TRAVAMENTO!            ${NC}"
echo -e "${GREEN}======================================================================${NC}"
