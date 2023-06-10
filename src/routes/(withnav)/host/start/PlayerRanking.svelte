<script lang="ts">
	import { getEmoji } from '$lib/emojis';
	import type { Player } from './gameHost';

	export let players: Player[];

	const guessesColors = {
		C: 'hsl(130, 80%, 90%)',
		A: 'hsl(50, 80%, 90%)',
		P: 'hsl(25, 70%, 95%)',
	};
</script>

<ol>
	{#each players as player (player.id)}
		<li class="flex gap-4 bg-orange-400">
			<div class="flex gap-4">
				<div
					class="h-14 w-14 text-2xl font-bold flex justify-center items-center bg-orange-200 text-orange-900"
				>
					{player.currentWordIndex}
				</div>
				<div
					style:background-color={player.repr.color}
					class="h-14 w-14 text-4xl flex justify-center items-center shadow-inner"
				>
					{getEmoji(player.repr.emoji)}
				</div>
			</div>
			<ol class="flex gap-4">
				{#each player.guesses[player.guesses.length - 1]?.result ?? ['A', 'A', 'A', 'A', 'A', 'A'] as guess}
					<li class="h-14 w-14" style:background-color={guessesColors[guess]} />
				{/each}
			</ol>
			<div class="flex px-4 items-center bg-orange-50 flex-grow">
				{player.name || 'Benja'}
			</div>
		</li>
	{/each}
</ol>
