<script>
    /** @type {{ value: string, label: string }[]} */
    let { options = [], selected = [], placeholder = 'اختر...', onchange } = $props();

    let open = $state(false);
    let containerEl = $state(null);

    const selectedLabels = $derived(
        selected.length === 0
            ? placeholder
            : options
                .filter((o) => selected.includes(o.value))
                .map((o) => o.label)
                .join('، ')
    );

    function toggle(value) {
        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
        onchange?.(next);
    }

    function handleClickOutside(e) {
        if (containerEl && !containerEl.contains(e.target)) {
            open = false;
        }
    }
</script>

<svelte:document onclick={handleClickOutside} />

<div class="relative" bind:this={containerEl}>
    <button
        type="button"
        onclick={() => (open = !open)}
        class="flex items-center gap-2 border-2 rounded-full px-4 py-1 bg-white transition-colors cursor-pointer min-w-32 max-w-56
            {open ? 'border-black' : 'border-gray-200 hover:border-gray-400'}"
    >
        <span class="flex-1 text-start truncate text-sm
            {selected.length > 0 ? 'text-black' : 'text-gray-500'}">
            {selectedLabels}
        </span>
        <svg
            class="w-3 h-3 shrink-0 text-gray-400 transition-transform {open ? 'rotate-180' : ''}"
            viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>

    {#if open}
        <div class="absolute z-50 mt-1 bg-white border-2 border-black rounded-lg shadow-lg min-w-full w-max max-w-64 overflow-hidden"
             dir="rtl"
        >
            {#if options.length === 0}
                <p class="text-gray-400 text-sm px-4 py-2">لا توجد خيارات</p>
            {:else}
                <ul class="max-h-60 overflow-y-auto list-none! py-1">
                    {#each options as opt}
                        {@const checked = selected.includes(opt.value)}
                        <li>
                            <button
                                type="button"
                                onclick={() => toggle(opt.value)}
                                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-start hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <span class="w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors
                                    {checked ? 'bg-black border-black' : 'border-gray-300'}">
                                    {#if checked}
                                        <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    {/if}
                                </span>
                                {opt.label}
                            </button>
                        </li>
                    {/each}
                </ul>
                {#if selected.length > 0}
                    <div class="border-t border-gray-100 px-3 py-1.5">
                        <button
                            type="button"
                            onclick={() => onchange?.([])}
                            class="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            مسح التحديد
                        </button>
                    </div>
                {/if}
            {/if}
        </div>
    {/if}
</div>