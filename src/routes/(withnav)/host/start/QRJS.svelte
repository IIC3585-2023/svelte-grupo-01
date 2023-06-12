<script>
	import { onMount } from 'svelte';

	export let codeValue;
	export let squareSize;

	let qrcode;

	onMount(() => {
		let script = document.createElement('script');
		script.src = 'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js';
		document.head.append(script);

		script.onload = function () {
			qrcode = new QRCode('qrcode', {
				text: codeValue,
				width: squareSize,
				height: squareSize,
				colorDark: '#000000',
				colorLight: '#ffffff',
				correctLevel: QRCode.CorrectLevel.H,
			});
		};

		document.getElementById('qrcode').addEventListener('click', () => {
			window.open(codeValue, '_blank', 'noopener,noreferrer');
		});
	});
</script>

<div class="flex justify-center items-center py-4">
	<div id="qrcode" class="flex justify-center items-center w-32 h-32" />
</div>
