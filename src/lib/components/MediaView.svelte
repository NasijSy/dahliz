<script>
    let { path, label } = $props();

    const VIDEO_EXTS = new Set(['mp4', 'mkv', 'm4v', '3gp', 'webm', 'ogg', 'mov', 'avi']);

    function resolveType(filePath) {
        const ext = (filePath ?? '').split('.').pop().toLowerCase();
        return VIDEO_EXTS.has(ext) ? 'video' : 'image';
    }

    const resolvedType = $derived(resolveType(path));
</script>

{#if resolvedType === 'video'}
    <video controls class="w-full h-full object-contain">
        <source src={path} />
    </video>
{:else}
    <img class="w-full h-full object-contain" src={path} alt={label} />
{/if}
