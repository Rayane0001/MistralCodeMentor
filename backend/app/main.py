# @file backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import robuste du router
from pathlib import Path
import importlib.util
import sys

api_router = None
try:
    from app.api.routes import router as api_router  # type: ignore
except Exception:
    FILE_DIR = Path(__file__).resolve().parent
    BACKEND_DIR = FILE_DIR.parent
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))
    try:
        from app.api.routes import router as api_router  # type: ignore
    except Exception:
        ROUTES_FILE = FILE_DIR / "api" / "routes.py"
        spec = importlib.util.spec_from_file_location("app_api_routes", str(ROUTES_FILE))
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)  # type: ignore[attr-defined]
            api_router = getattr(module, "router", None)

if api_router is None:
    raise RuntimeError("Cannot import API router from app.api.routes")

app = FastAPI(title="MistralCodeMentor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="")

@app.get("/")
def root():
    return {"message": "MistralCodeMentor API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
