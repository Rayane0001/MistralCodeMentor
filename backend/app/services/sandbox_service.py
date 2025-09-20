# @file backend/app/services/sandbox_service.py
import contextlib
import logging
import os
import resource
import shutil
import signal
import subprocess
import tempfile
import time
from dataclasses import dataclass, asdict
from typing import List, Literal, Tuple

import psutil

logger = logging.getLogger(__name__)
Status = Literal["success", "error", "timeout"]

@dataclass
class ExecutionResult:
    output: str
    errors: List[str]
    warnings: List[str]
    execution_time: float  # ms
    memory_used: float     # MB
    cpu_time: float        # s
    status: Status
    exit_code: int
    def dict(self): return asdict(self)

class SandboxService:
    def __init__(self, timeout_seconds: int = int(os.getenv("SANDBOX_TIMEOUT", 5)),
                 memory_limit_mb: int = int(os.getenv("MAX_MEMORY", 128)),
                 cpu_time_limit_s: int = None):
        self.timeout = timeout_seconds
        self.mem_limit_mb = memory_limit_mb
        self.cpu_time_limit_s = cpu_time_limit_s or timeout_seconds

    def run_code(self, language: Literal["python", "javascript"], content: str) -> ExecutionResult:
        tmpdir = tempfile.mkdtemp(prefix="sandbox_")
        try:
            if language == "python":
                path = os.path.join(tmpdir, "main.py")
                with open(path, "w", encoding="utf-8") as f: f.write(content)
                cmd = ["python3", "-I", "-X", "faulthandler", path]
            elif language == "javascript":
                path = os.path.join(tmpdir, "main.js")
                with open(path, "w", encoding="utf-8") as f: f.write(content)
                cmd = ["node", "--stack_size=1024", path]
            else:
                return ExecutionResult("", [f"Unsupported language: {language}"], [], 0.0, 0.0, 0.0, "error", 1)
            return self._run_process(cmd, tmpdir)
        finally:
            with contextlib.suppress(Exception):
                shutil.rmtree(tmpdir, ignore_errors=True)

    def _set_limits(self):
        with contextlib.suppress(Exception):
            resource.setrlimit(resource.RLIMIT_CPU, (self.cpu_time_limit_s, self.cpu_time_limit_s))
        with contextlib.suppress(Exception):
            bytes_limit = self.mem_limit_mb * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (bytes_limit, bytes_limit))
        with contextlib.suppress(Exception):
            resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))

    def _mem_mb(self) -> float:
        with contextlib.suppress(Exception):
            p = psutil.Process(os.getpid())
            return round(p.memory_info().rss / (1024 * 1024), 2)
        return 0.0

    def _split_err(self, stderr: str) -> Tuple[List[str], List[str]]:
        if not stderr: return [], []
        errs, warns = [], []
        for line in stderr.strip().splitlines():
            (warns if "warning" in line.lower() else errs).append(line)
        return errs, warns

    def _infer_reason(self, rc: int) -> str:
        if rc < 0:
            sig = -rc
            mapping = {
                getattr(signal, "SIGXCPU", 24): "CPU time limit exceeded",
                getattr(signal, "SIGKILL", 9): "Process killed (possible memory limit exceeded or timeout)",
                getattr(signal, "SIGTERM", 15): "Process terminated",
                getattr(signal, "SIGSEGV", 11): "Segmentation fault",
                getattr(signal, "SIGALRM", 14): "Time limit exceeded",
            }
            return f"{mapping.get(sig, 'Process terminated by signal')} (signal {sig})"
        return f"Process exited with code {rc}"

    def _run_process(self, cmd: List[str], cwd: str) -> ExecutionResult:
        start = time.time()
        start_mem = self._mem_mb()
        proc = None
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd, text=True, preexec_fn=self._set_limits)
            stdout, stderr = proc.communicate(timeout=self.timeout)
            exec_ms = round((time.time() - start) * 1000.0, 3)
            mem_used = max(0.0, round(self._mem_mb() - start_mem, 2))
            cpu_time = 0.0
            with contextlib.suppress(Exception):
                r = resource.getrusage(resource.RUSAGE_CHILDREN)
                cpu_time = round(r.ru_utime + r.ru_stime, 3)
            errors, warnings = self._split_err(stderr)
            rc = proc.returncode
            if rc != 0 and not errors:
                errors.append(self._infer_reason(rc))
            status: Status = "success" if rc == 0 and not errors else "error"
            return ExecutionResult((stdout or "").rstrip(), errors, warnings, exec_ms, mem_used, cpu_time, status, rc)
        except subprocess.TimeoutExpired:
            if proc:
                with contextlib.suppress(Exception):
                    proc.kill(); proc.communicate(timeout=0.2)
            return ExecutionResult("", [f"Code execution timed out after {self.timeout}s"], [], float(self.timeout*1000), 0.0, 0.0, "timeout", -1)
        except Exception as e:
            logger.exception("Execution error")
            return ExecutionResult("", [f"Execution failed: {e}"], [], 0.0, 0.0, 0.0, "error", 1)

sandbox_service = SandboxService()
