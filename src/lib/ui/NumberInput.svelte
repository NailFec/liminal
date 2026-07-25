<script lang="ts">
	type Props = {
		value?: string;
		min?: number;
		onchange?: (value: string) => void;
	};

	let { value = "0", min = 0, onchange }: Props = $props();
</script>

<input
	class="input"
	type="number"
	{value}
	{min}
	oninput={(e) => onchange?.(e.currentTarget.value)}
/>

<style>
	.input {
		width: 100%;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.input:focus {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}
</style>
