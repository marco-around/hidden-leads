import type { Lead, ListQualityMetrics } from '@/types/lead'

function calculatePercentage(count: number, total: number): number {
	if (total === 0) {
		return 0
	}

	return Math.round((count / total) * 1000) / 10
}

function createEmptyQualityMetrics(): ListQualityMetrics {
	return {
		totalLeads: 0,
		withPhoneCount: 0,
		withPhonePercentage: 0,
		withWhatsappCount: 0,
		withWhatsappPercentage: 0,
		withWebsiteCount: 0,
		withWebsitePercentage: 0,
		withoutWebsiteCount: 0,
		withoutWebsitePercentage: 0,
		possibleIndividualsCount: 0,
		possibleIndividualsPercentage: 0,
		completeDataCount: 0,
		completeDataPercentage: 0,
	}
}

export function calculateListQualityMetrics(
	leads: readonly Lead[]
): ListQualityMetrics {
	const totalLeads = leads.length

	if (totalLeads === 0) {
		return createEmptyQualityMetrics()
	}

	let withPhoneCount = 0
	let withWhatsappCount = 0
	let withWebsiteCount = 0
	let possibleIndividualsCount = 0
	let completeDataCount = 0

	for (const lead of leads) {
		const hasPhone =
			lead.contact.phone !== null && lead.contact.phone.trim().length > 0
		const hasWhatsapp = lead.contact.hasWhatsapp
		const hasWebsite = lead.contact.hasWebsite

		if (hasPhone) {
			withPhoneCount += 1
		}
		if (hasWhatsapp) {
			withWhatsappCount += 1
		}
		if (hasWebsite) {
			withWebsiteCount += 1
		}
		if (lead.metadata.isPossibleIndividual) {
			possibleIndividualsCount += 1
		}
		if (hasPhone && hasWhatsapp && hasWebsite) {
			completeDataCount += 1
		}
	}

	const withoutWebsiteCount = totalLeads - withWebsiteCount

	return {
		totalLeads,
		withPhoneCount,
		withPhonePercentage: calculatePercentage(withPhoneCount, totalLeads),
		withWhatsappCount,
		withWhatsappPercentage: calculatePercentage(withWhatsappCount, totalLeads),
		withWebsiteCount,
		withWebsitePercentage: calculatePercentage(withWebsiteCount, totalLeads),
		withoutWebsiteCount,
		withoutWebsitePercentage: calculatePercentage(
			withoutWebsiteCount,
			totalLeads
		),
		possibleIndividualsCount,
		possibleIndividualsPercentage: calculatePercentage(
			possibleIndividualsCount,
			totalLeads
		),
		completeDataCount,
		completeDataPercentage: calculatePercentage(completeDataCount, totalLeads),
	}
}

export { calculateListQualityMetrics as calculateMetrics }
