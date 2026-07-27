<script lang="ts">
	import { DESIGN_GROUPS, fieldsForGroup, type DesignField } from "$lib/limine/schema";
	import { designStore } from "$lib/limine/store.svelte";
	import type { DesignConfig, YesNo } from "$lib/limine/types";
	import Section from "$lib/ui/Section.svelte";
	import Field from "$lib/ui/Field.svelte";
	import Toggle from "$lib/ui/Toggle.svelte";
	import ColorInput from "$lib/ui/ColorInput.svelte";
	import TextInput from "$lib/ui/TextInput.svelte";
	import NumberInput from "$lib/ui/NumberInput.svelte";
	import Select from "$lib/ui/Select.svelte";

	function setString(key: keyof DesignConfig, value: string) {
		designStore.setField(key, value as DesignConfig[typeof key]);
	}

	function setYesNo(key: keyof DesignConfig, value: YesNo) {
		designStore.setField(key, value as DesignConfig[typeof key]);
	}

	function updateWallpaper(index: number, value: string) {
		const next = [...designStore.config.wallpaper];
		next[index] = value;
		designStore.setField("wallpaper", next);
	}

	function addWallpaper() {
		designStore.setField("wallpaper", [...designStore.config.wallpaper, ""]);
	}

	function removeWallpaper(index: number) {
		designStore.setField(
			"wallpaper",
			designStore.config.wallpaper.filter((_, i) => i !== index),
		);
	}

	function renderValue(field: DesignField): string {
		const v = designStore.config[field.key];
		return typeof v === "string" ? v : "";
	}

	function isFieldEnabled(field: DesignField): boolean {
		return field.enabledWhen?.(designStore.config) ?? true;
	}
</script>

<aside class="panel">
	<header class="panel-header">
		<span>Options</span>
		<div class="header-actions">
			<button
				type="button"
				class="desc-toggle"
				class:on={designStore.showDescriptions}
				aria-pressed={designStore.showDescriptions}
				onclick={() => (designStore.showDescriptions = !designStore.showDescriptions)}
				title="Show or hide option descriptions"
			>
				<span class="switch" aria-hidden="true">
					<span class="knob"></span>
				</span>
				Desc
			</button>
			<button type="button" class="reset" onclick={() => designStore.reset()}>Reset</button>
		</div>
	</header>

	<div class="scroll">
		{#each DESIGN_GROUPS as group (group.id)}
			<Section title={group.label} collapsedByDefault={group.collapsedByDefault}>
				{#each fieldsForGroup(group.id) as field (field.key)}
					{@const disabled = !isFieldEnabled(field)}
					<Field
						label={field.label}
						description={field.description}
						showDescription={designStore.showDescriptions}
						{disabled}
					>
						{#if field.type === "yesno"}
							<Toggle
								value={designStore.config[field.key] as YesNo}
								{disabled}
								onchange={(v) => setYesNo(field.key, v)}
							/>
						{:else if field.type === "color"}
							<ColorInput
								value={renderValue(field)}
								{disabled}
								onchange={(v) => setString(field.key, v)}
							/>
						{:else if field.type === "color_alpha"}
							<ColorInput
								value={renderValue(field)}
								alpha
								{disabled}
								onchange={(v) => setString(field.key, v)}
							/>
						{:else if field.type === "enum"}
							<Select
								value={renderValue(field)}
								options={field.options ?? []}
								{disabled}
								onchange={(v) => setString(field.key, v)}
							/>
						{:else if field.type === "number"}
							<NumberInput
								value={renderValue(field)}
								{disabled}
								onchange={(v) => setString(field.key, v)}
							/>
						{:else if field.type === "path_list"}
							<div class="path-list">
								{#each designStore.config.wallpaper as path, i (i)}
									<div class="path-row">
										<TextInput
											value={path}
											placeholder={field.placeholder}
											mono
											{disabled}
											onchange={(v) => updateWallpaper(i, v)}
										/>
										<button
											type="button"
											class="icon-btn"
											{disabled}
											onclick={() => removeWallpaper(i)}
											aria-label="Remove wallpaper"
										>
											×
										</button>
									</div>
								{/each}
								<button type="button" class="add" {disabled} onclick={addWallpaper}>
									+ Add path
								</button>
							</div>
						{:else}
							<TextInput
								value={renderValue(field)}
								placeholder={field.placeholder}
								mono={field.type === "resolution" ||
									field.type === "palette" ||
									field.key === "term_font"}
								{disabled}
								onchange={(v) => setString(field.key, v)}
							/>
						{/if}
					</Field>
				{/each}
			</Section>
		{/each}
	</div>
</aside>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		min-height: 0;
		background: var(--bg-panel);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 28px;
		padding: 0 8px;
		border-bottom: 1px solid var(--border);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.desc-toggle {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text-muted);
		font-size: 11px;
		text-transform: none;
		letter-spacing: 0;
	}

	.desc-toggle:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.desc-toggle.on {
		color: var(--text);
		border-color: var(--accent);
	}

	.switch {
		position: relative;
		width: 22px;
		height: 12px;
		border-radius: 6px;
		background: #4a4a4a;
		flex-shrink: 0;
	}

	.desc-toggle.on .switch {
		background: var(--bg-active);
	}

	.knob {
		position: absolute;
		top: 1px;
		left: 1px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #ddd;
		transition: left 0.12s ease;
	}

	.desc-toggle.on .knob {
		left: 11px;
	}

	.reset {
		padding: 2px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text-muted);
		font-size: 11px;
		text-transform: none;
		letter-spacing: 0;
	}

	.reset:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.scroll {
		flex: 1;
		overflow: auto;
	}

	.path-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.path-row {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.icon-btn {
		width: 24px;
		height: 24px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.icon-btn:hover:not(:disabled) {
		background: var(--bg-hover);
		color: var(--text);
	}

	.icon-btn:disabled,
	.add:disabled {
		cursor: not-allowed;
	}

	.add {
		align-self: flex-start;
		padding: 3px 8px;
		border: 1px dashed var(--border-subtle);
		border-radius: var(--radius);
		background: transparent;
		color: var(--text-muted);
		font-size: 12px;
	}

	.add:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--text);
	}
</style>
