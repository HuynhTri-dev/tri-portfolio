#!/usr/bin/env bash
# Chạy trên VM khi MixMonitor kết thúc (tham số: đường dẫn file .wav).
set -euo pipefail

WAV="${1:-}"
if [[ -z "$WAV" || ! -f "$WAV" ]]; then
  logger -t mixmonitor_post "missing or invalid wav: ${WAV:-empty}"
  exit 0
fi

chmod a+r "$WAV" 2>/dev/null || true

ENV_FILE="/opt/pipecat-voicebot/.env"
if [[ -f "$ENV_FILE" ]]; then
  # AUDIO_SYNC_DEST=user@host:/absolute/path/to/repo/audio
  line="$(grep -E '^AUDIO_SYNC_DEST=' "$ENV_FILE" | tail -1 || true)"
  if [[ -n "$line" ]]; then
    dest="${line#AUDIO_SYNC_DEST=}"
    dest="${dest%\"}"
    dest="${dest#\"}"
    if [[ -n "$dest" ]]; then
      if scp -q -o BatchMode=yes -o ConnectTimeout=15 "$WAV" "${dest}/" 2>/dev/null; then
        logger -t mixmonitor_post "synced to ${dest}: $(basename "$WAV")"
      else
        logger -t mixmonitor_post "AUDIO_SYNC_DEST scp failed for $(basename "$WAV")"
      fi
    fi
  fi
fi

logger -t mixmonitor_post "ready $(basename "$WAV") size=$(stat -c%s "$WAV" 2>/dev/null || echo 0)"
