#!/usr/bin/env bash
# EduPsych Pro - Parar todos os serviços (backend + frontend + Evolution API)
# Uso: ./stop-all.sh

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Parando Frontend (Angular)..."
pkill -f "ng serve" 2>/dev/null && echo "    frontend parado" || echo "    frontend já estava parado"

echo "==> Parando Backend (Express)..."
pkill -f "tsx watch src/index.ts" 2>/dev/null && echo "    backend parado" || echo "    backend já estava parado"

echo "==> Parando Evolution API (Docker)..."
(cd "$ROOT/evolution-api" && docker compose down 2>/dev/null && echo "    evolution-api parado") || echo "    evolution-api já estava parado"

echo "==> Finalizado"
