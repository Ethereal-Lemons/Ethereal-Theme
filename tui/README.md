# Ethereal TUI Installation

This guide is for terminal and TUI versions of the Ethereal themes. The main `README.md` is the Visual Studio Code Marketplace showcase.

## Regenerate TUI Themes

Run this after editing any VS Code theme JSON:

```sh
npm run export:tui
```

The exporter reads `themes/*.json` and writes compatible palettes for opencode, Claude Code, and terminal emulators.

## opencode

opencode project-local themes live in:

```text
tui/opencode/themes/*.json
```

To install them for opencode in this project, copy or sync them into `.opencode/themes`:

```sh
mkdir -p .opencode/themes
cp tui/opencode/themes/*.json .opencode/themes/
```

Then select one with:

```text
/theme
```

Or set a theme in `tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "ethereal-kerubin"
}
```

Available slugs:

```text
ethereal-default
ethereal-kerubin
ethereal-frutiger
ethereal-y2k-aero
ethereal-windows-7
ethereal-angelical-light
ethereal-gothic-angel
ethereal-luminous-space
ethereal-fallen-angel
```

## Claude Code

Claude Code custom themes live in:

```text
~/.claude/themes/*.json
```

Install all generated Ethereal themes:

```sh
mkdir -p ~/.claude/themes
cp tui/claude-code/*.json ~/.claude/themes/
```

Then open Claude Code and choose a theme:

```text
/theme
```

Claude Code stores selected custom themes as:

```text
custom:<theme-slug>
```

Example:

```text
custom:ethereal-angelical-light
```

## Terminal Emulators

Most terminal TUIs inherit the terminal emulator's 16-color ANSI palette. Use the generated palette for your terminal, then TUI apps that respect ANSI colors will follow it.

Generated palettes:

```text
tui/terminal/alacritty/*.toml
tui/terminal/ghostty/*
tui/terminal/kitty/*.conf
tui/terminal/wezterm/*.lua
```

### Kitty

Copy or include a theme file from:

```text
tui/terminal/kitty/
```

Example:

```sh
include ./tui/terminal/kitty/ethereal-kerubin.conf
```

### Alacritty

Import or copy a TOML palette from:

```text
tui/terminal/alacritty/
```

### Ghostty

Copy a generated theme from:

```text
tui/terminal/ghostty/
```

### WezTerm

Use a generated Lua palette from:

```text
tui/terminal/wezterm/
```

## Notes

- opencode and Claude Code have their own theme JSON formats.
- Other TUIs usually depend on your terminal emulator colors.
- If a TUI has a custom theme format, use `tui/palettes.json` as the source palette map.
- `.opencode/` is intentionally ignored so project-local tool configuration is not committed by accident.
