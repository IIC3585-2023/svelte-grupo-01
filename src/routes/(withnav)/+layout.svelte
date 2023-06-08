<script lang="ts">
  import { base } from '$app/paths';
</script>

<nav class="flex flex-col gap-2 sm:flex-row items-center px-4 py-2 border-b-2 border-b-orange-950">
  <div class="left">
    <a href="/" class="text-2xl font-bold text-orange-950 leading-tight">Competitive Wordle</a>
  </div>
  <div class="right">
    <a href={`${base}/host`}>Host</a>
    <a href={`${base}/play`}>Play</a>
  </div>
</nav>

<slot />

<style>
  .left {
    flex: 1;
  }
  .right {
    display: flex;
    gap: theme('gap.4');
  }
  .right > a {
    padding: theme('padding.2') theme('padding.4');
    background-color: theme('colors.orange.400');
    color: theme('colors.orange.50');
    text-align: center;
    display: block;
    width: theme('width.24');
  }
</style>
