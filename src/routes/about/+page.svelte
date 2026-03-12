<script>
    import Head from '$lib/components/Head.svelte';

    let { data } = $props();
</script>

<Head title="عن المشروع وأهدافه" />
<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
  <div id="hero" class="h-72 md:h-80"></div>
</div>
<main class="flex flex-col w-full max-w-7xl mx-auto mt-6 px-2 grow" dir="rtl">
    {@html data.content}
</main>

<style>
    #hero {
        background-image: url('/media/about.jpg');
        background-size: cover;
        background-color: white;
        background-position: top center;
        background-repeat: no-repeat;
    }
</style>