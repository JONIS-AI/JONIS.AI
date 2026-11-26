"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  PROFILES,
  PortableAgentHarness,
  PortableProvider,
  PortableVaultTools,
  normalizeNotePath,
} = require("../obsidian-plugin/harness.js");

function makeVault(initial = {}) {
  const files = new Map(Object.entries(initial));
  const folders = new Set();
  const fileObjects = new Map();
  const syncFiles = () => {
    fileObjects.clear();
    for (const [path, content] of files) {
      if (!path.endsWith(".md")) continue;
      fileObjects.set(path, { path, extension: "md", stat: { size: Buffer.byteLength(content) } });
    }
  };
  syncFiles();

  const vault = {
    adapter: {
      exists: async (path) => files.has(path),
      read: async (path) => {
        if (!files.has(path)) throw new Error("missing");
        return files.get(path);
      },
      write: async (path, content) => { files.set(path, content); syncFiles(); },
      append: async (path, content) => {
        files.set(path, (files.get(path) || "") + content);
        syncFiles();
      },
    },
    getAbstractFileByPath: (path) => fileObjects.get(path) || (folders.has(path) ? { path } : null),
    getMarkdownFiles: () => [...fileObjects.values()],
    cachedRead: async (file) => files.get(file.path),
    createFolder: async (path) => { folders.add(path); },
    create: async (path, content) => {
      if (files.has(path)) throw new Error("File already exists");
      files.set(path, content);
      syncFiles();
      return fileObjects.get(path);
    },
    append: async (file, content) => {
      files.set(file.path, files.get(file.path) + content);
      syncFiles();
    },
  };
  return { vault, files, folders };
}

function auditEntries(files) {
  const raw = files.get(".jonis-ai/audit.jsonl") || "";
  return raw.trim() ? raw.trim().split("\n").map((line) => JSON.parse(line)) : [];
}

test("portable tools list, read and search visible Markdown notes", async () => {
  const { vault } = makeVault({
    "Notes/Welcome.md": "# Welcome\n\nLocal second brain",
    "Projects/Plan.md": "# Plan\n\nObsidian workflow",
    "Notes/ignore.txt": "not Markdown",
    ".private/Hidden.md": "hidden",
    ".obsidian/config.md": "internal",
  });
  const tools = new PortableVaultTools(vault);
  assert.equal(await tools.execute("list_notes", {}), "Notes/Welcome.md\nProjects/Plan.md");
  assert.match(await tools.execute("read_note", { path: "Notes/Welcome.md" }), /Local second brain/);
  assert.match(await tools.execute("search_notes", { query: "OBSIDIAN" }), /Projects\/Plan\.md/);
});

test("portable tools deny writes by default and audit the denial", async () => {
  const { vault, files } = makeVault();
  const tools = new PortableVaultTools(vault);
  assert.match(await tools.execute("create_note", { path: "New.md", content: "new" }), /permission is disabled/);
  assert.equal(files.has("New.md"), false);
  assert.deepEqual(auditEntries(files).map((entry) => entry.status), ["started", "denied"]);
});

test("portable tools create and append only with explicit write permission", async () => {
  const { vault, files, folders } = makeVault();
  const tools = new PortableVaultTools(vault, { allowWrites: true });
  assert.equal(await tools.execute("create_note", { path: "Ideas/Agent.md", content: "# Agent\n" }), "Created Ideas/Agent.md.");
  assert.equal(files.get("Ideas/Agent.md"), "# Agent\n");
  assert.equal(await tools.execute("append_note", { content: "First capture" }), "Appended to JONIS.AI/Inbox.md.");
  assert.match(files.get("JONIS.AI/Inbox.md"), /First capture/);
  assert(folders.has("Ideas"));
  assert(folders.has("JONIS.AI"));
});

test("portable path validation rejects traversal, absolute and internal paths", () => {
  for (const value of [
    "", " ", "bad\0.md", "../outside.md", "Notes/../Welcome.md", "Notes/./Welcome.md",
    "/tmp/outside.md", "C:\\temp\\outside.md", "C:outside.md", "\\\\server\\share\\outside.md",
    ".obsidian/config.md", ".OBSIDIAN/config.md", ".git/secret.md", ".jonis-ai/config.md", ".private/Hidden.md",
    "NUL.md", "Notes/CON.md", "Notes//Welcome.md", "Notes/Welcome.md:stream", "Notes/ignore.txt",
  ]) {
    assert.throws(() => normalizeNotePath(value), undefined, value);
  }
  assert.equal(normalizeNotePath("Notes\\Welcome.md"), "Notes/Welcome.md");
});

test("portable audit records tool activity without note content", async () => {
  const { vault, files } = makeVault();
  const tools = new PortableVaultTools(vault, { allowWrites: true });
  const secret = "do-not-copy-this-into-the-audit-log";
  await tools.execute("create_note", { path: "Private.md", content: secret });
  await tools.execute("unknown_tool", {});
  const raw = files.get(".jonis-ai/audit.jsonl");
  assert(!raw.includes(secret));
  assert.deepEqual(auditEntries(files).map((entry) => entry.status), ["started", "ok", "started", "error"]);
});

test("portable tools reject inherited handler names", async () => {
  const { vault, files } = makeVault();
  const tools = new PortableVaultTools(vault);
  for (const name of ["toString", "constructor", "__proto__"]) {
    assert.match(await tools.execute(name, {}), /Unknown tool/);
  }
  assert.deepEqual(auditEntries(files).map((entry) => entry.status), [
    "started", "error", "started", "error", "started", "error",
  ]);
});

test("audit failures do not break reads or turn completed writes into failures", async () => {
  const { vault, files } = makeVault({ "Note.md": "Readable evidence" });
  vault.adapter.write = async () => { throw new Error("audit unavailable"); };
  vault.adapter.append = async () => { throw new Error("audit unavailable"); };
  const tools = new PortableVaultTools(vault, { allowWrites: true });
  assert.match(await tools.execute("read_note", { path: "Note.md" }), /Readable evidence/);
  assert.equal(await tools.execute("create_note", { path: "New.md", content: "Created despite audit failure" }), "Created New.md.");
  assert.equal(files.get("New.md"), "Created despite audit failure");
});

test("oversized notes are rejected before reading and search respects its total budget", async () => {
  const initial = { "Large.md": "x".repeat(200_001) };
  for (let index = 0; index < 6; index += 1) initial[`Scan-${index}.md`] = "x".repeat(200_000);
  const { vault } = makeVault(initial);
  let reads = 0;
  vault.cachedRead = async (file) => {
    reads += 1;
    return initial[file.path];
  };
  const tools = new PortableVaultTools(vault);
  assert.match(await tools.execute("read_note", { path: "Large.md" }), /200,000-byte read limit/);
  assert.equal(reads, 0);
  assert.match(await tools.execute("search_notes", { query: "not-present" }), /Search stopped at the scan limit/);
  assert.equal(reads, 5);
});

test("portable tool cancellation interrupts an in-flight note read", async () => {
  const { vault } = makeVault({ "Note.md": "Evidence" });
  let release;
  let started;
  const reading = new Promise((resolve) => { started = resolve; });
  vault.cachedRead = async () => {
    started();
    return new Promise((resolve) => { release = resolve; });
  };
  const controller = new AbortController();
  const tools = new PortableVaultTools(vault, { signal: controller.signal });
  const pending = tools.execute("read_note", { path: "Note.md" });
  await reading;
  controller.abort();
  release("Evidence");
  await assert.rejects(pending, { name: "AbortError" });
});

test("OpenAI-compatible provider sends tool messages and normalises calls", async () => {
  const requests = [];
  const requestUrl = async (options) => {
    requests.push(options);
    return {
      status: 200,
      text: "",
      json: {
        choices: [{
          message: {
            content: "Done",
            tool_calls: [{ id: "remote-1", function: { name: "read_note", arguments: '{"path":"Note.md"}' } }],
          },
        }],
      },
    };
  };
  const provider = new PortableProvider({
    provider: "openai-compatible",
    model: "cloud-model",
    baseUrl: "https://example.com/v1/",
    apiKey: "test-key",
    requestUrl,
  });
  const result = await provider.complete([
    { role: "user", content: "Read" },
    { role: "assistant", content: "", tool_calls: [{ id: "call-1", name: "list_notes", arguments: {} }] },
    { role: "tool", id: "call-1", name: "list_notes", content: "Note.md" },
  ], []);
  assert.equal(requests[0].url, "https://example.com/v1/chat/completions");
  assert.equal(requests[0].headers.Authorization, "Bearer test-key");
  const payload = JSON.parse(requests[0].body);
  assert.equal(payload.messages[1].tool_calls[0].function.arguments, "{}");
  assert.equal(payload.messages[2].tool_call_id, "call-1");
  assert.deepEqual(result.tool_calls[0], { id: "remote-1", name: "read_note", arguments: { path: "Note.md" } });
});

test("Ollama provider uses the local chat endpoint and object arguments", async () => {
  const requests = [];
  const provider = new PortableProvider({
    provider: "ollama",
    model: "local-model",
    requestUrl: async (options) => {
      requests.push(options);
      return {
        status: 200,
        text: "",
        json: { message: { content: "Done", tool_calls: [{ function: { name: "list_notes", arguments: {} } }] } },
      };
    },
  });
  const result = await provider.complete([{ role: "user", content: "List" }], []);
  assert.equal(requests[0].url, "http://127.0.0.1:11434/api/chat");
  assert.equal(JSON.parse(requests[0].body).stream, false);
  assert.deepEqual(result.tool_calls[0], { id: "ollama-1", name: "list_notes", arguments: {} });
});

test("portable provider rejects insecure remote traffic and invalid responses", async () => {
  const requestUrl = async () => ({});
  assert.throws(() => new PortableProvider({
    provider: "openai-compatible",
    model: "cloud-model",
    baseUrl: "http://example.com/v1",
    apiKey: "secret",
    requestUrl,
  }), /HTTPS/);
  assert.throws(() => new PortableProvider({
    provider: "openai-compatible",
    model: "cloud-model",
    baseUrl: "http://example.com/v1",
    requestUrl,
  }), /HTTPS/);
  assert.throws(() => new PortableProvider({
    provider: "ollama",
    model: "local-model",
    baseUrl: "http://example.com:11434",
    allowLanHttp: true,
    requestUrl,
  }), /HTTPS/);
  assert.throws(() => new PortableProvider({
    provider: "ollama",
    model: "local-model",
    baseUrl: "http://192.168.1.10:11434",
    requestUrl,
  }), /explicitly allow private LAN HTTP/);
  assert.throws(() => new PortableProvider({
    provider: "openai-compatible",
    model: "cloud-model",
    baseUrl: "http://192.168.1.10:11434",
    allowLanHttp: true,
    requestUrl,
  }), /HTTPS/);

  const provider = new PortableProvider({
    provider: "openai-compatible",
    model: "cloud-model",
    requestUrl: async () => ({ status: 401, text: "Unauthorized", json: undefined }),
  });
  await assert.rejects(provider.complete([], []), /HTTP 401/);
});

test("Ollama permits private LAN HTTP only through the explicit option", async () => {
  const requests = [];
  const provider = new PortableProvider({
    provider: "ollama",
    model: "local-model",
    baseUrl: "http://192.168.1.10:11434",
    allowLanHttp: true,
    requestUrl: async (options) => {
      requests.push(options);
      return { status: 200, text: "", json: { message: { content: "LAN answer" } } };
    },
  });
  assert.equal((await provider.complete([{ role: "user", content: "Read" }], [])).content, "LAN answer");
  assert.equal(requests[0].url, "http://192.168.1.10:11434/api/chat");
});

test("portable provider honours cancellation and request timeouts", async () => {
  const controller = new AbortController();
  const cancelledProvider = new PortableProvider({
    provider: "ollama",
    model: "local-model",
    requestUrl: () => new Promise(() => {}),
  });
  const pending = cancelledProvider.complete([], [], { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });

  const timeoutProvider = new PortableProvider({
    provider: "ollama",
    model: "local-model",
    timeout: 5,
    requestUrl: () => new Promise(() => {}),
  });
  await assert.rejects(timeoutProvider.complete([], []), { name: "TimeoutError" });
});

test("portable agent feeds tool results back to the provider", async () => {
  const { vault } = makeVault({ "Note.md": "Vault evidence" });
  const requests = [];
  const provider = {
    complete: async (messages) => {
      requests.push(structuredClone(messages));
      if (requests.length === 1) {
        return {
          content: "",
          tool_calls: [{ id: "call-1", name: "read_note", arguments: { path: "Note.md" } }],
        };
      }
      return { content: "The note says: Vault evidence.", tool_calls: [] };
    },
  };
  const harness = new PortableAgentHarness(provider, new PortableVaultTools(vault), "balanced");
  const result = await harness.run("Read my note");
  assert.equal(result.answer, "The note says: Vault evidence.");
  assert.equal(result.steps, 2);
  assert.equal(requests[1].at(-1).role, "tool");
  assert.match(requests[1].at(-1).content, /Vault evidence/);
});

test("performance profiles use smaller models and fewer steps on lite", async () => {
  assert.deepEqual(PROFILES.lite, { model: "qwen2.5-coder:1.5b", maxSteps: 4 });
  let calls = 0;
  const provider = {
    complete: async () => {
      calls += 1;
      return { content: "", tool_calls: [{ id: `call-${calls}`, name: "list_notes", arguments: {} }] };
    },
  };
  const { vault } = makeVault();
  const harness = new PortableAgentHarness(provider, new PortableVaultTools(vault), "lite");
  const result = await harness.run("Keep working");
  assert.equal(calls, 4);
  assert.equal(result.hitStepLimit, true);
});
