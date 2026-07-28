<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import type { Snippet } from "svelte";
	import WindowControls from "$lib/components/WindowControls.svelte";
	import { liminalStore } from "$lib/limine/store.svelte";

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let path = $derived(page.url.pathname);
</script>


<div class="app">
	<header class="topbar">
		<div class="brand" data-tauri-drag-region>liminal</div>
		<nav class="modes" aria-label="Mode">
			<a href={resolve("/design")} class="mode" class:active={path.startsWith("/design")}
				>Design</a
			>
			<a href={resolve("/system")} class="mode" class:active={path.startsWith("/system")}
				>System</a
			>
		</nav>
		<div class="spacer" data-tauri-drag-region></div>
		{#if liminalStore.importedFrom}
			<span class="import-status" title={liminalStore.importedFrom}>
				imported: {liminalStore.importedFrom}
			</span>
		{/if}
		{#if liminalStore.importError}
			<span class="import-error">{liminalStore.importError}</span>
		{/if}
		<WindowControls />
	</header>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.topbar {
		display: flex;
		align-items: center;
		gap: 16px;
		height: var(--header-h);
		padding: 0 10px;
		background: var(--bg-panel);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		user-select: none;
	}

	.brand {
		font-weight: 600;
		font-size: 13px;
		letter-spacing: 0.04em;
		color: var(--text);
	}

	.modes {
		display: flex;
		gap: 2px;
		padding: 2px;
		background: var(--bg-panel-deep);
		border-radius: var(--radius);
	}

	.mode {
		padding: 3px 12px;
		border-radius: 2px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.mode:hover {
		color: var(--text);
		background: var(--bg-hover);
	}

	.mode.active {
		background: var(--bg-active);
		color: #fff;
	}

	.spacer {
		flex: 1;
		align-self: stretch;
	}

	.import-status {
		font-size: 11px;
		color: var(--text-dim);
		max-width: 280px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.import-error {
		font-size: 11px;
		color: #f88;
	}

	.content {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
</style>
