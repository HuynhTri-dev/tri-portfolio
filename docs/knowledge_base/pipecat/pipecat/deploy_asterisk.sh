#!/usr/bin/env bash
# Merge dialplan 9999 + websocket_client [pipecat] (port 10003). Chạy root trên VM.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MARKER="lab-pipecat-voicebot-9999"
SNIPPET="$SCRIPT_DIR/asterisk/extensions_9999_pipecat.conf.snippet"
CONF=/etc/asterisk/extensions.conf

replace_9999_block() {
  local tmp
  tmp="$(mktemp)"
  awk -v marker="; --- ${MARKER} ---" -v snippet="$SNIPPET" '
    BEGIN {
      while ((getline line < snippet) > 0) {
        block = block line "\n"
      }
      close(snippet)
    }
    $0 == marker {
      print marker
      print block
      skip = 1
      next
    }
    skip {
      if ($0 ~ /^exten => 9999,1,/) next
      if ($0 ~ /^ same => /) {
        if ($0 ~ /Hangup\(\)/) skip = 0
        next
      }
      if ($0 ~ /^; Merge vào/) next
      next
    }
    { print }
  ' "$CONF" > "$tmp"
  mv "$tmp" "$CONF"
}

if ! grep -q "^\[pipecat\]" /etc/asterisk/websocket_client.conf 2>/dev/null; then
  cat "$SCRIPT_DIR/asterisk/websocket_client.pipecat.conf.snippet" >> /etc/asterisk/websocket_client.conf
  echo "Appended [pipecat] to websocket_client.conf"
else
  sed -i 's|uri = ws://127.0.0.1:[0-9]*/asterisk|uri = ws://127.0.0.1:10003/asterisk|' /etc/asterisk/websocket_client.conf || true
  echo "[pipecat] already present (uri → 10003)"
fi

mkdir -p /var/spool/asterisk/monitor/voicebot
chown asterisk:asterisk /var/spool/asterisk/monitor/voicebot

if ! grep -q "$MARKER" "$CONF"; then
  {
    echo ""
    echo "; --- $MARKER ---"
    cat "$SNIPPET"
  } >> "$CONF"
  echo "Appended exten 9999 to extensions.conf"
else
  echo "Updating exten 9999 block ($MARKER) from snippet (MixMonitor…)"
  replace_9999_block
  sed -i 's|Dial(WebSocket/pipecat/c(slin8)|Dial(WebSocket/pipecat/c(slin16)|g' "$CONF" || true
fi

if [[ -x /opt/pipecat-voicebot/scripts/mixmonitor_post.sh ]]; then
  echo "mixmonitor_post.sh OK"
else
  echo "Cảnh báo: chạy install.sh để copy /opt/pipecat-voicebot/scripts/mixmonitor_post.sh"
fi

chown asterisk:asterisk /etc/asterisk/websocket_client.conf "$CONF"
asterisk -rx "module reload res_websocket_client.so"
asterisk -rx "dialplan reload"
asterisk -rx "dialplan show from-internal@9999" | head -16
