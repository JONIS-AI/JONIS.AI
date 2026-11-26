<p align="center">
  <a href="README.en-GB.md" title="英语（英国）"><img src="./assets/flags/gb-eng.svg" width="28" alt="英语（英国）" /></a>
  ·
  <a href="README.md" title="英语（美国）"><img src="./assets/flags/us.svg" width="28" alt="英语（美国）" /></a>
  ·
  <a href="README.pt-BR.md" title="葡萄牙语"><img src="./assets/flags/br.svg" width="28" alt="葡萄牙语" /></a>
  ·
  <a href="README.ru.md" title="俄语"><img src="./assets/flags/ru.svg" width="28" alt="俄语" /></a>
  ·
  <a href="README.zh-CN.md" title="中文"><img src="./assets/flags/cn.svg" width="32" alt="中文" /></a>
  ·
  <a href="README.ar.md" title="阿拉伯语"><img src="./assets/flags/sa.svg" width="28" alt="阿拉伯语" /></a>
</p>

<div align="center">

<img src="./assets/hero.svg" alt="JONIS.AI — 自主运行、模型无关的开源数字管家" width="100%" />

# JONIS.AI
### 你的数字管家，全面进化。
**自主运行。模型无关。开源。本地运行免费。**

开源自主数字管家——升级版 JARVIS——可在你的系统中执行真实任务，并提供可选的 3D/HUD 形象和双向语音。通过 Ollama 免费运行本地模型，或使用你自己的 Claude、Gemini 和 OpenAI/Codex API 密钥。

<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT 许可证" /></a>
<a href="https://github.com/JONIS-AI/JONIS.AI/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="欢迎提交拉取请求" /></a>
<a href="#本地与云端-api"><img src="https://img.shields.io/badge/Mode-Local%20%26%20Cloud%20BYOK-blueviolet" alt="本地和云端 BYOK 模式" /></a>
<a href="#模型引擎"><img src="https://img.shields.io/badge/LLMs-Ollama%20%7C%20Claude%20%7C%20Gemini%20%7C%20OpenAI-blue" alt="Ollama、Claude、Gemini 和 OpenAI 模型引擎" /></a>

<br/>

<a href="https://github.com/JONIS-AI"><img src="https://img.shields.io/badge/ORG-JONIS--AI-0b1020?style=flat-square&logo=github&logoColor=22d3ee" alt="JONIS.AI 组织" /></a>
<img src="https://img.shields.io/badge/STATUS-BUILDING-0b1020?style=flat-square&logo=statuspage&logoColor=8b5cf6" alt="状态：构建中" />
<img src="https://komarev.com/ghpvc/?username=jonypeixoto&style=flat-square&color=22d3ee&label=VIEWS" alt="主页访问量" />

<br/><br/>

<a href="#为服务与行动而生的数字管家">关于</a> · <a href="#本地与云端-api">本地与云端</a> · <a href="#演示与体验">演示</a> · <a href="#jonis-能为你做什么">功能</a> · <a href="#-管家模块与能力">模块</a> · <a href="#obsidian-第二大脑">Obsidian</a> · <a href="#模型引擎">模型引擎</a> · <a href="#-快速开始">快速开始</a> · <a href="#-路线图">路线图</a> · <a href="#-常见问题">常见问题</a>

</div>

---

## 为服务与行动而生的数字管家

大多数 AI 工具都在等待你的下一条提示词。**JONIS.AI** 正在被打造成一个拥有形象、语音和受限自主能力的数字管家：它读取你的上下文，在你制定的规则范围内主动行动，根据任务切换“大脑”，并在你的环境中执行具体操作。

- **免费且开源：** 软件采用 MIT 许可证，无订阅费，也不会被服务商绑定。本地模式没有 API 费用。
- **数秒内切换 LLM：** 通过 **Ollama** 从免费的本地模型开始，或使用你自己的密钥连接 **Claude、Gemini、OpenAI/Codex、OpenRouter** 以及兼容的引擎。
- **语音与视觉形象：** 以文本交互为设计基础，并提供双向语音；可选的 3D 虚拟形象/HUD 已纳入路线图。
- **边界由你设定：** 白名单、敏感操作确认和本地审计记录是核心设计原则。

> 你的知识库。你的规则。智能由你选择。

**项目状态：** 产品仍在开发中。本仓库目前包含产品愿景、架构、视觉形象和路线图；下文所述的可执行功能描述的是目标产品。

---

## 本地与云端 API

根据你的硬件条件、预算和隐私需求，选择管家的运行方式。

| 标准 | 本地模式 | 云端 / BYOK 模式 |
| :--- | :--- | :--- |
| **成本** | **API 费用为 €0 / R$0** — 仅需承担硬件和电费 | 服务商定价或免费额度；密钥由你自带 |
| **隐私** | **最高** — 数据在你的设备上处理 | 选定的上下文会发送至你选择的 LLM 服务商 |
| **要求** | 具备一定性能的 CPU/GPU，并安装 [Ollama](https://ollama.com/) | 网络连接和有效的 API 密钥 |
| **示例模型** | `qwen2.5-coder`、`llama`、`deepseek` | Claude、Gemini、OpenAI/Codex、OpenRouter |
| **适用场景** | 持续使用、离线工作和敏感数据 | 复杂推理、长上下文和工作负载高峰 |

云端免费额度和配额可能发生变化，API 调用也可能产生费用。使用规划中的本地模式无需任何付费服务商。

---

## 演示与体验

<div align="center">
  <img src="./assets/jonis-core.gif" alt="动态 JONIS.AI 核心：装甲角色双眼发出蓝光，胸口有青蓝色反应堆" width="320" />
  <br/>
  <sub>JONIS.AI — 视觉核心</sub>
</div>

<br/>

<div align="center">
  <img src="./assets/terminal.svg" alt="JONIS.AI 终端，展示身份、模型引擎和使命" width="100%" />
</div>

以下流程展示的是目标产品的端到端工作方式。

```text
[JONIS.AI — 目标工作流]
> "切换到免费的本地模型，整理 /finance 中的报告并生成摘要。"

[引擎：ollama/qwen2.5-coder:7b | 语音：就绪 | 策略：写入前确认]
> 已分类 14 份报告
> 摘要已保存至 /finance/monthly-summary.md
```

---

## JONIS 能为你做什么

<details>
<summary><strong>01 · 上下文与主动性</strong> — 理解知识库，并建议接下来最有用的操作</summary>

<br/>

将正在处理的笔记、任务和近期活动整合为工作上下文。它可以建议下一步、起草计划，并在请求含糊时先询问，再采取行动。

`上下文` `规划` `主动提示` `人工审核`

</details>

<details>
<summary><strong>02 · 有防护机制的真实执行</strong> — 将意图转化为具体的系统操作</summary>

<br/>

旨在整理文件、创建结构化笔记、运行经批准的工作流并调用已授权的工具。敏感操作必须获得明确批准，每项操作都会记录在本地。

`工具调用` `白名单` `审批` `审计日志`

</details>

<details>
<summary><strong>03 · 模型路由</strong> — 无需绑定服务商，即可使用合适的引擎</summary>

<br/>

采用独立于服务商的路由器，根据任务、成本、隐私和可用性，在本地与云端引擎之间进行选择。付费云端访问始终由你主动开启；路由器不得擅自将知识库数据发送到云端 API。

`Ollama` `BYOK` `回退` `成本控制`

</details>

<details>
<summary><strong>04 · 语音与视觉形象</strong> — 交互不再局限于纯文本</summary>

<br/>

以终端为核心的设计让基础功能易于使用，双向语音和可选的全息 3D/HUD 虚拟形象则进一步带来沉浸感。

`双向语音` `3D 虚拟形象` `HUD` `无障碍`

</details>

---

## 🧩 管家模块与能力

规划中的模块化核心整合了六个实用层：

- **💻 执行与编程：** 创建结构、运行命令、调试错误、读取日志，并协助开发工作流。
- **🎙️ 双向语音：** 自然地与管家交谈，并以音频或文本接收回复。
- **🌐 全息 3D 面孔 / HUD 界面：** 可选的视觉层，为管家赋予身份并提供实时状态反馈。
- **📂 文件与数据管理：** 读取文档、整理文件夹、提取信息，并准备结构化的交付成果。
- **🔎 研究与综合：** 交叉核对信息，快速总结重点。
- **🔌 可扩展架构：** 根据您的工作流添加新的技能、工具和连接器。

---

## Obsidian 第二大脑

该插件面向桌面、平板和手机，可搭配 Obsidian 的**免费方案**使用，无需 Obsidian Sync 或 Obsidian Publish。

- **Markdown 是唯一事实来源：** 你的笔记始终可读、可迁移，并由你掌控。
- **本地优先检索：** SQLite/FTS 和可选的本地嵌入功能为搜索和带引用的回答提供支持。
- **实用的工作流：** 捕获、分类、关联、检索、执行和审阅。
- **可选的存储与连接器：** 9Drive、Notion 和 Miro 可扩展系统能力，但不会成为必需依赖。

```text
捕获 -> 分类 -> 关联 -> 检索 -> 执行 -> 审阅
  |      |       |       |       |      |
知识库  本地    Wiki    本地索引 工具   审计
笔记    规则    链接             记录
```

| 集成 | 规划中的角色 | 是否必需？ |
| :--- | :--- | :--- |
| **Obsidian** | 知识库、笔记、任务和插件界面 | 是 |
| **[9Drive](https://github.com/zenhosta/9drive)** | 通过存储服务商接口管理附件、导出和备份路由 | 否 |
| **Notion** | 可选的页面和数据库导入/同步连接器 | 否 |
| **Miro** | 可选的看板导入连接器 | 否 |

本地存储仍是默认选择。即使禁用所有可选连接器，第二大脑也必须保持可用。

---

## 模型引擎

Agent Harness 目前支持在桌面、平板和手机上使用本地 Ollama 及兼容 OpenAI 的端点。Lite、Balanced 和 Full 配置档会选择较小或较大的本地默认模型；云端端点要求 HTTPS，而 Ollama 的私有局域网（LAN）HTTP 必须显式启用。更广泛的适配器路线图让智能体不依赖任何单一模型厂商。

| 引擎 | 模式 | 规划中的角色 |
| :--- | :--- | :--- |
| **Ollama** | 本地 | 默认的免费/离线路径 |
| **兼容 OpenAI 的端点** | 本地或自托管 | 灵活部署于本地和私有环境 |
| **Claude** | 云端 / BYOK | 复杂推理和长文本任务 |
| **Gemini** | 云端 / BYOK | 长上下文和多模态任务 |
| **OpenAI / Codex** | 云端 / BYOK | 编程和工具驱动的工作流 |
| **OpenRouter** | 云端 / BYOK | 通过一个 API 访问多种模型 |

**当前策略：** 默认使用 Ollama；只有明确配置后才使用其他服务商。**规划中的路由：** 本地优先；仅在获得许可时使用云端；仅在已获允许的服务商之间回退。

---

## 🚀 快速开始

用一条命令安装 Obsidian 和 JONIS.AI 本地捕获插件。安装程序会在“文档”文件夹中创建知识库，将捕获内容保存到 `JONIS.AI/Inbox.md`，并打开 Obsidian。本地捕获不需要 Python 或 API 密钥。

### Windows — PowerShell

```powershell
irm https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.ps1 | iex
```

### macOS — 终端

```bash
curl -fsSL https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.sh | bash
```

安装程序始终会在 Obsidian 中安装可移植的 **Agent Harness**。桌面端在可用时使用 Python 3.10+；手机、平板和未安装 Python 的电脑使用 JavaScript 运行时。运行前可以先查看 [install.ps1](install.ps1) 或 [install.sh](install.sh)。

如果 Obsidian 限制社区插件，请打开 **设置 → 第三方插件**，关闭 **受限模式** 并启用 **JONIS.AI**。

### Agent Harness — 所有设备

| 配置档 | 最适用设备 | 默认本地模型 | 步数 |
| :--- | :--- | :--- | :--- |
| **Lite** | 低配电脑 | `qwen2.5-coder:1.5b` | 4 |
| **Balanced** | 平板或手机 | `qwen2.5-coder:3b` | 6 |
| **Full** | 笔记本或台式电脑 | `qwen2.5-coder:7b` | 8 |

1. 单独安装 [Ollama](https://ollama.com) 并下载 Balanced 模型：

   ```bash
   ollama pull qwen2.5-coder:3b
   ```

2. 在 Obsidian 中打开 **设置 → JONIS.AI**，选择配置档和服务商，然后运行 **JONIS.AI: Ask Agent Harness**。

在手机/平板上，可移植运行时不需要 Python。可以使用 HTTPS 上兼容 OpenAI 的端点，或在 JONIS.AI 设置中启用 **允许 Ollama 使用私有局域网 HTTP**，然后通过 `http://192.168.1.10:11434` 等局域网地址将 Ollama 指向同一私有网络中的另一台电脑。本地捕获在离线状态下仍可使用。

Harness 可以在知识库内执行 `list_notes`、`read_note`、`search_notes`、`create_note` 和 `append_note`。它不会运行系统命令，也不会访问知识库之外的文件；笔记内容被视为不可信数据。写入必须在 Agent Harness 窗口中明确勾选，或在 CLI 中使用 `--allow-writes`；每次工具调用都会记录到 `.jonis-ai/audit.jsonl`。

在 CLI 中，可用 `python -m harness --profile lite "读取我的笔记"` 选择配置档。兼容 OpenAI 的设置也可以在 `.jonis-ai/config.json` 中使用 `provider`、`model` 和 `base_url`，并通过 `JONIS_AI_API_KEY` 提供密钥。Full 模式在笔记本/电脑上提供最高能力；自动模型路由、更广泛的系统执行、语音和 3D/HUD 仍在路线图中。

---

## 技术栈

<div align="center">

<img src="https://img.shields.io/badge/Python-0b1020?style=flat-square&logo=python&logoColor=22d3ee" alt="Python" />
<img src="https://img.shields.io/badge/TypeScript-0b1020?style=flat-square&logo=typescript&logoColor=22d3ee" alt="TypeScript" />
<img src="https://img.shields.io/badge/Node.js-0b1020?style=flat-square&logo=nodedotjs&logoColor=22d3ee" alt="Node.js" />
<img src="https://img.shields.io/badge/SQLite-0b1020?style=flat-square&logo=sqlite&logoColor=8b5cf6" alt="SQLite" />
<img src="https://img.shields.io/badge/Ollama-0b1020?style=flat-square&logo=ollama&logoColor=22d3ee" alt="Ollama" />
<img src="https://img.shields.io/badge/Obsidian-0b1020?style=flat-square&logo=obsidian&logoColor=8b5cf6" alt="Obsidian" />

<br/>

<img src="https://img.shields.io/badge/9Drive-0b1020?style=flat-square&logoColor=22d3ee" alt="9Drive" />
<img src="https://img.shields.io/badge/Notion-0b1020?style=flat-square&logo=notion&logoColor=a5b4fc" alt="Notion" />
<img src="https://img.shields.io/badge/Miro-0b1020?style=flat-square&logo=miro&logoColor=8b5cf6" alt="Miro" />
<img src="https://img.shields.io/badge/Three.js-0b1020?style=flat-square&logo=threedotjs&logoColor=22d3ee" alt="Three.js" />
<img src="https://img.shields.io/badge/WebGL-0b1020?style=flat-square&logo=webgl&logoColor=22d3ee" alt="WebGL" />
<img src="https://img.shields.io/badge/GitHub%20Actions-0b1020?style=flat-square&logo=githubactions&logoColor=a5b4fc" alt="GitHub Actions" />

</div>

---

## 数据概览

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=jonypeixoto&show_icons=true&hide_title=true&hide_border=true&bg_color=0d1117&title_color=22d3ee&icon_color=8b5cf6&text_color=cbd5e1&rank_icon=github&locale=cn" alt="jonypeixoto 的 GitHub 统计" width="49%" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=jonypeixoto&layout=compact&langs_count=8&hide_border=true&bg_color=0d1117&title_color=22d3ee&text_color=cbd5e1&locale=cn" alt="最常用的语言" width="41%" />

<br/>

<img src="https://streak-stats.demolab.com?user=jonypeixoto&theme=tokyonight&hide_border=true&background=0d1117&ring=8b5cf6&fire=22d3ee&currStreakLabel=22d3ee&locale=zh" alt="连续贡献天数" width="49%" />

<br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=jonypeixoto&theme=tokyo-night&bg_color=0d1117&hide_border=true&area=true&custom_title=Recent%20activity" alt="近期活动图表" width="100%" />

</div>

<details>
<summary><strong>贡献贪吃蛇</strong> — 由工作流自动生成</summary>

<br/>

该动画由 [`snake.yml`](.github/workflows/snake.yml) 工作流生成，并发布到 `output` 分支。首次运行 Action 后即可显示。

<div align="center">
  <img src="https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/output/snake.svg" alt="吞噬贡献图的贪吃蛇" width="100%" />
</div>

</details>

---

## 🗺️ 路线图

- [x] JONIS.AI 视觉形象与动态多语言个人主页
- [x] 产品架构：本地优先、模型无关、Obsidian 优先
- [x] Windows/macOS 一键安装 Obsidian、本地捕获以及适用于桌面、平板和手机的可移植 Agent Harness
- [x] 本地及可移植 Agent Harness：Ollama/兼容 OpenAI 的服务商、Lite/Balanced/Full 配置档、仅限知识库的 Markdown 工具、明确写入授权和审计日志
- [ ] 自主系统执行、自动模型路由和更广泛的操作策略
- [ ] Obsidian 插件 MVP：捕获、分类、wikilinks 和带引用的回答
- [ ] 首批自有云端 BYOK 适配器：Claude、Gemini、OpenAI/Codex 和 OpenRouter
- [ ] 9Drive 存储、Notion 和 Miro 连接器
- [ ] 低延迟双向语音
- [ ] 全息 3D 面孔 / 交互式 HUD
- [ ] 社区技能与集成库
- [ ] 演示知识库、版本发布和贡献者文档

---

## ❓ 常见问题

<details>
<summary><strong>JONIS.AI 真的免费吗？</strong></summary>

<br/>

软件采用 MIT 许可证，本地 Agent Harness 没有 API 费用。你只需承担自己的硬件和电费。云端 API 为可选项，服务商可能根据使用量收费。

</details>

<details>
<summary><strong>可以搭配 Obsidian 免费方案使用吗？</strong></summary>

<br/>

可以。本地捕获插件无需 Obsidian Sync 或 Obsidian Publish 即可使用你的知识库。Agent Harness 在桌面、平板和手机上使用同一个本地知识库。

</details>

<details>
<summary><strong>它会把我的笔记发送到云端吗？</strong></summary>

<br/>

Harness 不会自行上传笔记。Ollama 是默认选项，并在本地运行。只有当你明确配置兼容 OpenAI 的服务商后，才会发送请求，并且只发送该请求所需的上下文，同时受服务商条款约束。

</details>

<details>
<summary><strong>可以在不同模型之间切换吗？</strong></summary>

<br/>

你可以在 `.jonis-ai/config.json` 中或通过 CLI 参数选择 Ollama 或兼容 OpenAI 的端点，并根据设备选择 Lite、Balanced 或 Full 配置档。按任务自动路由以及 Claude、Gemini、OpenAI/Codex 和 OpenRouter 的自有适配器仍在路线图中。

</details>

<details>
<summary><strong>需要 3D 面孔或麦克风才能使用吗？</strong></summary>

<br/>

不需要。当前 Agent Harness 可在桌面、平板和手机的 Obsidian 中运行，计算机上也可使用 Python CLI。语音和 3D/HUD 将是可按需独立启用的可选模块。

</details>

<details>
<summary><strong>现在就能使用这个智能体了吗？</strong></summary>

<br/>

桌面、平板和手机的 Obsidian 中均已提供有限的 Agent Harness。它可以在知识库内列出、读取、搜索、创建和追加 Markdown 笔记；写入需要明确授权，工具调用会被审计。它不会运行系统命令，也不会访问知识库之外的文件。自动模型路由、更广泛的系统执行、语音和 3D/HUD 仍在开发中。

</details>

---

## 联系方式

| 渠道 | 联系方式 |
| --- | --- |
| GitHub | [@jonypeixoto](https://github.com/jonypeixoto) |
| 组织 | [JONIS-AI](https://github.com/JONIS-AI) |
| 交流 | [提交 issue](https://github.com/JONIS-AI/JONIS.AI/issues) |

<div align="center">

**[如果 JONIS.AI 今天为你节省了时间，请给仓库点一个 ⭐！](https://github.com/JONIS-AI/JONIS.AI)**

<sub>以开源代码打造，专注于任务执行。</sub>

</div>

<div align="center">

<img src="./assets/footer.svg" alt="构建未来。把不可能变为现实。" width="100%" />

<sub>© 2026 JONIS.AI — 以对细节的极致追求打造。</sub>

</div>
