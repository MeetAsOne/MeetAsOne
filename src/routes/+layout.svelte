<script>
	import "../app.pcss";
    import Header from './Header.svelte';
    import './styles.css';
	import Toaster from "$lib/Toaster.svelte";
	import {page} from "$app/stores";
</script>

<div class="app dark">
	{#if $page.url.pathname.startsWith("/event")}
		<Header></Header>
	{/if}

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
