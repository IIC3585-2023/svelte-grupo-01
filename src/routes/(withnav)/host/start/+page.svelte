<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { currentGame } from '../gamesDB';

	let id: string;
	onMount(async () => {
		const { default: Peer } = await import('peerjs');

		const peer = new Peer();
		peer.on('open', () => (id = peer.id));

		peer.on('connection', (conn) => {
			conn.on('data', (data) => {
				console.log(data);
			});
		});
	});
</script>

Starting game

{#if id}
	{@const url = `${$page.url.origin}/play?game=${id}`}
	<a href={url}>Play ({url})</a>
{/if}
