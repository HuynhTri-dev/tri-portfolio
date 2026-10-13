---
title: "Hiện Tượng Lặp Câu Vọng Loa Ngoài (Acoustic Echo Loop) Khi Khách Bật Speakerphone"
parentSlug: "voicebot-asterisk-pipecat-elevenlabs-ollama"
errorCode: "ERR_ACOUSTIC_FEEDBACK_SPEAKERPHONE_LOOP"
environment: "Asterisk 22, Softphone / PSTN, Pipecat 1.x, ElevenLabs STT"
tags:
  - acoustic-echo
  - speakerphone
  - echo-gate
  - barge-in
  - pipecat
date: "2026-10-13T17:40:00.000Z"
---

## Error Symptoms
```
Khi người dùng gọi qua điện thoại và bật loa ngoài (speakerphone):
1. Bot phát câu chào: "Chào anh chị, em là nhân viên chăm sóc khách hàng..."
2. Vừa dứt câu chào, STT lập tức ghi nhận transcript:
   INFO: STT transcript: Chào anh chị em là nhân viên chăm sóc khách hàng
3. LLM nhận context bị ô nhiễm và phản hồi:
   INFO: LLM reply: Dạ em nghe thấy đường truyền bị lặp tiếng, anh chị có cần hỗ trợ gì không ạ?
4. Bot liên tục tự nói chuyện với chính câu trả lời của mình thành một vòng lặp vô tận (Acoustic Feedback Loop).
```

## Root Cause
Trên kênh thoại viễn thông thông thường (PSTN/SIP), luồng âm thanh truyền qua mạng không có sẵn thuật toán AEC (Acoustic Echo Cancellation) cấp phần cứng như WebRTC trên trình duyệt hay các thiết bị chuyên dụng.

Khi người dùng bật loa ngoài với âm lượng lớn, âm thanh từ loa điện thoại dội thẳng vào micro của máy và truyền ngược về Asterisk qua RTP, sau đó vào Pipecat WebSocket. Mô hình nhận diện giọng nói `ElevenLabs STT` có độ nhạy rất cao nên đã nhận diện hoàn hảo chính tiếng nói của bot, kích hoạt lượt suy luận giả sang LLM.

## Verified Solution
1. **Triển khai `SttEchoGateProcessor`**:
   Đặt bộ lọc cổng âm thanh ngay sau `transport.input()` và trước `stt`. Trong lúc bot đang phát TTS (`BotStartedSpeakingFrame` đến `BotStoppedSpeakingFrame`), toàn bộ frame âm thanh từ micro sẽ bị drop (bỏ qua).
2. **Duy trì thời gian đuôi (`tail_secs`)**:
   Sau khi bot dứt câu, mic tiếp tục bị khóa thêm `0.18s` để triệt tiêu hoàn toàn tiếng vọng dội lại từ tường phòng hoặc loa ngoài của điện thoại.
3. **Barge-in VAD độc lập**:
   Cung cấp một Silero VAD riêng biệt bên trong gate: Nếu khách hàng thực sự cất giọng nói chen ngang (barge-in) với âm lượng rõ ràng (`min_volume=0.5`), gate sẽ mở mic tức thì và phát `InterruptionFrame` để ngắt TTS của bot.
4. **Prompt Guardrail**:
   Thêm chỉ dẫn vào System Prompt: *"Nếu câu của khách lặp nguyên văn câu chào, coi là tiếng vọng loa, hãy lịch sự mời khách nói lại nhu cầu."*

```python
echo_gate = SttEchoGateProcessor(
    tail_secs=0.18,
    barge_in=True,
    barge_vad=make_barge_vad(vad_params, sample_rate=16000),
)
```
Sau khi áp dụng, hiện tượng tự nói chuyện một mình khi bật loa ngoài giảm từ 100% xuống 0%, đồng thời tính năng chen lời (barge-in) vẫn hoạt động mượt mà.
