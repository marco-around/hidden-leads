export type LeadFunnelStatus =
	'new' | 'contacted' | 'replied' | 'proposal' | 'closed' | 'discarded'

export interface LeadContactInfo {
	phone: string | null
	formattedPhone: string | null
	isMobile: boolean
	hasWhatsapp: boolean
	whatsappUrl: string | null
	website: string | null
	hasWebsite: boolean
}

export interface LeadLocation {
	address: string | null
	city: string | null
	state: string | null
	neighborhood: string | null
	postalCode: string | null
}

export interface LeadMetadata {
	category: string | null
	document: string | null
	isPossibleIndividual: boolean
	rawData: Record<string, string>
}

export interface Lead {
	id: string
	name: string
	status: LeadFunnelStatus
	contact: LeadContactInfo
	location: LeadLocation
	metadata: LeadMetadata
	importedAt: string
}

export interface ListQualityMetrics {
	totalLeads: number
	withPhoneCount: number
	withPhonePercentage: number
	withWhatsappCount: number
	withWhatsappPercentage: number
	withWebsiteCount: number
	withWebsitePercentage: number
	withoutWebsiteCount: number
	withoutWebsitePercentage: number
	possibleIndividualsCount: number
	possibleIndividualsPercentage: number
	completeDataCount: number
	completeDataPercentage: number
}

export type WebsiteFilterOption = 'all' | 'with' | 'without'

export interface LeadFilterCriteria {
	query: string
	whatsappOnly: boolean
	withPhoneOnly: boolean
	website: WebsiteFilterOption
	category: string | null
	status: LeadFunnelStatus | null
}

export const DEFAULT_LEAD_FILTER_CRITERIA: LeadFilterCriteria = {
	query: '',
	whatsappOnly: false,
	withPhoneOnly: false,
	website: 'all',
	category: null,
	status: null,
}
