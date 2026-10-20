import {
	DEFAULT_LEAD_FILTER_CRITERIA,
	type Lead,
	type LeadFilterCriteria,
} from '@/types/lead'

export function countActiveFilters(
	criteria?: Partial<LeadFilterCriteria> | null
): number {
	if (!criteria) {
		return 0
	}

	let activeCount = 0

	if (criteria.query !== undefined && criteria.query.trim().length > 0) {
		activeCount += 1
	}

	if (criteria.whatsappOnly) {
		activeCount += 1
	}

	if (criteria.withPhoneOnly) {
		activeCount += 1
	}

	if (criteria.website !== undefined && criteria.website !== 'all') {
		activeCount += 1
	}

	if (
		criteria.category !== undefined &&
		criteria.category !== null &&
		criteria.category !== 'all' &&
		criteria.category.trim().length > 0
	) {
		activeCount += 1
	}

	if (criteria.status !== undefined && criteria.status !== null) {
		activeCount += 1
	}

	return activeCount
}

export function filterLeads(
	leads: readonly Lead[],
	criteria?: Partial<LeadFilterCriteria> | null
): Lead[] {
	if (leads.length === 0) {
		return []
	}

	if (!criteria) {
		return Array.from(leads)
	}

	const normalizedCriteria: LeadFilterCriteria = {
		...DEFAULT_LEAD_FILTER_CRITERIA,
		...criteria,
	}

	const trimmedQuery = normalizedCriteria.query.trim().toLowerCase()
	const queryDigits = trimmedQuery.replace(/\D/g, '')
	const hasQuery = trimmedQuery.length > 0

	return leads.filter(function (lead) {
		if (hasQuery) {
			const matchesName = lead.name.toLowerCase().includes(trimmedQuery)
			const matchesCategoryText =
				lead.metadata.category !== null &&
				lead.metadata.category.toLowerCase().includes(trimmedQuery)
			const matchesPhone =
				lead.contact.phone !== null &&
				lead.contact.phone.toLowerCase().includes(trimmedQuery)
			const matchesFormattedPhone =
				lead.contact.formattedPhone !== null &&
				lead.contact.formattedPhone.toLowerCase().includes(trimmedQuery)
			const matchesPhoneDigits =
				queryDigits.length > 0 &&
				lead.contact.phone !== null &&
				lead.contact.phone.replace(/\D/g, '').includes(queryDigits)
			const matchesCity =
				lead.location.city !== null &&
				lead.location.city.toLowerCase().includes(trimmedQuery)
			const matchesNeighborhood =
				lead.location.neighborhood !== null &&
				lead.location.neighborhood.toLowerCase().includes(trimmedQuery)
			const matchesDocument =
				lead.metadata.document !== null &&
				lead.metadata.document.toLowerCase().includes(trimmedQuery)
			const matchesDocumentDigits =
				queryDigits.length > 0 &&
				lead.metadata.document !== null &&
				lead.metadata.document.replace(/\D/g, '').includes(queryDigits)

			const matchesAnyQueryField =
				matchesName ||
				matchesCategoryText ||
				matchesPhone ||
				matchesFormattedPhone ||
				matchesPhoneDigits ||
				matchesCity ||
				matchesNeighborhood ||
				matchesDocument ||
				matchesDocumentDigits

			if (!matchesAnyQueryField) {
				return false
			}
		}

		if (normalizedCriteria.whatsappOnly && !lead.contact.hasWhatsapp) {
			return false
		}

		if (
			normalizedCriteria.withPhoneOnly &&
			(lead.contact.phone === null || lead.contact.phone.trim().length === 0)
		) {
			return false
		}

		if (normalizedCriteria.website === 'with' && !lead.contact.hasWebsite) {
			return false
		}

		if (normalizedCriteria.website === 'without' && lead.contact.hasWebsite) {
			return false
		}

		if (
			normalizedCriteria.category !== null &&
			normalizedCriteria.category !== 'all' &&
			normalizedCriteria.category.trim().length > 0
		) {
			if (
				lead.metadata.category === null ||
				lead.metadata.category.trim().toLowerCase() !==
					normalizedCriteria.category.trim().toLowerCase()
			) {
				return false
			}
		}

		if (
			normalizedCriteria.status !== null &&
			lead.status !== normalizedCriteria.status
		) {
			return false
		}

		return true
	})
}
