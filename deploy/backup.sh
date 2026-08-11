#!/usr/bin/env bash
# EduPsych Pro - backup diário (Postgres + uploads) - rodar via cron
# 0 3 * * * /opt/edupsych/backup.sh

set -euo pipefail

APP=/opt/edupsych
TS=$(date +%Y%m%d-%H%M)
KEEP=14

mkdir -p "$APP/backups"

docker compose -f "$APP/docker-compose.postgres.yml" exec -T postgres \
  pg_dump -U edupsych -d edupsych --no-owner --no-privileges \
  | gzip > "$APP/backups/edupsych-db-$TS.sql.gz"

if [ -d "$APP/backend/uploads" ]; then
  tar -czf "$APP/backups/edupsych-files-$TS.tar.gz" -C "$APP/backend" uploads
fi

find "$APP/backups" -name '*.gz' -mtime +$KEEP -delete

echo "[$(date)] backup $TS OK"