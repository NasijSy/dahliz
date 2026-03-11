<script>
    import MediaView from '$lib/carousel/MediaView.svelte';
    import LeftArrow from '$lib/icons/circle-chevron-left.svelte';
    import RightArrow from '$lib/icons/circle-chevron-right.svelte';
    import LinkIcon from '$lib/icons/link.svelte';
    import SaveIcon from '$lib/icons/save.svelte';

    let { references } = $props();

    let currentIndex = $state(0);
    
    const canGoNext = $derived(currentIndex < references.length - 1);
    const canGoPrev = $derived(currentIndex > 0);
    const currentReference = $derived(references[currentIndex]);
    const hasMultipleItems = $derived(references.length > 1);

    function goToNext() {
        if (canGoNext) {
            currentIndex++;
        }
    }

    function goToPrev() {
        if (canGoPrev) {
            currentIndex--;
        }
    }
</script>

<div class="flex flex-col grow space-y-2">
    <div class="flex items-center gap-2 text-sm min-h-5">
        <span class="text-gray-600">تاريخ النشر:</span>
        <time datetime={currentReference.date} class="font-medium">
            {new Date(currentReference.date).toLocaleDateString('ar-SY', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}
        </time>
    </div>

    <p class="grow">{currentReference.label}</p>
    
    <div class="relative">
        {#if hasMultipleItems}
            <div class="absolute top-1/2 left-0 right-0 z-10 flex justify-between items-center px-2 -translate-y-1/2 pointer-events-none">
                <button onclick={goToPrev} disabled={!canGoPrev} class="pointer-events-auto transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 bg-white/90 rounded-full shadow-lg" aria-label="المرجع السابق">
                    <RightArrow class="w-8 h-8" />
                </button>

                <button onclick={goToNext} disabled={!canGoNext} class="pointer-events-auto transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 bg-white/90 rounded-full shadow-lg" aria-label="المرجع التالي">
                    <LeftArrow class="w-8 h-8" />
                </button>
            </div>

            <div id="indicators" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {#each references as _, i}
                    <button onclick={() => currentIndex = i} class="w-2 h-2 rounded-full transition-all border-2 border-white/30 {i === currentIndex ? 'bg-white w-4 scale-110' : 'bg-white/60 hover:bg-white/80'}" aria-label={`انتقل إلى المرجع ${i + 1}`}></button>
                {/each}
            </div>
        {/if}

        <div class="overflow-hidden rounded-lg h-100 md:h-125 bg-gray-400/25 flex items-center justify-center">
            <MediaView 
                type={currentReference.mediaType} 
                path={currentReference.mediaPath} 
                label={currentReference.label}
            />
        </div>
    </div>

    <div id="reference-links" class="flex flex-row flex-wrap gap-2 min-h-8">
        {#if currentReference.url}
            <a href={currentReference.url} target="_blank" rel="noopener noreferrer" class="pill gap-1! border-2 hover:bg-gray-100 transition-colors">
                <LinkIcon class="size-4" />
                <span>المصدر</span>
            </a>
        {/if}
        {#if currentReference.archiveURL}
            <a href={currentReference.archiveURL} target="_blank" rel="noopener noreferrer" class="pill gap-1! border-2 hover:bg-gray-100 transition-colors">
                <SaveIcon class="size-4" />
                <span>الأرشيف</span>
            </a>
        {/if}
    </div>
</div>

<style>
    time, a {
        transition: all 0.2s ease-in-out;
    }
</style>