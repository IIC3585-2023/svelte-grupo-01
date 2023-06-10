import type { Player } from './gameHost';

function findLast<T>(arr: T[], fn: (t: T) => boolean): T | undefined {
	for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i])) return arr[i];
}

export function playersOrder(a: Player, b: Player) {
	if (a.currentWordIndex === b.currentWordIndex) {
		const index = a.currentWordIndex;
		if (index === 0) return 0;

		// find if the last correct guess was before or after
		const lastA = findLast(a.guesses, (guess) => guess.wordIndex === index - 1);
		const lastB = findLast(b.guesses, (guess) => guess.wordIndex === index - 1);

		if (lastA && lastB) return lastA.time - lastB.time;
		return 0;
	}

	return a.currentWordIndex - b.currentWordIndex;
}
