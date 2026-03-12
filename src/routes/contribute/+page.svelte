<script>
    import Head from '$lib/components/Head.svelte';

    let { data } = $props();

    let url = $state('');
    let description = $state('');
    let submitting = $state(false);
    let result = $state(null); // { success: boolean, message: string }

    async function handleSubmit(e) {
        e.preventDefault();
        submitting = true;
        result = null;

        try {
            const res = await fetch('?/report', {
                method: 'POST',
                body: new URLSearchParams({ url, description }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const json = await res.json();

            if (json.type === 'success') {
                result = { success: true, message: 'شكراً! تم إرسال بلاغك بنجاح وسنتولى مراجعته.' };
                url = '';
                description = '';
            } else {
                // Show the actual error message returned from the server
                const serverMessage = json.data?.error;
                result = {
                    success: false,
                    message: serverMessage ?? 'حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.'
                };
            }
        } catch {
            result = { success: false, message: 'تعذّر الاتصال بالخادم، يرجى التحقق من اتصالك والمحاولة مجدداً.' };
        } finally {
            submitting = false;
        }
    }
</script>

<Head title="ساهم معنا" />
<div class="w-full sm:max-w-7xl sm:mx-auto px-2" dir="rtl">
  <div id="hero" class="h-72 md:h-80"></div>
</div>
<main class="flex flex-col w-full max-w-7xl mx-auto mt-6 px-2 grow" dir="rtl">
    <h1 class="text-3xl font-bold mb-4">ساهم معنا</h1>
    <p>هذا الموقع هو مشروع تطوعي وندرك أن هناك فرصاً لتحسينه لهذا نقدر مساهماتكم في تطوير ما نقدمه حتى نرفع مستوى الوعي المجتمعي ونبني قاعدة شاملة للحسابات التي لها تأثير كبير على سلوك الشعب وتتلاعب بإدراكه لما يحصل من حوله.</p>

    <div class="mt-8">
        <h2 class="text-xl font-semibold mb-3">الإبلاغ عن محتوى مضلل أو مخالف للمعايير</h2>
        <p class="text-gray-600 mb-4">أرسل لنا رابط المحتوى المشتبه به وسنتولى التحقق منه وتوثيقه.</p>

        <form onsubmit={handleSubmit} class="flex flex-col gap-4 max-w-xl">
            <div class="flex flex-col gap-1">
                <label for="url" class="font-medium">رابط المحتوى <span class="text-red-500">*</span></label>
                <input
                    id="url"
                    type="url"
                    bind:value={url}
                    required
                    placeholder="https://..."
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    dir="ltr"
                />
            </div>

            <div class="flex flex-col gap-1">
                <label for="description" class="font-medium">وصف مختصر (اختياري)</label>
                <textarea
                    id="description"
                    bind:value={description}
                    rows="3"
                    placeholder="اشرح باختصار لماذا تعتقد أن هذا المحتوى مضلل..."
                    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                ></textarea>
            </div>

            {#if result}
                <p class={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.message}
                </p>
            {/if}

            <button
                type="submit"
                disabled={submitting}
                class="self-start bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
            </button>
        </form>
    </div>

    <div class="mt-10">
        <h2 class="text-xl font-semibold mb-2">المساهمة في تطوير الموقع</h2>
        <p>
            الموقع مفتوح المصدر، ونرحب بمساهمتكم في تطويره أو الإبلاغ عن أي مشاكل تقنية تواجهونها وذلك من خلال زيارة <a href="https://github.com/NasijSy/dahliz" class="underline hover:text-blue-400">مستودعنا على GitHub</a>
        </p>
    </div>

    <div class="mt-6 mb-10">
        <h2 class="text-xl font-semibold mb-2">غيرها من الاقتراحات</h2>
        <p>
            <span>نرحب بجميع اقتراحاتكم عبر البريد الالكتروني:</span>
            <a href="mailto:dahliz@nasij.org" class="underline hover:text-blue-400">dahliz@nasij.org</a>
        </p>
    </div>
</main>

<style>
    #hero {
        background-image: url('/media/contribute.jpg');
        background-size: cover;
        background-color: #FFF5C3;
        background-position: center center;
        background-repeat: no-repeat;
    }
</style>