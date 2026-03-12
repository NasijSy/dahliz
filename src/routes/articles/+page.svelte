<script>
  import Head from '$lib/components/Head.svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';

  let { data } = $props();
</script>

<Head title="المقالات" />

<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
  <div id="hero" class="h-72 md:h-80"></div>
</div>

<main class="flex flex-col w-full max-w-7xl mx-auto mt-8 px-2 grow" dir="rtl">
    <h1 class="mb-3! text-4xl md:text-5xl font-black">المقالات</h1>
    <p class="text-gray-600 text-lg">تحليلات ومصادر وتقارير حول التضليل والتحقق من المعلومات</p>

  {#if data.articles.length === 0}
    <p class="text-center text-gray-500 py-16 text-lg">لا توجد مقالات منشورة حالياً.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.articles as article}
        <ArticleCard {article} />
      {/each}
    </div>
  {/if}
</main>

<style>
  #hero {
    background-image: url('/media/resources.jpg');
    background-size: cover;
    background-color: #FFF5C3;
    background-position: center center;
    background-repeat: no-repeat;
  }
</style>