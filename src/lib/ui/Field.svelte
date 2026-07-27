<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		label: string;
		help?: string;
		children: Snippet;
	};

	let { label, help, children }: Props = $props();
</script>

<div class="field" title={help}>
	<span class="label">{label}</span>
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

	.label {
		font-size: 12px;
		color: var(--text-muted);
	}

	.control {
		min-width: 0;
	}
</style>
