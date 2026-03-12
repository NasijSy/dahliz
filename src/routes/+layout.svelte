<script>
	import './layout.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Affiliation from '$lib/components/Affiliation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<Navbar />
{@render children()}
<Footer />
<Affiliation />