# @file backend/app/api/routes.py
from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import sys
from pathlib import Path
import importlib.util
import os

router = APIRouter(tags=["api"])

# --- Robust imports without requiring package __init__.py ---
FILE_DIR = Path(__file__).resolve().parent
APP_DIR = FILE_DIR.parent

def _import_from(path: Path, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, str(path))
    if not spec or not spec.loader:
        return None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore[attr-defined]
    return module

# sandbox_service
sandbox_service = None
try:
    if str(APP_DIR) not in sys.path:
        sys.path.insert(0, str(APP_DIR))
    from services.sandbox_service import sandbox_service as _svc  # type: ignore
    sandbox_service = _svc
except Exception:
    module = _import_from(APP_DIR / "services" / "sandbox_service.py", "sandbox_service")
    if module:
        sandbox_service = getattr(module, "sandbox_service", None) or getattr(module, "SandboxService")()

if sandbox_service is None:
    raise RuntimeError("sandbox_service not found")

# mistral_service
mistral_service = None
try:
    if str(APP_DIR) not in sys.path:
        sys.path.insert(0, str(APP_DIR))
    from services.mistral_service import mistral_service as _ms  # type: ignore
    mistral_service = _ms
except Exception:
    module = _import_from(APP_DIR / "services" / "mistral_service.py", "mistral_service")
    if module:
        mistral_service = getattr(module, "mistral_service", None) or getattr(module, "MistralService")()

if mistral_service is None:
    raise RuntimeError("mistral_service not found")

# --- Models (local for resilience) ---
class ExecuteRequest(BaseModel):
    language: Literal["python", "javascript"]
    content: str = Field(..., max_length=200_000)

class ExecResultModel(BaseModel):
    output: str
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    execution_time: float  # ms
    memory_used: float
    cpu_time: float
    status: Literal["success", "error", "timeout"]
    exit_code: int

class ExecuteResponse(BaseModel):
    success: bool
    result: ExecResultModel
    message: Optional[str] = None

class CodeAnalysisRequest(BaseModel):
    content: str
    language: Literal["python", "javascript"]
    cursor_position: int
    errors: List[str] = Field(default_factory=list)

class AIHintModel(BaseModel):
    level: Literal["concept", "approach", "pseudo-code"]
    content: str
    timestamp: str

class CodeAnalysisResponse(BaseModel):
    hint: AIHintModel
    success: bool
    message: Optional[str] = None

# --- Routes ---
@router.post("/api/v1/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    try:
        result = sandbox_service.run_code(req.language, req.content)
        payload = {
            "output": result.output,
            "errors": result.errors,
            "warnings": result.warnings,
            "execution_time": result.execution_time,
            "memory_used": result.memory_used,
            "cpu_time": result.cpu_time,
            "status": result.status,
            "exit_code": result.exit_code,
        }
        return {"success": result.status == "success", "result": payload, "message": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {e}")

@router.post("/api/v1/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(req: CodeAnalysisRequest):
    try:
        hint = await mistral_service.analyze_code(req)  # type: ignore
        if isinstance(hint, dict):
            level = hint.get("level", "concept")
            content = hint.get("content", "")
            ts = hint.get("timestamp")
        else:
            level = getattr(hint, "level", "concept")
            content = getattr(hint, "content", "")
            ts = getattr(hint, "timestamp", "")
        ts_str = ts.isoformat() if hasattr(ts, "isoformat") else (str(ts) if ts else "")
        return {"hint": {"level": level, "content": content, "timestamp": ts_str}, "success": True, "message": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

@router.get("/api/v1/languages")
async def get_languages():
    return {"languages": [
        {"id": "python", "name": "Python", "version": "3.x", "supported": True},
        {"id": "javascript", "name": "JavaScript", "version": "Node.js", "supported": True},
    ]}

@router.get("/api/v1/sandbox/status")
async def sandbox_status():
    return {
        "status": "ready",
        "limits": {
            "timeout": int(os.getenv("SANDBOX_TIMEOUT", 5)),
            "memory_mb": int(os.getenv("MAX_MEMORY", 128)),
            "max_processes": 10,
        },
        "security": {"isolated": False, "network_disabled": False, "filesystem_readonly": False},
    }
