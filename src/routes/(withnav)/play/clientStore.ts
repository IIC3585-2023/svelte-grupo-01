import { browser } from '$app/environment';
import type { Readable, Subscriber } from 'svelte/store';
import type { DataConnection, Peer } from 'peerjs';
import { Observable, fromEventPattern, tap, first, shareReplay } from 'rxjs';

type StateReadyToConnect = {
	status: 'ready-to-connect';
	connect: (id: string) => void;
	timeout?: true;
};
type State =
	| { status: 'loading' }
	| StateReadyToConnect
	| { status: 'establishing-connection' }
	| {
			status: 'connected';
			sendMessage: (data: MessageToHost) => void;
			messageObservable: Observable<MessageToPlayer>;
	  };

interface ClientPearStore extends Readable<State> {
	onReadyPromise: Promise<StateReadyToConnect>;
}

export function createClientPearStore(): ClientPearStore {
	if (!browser) {
		return {
			onReadyPromise: Promise.resolve({ status: 'ready-to-connect', connect: () => {} }),
			subscribe: (fn) => {
				fn({ status: 'loading' });
				return () => {};
			},
		};
	}
	const onReadyPromise = import('peerjs').then(({ default: Peer }) => {
		const peer = new Peer();
		return new Promise<Peer>((resolve, reject) => {
			peer.on('open', () => resolve(peer));
			peer.on('error', (err) => reject(err));
		});
	});

	let state: State = { status: 'loading' };

	onReadyPromise.then((peer) => {
		// esto está asqueroso
		function connect(id: string) {
			state = { status: 'establishing-connection' };
			notify();
			const conn = peer.connect(id);

			// timeout
			setTimeout(() => {
				if (state.status === 'establishing-connection') {
					state = { status: 'ready-to-connect', connect, timeout: true };
					notify();
					conn.close();
				}
			}, 5000);

			conn.on('open', () => {
				state = {
					status: 'connected',
					sendMessage: (data) => conn.send(data),
					messageObservable: createMessageObservable(conn),
				};
				// Esperamos a una respuesta para que todo este ok
				state.messageObservable.pipe(first()).subscribe(() => {
					console.log('first message received');
					notify();
				});
			});
			conn.on('error', console.error);
			conn.on('close', () => {
				state = { status: 'ready-to-connect', connect };
				notify();
			});
		}

		state = { status: 'ready-to-connect', connect };
		notify();
	});

	const subscribers: Subscriber<State>[] = [];
	function notify() {
		for (const subscriber of subscribers) subscriber(state);
	}

	return {
		onReadyPromise: onReadyPromise.then(() => state as StateReadyToConnect),
		subscribe: (fn) => {
			subscribers.push(fn);
			fn(state);
			return () => subscribers.splice(subscribers.indexOf(fn), 1);
		},
	};
}

function createMessageObservable(conn: DataConnection): Observable<any> {
	return fromEventPattern(
		(handler) => conn.on('data', handler),
		(handler) => conn.off('data', handler),
	).pipe(
		shareReplay(1),
		tap((data) => console.log('passing data', data)),
	);
}
