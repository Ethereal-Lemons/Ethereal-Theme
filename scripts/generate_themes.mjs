import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "themes", "Ethereal-LuminousSpace-color-theme.json");

const palettes = {
	Cathedral: {
		name: "Ethereal-Theme (Cathedral)",
		fileName: "Ethereal-Cathedral",
		bg: "#0d0d12",
		bgDark: "#07070a",
		bgActive: "#1b1b26",
		bgInput: "#14141c",
		fg: "#eaeaf2",
		fgMuted: "#8c8c9e",
		comment: "#606073",
		border: "#2e2e3d",
		primary: "#3b82f6",
		primaryHover: "#60a5fa",
		keyword: "#ef4444",
		string: "#10b981",
		number: "#f59e0b",
		type: "#8b5cf6",
		error: "#ef4444"
	},
	Dreamscape: {
		name: "Ethereal-Theme (Dreamscape)",
		fileName: "Ethereal-Dreamscape",
		bg: "#141026",
		bgDark: "#0e0b1c",
		bgActive: "#231d3f",
		bgInput: "#1a1532",
		fg: "#f4effc",
		fgMuted: "#a89dbf",
		comment: "#7d729c",
		border: "#42326b",
		primary: "#ffabcc",
		primaryHover: "#ffccd9",
		keyword: "#ffcbba",
		string: "#baffec",
		number: "#dec9ff",
		type: "#89ddff",
		error: "#ff7096"
	},
	Aurora: {
		name: "Ethereal-Theme (Aurora)",
		fileName: "Ethereal-Aurora",
		bg: "#060c0e",
		bgDark: "#030607",
		bgActive: "#101e22",
		bgInput: "#0a1518",
		fg: "#e2ecef",
		fgMuted: "#8da1a6",
		comment: "#5b757c",
		border: "#253d42",
		primary: "#00ffcc",
		primaryHover: "#5cffe2",
		keyword: "#d1a3ff",
		string: "#8effd8",
		number: "#ffcbba",
		type: "#82aaff",
		error: "#ff7096"
	},
	Moonlit: {
		name: "Ethereal-Theme (Moonlit)",
		fileName: "Ethereal-Moonlit",
		bg: "#0a0d14",
		bgDark: "#06080d",
		bgActive: "#131824",
		bgInput: "#0e121b",
		fg: "#e6ebf5",
		fgMuted: "#93a0b5",
		comment: "#6a768c",
		border: "#2c3545",
		primary: "#a5d6ff",
		primaryHover: "#cbe5ff",
		keyword: "#d2ccff",
		string: "#a5f3ff",
		number: "#ffccd9",
		type: "#89ddff",
		error: "#ff7096"
	},
	Seraphim: {
		name: "Ethereal-Theme (Seraphim)",
		fileName: "Ethereal-Seraphim",
		bg: "#0e0c0a",
		bgDark: "#090807",
		bgActive: "#181411",
		bgInput: "#13100e",
		fg: "#f4eae0",
		fgMuted: "#b5a296",
		comment: "#8a7b75",
		border: "#3d332e",
		primary: "#ffd700",
		primaryHover: "#ffe57f",
		keyword: "#ffab91",
		string: "#ffe599",
		number: "#f59e0b",
		type: "#e38e65",
		error: "#ff7675"
	}
};

async function main() {
	const templateContent = await readFile(templatePath, "utf8");
	const template = JSON.parse(templateContent);

	for (const [key, palette] of Object.entries(palettes)) {
		// Deep clone
		const theme = JSON.parse(JSON.stringify(template));
		theme.name = palette.name;

		const colorMap = {
			"#0d0b1a": palette.bg,
			"#080712": palette.bgDark,
			"#1e1935": palette.bgActive,
			"#1e193c": palette.bgActive,
			"#141126": palette.bgInput,
			"#e0ddf5": palette.fg,
			"#a29fc2": palette.fgMuted,
			"#6c698f": palette.comment,
			"#433b70": palette.border,
			"#00ffd2": palette.primary,
			"#3cffdc": palette.primaryHover,
			"#cf9dff": palette.keyword,
			"#bfdbfe": palette.type,
			"#ff9de0": palette.error
		};

		// Helper to replace colors with mapping
		function mapColor(value) {
			if (typeof value !== "string") return value;
			const hex = value.toLowerCase();
			if (!hex.startsWith("#")) return value;

			// Look up 7-character prefix
			const prefix = hex.slice(0, 7);
			if (colorMap[prefix]) {
				const suffix = hex.slice(7); // Keep transparency/alpha suffix
				return colorMap[prefix] + suffix;
			}
			return value;
		}

		// Update colors block
		for (const [colorKey, colorVal] of Object.entries(theme.colors)) {
			theme.colors[colorKey] = mapColor(colorVal);
		}

		// Update tokenColors block
		for (const token of theme.tokenColors) {
			if (!token.settings || !token.settings.foreground) continue;

			const name = token.name || "";
			const fg = token.settings.foreground.toLowerCase();

			// Handle #ffffff strings & success-inserted block
			if (
				fg === "#ffffff" &&
				(name.includes("String, Symbols") ||
					name.includes("Inserted") ||
					name.includes("JSON Key - Level 2") ||
					name.includes("JSON Key - Level 8"))
			) {
				token.settings.foreground = palette.string;
				continue;
			}

			// Handle #ffffff defaults or others
			if (fg === "#ffffff") {
				continue;
			}

			// Map normal colors
			token.settings.foreground = mapColor(token.settings.foreground);
		}

		const outputPath = path.join(root, "themes", `${palette.fileName}-color-theme.json`);
		await writeFile(outputPath, JSON.stringify(theme, null, "\t") + "\n");
		console.log(`Generated ${outputPath}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
