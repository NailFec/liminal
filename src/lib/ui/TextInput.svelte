<script lang="ts">
	type Props = {
		value?: string;
		placeholder?: string;
		mono?: boolean;
		disabled?: boolean;
		onchange?: (value: string) => void;
	};

	let {
		value = "",
		placeholder = "",
		mono = false,
		disabled = false,
		onchange,
	}: Props = $props();
</script>

<input
	class="input"
	class:mono
	type="text"
	{value}
	{placeholder}
	{disabled}
	spellcheck="false"
	oninput={(e) => onchange?.(e.currentTarget.value)}
/>

<style>
	.input {
		width: 100%;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		font-size: 12px;
	}

	.input.mono {
		font-family: var(--font-mono);
	}

	.input:focus {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}

	.input::placeholder {
		color: var(--text-dim);
	}
</style>
