<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		title: string;
		collapsedByDefault?: boolean;
		children: Snippet;
	};

	let { title, collapsedByDefault = false, children }: Props = $props();

	// Initial accordion state only — user toggles own thereafter.
	// svelte-ignore state_referenced_locally
	let open = $state(!collapsedByDefault);
</script>

<section class="section">
	<button type="button" class="header" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="chevron" class:open>{open ? "▾" : "▸"}</span>
		<span class="title">{title}</span>
	</button>
	{#if open}
		<div class="body">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.section {
		border-bottom: 1px solid var(--border);
	}

	.header {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 6px 8px;
		border: none;
		background: var(--bg-panel);
		color: var(--text);
		text-align: left;
	}

	.header:hover {
		background: var(--bg-hover);
	}

	.chevron {
		width: 12px;
		color: var(--text-muted);
		font-size: 11px;
	}

	.title {
		font-weight: 500;
		font-size: 12px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		background: var(--bg-panel-deep);
	}
</style>
