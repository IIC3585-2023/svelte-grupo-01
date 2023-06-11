<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { createClientPearStore } from './clientStore';
	import GameDisplay from './GameDisplay.svelte';

	const client = createClientPearStore();
	let connectionInputValue: string;

	const currentGameConnectionId = derived(page, ($page) => {
		const url = new URL($page.url);
		return url.searchParams.get('game');
	});

	if ($currentGameConnectionId !== null) {
		const connectionId = $currentGameConnectionId;
		client.onReadyPromise.then((state) => state.connect(connectionId));
	}

	$: if ($client.status === 'ready-to-connect' && $client.timeout) {
		$page.url.searchParams.delete('game');
		goto($page.url.toString(), { replaceState: true });
	}
</script>

<main class="max-w-2xl w-full mx-auto h-full">
	{#if $client.status === 'loading'}
		<div class="flex justify-center items-center h-full">Loading</div>
	{:else if $client.status === 'establishing-connection'}
		<div class="flex justify-center items-center h-full">Establishing connection</div>
	{:else if $client.status === 'ready-to-connect'}
		{@const connect = $client.connect}
		<h1 class="text-center font-bold text-xl mt-8">Join Game</h1>
		<form class="flex flex-col my-4 gap-4 px-4" on:submit|preventDefault={() => connect(connectionInputValue)}>
			<input class="rounded px-2 py-1" type="text" name="game" bind:value={connectionInputValue} />
			<button type="submit" class="bg-orange-400 rounded px-4 py-2">Join</button>
		</form>
	{:else if $client.status === 'connected'}
		<GameDisplay
			gameState={$client.messageObservable}
			on:changeName={(event) => {
				if ($client.status !== 'connected') return;
				$client.sendMessage({ type: 'player-name', name: event.detail });
			}}
			on:guess={(event) => {
				if ($client.status !== 'connected') return;
				$client.sendMessage({ type: 'player-guess', guess: event.detail });
			}}
		/>
	{:else}
		<h1>Joining game</h1>
	{/if}
</main>
