import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const themeDir = path.join(root, "themes");

const tokenMap = {
	comment: ["Comment"],
	keyword: ["Keyword, Storage"],
	function: ["Function, Special Method", "entity.name.method.js"],
	variable: ["Variables"],
	string: ["String, Symbols, Inherited Class, Markup Heading"],
	number: ["Number, Constant, Function Argument, Tag Attribute, Embedded"],
	type: ["Class, Support", "Entity Types"],
	operator: ["Operator, Misc, Punctuation"],
	punctuation: ["Operator, Misc, Punctuation"],
	error: ["Invalid", "Deleted"],
	success: ["Inserted", "String, Symbols, Inherited Class, Markup Heading"],
	warning: ["Class, Support", "Markup - Underline"],
	accent: ["Regular Expressions", "Escape Characters"]
};

function slugify(name) {
	return name
		.replace(/^Ethereal-Theme\s*/i, "Ethereal ")
		.replace(/[()]/g, "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function hexToRgb(hex) {
	const raw = hex.replace("#", "");
	return {
		r: parseInt(raw.slice(0, 2), 16),
		g: parseInt(raw.slice(2, 4), 16),
		b: parseInt(raw.slice(4, 6), 16),
		a: raw.length >= 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1
	};
}

function rgbToHex({ r, g, b }) {
	const channel = (value) => Math.round(value).toString(16).padStart(2, "0");
	return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function solid(color, background = "#000000") {
	if (!color) return undefined;
	if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(color)) return color;
	const fg = hexToRgb(color);
	if (fg.a === 1) return color.slice(0, 7).toLowerCase();
	const bg = hexToRgb(background);
	return rgbToHex({
		r: fg.r * fg.a + bg.r * (1 - fg.a),
		g: fg.g * fg.a + bg.g * (1 - fg.a),
		b: fg.b * fg.a + bg.b * (1 - fg.a)
	});
}

function pickColor(theme, keys, fallback) {
	for (const key of keys) {
		const entry = theme.tokenColors.find((token) => token.name === key);
		if (entry?.settings?.foreground) return solid(entry.settings.foreground, theme.colors["editor.background"]);
	}
	return solid(fallback, theme.colors["editor.background"]);
}

function paletteFromTheme(theme) {
	const c = theme.colors;
	const background = solid(c["editor.background"]);
	const panel = solid(c["sideBar.background"] || c["panel.background"] || c["editor.lineHighlightBackground"], background);
	const element = solid(c["input.background"] || c["tab.activeBackground"] || c["editor.lineHighlightBackground"], background);
	const selection = solid(c["editor.selectionBackground"], background);
	const text = solid(c["editor.foreground"], background);
	const muted = solid(c["activityBar.inactiveForeground"] || c["sideBar.foreground"], background);
	const primary = solid(c["editorCursor.foreground"] || c["activityBar.foreground"] || c["button.background"], background);
	const secondary = solid(c["list.highlightForeground"] || primary, background);
	const border = solid(c["widget.border"] || c["sideBar.border"], background);

	const tokens = Object.fromEntries(
		Object.entries(tokenMap).map(([key, names]) => [key, pickColor(theme, names, primary)])
	);

	return {
		name: theme.name,
		slug: slugify(theme.name),
		appearance: theme.colors["editor.background"]?.toLowerCase() === "#fffaf3" ? "light" : "dark",
		background,
		panel,
		element,
		selection,
		text,
		muted,
		primary,
		secondary,
		border,
		tokens
	};
}

function opencodeTheme(p) {
	return {
		$schema: "https://opencode.ai/theme.json",
		defs: {
			bg: p.background,
			panel: p.panel,
			element: p.element,
			text: p.text,
			muted: p.muted,
			primary: p.primary,
			secondary: p.secondary,
			border: p.border,
			error: p.tokens.error,
			warning: p.tokens.warning,
			success: p.tokens.success
		},
		theme: {
			primary: "primary",
			secondary: "secondary",
			accent: p.tokens.accent,
			error: "error",
			warning: "warning",
			success: "success",
			info: "secondary",
			text: "text",
			textMuted: "muted",
			background: "bg",
			backgroundPanel: "panel",
			backgroundElement: "element",
			border: "border",
			borderActive: "primary",
			borderSubtle: "border",
			diffAdded: p.tokens.success,
			diffRemoved: p.tokens.error,
			diffContext: "muted",
			diffHunkHeader: "secondary",
			diffHighlightAdded: p.tokens.success,
			diffHighlightRemoved: p.tokens.error,
			diffAddedBg: p.appearance === "light" ? "#eef8ef" : "#123026",
			diffRemovedBg: p.appearance === "light" ? "#fff0f3" : "#321621",
			diffContextBg: "panel",
			diffLineNumber: "muted",
			diffAddedLineNumberBg: p.appearance === "light" ? "#e3f3e7" : "#10261f",
			diffRemovedLineNumberBg: p.appearance === "light" ? "#f9e1e8" : "#2a121b",
			markdownText: "text",
			markdownHeading: "primary",
			markdownLink: "secondary",
			markdownLinkText: p.tokens.accent,
			markdownCode: p.tokens.string,
			markdownBlockQuote: "muted",
			markdownEmph: p.tokens.warning,
			markdownStrong: p.tokens.warning,
			markdownHorizontalRule: "border",
			markdownListItem: "primary",
			markdownListEnumeration: "secondary",
			markdownImage: "secondary",
			markdownImageText: p.tokens.accent,
			markdownCodeBlock: "text",
			syntaxComment: p.tokens.comment,
			syntaxKeyword: p.tokens.keyword,
			syntaxFunction: p.tokens.function,
			syntaxVariable: p.tokens.variable,
			syntaxString: p.tokens.string,
			syntaxNumber: p.tokens.number,
			syntaxType: p.tokens.type,
			syntaxOperator: p.tokens.operator,
			syntaxPunctuation: p.tokens.punctuation
		}
	};
}

function claudeTheme(p) {
	return {
		name: p.name,
		base: p.appearance === "light" ? "light" : "dark",
		overrides: {
			claude: p.primary,
			claudeShimmer: p.secondary,
			text: p.text,
			inverseText: p.background,
			inactive: p.muted,
			inactiveShimmer: p.secondary,
			subtle: p.border,
			suggestion: p.selection,
			permission: p.primary,
			permissionShimmer: p.secondary,
			remember: p.tokens.warning,
			success: p.tokens.success,
			error: p.tokens.error,
			warning: p.tokens.warning,
			warningShimmer: p.tokens.number,
			merged: p.tokens.accent,
			promptBorder: p.primary,
			promptBorderShimmer: p.secondary,
			planMode: p.secondary,
			autoAccept: p.tokens.success,
			bashBorder: p.tokens.accent,
			ide: p.tokens.function,
			fastMode: p.tokens.number,
			fastModeShimmer: p.tokens.warning,
			diffAdded: p.appearance === "light" ? "#eef8ef" : "#123026",
			diffRemoved: p.appearance === "light" ? "#fff0f3" : "#321621",
			diffAddedDimmed: p.appearance === "light" ? "#f6fbf7" : "#0f211b",
			diffRemovedDimmed: p.appearance === "light" ? "#fff7f9" : "#241018",
			diffAddedWord: p.tokens.success,
			diffRemovedWord: p.tokens.error,
			userMessageBackground: p.panel,
			userMessageBackgroundHover: p.element,
			messageActionsBackground: p.selection,
			bashMessageBackgroundColor: p.element,
			memoryBackgroundColor: p.element,
			selectionBg: p.selection,
			rate_limit_fill: p.primary,
			rate_limit_empty: p.border,
			briefLabelYou: p.secondary,
			briefLabelClaude: p.primary,
			red_FOR_SUBAGENTS_ONLY: p.tokens.error,
			blue_FOR_SUBAGENTS_ONLY: p.tokens.function,
			green_FOR_SUBAGENTS_ONLY: p.tokens.success,
			yellow_FOR_SUBAGENTS_ONLY: p.tokens.warning,
			purple_FOR_SUBAGENTS_ONLY: p.tokens.keyword,
			orange_FOR_SUBAGENTS_ONLY: p.tokens.number,
			pink_FOR_SUBAGENTS_ONLY: p.primary,
			cyan_FOR_SUBAGENTS_ONLY: p.tokens.accent,
			rainbow_red: p.tokens.error,
			rainbow_orange: p.tokens.number,
			rainbow_yellow: p.tokens.warning,
			rainbow_green: p.tokens.success,
			rainbow_blue: p.tokens.function,
			rainbow_indigo: p.tokens.keyword,
			rainbow_violet: p.primary
		}
	};
}

function ansiPalette(p) {
	return {
		black: p.appearance === "light" ? "#f4eadf" : p.background,
		red: p.tokens.error,
		green: p.tokens.success,
		yellow: p.tokens.warning,
		blue: p.tokens.function,
		magenta: p.primary,
		cyan: p.tokens.accent,
		white: p.text,
		brightBlack: p.muted,
		brightRed: p.tokens.error,
		brightGreen: p.tokens.success,
		brightYellow: p.tokens.number,
		brightBlue: p.secondary,
		brightMagenta: p.tokens.keyword,
		brightCyan: p.tokens.accent,
		brightWhite: p.appearance === "light" ? "#ffffff" : "#ffffff"
	};
}

function kittyTheme(p) {
	const a = ansiPalette(p);
	return [
		`# ${p.name}`,
		`foreground ${p.text}`,
		`background ${p.background}`,
		`selection_foreground ${p.text}`,
		`selection_background ${p.selection}`,
		`cursor ${p.primary}`,
		`cursor_text_color ${p.background}`,
		`color0 ${a.black}`,
		`color1 ${a.red}`,
		`color2 ${a.green}`,
		`color3 ${a.yellow}`,
		`color4 ${a.blue}`,
		`color5 ${a.magenta}`,
		`color6 ${a.cyan}`,
		`color7 ${a.white}`,
		`color8 ${a.brightBlack}`,
		`color9 ${a.brightRed}`,
		`color10 ${a.brightGreen}`,
		`color11 ${a.brightYellow}`,
		`color12 ${a.brightBlue}`,
		`color13 ${a.brightMagenta}`,
		`color14 ${a.brightCyan}`,
		`color15 ${a.brightWhite}`,
		""
	].join("\n");
}

function alacrittyTheme(p) {
	const a = ansiPalette(p);
	return [
		`# ${p.name}`,
		"[colors.primary]",
		`background = "${p.background}"`,
		`foreground = "${p.text}"`,
		"",
		"[colors.cursor]",
		`text = "${p.background}"`,
		`cursor = "${p.primary}"`,
		"",
		"[colors.selection]",
		`text = "${p.text}"`,
		`background = "${p.selection}"`,
		"",
		"[colors.normal]",
		`black = "${a.black}"`,
		`red = "${a.red}"`,
		`green = "${a.green}"`,
		`yellow = "${a.yellow}"`,
		`blue = "${a.blue}"`,
		`magenta = "${a.magenta}"`,
		`cyan = "${a.cyan}"`,
		`white = "${a.white}"`,
		"",
		"[colors.bright]",
		`black = "${a.brightBlack}"`,
		`red = "${a.brightRed}"`,
		`green = "${a.brightGreen}"`,
		`yellow = "${a.brightYellow}"`,
		`blue = "${a.brightBlue}"`,
		`magenta = "${a.brightMagenta}"`,
		`cyan = "${a.brightCyan}"`,
		`white = "${a.brightWhite}"`,
		""
	].join("\n");
}

function ghosttyTheme(p) {
	const a = Object.values(ansiPalette(p));
	return [
		`# ${p.name}`,
		`background = ${p.background}`,
		`foreground = ${p.text}`,
		`cursor-color = ${p.primary}`,
		`selection-background = ${p.selection}`,
		...a.map((color, index) => `palette = ${index}=${color}`),
		""
	].join("\n");
}

function weztermTheme(p) {
	const a = ansiPalette(p);
	return [
		`-- ${p.name}`,
		"return {",
		`  foreground = "${p.text}",`,
		`  background = "${p.background}",`,
		`  cursor_bg = "${p.primary}",`,
		`  cursor_fg = "${p.background}",`,
		`  selection_fg = "${p.text}",`,
		`  selection_bg = "${p.selection}",`,
		`  ansi = { "${a.black}", "${a.red}", "${a.green}", "${a.yellow}", "${a.blue}", "${a.magenta}", "${a.cyan}", "${a.white}" },`,
		`  brights = { "${a.brightBlack}", "${a.brightRed}", "${a.brightGreen}", "${a.brightYellow}", "${a.brightBlue}", "${a.brightMagenta}", "${a.brightCyan}", "${a.brightWhite}" },`,
		"}",
		""
	].join("\n");
}

async function writeJson(file, value) {
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(file, value) {
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, value);
}

const files = (await readdir(themeDir)).filter((file) => file.endsWith(".json")).sort();
const palettes = [];

for (const file of files) {
	const theme = JSON.parse(await readFile(path.join(themeDir, file), "utf8"));
	const palette = paletteFromTheme(theme);
	palettes.push(palette);

	await writeJson(path.join(root, "tui", "opencode", "themes", `${palette.slug}.json`), opencodeTheme(palette));
	await writeJson(path.join(root, "tui", "claude-code", `${palette.slug}.json`), claudeTheme(palette));
	await writeText(path.join(root, "tui", "terminal", "kitty", `${palette.slug}.conf`), kittyTheme(palette));
	await writeText(path.join(root, "tui", "terminal", "alacritty", `${palette.slug}.toml`), alacrittyTheme(palette));
	await writeText(path.join(root, "tui", "terminal", "ghostty", `${palette.slug}`), ghosttyTheme(palette));
	await writeText(path.join(root, "tui", "terminal", "wezterm", `${palette.slug}.lua`), weztermTheme(palette));
}

await writeJson(path.join(root, "tui", "palettes.json"), palettes);

console.log(`Exported ${palettes.length} themes for opencode, Claude Code, and terminal TUIs.`);
