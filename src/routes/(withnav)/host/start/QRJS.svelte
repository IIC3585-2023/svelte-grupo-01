<script lang="ts">
	import QRCode from 'qrcode';

	export let codeValue: string;

	function qr(node: HTMLCanvasElement, codeValue: string) {
		QRCode.toCanvas(node, codeValue, { color: { light: '#00000000' } });
	}
</script>

<canvas
	use:qr={codeValue}
	on:click={() => window.open(codeValue, '_blank', 'noopener,noreferrer')}
	id="qrcode"
	class="flex justify-center items-center w-40 h-40 mx-auto"
/>
