<script lang="ts">
	import { getEmoji } from '$lib/emojis';
	import { createEventDispatcher } from 'svelte';
	import type { Observable, last } from 'rxjs';
	import { readable } from 'svelte/store';

	export let gameState: Observable<MessageToPlayer>;

	const dispatch = createEventDispatcher<{
		changeName: string;
		guess: string;
	}>();

	const currentTime = readable(Date.now(), (set) => {
		const interval = setInterval(() => set(Date.now()), 100);
		return () => clearInterval(interval);
	});

	let changedName: string = $gameState.self.name;
	let guess: string = '';

	$: canGuess =
		$gameState.status === 'playing' &&
		$currentTime < $gameState.endTime &&
		$currentTime > $gameState.startTime;

	$: disabled = !canGuess;

	const guessesColors = {
		C: 'hsl(130, 80%, 90%)',
		A: 'hsl(50, 80%, 90%)',
		P: 'hsl(25, 70%, 95%)',
	};

	$: lastGuess = $gameState.self.guesses[$gameState.self.guesses.length - 1];
</script>

<div class="flex flex-col justify-center items-center w-full gap-4">
	<div
		style:background-color={$gameState.self.repr.color}
		class="w-24 h-24 text-6xl flex items-center justify-center rounded-lg shadow-inner"
	>
		{getEmoji($gameState.self.repr.emoji)}
	</div>
	<form on:submit|preventDefault={() => dispatch('changeName', changedName)} class="h-full">
		<input
			type="text"
			placeholder="Give yourself a name!"
			bind:value={changedName}
			class="bg-transparent px-1 font-bold rounded text-center"
			on:blur={() => dispatch('changeName', changedName)}
		/>
	</form>
</div>

<div class="h-16 flex gap-4 justify-center items-center">
	{#if lastGuess}
		{#each lastGuess.result as result, index}
			<span
				class="flex justify-center items-center h-12 w-12"
				style:background-color={guessesColors[result]}
			>
				{lastGuess.guess[index]}
			</span>
		{/each}
	{/if}
</div>

<form
	on:submit|preventDefault={() => {
		dispatch('guess', guess);
		guess = '';
	}}
>
	<input
		bind:value={guess}
		{disabled}
		type="text"
		name="word"
		class="font-mono font-bold text-xl"
	/>
	<button type="submit" {disabled}>Submit</button>
</form>

{JSON.stringify($gameState, null, 2)}
