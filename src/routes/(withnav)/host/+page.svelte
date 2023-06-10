<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	import EditGameForm from './EditGameForm.svelte';
	import { gamesDB, currentGame } from './gamesDB';

	let newGameName: string = '';
</script>

<main class="max-w-2xl mx-auto w-full px-4 py-2">
	<h1 class="font-bold text-xl text-orange-950 text-center">Host a Game</h1>

	{#if $gamesDB.status === 'loading'}
		<div>Cargando</div>
	{:else if $currentGame}
		<EditGameForm
			game={$currentGame}
			on:submit={(e) => {
				gamesDB.updateGame(e.detail);
				$page.url.searchParams.delete('game');
				goto($page.url.toString());
			}}
		/>
	{:else}
		<form class="flex gap-2 my-4" on:submit={() => gamesDB.createGame({ name: newGameName })}>
			<input
				required
				minlength="1"
				class="flex-grow rounded px-4"
				type="text"
				bind:value={newGameName}
			/>
			<button type="submit" class="bg-orange-600 text-orange-50 px-4 py-1 rounded">Create</button>
		</form>
		<ul class="flex flex-col gap-2">
			{#each $gamesDB.games as game}
				<li class="bg-orange-50 px-4 py-2 rounded">
					<div class="font-bold">{game.name} ({game.words.length} words)</div>
					<div class="flex gap-2">
						<a href={`${base}/host?game=${game.id}`}>Edit</a>
						<button on:click={() => gamesDB.deleteGame({ id: game.id })}>Delete</button>
						<a href={`${base}/host/start?game=${game.id}`}>Start</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>
