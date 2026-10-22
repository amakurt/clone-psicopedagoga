#!/usr/bin/env bash
# =========================================================================
# EDUPSYCH PRO SAAS - SCRIPT AUTOMATIZADO DE DEPLOY (HOSTINGER VPS KVM 2)
# =========================================================================
# Execute com: bash deploy-vps.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}        INICIANDO DEPLOY EDUPSYCH PRO SAAS - HOSTINGER VPS KVM 2      ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# 1. Verificar permissões de root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERRO] Por favor, execute este script como root ou usando sudo.${NC}"
  exit 1
fi

ROOT_DIR=$(pwd)

# 2. Atualizar o sistema operacional
echo -e "\n${YELLOW}[1/8] Atualizando pacotes do sistema (Ubuntu)...${NC}"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git nginx certbot python3-certbot-nginx ca-certificates gnupg lsb-release

# Configurar 2GB de SWAP de segurança se não houver swap configurado
if [ $(swapon --show | wc -l) -le 1 ]; then
  echo -e "\n${YELLOW}[SWAP] Configurando 2GB de arquivo SWAP para proteção de memória...${NC}"
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo -e "${GREEN}[✓] SWAP de 2GB configurado com sucesso.${NC}"
fi

# 3. Instalar Node.js 22 LTS se necessário
if ! command -v node &> /dev/null; then
  echo -e "\n${YELLOW}[2/8] Instalando Node.js 22 LTS...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo -e "\n${GREEN}[✓] Node.js já instalado: $(node -v)${NC}"
fi

# 4. Instalar Docker e Docker Compose se necessário
if ! command -v docker &> /dev/null; then
  echo -e "\n${YELLOW}[3/8] Instalando Docker Engine & Docker Compose...${NC}"
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo -e "\n${GREEN}[✓] Docker já instalado: $(docker -v)${NC}"
fi

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
  echo -e "\n${YELLOW}[4/8] Instalando PM2 para gerenciamento de processos...${NC}"
  npm install -g pm2
else
  echo -e "\n${GREEN}[✓] PM2 já instalado.${NC}"
fi

# 5. Iniciar containers de Banco de Dados (PostgreSQL) e WhatsApp (Evolution API)
echo -e "\n${YELLOW}[5/8] Subindo Containers Docker (PostgreSQL 16 & Evolution API v2)...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${BLUE}Aguardando PostgreSQL inicializar (10 segundos)...${NC}"
sleep 10

# 6. Configurar e Compilar o Backend
echo -e "\n${YELLOW}[6/8] Configurando e compilando o Backend Node.js...${NC}"
cd "$ROOT_DIR/backend"

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Criando backend/.env a partir do template de produção...${NC}"
  cp .env.production.example .env
  if command -v openssl &> /dev/null; then
    RAND_JWT=$(openssl rand -hex 32)
    RAND_SESS=$(openssl rand -hex 32)
    sed -i "s/edupsych_jwt_secret_production_key_2026/$RAND_JWT/g" .env
    sed -i "s/edupsych_session_secret_production_key_2026/$RAND_SESS/g" .env
  fi
fi

# Garantir uso do schema PostgreSQL para o Prisma
echo -e "${BLUE}Aplicando Schema PostgreSQL no Prisma...${NC}"
cp prisma/schema.postgres.prisma prisma/schema.prisma

npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# Iniciar ou reiniciar backend no PM2
if pm2 list | grep -q "edupsych-backend"; then
  echo -e "${BLUE}Reiniciando processo no PM2...${NC}"
  pm2 restart edupsych-backend
else
  echo -e "${BLUE}Iniciando processo no PM2...${NC}"
  pm2 start dist/index.js --name "edupsych-backend"
fi

# 7. Compilar o Frontend Angular
echo -e "\n${YELLOW}[7/8] Compilando o Frontend Angular em modo produção...${NC}"
cd "$ROOT_DIR"
npm install
npx ng build

# Criar pasta pública do Nginx e copiar arquivos
mkdir -p /var/www/edupsych
rm -rf /var/www/edupsych/dist
cp -r dist /var/www/edupsych/
chown -R www-data:www-data /var/www/edupsych

# 8. Configurar Nginx
echo -e "\n${YELLOW}[8/8] Configurando Servidor Web Nginx...${NC}"
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Cria configuração inicial temporária para HTTP enquanto o SSL não for emitido
if [ ! -f "/etc/nginx/sites-available/edupsych" ]; then
  cat > /etc/nginx/sites-available/edupsych << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name edupsychpro.tech app.edupsychpro.tech www.edupsychpro.tech _;

    client_max_body_size 50M;

    # Ocultar versão do Nginx
    server_tokens off;

    # Headers de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Bloquear arquivos de mapa de fonte (Source Maps) contra engenharia reversa
    location ~* \.map$ {
        deny all;
        return 404;
    }

    # Bloquear arquivos ocultos e sensíveis (.env, .git, etc.)
    location ~ /\.(?!well-known) {
        deny all;
        return 404;
    }

    root /var/www/edupsych/dist/browser;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/edupsych /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default || true
fi

nginx -t
systemctl reload nginx

# Configurar PM2 para inicialização automática no boot da VPS
pm2 save
pm2 startup systemd -u root --hp /root || true

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}      DEPLOY CONCLUÍDO COM SUCESSO NO HOSTINGER VPS KVM 2!           ${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "O sistema já está rodando localmente na porta 80 e a API na porta 3000."
echo -e "\n${YELLOW}PRÓXIMO PASSO PARA ATIVAR O DOMÍNIO E SSL (HTTPS):${NC}"
echo -e "1. Aponte o DNS do seu domínio (ex: app.seudominio.com.br) para o IP desta VPS."
echo -e "2. Execute o comando para emitir o certificado SSL gratuito:"
echo -e "   ${BLUE}certbot --nginx -d app.seudominio.com.br${NC}"
echo -e "\nPronto! O Certbot configurará o HTTPS automaticamente com renovação perpétua."
