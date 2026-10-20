export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B'
	const units = ['B', 'KB', 'MB', 'GB']
	const index = Math.floor(Math.log(bytes) / Math.log(1024))
	const safeIndex = Math.min(index, units.length - 1)
	const size = bytes / Math.pow(1024, safeIndex)
	return `${size.toFixed(1)} ${units[safeIndex]}`
}
