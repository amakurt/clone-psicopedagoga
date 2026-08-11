#!/usr/bin/env bash
# EduPsych Pro - deploy (rodar no Mac)
# Uso: ./deploy/setup.sh IP [DOMINIO] [--skip-build]
# Ex.: ./deploy/setup.sh 137.131.160.171 app.meudominio.com

set -euo pipefail

IP="${1:?Uso: ./deploy/setup.sh IP [DOMINIO] [--skip-build]}"
DOMAIN="${2:-}"
SKIP_BUILD="${3:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSHKEY="$HOME/.ssh/id_ed25519"
SSH="ssh -i $SSHKEY -o StrictHostKeyChecking=accept-new ubuntu@$IP"

if [ "$SKIP_BUILD" != "--skip-build" ]; then
  echo "==> Build do frontend (ng build production)"
  (cd "$ROOT" && npx ng build --configuration production)
fi

echo "==> Copiando frontend"
rsync -az --delete -e "ssh -i $SSHKEY" "$ROOT/dist/" "ubuntu@$IP:/opt/edupsych/frontend/"

echo "==> Copiando backend (sem node_modules/logs/dev.db/uploads/.env/schema)"
rsync -az --delete -e "ssh -i $SSHKEY" \
  --exclude node_modules --exclude '*.log' --exclude dist \
  --exclude 'prisma/dev.db*' --exclude 'prisma/schema.prisma' --exclude uploads --exclude '.env' \
  "$ROOT/backend/" "ubuntu@$IP:/opt/edupsych/backend/"

echo "==> Copiando arquivos de deploy (inclui dev.db p/ migração inicial)"
rsync -az -e "ssh -i $SSHKEY" --exclude node_modules \
  "$ROOT/deploy/nginx-edupsych.conf" "$ROOT/deploy/evolution-compose.yml" "$ROOT/deploy/postgres-compose.yml" "$ROOT/deploy/backup.sh" "$ROOT/deploy/migrate/" \
  "ubuntu@$IP:/tmp/edupsych-deploy/"
rsync -az -e "ssh -i $SSHKEY" \
  "$ROOT/backend/prisma/dev.db" "ubuntu@$IP:/tmp/edupsych-deploy/dev.db"

echo "==> Configurando servidor (.env, deps, banco, pm2, nginx, ssl, evolution, cron)"
$SSH "DOMAIN='$DOMAIN' bash -s" <<'REMOTE'
set -euo pipefail
APP=/opt/edupsych
DOMAIN="${DOMAIN:-}"

if [ -n "$DOMAIN" ]; then
  FRONT_URL="https://$DOMAIN"
  GOOGLE_CB="https://$DOMAIN/api/auth/google/callback"
else
  FRONT_URL="http://$(hostname -I | awk '{print $1}')"
  GOOGLE_CB=""
fi

FIRST_RUN=0
if [ ! -f "$APP/backend/.env" ]; then
  FIRST_RUN=1
  echo "==> Primeiro deploy: criando .env de produção + Postgres"
  JWT=$(openssl rand -hex 32)
  SESS=$(openssl rand -hex 32)
  DB_PASS=$(openssl rand -hex 12)
  cat > "$APP/backend/.env" <<EOF
DATABASE_URL="postgresql://edupsych:$DB_PASS@127.0.0.1:5432/edupsych?schema=public"

JWT_SECRET="$JWT"
SESSION_SECRET="$SESS"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="$GOOGLE_CB"

FRONTEND_URL="$FRONT_URL"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="EduPsych Pro <>"
ALLOW_INSECURE_EMAIL="true"

BILLING_WEBHOOK_TOKEN="dev-webhook-token"
EOF

  echo "==> Subindo Postgres (container)"
  cp /tmp/edupsych-deploy/postgres-compose.yml "$APP/docker-compose.postgres.yml"
  sed -i "s/EDUPSYCH_DB_PASSWORD/$DB_PASS/g" "$APP/docker-compose.postgres.yml"
  docker compose -f "$APP/docker-compose.postgres.yml" up -d
  until docker compose -f "$APP/docker-compose.postgres.yml" exec -T postgres pg_isready -U edupsych >/dev/null 2>&1; do sleep 2; done

  echo "==> Provider do schema: sqlite -> postgresql"
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$APP/backend/prisma/schema.prisma"
fi

echo "==> Dependências do backend"
cd "$APP/backend"
npm ci --no-audit --no-fund

echo "==> Banco (push no Postgres)"
npx prisma generate
npx prisma db push --skip-generate

if [ "$FIRST_RUN" = "1" ]; then
  echo "==> Migração de dados (dev.db SQLite -> Postgres)"
  mkdir -p "$APP/migrate"
  cp -r /tmp/edupsych-deploy/migrate/. "$APP/migrate/"
  (cd "$APP/migrate" && npm ci --no-audit --no-fund)
  node "$APP/migrate/migrate.js" /tmp/edupsych-deploy/dev.db \
    "postgresql://edupsych:$(grep -oP '(?<=edupsych:)[^@]+' "$APP/backend/.env")@127.0.0.1:5432/edupsych?schema=public" \
    "$APP/backend/prisma/schema.prisma"
  rm -f "$APP/backend/prisma/dev.db"
fi

echo "==> Seed idempotente (só cria o que faltar)"
npx tsx src/seed.ts >/dev/null

echo "==> Build e PM2 (usuário ubuntu, restart automático)"
npm run build
pm2 start dist/index.js --name edupsych-backend --cwd "$APP/backend" --cron-restart '0 4 * * *'
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | sudo bash - >/dev/null

echo "==> nginx"
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp /tmp/edupsych-deploy/nginx-edupsych.conf /etc/nginx/sites-available/edupsych
sudo ln -sf /etc/nginx/sites-available/edupsych /etc/nginx/sites-enabled/edupsych
sudo nginx -t
sudo systemctl reload nginx

if [ -n "$DOMAIN" ]; then
  echo "==> Certificado SSL (certbot)"
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN" --redirect || \
    echo "!! SSL falhou - rode manualmente: sudo certbot --nginx -d $DOMAIN"
else
  echo "==> Sem domínio - rodando via HTTP (SSL depois com certbot)"
fi

echo "==> Evolution API (Docker)"
cp /tmp/edupsych-deploy/evolution-compose.yml "$APP/evolution/docker-compose.yml"
EVO_KEY=$(openssl rand -hex 24)
EVO_DB_PASS=$(openssl rand -hex 12)
sed -i "s/EVOLUTION_API_KEY/$EVO_KEY/g; s/EVOLUTION_DB_PASSWORD/$EVO_DB_PASS/g" "$APP/evolution/docker-compose.yml"
(cd "$APP/evolution" && docker compose up -d)

echo "==> Cron de backup diário (3h)"
chmod +x "$APP/evolution/backup.sh"
cp "$APP/evolution/backup.sh" "$APP/backup.sh"
chmod +x "$APP/backup.sh"
( crontab -l 2>/dev/null | grep -v 'edupsych/backup.sh' ; echo "0 3 * * * $APP/backup.sh" ) | crontab -

echo ""
echo "=========================================="
echo " Deploy concluído!"
echo " Frontend : $FRONT_URL"
echo " API      : $FRONT_URL/api/health"
echo " Evolution: http://127.0.0.1:8080"
echo " Evolution API Key: $EVO_KEY"
echo " Edite o .env em $APP/backend/.env (SMTP, Google, Asaas)"
echo "=========================================="
REMOTE