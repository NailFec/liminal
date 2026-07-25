<script lang="ts">
	type Option = { value: string; label: string };

	type Props = {
		value?: string;
		options?: Option[];
		onchange?: (value: string) => void;
	};

	let { value = "", options = [], onchange }: Props = $props();
</script>

<select
	class="select"
	{value}
	onchange={(e) => onchange?.(e.currentTarget.value)}
>
	{#each options as opt (opt.value)}
		<option value={opt.value}>{opt.label}</option>
	{/each}
</select>

<style>
	.select {
		width: 100%;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		font-size: 12px;
	}

	.select:focus {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}

	option {
		background: var(--bg-panel);
	}
</style>
