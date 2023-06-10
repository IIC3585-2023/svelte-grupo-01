<script lang="ts">
	import PlayerRanking from './PlayerRanking.svelte';
	import { createGameHostStore } from './gameHost';

	const host = createGameHostStore({ timeInSeconds: 120, words: ['hello', 'world'], delay: 50 });
</script>

<main class="max-w-2xl mx-auto w-full">
	{#if $host.status === 'loading'}
		<div>Loading</div>
	{:else}
		{#if $host.status === 'waiting'}
			<div>Waiting for players to join</div>
			<button on:click={() => host.start()}>Start Game</button>
		{:else}
			Stuff
		{/if}
		<PlayerRanking players={$host.players} />
	{/if}
</main>

{JSON.stringify($host, null, 2)}
