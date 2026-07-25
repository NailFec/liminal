<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import type { Snippet } from "svelte";

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let path = $derived(page.url.pathname);
</script>

<div class="app">
	<header class="topbar">
		<div class="brand">liminal</div>
		<nav class="modes" aria-label="Mode">
			<a href={resolve("/design")} class="mode" class:active={path.startsWith("/design")}
				>Design</a
			>
			<a href={resolve("/system")} class="mode" class:active={path.startsWith("/system")}
				>System</a
			>
		</nav>
		<div class="spacer"></div>
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
	}

	.content {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
</style>
