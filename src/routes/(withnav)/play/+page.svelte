<script lang="ts">
	import { page } from '$app/stores';
	import ClientGameScreen from './ClientGameScreen.svelte';
	import { loadPeerPromise } from '$lib/peer';
	import { browser } from '$app/environment';

	let queryParamId: string | null = null;
	if (browser) {
		queryParamId = $page.url.searchParams.get('game');
	}
</script>

<main class="max-w-2xl w-full mx-auto h-full">
	{#await loadPeerPromise}
		<div class="flex justify-center items-center h-full">Loading</div>
	{:then peer}
		<ClientGameScreen {peer} {queryParamId} />
	{/await}
</main>
