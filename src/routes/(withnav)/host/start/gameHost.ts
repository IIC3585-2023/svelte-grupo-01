import { browser } from '$app/environment';

import type { Readable, Subscriber } from 'svelte/store';
import { getRandomColor, getRandomEmojiIndex } from '$lib/emojis';

type Guess = { wordIndex: number; time: number; guess: string; result: GuessChar[] };

export interface Player {
	// State
	id: string;
	name: string;
	guesses: Guess[];
	currentWordIndex: number;
	repr: {
		color: string;
		emoji: number;
	};
	// Actions
	send: (data: MessageToPlayer) => void;
}

type GameState =
	| {
			status: 'loading';
	  }
	| ({
			connectionId: string;
			players: Player[];
	  } & (
			| { status: 'waiting' }
			| { status: 'playing' | 'finished'; startTime: number; endTime: number }
	  ));

interface GameHostParams {
	words: string[];
	timeInSeconds: number;
	delay: number;
}

interface GameStore extends Readable<GameState> {
	start: () => void;
}

export function createGameHostStore({ timeInSeconds, words, delay }: GameHostParams): GameStore {
	if (!browser)
		return {
			start: () => {},
			subscribe: (fn) => {
				fn({ status: 'loading' });
				return () => {};
			},
		};
	let state: GameState = { status: 'loading' };
	import('peerjs').then(({ default: Peer }) => {
		const peer = new Peer();
		const players: Player[] = [];

		peer.on('open', () => {
			// Prepare for new players

			peer.on('connection', (conn) => {
				if (state.status !== 'waiting') {
					conn.send({ type: 'game-started' });
					conn.close();
				}

				const connectionPLayer: Player = {
					id: conn.peer,
					name: '',
					guesses: [],
					currentWordIndex: 0,
					send: (data) => conn.send(data),
					repr: {
						color: getRandomColor(),
						emoji: getRandomEmojiIndex(),
					},
				};

				players.push(connectionPLayer);

				conn.on('open', () => {
					notifyPlayers();
				});
				notifySubscribers();

				conn.on('data', (untypedData) => {
					// On data from player
					const data = untypedData as MessageToHost;
					console.info('Host received data', data);
					switch (data.type) {
						case 'player-name':
							connectionPLayer.name = data.name;
							notifySubscribers();
							notifyPlayers();
							break;

						case 'player-guess': {
							if (state.status !== 'playing') {
								console.warn('Player guessed outside of game time');
								return;
							}

							const time = Date.now();
							if (time < state.startTime || time > state.endTime) {
								console.warn('Player guessed outside of game time');
								return;
							}

							const wordIndex = connectionPLayer.currentWordIndex;
							const word = words[wordIndex];
							console.log(`Should compare ${data.guess} to ${word}`);
							const result = matchWord(word, data.guess);

							connectionPLayer.guesses.push({
								time,
								wordIndex,
								guess: data.guess,
								result,
							});

							if (data.guess === word) connectionPLayer.currentWordIndex++;

							notifySubscribers();
							notifyPlayers();
						}
					}
				});
				conn.on('close', () => {
					// On player disconnect
					players.splice(players.indexOf(connectionPLayer), 1);
					notifySubscribers();
					notifyPlayers();
				});
			});

			// Start the waiting room
			state = { status: 'waiting', players, connectionId: peer.id };
			notifySubscribers();
		});
	});

	const start = () => {
		if (state.status !== 'waiting') throw new Error('Invalid state');

		state = {
			...state,
			status: 'playing',
			startTime: Date.now() + delay,
			endTime: Date.now() + delay + timeInSeconds * 1000,
		};
		notifySubscribers();
		notifyPlayers();

		setTimeout(() => {
			state.status = 'finished';
			notifySubscribers();
			notifyPlayers();
		}, delay + timeInSeconds * 1000);
	};

	const subscribers: Subscriber<GameState>[] = [];
	function notifySubscribers() {
		for (const fn of subscribers) fn(state);
	}

	function notifyPlayers() {
		if (state.status === 'loading') return;

		if (state.status === 'waiting') {
			for (const player of state.players) {
				player.send({
					type: 'game-state',
					status: state.status,
					self: {
						id: player.id,
						name: player.name,
						repr: player.repr,
						guesses: player.guesses,
						currentWordIndex: player.currentWordIndex,
					},
					players: state.players.map((p) => ({
						id: p.id,
						name: p.name,
						repr: p.repr,
						guesses: [],
						currentWordIndex: 0,
					})),
				});
			}
			return;
		}

		if (state.status === 'playing') {
			for (const player of state.players) {
				player.send({
					type: 'game-state',
					status: state.status,
					startTime: state.startTime,
					endTime: state.endTime,
					self: {
						id: player.id,
						name: player.name,
						repr: player.repr,
						currentWordIndex: player.currentWordIndex,
						guesses: player.guesses,
					},
					players: state.players.map((p) => ({
						id: p.id,
						name: p.name,
						repr: p.repr,
						currentWordIndex: p.currentWordIndex,
						guesses: p.guesses.map(({ result, wordIndex, time }) => ({
							result,
							wordIndex,
							time,
						})),
					})),
				});
			}
		}
	}

	// Return store
	return {
		start,
		subscribe: (fn) => {
			fn(state);
			subscribers.push(fn);
			return () => subscribers.splice(subscribers.indexOf(fn), 1);
		},
	};
}

// Wordle match function
function matchWord(word: string, guess: string) {
	const results: GuessChar[] = [];

	for (let i = 0; i < word.length; i++) {
		const letter = word.at(i);
		if (letter === undefined) {
			results.push('A');
		} else if (letter === guess[i]) {
			results.push('C');
		} else if (word.includes(letter)) {
			results.push('P');
		} else {
			results.push('A');
		}
	}
	return results;
}
