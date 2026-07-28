import {
	cloneMenuTree,
	createMenuEntry,
	createSampleMenuTree,
	DEFAULT_PREVIEW_CONTEXT,
	findEntryById,
	findParentOf,
	flattenVisibleEntries,
	removeEntryById,
	type MenuEntry,
	type PreviewArch,
	type PreviewContext,
	type PreviewFirmware,
} from "./entries";
import { parseLimineConfig } from "./parse";
import {
	USER_CONF_PATH,
	USER_CONF_TEXT,
} from "./userConf";
import {
	createDefaultDesignConfig,
	type DesignConfig,
} from "./types";
import { hasWallpaper, syncWallpaperChromeDefaults } from "./termChrome";

class LiminalStore {
	config = $state<DesignConfig>(createDefaultDesignConfig());
	entries = $state<MenuEntry[]>(createSampleMenuTree());
	preview = $state<PreviewContext>({ ...DEFAULT_PREVIEW_CONTEXT });
	showDescriptions = $state(true);
	selectedEntryId = $state<string | null>(null);
	/** Bumps when quiet is turned on so the preview blank screen returns. */
	quietEpoch = $state(0);
	/** Path of last imported conf (for UI status). */
	importedFrom = $state<string | null>(null);
	importError = $state<string | null>(null);

	setField<K extends keyof DesignConfig>(key: K, value: DesignConfig[K]) {
		if (key === "wallpaper") {
			const had = hasWallpaper(this.config);
			this.config.wallpaper = value as string[];
			const now = hasWallpaper(this.config);
			const patch = syncWallpaperChromeDefaults(this.config, had, now);
			Object.assign(this.config, patch);
			return;
		}
		const prevQuiet = this.config.quiet;
		this.config[key] = value;
		if (key === "quiet" && value === "yes" && prevQuiet !== "yes") {
			this.quietEpoch += 1;
		}
		if (key === "default_entry") {
			this.applyDefaultEntry();
		}
	}

	applyDefaultEntry() {
		const def = Math.max(1, Math.floor(Number(this.config.default_entry)) || 1);
		const rows = flattenVisibleEntries(this.entries, this.preview);
		const target = rows[def - 1];
		if (target) this.selectedEntryId = target.entry.id;
	}

	/** Parse limine.conf text and fill design options + menu entries. */
	loadFromSource(source: string, sourceLabel?: string) {
		try {
			const parsed = parseLimineConfig(source);
			this.config = parsed.design;
			this.entries = parsed.entries;
			this.importedFrom = sourceLabel ?? null;
			this.importError = null;
			this.selectedEntryId = this.entries[0]?.id ?? null;
			this.applyDefaultEntry();
		} catch (err) {
			this.importError = err instanceof Error ? err.message : String(err);
		}
	}

	setPreviewFirmware(firmware: PreviewFirmware) {
		this.preview.firmware = firmware;
	}

	setPreviewArch(arch: PreviewArch) {
		this.preview.arch = arch;
	}

	setSelectedEntryId(id: string | null) {
		this.selectedEntryId = id;
	}

	toggleExpanded(id: string) {
		const entry = findEntryById(this.entries, id);
		if (entry && entry.children.length > 0) {
			entry.expanded = !entry.expanded;
		}
	}

	updateEntry(id: string, patch: Partial<MenuEntry>) {
		const entry = findEntryById(this.entries, id);
		if (!entry) return;
		Object.assign(entry, patch);
		if (patch.expandedByDefault !== undefined && patch.expanded === undefined) {
			entry.expanded = patch.expandedByDefault;
		}
	}

	addEntry(parentId: string | null = null) {
		const entry = createMenuEntry({ name: "New entry", protocol: "linux" });
		if (!parentId) {
			this.entries.push(entry);
		} else {
			const parent = findEntryById(this.entries, parentId);
			if (parent) {
				parent.children.push(entry);
				parent.expanded = true;
			} else {
				this.entries.push(entry);
			}
		}
		this.selectedEntryId = entry.id;
		return entry;
	}

	removeSelected() {
		if (!this.selectedEntryId) return;
		removeEntryById(this.entries, this.selectedEntryId);
		this.selectedEntryId = this.entries[0]?.id ?? null;
	}

	moveSelected(delta: -1 | 1) {
		if (!this.selectedEntryId) return;
		const loc = findParentOf(this.entries, this.selectedEntryId);
		if (!loc) return;
		const next = loc.index + delta;
		if (next < 0 || next >= loc.list.length) return;
		const [item] = loc.list.splice(loc.index, 1);
		loc.list.splice(next, 0, item);
	}

	nestSelected() {
		if (!this.selectedEntryId) return;
		const loc = findParentOf(this.entries, this.selectedEntryId);
		if (!loc || loc.index === 0) return;
		const prev = loc.list[loc.index - 1];
		const [item] = loc.list.splice(loc.index, 1);
		prev.children.push(item);
		prev.expanded = true;
	}

	unnestSelected() {
		if (!this.selectedEntryId) return;
		const loc = findParentOf(this.entries, this.selectedEntryId);
		if (!loc) return;
		const owner = this.findOwnerOfList(loc.list);
		if (!owner) return;
		const [item] = loc.list.splice(loc.index, 1);
		const ownerLoc = findParentOf(this.entries, owner.id);
		if (!ownerLoc) {
			this.entries.push(item);
			return;
		}
		ownerLoc.list.splice(ownerLoc.index + 1, 0, item);
	}

	private findOwnerOfList(list: MenuEntry[]): MenuEntry | null {
		const walk = (nodes: MenuEntry[]): MenuEntry | null => {
			for (const n of nodes) {
				if (n.children === list) return n;
				const found = walk(n.children);
				if (found) return found;
			}
			return null;
		};
		return walk(this.entries);
	}

	reset() {
		this.config = createDefaultDesignConfig();
		this.entries = createSampleMenuTree();
		this.preview = { ...DEFAULT_PREVIEW_CONTEXT };
		this.selectedEntryId = this.entries[0]?.id ?? null;
		this.importedFrom = null;
		this.importError = null;
	}

	replaceEntries(entries: MenuEntry[]) {
		this.entries = cloneMenuTree(entries);
		this.selectedEntryId = this.entries[0]?.id ?? null;
	}
}

export const liminalStore = new LiminalStore();

// Hard goal: import `user/limine.conf` into GUI options.
liminalStore.loadFromSource(USER_CONF_TEXT, USER_CONF_PATH);

/** @deprecated Use liminalStore — kept for existing Design imports. */
export const designStore = liminalStore;
