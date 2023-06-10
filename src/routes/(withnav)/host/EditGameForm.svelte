<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import type { Game } from './gamesDB';
	import { crossfade } from 'svelte/transition';

	export let game: Game;

	const flipDurationMs = 200;

	const dispatch = createEventDispatcher<{ submit: Game }>();

	let wordsWithIdAttr = game.words.map((word) => ({ word, id: word }));
	let newWord: string = '';

	function handleAddNewWord() {
		if (wordsWithIdAttr.find(({ word }) => word === newWord)) return;

		wordsWithIdAttr.push({ word: newWord, id: newWord });
		wordsWithIdAttr = wordsWithIdAttr;
		newWord = '';
	}
</script>

<form
	on:submit|preventDefault={() =>
		dispatch('submit', { ...game, words: wordsWithIdAttr.map((e) => e.word) })}
>
	<div class="flex gap-4 my-4 items-center">
		<label class="flex-grow flex gap-2">
			<span class="font-bold">Name:</span>
			<input type="text" class="flex-grow rounded px-2" bind:value={game.name} />
		</label>
		<label class="flex gap-2">
			<span class="font-bold">Time in seconds:</span>
			<input type="number" bind:value={game.timeInSeconds} class="w-24 px-2 rounded" />
		</label>
		<button type="submit" class="bg-orange-600 text-orange-50 px-4 py-1 rounded">Save</button>
	</div>

	<h2 class="font-bold">Words ({wordsWithIdAttr.length})</h2>
	<form class="flex gap-2" on:submit|preventDefault={handleAddNewWord}>
		<input minlength="1" required class="flex-grow rounded px-4" type="text" bind:value={newWord} />
		<button class="bg-orange-600 text-orange-50 px-4 py-1 rounded" type="submit">Add</button>
	</form>
	<ul
		use:dndzone={{ items: wordsWithIdAttr, flipDurationMs }}
		on:consider={(e) => (wordsWithIdAttr = e.detail.items)}
		on:finalize={(e) => (wordsWithIdAttr = e.detail.items)}
		class="flex flex-col gap-2 my-2"
	>
		{#each wordsWithIdAttr as { word, id } (id)}
			<li
				class="px-4 py-2 bg-orange-50 flex justify-between gap-2 rounded"
				animate:flip={{ duration: flipDurationMs }}
			>
				<div>{word}</div>
				<button
					class="text-orange-800"
					on:click={() => (wordsWithIdAttr = wordsWithIdAttr.filter((e) => e.id !== id))}
					>Delete</button
				>
			</li>
		{/each}
	</ul>
</form>
