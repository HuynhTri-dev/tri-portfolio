"""FastAPI — Asterisk outbound WebSocket tới /asterisk (port PIPECAT_PORT, mặc định 10003)."""

import asyncio
import os
import sys

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from loguru import logger

from bot import run_asterisk_call
from config import load_settings

# Repo root .env khi dev local; trên VM dùng /opt/pipecat-voicebot/.env
load_dotenv(override=True)
_env_local = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(_env_local):
    load_dotenv(_env_local, override=True)

app = FastAPI(title="SeaBank lab voicebot", version="1.0.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pipecat-voicebot"}


@app.websocket("/asterisk")
async def asterisk_ws(websocket: WebSocket):
    await websocket.accept()
    settings = load_settings()
    try:
        await run_asterisk_call(websocket, settings)
    except Exception as exc:
        logger.exception("Voicebot session error: {}", exc)
        await websocket.close()


def main() -> None:
    settings = load_settings()
    logger.info(
        "Listening {}:{} path=/asterisk | STT={} TTS={} voice_id={} rate={}Hz | LLM={} max_tokens={} temp={}",
        settings.host,
        settings.port,
        settings.elevenlabs_stt_model,
        settings.elevenlabs_tts_model,
        settings.elevenlabs_voice_id,
        settings.sample_rate,
        settings.ollama_model,
        settings.ollama_max_completion_tokens,
        settings.ollama_temperature,
    )
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        factory=False,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
