import { OPTION_ALIASES } from "./aliases";
import { DESIGN_FIELDS } from "./schema";
import {
	createDefaultDesignConfig,
	type DesignConfig,
	type YesNo,
} from "./types";

const DESIGN_KEYS = new Set<string>(Object.keys(createDefaultDesignConfig()));

const YES_NO_KEYS = new Set(
	DESIGN_FIELDS.filter((f) => f.type === "yesno").map((f) => f.key),
);

/** Resolve a config option name (case-insensitive) to a DesignConfig key. */
export function resolveOptionKey(raw: string): keyof DesignConfig | null {
	const key = raw.trim().toLowerCase();
	const canonical = OPTION_ALIASES[key] ?? key;
	if (!DESIGN_KEYS.has(canonical)) return null;
	return canonical as keyof DesignConfig;
}

/** Parse limine.conf global option lines into a DesignConfig (aliases normalized). */
export function parseDesignConfig(source: string): DesignConfig {
	const config = createDefaultDesignConfig();
	const wallpapers: string[] = [];

	for (const line of source.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		// Skip menu entries
		if (trimmed.startsWith("/")) continue;

		const colon = trimmed.indexOf(":");
		if (colon <= 0) continue;

		const rawKey = trimmed.slice(0, colon).trim();
		const value = trimmed.slice(colon + 1).trim();
		const key = resolveOptionKey(rawKey);
		if (!key) continue;

		if (key === "wallpaper") {
			if (value) wallpapers.push(value);
			continue;
		}

		if (YES_NO_KEYS.has(key)) {
			const lowered = value.toLowerCase();
			if (lowered === "yes" || lowered === "no") {
				(config as Record<string, unknown>)[key] = lowered as YesNo;
			}
			continue;
		}

		(config as Record<string, unknown>)[key] = value;
	}

	config.wallpaper = wallpapers;
	return config;
}
