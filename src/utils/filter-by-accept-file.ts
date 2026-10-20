export function filterByAccept(files: File[], accept: string): File[] {
	const acceptedTypes = accept
		.split(',')
		.map((type) => type.trim().toLowerCase())

	return files.filter((file) =>
		acceptedTypes.some((type) => {
			if (type.startsWith('.')) {
				return file.name.toLowerCase().endsWith(type)
			}
			return file.type.match(new RegExp(type.replace('*', '.*')))
		})
	)
}
