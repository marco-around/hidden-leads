import {
	ArrowSquareOutIcon,
	CalendarBlankIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckIcon,
	CopyIcon,
	DatabaseIcon,
	GlobeIcon,
	IdentificationCardIcon,
	MapPinIcon,
	PhoneIcon,
	TagIcon,
	UserIcon,
	WarningCircleIcon,
	WhatsappLogoIcon,
} from '@phosphor-icons/react'
import { useContext, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import type { Lead, LeadFunnelStatus } from '@/types/lead'

export interface LeadDetailsDialogProps {
	lead?: Lead | null
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

interface StatusBadgeStyle {
	label: string
	className: string
}

function getStatusBadgeStyle(status: LeadFunnelStatus): StatusBadgeStyle {
	switch (status) {
		case 'new':
			return {
				label: 'New Lead',
				className:
					'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
			}
		case 'contacted':
			return {
				label: 'Contacted',
				className:
					'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
			}
		case 'replied':
			return {
				label: 'Replied',
				className:
					'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
			}
		case 'proposal':
			return {
				label: 'Proposal',
				className:
					'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
			}
		case 'closed':
			return {
				label: 'Closed',
				className:
					'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
			}
		case 'discarded':
			return {
				label: 'Discarded',
				className:
					'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
			}
		default:
			return {
				label: status,
				className: 'bg-muted text-muted-foreground border-border',
			}
	}
}

function cleanWebsiteDisplay(url: string): string {
	return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function formatImportDate(isoString: string): string {
	try {
		const date = new Date(isoString)
		if (Number.isNaN(date.getTime())) {
			return 'Unknown date'
		}
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(date)
	} catch (error) {
		console.error('Error formatting import date:', error)
		return 'Unknown date'
	}
}

export function LeadDetailsDialog({
	lead,
	open,
	onOpenChange,
}: LeadDetailsDialogProps) {
	const leadsContext = useContext(LeadsContext)
	const activeLead =
		lead !== undefined ? lead : (leadsContext?.selectedLead ?? null)

	const [isRawDataExpanded, setIsRawDataExpanded] = useState<boolean>(true)
	const [hasCopiedRawData, setHasCopiedRawData] = useState<boolean>(false)

	const isControlled = open !== undefined
	const isOpen = isControlled ? open : Boolean(activeLead)

	function handleOpenChange(nextOpen: boolean) {
		if (onOpenChange) {
			onOpenChange(nextOpen)
		}

		if (!isControlled && !nextOpen && leadsContext?.selectLead) {
			leadsContext.selectLead(null)
		}
	}

	async function handleCopyRawData() {
		if (!activeLead) {
			return
		}

		try {
			const formattedJson = JSON.stringify(activeLead.metadata.rawData, null, 2)
			await navigator.clipboard.writeText(formattedJson)
			setHasCopiedRawData(true)
			setTimeout(function () {
				setHasCopiedRawData(false)
			}, 2000)
		} catch (error) {
			console.error('Failed to copy raw data to clipboard:', error)
		}
	}

	if (!activeLead) {
		return null
	}

	const statusStyle = getStatusBadgeStyle(activeLead.status)
	const rawDataEntries = Object.entries(activeLead.metadata.rawData)
	const formattedDate = formatImportDate(activeLead.importedAt)

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
				<DialogHeader className='border-border/60 bg-muted/20 border-b p-5 pb-4'>
					<div className='flex flex-wrap items-center gap-2 pr-6'>
						<DialogTitle className='text-foreground text-base font-semibold'>
							{activeLead.name}
						</DialogTitle>
						<span
							className={cn(
								'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
								statusStyle.className
							)}
						>
							{statusStyle.label}
						</span>
						{activeLead.metadata.isPossibleIndividual && (
							<span
								className='inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'
								title='Possible individual registration (LGPD attention)'
							>
								<UserIcon className='size-3' weight='bold' />
								Individual (LGPD)
							</span>
						)}
					</div>

					<DialogDescription className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
						<span className='inline-flex items-center gap-1.5'>
							<TagIcon className='size-3.5 opacity-70' weight='bold' />
							<span>{activeLead.metadata.category ?? 'Uncategorized'}</span>
						</span>

						<span className='text-muted-foreground inline-flex items-center gap-1.5'>
							<CalendarBlankIcon
								className='size-3.5 opacity-70'
								weight='regular'
							/>
							<span>Imported on {formattedDate}</span>
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className='border-border/60 bg-background/50 flex flex-wrap items-center gap-2 border-b px-5 py-3'>
					{activeLead.contact.hasWhatsapp && activeLead.contact.whatsappUrl ? (
						<Button
							className='bg-emerald-600 font-medium text-white hover:bg-emerald-700'
							size='sm'
							nativeButton={false}
							render={
								<a
									href={activeLead.contact.whatsappUrl}
									target='_blank'
									rel='noopener noreferrer'
								/>
							}
						>
							<WhatsappLogoIcon className='size-3.5' weight='fill' />
							<span>Chat on WhatsApp</span>
						</Button>
					) : (
						<Button variant='outline' size='sm' disabled className='opacity-50'>
							<WhatsappLogoIcon className='size-3.5' weight='regular' />
							<span>No WhatsApp</span>
						</Button>
					)}

					{activeLead.contact.phone ? (
						<Button
							variant='secondary'
							size='sm'
							nativeButton={false}
							render={<a href={`tel:${activeLead.contact.phone}`} />}
						>
							<PhoneIcon className='size-3.5' weight='bold' />
							<span>
								Call{' '}
								{activeLead.contact.formattedPhone ?? activeLead.contact.phone}
							</span>
						</Button>
					) : (
						<Button variant='outline' size='sm' disabled className='opacity-50'>
							<PhoneIcon className='size-3.5' weight='regular' />
							<span>No Phone</span>
						</Button>
					)}

					{activeLead.contact.website ? (
						<Button
							variant='outline'
							size='sm'
							nativeButton={false}
							render={
								<a
									href={activeLead.contact.website}
									target='_blank'
									rel='noopener noreferrer'
								/>
							}
						>
							<GlobeIcon className='size-3.5' weight='regular' />
							<span>Visit Website</span>
							<ArrowSquareOutIcon className='size-3 opacity-70' weight='bold' />
						</Button>
					) : (
						<Button variant='outline' size='sm' disabled className='opacity-50'>
							<GlobeIcon className='size-3.5' weight='regular' />
							<span>No Website</span>
						</Button>
					)}
				</div>

				<div className='flex-1 space-y-4 overflow-y-auto p-5 text-xs/relaxed'>
					{activeLead.metadata.isPossibleIndividual && (
						<div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300'>
							<div className='flex items-start gap-2.5'>
								<WarningCircleIcon
									className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400'
									weight='bold'
								/>
								<div className='space-y-0.5'>
									<p className='text-xs font-semibold'>
										LGPD Compliance Notice
									</p>
									<p className='text-xs opacity-90'>
										This lead appears to be an individual rather than an
										enterprise. Verify compliance with Brazilian General Data
										Protection Law (LGPD) requirements before initiating
										commercial contact.
									</p>
								</div>
							</div>
						</div>
					)}

					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
						<div className='bg-card text-card-foreground space-y-2.5 rounded-lg border p-3.5'>
							<div className='text-foreground flex items-center gap-1.5 font-medium'>
								<PhoneIcon className='text-primary size-3.5' weight='bold' />
								<span>Contact Details</span>
							</div>

							<div className='text-muted-foreground space-y-1.5'>
								<div className='flex items-center justify-between'>
									<span>Phone Number</span>
									<span className='text-foreground font-mono font-medium'>
										{activeLead.contact.formattedPhone ??
											activeLead.contact.phone ??
											'—'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>Phone Type</span>
									<span className='text-foreground font-medium'>
										{activeLead.contact.phone
											? activeLead.contact.isMobile
												? 'Mobile'
												: 'Landline'
											: '—'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>WhatsApp Status</span>
									<span className='text-foreground font-medium'>
										{activeLead.contact.hasWhatsapp
											? 'Available'
											: 'Not detected'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>Website</span>
									{activeLead.contact.website ? (
										<a
											href={activeLead.contact.website}
											target='_blank'
											rel='noopener noreferrer'
											className='text-primary inline-flex max-w-[170px] items-center gap-1 truncate font-medium hover:underline'
										>
											<span>
												{cleanWebsiteDisplay(activeLead.contact.website)}
											</span>
											<ArrowSquareOutIcon
												className='size-2.5 shrink-0 opacity-70'
												weight='bold'
											/>
										</a>
									) : (
										<span className='font-medium text-amber-600 dark:text-amber-400'>
											No website
										</span>
									)}
								</div>
							</div>
						</div>

						<div className='bg-card text-card-foreground space-y-2.5 rounded-lg border p-3.5'>
							<div className='text-foreground flex items-center gap-1.5 font-medium'>
								<MapPinIcon className='text-primary size-3.5' weight='bold' />
								<span>Location</span>
							</div>

							<div className='text-muted-foreground space-y-1.5'>
								<div className='flex items-start justify-between gap-2'>
									<span className='shrink-0'>Address</span>
									<span className='text-foreground text-right font-medium'>
										{activeLead.location.address ?? '—'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>Neighborhood</span>
									<span className='text-foreground font-medium'>
										{activeLead.location.neighborhood ?? '—'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>City / State</span>
									<span className='text-foreground font-medium'>
										{activeLead.location.city || activeLead.location.state
											? [activeLead.location.city, activeLead.location.state]
													.filter(Boolean)
													.join(' - ')
											: '—'}
									</span>
								</div>

								<div className='flex items-center justify-between'>
									<span>Postal Code (CEP)</span>
									<span className='text-foreground font-mono font-medium'>
										{activeLead.location.postalCode ?? '—'}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='bg-card text-card-foreground space-y-2.5 rounded-lg border p-3.5'>
						<div className='text-foreground flex items-center gap-1.5 font-medium'>
							<IdentificationCardIcon
								className='text-primary size-3.5'
								weight='bold'
							/>
							<span>Identification & Compliance</span>
						</div>

						<div className='text-muted-foreground grid grid-cols-1 gap-2 sm:grid-cols-3'>
							<div>
								<span className='block text-[11px]'>Document / Tax ID</span>
								<span className='text-foreground font-mono font-medium'>
									{activeLead.metadata.document ?? 'Not informed'}
								</span>
							</div>

							<div>
								<span className='block text-[11px]'>Registration Type</span>
								<span className='text-foreground font-medium'>
									{activeLead.metadata.isPossibleIndividual
										? 'Possible Individual (PF)'
										: 'Company / Entity (PJ)'}
								</span>
							</div>

							<div>
								<span className='block text-[11px]'>Lead ID</span>
								<span className='text-foreground block truncate font-mono text-[11px]'>
									{activeLead.id}
								</span>
							</div>
						</div>
					</div>

					<div className='bg-card text-card-foreground overflow-hidden rounded-lg border'>
						<div className='border-border/60 bg-muted/30 flex items-center justify-between border-b px-3.5 py-2.5'>
							<div className='flex items-center gap-2'>
								<DatabaseIcon
									className='text-muted-foreground size-3.5'
									weight='bold'
								/>
								<span className='text-foreground text-xs font-medium'>
									Original CSV Data
								</span>
								<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]'>
									{rawDataEntries.length} columns
								</span>
							</div>

							<div className='flex items-center gap-1.5'>
								{rawDataEntries.length > 0 && (
									<Button
										variant='outline'
										size='xs'
										onClick={handleCopyRawData}
									>
										{hasCopiedRawData ? (
											<>
												<CheckIcon
													className='size-3 text-emerald-600 dark:text-emerald-400'
													weight='bold'
												/>
												<span>Copied</span>
											</>
										) : (
											<>
												<CopyIcon className='size-3' weight='regular' />
												<span>Copy JSON</span>
											</>
										)}
									</Button>
								)}

								<Button
									variant='ghost'
									size='xs'
									onClick={function () {
										setIsRawDataExpanded(!isRawDataExpanded)
									}}
								>
									{isRawDataExpanded ? (
										<>
											<CaretUpIcon className='size-3' weight='bold' />
											<span>Collapse</span>
										</>
									) : (
										<>
											<CaretDownIcon className='size-3' weight='bold' />
											<span>Expand</span>
										</>
									)}
								</Button>
							</div>
						</div>

						{isRawDataExpanded && (
							<div className='max-h-56 overflow-y-auto'>
								{rawDataEntries.length === 0 ? (
									<div className='text-muted-foreground p-4 text-center text-xs'>
										No original raw data preserved for this lead.
									</div>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='w-1/3 text-xs'>
													CSV Column
												</TableHead>
												<TableHead className='w-2/3 text-xs'>
													Parsed Value
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{rawDataEntries.map(function ([columnKey, columnValue]) {
												return (
													<TableRow key={columnKey}>
														<TableCell className='text-muted-foreground align-top font-mono text-[11px]'>
															{columnKey}
														</TableCell>
														<TableCell className='text-foreground font-mono text-[11px] font-medium break-all whitespace-normal'>
															{columnValue !== '' ? columnValue : '—'}
														</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								)}
							</div>
						)}
					</div>
				</div>

				<DialogFooter className='border-border/60 bg-muted/20 border-t p-3 sm:justify-end'>
					<DialogClose render={<Button variant='outline' size='sm' />}>
						Close
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
