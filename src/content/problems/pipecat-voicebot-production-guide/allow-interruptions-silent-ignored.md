---
title: "Lỗi Turn Detection và Ngắt Lời Bị Hỏng Do Tham Số Cũ allow_interruptions=True Bị Bỏ Qua Im Lặng"
parentSlug: "pipecat-voicebot-production-guide"
errorCode: "ERR_PIPECAT_PARAM_SILENTLY_IGNORED"
environment: "Python 3.11 / 3.12, Pipecat 1.x (1.0 - 1.12+), Pydantic v2"
tags:
  - pipecat
  - turn-detection
  - interruption
  - pydantic
  - silent-failure
date: "2026-10-13T17:00:00.000Z"
---

## Error Symptoms
```
Pipeline khởi động bình thường không báo lỗi cú pháp hay Exception:
INFO: Started WorkerRunner with 1 worker(s).
INFO: Transport connected successfully.

Tuy nhiên trong phiên gọi:
- Người dùng nói nhưng Bot không nhận diện được khi nào người dùng dứt câu.
- Khi Bot đang phát âm thanh, người dùng cố gắng nói chen vào (barge-in) nhưng Bot vẫn tiếp tục nói hết câu, hoàn toàn phớt lờ lời ngắt của người dùng.
```

## Root Cause
Trong Pipecat 0.0.x cũ, tính năng ngắt lời được bật qua `PipelineParams(allow_interruptions=True)`. Từ Pipecat 1.0 trở đi, tham số này đã bị **xóa bỏ hoàn toàn**. 

Tuy nhiên, vì `PipelineParams` kế thừa từ Pydantic Model với cấu hình mặc định bỏ qua các trường không xác định (`extra='ignore'`), nên việc truyền `allow_interruptions=True` **không gây crash ứng dụng hay báo cảnh báo**. Ứng dụng khởi động suôn sẻ nhưng cơ chế turn-taking và interruption lại bị tê liệt do thiếu cấu hình hợp lệ trên `LLMUserAggregatorParams`.

## Verified Solution
1. Xóa bỏ hoàn toàn `allow_interruptions` khỏi `PipelineParams`.
2. Chuyển toàn bộ cấu hình phát hiện lượt nói và ngắt lời sang `LLMUserAggregatorParams` thông qua `user_turn_strategies`:

```python
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.turns.user_start import VADUserTurnStartStrategy, TranscriptionUserTurnStartStrategy
from pipecat.turns.user_stop import TurnAnalyzerUserTurnStopStrategy
from pipecat.turns.user_turn_strategies import UserTurnStrategies
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

# Cấu hình chuẩn Pipecat 1.x:
user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
    context,
    user_params=LLMUserAggregatorParams(
        vad_analyzer=SileroVADAnalyzer(),
        user_turn_strategies=UserTurnStrategies(
            start=[
                VADUserTurnStartStrategy(),
                TranscriptionUserTurnStartStrategy(),
            ],
            stop=[
                TurnAnalyzerUserTurnStopStrategy(
                    turn_analyzer=LocalSmartTurnAnalyzerV3()
                ),
            ],
        ),
    ),
)
```
