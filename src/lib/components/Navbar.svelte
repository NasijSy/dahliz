<script>
    let navItems = [
        { name: "سجل التوثيق", href: "/profiles" },
        { name: "المنشورات", href: "/articles" },
        { name: "ساهم معنا", href: "/contribute" },
        { name: "عن المشروع", href: "/about" },
    ];
</script>

<header class="w-full sm:max-w-7xl sm:mx-auto px-2 mb-4" dir="rtl">
    <div class="flex flex-row flex-wrap lg:items-center lg:justify-start justify-center items-center gap-x-4 gap-y-2">
        <a class="h-18 pt-4 pb-0.5 shrink-0" href="/" title="الصفحة الرئيسية">
            <img src="/logo.png" alt="شعار مشروع دهليز" class="h-full" />
        </a>
        <nav aria-label="التنقل الرئيسي" class="w-full sm:w-auto">
            <ul class="nav-list">
                {#each navItems as item}
                    <li class="nav-cell">
                        <a class="nav-item" href={item.href}>{item.name}</a>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
</header>

<style lang="postcss">
    @reference "tailwindcss";

    .nav-list {
        @apply flex flex-row flex-wrap justify-center m-0;
        padding-top: 2px;          /* keep top outer border visible */
        padding-inline-start: 2px; /* keep start outer border visible (RTL-safe) */
    }

    .nav-cell {
        @apply list-none bg-white;
    }

    a.nav-item {
        @apply block w-full h-full py-2 px-3 text-center bg-white hover:bg-yellow-500 transition-colors duration-200 ease-out;
    }
</style>