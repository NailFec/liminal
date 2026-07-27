<script lang="ts">
	import type { YesNo } from "$lib/limine/types";

	type Props = {
		value?: YesNo;
		disabled?: boolean;
		onchange?: (value: YesNo) => void;
	};

	let { value = "no", disabled = false, onchange }: Props = $props();
</script>

<div class="toggle" class:disabled role="group" aria-disabled={disabled}>
	<button
		type="button"
		class:active={value === "yes"}
		{disabled}
		onclick={() => onchange?.("yes")}
	>
		yes
	</button>
	<button
		type="button"
		class:active={value === "no"}
		{disabled}
		onclick={() => onchange?.("no")}
	>
		no
	</button>
</div>

<style>
	.toggle {
		display: inline-flex;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		overflow: hidden;
	}

	button {
		padding: 3px 10px;
		border: none;
		background: var(--bg-input);
		color: var(--text-muted);
		font-size: 12px;
	}

	button:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	button.active {
		background: var(--bg-active);
		color: #fff;
	}

	.toggle.disabled button {
		cursor: not-allowed;
	}
</style>
