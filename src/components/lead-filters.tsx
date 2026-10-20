import {
	ArrowCounterClockwiseIcon,
	CaretDownIcon,
	CheckIcon,
	FunnelSimpleIcon,
	GlobeSimpleIcon,
	GlobeSimpleXIcon,
	MagnifyingGlassIcon,
	PhoneIcon,
	TagIcon,
	WhatsappLogoIcon,
	XIcon,
} from '@phosphor-icons/react'
import type { ChangeEvent, ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group'
import { Toggle } from '@/components/ui/toggle'
import { useLeadsContext } from '@/hooks/use-leads'
import { cn } from '@/lib/utils'
import type { LeadFunnelStatus } from '@/types/lead'

export type LeadFiltersProps = ComponentProps<'div'>

interface StatusOption {
	value: LeadFunnelStatus
	label: string
}

const FUNNEL_STATUS_OPTIONS: readonly StatusOption[] = [
	{ value: 'new', label: 'New' },
	{ value: 'contacted', label: 'Contacted' },
	{ value: 'replied', label: 'Replied' },
	{ value: 'proposal', label: 'Proposal' },
	{ value: 'closed', label: 'Closed' },
	{ value: 'discarded', label: 'Discarded' },
]

function formatFunnelStatus(status: LeadFunnelStatus): string {
	const foundOption = FUNNEL_STATUS_OPTIONS.find(function (option) {
		return option.value === status
	})

	return foundOption ? foundOption.label : status
}

export function LeadFilters({ className, ...props }: LeadFiltersProps) {
	const {
		filters,
		updateFilter,
		resetFilters,
		activeFiltersCount,
		hasActiveFilters,
		availableCategories,
	} = useLeadsContext()

	function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
		updateFilter('query', event.target.value)
	}

	function handleClearQuery() {
		updateFilter('query', '')
	}

	function handleToggleWhatsapp(pressed: boolean) {
		updateFilter('whatsappOnly', pressed)
	}

	function handleToggleWithPhone(pressed: boolean) {
		updateFilter('withPhoneOnly', pressed)
	}

	function handleToggleNoWebsite(pressed: boolean) {
		updateFilter('website', pressed ? 'without' : 'all')
	}

	function handleToggleWithWebsite(pressed: boolean) {
		updateFilter('website', pressed ? 'with' : 'all')
	}

	function handleSelectCategory(category: string | null) {
		updateFilter('category', category)
	}

	function handleSelectStatus(status: LeadFunnelStatus | null) {
		updateFilter('status', status)
	}

	return (
		<div
			className={cn(
				'bg-card text-card-foreground flex flex-col gap-2.5 rounded-lg border p-3 shadow-xs',
				className
			)}
			data-slot='lead-filters'
			{...props}
		>
			<div className='flex flex-wrap items-center gap-2'>
				<InputGroup className='h-8 min-w-55 flex-1 sm:max-w-xs'>
					<InputGroupAddon align='inline-start'>
						<MagnifyingGlassIcon className='text-muted-foreground size-4' />
					</InputGroupAddon>
					<InputGroupInput
						value={filters.query}
						onChange={handleQueryChange}
						placeholder='Search name, phone, city...'
						aria-label='Search leads'
					/>
					{filters.query.length > 0 && (
						<InputGroupAddon align='inline-end'>
							<InputGroupButton
								size='icon-xs'
								variant='ghost'
								onClick={handleClearQuery}
								aria-label='Clear search'
							>
								<XIcon className='size-3' />
							</InputGroupButton>
						</InputGroupAddon>
					)}
				</InputGroup>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant={filters.category ? 'secondary' : 'outline'}
								size='sm'
								className='h-8 text-xs font-medium'
							>
								<TagIcon className='size-3.5' />
								<span className='max-w-36 truncate'>
									{filters.category ? filters.category : 'Category'}
								</span>
								<CaretDownIcon className='size-3 opacity-60' />
							</Button>
						}
					/>
					<DropdownMenuContent
						align='start'
						className='max-h-64 overflow-y-auto'
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel>Filter by category</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={function () {
									handleSelectCategory(null)
								}}
							>
								<span className='flex-1'>All categories</span>
								{filters.category === null && (
									<CheckIcon className='size-3.5' />
								)}
							</DropdownMenuItem>
							{availableCategories.length > 0 && <DropdownMenuSeparator />}
							{availableCategories.map(function (category) {
								const isSelected = filters.category === category
								return (
									<DropdownMenuItem
										key={category}
										onClick={function () {
											handleSelectCategory(category)
										}}
									>
										<span className='flex-1'>{category}</span>
										{isSelected && <CheckIcon className='size-3.5' />}
									</DropdownMenuItem>
								)
							})}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant={filters.status ? 'secondary' : 'outline'}
								size='sm'
								className='h-8 text-xs font-medium'
							>
								<FunnelSimpleIcon className='size-3.5' />
								<span>
									{filters.status
										? formatFunnelStatus(filters.status)
										: 'Status'}
								</span>
								<CaretDownIcon className='size-3 opacity-60' />
							</Button>
						}
					/>
					<DropdownMenuContent align='start'>
						<DropdownMenuGroup>
							<DropdownMenuLabel>Filter by status</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={function () {
									handleSelectStatus(null)
								}}
							>
								<span className='flex-1'>All statuses</span>
								{filters.status === null && <CheckIcon className='size-3.5' />}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{FUNNEL_STATUSES_OPTIONS_ITEM_LIST(
								filters.status,
								handleSelectStatus
							)}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				{hasActiveFilters && (
					<Button
						variant='ghost'
						size='sm'
						className='text-muted-foreground hover:text-foreground ml-auto h-8 text-xs'
						onClick={resetFilters}
						type='button'
					>
						<ArrowCounterClockwiseIcon className='size-3.5' />
						<span>Reset filters</span>
						<span className='bg-primary/10 text-primary py-0.2 rounded-full px-1.5 text-[10px] font-semibold'>
							{activeFiltersCount}
						</span>
					</Button>
				)}
			</div>

			<div className='border-border/40 flex flex-wrap items-center gap-1.5 border-t pt-2'>
				<span className='text-muted-foreground mr-1 text-xs font-medium'>
					Quick filters:
				</span>

				<Toggle
					size='sm'
					variant='outline'
					pressed={filters.whatsappOnly}
					onPressedChange={handleToggleWhatsapp}
					aria-label='Filter WhatsApp ready'
					className='aria-pressed:border-emerald-500/40 aria-pressed:bg-emerald-500/10 aria-pressed:text-emerald-600 dark:aria-pressed:text-emerald-400'
				>
					<WhatsappLogoIcon
						className='size-3.5'
						weight={filters.whatsappOnly ? 'fill' : 'regular'}
					/>
					<span>WhatsApp Ready</span>
				</Toggle>

				<Toggle
					size='sm'
					variant='outline'
					pressed={filters.withPhoneOnly}
					onPressedChange={handleToggleWithPhone}
					aria-label='Filter with phone'
					className='aria-pressed:border-blue-500/40 aria-pressed:bg-blue-500/10 aria-pressed:text-blue-600 dark:aria-pressed:text-blue-400'
				>
					<PhoneIcon
						className='size-3.5'
						weight={filters.withPhoneOnly ? 'fill' : 'regular'}
					/>
					<span>With Phone</span>
				</Toggle>

				<Toggle
					size='sm'
					variant='outline'
					pressed={filters.website === 'without'}
					onPressedChange={handleToggleNoWebsite}
					aria-label='Filter without website'
					className='aria-pressed:border-amber-500/40 aria-pressed:bg-amber-500/10 aria-pressed:text-amber-600 dark:aria-pressed:text-amber-400'
				>
					<GlobeSimpleXIcon className='size-3.5' weight='bold' />
					<span>No Website</span>
				</Toggle>

				<Toggle
					size='sm'
					variant='outline'
					pressed={filters.website === 'with'}
					onPressedChange={handleToggleWithWebsite}
					aria-label='Filter with website'
					className='aria-pressed:border-sky-500/40 aria-pressed:bg-sky-500/10 aria-pressed:text-sky-600 dark:aria-pressed:text-sky-400'
				>
					<GlobeSimpleIcon className='size-3.5' weight='bold' />
					<span>With Website</span>
				</Toggle>
			</div>
		</div>
	)
}

function FUNNEL_STATUSES_OPTIONS_ITEM_LIST(
	currentStatus: LeadFunnelStatus | null,
	onSelect: (status: LeadFunnelStatus) => void
) {
	return FUNNEL_STATUS_OPTIONS.map(function (option) {
		const isSelected = currentStatus === option.value
		return (
			<DropdownMenuItem
				key={option.value}
				onClick={function () {
					onSelect(option.value)
				}}
			>
				<span className='flex-1'>{option.label}</span>
				{isSelected && <CheckIcon className='size-3.5' />}
			</DropdownMenuItem>
		)
	})
}
