# Voicebot: Asterisk 22 + Pipecat (số 9999)

Tài liệu thiết kế và triển khai luồng **gọi extension 9999** từ context lab (`from-internal`) → **media hai chiều** → **Pipecat** (STT → LLM → TTS).

**Điều kiện lab hiện tại:**

- Asterisk **22.11** (build từ [`install_asterisk.sh`](../../install_asterisk.sh))
- Extension PJSIP wizard, `endpoint/context = from-internal` — xem [06-wizard-extension-template.md](06-wizard-extension-template.md)
- **999** = IVR `Playback` một chiều — xem [08-ivr-queue-voicemail.md](08-ivr-queue-voicemail.md)
- **9999** = voicebot (tài liệu này)

**Trạng thái triển khai VM lab (`lab-Leon-13-10-2026`, cập nhật 2026-10-13):**

| Hạng mục | Trạng thái |
|----------|------------|
| `chan_websocket.so`, `res_websocket_client.so` | **Running** |
| `[pipecat]` → `ws://127.0.0.1:10003/asterisk` | **Đã merge** (`scripts/pipecat/deploy_asterisk.sh`) |
| `exten => 9999` trong `from-internal` | **Đã merge** (`c(slin16)`) |
| Pipecat systemd `pipecat-voicebot` | **`/opt/pipecat-voicebot`**, listen `127.0.0.1:10003` |
| Stack AI | ElevenLabs STT/TTS + Ollama Cloud LLM — xem [§7.5](#75-voicebot-trong-repo-scriptspipecat) |
| Softphone / firewall | [config_softphone.md](../../scripts/asterisk/config_softphone.md) (Vultr + **UFW** trên VM) |

Mã nguồn bot: [`scripts/pipecat/`](../../scripts/pipecat/). Tài liệu này gồm **hướng dẫn cấu hình**, **lỗi đã sửa trên lab** và **gợi ý tối ưu** cho lần triển khai sau.

---

## 0. Kiến thức nền — từ cuộc gọi SIP đến frame Pipecat

### 0.1 Hai leg, một bridge

Khi 10001 gọi 9999:

1. **Leg A (PJSIP):** SIP/RTP giữa softphone và Asterisk — codec wizard **ulaw/alaw** (8 kHz).
2. **Answer():** Asterisk nhấc máy leg A (stop ringback).
3. **Dial(WebSocket/pipecat/...):** Tạo **leg B** (`chan_websocket`), `res_websocket_client` mở WS tới Pipecat.
4. **Bridge:** Asterisk ghép leg A ↔ leg B — user nói vào mic → RTP ulaw → transcoding → **slin16** frames trên WS → Pipecat STT.

```text
  [Phone] --ulaw RTP--> [PJSIP leg] === bridge === [WS leg] --slin16 WS--> [Pipecat]
```

Bạn **không** cần tự decode RTP trong Pipecat khi dùng `AsteriskFrameSerializer` — Asterisk đã chuẩn hóa media trên WebSocket.

### 0.2 `slin16` trong Dial()

`c(slin16)` = codec **signed linear PCM 16-bit, 16 kHz** trên kênh WebSocket (tham số channel driver). Phải **khớp** pipeline Pipecat (sample rate, mono). Đổi sang `slin` / `slin8` thì đồng bộ cả dialplan và resampler trong bot.

### 0.3 Outbound WebSocket (lab)

Asterisk là **client** WS (`connection_type = per_call_config`): mỗi cuộc gọi 9999 = một TCP connect tới `uri`. Pipecat **listen** — phù hợp firewall (lab: chỉ `127.0.0.1:10003`, không public).

Khác **PJSIP WebRTC** (`transport-wss`) — signaling SIP cho browser; voicebot dùng **media channel** `chan_websocket`, không nhầm hai stack ([10-webrtc-tls-srtp.md](10-webrtc-tls-srtp.md)).

**Lab:** Pipecat lắng nghe cổng **10003** (không phải 8765 trong ví dụ upstream). `websocket_client.conf` và `deploy_asterisk.sh` phải khớp `PIPECAT_PORT`.

### 0.4 Module map (lab verified)

| Module | Vai trò trong 9999 |
|--------|-------------------|
| `chan_pjsip` | Leg user |
| `app_dial` | `Dial(WebSocket/...)` |
| `chan_websocket` | Leg media WS |
| `res_websocket_client` | Config `[pipecat]`, kết nối URI |
| `res_http_websocket` | Stack WS (dùng chung HTTP core) |
| `bridge_simple` (typical) | Nối hai leg khi Dial answer |

Stasis/ARI **không** bắt buộc cho luồng này — so sánh: [13-nang-cao-stasis-ha.md](13-nang-cao-stasis-ha.md).

---

## 1. Mục tiêu kiến trúc

```text
┌─────────────┐   SIP/RTP    ┌──────────────────┐   WebSocket (slin16)   ┌─────────────────┐
│ Softphone   │ ───────────► │ Asterisk 22      │ ─────────────────────► │ Pipecat         │
│ 10001…      │   ulaw/alaw  │ from-internal    │   PCM + control JSON   │ VAD/STT/LLM/TTS │
└─────────────┘              │ exten 9999       │                        └─────────────────┘
                             └──────────────────┘
```

| Thành phần | Vai trò |
|------------|---------|
| PJSIP endpoint | User REGISTER, gọi `9999` |
| Dialplan | `Answer()` → nối kênh caller với kênh WebSocket |
| `chan_websocket` | Driver media tới app (không cần tự xử lý RTP như ARI externalMedia) |
| Pipecat | Pipeline realtime AI voice |

---

## 2. Chọn đường tích hợp

| Phương án | Asterisk | Pipecat | Khuyến nghị |
|-----------|----------|---------|-------------|
| **WebSocket channel** | `Dial(WebSocket/.../c(slin16))` + `websocket_client.conf` | [pipecat-asterisk](https://github.com/NikolayShakin/pipecat-asterisk), [AsteriskFrameSerializer](https://docs.pipecat.ai/api-reference/server/services/serializers/asterisk) | **Có** — Asterisk ≥ 22.6 (lab 22.11) |
| **AudioSocket** | `AudioSocket(host:port)` | Chưa có transport Pipecat chính thức; server TCP tự viết | Chỉ khi không dùng WS |
| **ARI + Stasis** | `Stasis(app)` + externalMedia | App ARI tự bridge | Linh hoạt, phức tạp |

Tài liệu này theo **WebSocket outbound** (Asterisk **gọi ra** Pipecat khi có cuộc gọi 9999).

Tham chiếu Asterisk: [WebSocket channel driver](https://docs.asterisk.org/Configuration/Channel-Drivers/WebSocket/).

---

## 3. Module Asterisk cần có

Trên server:

```bash
asterisk -rx "core show version"
asterisk -rx "module show like websocket"
```

Kỳ vọng trên lab **22.11.0** (đã kiểm tra):

| Module | Status |
|--------|--------|
| `chan_websocket.so` | Running |
| `res_websocket_client.so` | Running (Use Count 2 — client stack loaded) |
| `res_http_websocket.so` | Running |
| `res_pjsip_transport_websocket.so` | Running (cho SIP WSS, không dùng trong 9999) |

Nếu **không** có: `menuselect` bật WebSocket — [03-cai-dat-va-thu-muc.md](03-cai-dat-va-thu-muc.md).

---

## 4. Context và dialplan (9999)

Extension lab đã vào `from-internal`. Thêm block **9999** (không conflict với `_1XXXX` vì match exact trước).

File mẫu trong repo: [examples/extensions_9999_pipecat.conf](examples/extensions_9999_pipecat.conf).

```ini
[from-internal]
; ... giữ 999 và _1XXXX ...

exten => 9999,1,NoOp(=== Pipecat voicebot === caller ${CALLERID(num)})
 same => n,Set(BOT_CALLER=${CALLERID(num)})
 same => n,Answer()
 same => n,Dial(WebSocket/pipecat/c(slin16)v(caller=${URIENCODE(${BOT_CALLER})},linkedid=${URIENCODE(${CHANNEL(linkedid)})}))
 same => n,NoOp(Voicebot end DIALSTATUS=${DIALSTATUS})
 same => n,Hangup()
```

| Bước | Ý nghĩa |
|------|---------|
| `Answer()` | Nhấc máy trước khi `Dial` WebSocket |
| `Dial(WebSocket/pipecat/...)` | `pipecat` = tên section trong `websocket_client.conf` |
| `c(slin16)` | Audio PCM 16-bit signed linear 16 kHz (chuẩn Pipecat + serializer) |
| `v(...)` | Tham số URI gửi sang app (caller, linkedid cho log/CDR) |

**Cuộc gọi từ trunk (sau này):**

```ini
[from-pstn]
exten => _X.,1,Goto(from-internal,9999,1)
; hoặc chỉ DID cụ thể: exten => 02812349999,1,Goto(from-internal,9999,1)
```

**Context riêng (tùy chọn):**

```ini
[voicebot]
exten => s,1,Answer()
 same => n,Dial(WebSocket/pipecat/c(slin16),,g)
 same => n,Hangup()

[from-internal]
exten => 9999,1,Goto(voicebot,s,1)
```

Reload:

```bash
asterisk -rx "dialplan reload"
asterisk -rx "dialplan show from-internal@9999"
```

---

## 5. WebSocket client (Asterisk → Pipecat)

Tạo hoặc merge [examples/websocket_client.pipecat.conf](examples/websocket_client.pipecat.conf) vào `/etc/asterisk/websocket_client.conf` (hoặc file được `websocket_client.conf` include).

```ini
[pipecat]
type = websocket_client
uri = ws://127.0.0.1:10003/asterisk
protocols = media
connection_type = per_call_config
connection_timeout = 5000
reconnect_interval = 1000
reconnect_attempts = 3
tls_enabled = no
```

| Tham số | Ghi chú |
|---------|---------|
| `uri` | Endpoint WS của Pipecat; **cùng VM** → `127.0.0.1` |
| `connection_type = per_call_config` | Mỗi cuộc gọi 9999 = một kết nối WS mới |
| `per_call_config` | Khớp mô hình “một bot session / một call” |

Pipecat trên **máy khác**: đổi IP (private VPC), mở firewall **chỉ** từ IP Asterisk; production nên `wss://` + `tls_enabled = yes`.

Đảm bảo `websocket_client.conf` được load (mặc định Asterisk 22 thường có). Reload:

```bash
asterisk -rx "module reload res_websocket_client.so"
```

---

## 6. HTTP / media URI (khi dùng INCOMING)

Luồng lab dùng **outbound** `Dial(WebSocket/pipecat/...)` — Pipecat **lắng nghe**, Asterisk **kết nối tới**.

Luồng **INCOMING** (`Dial(WebSocket/INCOMING/c(slin16))`) cần Asterisk HTTP server và app connect vào `/media/<connection_id>`. Phức tạp hơn; chỉ dùng nếu firewall chỉ cho Asterisk nhận inbound WS.

---

## 7. Pipecat — phía ứng dụng

### 7.1 Phụ thuộc

```bash
pip install pipecat-ai pipecat-asterisk fastapi uvicorn
# + STT/LLM/TTS theo provider (OpenAI, Google, Deepgram, …)
```

### 7.2 Mô hình code (rút gọn)

Pipecat nhận WebSocket từ Asterisk, deserialize frame, chạy pipeline:

```python
# Minh họa — không chạy standalone trong repo lab; đặt trong service riêng (vd. /opt/pipecat-bot/)
from fastapi import FastAPI, WebSocket
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat_asterisk import AsteriskWebsocketTransport  # hoặc FastAPIWebsocketTransport + AsteriskFrameSerializer

app = FastAPI()

@app.websocket("/asterisk")
async def asterisk_ws(websocket: WebSocket):
    await websocket.accept()
    transport = AsteriskWebsocketTransport(websocket=websocket)
    pipeline = Pipeline([
        transport.input(),
        # ... VAD, STT, LLM context, TTS ...
        transport.output(),
    ])
    runner = PipelineRunner()
    await runner.run(pipeline)
```

Chi tiết example đầy đủ: repository [NikolayShakin/pipecat-asterisk](https://github.com/NikolayShakin/pipecat-asterisk) (`examples/pipecat_asterisk/`).

### 7.3 Audio

- Serializer/transport thiết kế cho **`slin`** (PCM).
- Dialplan lab dùng **`slin16`** — khớp wideband 16 kHz; nếu đổi `slin` / `slin8`, đồng bộ cả hai đầu và resampling trong pipeline.

### 7.4 Chạy service (lab)

```bash
# Health (FastAPI)
curl -s http://127.0.0.1:10003/health

# Log cuộc gọi
journalctl -u pipecat-voicebot -f
```

| Bước | Lệnh / đường dẫn |
|------|------------------|
| Cài / cập nhật code | `bash scripts/pipecat/install.sh` → `/opt/pipecat-voicebot` |
| Merge Asterisk | `bash scripts/pipecat/deploy_asterisk.sh` |
| Biến môi trường | `/opt/pipecat-voicebot/.env` (mẫu: `scripts/pipecat/.env.example`) |
| Sync `.env` từ máy dev | `scripts/pipecat/sync_env_to_vm.sh` (nếu dùng) |
| Systemd | `pipecat-voicebot.service` → `systemctl enable --now pipecat-voicebot` |

**Tài nguyên:** VM lab 2 vCPU / 4 GB — voicebot chạy process riêng; theo dõi CPU khi STT+LLM+TTS đồng thời.

### 7.5 Voicebot trong repo (`scripts/pipecat`)

Pipeline thực tế (một cuộc gọi = một WebSocket Asterisk):

```text
Asterisk WS in
  → SttEchoGateProcessor     # chặn mic vào STT khi bot nói; VAD mở khi chen lời
  → ElevenLabs STT (scribe_v2)
  → LLMUserAggregator (Silero VAD + turn strategies)
  → Ollama Cloud LLM (gemma4:cloud)
  → ElevenLabs HTTP TTS (eleven_v4_turbo @ 16 kHz)
  → Asterisk WS out (flow controller — buffer phía Asterisk)
  → LLMAssistantAggregator
```

| File | Vai trò |
|------|---------|
| `main.py` | FastAPI `/asterisk` WS + `/health` |
| `bot.py` | Pipeline, greeting `TTSSpeakFrame`, turn / interruption |
| `config.py` | Đọc `.env` |
| `prompts.py` | System prompt CSKH Bắc Á + lời chào mở đầu |
| `stt_echo_gate.py` | Giảm vang loa + hỗ trợ barge-in |
| `pipeline_log.py` | Log INFO: STT transcript, LLM reply, interruption |

**Lời chào cố định** (không qua LLM): `OPENING_GREETING_TEXT` trong `prompts.py`, phát sau `MEDIA_READY_DELAY_SECS` khi WS + `MEDIA_START` sẵn sàng.

### 7.6 Biến môi trường quan trọng

Copy từ [`scripts/pipecat/.env.example`](../../scripts/pipecat/.env.example). Trên VM: `/opt/pipecat-voicebot/.env`. Không commit file `.env` có API key.

| Biến | Mục đích | Giá trị lab (2026-10-13) |
|------|----------|---------------------------|
| `PIPECAT_PORT` | Cổng listen | `10003` |
| `PIPECAT_SAMPLE_RATE` | Hz pipeline | `16000` (`c(slin16)`) |
| `ELEVENLABS_STT_MODEL` | STT | `scribe_v2` |
| `ELEVENLABS_TTS_MODEL` | TTS | `eleven_v4_turbo` — **không** `ELEVENLABS_TTS_OPTIMIZE_LATENCY` |
| `ELEVENLABS_STT_TTFS_P99_LATENCY` | Buffer STT / turn analyzer | **`0.85`** — khớp `VAD_STOP_SECS` ~0.2s |
| `OLLAMA_MODEL` | LLM | `gemma4:cloud` |
| `OLLAMA_MAX_COMPLETION_TOKENS` | Độ dài câu trả lời | **`280`** (ngắn → TTS nhanh) |
| `MEDIA_READY_DELAY_SECS` | Trước lời chào | **`0.3`** |
| `STT_ECHO_GATE_TAIL_SECS` | Chặn mic sau TTS | **`0.18`** |
| `PIPECAT_ENABLE_INTERRUPTIONS` | Chen lời | `true` |
| `STT_ECHO_GATE_BARGE_IN` | VAD mở gate khi chen lời | `true` |
| `LOG_LEVEL` | Log | `INFO` |

Sửa `.env` trên VM → `systemctl restart pipecat-voicebot`. Đẩy từ repo lab: [`sync_env_to_vm.sh`](../../scripts/pipecat/sync_env_to_vm.sh) (chỉ biến có trong root `.env`).

### 7.6.1 Cấu hình VAD (Silero)

VAD chạy trên **LLM user aggregator** (sau STT): quyết định **khi nào khách “dừng nói”** → gửi lượt sang LLM. **Echo gate** dùng bản Silero **riêng** (cùng tham số) chỉ để phát hiện chen lời.

| Biến | Lab | Ý nghĩa | Gợi ý chỉnh |
|------|-----|---------|-------------|
| `VAD_CONFIDENCE` | `0.7` | Ngưỡng “có giọng” | Tăng (0.75–0.8) nếu loa ồn kích nhầm |
| `VAD_START_SECS` | `0.2` | Xác nhận **bắt đầu** nói | Giữ; giảm → nhạy hơn |
| `VAD_STOP_SECS` | **`0.22`** | Im lặng bao lâu thì **chốt lượt** | **↑ 0.28–0.35** nếu câu bị cắt giữa chừng; **↓ 0.2** nếu bot phản hồi chậm |
| `VAD_MIN_VOLUME` | `0.5` | Volume tối thiểu | Tăng khi demo loa ngoài / vang |

**Khớp STT:** khi đổi `VAD_STOP_SECS`, cập nhật `ELEVENLABS_STT_TTFS_P99_LATENCY` (thường ≈ `0.8`–`1.0` cho stop ~0.2s). Pipecat log có thể warning *“VAD stop_secs differs from recommended 0.2s”* — bình thường nếu bạn chủ đích dùng 0.22.

**Luồng trễ cảm nhận (rút gọn):** khách ngừng nói → chờ `VAD_STOP_SECS` → STT final → LLM → HTTP TTS → buffer Asterisk. Giảm `VAD_STOP_SECS`, `STT_TTFS`, `ECHO_GATE_TAIL`, `max_tokens` là các nút chính trên lab (không đổi model).

```bash
# Kiểm tra sau restart
ssh root@$VM_IP 'grep ^VAD_ /opt/pipecat-voicebot/.env; journalctl -u pipecat-voicebot -n 3 --no-pager | grep "VAD stop"'
```

### 7.7 Hành vi thoại (echo, chen lời, mute)

| Cơ chế | Mục đích |
|--------|----------|
| **SttEchoGate** | Trong lúc bot phát TTS, **không** gửi PCM vào STT → tránh bot “nghe lại” chính mình trên **loa ngoài**. |
| **Barge-in VAD** (trong echo gate) | Khi khách nói đè lên bot, gate **mở** mic → STT + aggregator nhận audio. |
| **`enable_interruptions=True`** | `VADUserTurnStartStrategy` / `TranscriptionUserTurnStartStrategy` phát `InterruptionFrame` → dừng TTS, lắng nghe. |
| **Không dùng `AlwaysUserMuteStrategy`** | Trên lab gây **kẹt muted** sau TTS (lượt 2 không lên LLM) nếu `BotStoppedSpeaking` trễ do buffer Asterisk. |

Tắt chen lời (bot đọc hết câu): `PIPECAT_ENABLE_INTERRUPTIONS=false` và có thể `STT_ECHO_GATE_BARGE_IN=false`.

### 7.8 Ghi âm cuộc gọi (MixMonitor)

**MixMonitor** ghi **hai chiều** trên một file WAV mono: giọng khách (softphone) + giọng bot (leg WebSocket/Pipecat), trong lúc kênh đã bridge (`Dial` WebSocket).

#### Bật / cập nhật trên VM

Snippet nguồn: [`scripts/pipecat/asterisk/extensions_9999_pipecat.conf.snippet`](../../scripts/pipecat/asterisk/extensions_9999_pipecat.conf.snippet).

```ini
 same => n,Set(VOICEBOT_REC_DIR=/var/spool/asterisk/monitor/voicebot)
 same => n,System(mkdir -p ${VOICEBOT_REC_DIR} && chown asterisk:asterisk ${VOICEBOT_REC_DIR})
 same => n,Answer()
 same => n,Set(MIXMON_FILE=${VOICEBOT_REC_DIR}/voicebot-${STRFTIME(${EPOCH},,%Y%m%d-%H%M%S)}-${BOT_CALLER}-${CHANNEL(linkedid)})
 same => n,MixMonitor(${MIXMON_FILE}.wav,b,/opt/pipecat-voicebot/scripts/mixmonitor_post.sh ^{MIXMONITOR_FILENAME})
 same => n,Dial(WebSocket/pipecat/c(slin16)v(...))
```

| Thành phần | Ghi chú |
|------------|---------|
| Option **`b`** | Chỉ ghi khi đã **bridge** (tránh đoạn im trước khi bot nối media) |
| `^{MIXMONITOR_FILENAME}` | Asterisk truyền đường dẫn file vào script khi **cúp máy** |
| `mixmonitor_post.sh` | Log `logger -t mixmonitor_post`; tùy chọn `scp` nếu có `AUDIO_SYNC_DEST` |

Triển khai / cập nhật dialplan (ghi đè block `lab-pipecat-voicebot-9999`):

```bash
ssh -i .lab_ssh/id_ed25519 root@$VM_IP 'bash /opt/pipecat-voicebot/deploy_asterisk.sh'
asterisk -rx "dialplan show 9999@from-internal"   # trên VM — phải thấy MixMonitor
```

#### Vị trí file

| Nơi | Đường dẫn |
|-----|-----------|
| **VM (sau cuộc gọi)** | `/var/spool/asterisk/monitor/voicebot/voicebot-YYYYMMDD-HHMMSS-<ext>-<linkedid>.wav` |
| **Máy dev (repo)** | `audio/*.wav` tại root project `06-10-2026/audio/` |
| **Git** | `audio/.gitignore` bỏ qua `*.wav` — không commit bản ghi |

Correlate với log Pipecat: `linkedid` trong tên file = query WS `?linkedid=...`.

#### Sync về local (kéo từ VM)

Script: [`scripts/pipecat/sync_audio_from_vm.sh`](../../scripts/pipecat/sync_audio_from_vm.sh) (đọc `VM_IP` từ `.env` repo, SSH key `.lab_ssh/id_ed25519`).

```bash
cd /path/to/06-10-2026
chmod +x scripts/pipecat/sync_audio_from_vm.sh

# Sau mỗi buổi gọi / quay demo — kéo file mới (rsync --ignore-existing)
./scripts/pipecat/sync_audio_from_vm.sh

# Tự kéo mỗi 8 giây trong lúc quay
./scripts/pipecat/sync_audio_from_vm.sh --watch
```

Kiểm tra:

```bash
ls -lt audio/voicebot-*.wav | head
```

Trên VM (chưa sync):

```bash
ls -lt /var/spool/asterisk/monitor/voicebot/
journalctl -t mixmonitor_post --since today
```

#### Tùy chọn: VM đẩy thẳng khi cúp máy

Trong `/opt/pipecat-voicebot/.env` (xem `.env.example`):

```bash
AUDIO_SYNC_DEST=user@IP-MAC:/Users/you/Downloads/idb/06-10-2026/audio
```

Cần **SSH từ VM → máy dev** (Mac bật Remote Login, key trên VM). Nếu không setup, chỉ dùng **`sync_audio_from_vm.sh`** (kéo từ Mac → VM).

#### Lưu ý

- MixMonitor **không** thay luồng realtime tới softphone; chỉ để nghe lại / hậu kỳ video.
- Pipecat **không** ghi WAV riêng — toàn bộ ghi âm lab qua Asterisk.
- Đổi tên file local (ví dụ `leon_voicebot-....wav`) là thao tác tay sau sync; script VM luôn tạo prefix `voicebot-`.

---

## 8. So sánh 999 vs 9999

| | **999** | **9999** |
|---|---------|----------|
| Loại | IVR tĩnh | Voicebot AI |
| Media | `Playback(wav)` một chiều | WebSocket hai chiều |
| Phụ thuộc | File trong `sounds/custom/` | Pipecat + API keys |
| Dialplan | `Answer` → `Playback` → `Hangup` | `Answer` → `Dial(WebSocket/...)` |

---

## 9. Mạng và firewall

| Luồng | Cổng |
|-------|------|
| Softphone → Asterisk | **UDP/TCP 5060**, RTP **UDP 10000–20000** |
| Asterisk → Pipecat | TCP **10003** trên `127.0.0.1` (chỉ local) |

**Hai tầng firewall (lab đã gặp lỗi):**

1. **Vultr / cloud:** whitelist IP public máy dev (SIP + RTP).
2. **UFW trên VM:** mặc định có thể chỉ mở SSH — softphone REGISTER timeout dù cloud OK.

```bash
ufw allow 5060/udp
ufw allow 5060/tcp
ufw allow 10000:20000/udp
ufw status
```

Chi tiết softphone: [`scripts/asterisk/config_softphone.md`](../../scripts/asterisk/config_softphone.md).

**Không** publish cổng WS Pipecat (`10003`) ra Internet.

---

## 10. Bảo mật

- Giữ **9999** trong `from-internal` hoặc `from-pstn` có kiểm soát DID.
- Mật khẩu SIP extension mạnh (wizard).
- API key STT/LLM trong `.env` trên server, không commit git.
- Tùy chọn: `ACL` PJSIP, fail2ban trên 5060.
- Production: TLS cho `wss://` giữa Asterisk và Pipecat.

---

## 11. CDR / Kafka (hướng mở rộng)

Lab có topic `mblife.pbx.cdr.v1` ([11-cdr-cel-ami-ari.md](11-cdr-cel-ami-ari.md)).

Gợi ý khi bot kết thúc:

- Dùng **CEL** / **CDR** Asterisk (`linkedid`, `billsec`, `disposition`).
- Hoặc Pipecat gửi event “session_end” qua HTTP → producer Kafka.

Biến dialplan `linkedid` đã truyền qua `v(linkedid=...)` để correlate log bot với CDR.

---

## 12. Kiểm thử từng bước

### 12.1 Pipecat sống

```bash
curl -s http://127.0.0.1:10003/health
systemctl is-active pipecat-voicebot
ss -lntp | grep 10003
```

### 12.2 Asterisk

```bash
asterisk -rx "dialplan show from-internal@9999"
asterisk -rvvv
```

### 12.3 Cuộc gọi

1. Softphone REGISTER extension (10001).
2. Gọi **9999**.
3. Console: kênh `PJSIP` + `WebSocket/pipecat`.
4. Log Pipecat: WS connect, frame audio.

### 12.4 Lỗi thường gặp

| Triệu chứng | Nguyên nhân / xử lý |
|-------------|---------------------|
| `Everyone is busy` / `CONGESTION` trên `Dial(WebSocket/...)` | Pipecat không chạy, URI sai cổng (`10003`), service crash — `journalctl -u pipecat-voicebot` |
| **Beep rồi cúp** ngay sau gọi 9999 | `pipecat-voicebot` **inactive** hoặc WS refuse — `systemctl start pipecat-voicebot` |
| Linphone **không REGISTER** / timeout | UFW hoặc Vultr chưa mở 5060 + RTP — [§9](#9-mạng-và-firewall) |
| Im lặng hai đầu | Codec không khớp (`slin16` vs `PIPECAT_SAMPLE_RATE`), thiếu key `.env` |
| Bot **không nói** sau LLM | TTS `eleven_v4_turbo` + `optimize_streaming_latency` → API 400; bỏ biến latency |
| Bot **lặp / “đường truyền”** trên **loa ngoài** | Echo: STT nghe TTS — cần `SttEchoGate`; tai nghe thường hết lặp |
| **Một lượt OK, lượt 2 im** | Từng gặp với `AlwaysUserMuteStrategy` — đã bỏ; kiểm tra log có `BotStoppedSpeaking` / `Echo gate: bot stopped` |
| **Không chen lời** | `PIPECAT_ENABLE_INTERRUPTIONS=false` hoặc gate chặn mic — bật `STT_ECHO_GATE_BARGE_IN` |
| Chen lời **quá nhạy** (loa ngoài) | Tăng `VAD_MIN_VOLUME`, giảm `STT_ECHO_GATE_BARGE_IN` hoặc tắt interruption |
| Phản hồi **chậm** | Giảm `VAD_STOP_SECS` (~0.22), `STT_TTFS` (~0.85), `OLLAMA_MAX_COMPLETION_TOKENS`; xem [§7.6.1](#761-cấu-hình-vad-silero) |
| Không vào 9999 | Chưa reload dialplan; gọi nhầm context |
| Warning `Invalid alignment data` (ElevenLabs TTS) | Thường vô hại với HTTP TTS; audio vẫn phát |
| Warning `VAD stop_secs differs from recommended 0.2s` | Đổi `VAD_STOP_SECS` hoặc cập nhật `ELEVENLABS_STT_TTFS_P99_LATENCY` theo benchmark |

**Đọc log một cuộc gọi** (correlate `linkedid` trong query WS):

```bash
journalctl -u pipecat-voicebot --since "10 min ago" --no-pager | grep -E "STT transcript|LLM reply|Echo gate|Barge-in|WS connected|disconnected"
```

Debug SIP (khác với WS media):

```bash
pjsip set logger on
```

---

## 13. Checklist triển khai (lần sau)

**Asterisk**

- [ ] `chan_websocket` / `res_websocket_client` Running
- [ ] `deploy_asterisk.sh` hoặc merge snippet → `uri` **10003**, `c(slin16)`
- [ ] `dialplan show from-internal@9999` → `Dial(WebSocket/pipecat/...)`
- [ ] UFW + cloud firewall: 5060, RTP 10000–20000

**Pipecat**

- [ ] `install.sh` → `/opt/pipecat-voicebot`, venv + requirements
- [ ] `.env` đầy đủ key (ElevenLabs, Ollama); port **10003**
- [ ] `systemctl enable --now pipecat-voicebot`
- [ ] `curl http://127.0.0.1:10003/health`
- [ ] Log startup: `interruptions=True`, `echo_barge_in=True` (nếu bật chen lời)

**Kiểm thử thoại**

- [ ] Gọi 9999: nghe lời chào Bắc Á
- [ ] 2–3 lượt hội thoại; log có STT + LLM mỗi lượt
- [ ] Loa ngoài: không lặp nguyên văn bot; tai nghe / chen lời: bot dừng khi nói đè

**Ghi âm & sync**

- [ ] `deploy_asterisk.sh` có **MixMonitor** trên 9999
- [ ] Sau gọi thử: file trên VM `/var/spool/asterisk/monitor/voicebot/`
- [ ] `./scripts/pipecat/sync_audio_from_vm.sh` → `audio/*.wav` trên máy dev

**Tuỳ chọn**

- [ ] CEL/CDR + `linkedid` — [11-cdr-cel-ami-ari.md](11-cdr-cel-ami-ari.md)

### Triển khai nhanh trên VM

```bash
# Từ repo lab (máy dev)
scp -i .lab_ssh/id_ed25519 -r scripts/pipecat root@$VM_IP:/tmp/pipecat-src
ssh -i .lab_ssh/id_ed25519 root@$VM_IP 'bash /tmp/pipecat-src/install.sh && bash /tmp/pipecat-src/deploy_asterisk.sh'
# Điền /opt/pipecat-voicebot/.env → systemctl restart pipecat-voicebot
```

Cập nhật code không đổi `.env`:

```bash
rsync -av --exclude .env --exclude venv scripts/pipecat/ root@$VM_IP:/opt/pipecat-voicebot/
ssh root@$VM_IP systemctl restart pipecat-voicebot
```

---

## 14. Sự cố lab đã xử lý (2026-10-13) — tra cứu nhanh

| # | Hiện tượng | Nguyên nhân gốc | Cách xử lý đã áp dụng |
|---|------------|-----------------|------------------------|
| 1 | Softphone không kết nối SIP | UFW VM chỉ SSH | Mở 5060 udp/tcp + RTP 10000–20000 |
| 2 | 9999 beep → cúp | Service Pipecat không chạy | `pipecat-voicebot.service`, enable on boot |
| 3 | Bot lặp câu / trả lời “đường truyền” | STT nghe TTS từ loa (acoustic loop) | `SttEchoGateProcessor` trước STT |
| 4 | Sau 1–2 câu bot im | `AlwaysUserMuteStrategy` kẹt sau TTS | Bỏ mute strategy; chỉ echo gate |
| 5 | TTS im sau LLM | `optimize_streaming_latency` với v4 | Không set latency cho `eleven_v4_turbo` |
| 6 | Chậm / cắt sớm | VAD + STT benchmark lệch | Tune `VAD_STOP_SECS`, `STT_TTFS_P99`; `MEDIA_READY_DELAY` |
| 7 | Muốn chen lời | `enable_interruptions=False` + gate chặn mic | Bật interruption + barge-in VAD trong gate |

Ghi chú: `pipecat-asterisk` **giữ** `TTSStoppedFrame` đến khi buffer playback Asterisk rỗng — log có thể trễ vài giây so với hết tiếng loa; không nhầm với “bot kẹt” nếu vẫn có STT sau đó.

---

## 15. Tối ưu cho triển khai sau

### 15.1 Âm thanh và UX

- Ưu tiên **tai nghe** hoặc endpoint có **AEC** khi demo loa ngoài.
- Rút `OPENING_GREETING_TEXT` / câu LLM (prompt: tối đa 2–3 câu ngắn) → giảm thời gian TTS và trễ cảm nhận.
- `MEDIA_READY_DELAY_SECS`: tăng nhẹ nếu lời chào bị cắt đầu; giảm nếu chờ quá lâu sau nhấc máy.

### 15.2 VAD / STT / lượt thoại

Cấu hình lab hiện tại: [§7.6.1](#761-cấu-hình-vad-silero) (`VAD_STOP_SECS=0.22`, `STT_TTFS=0.85`).

- Chạy [stt-benchmark](https://github.com/pipecat-ai/stt-benchmark) khi đổi `VAD_STOP_SECS` lớn hơn 0.25.
- Cân bằng: **nhanh** (stop 0.2, tail 0.18) vs **đủ câu** (stop 0.3–0.35).
- Loa ồn: tăng `VAD_MIN_VOLUME` / `VAD_CONFIDENCE` trước khi tắt barge-in.

### 15.3 Chen lời vs vang

| Mục tiêu | Gợi ý |
|----------|--------|
| Cho phép ngắt bot | `PIPECAT_ENABLE_INTERRUPTIONS=true`, `STT_ECHO_GATE_BARGE_IN=true` |
| Bot đọc hết (tắt ngắt) | `PIPECAT_ENABLE_INTERRUPTIONS=false` |
| Chỉ giảm vang, ít ngắt nhầm | Giữ gate; tăng ngưỡng VAD barge; có thể `BARGE_IN=false` |

### 15.4 Vận hành

- Giám sát: `journalctl -u pipecat-voicebot`, `asterisk -rvvv` khi debug WS.
- Rotate / không log API key; `.env` chỉ trên VM.
- Tách voicebot sang VM riêng nếu cùng host với Kafka/DB nặng.
- Production: `wss://` giữa Asterisk và Pipecat; ACL extension; rate limit API STT/LLM.

### 15.5 Hướng cải tiến kỹ thuật (chưa làm trên lab)

- TTS streaming WebSocket (nếu model hỗ trợ latency) thay HTTP chunk — giảm time-to-first-audio.
- Endpointing STT chuyên biệt thay vì chỉ Silero trên aggregator.
- Metrics (latency STT/LLM/TTS per call) export Prometheus hoặc log structured JSON.
- Correlate CDR `linkedid` với log Pipecat (đã truyền qua `v(linkedid=...)` trên Dial).

---

## 16. Tài liệu liên quan trong repo

| File | Nội dung |
|------|----------|
| [07-dialplan-context.md](07-dialplan-context.md) | Context, `Dial`, biến |
| [11-cdr-cel-ami-ari.md](11-cdr-cel-ami-ari.md) | CDR, AMI, ARI |
| [13-nang-cao-stasis-ha.md](13-nang-cao-stasis-ha.md) | Stasis (thay thế WS) |
| [lab-checklist.md](lab-checklist.md) | Extension + 999 |
| [examples/extensions_9999_pipecat.conf](examples/extensions_9999_pipecat.conf) | Snippet dialplan |
| [examples/websocket_client.pipecat.conf](examples/websocket_client.pipecat.conf) | Snippet WS client |
| [scripts/pipecat/README.md](../../scripts/pipecat/README.md) | Cài đặt, health check, MixMonitor sync |
| [scripts/pipecat/sync_audio_from_vm.sh](../../scripts/pipecat/sync_audio_from_vm.sh) | Kéo WAV VM → `audio/` |
| [scripts/asterisk/config_softphone.md](../../scripts/asterisk/config_softphone.md) | Linphone, firewall |

## 17. Liên kết ngoài

- [Asterisk — WebSocket](https://docs.asterisk.org/Configuration/Channel-Drivers/WebSocket/)
- [Pipecat — AsteriskFrameSerializer](https://docs.pipecat.ai/api-reference/server/services/serializers/asterisk)
- [pipecat-asterisk (GitHub)](https://github.com/NikolayShakin/pipecat-asterisk)
- [Pipecat issue — AudioSocket transport](https://github.com/pipecat-ai/pipecat/issues/2702) (tham khảo nếu không dùng WS)

---

**Tóm tắt:** `from-internal` + **9999** → `Dial(WebSocket/pipecat/c(slin16))` → Pipecat **`127.0.0.1:10003`**. Code lab trong `scripts/pipecat`; cấu hình `.env`, echo gate và chen lời xem [§7.5–7.7](#75-voicebot-trong-repo-scriptspipecat); sự cố đã gặp [§14](#14-sự-cố-lab-đã-xử-lý-2026-10-13--tra-cứu-nhanh).
