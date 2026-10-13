"""Đọc cấu hình từ biến môi trường (.env trên VM)."""

import os
import sys
from dataclasses import dataclass


def _float_env(name: str, default: float) -> float:
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return default
    return float(raw)


def _int_env(name: str, default: int) -> int:
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return default
    return int(raw)


def _bool_env(name: str, default: bool) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in ("1", "true", "yes", "on")


def _optional_int_env(name: str) -> int | None:
    raw = (os.getenv(name) or "").strip()
    if not raw or raw.lower() in ("off", "none", "-", "0"):
        return None
    return int(raw)


@dataclass(frozen=True)
class Settings:
    elevenlabs_api_key: str
    elevenlabs_voice_id: str
    elevenlabs_stt_model: str
    elevenlabs_tts_model: str
    elevenlabs_tts_optimize_latency: int | None
    ollama_api_key: str
    ollama_base_url: str
    ollama_model: str
    ollama_temperature: float
    ollama_max_completion_tokens: int
    host: str
    port: int
    sample_rate: int
    vad_confidence: float
    vad_start_secs: float
    vad_stop_secs: float
    vad_min_volume: float
    stt_ttfs_p99_latency: float
    media_ready_delay_secs: float
    stt_echo_gate_tail_secs: float
    enable_interruptions: bool
    stt_echo_gate_barge_in: bool


def load_settings() -> Settings:
    missing = []
    for name in ("ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "OLLAMA_API_KEY"):
        if not (os.getenv(name) or "").strip():
            missing.append(name)
    if missing:
        print(
            "Thiếu biến môi trường: "
            + ", ".join(missing)
            + ". Thêm vào /opt/pipecat-voicebot/.env (xem .env.example).",
            file=sys.stderr,
        )
        sys.exit(1)

    return Settings(
        elevenlabs_api_key=os.environ["ELEVENLABS_API_KEY"].strip(),
        elevenlabs_voice_id=os.environ["ELEVENLABS_VOICE_ID"].strip(),
        elevenlabs_stt_model=os.getenv("ELEVENLABS_STT_MODEL", "scribe_v2").strip(),
        elevenlabs_tts_model=os.getenv("ELEVENLABS_TTS_MODEL", "eleven_v4_turbo").strip(),
        elevenlabs_tts_optimize_latency=_optional_int_env("ELEVENLABS_TTS_OPTIMIZE_LATENCY"),
        ollama_api_key=os.environ["OLLAMA_API_KEY"].strip(),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "https://ollama.com/v1").strip().rstrip("/"),
        ollama_model=os.getenv("OLLAMA_MODEL", "gemma4:cloud").strip(),
        ollama_temperature=_float_env("OLLAMA_TEMPERATURE", 0.4),
        ollama_max_completion_tokens=_int_env("OLLAMA_MAX_COMPLETION_TOKENS", 280),
        host=os.getenv("PIPECAT_HOST", "127.0.0.1").strip(),
        port=int(os.getenv("PIPECAT_PORT", "10003")),
        sample_rate=int(os.getenv("PIPECAT_SAMPLE_RATE", "16000")),
        vad_confidence=_float_env("VAD_CONFIDENCE", 0.7),
        vad_start_secs=_float_env("VAD_START_SECS", 0.2),
        vad_stop_secs=_float_env("VAD_STOP_SECS", 0.22),
        vad_min_volume=_float_env("VAD_MIN_VOLUME", 0.5),
        stt_ttfs_p99_latency=_float_env("ELEVENLABS_STT_TTFS_P99_LATENCY", 0.85),
        media_ready_delay_secs=_float_env("MEDIA_READY_DELAY_SECS", 0.3),
        stt_echo_gate_tail_secs=_float_env("STT_ECHO_GATE_TAIL_SECS", 0.18),
        enable_interruptions=_bool_env("PIPECAT_ENABLE_INTERRUPTIONS", True),
        stt_echo_gate_barge_in=_bool_env("STT_ECHO_GATE_BARGE_IN", True),
    )
