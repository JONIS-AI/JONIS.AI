from __future__ import annotations

import copy
import io
import json
import os
import tempfile
import threading
import unittest
import urllib.error
from collections import deque
from contextlib import redirect_stderr, redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from harness.agent import AgentHarness
from harness.cli import PROFILE_MODELS, PROFILE_STEPS, build_parser, create_provider, load_config, main
from harness.errors import HarnessError
from harness.providers import OllamaProvider, OpenAICompatibleProvider, ProviderError, _arguments
from harness.vault import MAX_NOTE_BYTES, VaultTools


class ScriptedProvider:
    def __init__(self, *responses: dict) -> None:
        self.responses = deque(responses)
        self.requests: list[tuple[list[dict], list[dict]]] = []

    def complete(self, messages: list[dict], tools: list[dict]) -> dict:
        self.requests.append((copy.deepcopy(messages), copy.deepcopy(tools)))
        if not self.responses:
            raise AssertionError("The provider received an unexpected request.")
        return copy.deepcopy(self.responses.popleft())


class RepeatingProvider:
    def __init__(self, response: dict) -> None:
        self.response = response
        self.calls = 0

    def complete(self, messages: list[dict], tools: list[dict]) -> dict:
        self.calls += 1
        return copy.deepcopy(self.response)


class VaultToolsTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "Notes").mkdir()
        (self.root / "Notes" / "Welcome.md").write_text(
            "# Welcome\n\nJONIS.AI is a local-first second brain.\n",
            encoding="utf-8",
        )
        (self.root / "Projects").mkdir()
        (self.root / "Projects" / "Plan.md").write_text(
            "# Plan\n\nBuild a cited Obsidian workflow.\n",
            encoding="utf-8",
        )
        (self.root / "Notes" / "ignore.txt").write_text("not Markdown", encoding="utf-8")
        for directory in (".obsidian", ".git", ".jonis-ai", ".private"):
            (self.root / directory).mkdir()
            (self.root / directory / "hidden.md").write_text("hidden", encoding="utf-8")
        self.tools = VaultTools(self.root)

    def audit_entries(self) -> list[dict]:
        return [json.loads(line) for line in self.tools.audit.path.read_text(encoding="utf-8").splitlines()]

    def test_lists_only_visible_markdown_notes(self) -> None:
        result = self.tools.execute("list_notes", {})
        self.assertEqual(result, "Notes/Welcome.md\nProjects/Plan.md")

    def test_reads_a_vault_relative_note(self) -> None:
        result = self.tools.execute("read_note", {"path": "Notes/Welcome.md"})
        self.assertIn("Notes/Welcome.md", result)
        self.assertIn("local-first second brain", result)

    def test_searches_case_insensitively(self) -> None:
        result = self.tools.execute("search_notes", {"query": "OBSIDIAN"})
        self.assertIn("Projects/Plan.md", result)
        self.assertIn("cited Obsidian workflow", result)
        self.assertNotIn("Notes/Welcome.md", result)

    def test_rejects_empty_search_queries(self) -> None:
        self.assertIn("Tool error", self.tools.execute("search_notes", {"query": "  "}))

    def test_writes_are_denied_by_default(self) -> None:
        created = self.tools.execute("create_note", {"path": "New.md", "content": "new"})
        appended = self.tools.execute("append_note", {"content": "capture"})
        self.assertIn("Write permission is disabled", created)
        self.assertIn("Write permission is disabled", appended)
        self.assertFalse((self.root / "New.md").exists())
        self.assertFalse((self.root / "JONIS.AI" / "Inbox.md").exists())
        self.assertEqual([entry["status"] for entry in self.audit_entries()], ["started", "denied", "started", "denied"])

    def test_creates_notes_without_overwriting_when_writes_are_allowed(self) -> None:
        tools = VaultTools(self.root, allow_writes=True)
        result = tools.execute("create_note", {"path": "Ideas/Agent.md", "content": "# Agent\n"})
        self.assertEqual(result, "Created Ideas/Agent.md.")
        duplicate = tools.execute("create_note", {"path": "Ideas/Agent.md", "content": "replacement"})
        self.assertIn("already exists", duplicate)
        self.assertEqual((self.root / "Ideas" / "Agent.md").read_text(encoding="utf-8"), "# Agent\n")

    def test_appends_to_default_inbox_when_writes_are_allowed(self) -> None:
        tools = VaultTools(self.root, allow_writes=True)
        self.assertEqual(tools.execute("append_note", {"content": "First capture"}), "Appended to JONIS.AI/Inbox.md.")
        tools.execute("append_note", {"content": "Second capture"})
        content = (self.root / "JONIS.AI" / "Inbox.md").read_text(encoding="utf-8")
        self.assertTrue(content.startswith("# JONIS.AI Inbox"))
        self.assertIn("First capture", content)
        self.assertIn("Second capture", content)

    def test_rejects_unsafe_or_internal_paths(self) -> None:
        unsafe_paths = [
            "",
            "   ",
            "bad\x00.md",
            "../outside.md",
            "Notes/../Welcome.md",
            "Notes/./Welcome.md",
            "./Welcome.md",
            "/tmp/outside.md",
            "C:\\temp\\outside.md",
            "C:outside.md",
            "\\\\server\\share\\outside.md",
            ".obsidian/config.md",
            ".OBSIDIAN/config.md",
            ".git/secret.md",
            ".jonis-ai/config.md",
            "Notes/ignore.txt",
        ]
        for path in unsafe_paths:
            with self.subTest(path=path):
                with self.assertRaises(HarnessError):
                    self.tools.resolve_note_path(path)

    def test_execute_returns_path_errors_to_the_model(self) -> None:
        result = self.tools.execute("read_note", {"path": "../outside.md"})
        self.assertIn("Tool error", result)
        self.assertIn("'..'", result)

    def test_rejects_symlink_file_escaping_the_vault(self) -> None:
        outside = tempfile.TemporaryDirectory()
        self.addCleanup(outside.cleanup)
        target = Path(outside.name) / "secret.md"
        target.write_text("outside secret", encoding="utf-8")
        link = self.root / "escape.md"
        try:
            link.symlink_to(target)
        except OSError as error:
            self.skipTest(f"Symlinks are unavailable: {error}")
        with self.assertRaises(HarnessError):
            self.tools.resolve_note_path("escape.md", must_exist=True)
        self.assertNotIn("escape.md", self.tools.execute("list_notes", {}))

    def test_rejects_symlink_directory_escaping_the_vault(self) -> None:
        outside = tempfile.TemporaryDirectory()
        self.addCleanup(outside.cleanup)
        target = Path(outside.name) / "secret.md"
        target.write_text("outside secret", encoding="utf-8")
        link = self.root / "Linked"
        try:
            link.symlink_to(Path(outside.name), target_is_directory=True)
        except OSError as error:
            self.skipTest(f"Symlinks are unavailable: {error}")
        with self.assertRaises(HarnessError):
            self.tools.resolve_note_path("Linked/secret.md", must_exist=True)
        self.assertNotIn("Linked/secret.md", self.tools.execute("list_notes", {}))

    def test_rejects_resolved_paths_outside_the_vault(self) -> None:
        outside = self.root.parent / "outside.md"
        with patch("harness.vault.Path.resolve", return_value=outside):
            with self.assertRaisesRegex(HarnessError, "escapes the vault"):
                self.tools.resolve_note_path("Note.md")

    def test_reads_are_size_limited(self) -> None:
        (self.root / "Large.md").write_bytes(b"x" * (MAX_NOTE_BYTES + 10))
        result = self.tools.execute("read_note", {"path": "Large.md"})
        self.assertTrue(result.endswith("[Note truncated]"))
        self.assertEqual(result.count("x"), MAX_NOTE_BYTES)

    def test_validates_write_content(self) -> None:
        tools = VaultTools(self.root, allow_writes=True)
        self.assertIn("non-empty", tools.execute("create_note", {"path": "Empty.md", "content": " "}))
        self.assertIn("100,000", tools.execute("create_note", {"path": "Large.md", "content": "x" * 100_001}))

    def test_audits_tool_calls_without_recording_note_content(self) -> None:
        tools = VaultTools(self.root, allow_writes=True)
        secret = "do-not-copy-this-into-the-audit-log"
        tools.execute("create_note", {"path": "Private.md", "content": secret})
        tools.execute("unknown_tool", {})
        tools.execute("read_note", "not-an-object")
        entries = [json.loads(line) for line in tools.audit.path.read_text(encoding="utf-8").splitlines()]
        self.assertEqual(entries[0]["tool"], "create_note")
        self.assertEqual(entries[0]["status"], "started")
        self.assertEqual(entries[1]["status"], "ok")
        self.assertEqual(entries[3]["status"], "error")
        self.assertEqual(entries[5]["status"], "error")
        self.assertNotIn(secret, tools.audit.path.read_text(encoding="utf-8"))

    def test_requires_an_existing_vault(self) -> None:
        with self.assertRaises(HarnessError):
            VaultTools(self.root / "missing")


class AgentHarnessTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "Note.md").write_text("Vault evidence", encoding="utf-8")
        self.tools = VaultTools(self.root)

    def test_returns_a_direct_answer(self) -> None:
        provider = ScriptedProvider({"content": "Ready.", "tool_calls": []})
        result = AgentHarness(provider, self.tools).run("Help me")
        self.assertEqual(result.answer, "Ready.")
        self.assertEqual(result.steps, 1)
        self.assertFalse(result.hit_step_limit)
        self.assertEqual(provider.requests[0][0][0]["role"], "system")
        self.assertEqual(provider.requests[0][0][1]["content"], "Help me")

    def test_runs_tools_and_feeds_results_back_to_the_provider(self) -> None:
        provider = ScriptedProvider(
            {
                "content": "",
                "tool_calls": [{"id": "call-1", "name": "read_note", "arguments": {"path": "Note.md"}}],
            },
            {"content": "The note says: Vault evidence.", "tool_calls": []},
        )
        result = AgentHarness(provider, self.tools).run("Read my note")
        self.assertEqual(result.steps, 2)
        self.assertEqual(result.answer, "The note says: Vault evidence.")
        tool_message = provider.requests[1][0][-1]
        self.assertEqual(tool_message["role"], "tool")
        self.assertEqual(tool_message["id"], "call-1")
        self.assertIn("Vault evidence", tool_message["content"])

    def test_reports_step_limit(self) -> None:
        provider = RepeatingProvider({
            "content": "",
            "tool_calls": [{"id": "call-1", "name": "list_notes", "arguments": {}}],
        })
        result = AgentHarness(provider, self.tools, max_steps=2).run("Keep working")
        self.assertTrue(result.hit_step_limit)
        self.assertEqual(result.steps, 2)
        self.assertEqual(provider.calls, 2)
        self.assertIn("step limit", result.answer)

    def test_validates_prompt_and_step_limit(self) -> None:
        provider = ScriptedProvider()
        with self.assertRaises(ValueError):
            AgentHarness(provider, self.tools, max_steps=0)
        with self.assertRaises(ValueError):
            AgentHarness(provider, self.tools, max_steps=51)
        with self.assertRaises(ValueError):
            AgentHarness(provider, self.tools).run(" ")


class ProviderTests(unittest.TestCase):
    def setUp(self) -> None:
        self.messages = [
            {"role": "system", "content": "system"},
            {"role": "user", "content": "question"},
            {
                "role": "assistant",
                "content": "",
                "tool_calls": [{"id": "call-1", "name": "list_notes", "arguments": {}}],
            },
            {"role": "tool", "id": "call-1", "name": "list_notes", "content": "Note.md"},
        ]
        self.tools = [{"type": "function", "function": {"name": "list_notes"}}]

    def test_ollama_payload_and_response_normalization(self) -> None:
        response = {
            "message": {
                "content": "Done",
                "tool_calls": [{"function": {"name": "read_note", "arguments": {"path": "Note.md"}}}],
            }
        }
        with patch("harness.providers._post_json", return_value=response) as post:
            result = OllamaProvider("local-model", "http://localhost:11434/", 30).complete(self.messages, self.tools)
        url, payload, headers, timeout = post.call_args.args
        self.assertEqual(url, "http://localhost:11434/api/chat")
        self.assertEqual(payload["model"], "local-model")
        self.assertFalse(payload["stream"])
        self.assertEqual(headers, {})
        self.assertEqual(timeout, 30)
        self.assertEqual(payload["messages"][2]["tool_calls"][0]["function"]["arguments"], {})
        self.assertEqual(payload["messages"][3]["tool_name"], "list_notes")
        self.assertEqual(result, {
            "content": "Done",
            "tool_calls": [{"id": "ollama-1", "name": "read_note", "arguments": {"path": "Note.md"}}],
        })

    def test_openai_payload_and_response_normalization(self) -> None:
        response = {
            "choices": [{
                "message": {
                    "content": "Done",
                    "tool_calls": [{
                        "id": "remote-7",
                        "function": {"name": "read_note", "arguments": '{"path":"Note.md"}'},
                    }],
                }
            }]
        }
        with patch("harness.providers._post_json", return_value=response) as post:
            result = OpenAICompatibleProvider("cloud-model", "http://localhost:1234/v1", "test-key", 45).complete(
                self.messages,
                self.tools,
            )
        url, payload, headers, timeout = post.call_args.args
        self.assertEqual(url, "http://localhost:1234/v1/chat/completions")
        self.assertEqual(headers["Authorization"], "Bearer test-key")
        self.assertEqual(timeout, 45)
        assistant_call = payload["messages"][2]["tool_calls"][0]
        self.assertEqual(assistant_call["id"], "call-1")
        self.assertEqual(assistant_call["function"]["arguments"], "{}")
        self.assertEqual(payload["messages"][3]["tool_call_id"], "call-1")
        self.assertEqual(result["tool_calls"][0]["id"], "remote-7")
        self.assertEqual(result["tool_calls"][0]["arguments"], {"path": "Note.md"})

    def test_openai_omits_authorization_without_a_key(self) -> None:
        response = {"choices": [{"message": {"content": "Done"}}]}
        with patch("harness.providers._post_json", return_value=response) as post:
            OpenAICompatibleProvider("local").complete([], [])
        self.assertNotIn("Authorization", post.call_args.args[2])

    def test_rejects_invalid_tool_arguments(self) -> None:
        self.assertEqual(_arguments('{"path":"Note.md"}'), {"path": "Note.md"})
        for value in ("not-json", "[]", "null", 3, None):
            with self.subTest(value=value):
                with self.assertRaises(ProviderError):
                    _arguments(value)

    def test_rejects_unexpected_provider_responses(self) -> None:
        with patch("harness.providers._post_json", return_value={}):
            with self.assertRaises(ProviderError):
                OllamaProvider("model").complete([], [])
        with patch("harness.providers._post_json", return_value={"choices": []}):
            with self.assertRaises(ProviderError):
                OpenAICompatibleProvider("model").complete([], [])

    def test_maps_http_and_connection_errors(self) -> None:
        http_error = urllib.error.HTTPError("http://localhost", 401, "Unauthorized", {}, io.BytesIO(b'{"error":"bad key"}'))
        with patch("harness.providers.urllib.request.urlopen", side_effect=http_error):
            with self.assertRaisesRegex(ProviderError, "HTTP 401"):
                OllamaProvider("model").complete([], [])
        with patch("harness.providers.urllib.request.urlopen", side_effect=urllib.error.URLError("offline")):
            with self.assertRaisesRegex(ProviderError, "Could not reach"):
                OllamaProvider("model").complete([], [])


class LocalProviderIntegrationTests(unittest.TestCase):
    def test_cli_completes_a_tool_loop_through_local_http(self) -> None:
        requests = []

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self) -> None:
                length = int(self.headers["Content-Length"])
                payload = json.loads(self.rfile.read(length))
                requests.append(payload)
                if len(requests) == 1:
                    message = {
                        "role": "assistant",
                        "content": "",
                        "tool_calls": [{"function": {"name": "list_notes", "arguments": {}}}],
                    }
                else:
                    message = {"role": "assistant", "content": "Found Note.md."}
                body = json.dumps({"message": message}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, format: str, *args: object) -> None:
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        self.addCleanup(thread.join)
        root = Path(temporary.name)
        (root / "Note.md").write_text("Local evidence", encoding="utf-8")
        stdout = io.StringIO()
        stderr = io.StringIO()
        try:
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = main([
                    "List my notes",
                    "--vault", str(root),
                    "--provider", "ollama",
                    "--model", "test-model",
                    "--base-url", f"http://127.0.0.1:{server.server_port}",
                    "--timeout", "5",
                ])
        finally:
            server.shutdown()
            thread.join(timeout=5)
            server.server_close()

        self.assertEqual(status, 0)
        self.assertEqual(stdout.getvalue().strip(), "Found Note.md.")
        self.assertEqual(stderr.getvalue(), "")
        self.assertEqual(len(requests), 2)
        self.assertEqual(requests[0]["messages"][-1]["role"], "user")
        self.assertEqual(requests[1]["messages"][-1]["role"], "tool")
        self.assertIn("Note.md", requests[1]["messages"][-1]["content"])
        audit = [json.loads(line) for line in (root / ".jonis-ai" / "audit.jsonl").read_text(encoding="utf-8").splitlines()]
        self.assertEqual([entry["status"] for entry in audit], ["started", "ok"])


class CliTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / ".jonis-ai").mkdir()

    def test_loads_and_validates_configuration(self) -> None:
        config_path = self.root / ".jonis-ai" / "config.json"
        self.assertEqual(load_config(self.root), {})
        config_path.write_text('{"provider":"ollama","model":"configured"}', encoding="utf-8")
        self.assertEqual(load_config(self.root)["model"], "configured")
        config_path.write_text('\ufeff{"provider":"ollama","model":"bom"}', encoding="utf-8")
        self.assertEqual(load_config(self.root)["model"], "bom")
        config_path.write_text("[]", encoding="utf-8")
        with self.assertRaises(HarnessError):
            load_config(self.root)
        config_path.write_text("not-json", encoding="utf-8")
        with self.assertRaises(HarnessError):
            load_config(self.root)

    def test_provider_precedence_is_cli_then_config_then_environment(self) -> None:
        environment = {
            "JONIS_AI_PROVIDER": "openai-compatible",
            "JONIS_AI_MODEL": "environment-model",
            "JONIS_AI_BASE_URL": "http://environment/v1",
            "JONIS_AI_API_KEY": "environment-key",
        }
        with patch.dict(os.environ, environment, clear=True):
            args = build_parser().parse_args(["task"])
            provider = create_provider(args, {"provider": "ollama", "model": "config-model"})
            self.assertIsInstance(provider, OllamaProvider)
            self.assertEqual(provider.model, "config-model")
            self.assertEqual(provider.base_url, "http://environment/v1")
            args = build_parser().parse_args([
                "task", "--provider", "ollama", "--model", "cli-model", "--base-url", "http://cli",
            ])
            provider = create_provider(args, {"provider": "openai-compatible", "model": "config-model"})
            self.assertEqual(provider.model, "cli-model")
            self.assertEqual(provider.base_url, "http://cli")
            provider = create_provider(build_parser().parse_args(["task"]), {})
            self.assertIsInstance(provider, OpenAICompatibleProvider)
            self.assertEqual(provider.api_key, "environment-key")

    def test_performance_profiles_select_model_defaults(self) -> None:
        for profile, model in PROFILE_MODELS.items():
            with self.subTest(profile=profile):
                args = build_parser().parse_args(["task", "--profile", profile])
                provider = create_provider(args, {})
                self.assertEqual(provider.model, model)
        self.assertEqual(PROFILE_STEPS, {"lite": 4, "balanced": 6, "full": 8})

    def test_main_runs_with_explicit_write_permission(self) -> None:
        provider = ScriptedProvider({"content": "Done", "tool_calls": []})
        stdout = io.StringIO()
        stderr = io.StringIO()
        with patch("harness.cli.create_provider", return_value=provider), patch("harness.cli.VaultTools", wraps=VaultTools) as tools:
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = main(["task", "--vault", str(self.root), "--allow-writes"])
        self.assertEqual(status, 0)
        self.assertEqual(stdout.getvalue().strip(), "Done")
        self.assertEqual(stderr.getvalue(), "")
        tools.assert_called_once_with(self.root.resolve(), allow_writes=True)

    def test_main_returns_two_when_step_limit_is_reached(self) -> None:
        provider = RepeatingProvider({
            "content": "",
            "tool_calls": [{"id": "call-1", "name": "list_notes", "arguments": {}}],
        })
        stdout = io.StringIO()
        stderr = io.StringIO()
        with patch("harness.cli.create_provider", return_value=provider):
            with redirect_stdout(stdout), redirect_stderr(stderr):
                status = main(["task", "--vault", str(self.root), "--max-steps", "1"])
        self.assertEqual(status, 2)
        self.assertIn("step limit", stderr.getvalue())

    def test_main_reports_invalid_vault(self) -> None:
        stderr = io.StringIO()
        with patch("harness.cli.create_provider", return_value=ScriptedProvider()):
            with redirect_stderr(stderr):
                status = main(["task", "--vault", str(self.root / "missing")])
        self.assertEqual(status, 1)
        self.assertIn("Vault does not exist", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
