import type { DesignConfig } from "./types";

/** Limine gterm defaults when no wallpaper is loaded. */
export const NO_WALLPAPER_TERM = {
	term_background: "00000000",
	term_margin: "0",
	term_margin_gradient: "0",
} as const;

/** Limine gterm defaults when a wallpaper is loaded (and keys unset). */
export const WITH_WALLPAPER_TERM = {
	term_background: "80000000",
	term_margin: "64",
	term_margin_gradient: "4",
} as const;

export function hasWallpaper(config: DesignConfig): boolean {
	return config.wallpaper.some((p) => p.trim().length > 0);
}

/** Effective terminal chrome matching Limine `gterm_parse_config`. */
export function getEffectiveTermChrome(config: DesignConfig): {
	term_background: string;
	term_margin: number;
	term_margin_gradient: number;
} {
	const wp = hasWallpaper(config);
	const defaults = wp ? WITH_WALLPAPER_TERM : NO_WALLPAPER_TERM;

	const bg =
		config.term_background.trim() !== ""
			? config.term_background
			: defaults.term_background;

	const marginRaw = config.term_margin.trim();
	const gradientRaw = config.term_margin_gradient.trim();

	let margin = marginRaw !== "" ? Number(marginRaw) : Number(defaults.term_margin);
	let gradient =
		gradientRaw !== "" ? Number(gradientRaw) : Number(defaults.term_margin_gradient);

	if (Number.isNaN(margin) || margin < 0) margin = Number(defaults.term_margin);
	if (Number.isNaN(gradient) || gradient < 0) gradient = Number(defaults.term_margin_gradient);
	if (gradient > margin) gradient = margin;

	return {
		term_background: bg,
		term_margin: margin,
		term_margin_gradient: gradient,
	};
}

/**
 * When wallpaper presence flips, retarget margin/bg/gradient if they still
 * match the previous wallpaper-mode defaults (Limine's implicit keys).
 */
export function syncWallpaperChromeDefaults(
	config: DesignConfig,
	hadWallpaper: boolean,
	hasWallpaperNow: boolean,
): Partial<DesignConfig> {
	if (hadWallpaper === hasWallpaperNow) return {};

	const from = hadWallpaper ? WITH_WALLPAPER_TERM : NO_WALLPAPER_TERM;
	const to = hasWallpaperNow ? WITH_WALLPAPER_TERM : NO_WALLPAPER_TERM;
	const patch: Partial<DesignConfig> = {};

	if (config.term_background === from.term_background) {
		patch.term_background = to.term_background;
	}
	if (config.term_margin === from.term_margin) {
		patch.term_margin = to.term_margin;
	}
	if (config.term_margin_gradient === from.term_margin_gradient) {
		patch.term_margin_gradient = to.term_margin_gradient;
	}

	return patch;
}

/** Effective default for omit-defaults serialization. */
export function effectiveDefaultForKey(
	key: keyof DesignConfig,
	config: DesignConfig,
): string | string[] | undefined {
	const wp = hasWallpaper(config);
	const term = wp ? WITH_WALLPAPER_TERM : NO_WALLPAPER_TERM;
	if (key === "term_background") return term.term_background;
	if (key === "term_margin") return term.term_margin;
	if (key === "term_margin_gradient") return term.term_margin_gradient;
	return undefined;
}
