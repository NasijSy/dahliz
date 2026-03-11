<script>
    import Head from '$lib/Head.svelte';
    import ProfileCard from '$lib/ProfileCard.svelte';
    import GithubIcon from '$lib/icons/github.svelte';
    import LeftArrowIcon from '$lib/icons/left-arrow.svelte';

    let { data } = $props();
</script>

<Head />
<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
    <div class="relative h-96 md:h-110 bg-black flex flex-col items-center pt-4 overflow-hidden">
        <div class="max-w-4xl z-10 text-center mt-8 md:mt-2 text-white px-2">
            <h1 class="text-4xl md:text-6xl font-black mt-6 mb-12 leading-12 md:leading-18">
                الكلمة مسؤولية... لا تسامح مع التضليل والتحريض
            </h1>
        </div>
        <img class="absolute object-cover bottom-0 w-full min-w-[160%] md:w-auto md:min-w-0 max-h-80 left-1/2 -translate-x-1/2" src="/media/hero-background.jpg" alt="Hero Bottom Overlay" />
    </div>
</div>

<section>
    <div class="flex flex-col items-center justify-center text-center my-8 md:my-16 px-2" dir="rtl">
        <h2 class="text-4xl font-bold mb-4">أبرز الحسابات</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mt-8 px-2">
            {#each data.profiles.slice(0, 6) as profile, index}
            <ProfileCard {profile} />
            {/each}
        </div>
        <a class="inline-flex items-center mt-8 gap-2 px-4 py-2 bg-black text-white hover:bg-yellow-500 hover:text-black transition-colors duration-200 ease-out" href="/profiles">
            <span>عرض جميع الحسابات</span>
            <LeftArrowIcon class="h-6 transition-transform group-hover:-translate-x-1" />
        </a>
    </div>
</section>

<div id="initiative" class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
    <div class="bg-emerald-100 sm:grid sm:grid-cols-3">
        <div class="sm:col-span-2 order-2 sm:order-1 p-8">
            <h2 class="text-2xl! sm:text-4xl! text-emerald-600 sm:leading-12">
                مبادرة مستقلة لرفع الوعي المجتمعي
            </h2>
            <p>
                تشكل الساحة السورية خلال المرحلة الانتقالية بيئة مثالية لتداول الشائعات والتفاعل معها، وتلعب بعض الحسابات دوراً محورياً كجزء من المشكلة يساعد في تنمية الاستقطاب والانقسام، لذا كان لابد من العمل على سد هذه الفجوة حتى نتجنب خلافات مبنية على سراب ونلتفت لبناء مستقبل أفضل
            </p>
            <div class="flex flex-row gap-4 mt-4">
                <a class="flex flex-row items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-800 transition-colors group" href="/about">
                    <span>تفاصيل أكثر</span>
                </a>
                <a class="flex flex-row items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-800 transition-colors group" href="/contribute">
                    <span>ساهم معنا</span>
                </a>
            </div>
        </div>

        <div class="relative order-1 sm:order-2 h-52 sm:h-auto sm:min-h-0 sm:self-stretch overflow-hidden">
            <img
                class="w-full h-full object-cover sm:absolute sm:inset-0"
                src="/media/initiative.jpg"
                alt="حوار"
            />
        </div>
    </div>
</div>