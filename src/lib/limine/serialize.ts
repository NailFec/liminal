import { isDirectory, type MenuEntry } from "./entries";
import { DESIGN_FIELDS } from "./schema";
import { effectiveDefaultForKey } from "./termChrome";
import { DEFAULT_DESIGN_CONFIG, type DesignConfig } from "./types";

function isDefault(
	key: keyof DesignConfig,
	value: DesignConfig[keyof DesignConfig],
	config: DesignConfig,
): boolean {
	const effective = effectiveDefaultForKey(key, config);
	const def = effective !== undefined ? effective : DEFAULT_DESIGN_CONFIG[key];
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
	const lines: string[] = [];

	for (const field of DESIGN_FIELDS) {
		const value = config[field.key];

		if (omitDefaults && isDefault(field.key, value, config)) {
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

	return lines.join("\n");
}

function serializeEntry(entry: MenuEntry, depth: number, lines: string[]) {
	const slashes = "/".repeat(depth);
	const plus = entry.expandedByDefault ? "+" : "";
	lines.push(`${slashes}${plus}${entry.name}`);

	if (entry.comment.trim()) {
		lines.push(`    comment: ${entry.comment}`);
	}
	if (entry.protocol.trim()) {
		lines.push(`    protocol: ${entry.protocol}`);
	}
	if (entry.cmdline.trim()) {
		lines.push(`    cmdline: ${entry.cmdline}`);
	}
	if (entry.if_fw_type) {
		lines.push(`    if_fw_type: ${entry.if_fw_type}`);
	}
	if (entry.if_arch.trim()) {
		lines.push(`    if_arch: ${entry.if_arch}`);
	}

	if (isDirectory(entry)) {
		for (const child of entry.children) {
			serializeEntry(child, depth + 1, lines);
		}
	}
}

/** Serialize menu entry tree. */
export function serializeMenuEntries(entries: MenuEntry[]): string {
	const lines: string[] = [];
	for (const entry of entries) {
		serializeEntry(entry, 1, lines);
	}
	return lines.join("\n");
}

/** Serialize full limine.conf (globals + entries). */
export function serializeLimineConfig(
	config: DesignConfig,
	entries: MenuEntry[],
	options: { omitDefaults?: boolean } = {},
): string {
	const parts: string[] = ["# liminal — limine.conf", ""];
	const globals = serializeDesignConfig(config, options);
	if (globals.trim()) {
		parts.push(globals, "");
	} else {
		parts.push("# (all global values at Limine defaults)", "");
	}
	const menu = serializeMenuEntries(entries);
	if (menu.trim()) {
		parts.push(menu, "");
	}
	return parts.join("\n");
}
