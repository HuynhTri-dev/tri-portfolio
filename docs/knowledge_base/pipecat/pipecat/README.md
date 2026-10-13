# Voicebot ngân hàng — Asterisk 9999 + Pipecat

Luồng: softphone gọi **9999** → Asterisk `Dial(WebSocket/pipecat/c(slin16))` → **Pipecat** trên `127.0.0.1:10003`.

| Thành phần | Công nghệ |
|------------|-----------|
| VAD | Silero (Pipecat) |
| STT | ElevenLabs **scribe_v2** |
| LLM | Ollama Cloud **gemma4:cloud** |
| TTS | ElevenLabs **eleven_v4_turbo** @ **16 kHz** (`slin16` + `PIPECAT_SAMPLE_RATE=16000`) |

Thiết kế chi tiết: [voicebot_aterisk_pipecat.md](../../docs/asterisk/voicebot_aterisk_pipecat.md).

## Biến `.env`

Xem [.env.example](.env.example). Bắt buộc: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `OLLAMA_API_KEY`.

## Triển khai VM

```bash
# Từ máy dev (đã có SSH key lab)
scp -i .lab_ssh/id_ed25519 -r scripts/pipecat root@$VM_IP:/tmp/pipecat-src
ssh -i .lab_ssh/id_ed25519 root@$VM_IP 'bash /tmp/pipecat-src/install.sh && bash /tmp/pipecat-src/deploy_asterisk.sh'
# Sửa /opt/pipecat-voicebot/.env — điền key
cp /opt/pipecat-voicebot/pipecat-voicebot.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now pipecat-voicebot
```

## Kiểm tra

```bash
curl -s http://127.0.0.1:10003/health
asterisk -rx "dialplan show from-internal@9999"
```

Softphone: gọi **9999** sau khi REGISTER extension lab.

## Ghi âm cuộc gọi 9999 (MixMonitor)

- **Trên VM:** `/var/spool/asterisk/monitor/voicebot/voicebot-*.wav` (hai chiều: bạn + bot).
- **Về repo:** từ thư mục lab:

```bash
chmod +x scripts/pipecat/sync_audio_from_vm.sh
./scripts/pipecat/sync_audio_from_vm.sh           # kéo một lần → audio/
./scripts/pipecat/sync_audio_from_vm.sh --watch # tự kéo sau mỗi cuộc gọi (8s/lần)
```

Tùy chọn đẩy tự động khi cúp máy: `AUDIO_SYNC_DEST` trong `/opt/pipecat-voicebot/.env` (xem `.env.example`).

## Chủ đề agent

Hướng dẫn **đăng ký thẻ**, **khóa thẻ**, **mở/kích hoạt thẻ** — prompt trong [prompts.py](prompts.py).
