---
title: "Lệch Ngữ Cảnh Hội Thoại Khi Bị Ngắt Lời Do Đặt assistant_aggregator Trước transport.output"
parentSlug: "pipecat-voicebot-production-guide"
errorCode: "ERR_CONTEXT_DESYNC_ON_BARGE_IN"
environment: "Python 3.11 / 3.12, Pipecat 1.x, Universal LLMContext"
tags:
  - pipecat
  - llm-context
  - barge-in
  - interruption
  - context-desync
date: "2026-10-13T17:00:00.000Z"
---

## Error Symptoms
```
Tình huống xảy ra:
1. Bot bắt đầu trả lời một câu dài 4 câu: "Dạ chính sách hoàn tiền của công ty gồm 3 bước: Bước 1 gửi email, Bước 2 chờ duyệt, Bước 3 nhận tiền trong 24h."
2. Khi bot mới đọc đến "Bước 1 gửi email...", người dùng ngắt lời: "Cho tôi hỏi gửi email đến địa chỉ nào?"
3. Lượt tiếp theo, LLM hành xử như thể người dùng đã nghe toàn bộ 4 câu chính sách và từ chối giải thích lại Bước 2 và Bước 3: "Như tôi vừa trình bày ở Bước 2 và Bước 3 phía trên..."
=> Người dùng bối rối vì thực tế họ chưa hề nghe thấy các bước đó.
```

## Root Cause
Trong định nghĩa danh sách Pipeline, lập trình viên đã đặt `assistant_aggregator` **ngay sau `tts` và phía trước `transport.output()`**:

```python
# CẤU HÌNH SAI LẦM:
pipeline = Pipeline([
    transport.input(),
    stt,
    user_aggregator,
    llm,
    tts,
    assistant_aggregator,  # <-- SAI: Gom toàn bộ câu khi TTS vừa tạo xong text, chưa hề phát ra loa
    transport.output(),
])
```

Khi đặt ở vị trí này, ngay khi TTS hoàn tất việc nhận các text chunk từ LLM, `assistant_aggregator` đã vội vàng thêm trọn vẹn toàn bộ đoạn văn bản vào `LLMContext`. Khi người dùng ngắt lời (barge-in), mặc dù `transport.output()` đã kịp xả bỏ buffer âm thanh chưa phát, nhưng lịch sử trong `LLMContext` đã ghi nhận sai lệch rằng bot đã đọc toàn bộ câu văn.

## Verified Solution
Luôn đặt `assistant_aggregator` **ngay sau `transport.output()`**. 

Ở vị trí này, các dịch vụ TTS streaming chất lượng cao (như Cartesia, ElevenLabs) sẽ đồng bộ `TTSTextFrame` theo từng nhịp thời gian thực tương ứng với từng từ âm thanh thực sự được phát ra qua loa. Khi có tín hiệu ngắt lời (`InterruptionFrame`), `assistant_aggregator` sẽ chốt chặn chính xác những từ đã phát, đảm bảo ngữ cảnh của lượt kế tiếp phản ánh đúng 100% những gì người dùng đã thực tế nghe được:

```python
# CẤU HÌNH ĐÚNG CHUẨN:
pipeline = Pipeline([
    transport.input(),
    stt,
    user_aggregator,
    llm,
    tts,
    transport.output(),     # 1. Phát audio ra loa trước
    assistant_aggregator,   # 2. Gom văn bản tương ứng với audio ĐÃ THỰC SỰ ĐƯỢC PHÁT
])
```
