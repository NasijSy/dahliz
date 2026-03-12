<script>
  let { article } = $props();
</script>

<a href="/articles/{article.slug}" class="group flex flex-col bg-white border-2 border-gray-200 hover:border-yellow-500 transition-all duration-200 overflow-hidden">
  {#if article.coverImage}
    <div class="h-48 overflow-hidden">
      <img
        src={article.coverImage}
        alt={article.title}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  {:else}
    <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      لا توجد صورة
    </div>
  {/if}
  <div class="flex flex-col flex-1 p-4 gap-2">
    <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
      {#if article.typeLabel}
        <span class="bg-gray-200 px-2 py-0.5 font-medium">{article.typeLabel}</span>
      {/if}
      {#if article.datePublished}
        <span>نشر في</span>
        <time datetime={article.datePublished}>{new Date(article.datePublished).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      {/if}
    </div>
    <h3 class="text-lg font-bold leading-snug group-hover:text-yellow-500 transition-colors">{article.title ?? ''}</h3>
    {#if article.summary}
      <p class="text-sm text-gray-600 line-clamp-3 flex-1">{article.summary}</p>
    {/if}
    {#if article.author}
      <p class="text-xs text-gray-400 mt-1">بقلم: {article.author}</p>
    {/if}
  </div>
</a>