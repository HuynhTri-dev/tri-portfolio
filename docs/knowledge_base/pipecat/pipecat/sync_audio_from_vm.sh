#!/usr/bin/env bash
# Kéo file ghi âm 9999 từ VM → repo/audio/*.wav
# Usage: ./sync_audio_from_vm.sh          # một lần
#        ./sync_audio_from_vm.sh --watch  # lặp mỗi 8s (sau cuộc gọi)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${ROOT}/.env"
VM_IP="${VM_IP:-$(grep -E '^VM_IP=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d "\"'" || true)}"
SSH_KEY="${SSH_KEY:-${ROOT}/.lab_ssh/id_ed25519}"
REMOTE_DIR="/var/spool/asterisk/monitor/voicebot"
LOCAL_DIR="${ROOT}/audio"

if [[ -z "$VM_IP" ]]; then
  echo "Thiếu VM_IP trong ${ENV_FILE}" >&2
  exit 1
fi

mkdir -p "$LOCAL_DIR"
RSYNC_SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

pull_once() {
  rsync -av --ignore-existing -e "$RSYNC_SSH" \
    "root@${VM_IP}:${REMOTE_DIR}/*.wav" \
    "$LOCAL_DIR/" 2>/dev/null || true
  count="$(find "$LOCAL_DIR" -maxdepth 1 -name 'voicebot-*.wav' 2>/dev/null | wc -l | tr -d ' ')"
  echo "audio/: ${count} file voicebot-*.wav (mới nhất trong lần sync vừa rồi)"
}

if [[ "${1:-}" == "--watch" ]]; then
  echo "Watch ${REMOTE_DIR} → ${LOCAL_DIR} (Ctrl+C dừng)"
  while true; do
    pull_once
    sleep 8
  done
else
  pull_once
  ls -lt "$LOCAL_DIR"/voicebot-*.wav 2>/dev/null | head -5 || echo "(chưa có file — gọi 9999 trước)"
fi
