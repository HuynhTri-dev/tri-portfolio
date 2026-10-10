#!/usr/bin/env python3
"""
@name publish-kafka-kb.py
@description Script to publish the Kafka PBX article and troubleshooting case studies to local & Cloudflare D1 databases.
"""

from __future__ import annotations
import os
import json
import urllib.request

API_KEY = os.environ.get("KB_API_KEY", "5de9c7cfa51867655958cb43d65683dd840aaa65dc802cc58f56921a31f15237")
ENDPOINTS = [
    "http://localhost:4321",
    "https://tri-portfolio.huynhminhtri1109.workers.dev"
]

article_path = "src/content/blog/kafka-pbx-event-streaming-architecture.mdx"
with open(article_path, "r", encoding="utf-8") as f:
    raw_mdx = f.read()

# Separate frontmatter from body
import re
match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw_mdx, re.DOTALL)
if match:
    body = match.group(2).strip()
else:
    body = raw_mdx

article_payload = {
    "slug": "kafka-pbx-event-streaming-architecture",
    "title": "Kiến Trúc Event Streaming PBX Telephony: Từ Webhook sang Apache Kafka & Redpanda",
    "description": "Nghiên cứu kiến trúc thay thế webhook truyền thống trong hệ thống tổng đài PBX bằng Redpanda/Kafka. Phân tích phân bổ Partition Key theo linkedid, Consumer Groups độc lập, Offset Semantics và phòng chống Hot Partition.",
    "isKnowledgeBase": True,
    "kbCategory": "architecture",
    "targetAgents": ["claude", "cursor", "codex", "anti"],
    "summaryForAgents": "Deep-dive architecture into event-driven PBX telephony using Redpanda/Kafka. Replaces fragile HTTP webhooks with durable append-only event streams. Explains linkedid partition hashing for strict call event ordering, consumer group decoupling for CRM/Analytics/Voice-AI, offset commit semantics, and mitigation of hot partitions and rebalance storms.",
    "content": body
}

problem_1 = {
    "title": "Mất thứ tự sự kiện cuộc gọi (Call Ended chạy trước Call Answered) do thiếu Partition Key",
    "errorCode": "DATA_INCONSISTENCY_EVENT_ORDER",
    "errorSnippet": "[CRM Sync Worker] Conflict detected for call_id='1710928301.12': Received 'call.answered' but current status is already 'ENDED'.",
    "environment": "Python kafka-python / aiokafka, Redpanda v23+, Linux x86_64",
    "rootCause": "Producer gửi event nhưng đặt key=None hoặc không cấu hình serializer. Kafka sử dụng thuật toán round-robin phân tán các event của cùng một cuộc gọi sang nhiều partition khác nhau. Vì các partition được consumer đọc song song, sự kiện 'call.ended' vô tình được xử lý trước 'call.answered'.",
    "solution": "Bắt buộc mọi event liên quan đến cuộc gọi phải chỉ định key là linkedid: producer.send(topic, key=cdr['linkedid'].encode('utf-8'), value=payload). MurmurHash2 sẽ đưa toàn bộ vòng đời cuộc gọi vào cùng 1 partition, đảm bảo thứ tự thời gian tuần tự 100%.",
    "tags": ["kafka", "redpanda", "ordering", "partition-key", "pbx"]
}

problem_2 = {
    "title": "Consumer bị ngắt kết nối (CommitFailedException) và Rebalance Storm do tác vụ ASR/LLM quá tải",
    "errorCode": "CommitFailedException / REBALANCE_STORM",
    "errorSnippet": "kafka.errors.CommitFailedException: Commit cannot be completed since the group has already rebalanced and assigned the partitions to another member.",
    "environment": "Python kafka-python, Whisper ASR Worker, Ollama/LLM Summarizer",
    "rootCause": "Consumer nhận message chứa audio URL và tiến hành tải/chuyển đổi giọng nói mất hơn 5 phút. Thời gian xử lý vượt quá cấu hình max.poll.interval.ms (mặc định 300,000ms = 5 phút), khiến Broker đánh giá worker đã chết và kích hoạt Rebalance liên tục, gây đứng toàn bộ cụm.",
    "solution": "1. Tách pipeline: Consumer chỉ nhận message và đẩy tác vụ vào hàng đợi bất đồng bộ (Thread/Celery pool), lập tức hoàn tất vòng lặp poll().\n2. Hoặc tinh chỉnh cấu hình Kafka Consumer: đặt max.poll.interval.ms=900000 (15 phút) và giới hạn max.poll.records=1 để worker chỉ nhận đúng 1 audio task mỗi lần poll.",
    "tags": ["rebalance", "max-poll-interval", "asr", "timeout", "consumer-group"]
}

def send_post(base_url: str, path: str, payload: dict):
    url = f"{base_url.rstrip('/')}{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_data = json.loads(res.read().decode("utf-8"))
            print(f"✅ [{base_url}] POST {path} -> {res.status} OK")
            return res_data
    except Exception as e:
        print(f"❌ [{base_url}] POST {path} -> Error: {e}")
        return None

for endpoint in ENDPOINTS:
    print(f"\n🚀 Đẩy dữ liệu lên: {endpoint}")
    # 1. Post Article
    send_post(endpoint, "/api/kb", article_payload)
    # 2. Post Problem 1
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_1)
    # 3. Post Problem 2
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_2)

print("\n🎉 Hoàn thành đẩy nghiên cứu Kafka lên kho tri thức!")
