<script>
    let { type, path, label } = $props();
</script>

{#if type === 'video'}
    <video controls class="w-full h-full object-contain">
        <source src={path} type="video/mp4" />
    </video>
{:else}
    <img class="w-full h-full object-contain" src={path} alt={label} />
{/if}
