<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { loadPeerPromise } from '$lib/peer';

	import { gamesDB } from '../gamesDB';
	import HostGameScreen from './HostGameScreen.svelte';

	const promise = Promise.all([loadPeerPromise, gamesDB.readyPromise]).then(([peer, games]) => {
		const gameIdStr = $page.url.searchParams.get('game');
		if (!gameIdStr) throw new Error('No game ID');

		const gameId = parseInt(gameIdStr);
		const game = games.find((game) => game.id === gameId);
		if (!game) throw new Error('Game not found');

		return [peer, game] as const;
	});
</script>

<main class="max-w-2xl mx-auto w-full">
	{#await promise}
		<div>Loading</div>
	{:then [peer, game]}
		<HostGameScreen {peer} {game} />
	{:catch error}
		An error occurred: {JSON.stringify(error)}
	{/await}
</main>
