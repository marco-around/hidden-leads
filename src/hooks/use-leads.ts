import type { UpdateSpec } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import type { ReactNode } from 'react'
import {
	createContext,
	createElement,
	useContext,
	useMemo,
	useState,
} from 'react'

import { db } from '@/db'
import type { Lead, LeadFilterCriteria, ListQualityMetrics } from '@/types/lead'
import { DEFAULT_LEAD_FILTER_CRITERIA } from '@/types/lead'
import { parseCsvFileToLeads } from '@/utils/csv-parser'
import { countActiveFilters, filterLeads } from '@/utils/lead-filter'
import { calculateListQualityMetrics } from '@/utils/metrics-calculator'

export type { UpdateSpec }

export interface ImportFilesOptions {
	append?: boolean
}

export interface UseLeadsOptions {
	initialLeads?: Lead[]
	onImportSuccess?: (leads: Lead[]) => void
	onImportError?: (error: Error) => void
}

export interface UseLeadsReturn {
	leads: Lead[]
	filteredLeads: Lead[]
	metrics: ListQualityMetrics
	selectedLead: Lead | null
	isLoading: boolean
	isInitialLoading: boolean
	error: string | null
	filters: LeadFilterCriteria
	activeFiltersCount: number
	hasActiveFilters: boolean
	availableCategories: string[]
	setFilters: (
		criteriaOrUpdater:
			| LeadFilterCriteria
			| ((previousCriteria: LeadFilterCriteria) => LeadFilterCriteria)
	) => void
	updateFilter: <Key extends keyof LeadFilterCriteria>(
		key: Key,
		value: LeadFilterCriteria[Key]
	) => void
	resetFilters: () => void
	importFiles: (
		files: readonly File[] | FileList,
		options?: ImportFilesOptions
	) => Promise<Lead[]>
	clearLeads: () => Promise<void>
	updateLead: (id: string, changes: UpdateSpec<Lead>) => Promise<number>
	deleteLead: (id: string) => Promise<void>
	selectLead: (leadOrId: Lead | string | null) => void
	clearError: () => void
	setLeads: (leads: Lead[]) => Promise<void>
	setSelectedLead: (lead: Lead | null) => void
}

export interface LeadsProviderProps {
	children: ReactNode
	value?: UseLeadsReturn
	initialLeads?: Lead[]
	onImportSuccess?: (leads: Lead[]) => void
	onImportError?: (error: Error) => void
}

function getLeadDeduplicationKeys(lead: Lead): string[] {
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

function mergeLeads(
	baseLeads: readonly Lead[],
	incomingLeads: readonly Lead[]
): Lead[] {
	const seenKeys = new Set<string>()
	const merged: Lead[] = []

	for (const lead of baseLeads) {
		const keys = getLeadDeduplicationKeys(lead)
		for (const key of keys) {
			seenKeys.add(key)
		}
		merged.push(lead)
	}

	for (const lead of incomingLeads) {
		const keys = getLeadDeduplicationKeys(lead)
		const isDuplicate = keys.some(function (key) {
			return seenKeys.has(key)
		})

		if (isDuplicate) {
			continue
		}

		for (const key of keys) {
			seenKeys.add(key)
		}

		merged.push(lead)
	}

	return merged
}

function isCsvFile(file: File): boolean {
	const lowerCaseName = file.name.toLowerCase()
	return (
		lowerCaseName.endsWith('.csv') ||
		file.type === 'text/csv' ||
		file.type === 'text/comma-separated-values' ||
		file.type === 'application/csv' ||
		file.type === 'application/vnd.ms-excel' ||
		file.type === 'text/plain'
	)
}

export function useLeads(options?: UseLeadsOptions): UseLeadsReturn {
	const liveLeads = useLiveQuery(function () {
		return db.leads.toArray()
	}, [])

	const isInitialLoading = liveLeads === undefined
	const leads = useMemo(
		function () {
			return liveLeads ?? options?.initialLeads ?? []
		},
		[liveLeads, options?.initialLeads]
	)

	const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [filters, setFiltersState] = useState<LeadFilterCriteria>(
		DEFAULT_LEAD_FILTER_CRITERIA
	)

	const selectedLead = useMemo(
		function () {
			if (selectedLeadId === null) {
				return null
			}

			const matchingLead = leads.find(function (lead) {
				return lead.id === selectedLeadId
			})

			return matchingLead ?? null
		},
		[leads, selectedLeadId]
	)

	const metrics = useMemo(
		function () {
			return calculateListQualityMetrics(leads)
		},
		[leads]
	)

	const filteredLeads = useMemo(
		function () {
			return filterLeads(leads, filters)
		},
		[leads, filters]
	)

	const activeFiltersCount = useMemo(
		function () {
			return countActiveFilters(filters)
		},
		[filters]
	)

	const hasActiveFilters = activeFiltersCount > 0

	const availableCategories = useMemo(
		function () {
			const categorySet = new Set<string>()
			for (const lead of leads) {
				if (
					lead.metadata.category &&
					lead.metadata.category.trim().length > 0
				) {
					categorySet.add(lead.metadata.category.trim())
				}
			}
			return Array.from(categorySet).sort(
				function (firstCategory, secondCategory) {
					return firstCategory.localeCompare(secondCategory)
				}
			)
		},
		[leads]
	)

	function setFilters(
		criteriaOrUpdater:
			| LeadFilterCriteria
			| ((previousCriteria: LeadFilterCriteria) => LeadFilterCriteria)
	) {
		setFiltersState(criteriaOrUpdater)
	}

	function updateFilter<Key extends keyof LeadFilterCriteria>(
		key: Key,
		value: LeadFilterCriteria[Key]
	) {
		setFiltersState(function (previousCriteria) {
			return {
				...previousCriteria,
				[key]: value,
			}
		})
	}

	function resetFilters() {
		setFiltersState(DEFAULT_LEAD_FILTER_CRITERIA)
	}

	function selectLead(leadOrId: Lead | string | null) {
		if (leadOrId === null) {
			setSelectedLeadId(null)
			return
		}

		if (typeof leadOrId === 'string') {
			setSelectedLeadId(leadOrId)
			return
		}

		setSelectedLeadId(leadOrId.id)
	}

	function setSelectedLead(lead: Lead | null) {
		setSelectedLeadId(lead !== null ? lead.id : null)
	}

	function clearError() {
		setError(null)
	}

	async function clearLeads(): Promise<void> {
		setError(null)

		try {
			await db.leads.clear()
			setSelectedLeadId(null)
			resetFilters()
		} catch (clearError: unknown) {
			const message =
				clearError instanceof Error
					? clearError.message
					: 'An unexpected error occurred while clearing leads.'

			setError(message)

			const normalizedError =
				clearError instanceof Error
					? clearError
					: new Error(message, { cause: clearError })

			throw normalizedError
		}
	}

	async function updateLead(
		id: string,
		changes: UpdateSpec<Lead>
	): Promise<number> {
		try {
			const updatedCount = await db.leads.update(id, changes)
			return updatedCount
		} catch (updateError: unknown) {
			const message =
				updateError instanceof Error
					? updateError.message
					: `An unexpected error occurred while updating lead with ID "${id}".`

			setError(message)

			const normalizedError =
				updateError instanceof Error
					? updateError
					: new Error(message, { cause: updateError })

			throw normalizedError
		}
	}

	async function deleteLead(id: string): Promise<void> {
		try {
			await db.leads.delete(id)
			if (selectedLeadId === id) {
				setSelectedLeadId(null)
			}
		} catch (deleteError: unknown) {
			const message =
				deleteError instanceof Error
					? deleteError.message
					: `An unexpected error occurred while deleting lead with ID "${id}".`

			setError(message)

			const normalizedError =
				deleteError instanceof Error
					? deleteError
					: new Error(message, { cause: deleteError })

			throw normalizedError
		}
	}

	async function setLeads(nextLeads: Lead[]): Promise<void> {
		setError(null)

		try {
			await db.leads.clear()
			if (nextLeads.length > 0) {
				await db.leads.bulkAdd(nextLeads)
			}
		} catch (setLeadsError: unknown) {
			const message =
				setLeadsError instanceof Error
					? setLeadsError.message
					: 'An unexpected error occurred while setting leads.'

			setError(message)

			const normalizedError =
				setLeadsError instanceof Error
					? setLeadsError
					: new Error(message, { cause: setLeadsError })

			throw normalizedError
		}
	}

	async function importFiles(
		files: readonly File[] | FileList,
		importOptions?: ImportFilesOptions
	): Promise<Lead[]> {
		const filesArray = Array.from(files)

		if (filesArray.length === 0) {
			return []
		}

		setIsLoading(true)
		setError(null)

		try {
			const parsedBatches: Lead[][] = []

			for (const file of filesArray) {
				if (!isCsvFile(file)) {
					throw new Error(
						`Unsupported file type for "${file.name}". Only CSV files are currently supported.`
					)
				}

				const fileLeads = await parseCsvFileToLeads(file)
				parsedBatches.push(fileLeads)
			}

			let allIncomingLeads: Lead[] = []
			for (const batch of parsedBatches) {
				allIncomingLeads = mergeLeads(allIncomingLeads, batch)
			}

			const shouldAppend = importOptions?.append ?? false
			if (shouldAppend) {
				const existingLeads = await db.leads.toArray()
				const seenKeys = new Set<string>()
				for (const lead of existingLeads) {
					const keys = getLeadDeduplicationKeys(lead)
					for (const key of keys) {
						seenKeys.add(key)
					}
				}

				const newLeadsToPersist: Lead[] = []
				for (const incomingLead of allIncomingLeads) {
					const keys = getLeadDeduplicationKeys(incomingLead)
					const isDuplicate = keys.some(function (key) {
						return seenKeys.has(key)
					})

					if (isDuplicate) {
						continue
					}

					for (const key of keys) {
						seenKeys.add(key)
					}

					newLeadsToPersist.push(incomingLead)
				}

				if (newLeadsToPersist.length > 0) {
					await db.leads.bulkAdd(newLeadsToPersist)
				}

				const finalLeads = [...existingLeads, ...newLeadsToPersist]
				options?.onImportSuccess?.(finalLeads)

				return finalLeads
			}

			await db.leads.clear()
			setSelectedLeadId(null)

			if (allIncomingLeads.length > 0) {
				await db.leads.bulkAdd(allIncomingLeads)
			}

			options?.onImportSuccess?.(allIncomingLeads)

			return allIncomingLeads
		} catch (importError: unknown) {
			const message =
				importError instanceof Error
					? importError.message
					: 'An unexpected error occurred while importing files.'

			setError(message)

			const normalizedError =
				importError instanceof Error
					? importError
					: new Error(message, { cause: importError })

			options?.onImportError?.(normalizedError)

			throw normalizedError
		} finally {
			setIsLoading(false)
		}
	}

	return {
		leads,
		filteredLeads,
		metrics,
		selectedLead,
		isLoading,
		isInitialLoading,
		error,
		filters,
		activeFiltersCount,
		hasActiveFilters,
		availableCategories,
		setFilters,
		updateFilter,
		resetFilters,
		importFiles,
		clearLeads,
		updateLead,
		deleteLead,
		selectLead,
		clearError,
		setLeads,
		setSelectedLead,
	}
}

export const LeadsContext = createContext<UseLeadsReturn | null>(null)

export function LeadsProvider(props: LeadsProviderProps) {
	const leadsState = useLeads({
		initialLeads: props.initialLeads,
		onImportSuccess: props.onImportSuccess,
		onImportError: props.onImportError,
	})

	const value = props.value ?? leadsState

	return createElement(LeadsContext.Provider, { value }, props.children)
}

export function useLeadsContext(): UseLeadsReturn {
	const context = useContext(LeadsContext)

	if (context === null) {
		throw new Error('useLeadsContext must be used within a LeadsProvider')
	}

	return context
}
