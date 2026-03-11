<script>
    import ReferenceCarousel from "$lib/ReferenceCarousel.svelte";

    let { data } = $props();
</script>

<h4>{data.title}</h4>
<p>{data.description}</p>
<div class="flex flex-col gap-2 md:flex-row mt-4">
    <div class="flex flex-col md:w-1/2 md:max-w-md bg-red-100 p-2">
        <h5 class="text-red-600">الإدعاء</h5>
        <ReferenceCarousel references={data.source} />
    </div>
    <div class="flex flex-col md:w-1/2 md:max-w-md bg-green-100 p-2">
        <h5 class="text-green-600">الحقيقة</h5>
        <ReferenceCarousel references={data.analysis} />
    </div>
</div>