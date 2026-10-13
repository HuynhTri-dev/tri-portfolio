#!/usr/bin/env python3
"""
@name publish-pipecat-kb.py
@description Script to publish the Pipecat Voicebot Production Guide and troubleshooting case studies to local & Cloudflare D1 databases.
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

article_path = "src/content/blog/pipecat-voicebot-production-guide.mdx"
with open(article_path, "r", encoding="utf-8") as f:
    raw_mdx = f.read()

# Separate frontmatter from body
match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw_mdx, re.DOTALL)
if match:
    body = match.group(2).strip()
else:
    body = raw_mdx

article_payload = {
    "slug": "pipecat-voicebot-production-guide",
    "title": "Toàn Tập Thiết Kế Voicebot Production Với Pipecat AI: Từ Pipeline Streaming Đến Kiến Trúc Phân Tán Thực Chiến",
    "description": "Cẩm nang chuyên sâu toàn diện về Pipecat 1.x (1.12+): Bản chất Pipeline & Frame ba làn, WebRTC/WebSocket, Silero VAD + Smart Turn v3 tiếng Việt, Interruption tức thì, Quản lý context & Direct Function Calling, RTVI Protocol, Evals và Triển khai Production quy mô lớn.",
    "isKnowledgeBase": True,
    "kbCategory": "ai-agents",
    "targetAgents": ["claude", "cursor", "codex", "anti"],
    "summaryForAgents": "Comprehensive production architecture and engineering guide for building real-time voicebots with Pipecat 1.x (1.12+). Covers Frame hierarchy (SystemFrame, DataFrame, ControlFrame), directional pipeline flow, WebRTC vs WebSocket transports, Silero VAD + Smart Turn v3 (with 23-language multilingual support including Vietnamese), interruption (barge-in) mechanics, universal LLMContext and direct function calling, Pipecat Flows state graphs, RTVI protocol & client SDKs, UserBotLatencyObserver breakdown, ProcessorUnusablePolicy resilience, and containerized process-per-session deployment on Pipecat Cloud or Docker.",
    "content": body
}

problem_1 = {
    "title": "Lỗi Turn Detection và Ngắt Lời Bị Hỏng Do Tham Số Cũ allow_interruptions=True Bị Bỏ Qua Im Lặng",
    "errorCode": "ERR_PIPECAT_PARAM_SILENTLY_IGNORED",
    "errorSnippet": "Pipeline khởi động bình thường không báo lỗi: Started WorkerRunner with 1 worker(s). Nhưng người dùng nói chen vào thì Bot không ngắt lời, phớt lờ hoàn toàn lượt nói.",
    "environment": "Python 3.11 / 3.12, Pipecat 1.x (1.0 - 1.12+), Pydantic v2",
    "rootCause": "Tham số allow_interruptions=True trong PipelineParams đã bị xóa ở Pipecat 1.0. Do Pydantic bỏ qua tham số lạ trong im lặng nên app không crash nhưng mất hoàn toàn khả năng nhận diện ngắt lời.",
    "solution": "1. Xóa allow_interruptions khỏi PipelineParams.\n2. Chuyển cấu hình sang LLMUserAggregatorParams với user_turn_strategies (VADUserTurnStartStrategy và TurnAnalyzerUserTurnStopStrategy kết hợp LocalSmartTurnAnalyzerV3).",
    "tags": ["pipecat", "turn-detection", "interruption", "pydantic", "silent-failure"]
}

problem_2 = {
    "title": "Hiện Tượng Bot Im Lặng (Silent Bot) Do Quên Gọi push_frame Trong Custom FrameProcessor",
    "errorCode": "ERR_FRAME_PROCESSOR_DROP_PIPELINE",
    "errorSnippet": "InputAudioRawFrame và TranscriptionFrame xuất hiện trong log của Custom Processor, nhưng LLM không sinh câu trả lời và TTS không phát âm thanh. Không có Exception.",
    "environment": "Python 3.11 / 3.12, Pipecat 1.x, Custom FrameProcessor Middleware",
    "rootCause": "Override process_frame nhưng quên gọi await self.push_frame(frame, direction). Khi frame bị nuốt chửng, các processor phía sau (user_aggregator, llm, tts) không bao giờ nhận được dữ liệu để phản hồi.",
    "solution": "Tuân thủ 3 quy tắc sống còn của FrameProcessor:\n1. await super().process_frame(frame, direction)\n2. Kiểm tra type bằng isinstance()\n3. Bắt buộc kết thúc bằng await self.push_frame(frame, direction).",
    "tags": ["pipecat", "frame-processor", "silent-bot", "push-frame", "pipeline-stall"]
}

problem_3 = {
    "title": "Lệch Ngữ Cảnh Hội Thoại Khi Bị Ngắt Lời Do Đặt assistant_aggregator Trước transport.output",
    "errorCode": "ERR_CONTEXT_DESYNC_ON_BARGE_IN",
    "errorSnippet": "Người dùng ngắt lời bot ở câu 1 của câu trả lời 4 câu, nhưng lượt tiếp theo LLM coi như người dùng đã nghe toàn bộ 4 câu và không chịu giải thích lại nội dung các câu sau.",
    "environment": "Python 3.11 / 3.12, Pipecat 1.x, Universal LLMContext",
    "rootCause": "Đặt assistant_aggregator trước transport.output(). Khi TTS vừa tổng hợp xong text, assistant_aggregator đã ghi toàn bộ vào LLMContext dù âm thanh chưa kịp phát ra loa cho người dùng nghe.",
    "solution": "Luôn đặt assistant_aggregator ngay sau transport.output() trong mảng Pipeline. Điều này đảm bảo khi người dùng ngắt lời (barge-in), context chỉ ghi nhận đúng những từ người dùng đã thực tế nghe được.",
    "tags": ["pipecat", "llm-context", "barge-in", "interruption", "context-desync"]
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
    print(f"\n🚀 Đẩy bài viết Pipecat Voicebot lên: {endpoint}")
    # 1. Post Article
    res_art = send_post(endpoint, "/api/kb", article_payload)
    if res_art and res_art.get("success"):
        print(f"   ✓ Article published: {article_payload['slug']}")
    # 2. Post Problem 1
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_1)
    # 3. Post Problem 2
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_2)
    # 4. Post Problem 3
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_3)

print("\n🎉 Hoàn thành xuất bản tài liệu Pipecat lên hệ thống!")
