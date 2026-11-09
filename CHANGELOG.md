# Changelog

All notable changes to Ethereal will be documented in this file.

## Unreleased

- Upgraded all fourteen earlier themes to the full workbench treatment: complete integrated-terminal ANSI palettes, semantic syntax colors, Git, diff, debug, test, notebook, Chat and Agent colors.
- Moved every palette into `scripts/palettes.mjs` so all seventeen themes build from one generator.
- Added a build-time contrast audit (WCAG AA for text) that fails the build on unreadable comments, tabs, status bars and terminal colors.
- Raised comment, muted-text, inactive-tab and line-number contrast across the collection, and added distinct string and operator colors to themes that previously used white.

## 0.0.5

- Added three fully coordinated Y2K-inspired themes:
  - Ethereal-Theme (Chrome Angel)
  - Ethereal-Theme (Cyber Cherub)
  - Ethereal-Theme (Millennium Pearl)
- Added complete integrated-terminal ANSI palettes, semantic syntax colors, and current Chat and Agent UI colors to the new themes.
- Added matching opencode, Claude Code, Alacritty, Ghostty, Kitty, and WezTerm palettes.
- Improved light-palette detection and ANSI readability in the companion-theme exporter.
- Reworked the Marketplace README and preview around installation, theme discovery, and the user experience.

## 0.0.4

- Added Cathedral, Dreamscape, Aurora, Moonlit, and Seraphim.
- Expanded the Marketplace preview and generated companion palettes to fourteen themes.

## 0.0.3

- Added Ethereal-Theme (Gothic Angel).
- Added Ethereal-Theme (Luminous Space).
- Added Ethereal-Theme (Fallen Angel).
- Updated the Marketplace README and preview image for the expanded nine-theme collection.
- Regenerated generated TUI palettes for all current themes.

## 0.0.2

- Refined Ethereal-Theme (Y2K Aero) with a more solid midnight/aqua base.
- Added terminal, chat, and interactive color support for Y2K Aero.
- Regenerated generated TUI palettes for the updated theme colors.

## 0.0.1

- Initial Marketplace-ready release.
- Added six VS Code color themes:
  - Ethereal-Theme (Default)
  - Ethereal-Theme (Kerubin)
  - Ethereal-Theme (Frutiger)
  - Ethereal-Theme (Y2K Aero)
  - Ethereal-Theme (Windows 7)
  - Ethereal-Theme (Angelical Light)
- Added generated opencode, Claude Code, and terminal palette exports for TUI workflows.
- Added Marketplace icon and gallery metadata.
