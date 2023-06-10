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

<main class="max-w-2xl w-full mx-auto">
	{#if $client.status === 'loading'}
		<div>Loading</div>
	{:else if $client.status === 'establishing-connection'}
		<div>Establishing connection</div>
	{:else if $client.status === 'ready-to-connect'}
		{@const connect = $client.connect}
		<h1>Join Game</h1>
		<form action="GET" on:submit|preventDefault={() => connect(connectionInputValue)}>
			<input type="text" name="game" bind:value={connectionInputValue} />
			<button type="submit">Join</button>
		</form>
	{:else if $client.status === 'connected'}
		<div>Connected</div>
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
	{JSON.stringify($client)}
</main>
