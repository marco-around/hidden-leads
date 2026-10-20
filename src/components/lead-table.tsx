import {
	ArrowSquareOutIcon,
	CaretLeftIcon,
	CaretRightIcon,
	EyeIcon,
	GlobeIcon,
	PhoneIcon,
	UserIcon,
	WhatsappLogoIcon,
} from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import { useContext, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { LeadsContext } from '@/hooks/use-leads'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/lead'

export type LeadTableProps = {
	leads?: Lead[]
	onSelectLead?: (lead: Lead) => void
	selectedLeadId?: string | null
	pageSize?: number
} & ComponentProps<'div'>

function cleanWebsiteUrl(url: string): string {
	return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function formatLeadLocation(location: Lead['location']): string | null {
	const parts: string[] = []

	if (location.neighborhood) {
		parts.push(location.neighborhood)
	}

	if (location.city) {
		parts.push(location.city)
	}

	if (location.state) {
		parts.push(location.state)
	}

	if (parts.length === 0) {
		return null
	}

	return parts.join(', ')
}

export function LeadTable({
	leads,
	onSelectLead,
	selectedLeadId,
	pageSize = 20,
	className,
	...props
}: LeadTableProps) {
	const leadsContext = useContext(LeadsContext)
	const activeLeads = leads ?? leadsContext?.leads ?? []
	const activeSelectedLeadId =
		selectedLeadId !== undefined
			? selectedLeadId
			: (leadsContext?.selectedLead?.id ?? null)

	const [currentPage, setCurrentPage] = useState<number>(1)

	const totalPages =
		pageSize > 0 ? Math.max(1, Math.ceil(activeLeads.length / pageSize)) : 1
	const effectivePage = Math.min(currentPage, totalPages)
	const startIndex = pageSize > 0 ? (effectivePage - 1) * pageSize : 0
	const endIndex =
		pageSize > 0
			? Math.min(startIndex + pageSize, activeLeads.length)
			: activeLeads.length
	const paginatedLeads =
		pageSize > 0 ? activeLeads.slice(startIndex, endIndex) : activeLeads

	function handleSelectLead(lead: Lead) {
		if (onSelectLead) {
			onSelectLead(lead)
			return
		}

		if (leadsContext?.selectLead) {
			leadsContext.selectLead(lead)
		}
	}

	return (
		<div
			className={cn(
				'bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border shadow-xs',
				className
			)}
			data-slot='lead-table'
			{...props}
		>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='min-w-[220px]'>Company / Name</TableHead>
						<TableHead className='min-w-[150px]'>Category</TableHead>
						<TableHead className='min-w-[170px]'>Phone & WhatsApp</TableHead>
						<TableHead className='min-w-[180px]'>Website</TableHead>
						<TableHead className='w-[110px] text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedLeads.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={5}
								className='text-muted-foreground h-32 text-center'
							>
								No leads available to display.
							</TableCell>
						</TableRow>
					) : (
						paginatedLeads.map(function (lead) {
							const isSelected = activeSelectedLeadId === lead.id
							const formattedLocation = formatLeadLocation(lead.location)

							return (
								<TableRow
									key={lead.id}
									data-state={isSelected ? 'selected' : undefined}
									className='cursor-pointer'
									onClick={function () {
										handleSelectLead(lead)
									}}
								>
									<TableCell>
										<div className='flex flex-col gap-0.5'>
											<div className='flex items-center gap-2'>
												<span className='text-foreground font-semibold'>
													{lead.name}
												</span>
												{lead.metadata.isPossibleIndividual && (
													<span
														className='inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400'
														title='Possible individual registration (LGPD alert)'
													>
														<UserIcon
															className='size-3 shrink-0'
															weight='bold'
														/>
														Possible individual
													</span>
												)}
											</div>
											{formattedLocation && (
												<span className='text-muted-foreground text-xs'>
													{formattedLocation}
												</span>
											)}
										</div>
									</TableCell>

									<TableCell>
										{lead.metadata.category ? (
											<span
												className='bg-secondary text-secondary-foreground inline-flex max-w-[160px] truncate rounded-md px-2 py-0.5 text-xs font-medium'
												title={lead.metadata.category}
											>
												{lead.metadata.category}
											</span>
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</TableCell>

									<TableCell>
										{lead.contact.hasWhatsapp && lead.contact.whatsappUrl ? (
											<a
												href={lead.contact.whatsappUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400'
												title='Open conversation in WhatsApp'
												onClick={function (event) {
													event.stopPropagation()
												}}
											>
												<WhatsappLogoIcon
													className='size-3.5 shrink-0'
													weight='fill'
												/>
												<span>
													{lead.contact.formattedPhone ?? lead.contact.phone}
												</span>
											</a>
										) : lead.contact.formattedPhone || lead.contact.phone ? (
											<span className='text-muted-foreground inline-flex items-center gap-1.5'>
												<PhoneIcon
													className='size-3.5 shrink-0'
													weight='regular'
												/>
												<span>
													{lead.contact.formattedPhone ?? lead.contact.phone}
												</span>
											</span>
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</TableCell>

									<TableCell>
										{lead.contact.hasWebsite && lead.contact.website ? (
											<a
												href={lead.contact.website}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary inline-flex max-w-[180px] items-center gap-1 font-medium hover:underline'
												title={lead.contact.website}
												onClick={function (event) {
													event.stopPropagation()
												}}
											>
												<GlobeIcon
													className='size-3.5 shrink-0'
													weight='regular'
												/>
												<span className='truncate'>
													{cleanWebsiteUrl(lead.contact.website)}
												</span>
												<ArrowSquareOutIcon
													className='size-3 shrink-0 opacity-70'
													weight='bold'
												/>
											</a>
										) : (
											<span className='inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
												No website
											</span>
										)}
									</TableCell>

									<TableCell className='text-right'>
										<Button
											variant='secondary'
											size='sm'
											onClick={function (event) {
												event.stopPropagation()
												handleSelectLead(lead)
											}}
										>
											<EyeIcon className='size-3.5' weight='bold' />
											<span>Details</span>
										</Button>
									</TableCell>
								</TableRow>
							)
						})
					)}
				</TableBody>
			</Table>

			{activeLeads.length > 0 && (
				<div className='border-border/60 bg-muted/20 flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row'>
					<span className='text-muted-foreground text-xs'>
						Showing{' '}
						<span className='text-foreground font-medium'>
							{startIndex + 1}
						</span>{' '}
						to <span className='text-foreground font-medium'>{endIndex}</span>{' '}
						of{' '}
						<span className='text-foreground font-medium'>
							{activeLeads.length}
						</span>{' '}
						leads
					</span>

					{totalPages > 1 && (
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								disabled={effectivePage <= 1}
								onClick={function () {
									setCurrentPage(function (previousPage) {
										return Math.max(1, previousPage - 1)
									})
								}}
							>
								<CaretLeftIcon className='size-3.5' weight='bold' />
								<span>Previous</span>
							</Button>

							<span className='text-muted-foreground text-xs'>
								Page {effectivePage} of {totalPages}
							</span>

							<Button
								variant='outline'
								size='sm'
								disabled={effectivePage >= totalPages}
								onClick={function () {
									setCurrentPage(function (previousPage) {
										return Math.min(totalPages, previousPage + 1)
									})
								}}
							>
								<span>Next</span>
								<CaretRightIcon className='size-3.5' weight='bold' />
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
