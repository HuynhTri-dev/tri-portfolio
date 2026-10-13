---
title: "Lỗi TTS Câm Nín Do ElevenLabs v4 Turbo Báo HTTP 400 Khi Bật optimize_streaming_latency"
parentSlug: "voicebot-asterisk-pipecat-elevenlabs-ollama"
errorCode: "ERR_ELEVENLABS_V4_TURBO_LATENCY_BAD_REQUEST"
environment: "Python 3.11+, Pipecat 1.x, ElevenLabs API (eleven_v4_turbo)"
tags:
  - elevenlabs
  - tts
  - eleven_v4_turbo
  - http-400
  - silent-bot
date: "2026-10-13T17:30:00.000Z"
---

## Error Symptoms
```
STT nhận diện hoàn hảo giọng nói của khách hàng:
INFO: STT transcript: Cho tôi hỏi điều kiện mở thẻ tín dụng
INFO: LLM generation started
INFO: LLM reply: Dạ, để mở thẻ tín dụng anh chị cần đủ 18 tuổi và có CCCD...

Tuy nhiên ngay sau khi LLM kết thúc, Bot hoàn toàn im lặng và không có bất kỳ âm thanh nào phát ra về phía Asterisk.
Log hiển thị lỗi từ API ElevenLabs:
aiohttp.client_exceptions.ClientResponseError: 400, message='Bad Request', url='https://api.elevenlabs.io/v1/text-to-speech/.../stream'
{"detail": {"status": "invalid_parameters", "message": "optimize_streaming_latency is not supported for eleven_v4_turbo"}}
```

## Root Cause
Mô hình tổng hợp giọng đọc thế hệ mới `eleven_v4_turbo` của ElevenLabs đã được tối ưu sẵn kiến trúc streaming nội tại. Do đó, endpoint API chính thức của ElevenLabs **từ chối và trả về lỗi HTTP 400 Bad Request** nếu client truyền thêm tham số `optimize_streaming_latency` (vốn chỉ tương thích với các dòng model cũ hơn như `eleven_multilingual_v2` hoặc `turbo_v2_5`).

Khi lỗi 400 xảy ra, `ElevenLabsHttpTTSService` không thể tạo luồng âm thanh PCM để gửi tiếp vào pipeline, khiến cuộc gọi rơi vào trạng thái im lặng hoàn toàn sau lượt phản hồi của LLM.

## Verified Solution
Trong hàm khởi tạo tham số cấu hình của `ElevenLabsHttpTTSService`, thực hiện kiểm tra tên model. Nếu model thuộc dòng `v4` (như `eleven_v4_turbo`), **tuyệt đối không truyền** tham số `optimize_streaming_latency`:

```python
def _elevenlabs_http_tts_settings(settings: Settings) -> ElevenLabsHttpTTSService.Settings:
    model = settings.elevenlabs_tts_model.lower()
    kwargs: dict = {
        "voice": settings.elevenlabs_voice_id,
        "model": settings.elevenlabs_tts_model,
    }
    
    # Chỉ áp dụng optimize_streaming_latency và language cho các model không phải v4
    if "v4" not in model:
        kwargs["language"] = Language.VI
        if settings.elevenlabs_tts_optimize_latency is not None:
            kwargs["optimize_streaming_latency"] = settings.elevenlabs_tts_optimize_latency
            
    return ElevenLabsHttpTTSService.Settings(**kwargs)
```
Sau khi sửa, API ElevenLabs trả về stream audio 16kHz trơn tru và bot cất tiếng nói ngay sau khi LLM bắt đầu sinh chữ.
