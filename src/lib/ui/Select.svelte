<script lang="ts">
	type Option = { value: string; label: string };

	type Props = {
		value?: string;
		options?: Option[];
		disabled?: boolean;
		onchange?: (value: string) => void;
	};

	let { value = "", options = [], disabled = false, onchange }: Props = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement | undefined = $state();
	let menuPos = $state({ top: 0, left: 0, width: 0 });
	const rootId = `select-${Math.random().toString(36).slice(2, 9)}`;

	let selectedLabel = $derived(
		options.find((opt) => opt.value === value)?.label ?? value,
	);

	function placeMenu() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		menuPos = {
			top: rect.bottom + 2,
			left: rect.left,
			width: rect.width,
		};
	}

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) placeMenu();
	}

	function pick(event: Event, next: string) {
		event.preventDefault();
		event.stopPropagation();
		onchange?.(next);
		open = false;
	}

	function onWindowPointerDown(event: PointerEvent) {
		if (!open) return;
		const target = event.target as Element | null;
		if (target?.closest(`[data-select-id="${rootId}"]`)) return;
		open = false;
	}

	function onWindowScroll() {
		if (open) placeMenu();
	}

	$effect(() => {
		if (!open) return;
		const onScroll = () => placeMenu();
		document.addEventListener("scroll", onScroll, true);
		return () => document.removeEventListener("scroll", onScroll, true);
	});

	function onKeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (!open) {
			if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				open = true;
				placeMenu();
			}
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			open = false;
			return;
		}

		const index = options.findIndex((opt) => opt.value === value);
		if (event.key === "ArrowDown") {
			event.preventDefault();
			const next = options[Math.min(options.length - 1, Math.max(0, index) + 1)];
			if (next) onchange?.(next.value);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			const next = options[Math.max(0, index - 1)];
			if (next) onchange?.(next.value);
		} else if (event.key === "Enter") {
			event.preventDefault();
			open = false;
		}
	}
</script>

<svelte:window
	onpointerdown={onWindowPointerDown}
	onscroll={onWindowScroll}
	onresize={onWindowScroll}
/>

<div class="select" class:disabled data-select-id={rootId}>
	<button
		type="button"
		class="trigger"
		bind:this={triggerEl}
		aria-haspopup="listbox"
		aria-expanded={open && !disabled}
		{disabled}
		onclick={toggle}
		onkeydown={onKeydown}
	>
		<span class="label">{selectedLabel}</span>
		<span class="chevron">▾</span>
	</button>

	{#if open && !disabled}
		<ul
			class="menu"
			role="listbox"
			style:top="{menuPos.top}px"
			style:left="{menuPos.left}px"
			style:width="{menuPos.width}px"
		>
			{#each options as opt (opt.value)}
				<li role="presentation">
					<button
						type="button"
						class="option"
						class:active={opt.value === value}
						role="option"
						aria-selected={opt.value === value}
						onpointerdown={(e) => pick(e, opt.value)}
					>
						{opt.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.select {
		position: relative;
		width: 100%;
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		width: 100%;
		padding: 4px 6px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		color: var(--text);
		font-size: 12px;
		text-align: left;
	}

	.trigger:hover {
		background: var(--bg-hover);
	}

	.trigger:focus {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}

	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron {
		flex-shrink: 0;
		color: var(--text-muted);
		font-size: 10px;
	}

	.menu {
		position: fixed;
		z-index: 1000;
		margin: 0;
		padding: 2px;
		list-style: none;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-panel);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
		max-height: 180px;
		overflow: auto;
	}

	.option {
		display: block;
		width: 100%;
		padding: 4px 6px;
		border: none;
		border-radius: 2px;
		background: transparent;
		color: var(--text);
		font-size: 12px;
		text-align: left;
	}

	.option:hover {
		background: var(--bg-hover);
	}

	.option.active {
		background: var(--bg-active);
		color: #fff;
	}
</style>
