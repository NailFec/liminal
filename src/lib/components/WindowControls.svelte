<script lang="ts">
	import { onMount } from "svelte";
	import { isTauri } from "@tauri-apps/api/core";
	import { getCurrentWindow } from "@tauri-apps/api/window";

	let maximized = $state(false);

	async function refreshMaximized() {
		if (!isTauri()) return;
		maximized = await getCurrentWindow().isMaximized();
	}

	onMount(() => {
		if (!isTauri()) return;

		let disposed = false;
		let unlisten: (() => void) | undefined;

		void (async () => {
			const appWindow = getCurrentWindow();
			const max = await appWindow.isMaximized();
			if (disposed) return;
			maximized = max;
			unlisten = await appWindow.onResized(() => {
				void refreshMaximized();
			});
			if (disposed) {
				unlisten();
				unlisten = undefined;
			}
		})();

		return () => {
			disposed = true;
			unlisten?.();
		};
	});

	async function minimize() {
		if (!isTauri()) return;
		await getCurrentWindow().minimize();
	}

	async function toggleMaximize() {
		if (!isTauri()) return;
		await getCurrentWindow().toggleMaximize();
		await refreshMaximized();
	}

	async function close() {
		if (!isTauri()) return;
		await getCurrentWindow().close();
	}
</script>

<div class="controls">
	<button type="button" class="btn" aria-label="Minimize" onclick={minimize}>
		<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
			<path d="M1 5h8" fill="none" stroke="currentColor" stroke-width="1.2" />
		</svg>
	</button>
	<button
		type="button"
		class="btn"
		aria-label={maximized ? "Restore" : "Maximize"}
		onclick={toggleMaximize}
	>
		{#if maximized}
			<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
				<path
					d="M2.5 3.5h5v5h-5zM3.5 2.5h5v5"
					fill="none"
					stroke="currentColor"
					stroke-width="1.1"
				/>
			</svg>
		{:else}
			<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
				<rect
					x="1.5"
					y="1.5"
					width="7"
					height="7"
					fill="none"
					stroke="currentColor"
					stroke-width="1.2"
				/>
			</svg>
		{/if}
	</button>
	<button type="button" class="btn close" aria-label="Close" onclick={close}>
		<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
			<path
				d="M2 2l6 6M8 2L2 8"
				fill="none"
				stroke="currentColor"
				stroke-width="1.2"
			/>
		</svg>
	</button>
</div>

<style>
	.controls {
		display: flex;
		align-items: stretch;
		height: 100%;
		margin-right: -10px;
		flex-shrink: 0;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 100%;
		padding: 0;
		border: none;
		border-radius: 0;
		background: transparent;
		color: var(--text-muted);
	}

	.btn:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.btn.close:hover {
		background: #5a3030;
		color: #f0d0d0;
	}
</style>
