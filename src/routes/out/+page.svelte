<script> 
  let { data } = $props();
  
  function handleRedirect() {
    if (data.decodedUrl) {
        window.location = data.decodedUrl;
    }
  }
</script>

<main class="flex-1 flex items-center justify-center">
  <div class="max-w-3xl mx-auto text-center" dir="rtl">
    <h2>متابعة إلى رابط</h2>
    <div class="flex flex-col gap-2 mt-8">
      {#if data.decodedUrl}
        <p>سيتم توجيهك إلى الرابط التالي:</p>
        <code class="text-blue-500">{data.decodedUrl}</code>        
        <div class="mt-4">
          <button class="p-2 rounded-lg border-2 border-black bg-black text-white hover:bg-blue-600 hover:border-blue-600" onclick={handleRedirect}>متابعة إلى الرابط</button>
          <button class="p-2 rounded-lg border-2 hover:bg-gray-500 hover:border-gray-500 hover:text-white" onclick={() => window.history.back()}>رجوع</button>
        </div>
      {:else}
        <p class="p-2 bg-red-300 rounded-lg">لم يتم تقديم رابط صالح</p>
        <div class="mt-4">
            <button class="p-2 rounded-lg border-2 hover:bg-gray-500 hover:border-gray-500 hover:text-white" onclick={() => window.history.back()}>رجوع</button>
        </div>
      {/if}
    </div>
  </div>
</main>