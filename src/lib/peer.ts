import type { Peer } from 'peerjs';
export type { Peer, ConnectionType as Connection } from 'peerjs';

export const loadPeerPromise = new Promise<Peer>(async (resolve, reject) => {
	if (typeof window === 'undefined') return;

	const { default: Peer } = await import('peerjs');
	const peer = new Peer();
	peer.on('open', () => resolve(peer));
	peer.on('error', (err) => reject(err));
});
