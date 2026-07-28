<script lang="ts">
	import {
		paletteColor,
		parseResolution,
		toCssColor,
		toOpaqueCssColor,
	} from "$lib/limine/colors";
	import {
		flattenVisibleEntries,
		isDirectory,
		synthesizeBranding,
		type FlatMenuRow,
	} from "$lib/limine/entries";
	import { ensurePreviewFontLoaded, resolveBundledFont } from "$lib/limine/fonts";
	import { liminalStore } from "$lib/limine/store.svelte";
	import { getEffectiveTermChrome, hasWallpaper } from "$lib/limine/termChrome";
	import { resolveWallpaperUrl } from "$lib/limine/userAssets";

	const TREE_WINDOW = 12;

	let quietDismissedEpoch = $state(-1);

	let cfg = $derived(liminalStore.config);
	let preview = $derived(liminalStore.preview);
	let entries = $derived(liminalStore.entries);

	let resolution = $derived(parseResolution(cfg.interface_resolution));
	let aspect = $derived(
		resolution ? `${resolution.width} / ${resolution.height}` : "16 / 9",
	);

	let rotation = $derived(Number(cfg.interface_rotation) || 0);
	let isRotated = $derived(rotation === 90 || rotation === 270);

	let brandingColour = $derived(toCssColor(cfg.interface_branding_colour, "#00aaaa"));
	let helpColour = $derived(toCssColor(cfg.interface_help_colour, "#00aa00"));

	let termFg = $derived(toCssColor(cfg.term_foreground, "#aaaaaa"));
	let backdrop = $derived(toCssColor(cfg.backdrop, "#000000"));

	let chrome = $derived(getEffectiveTermChrome(cfg));
	let termBg = $derived(toCssColor(chrome.term_background, "rgba(0,0,0,0)"));
	let revFg = $derived(toOpaqueCssColor(chrome.term_background, "#000000"));
	let margin = $derived(chrome.term_margin);
	let gradient = $derived(chrome.term_margin_gradient);
	let outerPad = $derived(Math.max(0, margin - gradient));

	let commentColour = $derived(paletteColor(cfg.term_palette, 6, "#00aaaa"));

	let spacing = $derived(Math.max(0, Number(cfg.term_font_spacing) || 1));
	let scaleParts = $derived(cfg.term_font_scale.match(/^(\d+)x(\d+)$/i));
	let scaleX = $derived(scaleParts ? Math.min(8, Number(scaleParts[1]) || 1) : 1);
	let scaleY = $derived(scaleParts ? Math.min(8, Number(scaleParts[2]) || 1) : 1);
	let fontSizeParts = $derived(cfg.term_font_size.match(/^(\d+)x(\d+)$/i));
	let glyphH = $derived(fontSizeParts ? Math.max(1, Number(fontSizeParts[2]) || 16) : 16);
	let fontSize = $derived(Math.round(glyphH * scaleY));
	let letterSpacing = $derived(spacing * scaleX + Math.max(0, scaleX - 1) * 8 * scaleY);

	let bundledFont = $derived(resolveBundledFont(cfg.term_font));
	let previewFontFamily = $derived(bundledFont.previewFamily);

	$effect(() => {
		void ensurePreviewFontLoaded(bundledFont);
	});

	let graphics = $derived(cfg.graphics !== "no");
	let useAscii = $derived(cfg.serial === "yes" || !graphics);
	let helpHidden = $derived(cfg.interface_help_hidden === "yes");
	let editorEnabled = $derived(cfg.editor_enabled === "yes");
	let isUefi = $derived(preview.firmware === "UEFI");
	let hasSecondaryHelp = $derived(isUefi || editorEnabled);
	let quietMode = $derived(
		cfg.quiet === "yes" && quietDismissedEpoch !== liminalStore.quietEpoch,
	);

	let wallpaperActive = $derived(hasWallpaper(cfg) && graphics);
	let wallpaperUrl = $derived(resolveWallpaperUrl(cfg.wallpaper));

	let wallpaperBgSize = $derived.by(() => {
		if (cfg.wallpaper_style === "tiled") return "auto";
		if (cfg.wallpaper_style === "centered") return "auto";
		return "100% 100%";
	});

	let wallpaperBgRepeat = $derived(
		cfg.wallpaper_style === "tiled" ? "repeat" : "no-repeat",
	);

	let wallpaperBgImage = $derived.by(() => {
		if (!wallpaperActive) return "none";
		if (wallpaperUrl) return `url(${JSON.stringify(wallpaperUrl)})`;
		// Path set but file missing under user/ — keep a visible placeholder
		return "linear-gradient(135deg, #1a2838 0%, #0d1520 40%, #243044 100%)";
	});

	let brandingText = $derived(
		cfg.interface_branding.trim() || synthesizeBranding(preview),
	);

	let flatRows = $derived(flattenVisibleEntries(entries, preview));

	let selectedIndex = $derived.by(() => {
		const id = liminalStore.selectedEntryId;
		if (id) {
			const idx = flatRows.findIndex((r) => r.entry.id === id);
			if (idx >= 0) return idx;
		}
		return flatRows.length > 0 ? 0 : -1;
	});

	let selectedRow = $derived(selectedIndex >= 0 ? flatRows[selectedIndex] : null);

	let treeOffset = $derived.by(() => {
		if (selectedIndex < 0) return 0;
		const maxOff = Math.max(0, flatRows.length - TREE_WINDOW);
		return Math.min(maxOff, Math.max(0, selectedIndex - Math.floor(TREE_WINDOW / 2)));
	});

	let windowRows = $derived(
		flatRows.slice(treeOffset, treeOffset + TREE_WINDOW) as FlatMenuRow[],
	);

	let canScrollUp = $derived(treeOffset > 0);
	let canScrollDown = $derived(treeOffset + TREE_WINDOW < flatRows.length);

	$effect(() => {
		if (flatRows.length === 0) {
			if (liminalStore.selectedEntryId) liminalStore.setSelectedEntryId(null);
			return;
		}
		const id = liminalStore.selectedEntryId;
		if (!id || !flatRows.some((r) => r.entry.id === id)) {
			liminalStore.setSelectedEntryId(flatRows[0].entry.id);
		}
	});

	function selectIndex(index: number) {
		if (index < 0 || index >= flatRows.length) return;
		liminalStore.setSelectedEntryId(flatRows[index].entry.id);
	}

	function treePrefix(row: FlatMenuRow): string {
		const parts: string[] = [];
		for (let i = 1; i < row.continues.length; i++) {
			parts.push(row.continues[i] ? (useAscii ? " |" : " │") : "  ");
		}
		if (row.level > 0) {
			parts.push(
				row.hasNextSibling
					? useAscii
						? " |"
						: " ├"
					: useAscii
						? " `"
						: " └",
			);
		}
		if (isDirectory(row.entry)) {
			parts.push(row.entry.expanded ? "[-]" : "[+]");
		} else if (row.level > 0) {
			parts.push(useAscii ? "-->" : "──►");
		} else {
			parts.push("   ");
		}
		return parts.join("");
	}

	function onEntryActivate(row: FlatMenuRow) {
		liminalStore.setSelectedEntryId(row.entry.id);
		if (isDirectory(row.entry)) {
			liminalStore.toggleExpanded(row.entry.id);
		}
	}

	function dismissQuiet() {
		quietDismissedEpoch = liminalStore.quietEpoch;
	}

	function onKeydown(e: KeyboardEvent) {
		if (quietMode) {
			dismissQuiet();
			e.preventDefault();
			return;
		}
		if (e.key === "ArrowDown") {
			selectIndex(selectedIndex + 1);
			e.preventDefault();
		} else if (e.key === "ArrowUp") {
			selectIndex(selectedIndex - 1);
			e.preventDefault();
		} else if (e.key === "Enter" && selectedRow && isDirectory(selectedRow.entry)) {
			liminalStore.toggleExpanded(selectedRow.entry.id);
			e.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="workspace">
	<div
		class="stage"
		class:rotated={isRotated}
		style:--aspect={aspect}
		style:--rotation="{rotation}deg"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="screen"
			class:text-mode={!graphics}
			role="application"
			aria-label="Limine boot menu preview"
			tabindex="0"
			style:background-color={!graphics ? "#000" : backdrop}
			style:background-image={wallpaperBgImage}
			style:background-size={wallpaperBgSize}
			style:background-repeat={wallpaperBgRepeat}
			style:background-position="center"
			onclick={quietMode ? dismissQuiet : undefined}
			onkeydown={quietMode ? dismissQuiet : undefined}
		>
			{#if quietMode}
				<div class="quiet-hint">Press any key…</div>
			{:else}
				<div
					class="term-frame"
					style:padding="{outerPad}px"
					style:--term-bg={termBg}
					style:--grad="{gradient}px"
				>
					<div
						class="term-fade"
						class:has-fade={gradient > 0}
						style:padding="{gradient}px"
					>
						<div
							class="term"
							style:background={termBg}
							style:color={termFg}
							style:font-family="{previewFontFamily}, monospace"
							style:font-size="{fontSize}px"
							style:letter-spacing="{letterSpacing}px"
						>
							<div class="spacer-lines" aria-hidden="true"></div>

							{#if brandingText}
								<div class="branding" style:color={brandingColour}>{brandingText}</div>
								<div class="spacer-lines" aria-hidden="true"></div>
							{/if}

							{#if !helpHidden}
								{@render helpPrimary()}
								{#if hasSecondaryHelp}
									<div class="spacer-lines" aria-hidden="true"></div>
									<div class="help-row secondary">
										{#if isUefi}
											<span class="help-key" style:color={helpColour}>S</span>
											<span> Firmware Setup</span>
											{#if editorEnabled}
												<span class="gap"></span>
											{/if}
										{/if}
										{#if editorEnabled}
											<span class="help-key" style:color={helpColour}>B</span>
											<span> Blank Entry</span>
										{/if}
									</div>
								{/if}
							{/if}

							{#if canScrollUp}
								<div class="scroll-cue">{useAscii ? "^^^" : "↑↑↑"}</div>
							{/if}

							<div class="tree">
								<div class="tree-block">
									{#if flatRows.length === 0}
										<div class="empty">[config file contains no valid entries]</div>
									{:else}
										{#each windowRows as row (row.entry.id)}
											{@const selected = row.entry.id === liminalStore.selectedEntryId}
											<button
												type="button"
												class="entry"
												class:selected
												style:--rev-bg={termFg}
												style:--rev-fg={revFg}
												onclick={() => onEntryActivate(row)}
											>
												<span class="decor">{treePrefix(row)}</span>
												<span class="name"> {row.entry.name} </span>
											</button>
										{/each}
									{/if}
								</div>
							</div>

							{#if canScrollDown}
								<div class="scroll-cue">{useAscii ? "vvv" : "↓↓↓"}</div>
							{/if}

							<div class="footer">
								{#if selectedRow?.entry.comment}
									<p class="comment" style:color={commentColour}>
										{selectedRow.entry.comment}
									</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

{#snippet helpPrimary()}
	{#if selectedRow}
		<div class="help-row primary">
			{#if isDirectory(selectedRow.entry)}
				<span class="help-key" style:color={helpColour}>ARROWS</span>
				<span> Select</span>
				<span class="gap"></span>
				<span class="help-key" style:color={helpColour}>ENTER</span>
				<span> {selectedRow.entry.expanded ? "Collapse" : "Expand"}</span>
			{:else}
				<span class="help-key" style:color={helpColour}>ARROWS</span>
				<span> Select</span>
				<span class="gap"></span>
				<span class="help-key" style:color={helpColour}>ENTER</span>
				<span> Boot</span>
				{#if editorEnabled}
					<span class="gap"></span>
					<span class="help-key" style:color={helpColour}>E</span>
					<span> Edit</span>
				{/if}
			{/if}
		</div>
	{/if}
{/snippet}

<style>
	.workspace {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 16px;
		background: radial-gradient(ellipse at center, #2a2a2a 0%, var(--bg-workspace) 70%);
		overflow: hidden;
	}

	.stage {
		width: min(100%, 960px);
		aspect-ratio: var(--aspect);
		max-height: 100%;
		transform: rotate(var(--rotation));
		transition: transform 0.25s ease;
	}

	.stage.rotated {
		width: min(100%, 540px);
	}

	.screen {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: 1px solid var(--border-subtle);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
		font-family: "Limine Default", monospace;
		outline: none;
		image-rendering: pixelated;
	}

	.quiet-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #555;
		font-size: 14px;
	}

	.term-frame {
		display: flex;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	.term-fade {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		box-sizing: border-box;
	}

	/* Edge fade toward wallpaper (Limine margin_gradient). Avoid background
	   shorthand with "/" — PostCSS mis-parses it and feeds the whole .svelte
	   file to the CSS pipeline. */
	.term-fade.has-fade::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(to bottom, transparent, var(--term-bg)),
			linear-gradient(to top, transparent, var(--term-bg)),
			linear-gradient(to right, transparent, var(--term-bg)),
			linear-gradient(to left, transparent, var(--term-bg));
		background-repeat: no-repeat;
		background-position:
			center top,
			center bottom,
			left center,
			right center;
		background-size:
			100% var(--grad),
			100% var(--grad),
			var(--grad) 100%,
			var(--grad) 100%;
	}

	.term-fade > .term {
		position: relative;
		z-index: 1;
	}

	.term {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		padding: 0;
		padding-bottom: 1em;
		line-height: 1;
		overflow: hidden;
		font-family: inherit;
	}

	.branding {
		text-align: center;
		font-weight: 400;
		flex-shrink: 0;
	}

	.spacer-lines {
		white-space: pre;
		line-height: 1;
		height: 1em;
		flex-shrink: 0;
	}

	.help-row {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0;
		flex-shrink: 0;
		margin-bottom: 0;
		color: inherit;
	}

	.help-row .gap {
		width: 4ch;
	}

	.help-key {
		font-weight: 400;
	}

	.scroll-cue {
		text-align: center;
		flex-shrink: 0;
		opacity: 0.85;
	}

	.tree {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 0;
		overflow: hidden;
		padding: 0;
	}

	.tree-block {
		width: max-content;
		max-width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.empty {
		opacity: 0.8;
	}

	.entry {
		display: flex;
		width: max-content;
		max-width: 100%;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		letter-spacing: inherit;
		text-align: left;
		cursor: pointer;
		white-space: pre;
	}

	.entry.selected .name {
		background: var(--rev-bg);
		color: var(--rev-fg);
	}

	.entry .decor {
		flex-shrink: 0;
	}

	.entry .name {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.footer {
		flex-shrink: 0;
		margin-top: auto;
		padding-top: 0;
		text-align: center;
	}

	.comment {
		margin: 0;
	}
</style>
