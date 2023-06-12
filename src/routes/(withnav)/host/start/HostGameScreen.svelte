<script lang="ts">
	import { base } from '$app/paths';
	import type { Peer } from '$lib/peer';
	import { onDestroy } from 'svelte';
	import type { Game } from '../gamesDB';
	import PlayerRanking from './PlayerRanking.svelte';

	import { createGameHostStore } from './host';

	export let peer: Peer;
	export let game: Game;

	const host = createGameHostStore(peer, game);
	onDestroy(() => host.destroy());
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

		<button on:click={() => host.start()} class="px-4 py-2 bg-orange-300 rounded text-orange-950">Start Game</button>
	{/if}
</div>

<PlayerRanking players={$host.players} />
