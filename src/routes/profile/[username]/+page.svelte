<script>
  import Head from '$lib/components/Head.svelte';
  import TwitterIcon from '$lib/icons/twitter.svelte';
  import FacebookIcon from '$lib/icons/facebook.svelte';
  import InstagramIcon from '$lib/icons/instagram.svelte';
  import YoutubeIcon from '$lib/icons/youtube.svelte';
  import TelegramIcon from '$lib/icons/telegram.svelte';
  import LinkIcon from '$lib/icons/link.svelte';
  import Case from '$lib/components/Case.svelte';
  import { getTags } from '$lib/loadTags.js';

  let { data } = $props();

  const allTags = getTags();

  const typeConfig = {
    org:    { label: 'مؤسسة / منظمة' },
    person: { label: 'شخص' },
    anon:   { label: 'مجهول' },
    bot:    { label: 'بوت' },
  };

  const classificationConfig = {
    reliable:        { label: 'أخطاء محدودة',   class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    unreliable:      { label: 'غير موثوق',       class: 'bg-orange-100 text-orange-800 border-orange-300' },
    disinformation:  { label: 'تضليل ممنهج',     class: 'bg-red-100 text-red-800 border-red-300' },
  };

  const badge = classificationConfig[data.profile.classification] ?? null;
  const typeLabel = typeConfig[data.profile.type]?.label ?? data.profile.type;
  const resolvedTags = (data.profile.tags ?? [])
    .map((slug) => allTags.find((t) => t.slug === slug))
    .filter(Boolean);
</script>

<Head title={data.profile.name} />
<div class="max-w-7xl mx-auto my-14 px-2" dir="rtl">
  <div class="flex flex-col items-center text-center">
    <img src={data.profile.imagePath} alt={data.profile.name} class="w-32 h-32 rounded-full mb-4" />
    <h2 class="mb-2!">{data.profile.name}</h2>
    <p class="text-gray-400" dir="auto">@{data.profile.username}</p>
    
    <!-- Type, Classification, Tags -->
    <div class="flex flex-row gap-2 flex-wrap justify-center mt-2">
      <span class="text-xs px-2 py-0.5 rounded border border-gray-300 bg-gray-100 text-gray-700">
        {typeLabel}
      </span>
      {#if badge}
        <span class="text-xs px-2 py-0.5 rounded border font-medium {badge.class}">
          {badge.label}
        </span>
      {/if}
      {#each resolvedTags as tag}
        <span class="text-xs px-2 py-0.5 rounded-full border border-gray-300 bg-gray-50 text-gray-600">
          {tag.label}
        </span>
      {/each}
    </div>
  </div>

  <div class="text-center text-gray-600 mt-1">
    <span>آخر تحديث: </span>
    <time datetime={data.profile.lastUpdated}>
      {new Date(data.profile.lastUpdated).toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </time>
  </div>

  <div>
    <p class="mt-4">{data.profile.summary}</p>
  </div>

  <div>
    <h3 class="mt-4">روابط المنصات</h3>
    <ul class="list-none! flex flex-row flex-wrap gap-2">
      {#each data.profile.platformLinks as link}
        <li dir="ltr">
          <a href={"/out?url=" + encodeURIComponent(link.url)} rel="noopener noreferrer" class="pill hover:bg-blue-100 hover:border-blue-500">
            {#if link.platform === 'twitter'}
              <TwitterIcon class="size-4" />
            {:else if link.platform === 'facebook'}
              <FacebookIcon class="size-4" />
            {:else if link.platform === 'instagram'}
              <InstagramIcon class="size-4" />
            {:else if link.platform === 'youtube'}
              <YoutubeIcon class="size-4" />
            {:else if link.platform === 'telegram'}
              <TelegramIcon class="size-4" />
            {:else}
              <LinkIcon class="size-4" />
            {/if}
            <span>{link.alias}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>

  <div>
    <h3 class="mt-6">بعض الحالات الموثقة</h3>
    <ul class="flex flex-col gap-4 ps-4">
      {#each data.cases as caseItem}
        {@const profileEntry = caseItem.profiles.find(p => p.username === data.profile.username)}
        <li class="p-2 rounded-lg list-disc list-outside">
          <a href="/case/{caseItem.slug}" class="font-semibold hover:underline text-lg">
            {caseItem.title}
          </a>
          {#if profileEntry}
            <Case data={profileEntry} />
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>