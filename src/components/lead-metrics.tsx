import {
	GlobeSimpleXIcon,
	PhoneIcon,
	UsersIcon,
	WhatsappLogoIcon,
} from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
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
}

export function LeadMetrics({
	metrics,
	className,
	...props
}: LeadMetricsProps) {
	const leadsContext = useContext(LeadsContext)
	const activeMetrics = metrics ?? leadsContext?.metrics ?? fallbackMetrics

	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
				className
			)}
			data-slot='lead-metrics'
			{...props}
		>
			<Card size='sm'>
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
						Imported records
					</CardDescription>
				</CardContent>
			</Card>

			<Card size='sm'>
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
						Direct mobile outreach
					</CardDescription>
				</CardContent>
			</Card>

			<Card size='sm'>
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
						Prospecting opportunity
					</CardDescription>
				</CardContent>
			</Card>

			<Card size='sm'>
				<CardHeader>
					<CardTitle className='text-muted-foreground text-xs font-medium'>
						With Phone
					</CardTitle>
					<CardAction>
						<PhoneIcon
							className='size-4 text-blue-600 dark:text-blue-400'
							weight='fill'
						/>
					</CardAction>
				</CardHeader>
				<CardContent className='flex flex-col gap-1'>
					<div className='flex items-baseline justify-between gap-2'>
						<span className='text-2xl font-bold tracking-tight'>
							{activeMetrics.withPhoneCount.toLocaleString()}
						</span>
						<span className='rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
							{activeMetrics.withPhonePercentage}%
						</span>
					</div>
					<CardDescription className='text-xs'>
						Validated phone numbers
					</CardDescription>
				</CardContent>
			</Card>
		</div>
	)
}
