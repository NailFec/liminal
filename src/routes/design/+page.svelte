<script lang="ts">
	import OptionsPanel from "$lib/components/OptionsPanel.svelte";
	import LiminePreview from "$lib/components/LiminePreview.svelte";
	import ConfigSnippet from "$lib/components/ConfigSnippet.svelte";
</script>

<div class="design">
	<div class="options">
		<OptionsPanel />
		<ConfigSnippet />
	</div>
	<div class="preview">
		<header class="preview-header">Preview</header>
		<div class="preview-body">
			<LiminePreview />
		</div>
	</div>
</div>

<style>
	.design {
		display: grid;
		grid-template-columns: 25% 75%;
		height: 100%;
		min-height: 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		border-right: 1px solid var(--border);
	}

	.preview {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		background: var(--bg-workspace);
	}

	.preview-header {
		height: 28px;
		padding: 0 10px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--border);
		background: var(--bg-panel);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.preview-body {
		flex: 1;
		min-height: 0;
	}
</style>
