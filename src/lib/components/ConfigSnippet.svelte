<script lang="ts">
	import { serializeLimineConfig } from "$lib/limine/serialize";
	import { liminalStore } from "$lib/limine/store.svelte";

	let open = $state(false);
	let copied = $state(false);

	let snippet = $derived(
		serializeLimineConfig(liminalStore.config, liminalStore.entries),
	);

	async function copy() {
		try {
			await navigator.clipboard.writeText(snippet);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			copied = false;
		}
	}
</script>

<div class="snippet" class:open>
	<button type="button" class="toggle" onclick={() => (open = !open)}>
		{open ? "Hide" : "Show"} config snippet
	</button>
	{#if open}
		<div class="body">
			<div class="toolbar">
				<span>limine.conf (globals + entries)</span>
				<button type="button" class="copy" onclick={copy}>
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<pre>{snippet}</pre>
		</div>
	{/if}
</div>

<style>
	.snippet {
		border-top: 1px solid var(--border);
		background: var(--bg-panel);
		flex-shrink: 0;
	}

	.toggle {
		width: 100%;
		padding: 6px 10px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-size: 12px;
		text-align: left;
	}

	.toggle:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.body {
		border-top: 1px solid var(--border);
		max-height: 180px;
		display: flex;
		flex-direction: column;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 10px;
		font-size: 11px;
		color: var(--text-dim);
	}

	.copy {
		padding: 2px 8px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text-muted);
		font-size: 11px;
	}

	.copy:hover {
		background: var(--bg-active);
		color: #fff;
		border-color: var(--bg-active);
	}

	pre {
		margin: 0;
		padding: 8px 10px 12px;
		overflow: auto;
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.45;
		color: var(--text);
		background: var(--bg-panel-deep);
	}
</style>
