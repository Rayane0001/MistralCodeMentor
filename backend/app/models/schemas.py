# @file backend/app/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class CodeAnalysisRequest(BaseModel):
    content: str
    language: Literal["python", "javascript"]
    cursor_position: int
    errors: List[str] = Field(default_factory=list)

class AIHint(BaseModel):
    level: Literal["concept", "approach", "pseudo-code"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CodeAnalysisResponse(BaseModel):
    hint: AIHint
    success: bool
    message: Optional[str] = None

class CodeExecutionRequest(BaseModel):
    content: str
    language: Literal["python", "javascript"]

class ExecutionResult(BaseModel):
    output: str
    errors: List[str] = Field(default_factory=list)
    execution_time: float
    memory_used: int  # MB
    cpu_time: float   # seconds
    status: Literal["success", "error", "timeout"]
    exit_code: Optional[int] = None
    warnings: List[str] = Field(default_factory=list)

class CodeExecutionResponse(BaseModel):
    result: ExecutionResult
    success: bool
    message: Optional[str] = None
