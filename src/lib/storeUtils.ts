import type { Subscriber } from 'svelte/store';

function createDummySubscribe<T>(dummyState: T) {
	return function dummySubscribe(fn: (state: T) => void) {
		fn(dummyState);
		return () => {};
	};
}

type DummyStore<K extends readonly string[], S> = { [key in K[number]]: any } & {
	subscribe: (fn: (state: S) => void) => () => void;
};

export function createDummyStore<K extends readonly string[], S>(dummyState: S, ...dummyActions: K) {
	return {
		subscribe: createDummySubscribe(dummyState),
		...Object.fromEntries(dummyActions.map((action) => [action, () => {}] as const)),
	} as DummyStore<K, S>;
}

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
