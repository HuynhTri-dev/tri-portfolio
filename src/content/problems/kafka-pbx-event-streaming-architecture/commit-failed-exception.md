---
title: "Consumer bị ngắt kết nối (CommitFailedException) và Rebalance Storm do tác vụ ASR/LLM quá tải"
parentSlug: "kafka-pbx-event-streaming-architecture"
errorCode: "CommitFailedException"
environment: "Python kafka-python, Whisper ASR Worker, Ollama/LLM Summarizer"
tags:
  - kafka
  - rebalance
  - max-poll-interval
  - asr
  - timeout
  - consumer-group
  - commit-failed
date: "2026-10-10T22:00:00.000Z"
---

## Error Symptoms
```
kafka.errors.CommitFailedException: Commit cannot be completed since the group has already rebalanced and assigned the partitions to another member.
```

## Root Cause
Consumer nhận message chứa audio URL và tiến hành tải/chuyển đổi giọng nói mất hơn 5 phút. Thời gian xử lý vượt quá cấu hình `max.poll.interval.ms` (mặc định 300,000ms = 5 phút), khiến Broker đánh giá worker đã chết và kích hoạt Rebalance liên tục, gây đứng toàn bộ cụm consumer group.

## Verified Solution
1. Tách pipeline: Consumer chỉ nhận message và đẩy tác vụ vào hàng đợi bất đồng bộ (Thread/Celery pool), lập tức hoàn tất vòng lặp `poll()`.
2. Hoặc tinh chỉnh cấu hình Kafka Consumer: đặt `max.poll.interval.ms=900000` (15 phút) và giới hạn `max.poll.records=1` để worker chỉ nhận đúng 1 audio task mỗi lần poll.
