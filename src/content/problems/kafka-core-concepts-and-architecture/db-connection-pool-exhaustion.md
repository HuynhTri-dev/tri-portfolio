---
title: "Cạn kiệt Connection Pool và Treo Database khi Consumer Group tăng tốc đọc bù Lag"
parentSlug: "kafka-core-concepts-and-architecture"
errorCode: "DB_CONNECTION_POOL_EXHAUSTION_AFTER_LAG_RECOVERY"
environment: "Fastify / Node.js / Python Consumer Service, PostgreSQL 16"
tags:
  - kafka
  - consumer-lag
  - database-exhaustion
  - backpressure
  - batch-insert
date: "2026-10-10T22:00:00.000Z"
---

## Error Symptoms
```
FATAL: remaining connection slots are reserved for non-replication superuser connections (PostgreSQL 53300) / pool timeout 30000ms.
```

## Root Cause
Sau khi hệ thống phục hồi sau 2 tiếng gián đoạn, Consumer Group tăng tốc kéo message từ Kafka với thông lượng tối đa (Catch-up lag). Việc thực hiện đơn lẻ từng câu lệnh INSERT trực tiếp vào Database đã làm quá tải và sập toàn bộ Connection Pool.

## Verified Solution
1. Chuyển sang cơ chế Batch Processing: Gom các bản ghi trong đợt `poll()` và thực thi một câu lệnh `INSERT ... ON CONFLICT` duy nhất cho 50-100 bản ghi.
2. Cấu hình Semaphore / Concurrency Limiter tại Consumer để giới hạn số truy vấn đồng thời vào Database.
3. Tinh chỉnh `fetch.max.bytes` và `max.poll.records` phù hợp với năng lực chịu tải của tầng lưu trữ đích.
