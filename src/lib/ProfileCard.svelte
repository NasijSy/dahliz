<script>
  import { getCasesForProfile } from '$lib/loadCases.js';

  let { profile } = $props();

  const resolvedCases = $derived(
    getCasesForProfile(profile.username, 'ar').slice(0, 3)
  );

  const caseCount = $derived(
    Array.isArray(profile.cases) ? profile.cases.length : 0
  );

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
      <img
        src={profile.imagePath}
        alt={profile.name}
        class="w-full h-full object-cover"
      />
    </div>
    <div class="text-start grow">
      <h3 class="text-xl! font-bold mt-2! mb-2!">{profile.name}</h3>
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
        <div class="inline-flex bg-yellow-500 text-black font-bold w-8 h-8 text-center justify-center items-center" dir="ltr">
          +{caseCount - 3}
        </div>
      {/if}
    </div>
  </div>
</a>