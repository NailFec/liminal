<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		label: string;
		description?: string;
		showDescription?: boolean;
		disabled?: boolean;
		children: Snippet;
	};

	let {
		label,
		description,
		showDescription = false,
		disabled = false,
		children,
	}: Props = $props();
</script>

<div class="field" class:disabled>
	<span class="label">{label}</span>
	{#if showDescription && description}
		<p class="description">{description}</p>
	{/if}
	<div class="control">
		{@render children()}
	</div>
</div>

<style>
	.field {
		display: grid;
		grid-template-columns: 1fr;
		gap: 4px;
	}

	.field.disabled {
		opacity: 0.45;
		pointer-events: none;
	}

	.label {
		font-size: 12px;
		color: var(--text-muted);
	}

	.description {
		margin: 0;
		font-size: 11px;
		line-height: 1.4;
		color: var(--text-dim);
	}

	.control {
		min-width: 0;
	}
</style>
