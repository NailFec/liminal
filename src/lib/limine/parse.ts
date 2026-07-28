import { OPTION_ALIASES } from "./aliases";
import {
	createMenuEntry,
	normalizeProtocol,
	type MenuEntry,
	type FwType,
} from "./entries";
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

const ENTRY_LOCAL_KEYS = new Set([
	"comment",
	"protocol",
	"cmdline",
	"kernel_cmdline",
	"if_fw_type",
	"if_arch",
]);

export type LimineConfig = {
	design: DesignConfig;
	entries: MenuEntry[];
};

/** Resolve a config option name (case-insensitive) to a DesignConfig key. */
export function resolveOptionKey(raw: string): keyof DesignConfig | null {
	const key = raw.trim().toLowerCase();
	const canonical = OPTION_ALIASES[key] ?? key;
	if (!DESIGN_KEYS.has(canonical)) return null;
	return canonical as keyof DesignConfig;
}

type RawEntry = {
	depth: number;
	expandedByDefault: boolean;
	name: string;
	locals: Record<string, string>;
};

function parseEntryHeader(line: string): RawEntry | null {
	if (!line.startsWith("/")) return null;
	let depth = 0;
	let i = 0;
	while (i < line.length && line[i] === "/") {
		depth++;
		i++;
	}
	let rest = line.slice(i);
	let expandedByDefault = false;
	if (rest.startsWith("+")) {
		expandedByDefault = true;
		rest = rest.slice(1);
	}
	const name = rest.trim();
	if (!name) return null;
	return { depth, expandedByDefault, name, locals: {} };
}

function applyLocal(entry: RawEntry, key: string, value: string) {
	const k = key.toLowerCase();
	if (!ENTRY_LOCAL_KEYS.has(k)) return;
	if (k === "kernel_cmdline") {
		if (entry.locals.cmdline === undefined) {
			entry.locals.cmdline = value;
		}
		return;
	}
	if (k === "protocol") {
		entry.locals.protocol = normalizeProtocol(value);
		return;
	}
	// Limine uses the first COMMENT= value; later duplicates are ignored.
	if (k === "comment" && entry.locals.comment !== undefined) {
		return;
	}
	entry.locals[k] = value;
}

function buildTree(raws: RawEntry[]): MenuEntry[] {
	type Frame = { depth: number; entry: MenuEntry; children: MenuEntry[] };
	const root: MenuEntry[] = [];
	const stack: Frame[] = [{ depth: 0, entry: null as unknown as MenuEntry, children: root }];

	for (const raw of raws) {
		while (stack.length > 1 && stack[stack.length - 1].depth >= raw.depth) {
			const frame = stack.pop()!;
			frame.entry.children = frame.children;
		}

		const parentFrame = stack[stack.length - 1];
		const fw = (raw.locals.if_fw_type ?? "").toUpperCase();
		const if_fw_type: FwType =
			fw === "BIOS" || fw === "UEFI" ? fw : "";

		const entry = createMenuEntry({
			name: raw.name,
			expandedByDefault: raw.expandedByDefault,
			expanded: raw.expandedByDefault,
			comment: raw.locals.comment ?? "",
			protocol: raw.locals.protocol ?? "",
			cmdline: raw.locals.cmdline ?? "",
			if_fw_type,
			if_arch: raw.locals.if_arch ?? "",
			children: [],
		});

		parentFrame.children.push(entry);
		stack.push({ depth: raw.depth, entry, children: [] });
	}

	while (stack.length > 1) {
		const frame = stack.pop()!;
		frame.entry.children = frame.children;
	}

	return root;
}

/** Parse limine.conf global option lines into a DesignConfig (aliases normalized). */
export function parseDesignConfig(source: string): DesignConfig {
	return parseLimineConfig(source).design;
}

/** Parse full limine.conf (globals + menu entries). */
export function parseLimineConfig(source: string): LimineConfig {
	const config = createDefaultDesignConfig();
	const wallpapers: string[] = [];
	const rawEntries: RawEntry[] = [];
	let current: RawEntry | null = null;

	for (const line of source.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const header = parseEntryHeader(trimmed);
		if (header) {
			if (current) rawEntries.push(current);
			current = header;
			continue;
		}

		const colon = trimmed.indexOf(":");
		if (colon <= 0) continue;

		const rawKey = trimmed.slice(0, colon).trim();
		const value = trimmed.slice(colon + 1).trim();

		if (current) {
			const localKey = rawKey.trim().toLowerCase();
			if (ENTRY_LOCAL_KEYS.has(localKey) || localKey === "kernel_cmdline") {
				applyLocal(current, rawKey, value);
				continue;
			}
			// Globals may appear anywhere; still apply when not an entry-local key.
		}

		const key = resolveOptionKey(rawKey);
		if (!key) {
			continue;
		}

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

	if (current) rawEntries.push(current);

	config.wallpaper = wallpapers;
	return { design: config, entries: buildTree(rawEntries) };
}
