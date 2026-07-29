# Liminal

**Configure the Limine bootloader and preview it in real time, and also manage the system entries, with a GUI interface.**

Liminal is a cross-platform desktop GUI application for visually configuring the [Limine](https://limine-bootloader.org/) bootloader. The principle is to provide a simple configuration and real-time preview tool.  
The current focus is the **Design** mode (real-time preview of global appearance, with tools to import popular themes from the Internet, select colors and wallpapers, and download the fonts that are allowed). The **System** mode (manage boot menu entries) is planned for a later milestone.

## For Users

### Features

**Design mode:**
- GUI interface to configure everything (wallpaper, resolution, rotation, branding text, help text, timeout countdown, terminal colours / font / margins, etc.)
- Real-time preview of the Limine graphical interface
- Scan the possible folders for the config files (according to Limine's rule) and save different versions of them if they are different
- Save different versions and histories in a safe folder
- Apply the config in one click (or provides you with a shell command to apply the config)

**System mode:** (coming next)
- Manage boot menu entries, protocols, and paths
- Scan your other Linux distros or bootloaders, or even Windows, in this or other disks
- Manage the Btrfs backups like delete, edit, add, or set backup rules

### Requirements

- Linux (CachyOS recommended, other distros will be tested later but should work)
- Limine already installed and correctly set up
- X11 or Wayland

### Installation (from Releases)

This project is No formal releases have been published yet. Watch the [Releases](https://github.com/NailFec/liminal/releases) or build from source (see Developer section below).

---

## For Developers

### Tech stack

| Layer           | Technology               | Notes                       |
|-----------------|--------------------------|-----------------------------|
| Desktop shell   | Tauri                    | 2.x                         |
| Frontend        | Svelte + SvelteKit       | Svelte 5 + Kit 2            |
| Language        | TypeScript               | ~5.6                        |
| Bundler         | Vite                     | 6.x                         |
| Package manager | pnpm                     | **Required**                |
| Backend         | Rust                     | edition 2021                |
| Fonts           | IBM Plex Sans / Mono     | via @fontsource             |
| Adapter         | @sveltejs/adapter-static | SPA mode (no SSR for Tauri) |

### Development setup

1. Install prerequisites:
    - Node.js (latest LTS recommended)
    - [pnpm](https://pnpm.io/)
    - [Rust](https://www.rust-lang.org/) via rustup
    - Tauri system dependencies (see [official docs](https://v2.tauri.app/start/prerequisites/))
2. Clone the repository:
   ```bash
   git clone https://github.com/NailFec/liminal.git
   cd liminal
   # Install frontend dependencies
   pnpm install
   # Start development (Vite + Tauri)
   pnpm tauri dev
   # Frontend-only preview (no native window)
   pnpm dev
   # Type checking
   pnpm check
   ```

### About AI usages

AI assistance is allowed in this repository, subject to the following rules:

1. Any code written or modified by AI must be fully reviewed by a human before it is committed or merged.
2. PR and Issue content must be purely human-written. AI may be used for thinking, but the final text must be human-authored.
3. Many AI tools are configured to fit Cursor.
   The following are already present:
    - **Plugins**: Svelte plugin enabled (`.cursor/settings.json`)
    - **MCPs**: Svelte MCP (`.cursor/mcp.json`, using `@sveltejs/mcp`)
    - **Rules**: environment rule (`.cursor/rules/environment.mdc`) + `AGENTS.md` (alwaysApply)
    - **Agents / Skills**:
        - `.cursor/agents/svelte-file-editor.md`
        - `.agents/skills/svelte-code-writer`
        - `.agents/skills/svelte-core-bestpractices` (extensive Svelte 5 references)

When working with AI tools in this repo, always let AI read `AGENTS.md` and `README.md` first, and use the configured MCP / skills / subagents as needed.

---

## License

Copyright 2026 NailFec

This product includes software developed by NailFec. See the [LICENSE](LICENSE) and the [NOTICE](NOTICE) file.
