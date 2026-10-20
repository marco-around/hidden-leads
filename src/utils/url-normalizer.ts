export interface NormalizedUrl {
	website: string | null
	hasWebsite: boolean
}

const INVALID_URL_PLACEHOLDERS = new Set([
	'',
	'-',
	'--',
	'---',
	'/',
	'.',
	'n/a',
	'na',
	'none',
	'null',
	'nil',
	'undefined',
	'unknown',
	'no',
])

function createEmptyNormalizedUrl(): NormalizedUrl {
	return {
		website: null,
		hasWebsite: false,
	}
}

export function isValidUrl(rawUrl: string | null | undefined): boolean {
	const normalizedUrl = normalizeUrl(rawUrl)
	return normalizedUrl.hasWebsite
}

export function normalizeUrl(rawUrl: string | null | undefined): NormalizedUrl {
	if (rawUrl === null || rawUrl === undefined) {
		return createEmptyNormalizedUrl()
	}

	const trimmedUrl = rawUrl.trim()
	const lowercaseUrl = trimmedUrl.toLowerCase()

	if (INVALID_URL_PLACEHOLDERS.has(lowercaseUrl)) {
		return createEmptyNormalizedUrl()
	}

	if (
		trimmedUrl.includes('@') &&
		!trimmedUrl.startsWith('http://') &&
		!trimmedUrl.startsWith('https://')
	) {
		return createEmptyNormalizedUrl()
	}

	const candidateString = trimmedUrl.split(/\s+/)[0]

	let candidateWithProtocol = candidateString
	if (candidateWithProtocol.startsWith('//')) {
		candidateWithProtocol = `https:${candidateWithProtocol}`
	} else if (
		!candidateWithProtocol.startsWith('http://') &&
		!candidateWithProtocol.startsWith('https://')
	) {
		candidateWithProtocol = `https://${candidateWithProtocol}`
	}

	let parsedUrl: URL
	try {
		parsedUrl = new URL(candidateWithProtocol)
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.debug(
			`URL normalization failed for "${candidateWithProtocol}": ${errorMessage}`
		)
		return createEmptyNormalizedUrl()
	}

	const protocol = parsedUrl.protocol.toLowerCase()
	if (protocol !== 'http:' && protocol !== 'https:') {
		return createEmptyNormalizedUrl()
	}

	const hostname = parsedUrl.hostname.toLowerCase()
	if (
		!hostname.includes('.') ||
		hostname.startsWith('.') ||
		hostname.endsWith('.')
	) {
		return createEmptyNormalizedUrl()
	}

	const domainSegments = hostname.split('.')
	const topLevelDomain = domainSegments[domainSegments.length - 1]
	if (topLevelDomain.length < 2 || !/^[a-z]+$/i.test(topLevelDomain)) {
		return createEmptyNormalizedUrl()
	}

	const isRootPath = parsedUrl.pathname === '/' || parsedUrl.pathname === ''
	const hasQueryOrHash =
		parsedUrl.search.length > 0 || parsedUrl.hash.length > 0

	let cleanedUrl: string
	if (isRootPath && !hasQueryOrHash) {
		cleanedUrl = `${parsedUrl.protocol}//${parsedUrl.host}`
	} else {
		cleanedUrl = parsedUrl.href
	}

	return {
		website: cleanedUrl,
		hasWebsite: true,
	}
}
