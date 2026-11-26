"use strict";

const { Modal, Notice, Platform, Plugin, PluginSettingTab, Setting, requestUrl } = require("obsidian");
const {
  MAX_PROMPT,
  PROFILES,
  PortableAgentHarness,
  PortableProvider,
  PortableVaultTools,
  normalizeNotePath,
} = require("./harness");

const HARNESS_RUNTIME_PATH = ".jonis-ai/runtime.json";
const HARNESS_CONFIG_PATH = ".jonis-ai/config.json";
const MAX_HARNESS_PROMPT = MAX_PROMPT;

function createAbortError() {
  const error = new Error("Agent Harness cancelled.");
  error.name = "AbortError";
  return error;
}

class CaptureModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Capture in JONIS.AI" });
    contentEl.createEl("p", { text: "Save a note, link or idea to your local inbox." });

    const input = contentEl.createEl("textarea", {
      attr: {
        class: "jonis-ai-capture",
        placeholder: "What should JONIS.AI remember?",
        "aria-label": "Note to capture",
      },
    });
    input.rows = 8;

    const actions = contentEl.createDiv({ cls: "modal-button-row" });
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => this.close());

    const save = actions.createEl("button", { cls: "mod-cta", text: "Save to Inbox" });
    save.addEventListener("click", async () => {
      const value = input.value.trim();
      if (!value) {
        new Notice("Write something before saving.");
        return;
      }
      await this.onSubmit(value);
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class HarnessModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Ask JONIS.AI" });
    contentEl.createEl("p", { text: "Read, search and organise Markdown notes on this device or through your configured provider." });

    const input = contentEl.createEl("textarea", {
      attr: {
        class: "jonis-ai-capture jonis-ai-harness-prompt",
        placeholder: "What should JONIS.AI do with your notes?",
        "aria-label": "Task for the Agent Harness",
      },
    });
    input.rows = 6;

    const permissionLabel = contentEl.createEl("label", { cls: "jonis-ai-permission" });
    const permission = permissionLabel.createEl("input", { attr: { type: "checkbox" } });
    permissionLabel.createSpan({ text: " Allow note writes for this run" });

    const status = contentEl.createEl("p", {
      text: "Writes are disabled unless you explicitly allow them above.",
      attr: { class: "jonis-ai-harness-status", role: "status", "aria-live": "polite" },
    });
    const output = contentEl.createEl("pre", {
      attr: { class: "jonis-ai-harness-output", "aria-label": "Agent Harness response" },
    });
    output.hidden = true;

    const actions = contentEl.createDiv({ cls: "modal-button-row" });
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => {
      if (this.activeAbort) this.activeAbort.abort();
      this.close();
    });

    const run = actions.createEl("button", { cls: "mod-cta", text: "Run" });
    run.addEventListener("click", async () => {
      const prompt = input.value.trim();
      if (!prompt) {
        status.setText("Write a task before running the Agent Harness.");
        return;
      }
      if (prompt.length > MAX_HARNESS_PROMPT) {
        status.setText("Keep the task under 10,000 characters.");
        return;
      }

      const controller = new AbortController();
      this.activeAbort = controller;
      run.disabled = true;
      input.disabled = true;
      permission.disabled = true;
      output.hidden = true;
      status.setText("Running through the configured model provider…");
      try {
        const answer = await this.onSubmit(prompt, permission.checked, controller.signal);
        output.setText(answer);
        output.hidden = false;
        status.setText("Finished. Tool activity is recorded in .jonis-ai/audit.jsonl.");
      } catch (error) {
        status.setText(error.message);
        if (error.name !== "AbortError") new Notice("The Agent Harness could not complete this task.");
      } finally {
        if (this.activeAbort === controller) this.activeAbort = null;
        run.disabled = false;
        input.disabled = false;
        permission.disabled = false;
      }
    });
  }

  onClose() {
    if (this.activeAbort) this.activeAbort.abort();
    this.activeAbort = null;
    this.contentEl.empty();
  }
}

class JonisAiSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Inbox file")
      .setDesc("Markdown path inside this vault, such as JONIS.AI/Inbox.md.")
      .addText((text) => {
        text
          .setPlaceholder("JONIS.AI/Inbox.md")
          .setValue(this.plugin.settings.inboxPath)
          .onChange(async (value) => {
            this.plugin.settings.inboxPath = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("Agent Harness")
      .setDesc("Python on desktop when configured; portable JavaScript on mobile, tablet and as a desktop fallback.")
      .addButton((button) => {
        button.setButtonText("Open Agent Harness").onClick(() => this.plugin.openHarness());
      });
    new Setting(containerEl)
      .setName("Performance profile")
      .setDesc("Lite: 1.5B/4 steps. Balanced: 3B/6 steps. Full: 7B/8 steps for notebook/PC.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("lite", "Lite — PC fraco")
          .addOption("balanced", "Balanced — tablet/celular")
          .addOption("full", "Full — notebook/PC")
          .setValue(this.plugin.settings.harnessProfile || "balanced")
          .onChange(async (value) => {
            this.plugin.settings.harnessProfile = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("Model provider")
      .setDesc("Ollama can run locally or on another computer in your network. Cloud endpoints require HTTPS.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("ollama", "Ollama")
          .addOption("openai-compatible", "OpenAI-compatible")
          .setValue(this.plugin.settings.harnessProvider || "ollama")
          .onChange(async (value) => {
            this.plugin.settings.harnessProvider = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("Model")
      .setDesc(`Default for the selected profile: ${PROFILES[this.plugin.settings.harnessProfile || "balanced"].model}.`)
      .addText((text) => {
        text
          .setPlaceholder(PROFILES[this.plugin.settings.harnessProfile || "balanced"].model)
          .setValue(this.plugin.settings.harnessModel || "")
          .onChange(async (value) => {
            this.plugin.settings.harnessModel = value.trim();
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("Provider base URL")
      .setDesc("Examples: http://127.0.0.1:11434 or https://api.openai.com/v1. Remote providers require HTTPS.")
      .addText((text) => {
        text
          .setPlaceholder("http://127.0.0.1:11434")
          .setValue(this.plugin.settings.harnessBaseUrl || "")
          .onChange(async (value) => {
            this.plugin.settings.harnessBaseUrl = value.trim();
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("Allow private LAN HTTP for Ollama")
      .setDesc("Off by default. Sends prompts over unencrypted HTTP only to a private IP address; never use this with an API key.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.harnessAllowLanHttp === true)
          .onChange(async (value) => {
            this.plugin.settings.harnessAllowLanHttp = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });
    new Setting(containerEl)
      .setName("API key")
      .setDesc("Optional. Stored only in this vault's local plugin data; never written to the audit log.")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("Only for OpenAI-compatible providers")
          .setValue(this.plugin.settings.harnessApiKey || "")
          .onChange(async (value) => {
            this.plugin.settings.harnessApiKey = value.trim();
            await this.plugin.saveData(this.plugin.settings);
          });
      });
  }
}

module.exports = class JonisAiPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign(
      {
        inboxPath: "JONIS.AI/Inbox.md",
        harnessProfile: "",
        harnessProvider: "",
        harnessModel: "",
        harnessBaseUrl: "",
        harnessApiKey: "",
        harnessAllowLanHttp: false,
      },
      await this.loadData(),
    );

    this.addRibbonIcon("inbox", "JONIS.AI — Capture note", () => this.openCapture());
    this.addRibbonIcon("sparkles", "JONIS.AI — Ask Agent Harness", () => this.openHarness());
    this.addCommand({
      id: "ask-agent-harness",
      name: "Ask Agent Harness",
      callback: () => this.openHarness(),
    });
    this.addCommand({
      id: "capture-note",
      name: "Capture note",
      callback: () => this.openCapture(),
    });
    this.addCommand({
      id: "capture-selection",
      name: "Capture selection",
      editorCallback: async (editor) => {
        const selection = editor.getSelection().trim();
        if (!selection) {
          new Notice("Select some text first.");
          return;
        }
        await this.capture(selection);
      },
    });
    this.addSettingTab(new JonisAiSettingTab(this.app, this));
  }

  openCapture() {
    new CaptureModal(this.app, (value) => this.capture(value)).open();
  }

  openHarness() {
    new HarnessModal(this.app, (prompt, allowWrites, signal) => this.runHarness(prompt, allowWrites, signal)).open();
  }

  async runHarness(prompt, allowWrites, signal) {
    if (signal && signal.aborted) throw createAbortError();
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_HARNESS_PROMPT) {
      throw new Error("Enter a task under 10,000 characters.");
    }
    if (!Platform.isDesktop) return this.runPortableHarness(prompt, allowWrites, signal);

    let raw;
    try {
      raw = await this.app.vault.adapter.read(HARNESS_RUNTIME_PATH);
    } catch {
      return this.runPortableHarness(prompt, allowWrites, signal);
    }

    let runtime;
    try {
      runtime = JSON.parse(raw.replace(/^\uFEFF/, ""));
    } catch {
      throw new Error("Agent Harness runtime configuration is invalid. Rerun the JONIS.AI installer.");
    }
    if (!runtime || typeof runtime.install_root !== "string") {
      throw new Error("Agent Harness runtime configuration is invalid. Rerun the JONIS.AI installer.");
    }
    if (!runtime.python) return this.runPortableHarness(prompt, allowWrites, signal);
    if (typeof runtime.python !== "string") {
      throw new Error("Python 3.10+ is not configured. Install Python and rerun the JONIS.AI installer.");
    }

    const { execFile } = require("child_process");
    const os = require("os");
    const path = require("path");
    if (!path.isAbsolute(runtime.python)) {
      throw new Error("The Agent Harness Python path is invalid. Rerun the JONIS.AI installer.");
    }

    const installRoot = path.resolve(runtime.install_root);
    const expectedRoot = path.resolve(os.homedir(), "JONIS.AI");
    const normalizedRoot = process.platform === "win32" ? installRoot.toLowerCase() : installRoot;
    const normalizedExpected = process.platform === "win32" ? expectedRoot.toLowerCase() : expectedRoot;
    if (normalizedRoot !== normalizedExpected) {
      throw new Error("The Agent Harness runtime path is invalid. Rerun the JONIS.AI installer.");
    }
    if (
      !Array.isArray(runtime.python_args)
      || runtime.python_args.length > 1
      || runtime.python_args.some((argument) => argument !== "-3")
    ) {
      throw new Error("The Agent Harness Python configuration is invalid. Rerun the JONIS.AI installer.");
    }

    const vaultPath = this.app.vault.adapter.getBasePath();
    const args = [...runtime.python_args, "-m", "harness", "--vault", vaultPath];
    if (allowWrites) args.push("--allow-writes");
    args.push(prompt.trim());

    const answer = await new Promise((resolve, reject) => {
      let child;
      let settled = false;
      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        if (signal) signal.removeEventListener("abort", onAbort);
        callback(value);
      };
      const onAbort = () => {
        if (child && typeof child.kill === "function") child.kill();
        settle(reject, createAbortError());
      };
      if (signal && signal.aborted) {
        onAbort();
        return;
      }
      if (signal) signal.addEventListener("abort", onAbort, { once: true });
      try {
        child = execFile(
          runtime.python,
          args,
          { cwd: installRoot, timeout: 300_000, maxBuffer: 1_048_576, windowsHide: true },
          (error, stdout, stderr) => {
            if (error) {
              if (error.code === "ENOENT") {
                settle(resolve, null);
                return;
              }
              const detail = (stderr || "").trim();
              const code = typeof error.code === "number" ? `exit code ${error.code}` : error.code;
              settle(reject, new Error(detail || `Agent Harness failed (${code || "unknown error"}).`));
              return;
            }
            settle(resolve, stdout.trim() || "The model returned no text.");
          },
        );
      } catch (error) {
        settle(reject, error);
      }
    });
    if (answer === null) return this.runPortableHarness(prompt, allowWrites, signal);
    return answer;
  }

  async portableConfig() {
    let stored = {};
    try {
      const raw = await this.app.vault.adapter.read(HARNESS_CONFIG_PATH);
      stored = JSON.parse(raw.replace(/^\uFEFF/, ""));
      if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
        throw new Error("Configuration must be an object.");
      }
    } catch (error) {
      if (/JSON|Unexpected|Configuration/.test(error.message)) {
        throw new Error("Agent Harness configuration is invalid. Check .jonis-ai/config.json.");
      }
    }

    const profile = this.settings.harnessProfile || stored.profile || "balanced";
    if (!PROFILES[profile]) throw new Error("Choose a valid performance profile in JONIS.AI settings.");
    const provider = this.settings.harnessProvider || stored.provider || "ollama";
    if (!["ollama", "openai-compatible"].includes(provider)) {
      throw new Error("Choose Ollama or an OpenAI-compatible provider in JONIS.AI settings.");
    }
    const configuredModel = this.settings.harnessModel || stored.model || "";
    if (provider === "openai-compatible" && !configuredModel) {
      throw new Error("Enter the model name required by your OpenAI-compatible provider.");
    }
    return {
      profile,
      provider,
      model: configuredModel || PROFILES[profile].model,
      baseUrl: this.settings.harnessBaseUrl || stored.base_url || "",
      apiKey: this.settings.harnessApiKey || stored.api_key || "",
      allowLanHttp: this.settings.harnessAllowLanHttp === true,
    };
  }

  async runPortableHarness(prompt, allowWrites, signal) {
    if (signal && signal.aborted) throw createAbortError();
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_HARNESS_PROMPT) {
      throw new Error("Enter a task under 10,000 characters.");
    }
    const config = await this.portableConfig();
    const provider = new PortableProvider({ ...config, requestUrl });
    const tools = new PortableVaultTools(this.app.vault, { allowWrites, signal });
    const harness = new PortableAgentHarness(provider, tools, config.profile);
    const result = await harness.run(prompt, { signal });
    if (result.hitStepLimit) {
      return `${result.answer}\n\nJONIS.AI: step limit reached; the task may be incomplete.`;
    }
    return result.answer;
  }

  async ensureFolder(folderPath) {
    let currentPath = "";
    for (const part of folderPath.split("/")) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(currentPath)) {
        await this.app.vault.createFolder(currentPath);
      }
    }
  }

  async capture(value) {
    try {
      const inboxPath = normalizeNotePath(this.settings.inboxPath);
      const folderPath = inboxPath.split("/").slice(0, -1).join("/");
      if (folderPath) await this.ensureFolder(folderPath);

      const timestamp = new Date().toLocaleString();
      const entry = `\n## ${timestamp}\n\n${value}\n`;
      const file = this.app.vault.getAbstractFileByPath(inboxPath);
      if (file && file.extension === "md") {
        await this.app.vault.append(file, entry);
      } else if (file) {
        throw new Error("The inbox path is already a folder.");
      } else {
        await this.app.vault.create(inboxPath, `# JONIS.AI Inbox\n${entry}`);
      }
      new Notice("Saved to your JONIS.AI Inbox.");
    } catch (error) {
      new Notice(`Could not save the note: ${error.message}`);
    }
  }
};
