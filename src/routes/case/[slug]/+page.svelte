<script>
  import Head from '$lib/components/Head.svelte';
  import Case from '$lib/components/Case.svelte';

  let { data } = $props();
  const c = $derived(data.case);
</script>

<Head title={c.title} />
<div class="max-w-7xl mx-auto my-14 px-2" dir="rtl">
  <h1 class="text-3xl font-bold mb-2">{c.title}</h1>

  {#if c.dateAdded}
    <div class="text-gray-500 text-sm mb-6">
      <span>تاريخ الإضافة: </span>
      <time datetime={c.dateAdded}>
        {new Date(c.dateAdded).toLocaleDateString('ar-SY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    </div>
  {/if}

  {#if c.type}
    <span class="pill border-2 mb-6 inline-block">{c.type}</span>
  {/if}

  <div class="flex flex-col gap-10 mt-6">
    {#each c.profiles as profileEntry}
      <section class="border-t pt-6">
        <a href="/profile/{profileEntry.username}" class="font-bold text-lg hover:underline mb-4 inline-block">
          @{profileEntry.username}
        </a>
        <Case data={profileEntry} />
      </section>
    {/each}
  </div>
</div>