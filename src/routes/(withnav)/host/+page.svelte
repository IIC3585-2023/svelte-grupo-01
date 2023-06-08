<script lang="ts">
  import { base } from '$app/paths';
  import EditGameForm from './EditGameForm.svelte';
  import { gamesDB, currentGame } from './gamesDB';

  let newGameName: string = '';
</script>

<h1>Host a Game</h1>

{#if $gamesDB.status === 'loading'}
  <div>Cargando</div>
{:else if $currentGame}
  <EditGameForm game={$currentGame} on:submit={(e) => gamesDB.updateGame(e.detail)} />
{:else}
  <form on:submit={() => gamesDB.createGame({ name: newGameName })}>
    <input type="text" bind:value={newGameName} />
    <button type="submit">Create</button>
  </form>
  <ul>
    {#each $gamesDB.games as game}
      <li>
        {game.name}
        <a href={`${base}/host?game=${game.id}`}>Edit</a>
        <button on:click={() => gamesDB.deleteGame({ id: game.id })}>Delete</button>
        <a href={`${base}/host/start?game=${game.id}`}>Start</a>
      </li>
    {/each}
  </ul>
{/if}
