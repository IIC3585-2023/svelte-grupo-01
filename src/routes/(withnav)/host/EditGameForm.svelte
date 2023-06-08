<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import type { Game } from './gamesDB';

  export let game: Game;

  const flipDurationMs = 200;

  const dispatch = createEventDispatcher<{ submit: Game }>();

  let wordsWithIdAttr = game.words.map((word) => ({ word, id: word }));
  let newWord: string = '';

  function handleAddNewWord() {
    if (wordsWithIdAttr.find(({ word }) => word === newWord)) return;

    wordsWithIdAttr.push({ word: newWord, id: newWord });
    wordsWithIdAttr = wordsWithIdAttr;
    newWord = '';
  }
</script>

<form
  on:submit|preventDefault={() =>
    dispatch('submit', { ...game, words: wordsWithIdAttr.map((e) => e.word) })}
>
  <label>
    Name:
    <input type="text" bind:value={game.name} />
  </label>
  <label>
    Time in seconds:
    <input type="number" bind:value={game.timeInSeconds} />
  </label>

  <h2>Words ({wordsWithIdAttr.length})</h2>
  <form on:submit|preventDefault={handleAddNewWord}>
    <input type="text" bind:value={newWord} />
    <button type="submit">Add</button>
  </form>
  <ul
    use:dndzone={{ items: wordsWithIdAttr, flipDurationMs }}
    on:consider={(e) => (wordsWithIdAttr = e.detail.items)}
    on:finalize={(e) => (wordsWithIdAttr = e.detail.items)}
  >
    {#each wordsWithIdAttr as { word, id } (id)}
      <li animate:flip={{ duration: flipDurationMs }}>{word}</li>
    {/each}
  </ul>

  <button type="submit">Save</button>
</form>
