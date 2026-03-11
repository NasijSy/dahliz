<script>
    import Head from '$lib/Head.svelte';

    let { data } = $props();
</script>

<Head title="عن المشروع وأهدافه" />
<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
    <div class="h-72 md:h-80 bg-black text-white flex flex-col items-center pt-4 overflow-hidden">
    </div>
</div>
<main class="flex flex-col w-full max-w-7xl mx-auto mt-6 px-2 grow" dir="rtl">
    {@html data.content}
</main>