<script>
    import Head from '$lib/Head.svelte';
    import Note from '$lib/Note.svelte';
    import ProfileCard from '$lib/ProfileCard.svelte';

    let { data } = $props();

    // Ready for future UI controls — just navigate to ?sortBy=xxx
    const sortOptions = [
        { value: 'cases',       label: 'الأكثر توثيقاً' },
        { value: 'lastUpdated', label: 'آخر تحديث' },
        { value: 'dateAdded',   label: 'تاريخ الإضافة' },
        { value: 'name',        label: 'الاسم' },
    ];
</script>

<Head title="سجل التوثيق" />
<main class="flex-1">
    <div class="flex flex-col items-center justify-center text-center my-16 px-2" dir="rtl">
        <h2 class="text-4xl font-black mb-4">سجل التوثيق</h2>
        <p>توثيق للحسابات المؤثرة في الساحة السورية والمحتوى المضلل أو التحريضي الذي قامت بنشره</p>
        {#snippet note()}
            <p class="mb-0!">ملاحظة: القائمة ليست شاملة أو نهائية ونعمل على تحديثها باستمرار. يمكنكم <a href="/contribute" class="text-blue-500 hover:underline">المساهمة معنا</a> من خلال الإبلاغ عن حالات جديدة لتوثيقها.</p>
        {/snippet}
        <Note content={note} />
        <div class="flex gap-2 mt-6 items-center">
            <span class="text-gray-500">ترتيب حسب:</span>
            {#each sortOptions as opt}
                <a href="/profiles?sortBy={opt.value}" class="px-4 py-1 rounded-full transition-colors {data.sortBy === opt.value ? 'bg-black text-white' : 'border-2 border-gray-200 hover:bg-gray-100'}">{opt.label}</a>
            {/each}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-8 px-2">
            {#each data.profiles as profile}
            <ProfileCard {profile} />
            {/each}
        </div>
    </div>
</main>

<div id="influencers" class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
    <div class="bg-indigo-50 sm:grid sm:grid-cols-3">
        <div class="sm:col-span-2 order-2 sm:order-1 p-8">
            <h2 class="text-2xl! sm:text-4xl! text-indigo-800 sm:leading-12">
                وسائل التواصل لها دور في تفكيك المجتمع السوري
            </h2>
            <p>
                تقوم بعض الحسابات الإعلامية المؤثرة على وسائل التواصل بتغذية الانقسام من خلال الترويج لأخبار غير مؤكدة والتحريض بدوافع مختلفة ودون أدنى حس بالمسؤولية وهو ما ساهم بتأجيج التوتر حتى وصل لصدامات دامية كان ممكن تجنبها
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