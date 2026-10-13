#!/usr/bin/env bash
# Đẩy biến Pipecat từ .env lab (repo root) lên /opt/pipecat-voicebot/.env trên VM.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${ROOT}/.env"
VM_IP="${VM_IP:-$(grep -E '^VM_IP=' "$ENV_FILE" | cut -d= -f2- | tr -d "\"'")}"
SSH_KEY="${SSH_KEY:-${ROOT}/.lab_ssh/id_ed25519}"

vars=(
  ELEVENLABS_API_KEY ELEVENLABS_VOICE_ID ELEVENLABS_STT_MODEL ELEVENLABS_TTS_MODEL
  ELEVENLABS_TTS_OPTIMIZE_LATENCY ELEVENLABS_STT_TTFS_P99_LATENCY
  OLLAMA_API_KEY OLLAMA_BASE_URL OLLAMA_MODEL OLLAMA_TEMPERATURE OLLAMA_MAX_COMPLETION_TOKENS
  PIPECAT_HOST PIPECAT_PORT PIPECAT_SAMPLE_RATE MEDIA_READY_DELAY_SECS
  STT_ECHO_GATE_TAIL_SECS PIPECAT_ENABLE_INTERRUPTIONS STT_ECHO_GATE_BARGE_IN
  VAD_CONFIDENCE VAD_START_SECS VAD_STOP_SECS VAD_MIN_VOLUME
  LOG_LEVEL
)

tmp="$(mktemp)"
for v in "${vars[@]}"; do
  line="$(grep -E "^${v}=" "$ENV_FILE" 2>/dev/null || true)"
  if [[ -n "$line" ]]; then
    echo "$line" >> "$tmp"
  fi
done

scp -i "$SSH_KEY" "$tmp" "root@${VM_IP}:/opt/pipecat-voicebot/.env"
rm -f "$tmp"
ssh -i "$SSH_KEY" "root@${VM_IP}" 'systemctl restart pipecat-voicebot 2>/dev/null || true'
echo "Synced Pipecat .env → $VM_IP"
