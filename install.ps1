param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$archiveUrl = "https://codeload.github.com/JONIS-AI/JONIS.AI/zip/refs/heads/main"
$installRoot = Join-Path $HOME "JONIS.AI"
$vaultPath = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "JONIS.AI Vault"
$pluginPath = Join-Path $vaultPath ".obsidian\plugins\jonis-ai"
$inboxPath = Join-Path $vaultPath "JONIS.AI\Inbox.md"
$welcomePath = Join-Path $vaultPath "JONIS.AI\Welcome.md"
$communityPluginsPath = Join-Path $vaultPath ".obsidian\community-plugins.json"
$harnessConfigPath = Join-Path $vaultPath ".jonis-ai\config.json"
$harnessRuntimePath = Join-Path $vaultPath ".jonis-ai\runtime.json"

function Write-Step($message) {
  Write-Host "[JONIS.AI] $message" -ForegroundColor Cyan
}

function Find-Python {
  foreach ($name in @("py", "python3", "python")) {
    $command = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $command) {
      continue
    }
    $prefix = @()
    if ($name -eq "py") {
      $prefix = @("-3")
    }
    & $command.Source @prefix -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)" *> $null
    if ($LASTEXITCODE -eq 0) {
      return @{ Path = $command.Source; Arguments = $prefix }
    }
  }
  return $null
}

function Write-Utf8Json($Path, $Value) {
  $json = $Value | ConvertTo-Json -Depth 10
  [IO.File]::WriteAllText($Path, $json, [Text.UTF8Encoding]::new($false))
}

function Find-Obsidian {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA "Programs\obsidian\Obsidian.exe"),
    (Join-Path $env:ProgramFiles "Obsidian\Obsidian.exe")
  )
  if (${env:ProgramFiles(x86)}) {
    $candidates += Join-Path ${env:ProgramFiles(x86)} "Obsidian\Obsidian.exe"
  }
  return $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}

if ($env:OS -ne "Windows_NT") {
  throw "This installer is for Windows. Use install.sh on macOS."
}

if ($DryRun) {
  Write-Step "Dry run: no files will be downloaded or installed."
  Write-Host "Repository: $archiveUrl"
  Write-Host "JONIS.AI folder: $installRoot"
  Write-Host "Obsidian vault: $vaultPath"
  Write-Host "Local plugin: $pluginPath"
  Write-Host "Enabled plugin list: $communityPluginsPath"
  Write-Host "Agent Harness config: $harnessConfigPath"
  Write-Host "Agent Harness runtime: $harnessRuntimePath"
  Write-Host "Obsidian will be installed only if it is not already present."
  Write-Host "The Agent Harness uses Python 3.10+ when available; local capture does not require Python."
  exit 0
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("jonis-ai-install-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
  Write-Step "Downloading JONIS.AI"
  $archivePath = Join-Path $tempRoot "jonis-ai.zip"
  $extractPath = Join-Path $tempRoot "source"
  Invoke-WebRequest -Uri $archiveUrl -OutFile $archivePath -UseBasicParsing
  Expand-Archive -LiteralPath $archivePath -DestinationPath $extractPath
  $sourceRoot = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
  if (-not $sourceRoot) {
    throw "The JONIS.AI archive could not be extracted."
  }

  New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
  Get-ChildItem -LiteralPath $sourceRoot.FullName -Force | Copy-Item -Destination $installRoot -Recurse -Force

  $pythonRuntime = Find-Python
  if ($pythonRuntime) {
    Write-Step "Python 3.10+ found; configuring the Agent Harness"
  } else {
    Write-Step "Python 3.10+ was not found; the portable Agent Harness and local capture will still work"
  }

  $obsidianExe = Find-Obsidian
  if (-not $obsidianExe) {
    Write-Step "Downloading the latest official Obsidian release"
    $headers = @{
      "User-Agent" = "JONIS.AI-Installer"
      "Accept" = "application/vnd.github+json"
    }
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/obsidianmd/obsidian-releases/releases/latest" -Headers $headers
    $asset = $release.assets | Where-Object { $_.name -match '\.exe$' } | Select-Object -First 1
    if (-not $asset) {
      throw "No Windows installer was found in the official Obsidian release."
    }
    $obsidianInstaller = Join-Path $tempRoot $asset.name
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $obsidianInstaller -UseBasicParsing
    Write-Step "Installing Obsidian"
    $process = Start-Process -FilePath $obsidianInstaller -ArgumentList "/S" -Wait -PassThru
    if ($process.ExitCode -notin @(0, 3010)) {
      throw "Obsidian installer exited with code $($process.ExitCode)."
    }
  } else {
    Write-Step "Obsidian is already installed"
  }

  Write-Step "Creating your JONIS.AI vault and local capture plugin"
  New-Item -ItemType Directory -Path $pluginPath -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $installRoot "obsidian-plugin\manifest.json") -Destination $pluginPath -Force
  Copy-Item -LiteralPath (Join-Path $installRoot "obsidian-plugin\main.js") -Destination $pluginPath -Force
  Copy-Item -LiteralPath (Join-Path $installRoot "obsidian-plugin\harness.js") -Destination $pluginPath -Force
  Copy-Item -LiteralPath (Join-Path $installRoot "obsidian-plugin\styles.css") -Destination $pluginPath -Force

  $communityPlugins = @()
  if (Test-Path -LiteralPath $communityPluginsPath) {
    $communityPlugins = @(Get-Content -LiteralPath $communityPluginsPath -Raw | ConvertFrom-Json | ForEach-Object { $_ })
  }
  if ($communityPlugins -notcontains "jonis-ai") {
    $communityPlugins += "jonis-ai"
    ConvertTo-Json -InputObject $communityPlugins | Set-Content -LiteralPath $communityPluginsPath -Encoding UTF8
  }

  New-Item -ItemType Directory -Path (Split-Path -Parent $harnessConfigPath) -Force | Out-Null
  if (-not (Test-Path -LiteralPath $harnessConfigPath)) {
    Write-Utf8Json $harnessConfigPath @{ provider = "ollama"; profile = "balanced"; model = "qwen2.5-coder:3b" }
  }
  $runtime = [ordered]@{ install_root = $installRoot; python = ""; python_args = @() }
  if ($pythonRuntime) {
    $runtime.python = $pythonRuntime.Path
    $runtime.python_args = @($pythonRuntime.Arguments)
  }
  Write-Utf8Json $harnessRuntimePath $runtime

  New-Item -ItemType Directory -Path (Split-Path -Parent $inboxPath) -Force | Out-Null
  if (-not (Test-Path -LiteralPath $inboxPath)) {
    Set-Content -LiteralPath $inboxPath -Encoding UTF8 -Value @"
# JONIS.AI Inbox

Capture notes, links and ideas here with the JONIS.AI plugin.
"@
  }
  if (-not (Test-Path -LiteralPath $welcomePath)) {
    Set-Content -LiteralPath $welcomePath -Encoding UTF8 -Value @"
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
"@
  }

  Write-Step "Opening Obsidian"
  $vaultUri = "obsidian://open?path=$([Uri]::EscapeDataString($vaultPath))"
  Start-Process -FilePath $vaultUri

  Write-Host ""
  Write-Host "JONIS.AI local capture is ready." -ForegroundColor Green
  Write-Host "Vault: $vaultPath"
  if ($pythonRuntime) {
    Write-Host "Agent Harness configured with the desktop Python runtime." -ForegroundColor Green
  } else {
    Write-Host "Portable Agent Harness ready; Python was not required." -ForegroundColor Green
  }
  Write-Host "In Obsidian, run JONIS.AI: Ask Agent Harness. Configure the provider in plugin settings."
  Write-Host "Install Ollama and run 'ollama pull qwen2.5-coder:3b' before the first local model request."
  Write-Host "If Obsidian blocks the plugin, turn off Restricted mode in Settings > Community plugins." -ForegroundColor Yellow
  Write-Host "Voice, 3D/HUD, cloud connectors and autonomous model routing are still in development." -ForegroundColor Yellow
} finally {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
