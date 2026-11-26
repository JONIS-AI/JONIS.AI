from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

from . import __version__
from .agent import AgentHarness
from .errors import HarnessError
from .providers import OllamaProvider, OpenAICompatibleProvider
from .vault import VaultTools

DEFAULT_VAULT = "~/Documents/JONIS.AI Vault"
PROFILE_MODELS = {
    "lite": "qwen2.5-coder:1.5b",
    "balanced": "qwen2.5-coder:3b",
    "full": "qwen2.5-coder:7b",
}
PROFILE_STEPS = {"lite": 4, "balanced": 6, "full": 8}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="jonis-ai",
        description="Run the local-first JONIS.AI Agent Harness on an Obsidian vault.",
    )
    parser.add_argument("prompt", nargs="+", help="Task for the agent")
    parser.add_argument("--vault", default=os.environ.get("JONIS_AI_VAULT", DEFAULT_VAULT))
    parser.add_argument("--provider", choices=["ollama", "openai-compatible"])
    parser.add_argument("--profile", choices=["lite", "balanced", "full"], help="Performance profile for model defaults and step limits")
    parser.add_argument("--model")
    parser.add_argument("--base-url")
    parser.add_argument("--allow-writes", action="store_true", help="Allow create_note and append_note for this run")
    parser.add_argument("--max-steps", type=int, help="Override the profile step limit")
    parser.add_argument("--timeout", type=float, default=120)
    parser.add_argument("--version", action="version", version=f"JONIS.AI Harness {__version__}")
    return parser


def load_config(vault: Path) -> dict[str, Any]:
    path = vault / ".jonis-ai" / "config.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as error:
        raise HarnessError(f"Could not read {path}: {error}") from error
    if not isinstance(data, dict):
        raise HarnessError(f"Invalid configuration in {path}: expected an object.")
    return data


def resolve_profile(args: argparse.Namespace, config: dict[str, Any]) -> str:
    profile = args.profile or config.get("profile") or os.environ.get("JONIS_AI_PROFILE") or "balanced"
    if profile not in PROFILE_MODELS:
        raise HarnessError(f"Unsupported performance profile: {profile}")
    return profile


def create_provider(args: argparse.Namespace, config: dict[str, Any]) -> Any:
    profile = resolve_profile(args, config)
    provider_name = args.provider or config.get("provider") or os.environ.get("JONIS_AI_PROVIDER") or "ollama"
    model = args.model or config.get("model") or os.environ.get("JONIS_AI_MODEL") or PROFILE_MODELS[profile]
    base_url = args.base_url or config.get("base_url") or os.environ.get("JONIS_AI_BASE_URL")
    if provider_name == "ollama":
        return OllamaProvider(model, base_url, args.timeout)
    if provider_name == "openai-compatible":
        return OpenAICompatibleProvider(
            model,
            base_url,
            os.environ.get("JONIS_AI_API_KEY") or config.get("api_key"),
            args.timeout,
        )
    raise HarnessError(f"Unsupported provider: {provider_name}")


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    vault = Path(args.vault).expanduser().resolve()
    try:
        config = load_config(vault)
        profile = resolve_profile(args, config)
        max_steps = args.max_steps if args.max_steps is not None else config.get("max_steps", PROFILE_STEPS[profile])
        if not isinstance(max_steps, int) or isinstance(max_steps, bool):
            raise HarnessError("max_steps must be an integer between 1 and 50.")
        provider = create_provider(args, config)
        tools = VaultTools(vault, allow_writes=args.allow_writes)
        result = AgentHarness(provider, tools, max_steps=max_steps).run(" ".join(args.prompt))
    except (HarnessError, OSError, ValueError) as error:
        print(f"JONIS.AI: {error}", file=sys.stderr)
        return 1
    print(result.answer)
    if result.hit_step_limit:
        print("JONIS.AI: step limit reached; the task may be incomplete.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
