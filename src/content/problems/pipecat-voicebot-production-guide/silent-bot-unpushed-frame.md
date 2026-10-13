---
title: "Hiện Tượng Bot Im Lặng (Silent Bot) Do Quên Gọi push_frame Trong Custom FrameProcessor"
parentSlug: "pipecat-voicebot-production-guide"
errorCode: "ERR_FRAME_PROCESSOR_DROP_PIPELINE"
environment: "Python 3.11 / 3.12, Pipecat 1.x, Custom FrameProcessor Middleware"
tags:
  - pipecat
  - frame-processor
  - silent-bot
  - push-frame
  - pipeline-stall
date: "2026-10-13T17:00:00.000Z"
---

## Error Symptoms
```
Người dùng gọi vào bot qua WebRTC/WebSocket:
- Console log hiển thị micro thu âm bình thường: InputAudioRawFrame flowing.
- STT phiên âm thành công: TranscriptionFrame(text="Xin chào em") xuất hiện trong log của Custom Processor.
- Tuy nhiên sau đó: LLM không hề sinh câu trả lời, TTS không phát âm thanh, bot hoàn toàn im lặng. Không có ngoại lệ (Exception) hay crash nào được ném ra.
```

## Root Cause
Trong custom `FrameProcessor` được chèn vào pipeline (ví dụ bộ đệm ghi log hoặc bộ lọc từ ngữ), lập trình viên đã override hàm `process_frame` nhưng **quên gọi `await self.push_frame(frame, direction)`** ở cuối hàm.

Mỗi node trong Pipeline của Pipecat hoạt động như một mắt xích chuỗi. Khi một processor tiếp nhận frame mà không chủ động đẩy tiếp (`push_frame`), frame đó sẽ bị nuốt chửng (swallowed/dropped). Hệ quả là các processor phía sau (như `user_aggregator`, `llm`, `tts`) không bao giờ nhận được `TranscriptionFrame` để tiến hành suy luận và phản hồi.

## Verified Solution
Tuân thủ nghiêm ngặt 3 quy tắc sống còn của `FrameProcessor`:
1. Luôn `await super().process_frame(frame, direction)` để xử lý frame hệ thống (lifecycle).
2. Lọc loại frame cần can thiệp bằng `isinstance()`.
3. Bắt buộc kết thúc bằng `await self.push_frame(frame, direction)` để luân chuyển dữ liệu đến các mắt xích tiếp theo trong pipeline:

```python
from pipecat.frames.frames import Frame, TranscriptionFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor

class TextAuditLogger(FrameProcessor):
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        # 1. Luôn gọi lớp cha xử lý StartFrame, CancelFrame, InterruptionFrame
        await super().process_frame(frame, direction)

        # 2. Xử lý nghiệp vụ riêng
        if isinstance(frame, TranscriptionFrame):
            print(f"[Audit Log] User nói: {frame.text}")

        # 3. QUY TẮC BẮT BUỘC: Đẩy frame tiếp tục xuôi dòng downstream
        await self.push_frame(frame, direction)
```
