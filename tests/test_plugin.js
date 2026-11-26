"use strict";

const assert = require("node:assert/strict");
const Module = require("node:module");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const notices = [];
const openedModals = [];
const execCalls = [];
let execHandler;
let execChild;
let requestHandler;
const platform = { isDesktop: true };

class Plugin {
  constructor() {
    this.commands = [];
    this.ribbons = [];
  }

  async loadData() {
    return null;
  }

  async saveData() {}

  addRibbonIcon(...args) {
    this.ribbons.push(args);
  }

  addCommand(command) {
    this.commands.push(command);
  }

  addSettingTab(tab) {
    this.settingTab = tab;
  }
}

class Modal {
  open() {
    openedModals.push(this);
  }
}

class PluginSettingTab {}
class Setting {}

class Notice {
  constructor(message) {
    notices.push(message);
  }
}

const obsidian = {
  Modal,
  Notice,
  Platform: platform,
  Plugin,
  PluginSettingTab,
  Setting,
  requestUrl: (options) => requestHandler(options),
};
const childProcess = {
  execFile(file, args, options, callback) {
    execCalls.push({ file, args, options });
    execChild = { killed: false, kill() { this.killed = true; } };
    execHandler(callback);
    return execChild;
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "obsidian") return obsidian;
  if (request === "child_process") return childProcess;
  return originalLoad.call(this, request, parent, isMain);
};

const JonisAiPlugin = require("../obsidian-plugin/main.js");
test.after(() => {
  Module._load = originalLoad;
});

function makePlugin(runtime) {
  const files = new Map();
  const folders = new Set();
  if (runtime !== undefined) {
    files.set(".jonis-ai/runtime.json", typeof runtime === "string" ? runtime : JSON.stringify(runtime));
  }
  const vaultPath = path.resolve("test-vault");
  const plugin = new JonisAiPlugin();
  plugin.app = {
    vault: {
      getAbstractFileByPath: (value) => {
        if (files.has(value)) return { path: value, extension: value.split(".").pop() };
        return folders.has(value) ? { path: value } : null;
      },
      getMarkdownFiles: () => [...files.keys()]
        .filter((value) => value.endsWith(".md"))
        .map((value) => ({ path: value, extension: "md", stat: { size: Buffer.byteLength(files.get(value)) } })),
      cachedRead: async (file) => files.get(file.path),
      createFolder: async (value) => { folders.add(value); },
      create: async (value, content) => {
        if (files.has(value)) throw new Error("File already exists");
        files.set(value, content);
        return { path: value, extension: "md" };
      },
      append: async (file, content) => { files.set(file.path, files.get(file.path) + content); },
      adapter: {
        exists: async (value) => files.has(value),
        append: async (value, content) => { files.set(value, files.get(value) + content); },
        write: async (value, content) => { files.set(value, content); },
        read: async (value) => {
          if (!files.has(value)) throw new Error("missing");
          return files.get(value);
        },
        getBasePath: () => vaultPath,
      },
    },
  };
  plugin.settings = {
    inboxPath: "JONIS.AI/Inbox.md",
    harnessProfile: "",
    harnessProvider: "",
    harnessModel: "",
    harnessBaseUrl: "",
    harnessApiKey: "",
    harnessAllowLanHttp: false,
  };
  execCalls.length = 0;
  notices.length = 0;
  openedModals.length = 0;
  execHandler = (callback) => callback(null, "Local answer\n", "");
  requestHandler = async () => ({
    status: 200,
    text: "",
    json: { message: { content: "Portable answer" } },
  });
  return { plugin, files, folders, vaultPath };
}

function validRuntime() {
  return {
    install_root: path.resolve(os.homedir(), "JONIS.AI"),
    python: path.resolve("Python313", "python.exe"),
    python_args: [],
  };
}

test("capture still creates and appends local notes", async () => {
  const { plugin, files, folders } = makePlugin();
  await plugin.capture("First local note");
  await plugin.capture("Second local note");
  const inbox = files.get("JONIS.AI/Inbox.md");
  assert(folders.has("JONIS.AI"));
  assert(inbox.startsWith("# JONIS.AI Inbox"));
  assert(inbox.includes("First local note"));
  assert(inbox.includes("Second local note"));
  assert.equal(notices.at(-1), "Saved to your JONIS.AI Inbox.");
});

test("capture supports nested inboxes and rejects paths outside the vault", async () => {
  const { plugin, files, folders } = makePlugin();
  plugin.settings.inboxPath = "Projects/Research/Inbox.md";
  await plugin.capture("Nested note");
  assert(folders.has("Projects"));
  assert(folders.has("Projects/Research"));
  assert(files.get("Projects/Research/Inbox.md").includes("Nested note"));

  for (const inboxPath of [
    "../outside.md", "/tmp/outside.md", "C:\\temp\\outside.md", ".obsidian/Inbox.md",
    ".private/Inbox.md", "NUL.md", "Notes//Inbox.md", "Notes/Inbox.txt",
  ]) {
    plugin.settings.inboxPath = inboxPath;
    await plugin.capture("Unsafe note");
    assert.match(notices.at(-1), /Could not save the note/);
    assert.equal(files.has(inboxPath), false);
  }
});

test("capture uses Vault APIs instead of bypassing its cache", async () => {
  const { plugin, files } = makePlugin();
  plugin.app.vault.adapter.append = async () => { throw new Error("adapter append must not be used"); };
  plugin.app.vault.adapter.write = async () => { throw new Error("adapter write must not be used"); };
  await plugin.capture("Vault-managed capture");
  assert.match(files.get("JONIS.AI/Inbox.md"), /Vault-managed capture/);
  assert.equal(notices.at(-1), "Saved to your JONIS.AI Inbox.");
});

test("plugin registers capture and Agent Harness commands", async () => {
  const { plugin } = makePlugin();
  await plugin.onload();
  assert(plugin.commands.some((command) => command.id === "capture-note"));
  assert(plugin.commands.some((command) => command.id === "capture-selection"));
  assert(plugin.commands.some((command) => command.id === "ask-agent-harness"));
  assert.equal(plugin.ribbons.length, 2);
});

test("Agent Harness executes Python directly without a shell", async () => {
  const { plugin, vaultPath } = makePlugin(validRuntime());
  const answer = await plugin.runHarness("Read my notes", false);
  assert.equal(answer, "Local answer");
  assert.equal(execCalls.length, 1);
  const call = execCalls[0];
  assert.equal(call.file, validRuntime().python);
  assert.equal(call.options.cwd, validRuntime().install_root);
  assert.equal(call.options.windowsHide, true);
  assert.equal(call.options.shell, undefined);
  assert.deepEqual(call.args, ["-m", "harness", "--vault", vaultPath, "Read my notes"]);
});

test("Agent Harness adds write permission only when explicitly enabled", async () => {
  const { plugin, vaultPath } = makePlugin({ ...validRuntime(), python_args: ["-3"] });
  await plugin.runHarness("Save a summary", true);
  assert.deepEqual(execCalls[0].args, [
    "-3", "-m", "harness", "--vault", vaultPath, "--allow-writes", "Save a summary",
  ]);
});

test("Agent Harness accepts runtime JSON with a BOM", async () => {
  const { plugin } = makePlugin(`\ufeff${JSON.stringify(validRuntime())}`);
  assert.equal(await plugin.runHarness("Read", false), "Local answer");
});

test("Agent Harness reports provider failures", async () => {
  const { plugin } = makePlugin(validRuntime());
  execHandler = (callback) => callback(Object.assign(new Error("failed"), { code: 1 }), "", "Provider offline\n");
  await assert.rejects(plugin.runHarness("Read", false), /Provider offline/);
});

test("Agent Harness falls back to the portable runtime without Python", async () => {
  assert.equal(await makePlugin().plugin.runHarness("Read", false), "Portable answer");
  assert.equal(await makePlugin({ ...validRuntime(), python: "" }).plugin.runHarness("Read", false), "Portable answer");
  assert.equal(execCalls.length, 0);
});

test("Agent Harness rejects invalid runtime configuration", async () => {
  await assert.rejects(
    makePlugin({ ...validRuntime(), install_root: path.resolve("elsewhere") }).plugin.runHarness("Read", false),
    /runtime path is invalid/,
  );
  await assert.rejects(
    makePlugin({ ...validRuntime(), python: "python" }).plugin.runHarness("Read", false),
    /Python path is invalid/,
  );
  await assert.rejects(
    makePlugin({ ...validRuntime(), python_args: ["-c", "code"] }).plugin.runHarness("Read", false),
    /Python configuration is invalid/,
  );
});

test("Agent Harness validates prompts and runs on mobile", async () => {
  const { plugin } = makePlugin(validRuntime());
  await assert.rejects(plugin.runHarness(" ", false), /Enter a task/);
  await assert.rejects(plugin.runHarness("x".repeat(10_001), false), /Enter a task/);
  platform.isDesktop = false;
  try {
    assert.equal(await plugin.runHarness("Read", false), "Portable answer");
    plugin.openHarness();
    assert.equal(openedModals.length, 1);
    assert.equal(execCalls.length, 0);
  } finally {
    platform.isDesktop = true;
  }
});

test("mobile Agent Harness runs a portable tool loop and audits it", async () => {
  const { plugin, files } = makePlugin();
  files.set("Note.md", "Mobile vault evidence");
  const requests = [];
  requestHandler = async (options) => {
    requests.push(JSON.parse(options.body));
    if (requests.length === 1) {
      return {
        status: 200,
        text: "",
        json: {
          message: {
            content: "",
            tool_calls: [{ function: { name: "read_note", arguments: { path: "Note.md" } } }],
          },
        },
      };
    }
    return { status: 200, text: "", json: { message: { content: "Found mobile evidence." } } };
  };
  platform.isDesktop = false;
  try {
    assert.equal(await plugin.runHarness("Read my note", false), "Found mobile evidence.");
  } finally {
    platform.isDesktop = true;
  }
  assert.equal(requests.length, 2);
  assert.match(requests[1].messages.at(-1).content, /Mobile vault evidence/);
  assert.match(files.get(".jonis-ai/audit.jsonl"), /"tool":"read_note"/);
});

test("portable provider settings override vault config", async () => {
  const { plugin, files } = makePlugin();
  files.set(".jonis-ai/config.json", JSON.stringify({
    provider: "ollama",
    profile: "full",
    model: "qwen2.5-coder:7b",
  }));
  plugin.settings.harnessProvider = "openai-compatible";
  plugin.settings.harnessProfile = "lite";
  plugin.settings.harnessModel = "mobile-model";
  plugin.settings.harnessBaseUrl = "https://example.com/v1";
  plugin.settings.harnessApiKey = "test-key";
  let request;
  requestHandler = async (options) => {
    request = options;
    return { status: 200, text: "", json: { choices: [{ message: { content: "Remote answer" } }] } };
  };
  assert.equal(await plugin.runPortableHarness("Read", false), "Remote answer");
  assert.equal(request.url, "https://example.com/v1/chat/completions");
  assert.equal(request.headers.Authorization, "Bearer test-key");
  assert.equal(JSON.parse(request.body).model, "mobile-model");
});

test("portable config falls back to the stored performance profile", async () => {
  const { plugin, files } = makePlugin();
  files.set(".jonis-ai/config.json", JSON.stringify({ provider: "ollama", profile: "lite" }));
  let payload;
  requestHandler = async (options) => {
    payload = JSON.parse(options.body);
    return { status: 200, text: "", json: { message: { content: "Lite answer" } } };
  };
  assert.equal(await plugin.runPortableHarness("Read", false), "Lite answer");
  assert.equal(payload.model, "qwen2.5-coder:1.5b");
});

test("OpenAI-compatible providers require an explicit model", async () => {
  const { plugin } = makePlugin();
  plugin.settings.harnessProvider = "openai-compatible";
  plugin.settings.harnessProfile = "full";
  plugin.settings.harnessBaseUrl = "https://example.com/v1";
  await assert.rejects(plugin.runPortableHarness("Read", false), /Enter the model name/);
});

test("private LAN HTTP is forwarded only when explicitly enabled for Ollama", async () => {
  const { plugin } = makePlugin();
  plugin.settings.harnessBaseUrl = "http://192.168.1.10:11434";
  await assert.rejects(plugin.runPortableHarness("Read", false), /explicitly allow private LAN HTTP/);
  plugin.settings.harnessAllowLanHttp = true;
  let request;
  requestHandler = async (options) => {
    request = options;
    return { status: 200, text: "", json: { message: { content: "LAN answer" } } };
  };
  assert.equal(await plugin.runPortableHarness("Read", false), "LAN answer");
  assert.equal(request.url, "http://192.168.1.10:11434/api/chat");
});

test("missing Python executable falls back to the portable runtime", async () => {
  const { plugin } = makePlugin(validRuntime());
  execHandler = (callback) => callback(Object.assign(new Error("missing"), { code: "ENOENT" }), "", "");
  assert.equal(await plugin.runHarness("Read", false), "Portable answer");
  assert.equal(execCalls.length, 1);
});

test("cancelling stops the Python process and rejects the run", async () => {
  const { plugin } = makePlugin(validRuntime());
  let callback;
  execHandler = (value) => { callback = value; };
  const controller = new AbortController();
  const pending = plugin.runHarness("Read", false, controller.signal);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(execCalls.length, 1);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(execChild.killed, true);
  callback(null, "late answer", "");
});

test("cancelling stops a pending portable provider request", async () => {
  const { plugin } = makePlugin();
  let started;
  const requestStarted = new Promise((resolve) => { started = resolve; });
  requestHandler = () => {
    started();
    return new Promise(() => {});
  };
  const controller = new AbortController();
  const pending = plugin.runPortableHarness("Read", false, controller.signal);
  await requestStarted;
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});
