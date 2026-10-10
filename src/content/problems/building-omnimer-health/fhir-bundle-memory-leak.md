---
title: Memory leak khi parse FHIR Resource Bundle dung lượng lớn trên V8
parentSlug: building-omnimer-health
errorCode: ERR_WORKER_OUT_OF_MEMORY
environment: 'Node 22, Fastify, FHIR R4 JSON parser'
tags:
  - fhir
  - healthtech
  - memory-leak
  - streaming
date: '2026-10-10T15:09:47.100Z'
---
## Error Symptoms
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

## Root Cause
Parse toàn bộ JSON bundle 50MB cùng lúc vào bộ nhớ trong quá trình giải mã streaming khiến GC không kịp giải phóng.

## Verified Solution
Chuyển sang sử dụng `stream-json` parser pipeline kết hợp TransformStream để xử lý từng Entry tuần tự.
