<script>
  import { page } from '$app/stores';

  let { title } = $props();
  let newtitle = $derived(title ? title + ' | مشروع دهليز' : 'مشروع دهليز - رقابة شعبية على المؤثرين في الساحة السورية');
  let ogImage = $derived(`${$page.url.origin}/og-image.jpg`);
</script>

<svelte:head>
  <title>{newtitle}</title>
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
</svelte:head>
