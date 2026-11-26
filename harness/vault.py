from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path, PurePosixPath, PureWindowsPath
from typing import Any, Callable

from .errors import HarnessError

MAX_NOTE_BYTES = 200_000
MAX_NOTE_CONTENT = 100_000
MAX_LIST_RESULTS = 200
MAX_SEARCH_RESULTS = 20
BLOCKED_DIRECTORIES = {".git", ".obsidian", ".jonis-ai"}

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "list_notes",
            "description": "List Markdown notes inside the Obsidian vault.",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_note",
            "description": "Read a Markdown note using its vault-relative path.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_notes",
            "description": "Search note text for a case-insensitive query and return matching snippets.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string", "maxLength": 200}},
                "required": ["query"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_note",
            "description": "Create a new Markdown note without overwriting an existing file. Requires write permission.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}, "content": {"type": "string", "maxLength": 100000}},
                "required": ["path", "content"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "append_note",
            "description": "Append a timestamped entry to a Markdown note, creating it if needed. Requires write permission.",
            "parameters": {
                "type": "object",
                "properties": {"path": {"type": "string"}, "content": {"type": "string", "maxLength": 100000}},
                "required": ["content"],
                "additionalProperties": False,
            },
        },
    },
]

WRITE_TOOLS = {"create_note", "append_note"}


class AuditLog:
    def __init__(self, vault_root: Path) -> None:
        self.path = vault_root / ".jonis-ai" / "audit.jsonl"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, tool: str, status: str, **details: Any) -> None:
        entry = {
            "timestamp": datetime.now().astimezone().isoformat(timespec="seconds"),
            "tool": tool,
            "status": status,
            **details,
        }
        try:
            with self.path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except OSError as error:
            raise HarnessError(f"Could not write the audit log: {error}") from error


class VaultTools:
    def __init__(self, vault_path: str | Path, allow_writes: bool = False) -> None:
        self.root = Path(vault_path).expanduser().resolve()
        if not self.root.is_dir():
            raise HarnessError(f"Vault does not exist or is not a directory: {self.root}")
        self.allow_writes = allow_writes
        self.audit = AuditLog(self.root)
        self._handlers: dict[str, Callable[..., str]] = {
            "list_notes": self._list_notes,
            "read_note": self._read_note,
            "search_notes": self._search_notes,
            "create_note": self._create_note,
            "append_note": self._append_note,
        }

    def resolve_note_path(self, value: Any, *, must_exist: bool = False) -> Path:
        if not isinstance(value, str) or not value.strip() or "\x00" in value:
            raise HarnessError("Note path must be a non-empty string.")
        portable = value.strip().replace("\\", "/")
        if any(part in {".", ".."} for part in portable.split("/")):
            raise HarnessError("Note path cannot contain '.' or '..'.")
        posix = PurePosixPath(portable)
        windows = PureWindowsPath(portable)
        if posix.is_absolute() or windows.is_absolute() or windows.drive:
            raise HarnessError("Note path must be relative to the vault.")
        parts = posix.parts
        if not parts:
            raise HarnessError("Note path cannot be empty.")
        if any(part.casefold() in BLOCKED_DIRECTORIES for part in parts):
            raise HarnessError("Internal vault directories are not available to the agent.")
        if posix.suffix.lower() != ".md":
            raise HarnessError("Only Markdown notes are supported.")
        candidate = (self.root / Path(*parts)).resolve()
        try:
            candidate.relative_to(self.root)
        except ValueError as error:
            raise HarnessError("Note path escapes the vault.") from error
        if must_exist and not candidate.is_file():
            raise HarnessError(f"Note does not exist: {posix.as_posix()}")
        return candidate

    def execute(self, name: str, arguments: Any) -> str:
        handler = self._handlers.get(name)
        details: dict[str, Any] = {}
        if isinstance(arguments, dict) and isinstance(arguments.get("path"), str):
            details["path"] = arguments["path"]
        self.audit.record(name, "started", **details)
        try:
            if handler is None:
                raise HarnessError(f"Unknown tool: {name}")
            if name in WRITE_TOOLS and not self.allow_writes:
                raise HarnessError("Write permission is disabled. Restart with --allow-writes to modify notes.")
            if not isinstance(arguments, dict):
                raise HarnessError("Tool arguments must be an object.")
            result = handler(**arguments)
            self.audit.record(name, "ok", **details)
            return result
        except HarnessError as error:
            status = "denied" if "permission" in str(error).lower() else "error"
            self.audit.record(name, status, error=str(error), **details)
            return f"Tool error: {error}"
        except (OSError, TypeError, ValueError) as error:
            self.audit.record(name, "error", error=str(error), **details)
            return f"Tool error: {error}"

    def _list_notes(self) -> str:
        paths = self._note_paths()
        if not paths:
            return "No Markdown notes found."
        return "\n".join(paths[:MAX_LIST_RESULTS])

    def _read_note(self, path: str) -> str:
        note = self.resolve_note_path(path, must_exist=True)
        with note.open("rb") as handle:
            raw = handle.read(MAX_NOTE_BYTES + 1)
        truncated = len(raw) > MAX_NOTE_BYTES
        text = raw[:MAX_NOTE_BYTES].decode("utf-8", errors="replace")
        suffix = "\n[Note truncated]" if truncated else ""
        return f"{PurePosixPath(path.replace('\\', '/')).as_posix()}\n\n{text}{suffix}"

    def _search_notes(self, query: str) -> str:
        if not isinstance(query, str) or not query.strip():
            raise HarnessError("Search query must be a non-empty string.")
        query = query.strip()[:200]
        folded = query.casefold()
        matches = []
        for relative in self._note_paths():
            note = self.resolve_note_path(relative, must_exist=True)
            if note.stat().st_size > MAX_NOTE_BYTES:
                continue
            text = note.read_text(encoding="utf-8", errors="replace")
            position = text.casefold().find(folded)
            if position < 0:
                continue
            start = max(0, position - 180)
            end = min(len(text), position + len(query) + 320)
            snippet = text[start:end].replace("\r", " ").strip()
            matches.append(f"{relative}: {snippet}")
            if len(matches) >= MAX_SEARCH_RESULTS:
                break
        return "\n\n".join(matches) if matches else "No matching notes found."

    def _create_note(self, path: str, content: str) -> str:
        self._validate_content(content)
        note = self.resolve_note_path(path)
        if note.exists():
            raise HarnessError(f"Note already exists: {path}")
        note.parent.mkdir(parents=True, exist_ok=True)
        try:
            with note.open("x", encoding="utf-8") as handle:
                handle.write(content)
        except FileExistsError as error:
            raise HarnessError(f"Note already exists: {path}") from error
        return f"Created {path}."

    def _append_note(self, content: str, path: str = "JONIS.AI/Inbox.md") -> str:
        self._validate_content(content)
        note = self.resolve_note_path(path)
        note.parent.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"\n## {timestamp}\n\n{content}\n"
        if note.exists():
            with note.open("a", encoding="utf-8") as handle:
                handle.write(entry)
        else:
            with note.open("x", encoding="utf-8") as handle:
                handle.write(f"# JONIS.AI Inbox\n{entry}")
        return f"Appended to {path}."

    @staticmethod
    def _validate_content(content: Any) -> None:
        if not isinstance(content, str) or not content.strip():
            raise HarnessError("Note content must be a non-empty string.")
        if len(content) > MAX_NOTE_CONTENT:
            raise HarnessError("Note content exceeds the 100,000 character limit.")

    def _note_paths(self) -> list[str]:
        paths = []
        for current, directories, files in os.walk(self.root, followlinks=False):
            current_path = Path(current)
            directories[:] = sorted(
                directory for directory in directories
                if directory not in BLOCKED_DIRECTORIES
                and not directory.startswith(".")
                and not (current_path / directory).is_symlink()
            )
            for filename in sorted(files):
                if filename.startswith(".") or not filename.lower().endswith(".md"):
                    continue
                note = current_path / filename
                if note.is_symlink():
                    continue
                try:
                    note.resolve().relative_to(self.root)
                except ValueError:
                    continue
                paths.append(note.relative_to(self.root).as_posix())
        return sorted(paths)
