<script>
	import './layout.css';
	import Navbar from '$lib/Navbar.svelte';
	import Affiliation from '$lib/Affiliation.svelte';
	import Footer from '$lib/Footer.svelte';
	let { children } = $props();
</script>

<Navbar />
{@render children()}
<Footer />
<Affiliation />