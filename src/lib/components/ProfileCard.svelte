<script>
  import { getCasesForProfile } from '$lib/loadCases.js';

  let { profile, allTags = [] } = $props();

  const resolvedCases = $derived(
    getCasesForProfile(profile.username, 'ar').slice(0, 3)
  );

  const caseCount = $derived(
    Array.isArray(profile.cases) ? profile.cases.length : 0
  );

  const classificationConfig = {
    reliable:     { label: 'أخطاء محدودة',     class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    unreliable:  { label: 'غير موثوق',         class: 'bg-orange-100 text-orange-800 border-orange-300' },
    disinformation:  { label: 'تضليل ممنهج',   class: 'bg-red-100 text-red-800 border-red-300' },
  };

  const badge = $derived(classificationConfig[profile.classification] ?? null);

  /**
   * Find the first source mediaPath that belongs to THIS profile's entry in the case.
   * @param {object} c - full case object
   * @returns {string|null}
   */
  function getThumbForProfile(c) {
    const entry = c.profiles?.find(p => p.username === profile.username);
    return entry?.source?.find(s => s.mediaPath)?.mediaPath ?? null;
  }
</script>

<a href="/profile/{profile.username}" class="group flex flex-col p-4 border-2 border-gray-200 hover:border-black hover:bg-gray-200 transition-colors duration-200 ease-out">
  <div class="flex flex-row w-full gap-4">
    <div class="w-18 h-18 rounded-full shrink-0 bg-gray-200 overflow-hidden">
      <img src={profile.imagePath} alt={profile.name} class="w-full h-full object-cover" />
    </div>
    <div class="text-start grow">
      <div class="flex items-center gap-2 mt-2 mb-1 flex-wrap">
        <h3 class="text-xl! font-bold mt-0! mb-0!">{profile.name}</h3>
        {#if badge}
          <span class="text-xs px-2 py-0.5 rounded border font-medium {badge.class}">
            {badge.label}
          </span>
        {/if}
      </div>
      <p class="text-gray-600 line-clamp-3">{profile.summary}</p>
    </div>
  </div>

  <div class="flex flex-row gap-2 p-2 w-full mt-auto">
    <div class="flex flex-row gap-1 items-center ms-auto">
      <span class="font-bold me-2">الحالات الموثقة</span>

      {#each resolvedCases as c, index}
        {@const thumb = getThumbForProfile(c)}
        {#if thumb}
          <div class="w-8 h-8 bg-gray-200 border-2 border-gray-200 overflow-hidden">
            <img
              src={thumb}
              alt="حالة تضليل {index + 1}"
              class="w-full h-full object-cover"
            />
          </div>
        {/if}
      {/each}

      {#if caseCount > 3}
        <div class="inline-flex bg-gray-500 text-white font-bold w-8 h-8 text-center justify-center items-center" dir="ltr">
          +{caseCount - 3}
        </div>
      {/if}
    </div>
  </div>
</a>