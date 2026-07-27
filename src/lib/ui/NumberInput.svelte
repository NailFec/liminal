<script lang="ts">
	type Props = {
		value?: string;
		min?: number;
		onchange?: (value: string) => void;
	};

	let { value = "0", min = 0, onchange }: Props = $props();

	function bump(delta: number) {
		const current = Number(value);
		const next = Number.isFinite(current) ? current + delta : min;
		const clamped = Math.max(min, next);
		onchange?.(String(clamped));
	}
</script>

<div class="number">
	<input
		class="input"
		type="text"
		inputmode="numeric"
		{value}
		oninput={(e) => onchange?.(e.currentTarget.value)}
	/>
	<div class="steppers" aria-hidden="true">
		<button type="button" class="step" tabindex="-1" onclick={() => bump(1)}>+</button>
		<button type="button" class="step" tabindex="-1" onclick={() => bump(-1)}>−</button>
	</div>
</div>

<style>
	.number {
		display: flex;
		align-items: stretch;
		width: 100%;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius);
		background: var(--bg-input);
		overflow: hidden;
	}

	.number:focus-within {
		outline: 1px solid var(--focus-ring);
		border-color: var(--focus-ring);
	}

	.input {
		flex: 1;
		min-width: 0;
		padding: 4px 6px;
		border: none;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text);
	}

	.input:focus {
		outline: none;
	}

	.steppers {
		display: flex;
		flex-direction: column;
		width: 18px;
		border-left: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.step {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		background: var(--bg-panel);
		color: var(--text-muted);
		font-size: 10px;
		line-height: 1;
		min-height: 0;
	}

	.step + .step {
		border-top: 1px solid var(--border-subtle);
	}

	.step:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.step:active {
		background: var(--bg-active);
		color: #fff;
	}
</style>
