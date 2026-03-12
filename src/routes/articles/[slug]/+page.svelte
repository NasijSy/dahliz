<script>
  import Head from '$lib/components/Head.svelte';

  let { data } = $props();
  let { article } = data;
</script>

<Head title={article.title} />

<main class="article flex flex-col w-full max-w-3xl mx-auto mt-8 px-4 grow" dir="rtl">
  <div class="mb-6">
    <a href="/articles" class="text-sm text-gray-500 hover:text-yellow-600 transition-colors">← العودة إلى المقالات</a>
  </div>

  <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
    {#if article.typeLabel}
      <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 font-medium">{article.typeLabel}</span>
    {/if}
    {#if article.datePublished}
      <span>{new Date(article.datePublished).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    {/if}
    {#if article.author}
      <span>· بقلم {article.author}</span>
    {/if}
  </div>

  <h1 class="text-3xl! md:text-4xl! font-black leading-snug mb-4!">{article.title}</h1>

  {#if article.summary}
    <p class="text-lg text-gray-600 border-r-4 border-yellow-400 pr-4 mb-6">{article.summary}</p>
  {/if}

  {#if article.coverImage}
    <img src={article.coverImage} alt={article.title} class="w-full object-cover mb-8 max-h-96" />
  {/if}

  <div class="prose prose-lg max-w-none text-gray-800 leading-8">
    {@html article.body}
  </div>
</main>

<style lang="postcss">
    @reference "tailwindcss";

    .article :global(h1) {
        @apply text-3xl! md:text-4xl! font-black leading-snug mb-4!;
    }
    .article :global(h2) {
        @apply text-2xl! md:text-3xl! font-bold leading-snug mt-8 mb-4!;
    }
    .article :global(h3) {
        @apply text-xl! md:text-2xl! font-semibold leading-snug mt-6 mb-3!;
    }

    .article :global(p) {
        @apply text-lg text-gray-600 mb-3!;
    }

    .article :global(img) {
        @apply rounded-lg;
    }

    .article :global(a) {
        @apply text-blue-600 hover:text-blue-800 transition-colors;
    }
</style>