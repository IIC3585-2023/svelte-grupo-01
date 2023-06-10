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

	declare interface PublicPlayer {
		id: string;
		name: string;
		repr: {
			color: string;
			emoji: number;
		};
		currentWordIndex: number;
		guesses: {
			result: GuessChar[];
			time: number;
			wordIndex: number;
		}[];
	}

	declare interface PrivatePlayer extends PublicPlayer {
		guesses: {
			result: GuessChar[];
			time: number;
			wordIndex: number;
			guess: string;
		}[];
	}

	type GuessChar = 'C' | 'P' | 'A';

	declare type MessageToHost =
		| { type: 'player-name'; name: string }
		| { type: 'player-guess'; guess: string };

	type GameState = { type: 'game-state'; players: PublicPlayer[]; self: PrivatePlayer };
	declare type MessageToPlayer =
		| GameState &
				({ status: 'waiting' } | { status: 'playing'; startTime: number; endTime: number });
}

export {};
