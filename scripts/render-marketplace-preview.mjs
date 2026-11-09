import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Renders assets/ethereal-showcase.png: a README/Marketplace hero built from the
// real theme files. Featured themes are drawn as miniature editors (syntax,
// tabs, terminal ANSI colors, status bar) and every theme gets a swatch chip.

const root = process.cwd();
const themesDir = path.join(root, "themes");
const assetsDir = path.join(root, "assets");
const showcasePng = path.join(assetsDir, "ethereal-showcase.png");
const showcaseSvg = path.join(assetsDir, "ethereal-showcase.svg");

const width = 1440;
const margin = 60;
const gap = 32;
const winW = (width - margin * 2 - gap) / 2;
const winH = 414;
const sans = "Inter, Segoe UI, Helvetica, Arial, sans-serif";
const mono = "Cascadia Code, Cascadia Mono, Consolas, Menlo, monospace";

const order = [
	"Ethereal-Theme (Default)",
	"Ethereal-Theme (Kerubin)",
	"Ethereal-Theme (Frutiger)",
	"Ethereal-Theme (Y2K Aero)",
	"Ethereal-Theme (Chrome Angel)",
	"Ethereal-Theme (Cyber Cherub)",
	"Ethereal-Theme (Millennium Pearl)",
	"Ethereal-Theme (Windows 7)",
	"Ethereal-Theme (Angelical Light)",
	"Ethereal-Theme (Gothic Angel)",
	"Ethereal-Theme (Luminous Space)",
	"Ethereal-Theme (Fallen Angel)",
	"Ethereal-Theme (Cathedral)",
	"Ethereal-Theme (Dreamscape)",
	"Ethereal-Theme (Aurora)",
	"Ethereal-Theme (Moonlit)",
	"Ethereal-Theme (Seraphim)"
];

const featured = [
	"Ethereal-Theme (Chrome Angel)",
	"Ethereal-Theme (Cyber Cherub)",
	"Ethereal-Theme (Millennium Pearl)",
	"Ethereal-Theme (Cathedral)",
	"Ethereal-Theme (Dreamscape)",
	"Ethereal-Theme (Seraphim)"
];

// [text, role] pairs per line. Roles map to semantic token colors.
const code = [
	[["// A gentle glow, rendered in light", "comment"]],
	[["import", "keyword"], [" { ", "plain"], ["Light", "type"], [" } ", "plain"], ["from", "keyword"], [" ", "plain"], ['"./ethereal"', "string"], [";", "plain"]],
	[],
	[["export class", "keyword"], [" ", "plain"], ["Halo", "type"], ["<", "operator"], ["T", "type"], [" ", "plain"], ["extends", "keyword"], [" ", "plain"], ["Light", "type"], [">", "operator"], [" {", "plain"]],
	[["  radius ", "plain"], ["=", "operator"], [" ", "plain"], ["42", "number"], [";", "plain"]],
	[["  ", "plain"], ["async", "keyword"], [" ", "plain"], ["shine", "function"], ["(angel: ", "plain"], ["T", "type"], ["): ", "plain"], ["Promise", "type"], ["<", "operator"], ["string", "type"], [">", "operator"], [" {", "plain"]],
	[["    ", "plain"], ["const", "keyword"], [" rays ", "plain"], ["=", "operator"], [" angel.rays.", "plain"], ["filter", "function"], ["((r) ", "plain"], ["=>", "operator"], [" r ", "plain"], [">", "operator"], [" ", "plain"], ["0.5", "number"], [");", "plain"]],
	[["    ", "plain"], ["return", "keyword"], [" ", "plain"], ["`halo:${rays.length}`", "string"], [";", "plain"]],
	[["  }", "plain"]],
	[["}", "plain"]]
];

function esc(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function solid(color, background = "#000000") {
	if (!color) return undefined;
	const hex = color.toLowerCase();
	if (hex.length === 7) return hex;
	const alpha = parseInt(hex.slice(7, 9), 16) / 255;
	const channel = (value, index) => parseInt(value.slice(1 + index * 2, 3 + index * 2), 16);
	const out = [0, 1, 2].map((i) => Math.round(channel(hex, i) * alpha + channel(background, i) * (1 - alpha)));
	return `#${out.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function lum(hex) {
	const [r, g, b] = [0, 1, 2].map((i) => {
		const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function title(name) {
	return name.replace("Ethereal-Theme (", "").replace(")", "");
}

function palette(theme) {
	const c = theme.colors;
	const bg = solid(c["editor.background"]);
	const pick = (key, fallback) => solid(c[key] ?? fallback, bg) ?? fallback;
	const sem = theme.semanticTokenColors;
	return {
		bg,
		fg: pick("editor.foreground"),
		light: lum(bg) > 0.4,
		border: pick("widget.border"),
		titleBg: pick("titleBar.activeBackground"),
		titleFg: pick("titleBar.activeForeground"),
		activityBg: pick("activityBar.background"),
		activityFg: pick("activityBar.foreground"),
		activityMuted: pick("activityBar.inactiveForeground"),
		tabActiveBg: pick("tab.activeBackground"),
		tabActiveFg: pick("tab.activeForeground"),
		tabInactiveBg: pick("tab.inactiveBackground"),
		tabInactiveFg: pick("tab.inactiveForeground"),
		lineNo: pick("editorLineNumber.foreground"),
		lineNoActive: pick("editorLineNumber.activeForeground"),
		lineHighlight: pick("editor.lineHighlightBackground", c["list.hoverBackground"]),
		termBg: pick("terminal.background"),
		termFg: pick("terminal.foreground"),
		statusBg: pick("statusBar.background"),
		statusFg: pick("statusBar.foreground"),
		primary: pick("button.background"),
		primaryText: pick("button.foreground"),
		ansi: ["Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "BrightRed", "BrightGreen", "BrightYellow", "BrightBlue", "BrightMagenta", "BrightCyan"].map((n) => pick(`terminal.ansi${n}`)),
		roles: {
			plain: pick("editor.foreground"),
			comment: solid(sem.comment.foreground, bg),
			keyword: solid(sem.keyword, bg),
			string: solid(sem.string, bg),
			number: solid(sem.number, bg),
			function: solid(sem.function, bg),
			type: solid(sem.type, bg),
			operator: solid(sem.operator, bg)
		}
	};
}

function window(theme, x, y) {
	const p = palette(theme);
	const id = `w${Math.round(x)}${Math.round(y)}`;
	const activityW = 46;
	const titleH = 36;
	const tabH = 34;
	const statusH = 26;
	const panelH = 70;
	const editorTop = titleH + tabH;
	const panelTop = winH - statusH - panelH;
	const lineH = 22;
	const codeTop = editorTop + 12;
	const codeX = activityW + 62;

	const lines = code.map((tokens, index) => {
		const baseline = codeTop + index * lineH + 15;
		const spans = tokens.map(([text, role]) => `<tspan fill="${p.roles[role]}"${role === "comment" ? ' font-style="italic"' : ""}>${esc(text)}</tspan>`).join("");
		const active = index === 6;
		return `
      ${active ? `<rect x="${activityW}" y="${codeTop + index * lineH - 1}" width="${winW - activityW}" height="${lineH}" fill="${p.lineHighlight}"/>` : ""}
      <text x="${activityW + 38}" y="${baseline}" text-anchor="end" fill="${active ? p.lineNoActive : p.lineNo}" font-family="${mono}" font-size="14">${index + 1}</text>
      <text x="${codeX}" y="${baseline}" xml:space="preserve" font-family="${mono}" font-size="15.5" fill="${p.fg}">${spans}</text>`;
	}).join("");

	const squares = p.ansi.map((color, index) => `<rect x="${24 + index * 26}" y="${panelTop + 42}" width="18" height="12" rx="3" fill="${color}"/>`).join("");
	const icons = [0, 1, 2, 3].map((i) => `<rect x="14" y="${editorTop + 14 + i * 38}" width="18" height="18" rx="5" fill="${i === 0 ? p.activityFg : p.activityMuted}" opacity="${i === 0 ? 1 : 0.55}"/>`).join("");

	return `
  <g transform="translate(${x} ${y})" filter="url(#shadow)">
    <clipPath id="${id}"><rect width="${winW}" height="${winH}" rx="16"/></clipPath>
    <g clip-path="url(#${id})" font-family="${sans}">
      <rect width="${winW}" height="${winH}" fill="${p.bg}"/>
      <rect width="${winW}" height="${titleH}" fill="${p.titleBg}"/>
      <circle cx="20" cy="18" r="6" fill="${p.ansi[0]}"/><circle cx="40" cy="18" r="6" fill="${p.ansi[2]}"/><circle cx="60" cy="18" r="6" fill="${p.ansi[1]}"/>
      <text x="${winW / 2}" y="23" text-anchor="middle" fill="${p.titleFg}" font-size="13" opacity=".85">halo.ts — ${esc(title(theme.name))}</text>
      <rect y="${titleH}" width="${activityW}" height="${winH - titleH - statusH}" fill="${p.activityBg}"/>
      ${icons}
      <rect x="${activityW}" y="${titleH}" width="${winW - activityW}" height="${tabH}" fill="${p.tabInactiveBg}"/>
      <rect x="${activityW}" y="${titleH}" width="150" height="${tabH}" fill="${p.tabActiveBg}"/>
      <rect x="${activityW}" y="${titleH}" width="150" height="2" fill="${p.primary}"/>
      <text x="${activityW + 16}" y="${titleH + 22}" fill="${p.tabActiveFg}" font-size="13.5">halo.ts</text>
      <text x="${activityW + 150 + 16}" y="${titleH + 22}" fill="${p.tabInactiveFg}" font-size="13.5">ethereal.ts</text>
      <rect x="${activityW}" y="${editorTop}" width="${winW - activityW}" height="${panelTop - editorTop}" fill="${p.bg}"/>
      ${lines}
      <rect y="${panelTop}" width="${winW}" height="${panelH}" fill="${p.termBg}"/>
      <rect y="${panelTop}" width="${winW}" height="1" fill="${p.border}"/>
      <text x="24" y="${panelTop + 27}" font-family="${mono}" font-size="14" fill="${p.termFg}"><tspan fill="${p.ansi[1]}">➜</tspan> <tspan fill="${p.ansi[3]}">ethereal</tspan> <tspan fill="${p.termFg}">npm run build</tspan></text>
      ${squares}
      <rect y="${winH - statusH}" width="${winW}" height="${statusH}" fill="${p.statusBg}"/>
      <rect y="${winH - statusH}" width="132" height="${statusH}" fill="${p.primary}"/>
      <text x="14" y="${winH - 8}" fill="${p.primaryText}" font-size="12.5" font-weight="700">⎇ ${p.light ? "light" : "dark"} · main</text>
      <text x="${winW - 16}" y="${winH - 8}" text-anchor="end" fill="${p.statusFg}" font-size="12.5">TypeScript · UTF-8 · Ln 7</text>
    </g>
    <rect width="${winW}" height="${winH}" rx="16" fill="none" stroke="${p.border}" stroke-width="1.5"/>
  </g>`;
}

function chip(theme, x, y, w) {
	const p = palette(theme);
	const sem = theme.semanticTokenColors;
	const swatches = [sem.function, sem.keyword, sem.string, sem.number, sem.type].map((c) => solid(c, p.bg));
	return `
  <g transform="translate(${x} ${y})" font-family="${sans}">
    <rect width="${w}" height="64" rx="14" fill="${p.bg}" stroke="${p.border}" stroke-width="1.2"/>
    <text x="18" y="27" fill="${p.fg}" font-size="16" font-weight="700">${esc(title(theme.name))}</text>
    <text x="18" y="49" fill="${p.lineNo}" font-size="12" letter-spacing=".6">${p.light ? "LIGHT" : "DARK"}</text>
    ${swatches.map((color, i) => `<circle cx="${w - 24 - (swatches.length - 1 - i) * 22}" cy="32" r="8" fill="${color}"/>`).join("")}
  </g>`;
}

const files = (await readdir(themesDir)).filter((file) => file.endsWith(".json"));
const themes = [];
for (const file of files) themes.push(JSON.parse(await readFile(path.join(themesDir, file), "utf8")));
themes.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

const byName = (name) => themes.find((theme) => theme.name === name);
const lightCount = themes.filter((theme) => lum(solid(theme.colors["editor.background"])) > 0.4).length;
const iconData = (await readFile(path.join(assetsDir, "ethereal-icon.png"))).toString("base64");

const headerH = 210;
const gridTop = headerH;
const stripTop = gridTop + 3 * (winH + gap) + 8;
const chipCols = 4;
const chipW = (width - margin * 2 - gap * (chipCols - 1)) / chipCols;
const chipRows = Math.ceil(themes.length / chipCols);
const height = stripTop + 60 + chipRows * 80 + 70;

const windows = featured.map((name, index) => {
	const col = index % 2;
	const row = Math.floor(index / 2);
	return window(byName(name), margin + col * (winW + gap), gridTop + row * (winH + gap));
}).join("");

const chips = themes.map((theme, index) => {
	const col = index % chipCols;
	const row = Math.floor(index / chipCols);
	return chip(theme, margin + col * (chipW + gap), stripTop + 60 + row * 80, chipW);
}).join("");

const glowA = solid(palette(byName(featured[1])).primary);
const glowB = solid(palette(byName(featured[4])).primary);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
  <title id="t">Ethereal theme collection</title>
  <desc id="d">${themes.length} Ethereal themes shown as miniature editors, generated from the theme files.</desc>
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#07070d"/><stop offset=".5" stop-color="#110d1f"/><stop offset="1" stop-color="#07090f"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000000" flood-opacity=".5"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="90"/></filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#page)"/>
  <circle cx="1180" cy="260" r="260" fill="${glowA}" opacity=".16" filter="url(#blur)"/>
  <circle cx="200" cy="${stripTop}" r="300" fill="${glowB}" opacity=".13" filter="url(#blur)"/>

  <image href="data:image/png;base64,${iconData}" x="${margin}" y="52" width="104" height="104"/>
  <text x="${margin + 134}" y="108" fill="#f8fbff" font-family="${sans}" font-size="62" font-weight="800">Ethereal</text>
  <text x="${margin + 136}" y="148" fill="#cdd7e5" font-family="${sans}" font-size="25">Celestial, glossy, and Y2K-inspired themes for your whole coding space.</text>
  <text x="${margin + 136}" y="184" fill="#8f9ab0" font-family="${sans}" font-size="19">${themes.length} themes  ·  ${themes.length - lightCount} dark, ${lightCount} light  ·  VS Code, terminals, and coding agents</text>

  ${windows}

  <text x="${margin}" y="${stripTop + 28}" fill="#eef4ff" font-family="${sans}" font-size="26" font-weight="700">Every theme, fully coordinated</text>
  <text x="${margin}" y="${stripTop + 52}" fill="#8f9ab0" font-family="${sans}" font-size="16">Editor, syntax, terminal, Git, Chat and agent surfaces. Dots show function, keyword, string, number and type colors.</text>
  ${chips}
</svg>
`;

await mkdir(assetsDir, { recursive: true });
await writeFile(showcaseSvg, svg);

const { default: sharp } = await import("sharp");
await sharp(Buffer.from(svg), { density: 144 }).png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toFile(showcasePng);
console.log(`Rendered assets/ethereal-showcase.png (${themes.length} themes).`);
