<p align="center">
  <a href="README.en-GB.md" title="English (UK)"><img src="./assets/flags/gb-eng.svg" width="28" alt="English (UK)" /></a>
  ·
  <a href="README.md" title="English (US)"><img src="./assets/flags/us.svg" width="28" alt="English (US)" /></a>
  ·
  <a href="README.pt-BR.md" title="Português"><img src="./assets/flags/br.svg" width="32" alt="Português" /></a>
  ·
  <a href="README.ru.md" title="Русский"><img src="./assets/flags/ru.svg" width="28" alt="Русский" /></a>
  ·
  <a href="README.zh-CN.md" title="中文"><img src="./assets/flags/cn.svg" width="28" alt="中文" /></a>
  ·
  <a href="README.ar.md" title="العربية"><img src="./assets/flags/sa.svg" width="28" alt="العربية" /></a>
</p>

<div align="center">

<img src="./assets/hero.svg" alt="JONIS.AI — mordomo digital autônomo, independente de modelos e de código aberto" width="100%" />

# JONIS.AI
### Seu mordomo digital, evoluído.
**Autônomo. Independente de modelos. Código aberto. Gratuito para executar localmente.**

Um mordomo digital autônomo e open-source — um JARVIS evoluído — pensado para executar tarefas reais no seu sistema, com rosto 3D/HUD opcional e voz bidirecional. Rode modelos locais gratuitos com Ollama ou use suas próprias chaves de API do Claude, Gemini e OpenAI/Codex.

<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Licença MIT" /></a>
<a href="https://github.com/JONIS-AI/JONIS.AI/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="Pull requests são bem-vindos" /></a>
<a href="#modo-local-vs-api-na-nuvem"><img src="https://img.shields.io/badge/Mode-Local%20%26%20Cloud%20BYOK-blueviolet" alt="Modos local e nuvem com BYOK" /></a>
<a href="#motores-de-modelos"><img src="https://img.shields.io/badge/LLMs-Ollama%20%7C%20Claude%20%7C%20Gemini%20%7C%20OpenAI-blue" alt="Motores de modelo Ollama, Claude, Gemini e OpenAI" /></a>

<br/>

<a href="https://github.com/JONIS-AI"><img src="https://img.shields.io/badge/ORG-JONIS--AI-0b1020?style=flat-square&logo=github&logoColor=22d3ee" alt="Organização JONIS.AI" /></a>
<img src="https://img.shields.io/badge/STATUS-BUILDING-0b1020?style=flat-square&logo=statuspage&logoColor=8b5cf6" alt="Status: em construção" />
<img src="https://komarev.com/ghpvc/?username=jonypeixoto&style=flat-square&color=22d3ee&label=VIEWS" alt="Visitas ao perfil" />

<br/><br/>

<a href="#um-mordomo-digital-feito-para-servir-e-agir">Sobre</a> · <a href="#modo-local-vs-api-na-nuvem">Local vs. nuvem</a> · <a href="#demonstração-e-experiência">Demonstração</a> · <a href="#o-que-o-jonis-faz-por-você">Recursos</a> · <a href="#-módulos-e-capacidades-do-mordomo">Módulos</a> · <a href="#obsidian-como-segundo-cérebro">Obsidian</a> · <a href="#motores-de-modelos">Motores</a> · <a href="#-início-rápido">Início rápido</a> · <a href="#-roadmap">Roadmap</a> · <a href="#-faq">FAQ</a>

</div>

---

## Um mordomo digital feito para servir e agir

A maioria das ferramentas de IA espera pelo seu próximo prompt. **JONIS.AI** está sendo construído como um mordomo digital com presença, voz e autonomia dentro de limites: ele lê seu contexto, toma iniciativa conforme as regras que você define, troca de "cérebros" para se adequar à tarefa e realiza ações concretas no seu ambiente.

- **Gratuito e de código aberto:** software licenciado sob a MIT, sem assinatura nem dependência de um provedor. O modo local não tem taxas de API.
- **Troque de LLM em segundos:** comece com modelos locais gratuitos por meio do **Ollama** ou conecte **Claude, Gemini, OpenAI/Codex, OpenRouter** e motores compatíveis usando suas próprias chaves.
- **Voz e presença visual:** pensado para texto em primeiro lugar, com voz bidirecional e um avatar 3D/HUD opcional no roadmap.
- **Você define os limites:** listas de permissões, confirmação para ações sensíveis e um registro de auditoria local são princípios centrais do projeto.

> Seu cofre. Suas regras. Sua escolha de inteligência.

**Status do projeto:** o produto está em desenvolvimento. Este repositório contém, no momento, a visão, a arquitetura, a identidade visual e o roadmap; os recursos executáveis descritos abaixo representam o produto planejado.

---

## Modo local vs. API na nuvem

Escolha como seu mordomo opera de acordo com seu hardware, orçamento e necessidades de privacidade.

| Critério | Modo local | Modo nuvem / BYOK |
| :--- | :--- | :--- |
| **Custo** | **€0 / R$0 em taxas de API** — apenas hardware e eletricidade | Preços do provedor ou plano gratuito; você traz sua própria chave |
| **Privacidade** | **Máxima** — os dados são processados na sua máquina | O contexto selecionado é enviado ao provedor de LLM escolhido |
| **Requisitos** | CPU/GPU razoável e [Ollama](https://ollama.com/) instalado | Conexão com a internet e uma chave de API válida |
| **Modelos de exemplo** | `qwen2.5-coder`, `llama`, `deepseek` | Claude, Gemini, OpenAI/Codex, OpenRouter |
| **Ideal para** | Uso contínuo, trabalho off-line e dados sensíveis | Raciocínio complexo, contextos longos e picos de demanda |

Os planos gratuitos e as cotas dos serviços de nuvem podem mudar, e o uso das APIs pode gerar custos. Nenhum provedor pago é necessário para usar o modo local planejado.

---

## Demonstração e experiência

<div align="center">
  <img src="./assets/jonis-core.gif" alt="Núcleo animado do JONIS.AI: figura blindada com olhos azuis brilhantes e reator ciano no peito" width="320" />
  <br/>
  <sub>JONIS.AI — núcleo visual</sub>
</div>

<br/>

<div align="center">
  <img src="./assets/terminal.svg" alt="Terminal do JONIS.AI mostrando identidade, motores de modelo e missão" width="100%" />
</div>

A sequência abaixo ilustra o fluxo de trabalho ponta a ponta planejado.

```text
[JONIS.AI — fluxo de trabalho planejado]
> "Troque para o modelo local gratuito, organize os relatórios em /finance e crie um resumo."

[Motor: ollama/qwen2.5-coder:7b | Voz: pronta | Política: confirmar alterações]
> 14 relatórios classificados
> Resumo salvo em /finance/monthly-summary.md
```

---

## O que o JONIS faz por você

<details>
<summary><strong>01 · Contexto e iniciativa</strong> — entenda o cofre e proponha a próxima ação útil</summary>

<br/>

Combina notas ativas, tarefas e atividades recentes em um contexto de trabalho. Pode sugerir o próximo passo, rascunhar um plano e perguntar antes de agir quando a solicitação é ambígua.

`Contexto` `Planejamento` `Sugestões proativas` `Revisão humana`

</details>

<details>
<summary><strong>02 · Execução real com proteções</strong> — transforme intenção em ações concretas no sistema</summary>

<br/>

Projetado para organizar arquivos, criar notas estruturadas, executar fluxos de trabalho aprovados e chamar ferramentas autorizadas. Operações sensíveis exigem aprovação explícita, e cada ação é registrada localmente.

`Uso de ferramentas` `Listas de permissões` `Aprovações` `Registro de auditoria`

</details>

<details>
<summary><strong>03 · Roteamento de modelos</strong> — use o motor certo sem ficar preso a um provedor</summary>

<br/>

Um roteador independente de provedor escolhe entre motores locais e na nuvem com base na tarefa, no custo, na privacidade e na disponibilidade. O acesso pago à nuvem exige sempre ativação explícita; o roteador não deve enviar dados do cofre para uma API na nuvem sem autorização explícita.

`Ollama` `BYOK` `Fallback` `Controle de custos`

</details>

<details>
<summary><strong>04 · Voz e presença visual</strong> — interaja além do texto simples</summary>

<br/>

Uma experiência centrada no terminal mantém o núcleo acessível, enquanto a voz bidirecional e um avatar holográfico 3D/HUD opcional acrescentam uma camada mais imersiva.

`Voz bidirecional` `Avatar 3D` `HUD` `Acessibilidade`

</details>

---

## 🧩 Módulos e Capacidades do Mordomo

O núcleo modular planejado reúne seis camadas práticas:

- **💻 Execução & Código:** Cria estruturas, executa comandos, depura erros, lê logs e ajuda em fluxos de desenvolvimento.
- **🎙️ Voz Bidirecional:** Fale naturalmente com o mordomo e receba respostas em áudio ou texto.
- **🌐 Rosto 3D Holográfico / Interface HUD:** Camada visual opcional para dar identidade e feedback de estado em tempo real.
- **📂 Gestão de Arquivos & Dados:** Lê documentos, organiza pastas, extrai informações e prepara entregas estruturadas.
- **🔎 Pesquisa & Síntese:** Cruza informações e resume o que importa sem perda de tempo.
- **🔌 Arquitetura Extensível:** Adicione novas skills, ferramentas e conectores conforme o seu fluxo de trabalho.

---

## Obsidian como segundo cérebro

O plugin é projetado para computador, tablet e celular e funciona com o **plano gratuito**. Obsidian Sync e Obsidian Publish não são necessários.

- **Markdown é a fonte da verdade:** suas notas continuam legíveis, portáteis e sob seu controle.
- **Recuperação com prioridade local:** SQLite/FTS e embeddings locais opcionais permitem buscas e respostas com citações.
- **Um fluxo prático:** capturar, classificar, vincular, recuperar, agir e revisar.
- **Armazenamento e conectores opcionais:** 9Drive, Notion e Miro ampliam o sistema sem se tornarem dependências.

```text
Capturar -> Classificar -> Vincular -> Recuperar -> Agir -> Revisar
   |          |           |            |       |       |
 cofre      regras      links     índice local ferramentas trilha de
 notas      locais                                  auditoria
```

| Integração | Função planejada | Obrigatória? |
| :--- | :--- | :--- |
| **Obsidian** | Cofre, notas, tarefas e interface do plugin | Sim |
| **[9Drive](https://github.com/zenhosta/9drive)** | Anexos, exportações e encaminhamento de backups por meio de uma interface de provedor de armazenamento | Não |
| **Notion** | Conector opcional de importação/sincronização de páginas e bancos de dados | Não |
| **Miro** | Conector opcional de importação de quadros | Não |

O armazenamento local continua sendo o padrão. O segundo cérebro deve continuar útil mesmo com todos os conectores opcionais desativados.

---

## Motores de modelos

O Agent Harness já oferece suporte a Ollama local e endpoints compatíveis com OpenAI no computador, tablet e celular. Os perfis Lite, Balanced e Full escolhem padrões locais menores ou maiores; endpoints na nuvem exigem HTTPS, enquanto HTTP privado de LAN para Ollama precisa ser habilitado explicitamente. O roadmap mais amplo de adaptadores mantém o agente independente de um único fabricante de modelos.

| Motor | Modo | Função pretendida |
| :--- | :--- | :--- |
| **Ollama** | Local | Caminho gratuito/off-line padrão |
| **Endpoints compatíveis com OpenAI** | Local ou auto-hospedado | Implantações locais e privadas flexíveis |
| **Claude** | Nuvem / BYOK | Raciocínio complexo e trabalhos longos |
| **Gemini** | Nuvem / BYOK | Contextos longos e tarefas multimodais |
| **OpenAI / Codex** | Nuvem / BYOK | Programação e fluxos de trabalho orientados por ferramentas |
| **OpenRouter** | Nuvem / BYOK | Acesso a vários modelos por uma única API |

**Política atual:** Ollama é o padrão; outro provedor é usado somente quando configurado explicitamente. **Roteamento planejado:** local primeiro; nuvem somente com permissão; fallback apenas entre provedores autorizados.

---

## 🚀 Início rápido

Instale o Obsidian e o plugin local de captura do JONIS.AI com um único comando. O bootstrap cria um cofre na sua pasta de Documentos, salva as capturas em `JONIS.AI/Inbox.md` e abre o Obsidian. Não é necessário Python nem chave de API para a captura local.

### Windows — PowerShell

```powershell
irm https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.ps1 | iex
```

### macOS — Terminal

```bash
curl -fsSL https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.sh | bash
```

O bootstrap sempre instala o **Agent Harness** portátil no Obsidian. No computador, ele usa Python 3.10+ quando disponível; no celular, tablet e em PCs sem Python, usa o runtime JavaScript. Você pode revisar [install.ps1](install.ps1) ou [install.sh](install.sh) antes de executar o comando.

Se o Obsidian mantiver os plugins da comunidade restritos, abra **Configurações → Plugins da comunidade**, desative o **Modo restrito** e ative o **JONIS.AI**.

### Agent Harness — todos os dispositivos

| Perfil | Melhor uso | Modelo local padrão | Passos |
| :--- | :--- | :--- | :--- |
| **Lite** | PC fraco | `qwen2.5-coder:1.5b` | 4 |
| **Balanced** | Tablet ou celular | `qwen2.5-coder:3b` | 6 |
| **Full** | Notebook ou PC | `qwen2.5-coder:7b` | 8 |

1. Instale o [Ollama](https://ollama.com) separadamente e baixe o modelo Balanced:

   ```bash
   ollama pull qwen2.5-coder:3b
   ```

2. No Obsidian, abra **Configurações → JONIS.AI**, escolha o perfil e o provedor e execute **JONIS.AI: Ask Agent Harness**.

No celular/tablet, o runtime portátil não exige Python. Use um endpoint compatível com OpenAI por HTTPS ou ative **Permitir HTTP privado de LAN para Ollama** nas configurações do JONIS.AI e aponte o Ollama para outro computador da mesma rede privada com uma URL LAN, como `http://192.168.1.10:11434`. A captura local continua disponível offline.

O harness pode executar `list_notes`, `read_note`, `search_notes`, `create_note` e `append_note` dentro do cofre. Ele não executa comandos do sistema nem acessa arquivos fora do cofre, e trata o conteúdo das notas como dados não confiáveis. A escrita exige a caixa de seleção explícita na janela do Agent Harness ou `--allow-writes` no CLI; cada chamada de ferramenta fica registrada em `.jonis-ai/audit.jsonl`.

No CLI, selecione um perfil com `python -m harness --profile lite "Leia minhas notas"`. As configurações compatíveis com OpenAI também podem usar `provider`, `model` e `base_url` em `.jonis-ai/config.json`, com a chave fornecida por `JONIS_AI_API_KEY`. O modo Full oferece o maior potencial em notebook/PC; roteamento automático de modelos, execução ampla no sistema, voz e 3D/HUD permanecem no roadmap.

---

## Stack

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

## Sinais vitais

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=jonypeixoto&show_icons=true&hide_title=true&hide_border=true&bg_color=0d1117&title_color=22d3ee&icon_color=8b5cf6&text_color=cbd5e1&rank_icon=github&locale=pt-br" alt="Estatísticas do GitHub de jonypeixoto" width="49%" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=jonypeixoto&layout=compact&langs_count=8&hide_border=true&bg_color=0d1117&title_color=22d3ee&text_color=cbd5e1&locale=pt-br" alt="Linguagens mais usadas" width="41%" />

<br/>

<img src="https://streak-stats.demolab.com?user=jonypeixoto&theme=tokyonight&hide_border=true&background=0d1117&ring=8b5cf6&fire=22d3ee&currStreakLabel=22d3ee&locale=pt-br" alt="Sequência de contribuições" width="49%" />

<br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=jonypeixoto&theme=tokyo-night&bg_color=0d1117&hide_border=true&area=true&custom_title=Atividade%20recente" alt="Gráfico de atividade recente" width="100%" />

</div>

<details>
<summary><strong>Cobrinha de contribuições</strong> — gerada automaticamente pelo workflow</summary>

<br/>

A animação é produzida pelo workflow [`snake.yml`](.github/workflows/snake.yml) e publicada no branch `output`. Ela aparece depois da primeira execução do GitHub Actions.

<div align="center">
  <img src="https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/output/snake.svg" alt="Cobrinha consumindo o gráfico de contribuições" width="100%" />
</div>

</details>

---

## 🗺️ Roadmap

- [x] Identidade visual da JONIS.AI e perfil multilíngue animado
- [x] Arquitetura do produto: local primeiro, independente de modelos e com prioridade no Obsidian
- [x] Bootstrap de um comando para Windows/macOS com Obsidian, captura local e Agent Harness portátil para computador, tablet e celular
- [x] Agent Harness local e portátil: provedores Ollama/compatíveis com OpenAI, perfis Lite/Balanced/Full, ferramentas Markdown restritas ao cofre, aprovação explícita de escrita e auditoria
- [ ] Execução autônoma no sistema, roteador automático de modelos e políticas de ação mais amplas
- [ ] MVP do plugin para Obsidian: captura, classificação, wikilinks e respostas com citações
- [ ] Primeiros adaptadores próprios BYOK na nuvem: Claude, Gemini, OpenAI/Codex e OpenRouter
- [ ] Conectores de armazenamento 9Drive e conectores Notion e Miro
- [ ] Voz bidirecional com baixa latência
- [ ] Rosto 3D holográfico / HUD interativo
- [ ] Biblioteca comunitária de skills e integrações
- [ ] Cofre de demonstração, lançamentos e documentação para contribuidores

---

## ❓ FAQ

<details>
<summary><strong>O JONIS.AI é realmente gratuito?</strong></summary>

<br/>

O software é licenciado sob a MIT e o Agent Harness local não tem taxas de API. Você paga apenas pelo seu próprio hardware e pela eletricidade. As APIs na nuvem são opcionais e podem cobrar conforme o uso do provedor.

</details>

<details>
<summary><strong>Funciona com o plano gratuito do Obsidian?</strong></summary>

<br/>

Sim. O plugin local de captura funciona com seu cofre sem exigir Obsidian Sync ou Obsidian Publish. O Agent Harness usa o mesmo cofre local no computador, tablet e celular.

</details>

<details>
<summary><strong>Ele envia minhas notas para a nuvem?</strong></summary>

<br/>

O harness não envia notas por conta própria. Ollama é o padrão e roda localmente. Um provedor compatível com OpenAI só é contatado quando você o configura explicitamente, e apenas o contexto necessário à requisição é enviado, sujeito aos termos do provedor.

</details>

<details>
<summary><strong>Posso alternar entre modelos?</strong></summary>

<br/>

Você pode selecionar Ollama ou um endpoint compatível com OpenAI em `.jonis-ai/config.json` ou por argumentos do CLI e escolher um perfil Lite, Balanced ou Full para o seu dispositivo. O roteamento automático por tarefa e os adaptadores próprios para Claude, Gemini, OpenAI/Codex e OpenRouter permanecem no roadmap.

</details>

<details>
<summary><strong>Preciso de um rosto 3D ou microfone para usar?</strong></summary>

<br/>

Não. O Agent Harness atual roda no Obsidian em computador, tablet e celular; o CLI Python também está disponível no computador. A voz e o 3D/HUD serão módulos opcionais que poderão ser ativados de forma independente.

</details>

<details>
<summary><strong>O agente já está disponível?</strong></summary>

<br/>

Um Agent Harness limitado está disponível no Obsidian para computador, tablet e celular. Ele pode listar, ler, pesquisar, criar e anexar notas Markdown dentro do cofre; a escrita exige aprovação explícita e as chamadas de ferramentas são auditadas. Ele não executa comandos do sistema nem acessa arquivos fora do cofre. O roteamento automático de modelos, a execução ampla no sistema, a voz e o 3D/HUD ainda estão em desenvolvimento.

</details>

---

## Contato

| Canal | Onde |
| --- | --- |
| GitHub | [@jonypeixoto](https://github.com/jonypeixoto) |
| Organização | [JONIS-AI](https://github.com/JONIS-AI) |
| Conversa | [abrir uma issue](https://github.com/JONIS-AI/JONIS.AI/issues) |

<div align="center">

**[Se o JONIS.AI poupou seu tempo hoje, deixe uma ⭐ no repositório!](https://github.com/JONIS-AI/JONIS.AI)**

<sub>Feito com código aberto e foco em execução.</sub>

</div>

<div align="center">

<img src="./assets/footer.svg" alt="Construa o futuro. Entregue o impossível." width="100%" />

<sub>© 2026 JONIS.AI — construído com atenção obsessiva aos detalhes.</sub>

</div>
