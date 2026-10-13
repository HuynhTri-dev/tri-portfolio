"""Log STT / LLM ở mức INFO (Pipecat mặc định chỉ DEBUG cho transcript)."""

from loguru import logger
from pipecat.frames.frames import (
    InterimTranscriptionFrame,
    InterruptionFrame,
    LLMFullResponseEndFrame,
    LLMFullResponseStartFrame,
    LLMTextFrame,
    TranscriptionFrame,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor


class PipelineLogProcessor(FrameProcessor):
    """Ghi nhận transcript và thời điểm LLM bắt đầu/kết thúc."""

    def __init__(self, *, log_stt: bool = False, log_llm: bool = False) -> None:
        super().__init__()
        self._log_stt = log_stt
        self._log_llm = log_llm
        self._llm_parts: list[str] = []

    async def process_frame(self, frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, InterruptionFrame):
            logger.info("Barge-in: interruption — bot TTS cancelled")

        if self._log_stt and isinstance(frame, TranscriptionFrame):
            if isinstance(frame, InterimTranscriptionFrame):
                pass
            elif (frame.text or "").strip():
                logger.info("STT transcript: {}", frame.text.strip())

        if self._log_llm:
            if isinstance(frame, LLMFullResponseStartFrame):
                self._llm_parts = []
                logger.info("LLM generation started")
            elif isinstance(frame, LLMTextFrame) and frame.text:
                self._llm_parts.append(frame.text)
            elif isinstance(frame, LLMFullResponseEndFrame):
                reply = "".join(self._llm_parts).strip()
                logger.info("LLM generation done ({} chars)", len(reply))
                if reply:
                    preview = reply if len(reply) <= 160 else reply[:157] + "..."
                    logger.info("LLM reply: {}", preview)

        await self.push_frame(frame, direction)
