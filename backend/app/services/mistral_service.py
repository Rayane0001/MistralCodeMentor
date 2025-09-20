# @file backend/app/services/mistral_service.py
import os
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from mistralai import Mistral  # >=1.0
except Exception as e:
    raise ImportError("Install mistralai>=1.0.0") from e

GUIDELINES = (
    "You are a concise, kind coding mentor. Return one short hint only.\n"
    "- Max 3 bullet points OR 2 sentences\n"
    "- Max ~50 words total\n"
    "- No full solutions; optional 2–3 line pseudo-code if needed\n"
    "- Be specific to the student's code and errors\n"
)

class MistralService:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY not set")
        self.client = Mistral(api_key=self.api_key)
        self.model = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

    async def analyze_code(self, req) -> dict:
        data = req.model_dump() if hasattr(req, "model_dump") else dict(req)
        prompt = self._build_prompt(
            data.get("content", ""), data.get("language", "python"),
            int(data.get("cursor_position", 0)), data.get("errors", []) or []
        )
        try:
            content = await asyncio.to_thread(self._chat, prompt)
            content = self._trim(content)
            level = self._level(data)
            return {"level": level, "content": content, "timestamp": datetime.utcnow()}
        except Exception as e:
            logger.error(f"Mistral error: {e}")
            return {
                "level": "concept",
                "content": "State goal → outline steps → implement first step.",
                "timestamp": datetime.utcnow(),
            }

    def _chat(self, prompt: str) -> str:
        resp = self.client.chat.complete(
            model=self.model,
            messages=[
                {"role": "system", "content": GUIDELINES},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=120,
        )
        if not resp.choices:
            return "Clarify the goal, inputs, outputs; start with one small step."
        return (resp.choices[0].message.content or "").strip()

    def _build_prompt(self, code: str, language: str, cursor: int, errors: list[str]) -> str:
        errs = "\n".join(f"- {e}" for e in errors) if errors else "None"
        code_block = code.strip() or "# No code yet"
        return (
            f"Language: {language}\n"
            f"Cursor line: {cursor}\n"
            f"Editor errors:\n{errs}\n\n"
            f"Student code:\n```{language}\n{code_block}\n```"
        )

    def _level(self, data: dict) -> str:
        content = (data.get("content") or "").strip()
        if not content:
            return "concept"
        if data.get("errors"):
            return "approach"
        if len(content.splitlines()) > 10:
            return "pseudo-code"
        return "concept"

    def _trim(self, s: str) -> str:
        s = " ".join(s.split())
        return s[:240]

mistral_service = MistralService()
