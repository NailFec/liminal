<script lang="ts">
	import {
		fromColorInputValue,
		normalizeHex,
		toColorInputValue,
	} from "$lib/limine/colors";

	type Props = {
		value?: string;
		alpha?: boolean;
		disabled?: boolean;
		onchange?: (value: string) => void;
	};

	let {
		value = "000000",
		alpha = false,
		disabled = false,
		onchange,
	}: Props = $props();

	let picker = $derived(toColorInputValue(value));
	let hex = $derived(normalizeHex(value));
</script>

<div class="color" class:disabled>
	<input
		type="color"
		value={picker}
		{disabled}
		oninput={(e) => {
			const next = fromColorInputValue(e.currentTarget.value, value);
			onchange?.(next);
		}}
	/>
	<input
		class="hex"
		type="text"
		spellcheck="false"
		value={hex}
		{disabled}
		placeholder={alpha ? "TTRRGGBB" : "RRGGBB"}
		oninput={(e) => onchange?.(normalizeHex(e.currentTarget.value))}
	/>
</div>

<style>
	.color {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	input[type="color"] {
		width: 28px;
		height: 24px;
		padding: 0;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: transparent;
		cursor: pointer;
	}

	.hex {
		flex: 1;
		min-width: 0;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.hex:focus {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}
</style>
