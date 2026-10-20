import Papa from 'papaparse'

import type { Lead } from '@/types/lead'
import { normalizePhone } from '@/utils/phone-normalizer'
import { normalizeUrl } from '@/utils/url-normalizer'

type FieldKey =
	| 'name'
	| 'phone'
	| 'website'
	| 'category'
	| 'document'
	| 'city'
	| 'state'
	| 'address'
	| 'neighborhood'
	| 'postalCode'

const FIELD_KEYS: readonly FieldKey[] = [
	'name',
	'phone',
	'website',
	'category',
	'document',
	'city',
	'state',
	'address',
	'neighborhood',
	'postalCode',
]

const FIELD_ALIASES: Record<FieldKey, readonly string[]> = {
	name: [
		'nome',
		'empresa',
		'razao social',
		'nome fantasia',
		'title',
		'company',
		'business name',
		'name',
		'razao',
		'fantasia',
		'cliente',
		'estabelecimento',
	],
	phone: [
		'telefone',
		'celular',
		'whatsapp',
		'fone',
		'tel',
		'phone',
		'mobile',
		'contato',
		'whatsapp 1',
		'telefone 1',
		'celular 1',
		'telephone',
	],
	website: ['site', 'website', 'url', 'pagina', 'web', 'homepage', 'link'],
	category: [
		'categoria',
		'segmento',
		'ramo',
		'atividade',
		'category',
		'type',
		'niche',
		'setor',
		'ocupacao',
	],
	document: [
		'cnpj',
		'cpf',
		'documento',
		'doc',
		'document',
		'cnpjcpf',
		'cpfcnpj',
		'tax id',
	],
	city: ['cidade', 'municipio', 'city', 'town'],
	state: ['estado', 'uf', 'state', 'province'],
	address: [
		'endereco',
		'logradouro',
		'rua',
		'address',
		'street',
		'localizacao',
	],
	neighborhood: ['bairro', 'neighborhood', 'district', 'distrito'],
	postalCode: [
		'cep',
		'postalcode',
		'zip',
		'zipcode',
		'postal code',
		'zip code',
	],
}

const CORPORATE_TERM_REGEX =
	/\b(ltda|eireli|s[/.]?a|me|epp|inc|corp|llc|gmbh|coop|cooperativa|associacao|instituto|servicos|comercio|loja|oficina|restaurante|padaria|barbearia|salao|otica|industria|distribuidora|auto|moto|hospital|clinica|escola|colegio|farmacia|drogaria|academia)\b/i

function normalizeHeader(header: string): string {
	return header
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function resolveHeaders(
	headers: readonly string[]
): Partial<Record<FieldKey, string>> {
	const normalizedHeaders = headers.map(function (header) {
		return { raw: header, clean: normalizeHeader(header) }
	})
	const assigned = new Set<string>()
	const resolved: Partial<Record<FieldKey, string>> = {}

	for (const field of FIELD_KEYS) {
		const aliases = FIELD_ALIASES[field]
		let match = normalizedHeaders.find(function (item) {
			return !assigned.has(item.raw) && aliases.includes(item.clean)
		})

		if (!match) {
			match = normalizedHeaders.find(function (item) {
				return (
					!assigned.has(item.raw) &&
					aliases.some(function (alias) {
						return item.clean.includes(alias)
					})
				)
			})
		}

		if (match) {
			assigned.add(match.raw)
			resolved[field] = match.raw
		}
	}

	return resolved
}

export function detectPossibleIndividual(
	name: string,
	document: string | null
): boolean {
	if (document) {
		const digits = document.replace(/\D/g, '')
		if (digits.length === 11) {
			return true
		}
		if (digits.length === 14) {
			return false
		}
	}

	const trimmed = name.trim()
	if (!trimmed || /\d/.test(trimmed) || CORPORATE_TERM_REGEX.test(trimmed)) {
		return false
	}

	const words = trimmed.split(/\s+/).filter(function (word) {
		return word.length > 0
	})

	return (
		words.length >= 2 &&
		words.length <= 5 &&
		words.every(function (word) {
			return /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(word)
		})
	)
}

function getRowValue(
	row: Record<string, string>,
	headerKey?: string
): string | null {
	if (!headerKey) {
		return null
	}
	const value = row[headerKey]?.trim()
	return value && value.length > 0 ? value : null
}

function getDeduplicationKeys(lead: Lead): string[] {
	const keys: string[] = []

	if (lead.contact.phone) {
		keys.push(`phone:${lead.contact.phone}`)
	}

	if (lead.metadata.document) {
		const digits = lead.metadata.document.replace(/\D/g, '')
		if (digits.length > 0) {
			keys.push(`doc:${digits}`)
		}
	}

	const normalizedName = lead.name.trim().toLowerCase()
	if (normalizedName.length > 0) {
		const normalizedCity = (lead.location.city ?? '').trim().toLowerCase()
		keys.push(`name_city:${normalizedName}|${normalizedCity}`)
	}

	return keys
}

export function parseCsvToLeads(csvContent: string): Lead[] {
	const cleanContent = csvContent.replace(/^\uFEFF/, '').trim()
	if (cleanContent.length === 0) {
		return []
	}

	const parseResult = Papa.parse<Record<string, string>>(cleanContent, {
		header: true,
		skipEmptyLines: 'greedy',
		transformHeader: function (header: string) {
			return header.trim()
		},
	})

	const rawHeaders = parseResult.meta.fields ?? []
	if (rawHeaders.length === 0 || parseResult.data.length === 0) {
		return []
	}

	const headers = resolveHeaders(rawHeaders)
	const seenKeys = new Set<string>()
	const leads: Lead[] = []
	const importedAt = new Date().toISOString()

	for (const row of parseResult.data) {
		const rawData: Record<string, string> = {}
		let hasContent = false

		for (const header of rawHeaders) {
			const value = row[header]?.trim() ?? ''
			rawData[header] = value
			if (value.length > 0) {
				hasContent = true
			}
		}

		if (!hasContent) {
			continue
		}

		const rawName = getRowValue(row, headers.name)
		const rawPhone = getRowValue(row, headers.phone)
		const rawDocument = getRowValue(row, headers.document)
		const rawWebsite = getRowValue(row, headers.website)

		const phone = normalizePhone(rawPhone, 'BR')
		const url = normalizeUrl(rawWebsite)
		const name = rawName ?? rawDocument ?? rawPhone ?? 'Lead sem nome'

		const lead: Lead = {
			id: crypto.randomUUID(),
			name,
			status: 'new',
			contact: {
				phone: phone.phone,
				formattedPhone: phone.formattedPhone,
				isMobile: phone.isMobile,
				hasWhatsapp: phone.hasWhatsapp,
				whatsappUrl: phone.whatsappUrl,
				website: url.website,
				hasWebsite: url.hasWebsite,
			},
			location: {
				address: getRowValue(row, headers.address),
				city: getRowValue(row, headers.city),
				state: getRowValue(row, headers.state),
				neighborhood: getRowValue(row, headers.neighborhood),
				postalCode: getRowValue(row, headers.postalCode),
			},
			metadata: {
				category: getRowValue(row, headers.category),
				document: rawDocument,
				isPossibleIndividual: detectPossibleIndividual(name, rawDocument),
				rawData,
			},
			importedAt,
		}

		const deduplicationKeys = getDeduplicationKeys(lead)
		const isDuplicate = deduplicationKeys.some(function (key) {
			return seenKeys.has(key)
		})

		if (isDuplicate) {
			continue
		}

		for (const key of deduplicationKeys) {
			seenKeys.add(key)
		}

		leads.push(lead)
	}

	return leads
}

async function readCsvFileText(file: File): Promise<string> {
	if (file.size === 0) {
		throw new Error(`File "${file.name}" is empty.`)
	}

	try {
		const buffer = await file.arrayBuffer()
		try {
			return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
		} catch (error: unknown) {
			console.debug(
				`UTF-8 decoding failed for file "${file.name}", falling back to Windows-1252.`,
				error
			)
			return new TextDecoder('windows-1252').decode(buffer)
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error)
		throw new Error(`Failed to read CSV file "${file.name}": ${message}`, {
			cause: error,
		})
	}
}

export async function parseCsvFileToLeads(file: File): Promise<Lead[]> {
	const content = await readCsvFileText(file)
	if (content.trim().length === 0) {
		throw new Error(`File "${file.name}" contains no readable data.`)
	}

	return parseCsvToLeads(content)
}
