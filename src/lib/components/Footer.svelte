<script>
    let links = [
        {
            name: 'سجل التوثيق',
            url: '/profiles'
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
            {#each links as link}
                <a href={link.url} class="text-gray-600 underline px-2 py-1 hover:bg-yellow-500 hover:text-black transition-colors duration-200">{link.name}</a>
            {/each}
        </div>
    </div>
</footer>