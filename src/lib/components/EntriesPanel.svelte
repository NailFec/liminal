<script lang="ts">
	import {
		findEntryById,
		isDirectory,
		type FwType,
		type MenuEntry,
		type PreviewArch,
		type PreviewFirmware,
	} from "$lib/limine/entries";
	import { liminalStore } from "$lib/limine/store.svelte";
	import ConfigSnippet from "$lib/components/ConfigSnippet.svelte";
	import Field from "$lib/ui/Field.svelte";
	import Section from "$lib/ui/Section.svelte";
	import Select from "$lib/ui/Select.svelte";
	import TextInput from "$lib/ui/TextInput.svelte";
	import Toggle from "$lib/ui/Toggle.svelte";
	import type { YesNo } from "$lib/limine/types";

	const PROTOCOL_OPTIONS = [
		{ value: "", label: "(none)" },
		{ value: "linux", label: "linux" },
		{ value: "limine", label: "limine" },
		{ value: "multiboot", label: "multiboot" },
		{ value: "multiboot2", label: "multiboot2" },
		{ value: "efi", label: "efi" },
		{ value: "efi_boot_entry", label: "efi_boot_entry" },
		{ value: "bios", label: "bios" },
	];

	const FW_OPTIONS = [
		{ value: "", label: "(any)" },
		{ value: "UEFI", label: "UEFI" },
		{ value: "BIOS", label: "BIOS" },
	];

	const ARCH_OPTIONS: { value: PreviewArch; label: string }[] = [
		{ value: "x86-64", label: "x86-64" },
		{ value: "ia-32", label: "ia-32" },
		{ value: "aarch64", label: "aarch64" },
		{ value: "riscv64", label: "riscv64" },
		{ value: "loongarch64", label: "loongarch64" },
	];

	let selected = $derived(
		liminalStore.selectedEntryId
			? findEntryById(liminalStore.entries, liminalStore.selectedEntryId)
			: null,
	);

	function renderTree(nodes: MenuEntry[], depth: number): { entry: MenuEntry; depth: number }[] {
		const out: { entry: MenuEntry; depth: number }[] = [];
		for (const entry of nodes) {
			out.push({ entry, depth });
			if (entry.children.length > 0) {
				out.push(...renderTree(entry.children, depth + 1));
			}
		}
		return out;
	}

	let treeRows = $derived(renderTree(liminalStore.entries, 0));

	function patch(partial: Partial<MenuEntry>) {
		if (!liminalStore.selectedEntryId) return;
		liminalStore.updateEntry(liminalStore.selectedEntryId, partial);
	}
</script>

<aside class="panel">
	<header class="panel-header">
		<span>Entries</span>
	</header>

	<div class="scroll">
		<Section title="Preview context">
			<Field label="Firmware">
				<Select
					value={liminalStore.preview.firmware}
					options={[
						{ value: "UEFI", label: "UEFI" },
						{ value: "BIOS", label: "BIOS" },
					]}
					onchange={(v) => liminalStore.setPreviewFirmware(v as PreviewFirmware)}
				/>
			</Field>
			<Field label="Architecture">
				<Select
					value={liminalStore.preview.arch}
					options={ARCH_OPTIONS}
					onchange={(v) => liminalStore.setPreviewArch(v as PreviewArch)}
				/>
			</Field>
		</Section>

		<Section title="Menu tree">
			<div class="toolbar">
				<button type="button" onclick={() => liminalStore.addEntry(null)}>+ Entry</button>
				<button
					type="button"
					disabled={!selected}
					onclick={() => liminalStore.addEntry(liminalStore.selectedEntryId)}
				>
					+ Child
				</button>
				<button type="button" disabled={!selected} onclick={() => liminalStore.moveSelected(-1)}
					>↑</button
				>
				<button type="button" disabled={!selected} onclick={() => liminalStore.moveSelected(1)}
					>↓</button
				>
				<button type="button" disabled={!selected} onclick={() => liminalStore.nestSelected()}
					>→ Nest</button
				>
				<button type="button" disabled={!selected} onclick={() => liminalStore.unnestSelected()}
					>← Unnest</button
				>
				<button
					type="button"
					class="danger"
					disabled={!selected}
					onclick={() => liminalStore.removeSelected()}
				>
					Remove
				</button>
			</div>

			<ul class="tree">
				{#each treeRows as row (row.entry.id)}
					<li>
						<button
							type="button"
							class="tree-item"
							class:active={row.entry.id === liminalStore.selectedEntryId}
							style:--depth={row.depth}
							onclick={() => liminalStore.setSelectedEntryId(row.entry.id)}
						>
							<span class="indent"></span>
							{#if isDirectory(row.entry)}
								<span class="badge">{row.entry.expandedByDefault ? "[+]" : "[ ]"}</span>
							{/if}
							<span class="label">{row.entry.name}</span>
						</button>
					</li>
				{/each}
			</ul>
		</Section>

		{#if selected}
			<Section title="Selected entry">
				<Field label="Title">
					<TextInput value={selected.name} onchange={(v) => patch({ name: v })} />
				</Field>
				<Field
					label="Expanded by default"
					description="Writes `/+Title` in limine.conf for directories."
					showDescription={liminalStore.showDescriptions}
				>
					<Toggle
						value={selected.expandedByDefault ? "yes" : "no"}
						disabled={!isDirectory(selected)}
						onchange={(v: YesNo) =>
							patch({
								expandedByDefault: v === "yes",
								expanded: v === "yes",
							})}
					/>
				</Field>
				<Field label="Comment">
					<TextInput value={selected.comment} onchange={(v) => patch({ comment: v })} />
				</Field>
				<Field label="Protocol">
					<Select
						value={selected.protocol}
						options={PROTOCOL_OPTIONS}
						onchange={(v) => patch({ protocol: v })}
					/>
				</Field>
				<Field label="cmdline">
					<TextInput
						mono
						value={selected.cmdline}
						placeholder="root=… rw"
						onchange={(v) => patch({ cmdline: v })}
					/>
				</Field>
				<Field label="if_fw_type">
					<Select
						value={selected.if_fw_type}
						options={FW_OPTIONS}
						onchange={(v) => patch({ if_fw_type: v as FwType })}
					/>
				</Field>
				<Field label="if_arch" description="Space-separated arch list." showDescription={liminalStore.showDescriptions}>
					<TextInput
						mono
						value={selected.if_arch}
						placeholder="x86-64 aarch64"
						onchange={(v) => patch({ if_arch: v })}
					/>
				</Field>
			</Section>
		{/if}
	</div>

	<ConfigSnippet />
</aside>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--bg-panel);
	}

	.panel-header {
		height: 28px;
		padding: 0 10px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--border);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.scroll {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.toolbar button {
		padding: 3px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text-muted);
		font-size: 11px;
	}

	.toolbar button:hover:not(:disabled) {
		background: var(--bg-hover);
		color: var(--text);
	}

	.toolbar button:disabled {
		opacity: 0.4;
	}

	.toolbar .danger:hover:not(:disabled) {
		border-color: #a44;
		color: #f88;
	}

	.tree {
		margin: 8px 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.tree-item {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
		padding: 4px 6px;
		border: none;
		background: transparent;
		color: var(--text);
		font-size: 12px;
		text-align: left;
		cursor: pointer;
	}

	.tree-item .indent {
		width: calc(var(--depth) * 12px);
		flex-shrink: 0;
	}

	.tree-item:hover {
		background: var(--bg-hover);
	}

	.tree-item.active {
		background: var(--bg-active);
		color: #fff;
	}

	.badge {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--text-dim);
	}

	.tree-item.active .badge {
		color: rgba(255, 255, 255, 0.7);
	}

	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
