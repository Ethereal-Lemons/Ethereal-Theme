# Ethereal for terminals and coding agents

Bring your favorite Ethereal palette beyond VS Code. This folder contains matching themes for coding agents and popular terminal emulators.

These companion themes are distributed through the [Ethereal GitHub repository](https://github.com/Ethereal-Lemons/Ethereal-Theme) and are installed separately from the VS Code extension.

## Available palettes

Every VS Code variant has a matching companion palette. The newest Y2K additions are:

- `ethereal-chrome-angel` — silver-blue chrome, icy cyan, and violet;
- `ethereal-cyber-cherub` — bubblegum pink, laser blue, and acid lime;
- `ethereal-millennium-pearl` — a bright pearl, cobalt, and hot-pink palette.

The full collection is available in each app-specific folder with the same `ethereal-*` filename.

## opencode

The ready-to-use themes are in [`tui/opencode/themes`](opencode/themes).

1. Copy the JSON files you want into `~/.config/opencode/themes` (or `$XDG_CONFIG_HOME/opencode/themes`) for every project, or into `.opencode/themes` for one project.
2. Open opencode and run `/theme`.
3. Select the matching `ethereal-*` theme.

To make one the project default, use its slug in `tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "ethereal-chrome-angel"
}
```

## Claude Code

The Claude Code themes are in [`tui/claude-code`](claude-code).

Custom themes require Claude Code 2.1.118 or later.

1. Copy the JSON files you want into `~/.claude/themes`.
2. Open Claude Code and run `/theme`.
3. Select the matching custom Ethereal theme.

For example, Chrome Angel appears as `custom:ethereal-chrome-angel`.

## Terminal emulators

Terminal applications use a 16-color ANSI palette. Pick the file that matches your Ethereal theme, then follow your terminal's normal custom-theme setup. For the most accurate colors, use a terminal with truecolor (24-bit) support.

| Terminal | Theme files |
| --- | --- |
| Alacritty | [`tui/terminal/alacritty`](terminal/alacritty) |
| Ghostty | [`tui/terminal/ghostty`](terminal/ghostty) |
| Kitty | [`tui/terminal/kitty`](terminal/kitty) |
| WezTerm | [`tui/terminal/wezterm`](terminal/wezterm) |

### Kitty

Include the chosen `.conf` file from your Kitty configuration:

```conf
include /path/to/Ethereal-Theme/tui/terminal/kitty/ethereal-cyber-cherub.conf
```

### Alacritty

Import the chosen `.toml` palette from your `alacritty.toml`:

```toml
[general]
import = ["/path/to/Ethereal-Theme/tui/terminal/alacritty/ethereal-chrome-angel.toml"]
```

### Ghostty

Copy the chosen theme file into `~/.config/ghostty/themes`, then select it in your Ghostty configuration:

```ini
theme = ethereal-chrome-angel
```

### WezTerm

Load the chosen `.lua` file from your WezTerm configuration. Each file returns a complete color-scheme table:

```lua
local wezterm = require "wezterm"
local config = wezterm.config_builder()

config.colors = dofile("/path/to/Ethereal-Theme/tui/terminal/wezterm/ethereal-chrome-angel.lua")

return config
```

For more options, see the official theme documentation for [opencode](https://opencode.ai/docs/themes), [Claude Code](https://code.claude.com/docs/en/terminal-config), [Alacritty](https://alacritty.org/releases/0.14.0/config-alacritty.html), [Ghostty](https://ghostty.org/docs/config/reference), and [WezTerm](https://wezterm.org/config/appearance.html).

## For contributors

After changing a VS Code palette, regenerate the companion files from the repository root:

```sh
npm run export:tui
```

The exporter updates opencode, Claude Code, all four terminal formats, and [`tui/palettes.json`](palettes.json) in one pass.
