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

export const guessesColors = {
	C: 'hsl(130, 80%, 60%)', // Correct
	P: 'hsl(50, 80%, 50%)', // Present
	A: 'hsl(5, 90%, 60%)', // Absent
};

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
