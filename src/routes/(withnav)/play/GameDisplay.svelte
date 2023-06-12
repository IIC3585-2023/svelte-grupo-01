<script lang="ts">
	import { getEmoji, guessesColors } from '$lib/repr';
	import { createEventDispatcher } from 'svelte';
	import { quintOut } from 'svelte/easing';

	import type { Observable } from 'rxjs';
	import { fade, crossfade } from 'svelte/transition';
	import { readable } from 'svelte/store';

	export let gameState: Observable<PublicGameState>;

	const dispatch = createEventDispatcher<{
		changeName: string;
		guess: string;
	}>();

	// TODO: ver si se puede arreglar la animación
	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});

	const currentTime = readable(Date.now(), (set) => {
		const interval = setInterval(() => set(Date.now()), 100);
		return () => clearInterval(interval);
	});

	let changedName: string = $gameState.self.name;
	let guess: string = '';

	$: canGuess =
		$gameState.status === 'playing' && $currentTime < $gameState.endTime && $currentTime > $gameState.startTime;

	$: gameEnded = $gameState.status === 'playing' && $currentTime > $gameState.endTime;

	$: done = $gameState.wordsLengths.length === $gameState.self.currentWordIndex;

	$: disabled = !canGuess || done;
</script>

<div class="flex flex-col justify-center items-center w-full gap-4 mt-6">
	<div
		style:background-color={$gameState.self.representation.color}
		class="w-24 h-24 text-6xl flex items-center justify-center rounded-lg shadow-inner"
	>
		{getEmoji($gameState.self.representation.emojiIndex)}
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

<div class="py-4 h-32 mx-auto w-min mb-16">
	{#key $gameState.self.lastGuess?.time}
		<div class="flex justify-center gap-1 mb-4 w-min mx-auto">
			{#if $gameState.self.lastGuess}
				{#each $gameState.self.lastGuess.result as result, index}
					<span
						in:receive={{ key: index }}
						class="flex justify-center items-center h-8 w-8"
						style:background-color={guessesColors[result]}
					>
						{$gameState.self.lastGuess.guess.at(index) ?? ''}
					</span>
				{/each}
			{/if}
		</div>
	{/key}
	{#key $gameState.self.lastGuess?.time}
		<div class="flex justify-center gap-1 w-min mx-auto">
			{#each { length: $gameState.wordsLengths[$gameState.self.currentWordIndex] } as _, index}
				<span in:fade out:send={{ key: index }} class="flex justify-center items-center h-8 w-8 bg-slate-200"
					>{guess.at(index) ?? ''}</span
				>
			{/each}
		</div>
	{/key}
</div>

{#if done}
	<div class="text-center text-orange-500">You won!</div>
{/if}
{#if gameEnded}
	<div class="text-center text-orange-500">Game ended!</div>
{/if}

<form
	on:submit|preventDefault={() => {
		dispatch('guess', guess);
		guess = '';
	}}
	class="flex flex-col gap-4 justify-center items-center w-full"
>
	<input
		bind:value={guess}
		{disabled}
		type="text"
		name="word"
		class="font-mono font-bold text-xl border shadow-inner"
		minlength={$gameState.wordsLengths[$gameState.self.currentWordIndex]}
		maxlength={$gameState.wordsLengths[$gameState.self.currentWordIndex]}
	/>
	<button type="submit" {disabled} class="disabled:bg-orange-200 bg-orange-500 text-orange-50 px-4 py-2">Submit</button>
</form>

{#if $gameState.status === 'waiting'}
	<div class="mt-8 text-center text-orange-300">Waiting for the game to start...</div>
{/if}

<!-- {JSON.stringify($gameState, null, 2)} -->
