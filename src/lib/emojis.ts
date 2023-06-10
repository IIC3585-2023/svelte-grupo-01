const emojis = [
	'🐶',
	'🐱',
	'🐰',
	'🦊',
	'🐻',
	'🐼',
	'🐷',
	'🐸',
	'🐔',
	'🐧',
	'🐦',
	'🐤',
	'🦄',
	'🐝',
	'🐛',
	'🦋',
	'🐞',
	'🕷',
	'🐢',
	'🐍',
	'🦕',
	'🐙',
	'🦀',
	'🐡',
	'🐠',
	'🐟',
	'🐳',
	'🐊',
	'🦓',
	'🦍',
	'🦧',
	'🦌',
	'🐕',
	'🐓',
	'🦜',
	'🦢',
	'🦩',
	'🕊',
	'🐿',
	'🐾',
	'🐉',
	'🌵',
	'🎄',
];

export function getRandomEmojiIndex() {
	return Math.floor(Math.random() * emojis.length);
}

export function getEmoji(index: number) {
	return emojis[index];
}

export function getRandomColor() {
	const hue = Math.floor(Math.random() * 360);
	const saturation = 95;
	const lightness = 90;
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
