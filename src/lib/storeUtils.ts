import type { Subscriber } from 'svelte/store';

export function subscriberHandler<T>(getState: () => T) {
	const subscribers: Subscriber<T>[] = [];

	function notifySubscribers() {
		const state = getState();
		for (const subscriber of subscribers) subscriber(state);
	}

	function subscribe(subscriber: Subscriber<T>) {
		subscribers.push(subscriber);
		subscriber(getState());
		return () => subscribers.splice(subscribers.indexOf(subscriber), 1);
	}

	return { notifySubscribers, subscribe };
}
