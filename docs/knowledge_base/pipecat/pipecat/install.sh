#!/usr/bin/env bash
# Cài voicebot Pipecat trên VM Ubuntu (chạy root).
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/pipecat-voicebot}"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3.12-venv python3-pip rsync

mkdir -p "$INSTALL_DIR"
rsync -a --delete \
  --exclude '.env' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  "$SRC_DIR/" "$INSTALL_DIR/"

if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  if [[ -f "$INSTALL_DIR/.env.example" ]]; then
    cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
    echo "Đã tạo $INSTALL_DIR/.env — điền API key trước khi start service."
  fi
fi

python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install -U pip wheel
"$INSTALL_DIR/venv/bin/pip" install -r "$INSTALL_DIR/requirements.txt"

if [[ -d "$INSTALL_DIR/scripts" ]]; then
  chmod +x "$INSTALL_DIR/scripts/"*.sh 2>/dev/null || true
fi
mkdir -p /var/spool/asterisk/monitor/voicebot
chown asterisk:asterisk /var/spool/asterisk/monitor/voicebot 2>/dev/null || true

if [[ -f "$INSTALL_DIR/pipecat-voicebot.service" ]]; then
  cp "$INSTALL_DIR/pipecat-voicebot.service" /etc/systemd/system/pipecat-voicebot.service
  systemctl daemon-reload
  echo "Đã cài unit: systemctl enable --now pipecat-voicebot (sau khi điền .env)"
fi

echo "OK: venv tại $INSTALL_DIR/venv"
echo "Chạy thử: cd $INSTALL_DIR && ./venv/bin/python main.py"
