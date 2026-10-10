---
title: "Mất thứ tự sự kiện cuộc gọi (Call Ended chạy trước Call Answered) do thiếu Partition Key"
parentSlug: "kafka-pbx-event-streaming-architecture"
errorCode: "DATA_INCONSISTENCY_EVENT_ORDER"
environment: "Python kafka-python / aiokafka, Redpanda v23+, Linux x86_64"
tags:
  - kafka
  - redpanda
  - ordering
  - partition-key
  - pbx
date: "2026-10-10T22:00:00.000Z"
---

## Error Symptoms
```
[CRM Sync Worker] Conflict detected for call_id='1710928301.12': Received 'call.answered' but current status is already 'ENDED'.
```

## Root Cause
Producer gửi event nhưng đặt key=None hoặc không cấu hình serializer. Kafka sử dụng thuật toán round-robin phân tán các event của cùng một cuộc gọi sang nhiều partition khác nhau. Vì các partition được consumer đọc song song, sự kiện 'call.ended' vô tình được xử lý trước 'call.answered'.

## Verified Solution
Bắt buộc mọi event liên quan đến cuộc gọi phải chỉ định key là linkedid: `producer.send(topic, key=cdr['linkedid'].encode('utf-8'), value=payload)`. MurmurHash2 sẽ đưa toàn bộ vòng đời cuộc gọi vào cùng 1 partition, đảm bảo thứ tự thời gian tuần tự 100%.
