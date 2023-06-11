<script lang="ts">
	import { getEmoji, guessesColors } from '$lib/repr';
	import type { PlayerInternalState } from './host';

	export let players: PlayerInternalState[];
</script>

<ul class="flex flex-col gap-4 p-4">
	{#each players as { representation, name, id, currentWordIndex, guesses } (id)}
		<li class="flex gap-2">
			<div
				style:background-color={representation.color}
				class="w-20 h-20 text-4xl justify-center flex items-center rounded-xl"
			>
				{getEmoji(representation.emojiIndex)}
			</div>
			<div>
				<div>
					{name || 'Anonymous'}
				</div>
				<div>
					{currentWordIndex} words guessed
				</div>
				<div>
					{guesses.length} attempts
				</div>
			</div>
			{#if guesses.length !== 0}
				{@const lastGuess = guesses[guesses.length - 1]}
				<div class="flex gap-4">
					{#each lastGuess.result as result, index}
						<span class="flex justify-center items-center h-12 w-12" style:background-color={guessesColors[result]} />
					{/each}
				</div>
			{/if}
		</li>
	{/each}
</ul>
