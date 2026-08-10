#!/usr/bin/env bash
# EduPsych Pro - Start all services locally (backend + frontend + Evolution API)
# Uso: ./start-all.sh [--host-ip IP]   (--host-ip opcional para expor na rede)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LAN_IP=""
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

# Flags
for arg in "$@"; do
  case $arg in
    --host-ip=*) LAN_IP="${arg#*=}" ;;
    --host-ip) LAN_IP="$2"; shift 2 ;;
  esac
done

# --- Colima/Docker (Evolution API) ---
if ! docker info >/dev/null 2>&1; then
  echo "==> Iniciando Colima (Docker)..."
  colima start >/dev/null 2>&1 || { echo "Falha ao iniciar Colima"; exit 1; }
  sleep 3
fi

EVO_UP=0
if curl -s -o /dev/null http://localhost:8080 2>/dev/null; then
  EVO_UP=1
  echo "==> Evolution API já está no ar"
else
  echo "==> Subindo Evolution API (docker compose)..."
  (cd "$ROOT/evolution-api" && docker compose up -d >"$LOG_DIR/evolution.log" 2>&1 || true)
  for i in $(seq 1 30); do
    if curl -s -o /dev/null http://localhost:8080 2>/dev/null; then EVO_UP=1; break; fi
    sleep 2
  done
fi
if [ "$EVO_UP" = "1" ]; then
  echo "==> Evolution API: OK (http://localhost:8080)"
  curl -s http://localhost:8080/instance/connectionState/edupsych \
    -H "apikey: edupsych-localtest-apikey-2026" 2>/dev/null \
    | grep -q '"state":"open"' && echo "    instância edupsych: conectada" || echo "    instância edupsych: DESCONECTADA (escaneie o QR em http://localhost:8080/manager)"
else
  echo "!! Evolution API não subiu (veja logs/evolution.log)"
fi

# --- Backend ---
if curl -s -o /dev/null http://localhost:3000/api/dashboard 2>/dev/null; then
  echo "==> Backend já está no ar (http://localhost:3000)"
elif pgrep -f "tsx watch src/index.ts" >/dev/null 2>&1; then
  echo "==> Backend subindo (aguardando)..."
  for i in $(seq 1 15); do
    curl -s -o /dev/null http://localhost:3000/api/dashboard 2>/dev/null && break
    sleep 1
  done
  echo "==> Backend: OK (http://localhost:3000)"
else
  echo "==> Iniciando Backend (Express + Prisma)..."
  (cd "$ROOT/backend" && nohup npm run dev >"$LOG_DIR/backend.log" 2>&1 &)
  for i in $(seq 1 20); do
    curl -s -o /dev/null http://localhost:3000/api/dashboard 2>/dev/null && break
    sleep 1
  done
  curl -s -o /dev/null http://localhost:3000/api/dashboard 2>/dev/null && echo "==> Backend: OK (http://localhost:3000)" || { echo "!! Backend não subiu (veja logs/backend.log)"; }
fi

# --- Frontend ---
FRONT_OPTS=""
if [ -n "$LAN_IP" ]; then
  FRONT_OPTS="--host 0.0.0.0"
  echo "==> Expondo frontend na rede: http://$LAN_IP:4200"
fi

if curl -s -o /dev/null http://localhost:4200 2>/dev/null; then
  echo "==> Frontend já está no ar (http://localhost:4200)"
elif pgrep -f "ng serve" >/dev/null 2>&1 || pgrep -f "@angular-devkit/build-angular" >/dev/null 2>&1; then
  echo "==> Frontend subindo (aguardando)..."
  for i in $(seq 1 30); do
    curl -s -o /dev/null http://localhost:4200 2>/dev/null && break
    sleep 2
  done
  echo "==> Frontend: OK (http://localhost:4200)"
else
  echo "==> Iniciando Frontend (Angular)..."
  (cd "$ROOT" && nohup npm start -- $FRONT_OPTS >"$LOG_DIR/frontend.log" 2>&1 &)
  for i in $(seq 1 40); do
    curl -s -o /dev/null http://localhost:4200 2>/dev/null && break
    sleep 2
  done
  curl -s -o /dev/null http://localhost:4200 2>/dev/null && echo "==> Frontend: OK (http://localhost:4200)" || { echo "!! Frontend não subiu (veja logs/frontend.log)"; }
fi

echo ""
echo "======================================"
echo "  Serviços:"
echo "  - Frontend:       http://localhost:4200"
[ -n "$LAN_IP" ] && echo "  - Frontend (LAN): http://$LAN_IP:4200"
echo "  - Backend:        http://localhost:3000"
echo "  - Evolution API:  http://localhost:8080"
echo "  Logs: $LOG_DIR"
echo "  Login: sarah@edupsych.com / 123456"
echo "======================================"
