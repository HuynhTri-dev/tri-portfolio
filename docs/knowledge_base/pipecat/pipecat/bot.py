"""Pipeline Pipecat: Asterisk WS → VAD → ElevenLabs STT → Ollama → ElevenLabs TTS."""

import asyncio
import os
import sys

import aiohttp
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import TTSSpeakFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker, ProcessorUnusablePolicy
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.services.elevenlabs.stt import ElevenLabsSTTService
from pipecat.services.elevenlabs.tts import ElevenLabsHttpTTSService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transcriptions.language import Language
from pipecat.turns.user_start.transcription_user_turn_start_strategy import (
    TranscriptionUserTurnStartStrategy,
)
from pipecat.turns.user_start.vad_user_turn_start_strategy import VADUserTurnStartStrategy
from pipecat.turns.user_turn_strategies import UserTurnStrategies
from pipecat.workers.runner import WorkerRunner
from pipecat_asterisk import AsteriskWebsocketTransport

from config import Settings
from pipeline_log import PipelineLogProcessor
from prompts import BANK_VOICE_SYSTEM_INSTRUCTION, OPENING_GREETING_TEXT
from stt_echo_gate import SttEchoGateProcessor, make_barge_vad


def _configure_logging() -> None:
    logger.remove()
    logger.add(sys.stderr, level=os.getenv("LOG_LEVEL", "INFO"))


def _elevenlabs_http_tts_settings(settings: Settings) -> ElevenLabsHttpTTSService.Settings:
    """eleven_v4_turbo không hỗ trợ optimize_streaming_latency (API 400 → im lặng)."""
    model = settings.elevenlabs_tts_model.lower()
    kwargs: dict = {
        "voice": settings.elevenlabs_voice_id,
        "model": settings.elevenlabs_tts_model,
    }
    if "v4" not in model:
        kwargs["language"] = Language.VI
        if settings.elevenlabs_tts_optimize_latency is not None:
            kwargs["optimize_streaming_latency"] = settings.elevenlabs_tts_optimize_latency
    return ElevenLabsHttpTTSService.Settings(**kwargs)


async def run_asterisk_call(websocket_client, settings: Settings) -> None:
    _configure_logging()
    ws_transport = AsteriskWebsocketTransport(websocket=websocket_client)

    async with aiohttp.ClientSession() as session:
        stt = ElevenLabsSTTService(
            api_key=settings.elevenlabs_api_key,
            aiohttp_session=session,
            ttfs_p99_latency=settings.stt_ttfs_p99_latency,
            settings=ElevenLabsSTTService.Settings(
                model=settings.elevenlabs_stt_model,
                language=Language.VI,
            ),
        )

        tts = ElevenLabsHttpTTSService(
            api_key=settings.elevenlabs_api_key,
            aiohttp_session=session,
            sample_rate=settings.sample_rate,
            settings=_elevenlabs_http_tts_settings(settings),
        )
        logger.info(
            "Pipeline STT={} ttfs_p99={}s | TTS={} voice_id={} latency_opt={} | LLM={} temp={} max_tokens={} | "
            "VAD stop={}s | interruptions={} echo_barge_in={}",
            settings.elevenlabs_stt_model,
            settings.stt_ttfs_p99_latency,
            settings.elevenlabs_tts_model,
            settings.elevenlabs_voice_id,
            settings.elevenlabs_tts_optimize_latency if "v4" not in settings.elevenlabs_tts_model.lower() else "n/a",
            settings.ollama_model,
            settings.ollama_temperature,
            settings.ollama_max_completion_tokens,
            settings.vad_stop_secs,
            settings.enable_interruptions,
            settings.stt_echo_gate_barge_in,
        )

        llm = OpenAILLMService(
            api_key=settings.ollama_api_key,
            base_url=settings.ollama_base_url,
            settings=OpenAILLMService.Settings(
                model=settings.ollama_model,
                system_instruction=BANK_VOICE_SYSTEM_INSTRUCTION,
                temperature=settings.ollama_temperature,
                max_completion_tokens=settings.ollama_max_completion_tokens,
            ),
        )

        context = LLMContext()
        vad = SileroVADAnalyzer(
            params=VADParams(
                confidence=settings.vad_confidence,
                start_secs=settings.vad_start_secs,
                stop_secs=settings.vad_stop_secs,
                min_volume=settings.vad_min_volume,
            )
        )
        # Echo loa: chặn PCM trước STT (SttEchoGateProcessor), không dùng AlwaysUserMute
        # (dễ kẹt muted sau TTS nếu BotStoppedSpeaking trễ — không nghe lượt 2).
        user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
            context,
            user_params=LLMUserAggregatorParams(
                vad_analyzer=vad,
                user_turn_strategies=UserTurnStrategies(
                    start=[
                        VADUserTurnStartStrategy(
                            enable_interruptions=settings.enable_interruptions
                        ),
                        TranscriptionUserTurnStartStrategy(
                            enable_interruptions=settings.enable_interruptions
                        ),
                    ],
                ),
            ),
        )

        stt_log = PipelineLogProcessor(log_stt=True)
        llm_log = PipelineLogProcessor(log_llm=True)
        barge_vad = (
            make_barge_vad(
                VADParams(
                    confidence=settings.vad_confidence,
                    start_secs=settings.vad_start_secs,
                    stop_secs=settings.vad_stop_secs,
                    min_volume=settings.vad_min_volume,
                ),
                settings.sample_rate,
            )
            if settings.stt_echo_gate_barge_in
            else None
        )
        echo_gate = SttEchoGateProcessor(
            tail_secs=settings.stt_echo_gate_tail_secs,
            barge_in=settings.stt_echo_gate_barge_in and settings.enable_interruptions,
            barge_vad=barge_vad,
        )

        pipeline = Pipeline(
            [
                ws_transport.input(),
                echo_gate,
                stt,
                stt_log,
                user_aggregator,
                llm,
                llm_log,
                tts,
                ws_transport.output(),
                assistant_aggregator,
            ]
        )

        worker = PipelineWorker(
            pipeline,
            params=PipelineParams(
                audio_in_sample_rate=settings.sample_rate,
                audio_out_sample_rate=settings.sample_rate,
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
            processor_unusable_policy=ProcessorUnusablePolicy.END,
        )

        @ws_transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            logger.info(
                "Asterisk WS connected caller={} — schedule greeting after {:.2f}s",
                getattr(client, "query_params", None),
                settings.media_ready_delay_secs,
            )

            async def play_greeting_after_media_ready() -> None:
                await asyncio.sleep(settings.media_ready_delay_secs)
                logger.info(
                    "TTS greeting voice_id={} text_len={}",
                    settings.elevenlabs_voice_id,
                    len(OPENING_GREETING_TEXT),
                )
                context.add_message({"role": "assistant", "content": OPENING_GREETING_TEXT})
                await worker.queue_frames([TTSSpeakFrame(OPENING_GREETING_TEXT)])

            asyncio.create_task(play_greeting_after_media_ready())

        @ws_transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            logger.info("Asterisk WS disconnected")
            await worker.cancel()

        runner = WorkerRunner(handle_sigint=False)
        await runner.add_workers(worker)
        await runner.run()
