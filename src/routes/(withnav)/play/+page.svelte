<script lang="ts">
  import type { default as Peer, DataConnection } from 'peerjs';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';

  const currentGameConnectionId = derived(page, ($page) => {
    const url = new URL($page.url);
    return url.searchParams.get('game');
  });

  onMount(async () => {
    const { default: Peer } = await import('peerjs');
    const peer = new Peer();

    console.log($currentGameConnectionId);

    const conn = peer.connect($currentGameConnectionId!);
    conn.on('open', () => {
      conn.send('Hello from client!');
    });
  });
</script>

<h1>Join a Loby</h1>
