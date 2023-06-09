<script lang="ts">
	import { getEmoji, guessesColors } from '$lib/repr';
	import { displayTime } from '$lib/utils';
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import { quintOut } from 'svelte/easing';

	import type { Observable } from 'rxjs';
	import { fade, crossfade } from 'svelte/transition';
	import { readable } from 'svelte/store';
	import { shouldHideNav } from '$lib/shouldHideNav';

	export let gameState: Observable<PublicGameState>;

	const dispatch = createEventDispatcher<{
		changeName: string;
		guess: string;
	}>();

	$shouldHideNav = true;
	onDestroy(() => ($shouldHideNav = false));

	let guessScrollArea: HTMLDivElement;

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

	$: timeLeft = displayTime($gameState.status === 'waiting' ? 0 : $gameState.endTime - $currentTime);

	$: canGuess =
		$gameState.status === 'playing' && $currentTime < $gameState.endTime && $currentTime > $gameState.startTime;

	$: gameEnded = $gameState.status === 'playing' && $currentTime > $gameState.endTime;

	$: done = $gameState.wordsLengths.length === $gameState.self.currentWordIndex;

	$: disabled = !canGuess || done;

	console.log($gameState.self.currentWordIndex + 1, $gameState.wordsLengths.length);

	$: displayGames = $gameState.self.currentWordIndex + '/' + $gameState.wordsLengths.length;

	let lastGuessCount = $gameState.self.currentWordGuesses.length ?? 0;

	$: if (lastGuessCount !== $gameState.self.currentWordGuesses.length) {
		lastGuessCount = $gameState.self.currentWordGuesses.length;
		tick().then(() => guessScrollArea.scrollTo({ top: guessScrollArea.scrollHeight }));
	}
</script>

<div class="flex flex-col justify-center items-center w-full gap-1 my-4">
	{timeLeft}
	<p class="font-bold">
		Words guessed {displayGames}
	</p>
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

<div
	class="h-28 overflow-auto bg-gray-200 shadow-inner my-4 scroll-smooth p-2 flex flex-col gap-4"
	bind:this={guessScrollArea}
>
	{#each $gameState.self.currentWordGuesses as guess}
		<div class="flex justify-center gap-1 w-min mx-auto">
			{#each guess.result as result, index}
				<span
					in:receive={{ key: index }}
					class="flex justify-center items-center h-8 w-8"
					style:background-color={guessesColors[result]}
				>
					{guess.guess.at(index) ?? ''}
				</span>
			{/each}
		</div>
	{/each}
</div>

<div class="flex justify-center gap-1 w-min mx-auto [scrollbar-gutter:stable] mb-4">
	{#each { length: $gameState.wordsLengths[$gameState.self.currentWordIndex] } as _, index}
		<span in:fade out:send={{ key: index }} class="flex justify-center items-center h-8 w-8 bg-slate-200"
			>{guess.at(index) ?? ''}</span
		>
	{/each}
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
	class="flex flex-col justify-center border border-orange-200 items-center rounded-lg overflow-clip w-min mx-auto"
>
	<input
		bind:value={guess}
		{disabled}
		type="text"
		name="word"
		class="font-mono font-bold text-xl shadow-inner bg-gray-50 py-1 text-center focus-visible:outline-none w-40"
		minlength={$gameState.wordsLengths[$gameState.self.currentWordIndex]}
		maxlength={$gameState.wordsLengths[$gameState.self.currentWordIndex]}
	/>
	<button type="submit" {disabled} class="disabled:bg-orange-200 bg-orange-500 text-orange-50 text-center py-1 w-full"
		>Submit</button
	>
</form>

{#if $gameState.status === 'waiting'}
	<div class="mt-8 text-center text-orange-300">Waiting for the game to start...</div>
{/if}

<!-- {JSON.stringify($gameState, null, 2)} -->
