<script>
	import { base } from '$app/paths';
</script>

<main>
	<h1>Competitive Wordle</h1>
	<nav>
		<a href={`${base}/host`}>Host</a>
		<a href={`${base}/play`}>Play</a>
	</nav>
</main>

<style>
	h1 {
		font-size: theme('fontSize.4xl');
		font-weight: theme('fontWeight.bold');
		color: theme('textColor.orange.950');
		margin-bottom: theme('margin.4');
	}
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	nav {
		display: flex;
		gap: theme('gap.4');
		justify-items: center;
	}
	a {
		padding: theme('padding.2') theme('padding.4');
		background-color: theme('colors.orange.400');
		color: theme('colors.orange.50');
		width: theme('width.24');
		text-align: center;
	}
</style>
