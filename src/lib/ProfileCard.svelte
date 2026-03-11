<script>
    let { profile } = $props();
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
            <h3 class="text-xl! font-bold mb-3">{profile.name}</h3>
            <p class="text-gray-600 line-clamp-3">
                {profile.summary}
            </p>
        </div>
    </div>
    <div class="flex flex-row gap-2 p-2 w-full mt-auto">
        <div class="flex flex-row gap-1 items-center ms-auto">
            <span class="font-bold me-2">الحالات الموثقة</span>
            {#each profile.cases.slice(0, 3) as item, index}
                {#if item?.source?.[0]?.mediaPath}
                <div class="w-8 h-8 bg-gray-200 border-2 border-gray-200 overflow-hidden">
                    <img
                        src={item.source[0].mediaPath}
                        alt="حالة تضليل {index + 1}"
                        class="w-full h-full object-cover"
                    />
                </div>
                {/if}
            {/each}
            {#if profile.cases?.length > 3}
                <div class="inline-flex bg-yellow-500 text-black font-bold w-8 h-8 text-center justify-center items-center" dir="ltr">
                    +{profile.cases.length - 3}
                </div>
            {/if}
        </div>
    </div>
</a>
