<script>
    import Discord from "$lib/icons/discord.svelte";

    let links = [
        {
            name: 'سجل التوثيق',
            url: '/profiles'
        },
        {
            name: 'المنشورات',
            url: '/articles'
        },
        {
            name: 'ساهم معنا',
            url: '/contribute'
        },
        {
            name: 'عن المشروع',
            url: '/about'
        }
    ]
</script>
<footer class="max-w-7xl mx-auto px-2 mt-12 mb-4 w-full" dir="rtl">
    <div class="flex flex-col md:flex-row gap-6 justify-between">
        <div class="flex flex-col items-start px-2 md:px-0">
            <img src="/logo.png" alt="Nasij Logo" class="h-12 mb-2" />
            <p>منصة لتعزيز الوعي المجتمعي ومصداقية الإعلام الرقمي في الساحة السورية</p>
        </div>
        <div class="flex flex-col gap-2 px-2 md:px-0">
            <ul class="inline-grid self-start grid-cols-1 md:grid-cols-2 gap-2 list-none!">
            {#each links as link}
                <li class="inline-flex">
                    <a href={link.url} class="w-full md:text-center text-gray-600 px-2 py-1 hover:bg-yellow-500 hover:text-black transition-colors duration-200">{link.name}</a>
                </li>
            {/each}
            </ul>
            <a href="https://discord.com/invite/VqysmYaQbN" class="self-start bg-[#5865f2] text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors duration-200" target="_blank">
                <span>انضم إلى مجتمعنا</span>
                <Discord class="inline-block w-6 h-6 mr-2" />
            </a>
        </div>
    </div>
</footer>