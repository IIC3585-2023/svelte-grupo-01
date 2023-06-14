import type { Readable } from 'svelte/store';
import type { Peer, Connection } from '$lib/peer';

import { subscriberHandler } from '$lib/storeUtils';
import { Observable, fromEventPattern, first, shareReplay, filter } from 'rxjs';

type StateReadyToConnect = {
	status: 'ready-to-connect';
	connect: (id: string) => void;
	timeout?: true;
};

type State =
	| StateReadyToConnect
	| { status: 'establishing-connection' }
	| {
			status: 'connected';
			sendMessage: (data: MessageToHost) => void;
			gameStateObservable: Observable<PublicGameState>;
	  };

interface ClientGameStore extends Readable<State> {
	guessWord: (guess: string) => void;
	changeName: (name: string) => void;
	connect: (id: string) => void;
}

export function createGameClientStore(peer: Peer): ClientGameStore {
	let state: State = { status: 'ready-to-connect', connect };
	const { notifySubscribers, subscribe } = subscriberHandler(() => state);

	function connect(id: string) {
		if (state.status !== 'ready-to-connect') throw new Error('Not ready to connect');

		state = { status: 'establishing-connection' };
		notifySubscribers();
		const conn = peer.connect(id);
		setTimeout(() => {
			if (state.status !== 'establishing-connection') return;

			state = { status: 'ready-to-connect', connect, timeout: true };
			notifySubscribers();
			conn.close();
		}, 5000);

		const sendMessage = (data: MessageToHost) => conn.send(data);
		const gameStateObservable = createMessageObservable(conn);
		state = { status: 'connected', sendMessage, gameStateObservable };

		// Notificar que está listo en el primer mensaje
		gameStateObservable.pipe(first()).subscribe(() => notifySubscribers());

		conn.on('close', () => {
			state = { status: 'ready-to-connect', connect };
			notifySubscribers();
		});
	}

	function sendMessage(data: MessageToHost) {
		if (state.status !== 'connected') throw new Error('Not connected');
		state.sendMessage(data);
	}

	const guessWord = (guess: string) => sendMessage({ type: 'player-guess', guess });
	const changeName = (name: string) => sendMessage({ type: 'player-name', name });

	return { subscribe, guessWord, changeName, connect };
}

function createMessageObservable(conn: Connection) {
	return (
		fromEventPattern(
			(handler) => conn.on('data', handler),
			(handler) => conn.off('data', handler),
		) as Observable<MessageToPlayer>
	).pipe(
		filter(({ type }) => type === 'game-state'),
		shareReplay(1),
	);
}
