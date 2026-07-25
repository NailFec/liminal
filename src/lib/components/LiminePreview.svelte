<script lang="ts">
	import {
		deriveBrightHelpColour,
		parsePalette,
		parseResolution,
		toCssColor,
	} from "$lib/limine/colors";
	import { designStore } from "$lib/limine/store.svelte";

	const DEMO_ENTRIES = [
		{ title: "Arch Linux", comment: "Boot the default kernel" },
		{ title: "Arch Linux (fallback)", comment: "Fallback initramfs" },
		{ title: "UEFI Shell", comment: "Launch EFI shell" },
	];

	let selected = $state(0);

	let cfg = $derived(designStore.config);

	let resolution = $derived(parseResolution(cfg.interface_resolution));
	let aspect = $derived(
		resolution ? `${resolution.width} / ${resolution.height}` : "16 / 9",
	);

	let rotation = $derived(Number(cfg.interface_rotation) || 0);
	let isRotated = $derived(rotation === 90 || rotation === 270);

	let brandingColour = $derived(toCssColor(cfg.interface_branding_colour, "#00aaaa"));
	let helpColour = $derived(toCssColor(cfg.interface_help_colour, "#00aa00"));
	let helpBright = $derived(
		toCssColor(
			cfg.interface_help_colour_bright || deriveBrightHelpColour(cfg.interface_help_colour),
			"#55ff55",
		),
	);

	let termBg = $derived(toCssColor(cfg.term_background, "rgba(0,0,0,0.5)"));
	let termFg = $derived(toCssColor(cfg.term_foreground, "#aaaaaa"));
	let termFgBright = $derived(toCssColor(cfg.term_foreground_bright, "#ffffff"));
	let backdrop = $derived(toCssColor(cfg.backdrop, "#000000"));

	let palette = $derived(parsePalette(cfg.term_palette));
	let selectionBg = $derived(
		palette[4] ? `#${palette[4]}` : toCssColor(cfg.term_background_bright, "#555555"),
	);

	let margin = $derived(Math.max(0, Number(cfg.term_margin) || 0));
	let gradient = $derived(Math.max(0, Number(cfg.term_margin_gradient) || 0));
	let spacing = $derived(Math.max(0, Number(cfg.term_font_spacing) || 0));

	let scaleParts = $derived(cfg.term_font_scale.match(/^(\d+)x(\d+)$/i));
	let scaleX = $derived(scaleParts ? Math.min(8, Number(scaleParts[1]) || 1) : 1);
	let scaleY = $derived(scaleParts ? Math.min(8, Number(scaleParts[2]) || 1) : 1);
	let fontSize = $derived(Math.round(14 * scaleY));
	let letterSpacing = $derived(spacing + (scaleX - 1) * 2);

	let timeoutLabel = $derived.by(() => {
		const t = cfg.timeout.trim().toLowerCase();
		if (t === "no" || t === "") return null;
		const n = Number(t);
		if (Number.isNaN(n)) return t;
		return String(Math.max(0, Math.floor(n)));
	});

	let showHelp = $derived(cfg.interface_help_hidden !== "yes" && cfg.quiet !== "yes");
	let graphics = $derived(cfg.graphics !== "no");

	// Preview uses a placeholder gradient when wallpaper paths are set (no real file I/O yet).
	let hasWallpaper = $derived(cfg.wallpaper.some((p) => p.trim().length > 0));

	let wallpaperBgSize = $derived.by(() => {
		if (cfg.wallpaper_style === "tiled") return "120px 80px";
		if (cfg.wallpaper_style === "centered") return "contain";
		return "cover";
	});

	let wallpaperBgRepeat = $derived(
		cfg.wallpaper_style === "tiled" ? "repeat" : "no-repeat",
	);
</script>

<div class="workspace">
	<div
		class="stage"
		class:rotated={isRotated}
		style:--aspect={aspect}
		style:--rotation="{rotation}deg"
	>
		<div
			class="screen"
			class:text-mode={!graphics}
			style:background-color={backdrop}
			style:background-image={hasWallpaper && graphics
				? "linear-gradient(135deg, #1a2838 0%, #0d1520 40%, #243044 100%)"
				: "none"}
			style:background-size={wallpaperBgSize}
			style:background-repeat={wallpaperBgRepeat}
			style:background-position="center"
		>
			{#if graphics}
				{#if cfg.interface_branding}
					<div class="branding" style:color={brandingColour}>
						{cfg.interface_branding}
					</div>
				{/if}

				{#if showHelp}
					<div class="help" style:color={helpColour}>
						<span>Arrow keys to select · Enter to boot · E edit · B blank</span>
						{#if timeoutLabel !== null}
							<span class="timeout">
								Timeout:
								<span class="digit" style:color={helpBright}>{timeoutLabel}</span>
							</span>
						{/if}
					</div>
				{/if}

				<div
					class="term-wrap"
					style:padding="{margin}px"
					style:--grad={gradient}
				>
					<div
						class="term"
						style:background={termBg}
						style:color={termFg}
						style:font-size="{fontSize}px"
						style:letter-spacing="{letterSpacing}px"
						style:box-shadow="0 0 0 {gradient}px color-mix(in srgb, {termBg} 35%, transparent)"
					>
						{#each DEMO_ENTRIES as entry, i (entry.title)}
							<button
								type="button"
								class="entry"
								class:selected={selected === i}
								style:--sel-bg={selectionBg}
								style:--sel-fg={termFgBright}
								onclick={() => (selected = i)}
							>
								<span class="entry-title">{entry.title}</span>
							</button>
						{/each}
						{#if DEMO_ENTRIES[selected]}
							<p class="comment">{DEMO_ENTRIES[selected].comment}</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="text-mode-body">
					<pre>
Limine {cfg.interface_branding || "Boot Menu"} (text mode)

{#each DEMO_ENTRIES as entry, i (entry.title)}
{selected === i ? ">" : " "} {entry.title}
{/each}
					</pre>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.workspace {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 16px;
		background:
			radial-gradient(ellipse at center, #2a2a2a 0%, var(--bg-workspace) 70%);
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
		font-family: var(--font-mono);
	}

	.screen.text-mode {
		background: #000 !important;
		color: #aaa;
	}

	.branding {
		position: absolute;
		top: 12px;
		left: 0;
		right: 0;
		text-align: center;
		font-size: 18px;
		font-weight: 500;
		pointer-events: none;
		z-index: 2;
	}

	.help {
		position: absolute;
		top: 40px;
		left: 16px;
		right: 16px;
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 12px;
		z-index: 2;
		pointer-events: none;
	}

	.timeout {
		white-space: nowrap;
	}

	.digit {
		font-weight: 600;
	}

	.term-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.term {
		width: 100%;
		max-width: 520px;
		min-height: 180px;
		padding: 16px 20px;
		border-radius: 2px;
		line-height: 1.5;
	}

	.entry {
		display: block;
		width: 100%;
		padding: 2px 6px;
		margin: 0;
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.entry.selected {
		background: var(--sel-bg);
		color: var(--sel-fg);
	}

	.comment {
		margin: 16px 6px 0;
		opacity: 0.85;
		font-size: 0.9em;
	}

	.text-mode-body {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 24px;
	}

	pre {
		margin: 0;
		font: inherit;
		font-size: 14px;
		line-height: 1.6;
		white-space: pre-wrap;
	}
</style>
