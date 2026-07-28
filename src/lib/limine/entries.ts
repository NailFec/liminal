/** Boot-menu entry tree (non-protocol-specific locals). */

export type FwType = "" | "BIOS" | "UEFI";

export type PreviewFirmware = "BIOS" | "UEFI";

export type PreviewArch =
	| "x86-64"
	| "ia-32"
	| "aarch64"
	| "riscv64"
	| "loongarch64";

export type MenuEntry = {
	id: string;
	name: string;
	/** Written as `/+Name` in conf when true. */
	expandedByDefault: boolean;
	/** Runtime expand/collapse in the preview. */
	expanded: boolean;
	comment: string;
	protocol: string;
	cmdline: string;
	if_fw_type: FwType;
	if_arch: string;
	children: MenuEntry[];
};

export type PreviewContext = {
	firmware: PreviewFirmware;
	arch: PreviewArch;
};

let nextId = 1;

export function newEntryId(): string {
	return `e${nextId++}`;
}

export function createMenuEntry(partial: Partial<MenuEntry> & { name: string }): MenuEntry {
	return {
		id: partial.id ?? newEntryId(),
		name: partial.name,
		expandedByDefault: partial.expandedByDefault ?? false,
		expanded: partial.expanded ?? partial.expandedByDefault ?? false,
		comment: partial.comment ?? "",
		protocol: partial.protocol ?? "",
		cmdline: partial.cmdline ?? "",
		if_fw_type: partial.if_fw_type ?? "",
		if_arch: partial.if_arch ?? "",
		children: partial.children ?? [],
	};
}

export function createSampleMenuTree(): MenuEntry[] {
	nextId = 1;
	return [
		createMenuEntry({
			name: "Arch Linux",
			comment: "Boot the default kernel",
			protocol: "linux",
			cmdline: "root=UUID=… rw",
		}),
		createMenuEntry({
			name: "Arch Linux (fallback)",
			comment: "Fallback initramfs",
			protocol: "linux",
		}),
		createMenuEntry({
			name: "Advanced options",
			expandedByDefault: true,
			expanded: true,
			comment: "Extra boot entries",
			children: [
				createMenuEntry({
					name: "Arch Linux (recovery)",
					comment: "Single-user recovery",
					protocol: "linux",
				}),
				createMenuEntry({
					name: "Memtest86+",
					protocol: "linux",
				}),
			],
		}),
		createMenuEntry({
			name: "UEFI Shell",
			comment: "Launch EFI shell",
			protocol: "efi",
			if_fw_type: "UEFI",
		}),
	];
}

export const DEFAULT_PREVIEW_CONTEXT: PreviewContext = {
	firmware: "UEFI",
	arch: "x86-64",
};

/** Canonical protocol names after alias normalisation. */
export const PROTOCOL_ALIASES: Record<string, string> = {
	uefi: "efi",
	efi_chainload: "efi",
	bios_chainload: "bios",
	multiboot1: "multiboot",
};

export function normalizeProtocol(raw: string): string {
	const key = raw.trim().toLowerCase();
	return PROTOCOL_ALIASES[key] ?? key;
}

export function isDirectory(entry: MenuEntry): boolean {
	return entry.children.length > 0;
}

/** Whether an entry is hidden for the current preview firmware/arch (Limine filters). */
export function shouldSkipEntry(entry: MenuEntry, ctx: PreviewContext): boolean {
	if (entry.if_fw_type && entry.if_fw_type !== ctx.firmware) {
		return true;
	}
	const archList = entry.if_arch
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((a) => a.toLowerCase());
	if (archList.length > 0 && !archList.includes(ctx.arch.toLowerCase())) {
		return true;
	}
	// Protocol-based firmware mismatch (same idea as Limine should_skip_entry)
	const proto = entry.protocol.trim().toLowerCase();
	if (proto === "bios" && ctx.firmware === "UEFI") return true;
	return (proto === "efi" || proto === "efi_boot_entry") && ctx.firmware === "BIOS";

}

export type FlatMenuRow = {
	entry: MenuEntry;
	/** Depth in the tree (0 = top-level). */
	level: number;
	/** For each ancestor level > 0, whether that ancestor still has a next sibling. */
	continues: boolean[];
	/** Whether this entry has a next visible sibling at its level. */
	hasNextSibling: boolean;
};

/**
 * Flatten visible entries for the boot menu, respecting expand state
 * (directories contribute a row; children only if expanded).
 */
export function flattenVisibleEntries(
	tree: MenuEntry[],
	ctx: PreviewContext,
	continues: boolean[] = [],
): FlatMenuRow[] {
	const visible = tree.filter((e) => !shouldSkipEntry(e, ctx));
	const rows: FlatMenuRow[] = [];

	for (let i = 0; i < visible.length; i++) {
		const entry = visible[i];
		const hasNextSibling = i < visible.length - 1;
		rows.push({
			entry,
			level: continues.length,
			continues: [...continues],
			hasNextSibling,
		});
		if (isDirectory(entry) && entry.expanded) {
			rows.push(
				...flattenVisibleEntries(entry.children, ctx, [...continues, hasNextSibling]),
			);
		}
	}

	return rows;
}

export function findEntryById(tree: MenuEntry[], id: string): MenuEntry | null {
	for (const entry of tree) {
		if (entry.id === id) return entry;
		const found = findEntryById(entry.children, id);
		if (found) return found;
	}
	return null;
}

export function findParentOf(
	tree: MenuEntry[],
	id: string,
): { list: MenuEntry[]; index: number } | null {
	for (let i = 0; i < tree.length; i++) {
		if (tree[i].id === id) return { list: tree, index: i };
		const found = findParentOf(tree[i].children, id);
		if (found) return found;
	}
	return null;
}

/** Remove entry by id; returns removed entry or null. */
export function removeEntryById(tree: MenuEntry[], id: string): MenuEntry | null {
	const loc = findParentOf(tree, id);
	if (!loc) return null;
	const [removed] = loc.list.splice(loc.index, 1);
	return removed ?? null;
}

export function cloneMenuTree(tree: MenuEntry[]): MenuEntry[] {
	return tree.map((e) => ({
		...e,
		children: cloneMenuTree(e.children),
	}));
}

export function synthesizeBranding(ctx: PreviewContext): string {
	if (ctx.firmware === "BIOS") {
		return `Limine (${ctx.arch}, BIOS)`;
	}
	return `Limine (${ctx.arch}, UEFI)`;
}
