/**
 * Bundled Limine-compatible CP437 bitmap fonts under `user/fonts/`.
 * Paths use `boot():/…` — the project `user/` folder is the boot volume.
 */

import { stripLimineUri } from "$lib/limine/userAssets";

export type BundledFont = {
	/** Stable id; empty string = Limine built-in (no term_font key). */
	id: string;
	label: string;
	/** Value written to `term_font` (empty = built-in). */
	liminePath: string;
	/** Basename under `user/fonts/` (also used to find preview TTF). */
	fileName: string;
	glyphSize: string;
	/** CSS `font-family` for the matching preview TTF. */
	previewFamily: string;
};

/** Preview TTFs generated from the same `.bin` glyphs (CP437 cmap). */
const previewGlob = import.meta.glob("./preview-fonts/*.ttf", {
	eager: true,
	query: "?url",
	import: "default",
}) as Record<string, string>;

const previewUrlByStem = new Map<string, string>();
for (const [key, url] of Object.entries(previewGlob)) {
	if (typeof url !== "string" || !url) continue;
	const stem = key.split("/").pop()?.replace(/\.ttf$/i, "")?.toLowerCase();
	if (stem) previewUrlByStem.set(stem, url);
}

/**
 * Curated VGA 8×16 fonts from viler-int10h/vga-text-mode-fonts.
 * `limine-default` matches Limine’s built-in (TOSH-SAT.F16).
 */
export const BUNDLED_FONTS: BundledFont[] = [
	{
		id: "",
		label: "Limine built-in",
		liminePath: "",
		fileName: "limine-default.bin",
		glyphSize: "8x16",
		previewFamily: "Limine Default",
	},
	{
		id: "limine-default",
		label: "Limine default (ToshibaSat)",
		liminePath: "boot():/fonts/limine-default.bin",
		fileName: "limine-default.bin",
		glyphSize: "8x16",
		previewFamily: "Limine Default",
	},
	{
		id: "ibm-vga8",
		label: "IBM VGA 8×16",
		liminePath: "boot():/fonts/ibm-vga8.bin",
		fileName: "ibm-vga8.bin",
		glyphSize: "8x16",
		previewFamily: "IBM VGA 8x16",
	},
	{
		id: "ibm-iso",
		label: "IBM ISO 8×16",
		liminePath: "boot():/fonts/ibm-iso.bin",
		fileName: "ibm-iso.bin",
		glyphSize: "8x16",
		previewFamily: "IBM ISO 8x16",
	},
	{
		id: "ibm-ps2-thin",
		label: "IBM PS/2 Thin",
		liminePath: "boot():/fonts/ibm-ps2-thin.bin",
		fileName: "ibm-ps2-thin.bin",
		glyphSize: "8x16",
		previewFamily: "IBM PS2 Thin",
	},
	{
		id: "ati-8x16",
		label: "ATI 8×16",
		liminePath: "boot():/fonts/ati-8x16.bin",
		fileName: "ati-8x16.bin",
		glyphSize: "8x16",
		previewFamily: "ATI 8x16",
	},
	{
		id: "dosv-437",
		label: "DOSV 437",
		liminePath: "boot():/fonts/dosv-437.bin",
		fileName: "dosv-437.bin",
		glyphSize: "8x16",
		previewFamily: "DOSV 437",
	},
	{
		id: "fatscii",
		label: "FATSCII",
		liminePath: "boot():/fonts/fatscii.bin",
		fileName: "fatscii.bin",
		glyphSize: "8x16",
		previewFamily: "FATSCII",
	},
	{
		id: "unscii-16",
		label: "Unscii 16",
		liminePath: "boot():/fonts/unscii-16.bin",
		fileName: "unscii-16.bin",
		glyphSize: "8x16",
		previewFamily: "Unscii 16",
	},
];

export function fontSelectOptions(): { value: string; label: string }[] {
	return BUNDLED_FONTS.map((f) => ({ value: f.liminePath, label: f.label }));
}

/** Match `term_font` to a bundled entry (by path or basename). */
export function resolveBundledFont(termFont: string): BundledFont {
	const trimmed = termFont.trim();
	if (!trimmed) return BUNDLED_FONTS[0];

	const exact = BUNDLED_FONTS.find((f) => f.liminePath === trimmed);
	if (exact) return exact;

	const rel = stripLimineUri(trimmed).toLowerCase();
	const base = rel.split("/").pop() ?? rel;
	const byFile = BUNDLED_FONTS.find(
		(f) =>
			f.fileName.toLowerCase() === base ||
			f.liminePath.toLowerCase().endsWith("/" + base) ||
			stripLimineUri(f.liminePath).toLowerCase() === rel,
	);
	return byFile ?? BUNDLED_FONTS[0];
}

export function previewFontUrl(font: BundledFont): string | null {
	const stem = font.fileName.replace(/\.bin$/i, "").toLowerCase();
	return previewUrlByStem.get(stem) ?? null;
}

const loadedFamilies = new Set<string>();

/** Ensure the preview TTF for this bundled font is registered with `document.fonts`. */
export async function ensurePreviewFontLoaded(font: BundledFont): Promise<string> {
	const family = font.previewFamily;
	if (typeof document === "undefined") return family;
	if (loadedFamilies.has(family)) return family;

	const url = previewFontUrl(font);
	if (!url) return family;

	try {
		const face = new FontFace(family, `url(${url})`, { style: "normal", weight: "400" });
		await face.load();
		document.fonts.add(face);
		loadedFamilies.add(family);
	} catch {
		/* keep CSS fallback */
	}
	return family;
}
