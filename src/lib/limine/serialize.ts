import { DEFAULT_DESIGN_CONFIG, type DesignConfig } from "./types";
import { DESIGN_FIELDS } from "./schema";

function isDefault(key: keyof DesignConfig, value: DesignConfig[keyof DesignConfig]): boolean {
	const def = DEFAULT_DESIGN_CONFIG[key];
	if (Array.isArray(value) && Array.isArray(def)) {
		return value.length === 0 && def.length === 0;
	}
	return value === def;
}

/** Serialize Design globals to limine.conf option lines. */
export function serializeDesignConfig(
	config: DesignConfig,
	options: { omitDefaults?: boolean } = {},
): string {
	const omitDefaults = options.omitDefaults ?? true;
	const lines: string[] = ["# liminal — design options", ""];

	for (const field of DESIGN_FIELDS) {
		const value = config[field.key];

		if (omitDefaults && isDefault(field.key, value)) {
			continue;
		}

		if (field.key === "wallpaper") {
			const paths = value as string[];
			for (const path of paths) {
				const trimmed = path.trim();
				if (trimmed) {
					lines.push(`wallpaper: ${trimmed}`);
				}
			}
			continue;
		}

		if (typeof value === "string" && value.trim() === "" && omitDefaults) {
			continue;
		}

		lines.push(`${field.key}: ${value}`);
	}

	if (lines.length === 2) {
		lines.push("# (all values at Limine defaults)");
	}

	return lines.join("\n") + "\n";
}
