<script>
    import "../app.pcss";
    import Header from './Header.svelte';
    import './styles.css';
    import Toaster from "$lib/Toaster.svelte";
    import {page} from "$app/stores";
	import Ad from "$lib/Ad.svelte";
</script>

<div class="app dark">
	<Header />

	<div class="fixed inset-x-0 bottom-0 z-50">
		<Ad />
	</div>

	<main>
		<slot></slot>
	</main>
	<Toaster />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding-bottom: 100px;
		max-width: 1100px;
		margin: 0 auto;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 90rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
