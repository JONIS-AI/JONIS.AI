#!/usr/bin/env bash
set -euo pipefail

archive_url="https://codeload.github.com/JONIS-AI/JONIS.AI/zip/refs/heads/main"
install_root="$HOME/JONIS.AI"
vault_path="$HOME/Documents/JONIS.AI Vault"
plugin_path="$vault_path/.obsidian/plugins/jonis-ai"
inbox_path="$vault_path/JONIS.AI/Inbox.md"
welcome_path="$vault_path/JONIS.AI/Welcome.md"
community_plugins_path="$vault_path/.obsidian/community-plugins.json"
harness_config_path="$vault_path/.jonis-ai/config.json"
harness_runtime_path="$vault_path/.jonis-ai/runtime.json"
dry_run=0

for argument in "$@"; do
  case "$argument" in
    --dry-run) dry_run=1 ;;
    *) printf 'Unknown option: %s\n' "$argument" >&2; exit 1 ;;
  esac
done

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf 'This installer is for macOS. Use install.ps1 on Windows.\n' >&2
  exit 1
fi

if [[ "$dry_run" -eq 1 ]]; then
  printf '[JONIS.AI] Dry run: no files will be downloaded or installed.\n'
  printf 'Repository: %s\n' "$archive_url"
  printf 'JONIS.AI folder: %s\n' "$install_root"
  printf 'Obsidian vault: %s\n' "$vault_path"
  printf 'Local plugin: %s\n' "$plugin_path"
  printf 'Enabled plugin list: %s\n' "$community_plugins_path"
  printf 'Agent Harness config: %s\n' "$harness_config_path"
  printf 'Agent Harness runtime: %s\n' "$harness_runtime_path"
  printf 'Obsidian will be installed only if it is not already present.\n'
  printf 'The Agent Harness uses Python 3.10+ when available; local capture does not require Python.\n'
  exit 0
fi

temp_root="$(mktemp -d "${TMPDIR:-/tmp}/jonis-ai-install.XXXXXX")"
mount_point=""

cleanup() {
  if [[ -n "$mount_point" && -d "$mount_point" ]]; then
    hdiutil detach "$mount_point" -quiet || true
  fi
  rm -rf "$temp_root"
}
trap cleanup EXIT

urlencode() {
  local LC_ALL=C
  local value="$1"
  local index character
  for ((index = 0; index < ${#value}; index++)); do
    character="${value:index:1}"
    case "$character" in
      [a-zA-Z0-9.~_/-]) printf '%s' "$character" ;;
      *) printf '%%%02X' "'$character" ;;
    esac
  done
}

find_python() {
  local candidate
  for candidate in python3.13 python3.12 python3.11 python3.10 python3 python; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' >/dev/null 2>&1; then
      command -v "$candidate"
      return 0
    fi
  done
  return 1
}

json_escape() {
  local LC_ALL=C
  local value="$1"
  local escaped=""
  local character code encoded
  local index
  for ((index = 0; index < ${#value}; index++)); do
    character="${value:index:1}"
    case "$character" in
      '"') escaped+='\"' ;;
      '\') escaped+='\\' ;;
      $'\n') escaped+='\n' ;;
      $'\r') escaped+='\r' ;;
      $'\t') escaped+='\t' ;;
      *)
        printf -v code '%d' "'$character"
        if ((code < 32)); then
          printf -v encoded '\\u%04x' "$code"
          escaped+="$encoded"
        else
          escaped+="$character"
        fi
        ;;
    esac
  done
  printf '%s' "$escaped"
}

pick_dmg() {
  local urls="$1"
  local architecture="$2"
  local selected=""

  if [[ "$architecture" == "arm64" ]]; then
    selected="$(printf '%s\n' "$urls" | grep -i 'arm64.*\.dmg$' | head -n 1 || true)"
    if [[ -z "$selected" ]]; then
      selected="$(printf '%s\n' "$urls" | grep -Eiv '(arm64|x64).*\.dmg$' | head -n 1 || true)"
    fi
  else
    selected="$(printf '%s\n' "$urls" | grep -i 'x64.*\.dmg$' | head -n 1 || true)"
    if [[ -z "$selected" ]]; then
      selected="$(printf '%s\n' "$urls" | grep -Eiv '(arm64|x64).*\.dmg$' | head -n 1 || true)"
    fi
  fi

  if [[ -z "$selected" ]]; then
    selected="$(printf '%s\n' "$urls" | head -n 1)"
  fi
  printf '%s' "$selected"
}

printf '[JONIS.AI] Downloading JONIS.AI\n'
archive_path="$temp_root/jonis-ai.zip"
extract_path="$temp_root/source"
curl -fsSL "$archive_url" -o "$archive_path"
mkdir -p "$extract_path"
unzip -q "$archive_path" -d "$extract_path"
source_root="$(find "$extract_path" -mindepth 1 -maxdepth 1 -type d -print | head -n 1)"
if [[ -z "$source_root" ]]; then
  printf 'The JONIS.AI archive could not be extracted.\n' >&2
  exit 1
fi
mkdir -p "$install_root"
cp -R "$source_root/." "$install_root/"

python_path="$(find_python || true)"
if [[ -n "$python_path" ]]; then
  printf '[JONIS.AI] Python 3.10+ found; configuring the Agent Harness\n'
else
  printf '[JONIS.AI] Python 3.10+ was not found; the portable Agent Harness and local capture will still work\n'
fi

if [[ -d "/Applications/Obsidian.app" ]]; then
  printf '[JONIS.AI] Obsidian is already installed\n'
else
  printf '[JONIS.AI] Downloading the latest official Obsidian release\n'
  release_json="$(curl -fsSL -H 'User-Agent: JONIS.AI-Installer' -H 'Accept: application/vnd.github+json' 'https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest')"
  dmg_urls="$(printf '%s' "$release_json" | grep -o '"browser_download_url"[[:space:]]*:[[:space:]]*"[^"]*\.dmg"' | cut -d '"' -f 4 || true)"
  architecture="$(uname -m)"
  dmg_url="$(pick_dmg "$dmg_urls" "$architecture")"
  if [[ -z "$dmg_url" ]]; then
    printf 'No macOS disk image was found in the official Obsidian release.\n' >&2
    exit 1
  fi

  dmg_path="$temp_root/obsidian.dmg"
  curl -fsSL "$dmg_url" -o "$dmg_path"
  printf '[JONIS.AI] Installing Obsidian\n'
  mount_output="$(hdiutil attach "$dmg_path" -nobrowse -quiet)"
  mount_point="$(printf '%s\n' "$mount_output" | awk '/\/Volumes\// {sub(/^.*\/Volumes\//, "/Volumes/"); print; exit}')"
  if [[ -z "$mount_point" || ! -d "$mount_point/Obsidian.app" ]]; then
    printf 'Obsidian could not be mounted from the official disk image.\n' >&2
    exit 1
  fi
  ditto "$mount_point/Obsidian.app" "/Applications/Obsidian.app"
  hdiutil detach "$mount_point" -quiet
  mount_point=""
fi

printf '[JONIS.AI] Creating your JONIS.AI vault and local capture plugin\n'
mkdir -p "$plugin_path"
cp "$install_root/obsidian-plugin/manifest.json" "$plugin_path/manifest.json"
cp "$install_root/obsidian-plugin/main.js" "$plugin_path/main.js"
cp "$install_root/obsidian-plugin/harness.js" "$plugin_path/harness.js"
cp "$install_root/obsidian-plugin/styles.css" "$plugin_path/styles.css"

if [[ ! -f "$community_plugins_path" ]]; then
  printf '[\n  "jonis-ai"\n]\n' > "$community_plugins_path"
else
  community_plugins="$(<"$community_plugins_path")"
  if [[ "$community_plugins" != *'"jonis-ai"'* ]]; then
    community_plugins="${community_plugins%"${community_plugins##*[![:space:]]}"}"
    if [[ "$community_plugins" != *']' ]]; then
      printf 'Could not update the Obsidian community plugin list.\n' >&2
      exit 1
    fi
    plugin_prefix="${community_plugins%]}"
    plugin_prefix="${plugin_prefix%"${plugin_prefix##*[![:space:]]}"}"
    if [[ "$plugin_prefix" == "[" ]]; then
      printf '[\n  "jonis-ai"\n]\n' > "$community_plugins_path"
    else
      printf '%s,\n  "jonis-ai"\n]\n' "$plugin_prefix" > "$community_plugins_path"
    fi
  fi
fi
mkdir -p "$(dirname "$harness_config_path")"

if [[ ! -f "$harness_config_path" ]]; then
  cat > "$harness_config_path" <<'EOF'
{
  "provider": "ollama",
  "profile": "balanced",
  "model": "qwen2.5-coder:3b"
}
EOF
fi

printf '{\n  "install_root": "%s",\n  "python": "%s",\n  "python_args": []\n}\n' \
  "$(json_escape "$install_root")" "$(json_escape "$python_path")" > "$harness_runtime_path"

mkdir -p "$(dirname "$inbox_path")"

if [[ ! -f "$inbox_path" ]]; then
  cat > "$inbox_path" <<'EOF'
# JONIS.AI Inbox

Capture notes, links and ideas here with the JONIS.AI plugin.
EOF
fi

if [[ ! -f "$welcome_path" ]]; then
  cat > "$welcome_path" <<'EOF'
# JONIS.AI

Your local-first second brain is ready for capture.

- Open the command palette and run **JONIS.AI: Capture note**.
- Select text in any note and run **JONIS.AI: Capture selection**.
- Notes are saved to **JONIS.AI/Inbox.md** on this device.
- Run **JONIS.AI: Ask Agent Harness** to read, search or organise notes on desktop, tablet or mobile.
- Desktop uses Python 3.10+ when available; mobile/tablet and PCs without Python use the portable JavaScript harness.
- Start with the Balanced profile and `qwen2.5-coder:3b`; choose Lite for low-resource PCs or Full for notebook/PC performance.
- Writes stay disabled unless you explicitly allow them in the Agent Harness window.
- If the commands do not appear, open **Settings > Community plugins**, turn off **Restricted mode** and enable **JONIS.AI**.

Voice, 3D/HUD, cloud connectors and autonomous model routing are still in development.
EOF
fi

printf '[JONIS.AI] Opening Obsidian\n'
encoded_vault="$(urlencode "$vault_path")"
open "obsidian://open?path=$encoded_vault"

printf '\nJONIS.AI local capture is ready.\n'
printf 'Vault: %s\n' "$vault_path"
if [[ -n "$python_path" ]]; then
  printf 'Agent Harness configured with the desktop Python runtime.\n'
else
  printf 'Portable Agent Harness ready; Python was not required.\n'
fi
printf 'In Obsidian, run JONIS.AI: Ask Agent Harness. Configure the provider in plugin settings.\n'
printf "Install Ollama and run 'ollama pull qwen2.5-coder:3b' before the first local model request.\n"
printf 'If Obsidian blocks the plugin, turn off Restricted mode in Settings > Community plugins.\n'
printf 'Voice, 3D/HUD, cloud connectors and autonomous model routing are still in development.\n'
