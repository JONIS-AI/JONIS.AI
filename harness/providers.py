from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any

from .errors import HarnessError


class ProviderError(HarnessError):
    pass


def _post_json(url: str, payload: dict[str, Any], headers: dict[str, str], timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        try:
            detail = error.read().decode("utf-8", errors="replace")[:300]
        finally:
            error.close()
        raise ProviderError(f"Provider returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise ProviderError(f"Could not reach the provider: {error.reason}") from error
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ProviderError("Provider returned an invalid JSON response.") from error
    if not isinstance(data, dict):
        raise ProviderError("Provider returned an unexpected response.")
    return data


def _arguments(value: Any) -> dict[str, Any]:
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError as error:
            raise ProviderError("Provider returned invalid tool arguments.") from error
    if not isinstance(value, dict):
        raise ProviderError("Provider tool arguments must be an object.")
    return value


class OllamaProvider:
    name = "ollama"

    def __init__(self, model: str, base_url: str | None = None, timeout: float = 120) -> None:
        self.model = model
        self.base_url = (base_url or "http://127.0.0.1:11434").rstrip("/")
        self.timeout = timeout

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": [_ollama_message(message) for message in messages],
            "tools": tools,
            "stream": False,
        }
        data = _post_json(f"{self.base_url}/api/chat", payload, {}, self.timeout)
        message = data.get("message")
        if not isinstance(message, dict):
            raise ProviderError("Ollama response did not contain a message.")
        calls = []
        for index, call in enumerate(message.get("tool_calls") or []):
            function = call.get("function") if isinstance(call, dict) else None
            if not isinstance(function, dict) or not function.get("name"):
                raise ProviderError("Ollama returned an invalid tool call.")
            calls.append({
                "id": f"ollama-{index + 1}",
                "name": function["name"],
                "arguments": _arguments(function.get("arguments", {})),
            })
        return {"content": message.get("content") or "", "tool_calls": calls}


class OpenAICompatibleProvider:
    name = "openai-compatible"

    def __init__(self, model: str, base_url: str | None = None, api_key: str | None = None, timeout: float = 120) -> None:
        self.model = model
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def complete(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]) -> dict[str, Any]:
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {
            "model": self.model,
            "messages": [_openai_message(message) for message in messages],
            "tools": tools,
            "stream": False,
        }
        data = _post_json(f"{self.base_url}/chat/completions", payload, headers, self.timeout)
        choices = data.get("choices")
        if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
            raise ProviderError("Provider response did not contain a choice.")
        message = choices[0].get("message")
        if not isinstance(message, dict):
            raise ProviderError("Provider response did not contain a message.")
        calls = []
        for index, call in enumerate(message.get("tool_calls") or []):
            function = call.get("function") if isinstance(call, dict) else None
            if not isinstance(function, dict) or not function.get("name"):
                raise ProviderError("Provider returned an invalid tool call.")
            calls.append({
                "id": call.get("id") or f"openai-{index + 1}",
                "name": function["name"],
                "arguments": _arguments(function.get("arguments", {})),
            })
        return {"content": message.get("content") or "", "tool_calls": calls}


def _ollama_message(message: dict[str, Any]) -> dict[str, Any]:
    role = message["role"]
    if role == "assistant" and message.get("tool_calls"):
        return {
            "role": "assistant",
            "content": message.get("content", ""),
            "tool_calls": [
                {"function": {"name": call["name"], "arguments": call["arguments"]}}
                for call in message["tool_calls"]
            ],
        }
    if role == "tool":
        return {"role": "tool", "tool_name": message["name"], "content": message["content"]}
    return {"role": role, "content": message.get("content", "")}


def _openai_message(message: dict[str, Any]) -> dict[str, Any]:
    role = message["role"]
    if role == "assistant" and message.get("tool_calls"):
        return {
            "role": "assistant",
            "content": message.get("content", ""),
            "tool_calls": [
                {
                    "id": call["id"],
                    "type": "function",
                    "function": {"name": call["name"], "arguments": json.dumps(call["arguments"])},
                }
                for call in message["tool_calls"]
            ],
        }
    if role == "tool":
        return {"role": "tool", "tool_call_id": message["id"], "content": message["content"]}
    return {"role": role, "content": message.get("content", "")}
