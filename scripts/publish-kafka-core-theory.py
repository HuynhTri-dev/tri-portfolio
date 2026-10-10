#!/usr/bin/env python3
"""
@name publish-kafka-core-theory.py
@description Script to publish the comprehensive Kafka Core Theory article and architectural case studies to local & Cloudflare D1.
"""

from __future__ import annotations
import os
import json
import urllib.request
import re

API_KEY = os.environ.get("KB_API_KEY", "5de9c7cfa51867655958cb43d65683dd840aaa65dc802cc58f56921a31f15237")
ENDPOINTS = [
    "http://localhost:4321",
    "https://tri-portfolio.huynhminhtri1109.workers.dev"
]

article_path = "src/content/blog/kafka-core-concepts-and-architecture.mdx"
with open(article_path, "r", encoding="utf-8") as f:
    raw_mdx = f.read()

match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw_mdx, re.DOTALL)
if match:
    body = match.group(2).strip()
else:
    body = raw_mdx

article_payload = {
    "slug": "kafka-core-concepts-and-architecture",
    "title": "Toàn Tập Lý Thuyết Cốt Lõi Apache Kafka: Từ Nền Tảng Event Streaming Đến Kiến Trúc Phân Tán Thực Chiến",
    "description": "Cẩm nang chuyên sâu toàn diện về Apache Kafka (4.x/KRaft) và Redpanda: Bản chất Event Streaming, Topics, Partitions, Commit Log, Zero-Copy, Replication, Consumer Groups, Schema Evolution và 5 bài toán thực chiến thay thế Webhook.",
    "isKnowledgeBase": True,
    "kbCategory": "architecture",
    "targetAgents": ["claude", "cursor", "codex", "anti"],
    "summaryForAgents": "Comprehensive foundation and architecture guide for Apache Kafka and Redpanda. Covers event streaming fundamentals, append-only commit logs, sequential I/O, PageCache Zero-Copy, partition key hashing, replication factor with ISR and KRaft consensus, consumer group scaling limits, delivery semantics (at-most-once, at-least-once, exactly-once), schema evolution rules, and 5 real-world battle-tested scenarios comparing Webhooks vs Kafka.",
    "content": body
}

problem_1 = {
    "title": "Hiện tượng Hot Partition (Lệch tải đĩa và CPU) do chọn sai Partition Key",
    "errorCode": "ERR_HOT_PARTITION_IMBALANCE",
    "errorSnippet": "Broker alert: Partition 2 disk usage is 94% (850GB) while Partitions 0, 1, 3 are at 12% (110GB). Consumer assigned to Partition 2 lag exceeds 45,000 records.",
    "environment": "Apache Kafka 3.x / 4.x / Redpanda, Multi-tenant Architecture",
    "rootCause": "Chọn tenant_id làm Partition Key đơn thuần. Trong môi trường Multi-tenant, khách hàng VIP chiếm 80% lưu lượng, khiến mọi sự kiện dồn hết vào Partition 2. Các partition còn lại hầu như nhàn rỗi.",
    "solution": "Áp dụng Composite Key hoặc Key Salting: Kết hợp tenant_id với entity UUID: f'{tenant_id}:{linkedid}'. Vì linkedid có tính ngẫu nhiên cao, thuật toán băm Murmur2 rải đều tải khắp toàn bộ các Partition trong khi vẫn đảm bảo chuỗi sự kiện của từng phiên gọi duy nhất luôn nằm trên cùng 1 partition.",
    "tags": ["kafka", "hot-partition", "partition-key", "hashing", "scalability"]
}

problem_2 = {
    "title": "Cạn kiệt Connection Pool và Treo Database khi Consumer Group tăng tốc đọc bù Lag",
    "errorCode": "DB_CONNECTION_POOL_EXHAUSTION_AFTER_LAG_RECOVERY",
    "errorSnippet": "FATAL: remaining connection slots are reserved for non-replication superuser connections (PostgreSQL 53300) / pool timeout 30000ms.",
    "environment": "Fastify / Node.js / Python Consumer Service, PostgreSQL 16",
    "rootCause": "Sau khi hệ thống phục hồi sau 2 tiếng gián đoạn, Consumer Group tăng tốc kéo message từ Kafka với thông lượng tối đa (Catch-up lag). Việc thực hiện đơn lẻ từng câu lệnh INSERT trực tiếp vào Database đã làm quá tải và sập toàn bộ Connection Pool.",
    "solution": "1. Chuyển sang cơ chế Batch Processing: Gom các bản ghi trong đợt poll() và thực thi một câu lệnh INSERT ... ON CONFLICT duy nhất cho 50-100 bản ghi.\n2. Cấu hình Semaphore / Concurrency Limiter tại Consumer để giới hạn số truy vấn đồng thời vào Database.\n3. Tinh chỉnh fetch.max.bytes và max.poll.records phù hợp với năng lực chịu tải của tầng lưu trữ đích.",
    "tags": ["kafka", "consumer-lag", "database-exhaustion", "backpressure", "batch-insert"]
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
    print(f"\n🚀 Đẩy bài viết lý thuyết Kafka lên: {endpoint}")
    # 1. Post Article
    send_post(endpoint, "/api/kb", article_payload)
    # 2. Post Problem 1
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_1)
    # 3. Post Problem 2
    send_post(endpoint, f"/api/kb/{article_payload['slug']}/problems", problem_2)

print("\n🎉 Hoàn thành đẩy bài viết lý thuyết cốt lõi Kafka lên kho tri thức!")
