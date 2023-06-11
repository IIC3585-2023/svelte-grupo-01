import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Readable, Subscriber } from 'svelte/store';
import { browser } from '$app/environment';

export type Game = {
	id: number;
	name: string;
	timeInSeconds: number;
	words: string[];
};

type State = { games: Game[]; status: 'loading' | 'ready' };

interface DBStore extends Readable<State> {
	readyPromise: Promise<Game[]>;
	createGame: (game: Pick<Game, 'name'>) => void;
	deleteGame: (game: Pick<Game, 'id'>) => void;
	updateGame: (game: Game) => void;
}

interface GamesSchema extends DBSchema {
	games: {
		key: number;
		value: Game;
	};
}

type DB = IDBPDatabase<GamesSchema>;

function createGamesDBStore(): DBStore {
	// on SSR, return dummy
	if (!browser) {
		return {
			readyPromise: Promise.resolve([]),
			createGame: () => {},
			deleteGame: () => {},
			updateGame: () => {},
			subscribe: (fn) => {
				fn({ games: [], status: 'loading' });
				return () => {};
			},
		};
	}

	const state: State = { games: [], status: 'loading' };
	const refreshChannel = new BroadcastChannel('games-refresh');
	const subscriptions: Subscriber<State>[] = [];
	const prepareDBPromise = prepareDB();

	async function prepareDB() {
		const db = await openDB<GamesSchema>('wordle-games', 1, {
			upgrade(database) {
				database.createObjectStore('games', { keyPath: 'id' });
			},
		});

		state.status = 'ready';
		state.games = await db.getAll('games');
		notify();

		return { db, games: state.games };
	}

	async function refreshGames() {
		const { db } = await prepareDBPromise;
		state.games = await db.getAll('games');
		notify();
	}

	function notify() {
		for (const fn of subscriptions) fn(state);
	}

	refreshChannel.addEventListener('message', refreshGames);

	function withDBTransaction<T>(fn: (params: { db: DB } & T) => Promise<void>) {
		return async function action(params: T) {
			await fn({ db: (await prepareDBPromise).db, ...params });
			refreshChannel.postMessage('refresh');
			refreshGames();
		};
	}

	return {
		readyPromise: prepareDBPromise.then(({ games }) => games),
		subscribe: (fn: Subscriber<State>) => {
			subscriptions.push(fn);
			fn(state);
			return () => subscriptions.splice(subscriptions.indexOf(fn), 1);
		},
		createGame: withDBTransaction(async ({ db, name }) => {
			const game = { id: +new Date(), name, timeInSeconds: 300, words: [] };
			await db.put('games', game);
		}),

		deleteGame: withDBTransaction(async ({ db, id }) => {
			await db.delete('games', id);
		}),
		updateGame: withDBTransaction(async ({ db, ...game }) => {
			await db.put('games', game);
		}),
	};
}

export const gamesDB = createGamesDBStore();
