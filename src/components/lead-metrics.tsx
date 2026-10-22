import {
	GlobeSimpleXIcon,
	UsersIcon,
	WhatsappLogoIcon,
} from '@phosphor-icons/react'
import type { ComponentProps, KeyboardEvent } from 'react'
import { useContext } from 'react'

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { LeadsContext } from '@/hooks/use-leads'
import { cn } from '@/lib/utils'
import type { ListQualityMetrics } from '@/types/lead'

export type LeadMetricsProps = {
	metrics?: ListQualityMetrics
} & ComponentProps<'div'>

const fallbackMetrics: ListQualityMetrics = {
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

export function LeadMetrics({
	metrics,
	className,
	...props
}: LeadMetricsProps) {
	const leadsContext = useContext(LeadsContext)
	const activeMetrics = metrics ?? leadsContext?.metrics ?? fallbackMetrics

	const isWhatsappActive = leadsContext?.filters.whatsappOnly ?? false
	const isWithoutWebsiteActive = leadsContext?.filters.website === 'without'
	const hasActiveFilters = leadsContext?.hasActiveFilters ?? false

	function handleToggleWhatsapp() {
		if (leadsContext) {
			leadsContext.updateFilter('whatsappOnly', !isWhatsappActive)
		}
	}

	function handleToggleWithoutWebsite() {
		if (leadsContext) {
			leadsContext.updateFilter(
				'website',
				isWithoutWebsiteActive ? 'all' : 'without'
			)
		}
	}

	function handleResetFilters() {
		if (leadsContext && hasActiveFilters) {
			leadsContext.resetFilters()
		}
	}

	function createKeyHandler(action: () => void) {
		return function (event: KeyboardEvent<HTMLDivElement>) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault()
				action()
			}
		}
	}

	return (
		<div
			className={cn('grid grid-cols-1 gap-3 md:grid-cols-3', className)}
			data-slot='lead-metrics'
			{...props}
		>
			<Card
				size='sm'
				className={cn(
					'transition-all',
					hasActiveFilters &&
						'hover:ring-primary/40 cursor-pointer hover:ring-2'
				)}
				role={hasActiveFilters ? 'button' : undefined}
				tabIndex={hasActiveFilters ? 0 : undefined}
				onClick={hasActiveFilters ? handleResetFilters : undefined}
				onKeyDown={
					hasActiveFilters ? createKeyHandler(handleResetFilters) : undefined
				}
				title={hasActiveFilters ? 'Click to reset all filters' : undefined}
			>
				<CardHeader>
					<CardTitle className='text-muted-foreground text-xs font-medium'>
						Total Leads
					</CardTitle>
					<CardAction>
						<UsersIcon className='text-muted-foreground size-4' />
					</CardAction>
				</CardHeader>
				<CardContent className='flex flex-col gap-1'>
					<div className='flex items-baseline justify-between gap-2'>
						<span className='text-2xl font-bold tracking-tight'>
							{activeMetrics.totalLeads.toLocaleString()}
						</span>
						<span className='bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs font-medium'>
							100%
						</span>
					</div>
					<CardDescription className='text-xs'>
						{hasActiveFilters ? 'Click to reset filters' : 'Imported records'}
					</CardDescription>
				</CardContent>
			</Card>

			<Card
				size='sm'
				role='button'
				tabIndex={0}
				aria-pressed={isWhatsappActive}
				onClick={handleToggleWhatsapp}
				onKeyDown={createKeyHandler(handleToggleWhatsapp)}
				title={
					isWhatsappActive
						? 'Active filter. Click to remove filter.'
						: 'Click to filter WhatsApp ready leads'
				}
				className={cn(
					'cursor-pointer transition-all hover:ring-2 hover:ring-emerald-500/40',
					isWhatsappActive &&
						'border-emerald-500/40 bg-emerald-500/5 ring-2 ring-emerald-500/50 dark:bg-emerald-500/10'
				)}
			>
				<CardHeader>
					<CardTitle className='text-muted-foreground text-xs font-medium'>
						WhatsApp Ready
					</CardTitle>
					<CardAction>
						<WhatsappLogoIcon
							className='size-4 text-emerald-600 dark:text-emerald-400'
							weight='fill'
						/>
					</CardAction>
				</CardHeader>
				<CardContent className='flex flex-col gap-1'>
					<div className='flex items-baseline justify-between gap-2'>
						<span className='text-2xl font-bold tracking-tight'>
							{activeMetrics.withWhatsappCount.toLocaleString()}
						</span>
						<span className='rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
							{activeMetrics.withWhatsappPercentage}%
						</span>
					</div>
					<CardDescription className='text-xs'>
						{isWhatsappActive
							? 'Filter active (click to clear)'
							: 'Direct mobile outreach'}
					</CardDescription>
				</CardContent>
			</Card>

			<Card
				size='sm'
				role='button'
				tabIndex={0}
				aria-pressed={isWithoutWebsiteActive}
				onClick={handleToggleWithoutWebsite}
				onKeyDown={createKeyHandler(handleToggleWithoutWebsite)}
				title={
					isWithoutWebsiteActive
						? 'Active filter. Click to remove filter.'
						: 'Click to filter leads without website'
				}
				className={cn(
					'cursor-pointer transition-all hover:ring-2 hover:ring-amber-500/40',
					isWithoutWebsiteActive &&
						'border-amber-500/40 bg-amber-500/5 ring-2 ring-amber-500/50 dark:bg-amber-500/10'
				)}
			>
				<CardHeader>
					<CardTitle className='text-muted-foreground text-xs font-medium'>
						Without Website
					</CardTitle>
					<CardAction>
						<GlobeSimpleXIcon
							className='size-4 text-amber-600 dark:text-amber-400'
							weight='bold'
						/>
					</CardAction>
				</CardHeader>
				<CardContent className='flex flex-col gap-1'>
					<div className='flex items-baseline justify-between gap-2'>
						<span className='text-2xl font-bold tracking-tight'>
							{activeMetrics.withoutWebsiteCount.toLocaleString()}
						</span>
						<span className='rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
							{activeMetrics.withoutWebsitePercentage}%
						</span>
					</div>
					<CardDescription className='text-xs'>
						{isWithoutWebsiteActive
							? 'Filter active (click to clear)'
							: 'Prospecting opportunity'}
					</CardDescription>
				</CardContent>
			</Card>
		</div>
	)
}
