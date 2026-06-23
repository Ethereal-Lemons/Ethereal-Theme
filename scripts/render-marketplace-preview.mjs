import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const themesDir = path.join(root, "themes");
const assetsDir = path.join(root, "assets");

const order = [
	"Ethereal-Theme (Default)",
	"Ethereal-Theme (Kerubin)",
	"Ethereal-Theme (Frutiger)",
	"Ethereal-Theme (Y2K Aero)",
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

const moods = new Map([
	["Ethereal-Theme (Default)", "blue-black + pale sky"],
	["Ethereal-Theme (Kerubin)", "pink + lavender + gold"],
	["Ethereal-Theme (Frutiger)", "fresh green + aqua glass"],
	["Ethereal-Theme (Y2K Aero)", "aqua aero + electric cyan"],
	["Ethereal-Theme (Windows 7)", "blue glass + warm gold"],
	["Ethereal-Theme (Angelical Light)", "ivory + rose + soft blue"],
	["Ethereal-Theme (Gothic Angel)", "black cherry + pale rose"],
	["Ethereal-Theme (Luminous Space)", "violet void + neon mint"],
	["Ethereal-Theme (Fallen Angel)", "black ash + white glow"],
	["Ethereal-Theme (Cathedral)", "stained glass + sapphire + ruby"],
	["Ethereal-Theme (Dreamscape)", "twilight purple + neon pink"],
	["Ethereal-Theme (Aurora)", "arctic void + aurora green"],
	["Ethereal-Theme (Moonlit)", "midnight slate + lunar blue"],
	["Ethereal-Theme (Seraphim)", "obsidian amber + solar gold"]
]);

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
	if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) return hex;
	if (hex.length === 7) return hex;
	const alpha = parseInt(hex.slice(7, 9), 16) / 255;
	const fg = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
	const bg = [1, 3, 5].map((index) => parseInt(background.slice(index, index + 2), 16));
	const out = fg.map((channel, index) => Math.round(channel * alpha + bg[index] * (1 - alpha)));
	return `#${out.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function token(theme, names, fallback) {
	for (const name of names) {
		const entry = theme.tokenColors.find((item) => item.name === name);
		if (entry?.settings?.foreground) return solid(entry.settings.foreground, theme.colors["editor.background"]);
	}
	return solid(fallback, theme.colors["editor.background"]);
}

function title(name) {
	return name.replace("Ethereal-Theme (", "").replace(")", "");
}

function card(theme, index) {
	const col = index % 3;
	const row = Math.floor(index / 3);
	const x = 90 + col * 382;
	const y = 230 + row * 148;
	const c = theme.colors;
	const bg = solid(c["editor.background"]);
	const fg = solid(c["editor.foreground"], bg);
	const muted = solid(c["sideBar.foreground"] || c["activityBar.inactiveForeground"], bg);
	const border = solid(c["widget.border"] || c["sideBar.border"] || c["editorCursor.foreground"], bg);
	const swatches = [
		solid(c["editorCursor.foreground"], bg),
		solid(c["list.highlightForeground"] || c["button.hoverBackground"], bg),
		token(theme, ["Keyword, Storage"], c["editorCursor.foreground"])
	];
	return `
    <g transform="translate(${x} ${y})">
      <rect width="336" height="128" rx="18" fill="${bg}" stroke="${border}" stroke-width="1.4" opacity=".97"/>
      <text x="26" y="42" fill="${fg}" font-size="24" font-weight="750">${esc(title(theme.name))}</text>
      <text x="26" y="76" fill="${muted}" font-size="17">${esc(moods.get(theme.name) || "soft atmospheric palette")}</text>
      ${swatches.map((swatch, swatchIndex) => `<circle cx="${242 + swatchIndex * 34}" cy="43" r="13" fill="${swatch}"/>`).join("\n      ")}
    </g>`;
}

const files = await readdir(themesDir);
const themes = [];
for (const file of files.filter((file) => file.endsWith(".json"))) {
	const theme = JSON.parse(await readFile(path.join(themesDir, file), "utf8"));
	themes.push(theme);
}
themes.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

const defaultTheme = themes.find((theme) => theme.name === "Ethereal-Theme (Default)") ?? themes[0];
const kerubin = themes.find((theme) => theme.name === "Ethereal-Theme (Kerubin)") ?? defaultTheme;
const angelical = themes.find((theme) => theme.name === "Ethereal-Theme (Angelical Light)") ?? defaultTheme;
const y2k = themes.find((theme) => theme.name === "Ethereal-Theme (Y2K Aero)") ?? defaultTheme;
const iconData = (await readFile(path.join(assetsDir, "ethereal-icon.png"))).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1040" viewBox="0 0 1280 1040" role="img" aria-labelledby="title desc">
  <title id="title">Ethereal theme preview</title>
  <desc id="desc">A marketplace preview generated from the current Ethereal theme colors.</desc>
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1280" y2="1040" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${solid(defaultTheme.colors["editor.background"])}"/>
      <stop offset=".38" stop-color="${solid(kerubin.colors["editor.background"])}"/>
      <stop offset=".7" stop-color="${solid(y2k.colors["editor.background"])}"/>
      <stop offset="1" stop-color="${solid(defaultTheme.colors["editor.background"])}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity=".34"/>
    </filter>
  </defs>
  <rect width="1280" height="1040" fill="url(#page)"/>
  <circle cx="1000" cy="116" r="226" fill="${solid(kerubin.colors["editorCursor.foreground"], kerubin.colors["editor.background"])}" opacity=".14"/>
  <circle cx="1120" cy="430" r="260" fill="${solid(y2k.colors["editorCursor.foreground"], y2k.colors["editor.background"])}" opacity=".14"/>
  <circle cx="238" cy="536" r="220" fill="${solid(themes.find((theme) => theme.name.includes("Frutiger"))?.colors["editorCursor.foreground"] ?? "#00ffaa")}" opacity=".08"/>

  <g filter="url(#shadow)">
    <image href="data:image/png;base64,${iconData}" x="82" y="58" width="112" height="112"/>
  </g>

  <text x="230" y="100" fill="#f8fbff" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="58" font-weight="800">Ethereal</text>
  <text x="232" y="146" fill="#cdd7e5" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="25">Celestial, retro, aero, and luminous themes for Visual Studio Code.</text>

  <g font-family="Inter, Segoe UI, Arial, sans-serif" filter="url(#shadow)">
    ${themes.map(card).join("\n")}
  </g>

  <text x="90" y="990" fill="#eef4ff" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="22" font-weight="650">Fourteen themes. One soft visual system. No runtime code.</text>
</svg>
`;

await mkdir(assetsDir, { recursive: true });
await writeFile(path.join(assetsDir, "ethereal-preview.svg"), svg);
try {
	execFileSync("magick", [
		path.join(assetsDir, "ethereal-preview.svg"),
		"-resize",
		"1280x1040",
		"-depth",
		"8",
		path.join(assetsDir, "ethereal-preview-aqua.png")
	], { stdio: "inherit" });
	console.log("Rendered assets/ethereal-preview-aqua.png from current theme colors.");
} catch (err) {
	console.warn("Warning: ImageMagick ('magick') command was not found or failed. Skipping PNG preview generation. SVG preview has been written successfully.");
}
