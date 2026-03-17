<script>
    import Head from '$lib/components/Head.svelte';
    import Note from '$lib/components/Note.svelte';
    import ProfileCard from '$lib/components/ProfileCard.svelte';
    import MultiSelect from '$lib/components/MultiSelect.svelte';

    let { data } = $props();

    const sortOptions = [
        { value: 'cases',       label: 'الأكثر توثيقاً' },
        { value: 'lastUpdated', label: 'آخر تحديث' },
        { value: 'dateAdded',   label: 'تاريخ الإضافة' },
        { value: 'name',        label: 'الاسم' },
    ];

    const classificationOptions = [
        { value: '',               label: 'الكل' },
        { value: 'reliable',       label: 'أخطاء محدودة' },
        { value: 'unreliable',     label: 'غير موثوق' },
        { value: 'disinformation', label: 'تضليل ممنهج' },
    ];

    const profileTypeOptions = [
        { value: '',       label: 'الكل' },
        { value: 'org',    label: 'مؤسسة/منظمة' },
        { value: 'person', label: 'شخص معروف الهوية' },
        { value: 'anon',   label: 'حساب مجهول الإدارة' },
        { value: 'bot',    label: 'بوت' },
    ];

    const tagOptions = $derived(
        data.allTags.map((t) => ({ value: t.slug, label: t.label }))
    );

    const resultsCount = $derived(data.profiles.length);
    let searchInput = $state('');

    $effect(() => {
        searchInput = data.search ?? '';
    });

    /** @param {Record<string, string | string[]>} params */
    function buildUrl(params) {
        const base = {
            sortBy: data.sortBy,
            ...(data.classification ? { classification: data.classification } : {}),
            ...(data.profileType ? { type: data.profileType } : {}),
            ...(data.search ? { search: data.search } : {}),
        };
        const merged = { ...base, ...params };

        const u = new URLSearchParams();
        for (const [k, v] of Object.entries(merged)) {
            if (!v || (Array.isArray(v) && v.length === 0)) continue;
            if (Array.isArray(v)) v.forEach((val) => u.append(k, val));
            else u.set(k, v);
        }
        return `/profiles?${u.toString()}`;
    }

    function handleSortChange(e) {
        window.location.href = buildUrl({ sortBy: e.target.value });
    }

    function handleClassificationChange(e) {
        window.location.href = buildUrl({ classification: e.target.value });
    }

    function handleProfileTypeChange(e) {
        window.location.href = buildUrl({ type: e.target.value });
    }

    function handleTagsChange(next) {
        window.location.href = buildUrl({ tag: next });
    }

    function handleSearchSubmit() {
        window.location.href = buildUrl({ search: searchInput.trim() });
    }

    function handleSearchKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit();
        }
    }

    function handleClearSearch() {
        searchInput = '';
        window.location.href = buildUrl({ search: '' });
    }

    const selectClass = [
        'appearance-none border-2 border-gray-200 rounded-full px-4 py-1 bg-white',
        'hover:border-gray-400 focus:outline-none focus:border-black transition-colors cursor-pointer text-sm',
        "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2010%206%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M1%201l4%204%204-4%27%20stroke%3D%27%239ca3af%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')]",
        'bg-no-repeat bg-[length:12px] bg-[position:0.75rem_center] pl-7'
    ].join(' ');
</script>

<Head title="سجل التوثيق" />
<main class="flex-1">
    <div class="flex flex-col items-center justify-center text-center mt-4 mb-8 px-2" dir="rtl">
        <h2 class="text-4xl font-black mb-4">سجل التوثيق</h2>
        <p>توثيق للحسابات المؤثرة في الساحة السورية والمحتوى المضلل أو التحريضي الذي قامت بنشره</p>

        {#snippet note()}
            <p class="mb-0!">ملاحظة: القائمة ليست شاملة أو نهائية ونعمل على تحديثها باستمرار. يمكنكم <a href="/contribute" class="text-blue-500 hover:underline">المساهمة معنا</a> من خلال الإبلاغ عن حالات جديدة لتوثيقها.</p>
        {/snippet}
        <Note content={note} />

        <div class="flex items-center gap-2 mt-6 w-full max-w-xl">
            <label for="profile-search" class="text-gray-600 text-sm whitespace-nowrap">بحث:</label>
            <input
                id="profile-search"
                type="search"
                bind:value={searchInput}
                onkeydown={handleSearchKeyDown}
                placeholder="ابحث بالاسم أو اسم المستخدم أو روابط المنصات"
                class="w-full border-2 border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black"
            />
            <button
                type="button"
                onclick={handleSearchSubmit}
                class="px-4 py-2 rounded-full border-2 border-gray-200 hover:border-black text-sm whitespace-nowrap"
            >
                بحث
            </button>
            {#if data.search}
                <button
                    type="button"
                    onclick={handleClearSearch}
                    class="px-4 py-2 rounded-full border-2 border-gray-200 hover:border-black text-sm whitespace-nowrap"
                >
                    مسح
                </button>
            {/if}
        </div>

        <div class="flex flex-row gap-3 mt-6 items-center flex-wrap justify-center">
            <!-- Profile type filter -->
            <div class="flex gap-2 items-center">
                <label for="profile-type-select" class="text-gray-500 text-sm whitespace-nowrap">نوع الحساب:</label>
                <div class="relative">
                    <select
                        id="profile-type-select"
                        onchange={handleProfileTypeChange}
                        value={data.profileType ?? ''}
                        class="{selectClass} pr-4 pl-7"
                    >
                        {#each profileTypeOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Classification filter -->
            <div class="flex gap-2 items-center">
                <label for="classification-select" class="text-gray-500 text-sm whitespace-nowrap">تقييم المصداقية:</label>
                <div class="relative">
                    <select
                        id="classification-select"
                        onchange={handleClassificationChange}
                        value={data.classification ?? ''}
                        class="{selectClass} pr-4 pl-7"
                    >
                        {#each classificationOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Sort -->
            <div class="flex gap-2 items-center">
                <label for="sort-select" class="text-gray-500 text-sm whitespace-nowrap">ترتيب حسب:</label>
                <div class="relative">
                    <select
                        id="sort-select"
                        onchange={handleSortChange}
                        value={data.sortBy}
                        class="{selectClass} pr-4 pl-7"
                    >
                        {#each sortOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Tags multi-select -->
            {#if tagOptions.length > 0}
                <div class="flex gap-2 items-center">
                    <span class="text-gray-500 text-sm whitespace-nowrap">الوسوم:</span>
                    <MultiSelect
                        options={tagOptions}
                        selected={data.tags ?? []}
                        placeholder="كل الوسوم"
                        onchange={handleTagsChange}
                    />
                </div>
            {/if}
        </div>

        <p class="mt-4 text-sm text-gray-600">عدد النتائج: <span class="font-bold">{resultsCount}</span></p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-8 px-2">
            {#each data.profiles as profile}
                <ProfileCard {profile} allTags={data.allTags} />
            {/each}
        </div>
    </div>

    <div id="influencers" class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
        <div class="bg-indigo-50 sm:grid sm:grid-cols-3">
            <div class="sm:col-span-2 order-2 sm:order-1 p-8">
                <h2 class="text-2xl! sm:text-4xl! text-indigo-800 sm:leading-12">
                    وسائل التواصل لها دور في تفكيك المجتمع السوري
                </h2>
                <p>
                    تقوم بعض الحسابات والشخصيات الإعلامية المؤثرة على وسائل التواصل بتغذية الانقسام ربما من غير قصد من خلال الترويج لشائعات وأخبار غير مؤكدة ذات حساسية مما يساهم بتأجيج التوتر حتى وصل لصدامات دامية كان ممكن تجنبها. كما توجد فئة من الحسابات تنتهج التحريض وإثارة الخلافات لتحقيق مكاسب مختلفة.
                </p>
            </div>

            <div class="relative order-1 sm:order-2 h-52 sm:h-auto sm:min-h-0 sm:self-stretch overflow-hidden">
                <img
                    class="w-full h-full object-cover sm:absolute sm:inset-0"
                    src="/media/mind-control.jpg"
                    alt="يد تتحكم بعقل بشري"
                />
            </div>
        </div>
    </div>
</main>

