<script>
    import Head from '$lib/Head.svelte';

    let { data } = $props();
</script>

<Head title="ساهم معنا" />
<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
    <div class="h-72 md:h-80 bg-black text-white flex flex-col items-center pt-4 overflow-hidden">
    </div>
</div>
<main class="flex flex-col w-full max-w-7xl mx-auto mt-6 px-2 grow" dir="rtl">
    <h1 class="text-3xl font-bold mb-4">ساهم معنا</h1>
    <h2>الإبلاغ عن محتوى مضلل أو مخالف للمعايير</h2>
    <div>

    </div>
    <h2>غيرها من الاقتراحات</h2>
    <p>
        <span>نرحب بجميع اقتراحاتكم عبر البريد الالكتروني:</span>
       <a href="mailto:dahliz@nasij.org" class="underline hover:text-blue-400">dahliz@nasij.org</a>
    </p>
    <h2>المساهمة في تطوير الموقع</h2>
    <p>
        الموقع مفتوح المصدر، ونرحب بمساهمتكم في تطويره. يمكنكم زيارة <a href="https://github.com/NasijSy/dahliz" class="underline hover:text-blue-400">مستودعنا على GitHub</a> للمشاركة في تطوير الموقع أو الإبلاغ عن أي مشاكل تواجهونها.
    </p>
</main>