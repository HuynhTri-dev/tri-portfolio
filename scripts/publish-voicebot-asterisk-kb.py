#!/usr/bin/env python3
"""
name: publish-voicebot-asterisk-kb.py
description: Script to publish the Asterisk 22 + Pipecat + ElevenLabs + Ollama voicebot guide and verified problem case studies to Cloudflare D1.
"""

from __future__ import annotations
import os
import json
import urllib.request
import re

API_KEY = os.environ.get("KB_API_KEY", "5de9c7cfa51867655958cb43d65683dd840aaa65dc802cc58f56921a31f15237")
ENDPOINTS = [
    "https://trihuynh.omnimer.io.vn",
    "https://tri-portfolio.huynhminhtri1109.workers.dev"
]

article_path = "src/content/blog/voicebot-asterisk-pipecat-elevenlabs-ollama.mdx"
with open(article_path, "r", encoding="utf-8") as f:
    raw_mdx = f.read()

# Separate frontmatter from body
match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw_mdx, re.DOTALL)
if match:
    body = match.group(2).strip()
else:
    body = raw_mdx

article_payload = {
    "slug": "voicebot-asterisk-pipecat-elevenlabs-ollama",
    "title": "Xây Dựng Voicebot Điện Thoại Hoàn Chỉnh Với ElevenLabs, Pipecat, Ollama Và Asterisk 22: Cấu Hình Tối Ưu & Triển Khai Thực Chiến",
    "description": "Cẩm nang kỹ thuật thực chiến kết nối Asterisk 22 PBX với Pipecat AI, ElevenLabs STT/TTS và Ollama LLM. Hướng dẫn toàn diện cấu hình chan_websocket slin16, khử vang loa ngoài SttEchoGate, tối ưu độ trễ VAD và xử lý các lỗi production then chốt.",
    "isKnowledgeBase": True,
    "kbCategory": "ai-agents",
    "targetAgents": ["claude", "cursor", "codex", "anti"],
    "summaryForAgents": "End-to-end production guide for building telephony AI voicebots with Asterisk 22, Pipecat 1.x, ElevenLabs (STT scribe_v2 & TTS eleven_v4_turbo), and Ollama (OpenAI-compatible LLM). Details chan_websocket outbound Dial with slin16 PCM 16kHz, custom SttEchoGateProcessor for acoustic loop prevention and barge-in unblocking, latency calibration (VAD_STOP_SECS=0.22s, STT_TTFS=0.85s), opening greeting via TTSSpeakFrame, and verified fixes for eleven_v4_turbo 400 errors and Asterisk mute deadlocks.",
    "content": body
}

problem_1 = {
    "title": "Lỗi TTS Câm Nín Do ElevenLabs v4 Turbo Báo HTTP 400 Khi Bật optimize_streaming_latency",
    "errorCode": "ERR_ELEVENLABS_V4_TURBO_LATENCY_BAD_REQUEST",
    "errorSnippet": "aiohttp.client_exceptions.ClientResponseError: 400, message='Bad Request', url='https://api.elevenlabs.io/v1/text-to-speech/.../stream' - optimize_streaming_latency is not supported for eleven_v4_turbo",
    "environment": "Python 3.11+, Pipecat 1.x, ElevenLabs API (eleven_v4_turbo)",
    "rootCause": "Model eleven_v4_turbo không hỗ trợ tham số optimize_streaming_latency. Nếu client gửi kèm tham số này, API ElevenLabs trả về mã lỗi HTTP 400 khiến toàn bộ audio output bị gián đoạn.",
    "solution": "Trong cấu hình ElevenLabsHttpTTSService, kiểm tra tên model và không truyền optimize_streaming_latency nếu model thuộc dòng v4.",
    "tags": ["elevenlabs", "tts", "eleven_v4_turbo", "http-400", "silent-bot"]
}

problem_2 = {
    "title": "Hiện Tượng Bot Kẹt Câm Ở Lượt Nói Thứ 2 Do AlwaysUserMuteStrategy Xung Đột Với Buffer Asterisk",
    "errorCode": "ERR_ALWAYS_USER_MUTE_ASTERISK_BUFFER_DEADLOCK",
    "errorSnippet": "Lượt thoại đầu diễn ra bình thường, nhưng lượt thứ 2 khách hàng nói thì bot hoàn toàn im lặng, không ghi nhận TranscriptionFrame nào dù cuộc gọi vẫn giữ kết nối.",
    "environment": "Asterisk 22, chan_websocket, Pipecat 1.x, AlwaysUserMuteStrategy",
    "rootCause": "Buffer đệm âm thanh của Asterisk chan_websocket khiến sự kiện BotStoppedSpeakingFrame bị delay hoặc lệch nhịp, làm AlwaysUserMuteStrategy khóa vĩnh viễn quyền thu mic của người dùng.",
    "solution": "Bỏ AlwaysUserMuteStrategy và thay bằng SttEchoGateProcessor độc lập đặt trước STT để chủ động drop audio frame khi bot đang nói.",
    "tags": ["pipecat", "asterisk", "mute-deadlock", "turn-taking", "telephony"]
}

problem_3 = {
    "title": "Hiện Tượng Lặp Câu Vọng Loa Ngoài (Acoustic Echo Loop) Khi Khách Bật Speakerphone",
    "errorCode": "ERR_ACOUSTIC_FEEDBACK_SPEAKERPHONE_LOOP",
    "errorSnippet": "Khách bật loa ngoài: Bot dứt câu chào thì STT nhận diện lại chính câu chào đó và LLM trả lời, tạo thành vòng lặp âm thanh phản hồi vô tận.",
    "environment": "Asterisk 22, Softphone / PSTN, Pipecat 1.x, ElevenLabs STT",
    "rootCause": "Kênh thoại SIP/PSTN không có sẵn AEC phần cứng như WebRTC. Âm thanh từ loa điện thoại dội thẳng vào micro và STT nhạy nhận diện lại chính tiếng bot.",
    "solution": "Sử dụng SttEchoGateProcessor chặn audio micro trong suốt thời gian bot phát thoại + tail_secs 0.18s, kết hợp Silero VAD nội bộ để mở mic ngay khi khách nói chen ngang (barge-in).",
    "tags": ["acoustic-echo", "speakerphone", "echo-gate", "barge-in", "pipecat"]
}

def send_post(base_url: str, path: str, payload: dict):
    url = f"{base_url.rstrip('/')}{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            res_data = json.loads(res.read().decode("utf-8"))
            print(f"✅ [{base_url}] POST {path} -> {res.status} OK")
            return res_data
    except Exception as e:
        print(f"❌ [{base_url}] POST {path} -> Error: {e}")
        return None

for endpoint in ENDPOINTS:
    print(f"\n🚀 Đang xuất bản bài viết Voicebot Asterisk + Pipecat lên: {endpoint}")
    # 1. Post Article
    res_art = send_post(endpoint, "/api/kb", article_payload)
    if res_art and res_art.get("success"):
        print(f"   ✓ Article published: {article_payload['slug']}")
    # 2. Post Problems
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_1)
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_2)
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_3)

print("\n🎉 Hoàn thành xuất bản bài viết lên Knowledge Base!")
