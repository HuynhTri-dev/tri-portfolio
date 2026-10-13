---
title: "Hiện Tượng Bot Kẹt Câm Ở Lượt Nói Thứ 2 Do AlwaysUserMuteStrategy Xung Đột Với Buffer Asterisk"
parentSlug: "voicebot-asterisk-pipecat-elevenlabs-ollama"
errorCode: "ERR_ALWAYS_USER_MUTE_ASTERISK_BUFFER_DEADLOCK"
environment: "Asterisk 22, chan_websocket, Pipecat 1.x, AlwaysUserMuteStrategy"
tags:
  - pipecat
  - asterisk
  - mute-deadlock
  - turn-taking
  - telephony
date: "2026-10-13T17:35:00.000Z"
---

## Error Symptoms
```
Lượt hội thoại đầu tiên diễn ra hoàn hảo:
1. Bot phát câu chào: "Chào anh chị, em có thể hỗ trợ gì ạ?"
2. Khách nói: "Tôi muốn mở thẻ mới."
3. Bot trả lời: "Dạ, để mở thẻ anh chị cần mang CCCD..."

Tuy nhiên ở lượt tiếp theo:
- Khách tiếp tục nói: "Thủ tục mất bao lâu em?"
- Pipeline hoàn toàn không ghi nhận bất kỳ frame STT nào.
- Bot rơi vào im lặng vĩnh viễn dù khách vẫn đang giữ máy.
```

## Root Cause
Trong Pipecat, `AlwaysUserMuteStrategy` tự động tắt mic của người dùng khi bot bắt đầu nói (`BotStartedSpeakingFrame`) và chỉ bật lại mic khi nhận được sự kiện `BotStoppedSpeakingFrame`.

Tuy nhiên, khi kết nối qua kênh thoại viễn thông Asterisk `chan_websocket`:
1. Driver kênh âm thanh của Asterisk và bridge viễn thông luôn duy trì một hàng đợi đệm âm thanh (audio playback jitter buffer).
2. Sự kiện `BotStoppedSpeakingFrame` từ TTS service đến Asterisk transport bị delay hoặc bị nuốt chửng do việc xả buffer ở tầng Asterisk diễn ra chậm hơn tốc độ khung hình của Pipecat.
3. Hậu quả là `AlwaysUserMuteStrategy` bị kẹt ở trạng thái **muted vĩnh viễn**, khóa hoàn toàn audio mic của người dùng không cho truyền vào STT ở các lượt tiếp theo.

## Verified Solution
1. **Loại bỏ hoàn toàn** `AlwaysUserMuteStrategy` khỏi danh sách `user_turn_strategies` trong cấu hình `LLMUserAggregatorParams`.
2. Thay thế việc khử vang bằng **`SttEchoGateProcessor`** độc lập đặt ở đầu pipeline (trước STT service):

```python
# KHÔNG DÙNG:
# mute_strategy = AlwaysUserMuteStrategy()

# DÙNG: Cấu hình UserTurnStrategies sạch sẽ chỉ gồm Start Strategies
user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
    context,
    user_params=LLMUserAggregatorParams(
        vad_analyzer=vad,
        user_turn_strategies=UserTurnStrategies(
            start=[
                VADUserTurnStartStrategy(enable_interruptions=True),
                TranscriptionUserTurnStartStrategy(enable_interruptions=True),
            ],
        ),
    ),
)

# Và bảo vệ mic bằng Echo Gate độc lập:
echo_gate = SttEchoGateProcessor(
    tail_secs=0.18,
    barge_in=True,
    barge_vad=barge_vad,
)
```
Sau khi loại bỏ `AlwaysUserMuteStrategy`, pipeline hội thoại liên tục 10-20 lượt mà không bao giờ gặp hiện tượng kẹt câm.
