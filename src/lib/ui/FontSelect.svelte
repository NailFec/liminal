<script lang="ts">
	import Select from "$lib/ui/Select.svelte";
	import {
		BUNDLED_FONTS,
		ensurePreviewFontLoaded,
		fontSelectOptions,
		resolveBundledFont,
	} from "$lib/limine/fonts";

	type Props = {
		value?: string;
		disabled?: boolean;
		onchange?: (liminePath: string, glyphSize: string) => void;
	};

	let { value = "", disabled = false, onchange }: Props = $props();

	let options = $derived.by(() => {
		const base = fontSelectOptions();
		const trimmed = value.trim();
		if (!trimmed) return base;
		if (base.some((o) => o.value === trimmed)) return base;
		const known = BUNDLED_FONTS.some(
			(f) => resolveBundledFont(trimmed).liminePath === trimmed || f.liminePath === trimmed,
		);
		if (known) return base;
		return [...base, { value: trimmed, label: `Custom: ${trimmed}` }];
	});

	let selectValue = $derived.by(() => {
		const trimmed = value.trim();
		if (!trimmed) return "";
		if (options.some((o) => o.value === trimmed)) return trimmed;
		return resolveBundledFont(trimmed).liminePath;
	});

	let sampleFamily = $derived(resolveBundledFont(selectValue).previewFamily);

	$effect(() => {
		void ensurePreviewFontLoaded(resolveBundledFont(selectValue));
	});

	function onPick(next: string) {
		const matched = BUNDLED_FONTS.find((f) => f.liminePath === next);
		if (matched) {
			onchange?.(matched.liminePath, matched.glyphSize);
			return;
		}
		const font = resolveBundledFont(next);
		onchange?.(next, font.glyphSize);
	}
</script>

<div class="font-select">
	<Select value={selectValue} {options} {disabled} onchange={onPick} />
	<p class="sample" style:font-family="{sampleFamily}, monospace" aria-hidden="true">
		Aa Bb Cc 0123 │├└──►
	</p>
</div>

<style>
	.font-select {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.sample {
		margin: 0;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: #0a0a0a;
		color: #aaaaaa;
		font-size: 16px;
		line-height: 1;
		letter-spacing: 0;
		white-space: nowrap;
		overflow: hidden;
		image-rendering: pixelated;
	}
</style>
