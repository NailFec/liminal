/** Parse RRGGBB or Limine TTRRGGBB (TT = transparency) into CSS colors. */

export function normalizeHex(input: string): string {
	return input.trim().replace(/^#/, "").toLowerCase();
}

export function isValidRgb(hex: string): boolean {
	return /^[0-9a-f]{6}$/i.test(normalizeHex(hex));
}

export function isValidRgbAlpha(hex: string): boolean {
	const n = normalizeHex(hex);
	return /^[0-9a-f]{6}$/i.test(n) || /^[0-9a-f]{8}$/i.test(n);
}

export function toCssColor(hex: string, fallback = "#000000"): string {
	const n = normalizeHex(hex);
	if (/^[0-9a-f]{6}$/i.test(n)) {
		return `#${n}`;
	}
	if (/^[0-9a-f]{8}$/i.test(n)) {
		// Limine TTRRGGBB: TT is transparency (0x00 = opaque, 0xff = fully transparent),
		// matching gterm colour_blend (alpha = 255 - A(fg)).
		const transparency = parseInt(n.slice(0, 2), 16) / 255;
		const opacity = 1 - transparency;
		const r = n.slice(2, 4);
		const g = n.slice(4, 6);
		const b = n.slice(6, 8);
		return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${opacity.toFixed(3)})`;
	}
	return fallback;
}

/** RGB only (ignore Limine TT transparency) — used for reverse-video glyphs. */
export function toOpaqueCssColor(hex: string, fallback = "#000000"): string {
	const n = normalizeHex(hex);
	if (/^[0-9a-f]{8}$/i.test(n)) return `#${n.slice(2)}`;
	if (/^[0-9a-f]{6}$/i.test(n)) return `#${n}`;
	return fallback;
}

/** ANSI palette colour by index (0–7). Missing slots fall back to Limine defaults. */
export function paletteColor(palette: string, index: number, fallback: string): string {
	const colours = parsePalette(palette);
	const hex = colours[index];
	return hex ? `#${hex}` : fallback;
}

/** Strip alpha for native color input (needs #RRGGBB). */
export function toColorInputValue(hex: string, fallback = "000000"): string {
	const n = normalizeHex(hex);
	if (/^[0-9a-f]{8}$/i.test(n)) {
		return `#${n.slice(2)}`;
	}
	if (/^[0-9a-f]{6}$/i.test(n)) {
		return `#${n}`;
	}
	return `#${fallback}`;
}

export function fromColorInputValue(rgb: string, previous = ""): string {
	const next = normalizeHex(rgb);
	const prev = normalizeHex(previous);
	if (/^[0-9a-f]{8}$/i.test(prev)) {
		return `${prev.slice(0, 2)}${next}`;
	}
	return next;
}

/** Derive bright help colour by adding 0x55 per channel (Limine behaviour). */
export function deriveBrightHelpColour(helpColour: string): string {
	const n = normalizeHex(helpColour);
	if (!/^[0-9a-f]{6}$/i.test(n)) {
		return "55ff55";
	}
	const bump = (ch: string) => Math.min(0xff, parseInt(ch, 16) + 0x55).toString(16).padStart(2, "0");
	return `${bump(n.slice(0, 2))}${bump(n.slice(2, 4))}${bump(n.slice(4, 6))}`;
}

export function parsePalette(palette: string): string[] {
	return palette
		.split(";")
		.map((c) => normalizeHex(c))
		.filter((c) => /^[0-9a-f]{6}$/i.test(c));
}

export function parseResolution(value: string): { width: number; height: number } | null {
	const m = value.trim().match(/^(\d+)\s*[xX]\s*(\d+)$/);
	if (!m) return null;
	const width = Number(m[1]);
	const height = Number(m[2]);
	if (!width || !height) return null;
	return { width, height };
}
