<script>
    import ReferenceCarousel from "$lib/components/ReferenceCarousel.svelte";

    /**
     * data = a profileEntry slice from a case JSON:
     * { username, description, source[], analysis[] }
     *
     * title = the case-level title (passed from the parent page)
     */
    let { data, title = '' } = $props();
</script>

{#if title}
  <h4>{title}</h4>
{/if}
{#if data.description}
  <p class="text-gray-600 mb-4">{data.description}</p>
{/if}

{#if data.source?.length || data.analysis?.length}
  <div class="flex flex-col gap-2 md:flex-row mt-4">
    {#if data.source?.length}
      <div class="flex flex-col md:w-1/2 md:max-w-md bg-red-100 p-2">
        <h5 class="text-red-600">الإدعاء</h5>
        <ReferenceCarousel references={data.source} />
      </div>
    {/if}
    {#if data.analysis?.length}
      <div class="flex flex-col md:w-1/2 md:max-w-md bg-green-100 p-2">
        <h5 class="text-green-600">الحقيقة</h5>
        <ReferenceCarousel references={data.analysis} />
      </div>
    {/if}
  </div>
{/if}