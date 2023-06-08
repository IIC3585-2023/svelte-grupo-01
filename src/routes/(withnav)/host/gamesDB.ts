import { openDB, type DBSchema } from 'idb';
import { page } from '$app/stores';
import { derived } from 'svelte/store';

export type Game = {
  id: number;
  name: string;
  timeInSeconds: number;
  words: string[];
};

type State = {
  games: Game[];
  status: 'loading' | 'ready';
};

type Store = {
  subscribe: (fn: Subscription) => () => void;
  createGame: (game: Pick<Game, 'name'>) => void;
  deleteGame: (game: Pick<Game, 'id'>) => void;
  updateGame: (game: Game) => void;
};

type Subscription = (state: State) => void;

interface GamesSchema extends DBSchema {
  games: {
    key: number;
    value: Game;
  };
}

function createGamesDBStore(): Store {
  // on SSR, return dummy
  if (typeof window === 'undefined') {
    return {
      createGame: () => {},
      deleteGame: () => {},
      updateGame: () => {},
      subscribe: (fn) => {
        fn({ games: [], status: 'loading' });
        return () => {};
      }
    };
  }

  const state: State = { games: [], status: 'loading' };
  const refreshChannel = new BroadcastChannel('games-refresh');
  const subscriptions: Subscription[] = [];
  const prepareDBPromise = prepareDB();

  async function prepareDB() {
    const db = await openDB<GamesSchema>('wordle-games', 1, {
      upgrade(database) {
        database.createObjectStore('games', { keyPath: 'id' });
      }
    });

    state.games = await db.getAll('games');
    state.status = 'ready';
    notify();

    return { db };
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

  return {
    subscribe: (fn: Subscription) => {
      subscriptions.push(fn);
      fn(state);
      return () => subscriptions.splice(subscriptions.indexOf(fn), 1);
    },
    createGame: async ({ name }) => {
      const { db } = await prepareDBPromise;
      const game = { id: +new Date(), name, timeInSeconds: 300, words: [] };
      await db.put('games', game);
      refreshChannel.postMessage('refresh');
      refreshGames();
    },
    deleteGame: async ({ id }: Pick<Game, 'id'>) => {
      const { db } = await prepareDBPromise;
      await db.delete('games', id);
      refreshChannel.postMessage('refresh');
      refreshGames();
    },
    updateGame: async (game: Game) => {
      const { db } = await prepareDBPromise;
      console.log(game);
      await db.put('games', game);
      refreshChannel.postMessage('refresh');
      refreshGames();
    }
  };
}

export const gamesDB = createGamesDBStore();

export const currentGame = derived([gamesDB, page], ([$gamesDB, $page]) => {
  if (typeof window === 'undefined') return null;

  const game = $page.url.searchParams.get('game');
  return game ? $gamesDB.games.find((g) => g.id === parseInt(game)) : null;
});
