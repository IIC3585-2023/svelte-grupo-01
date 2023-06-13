export function displayTime(time: number) {
	if (Number.isNaN(time)) return 'Not started yet!';
	if (time < 0) return '00:00';
	time = time / 1000;
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
