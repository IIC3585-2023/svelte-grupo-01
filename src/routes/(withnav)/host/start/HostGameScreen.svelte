<script lang="ts">
	import { base } from '$app/paths';
	import type { Peer } from '$lib/peer';
	// import { displayTime } from '$lib/utils';
	import type { Game } from '../gamesDB';
	import PlayerRanking from './PlayerRanking.svelte';
	import QRCode from './QRJS.svelte';
	// import { readable } from 'svelte/store';

	import { createGameHostStore } from './host';

	export let peer: Peer;
	export let game: Game;

	const host = createGameHostStore(peer, game);
	// let finishTime = 0;
	// function setFinishTime(time: number) {
	// 	finishTime = Date.now() + time;
	// 	console.log(finishTime, time);
	// }

	// const currentTime = readable(Date.now(), (set) => {
	// 	const interval = setInterval(() => set(Date.now()), 1000);
	// 	return () => clearInterval(interval);
	// });

	// $: timeLeft = displayTime(finishTime - $currentTime);
</script>

<div class="text-center mt-4">
	Game at
	<button on:click={() => navigator.clipboard.writeText(peer.id)}>
		{peer.id}
	</button>
	with {game.words.length} words
</div>

<div class="flex gap-2 justify-center">
	{#if $host.status === 'waiting'}
		<button
			on:click={() => {
				navigator.clipboard.writeText(`${location.origin}${base}/play?game=${peer.id}`);
			}}
			class="px-4 py-2 bg-orange-300 rounded text-orange-950"
		>
			Copy link
		</button>

		<button
			on:click={() => {
				host.start();
				// setFinishTime(game.timeInSeconds);
			}}
			class="px-4 py-2 bg-orange-300 rounded text-orange-950">Start Game</button
		>
	{/if}
</div>

{#if $host.status === 'waiting'}
	<QRCode codeValue={`${location.origin}${base}/play?game=${peer.id}`} squareSize="200" />
{/if}

<!-- TODO: Tambien hay que ponerle el timer al host -->
<!-- {timeLeft} -->
<PlayerRanking players={$host.players} {game} />
