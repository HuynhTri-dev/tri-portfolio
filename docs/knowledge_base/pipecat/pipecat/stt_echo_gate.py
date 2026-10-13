"""Chặn audio vào STT khi bot phát TTS; mở lại khi khách chen lời (barge-in)."""

import time

from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADAnalyzer, VADParams, VADState
from pipecat.frames.frames import (
    BotStartedSpeakingFrame,
    BotStoppedSpeakingFrame,
    Frame,
    InputAudioRawFrame,
    InterruptionFrame,
    StartFrame,
    UserAudioRawFrame,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor


class SttEchoGateProcessor(FrameProcessor):
    """Bỏ qua PCM mic khi bot nói (giảm vang), trừ khi VAD phát hiện khách chen lời."""

    def __init__(
        self,
        *,
        tail_secs: float = 0.35,
        barge_in: bool = True,
        barge_vad: VADAnalyzer | None = None,
    ) -> None:
        super().__init__()
        self._tail_secs = tail_secs
        self._barge_in = barge_in
        self._barge_vad = barge_vad
        self._bot_speaking = False
        self._gate_open_at = 0.0
        self._barge_open = False

    def _gate_closed(self) -> bool:
        if self._barge_open:
            return False
        if self._bot_speaking:
            return True
        return time.monotonic() < self._gate_open_at

    async def _maybe_detect_barge_in(self, audio: bytes) -> None:
        if not self._barge_in or not self._bot_speaking or not self._barge_vad:
            return
        state = await self._barge_vad.analyze_audio(audio)
        if state in (VADState.STARTING, VADState.SPEAKING):
            if not self._barge_open:
                logger.info("Echo gate: barge-in — mic/STT unblocked while bot was speaking")
            self._barge_open = True

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, StartFrame) and self._barge_vad:
            rate = frame.audio_in_sample_rate or 16000
            self._barge_vad.set_sample_rate(rate)

        if isinstance(frame, InterruptionFrame):
            self._barge_open = True
            logger.info("Barge-in: interruption — echo gate open, bot should stop TTS")

        if isinstance(frame, BotStartedSpeakingFrame):
            self._bot_speaking = True
            self._barge_open = False
            logger.debug("Echo gate: bot started speaking — STT input blocked until barge-in")
        elif isinstance(frame, BotStoppedSpeakingFrame):
            self._bot_speaking = False
            self._barge_open = False
            self._gate_open_at = time.monotonic() + self._tail_secs
            logger.info(
                "Echo gate: bot stopped — STT input resumes after {:.2f}s tail",
                self._tail_secs,
            )

        if isinstance(frame, (InputAudioRawFrame, UserAudioRawFrame)):
            await self._maybe_detect_barge_in(frame.audio)
            if self._gate_closed():
                return

        await self.push_frame(frame, direction)


def make_barge_vad(params: VADParams, sample_rate: int) -> SileroVADAnalyzer:
    vad = SileroVADAnalyzer(params=params, sample_rate=sample_rate)
    vad.set_sample_rate(sample_rate)
    return vad
