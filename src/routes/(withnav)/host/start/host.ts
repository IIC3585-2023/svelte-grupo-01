import type { Readable, Subscriber } from 'svelte/store';
import type { Game } from '../gamesDB';
import type { Peer } from '$lib/peer';
import { getRandomColor, getRandomEmojiIndex } from '$lib/repr';
import { subscriberHandler } from '$lib/storeUtils';

type Guess = { wordIndex: number; time: number; guess: string; result: GuessChar[] };

export interface PlayerInternalState {
	id: string;
	name: string;
	guesses: Guess[];
	currentWordIndex: number;
	representation: { color: string; emojiIndex: number };
	send: (data: MessageToPlayer) => void;
}

type HostGameState = {
	players: PlayerInternalState[];
} & ({ status: 'waiting' } | { status: 'playing'; startTime: number; endTime: number });

interface HostGameStore extends Readable<HostGameState> {
	start: () => void;
	destroy: () => void;
}

export function createGameHostStore(peer: Peer, game: Game): HostGameStore {
	let state: HostGameState = { status: 'waiting', players: [] };

	peer.on('connection', (conn) => {
		console.info('New connection', conn);

		const newPlayer = createPlayer(conn.peer, (d) => conn.send(d));
		conn.on('open', () => {
			state.players.push(newPlayer);
			notifyAll();
		});
		conn.on('close', () => {
			state.players.splice(state.players.indexOf(newPlayer), 1);
			notifyAll();
		});
		conn.on('data', (d) => handlePlayerMessage(d as MessageToHost, newPlayer));
	});

	function handlePlayerMessage(msg: MessageToHost, player: PlayerInternalState) {
		switch (msg.type) {
			case 'player-name':
				player.name = msg.name;
				notifyAll();
				break;

			case 'player-guess':
				if (guardGuess(player)) return;
				const word = game.words[player.currentWordIndex];

				const { ok, match } = checkGuess(word, msg.guess);
				player.guesses.push({
					wordIndex: player.currentWordIndex,
					time: Date.now(),
					guess: msg.guess,
					result: match,
				});

				if (ok) player.currentWordIndex++;
				sortPlayers(state.players);
				notifyAll();
				break;
		}
	}

	function guardGuess(player: PlayerInternalState) {
		if (state.status === 'waiting') {
			console.warn('Player guessed while the game is not running');
			return true;
		}
		const time = Date.now();
		if (time < state.startTime || time > state.endTime) {
			console.warn('Player guessed outside of game time');
			return true;
		}

		if (player.currentWordIndex >= game.words.length) {
			console.warn('Player guessed after the game ended');
			return true;
		}

		return false;
	}

	function start(delay: number = 1000) {
		const startTime = Date.now() + delay;
		state = {
			status: 'playing',
			startTime,
			endTime: startTime + game.timeInSeconds * 1000,
			players: state.players,
		};
		notifyAll();
	}

	const { notifySubscribers, subscribe } = subscriberHandler(() => state);

	function notifyAll() {
		notifySubscribers();
		for (const ply of state.players) ply.send({ type: 'game-state', ...publicState(state, ply, game) });
	}

	function destroy() {
		peer.destroy();
	}

	return { start, subscribe, destroy };
}

function createPlayer(id: string, send: (data: MessageToPlayer) => void) {
	return {
		id,
		name: '',
		guesses: [],
		currentWordIndex: 0,
		representation: {
			color: getRandomColor(),
			emojiIndex: getRandomEmojiIndex(),
		},
		send,
	};
}

function checkGuess(word: string, guess: string) {
	let ok = true;
	const w = word.toUpperCase();
	const g = guess.toUpperCase();

	let match: GuessChar[] = [];

	for (let i = 0; i < word.length; i++) {
		if (w[i] === g[i]) {
			match.push('C');
		} else {
			ok = false;
			if (w.includes(g[i])) {
				match.push('P');
			} else {
				match.push('A');
			}
		}
	}
	return { ok, match };
}

function publicState(state: HostGameState, player: PlayerInternalState, game: Game): PublicGameState {
	if (state.status === 'waiting')
		return {
			status: 'waiting',
			...publicWaitingState(state, player, game),
		};

	return {
		status: 'playing',
		...publicWaitingState(state, player, game),
		startTime: state.startTime,
		endTime: state.endTime,
	};
}

function publicWaitingState(
	state: HostGameState,
	player: PlayerInternalState,
	game: Game,
): Omit<PublicGameState, 'status'> {
	return {
		wordsLengths: game.words.map((w) => w.length),
		self: {
			id: player.id,
			name: player.name,
			representation: player.representation,
			currentWordIndex: player.currentWordIndex,
			lastGuess: player.guesses[player.guesses.length - 1],
		},
		players: state.players.map((p) => {
			const lg = p.guesses[player.guesses.length - 1];
			return {
				id: p.id,
				representation: p.representation,
				name: p.name,
				currentWordIndex: p.currentWordIndex,
				lastGuess: lg ? { result: lg.result, time: lg.time, wordIndex: lg.wordIndex } : undefined,
			};
		}),
	};
}

function sortPlayers(players: PlayerInternalState[]) {
	players.sort((a, b) => {
		if (a.currentWordIndex === b.currentWordIndex) {
			return b.guesses.length - a.guesses.length;
		}

		return b.currentWordIndex - a.currentWordIndex;
	});
}
