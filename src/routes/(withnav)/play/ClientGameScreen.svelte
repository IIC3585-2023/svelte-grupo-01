<script lang="ts">
	import type { Peer } from '$lib/peer';
	import GameDisplay from './GameDisplay.svelte';
	import { createGameClientStore } from './client';

	export let peer: Peer;
	export let queryParamId: string | null = null;

	const client = createGameClientStore(peer);
	if (queryParamId) client.connect(queryParamId);

	let connectionInputValue = '';
</script>

{#if $client.status === 'establishing-connection'}
	<div class="flex justify-center items-center h-full">Establishing connection</div>
{:else if $client.status === 'ready-to-connect'}
	<h1 class="text-center font-bold text-xl mt-8">Join Game</h1>
	<form class="flex flex-col my-4 gap-4 px-4" on:submit|preventDefault={() => client.connect(connectionInputValue)}>
		<input class="rounded px-2 py-1" type="text" name="game" bind:value={connectionInputValue} />
		<button type="submit" class="bg-orange-400 rounded px-4 py-2">Join</button>
	</form>
{:else if $client.status === 'connected'}
	<GameDisplay
		gameState={$client.gameStateObservable}
		on:changeName={(event) => client.changeName(event.detail)}
		on:guess={(event) => client.guessWord(event.detail)}
	/>
{:else}
	<h1>Joining game</h1>
{/if}
