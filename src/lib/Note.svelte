<script>
	let { content } = $props();
</script>

{#if content}
<div class="flex items-center py-2 px-4 bg-yellow-50 border-2 border-yellow-500">
    {@render content()}
</div>
{/if}