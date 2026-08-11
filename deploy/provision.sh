#!/usr/bin/env bash
# EduPsych Pro - provisionamento do servidor (rodar UMA vez, como ubuntu, no servidor novo)
# Uso: ssh ubuntu@IP 'bash -s' < deploy/provision.sh

set -euo pipefail

echo "==> apt update + deps"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq nginx git unzip ca-certificates curl gnupg cron certbot python3-certbot-nginx build-essential python3 >/dev/null

echo "==> Node.js 20 (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null 2>&1
sudo apt-get install -y -qq nodejs >/dev/null

echo "==> Docker + compose plugin"
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.asc >/dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin >/dev/null
sudo usermod -aG docker ubuntu

echo "==> PM2 global"
npm install -g pm2 --silent

echo "==> Diretórios (dono: ubuntu)"
sudo mkdir -p /opt/edupsych/frontend /opt/edupsych/backend /opt/edupsych/evolution /opt/edupsych/backups
sudo chown -R ubuntu:ubuntu /opt/edupsych

echo "==> Firewall (22/80/443)"
sudo ufw allow OpenSSH >/dev/null
sudo ufw allow 'Nginx Full' >/dev/null
echo "y" | sudo ufw enable >/dev/null

echo "==> Provisionamento OK"
echo "   Node: $(node -v) | Docker: $(docker --version | cut -d, -f1) | PM2: $(pm2 -v)"