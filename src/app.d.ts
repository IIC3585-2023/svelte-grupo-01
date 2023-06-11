// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// https://github.com/isaacHagoel/svelte-dnd-action#typescript
	declare type Item = import('svelte-dnd-action').Item;
	declare type DndEvent<ItemType = Item> = import('svelte-dnd-action').DndEvent<ItemType>;
	declare namespace svelte.JSX {
		interface HTMLAttributes<T> {
			onconsider?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
			onfinalize?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
		}
	}

	// Correct - Present - Absent
	type GuessChar = 'C' | 'P' | 'A';

	declare type MessageToHost = { type: 'player-name'; name: string } | { type: 'player-guess'; guess: string };

	type PublicGuess = { wordIndex: number; time: number; result: GuessChar[] };
	type PrivateGuess = PublicGuess & { guess: string };

	interface PublicPlayer {
		id: string;
		name: string;
		representation: { color: string; emojiIndex: number };
		currentWordIndex: number;
	}
	declare type PublicGameState = {
		self: PublicPlayer & { lastGuess?: PrivateGuess };
		players: (PublicPlayer & { lastGuess?: PublicGuess })[];
		wordsLengths: number[];
	} & ({ status: 'waiting' } | { status: 'playing'; startTime: number; endTime: number });

	declare type MessageToPlayer = { type: 'game-state' } & PublicGameState;
}

export {};
