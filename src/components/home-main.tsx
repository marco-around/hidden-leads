import {
	ArrowLeftIcon,
	PlusIcon,
	SpinnerIcon,
	TrashIcon,
	UploadSimpleIcon,
	WarningCircleIcon,
	XIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'

import { FileUpload } from '@/components/file-upload'
import { LeadDetailsDialog } from '@/components/lead-details-dialog'
import { LeadFilters } from '@/components/lead-filters'
import { LeadMetrics } from '@/components/lead-metrics'
import { LeadTable } from '@/components/lead-table'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { LeadsProvider, useLeadsContext } from '@/hooks/use-leads'

function HomeMainContent() {
	const {
		leads,
		filteredLeads,
		hasActiveFilters,
		isLoading,
		error,
		importFiles,
		clearLeads,
		clearError,
	} = useLeadsContext()

	const [files, setFiles] = useState<File[]>([])
	const [activeView, setActiveView] = useState<'upload' | 'leads'>('upload')

	function handleFilesChange(newFiles: File[]) {
		setFiles(newFiles)
		if (error !== null) {
			clearError()
		}
	}

	async function handleImport() {
		if (files.length === 0) {
			return
		}

		try {
			const shouldAppend = leads.length > 0 && activeView === 'upload'
			const importedLeads = await importFiles(files, { append: shouldAppend })

			setFiles([])
			setActiveView('leads')

			toast.add({
				type: 'success',
				title: 'Import completed',
				description: `${importedLeads.length} leads loaded successfully.`,
			})
		} catch (importError: unknown) {
			const errorMessage =
				importError instanceof Error
					? importError.message
					: 'An unexpected error occurred while importing files.'

			toast.add({
				type: 'error',
				title: 'Import failed',
				description: errorMessage,
			})
		}
	}

	function handleClearLeads() {
		clearLeads()
		setFiles([])
		setActiveView('upload')

		toast.add({
			type: 'info',
			title: 'List cleared',
			description: 'All loaded leads have been removed.',
		})
	}

	function handleNavigateToUpload() {
		setFiles([])
		clearError()
		setActiveView('upload')
	}

	function handleReturnToLeads() {
		setFiles([])
		clearError()
		setActiveView('leads')
	}

	function handleDismissError() {
		clearError()
	}

	const isLeadsView = leads.length > 0 && activeView === 'leads'

	if (isLeadsView) {
		return (
			<main className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'>
				{error !== null && (
					<div
						role='alert'
						className='border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border p-3'
					>
						<WarningCircleIcon
							className='mt-0.5 size-5 shrink-0'
							weight='fill'
						/>
						<div className='flex-1 text-xs'>
							<p className='font-semibold'>Import error</p>
							<p className='mt-0.5 opacity-90'>{error}</p>
						</div>
						<button
							type='button'
							onClick={handleDismissError}
							className='text-destructive hover:opacity-75'
							aria-label='Dismiss error'
						>
							<XIcon className='size-4' />
						</button>
					</div>
				)}

				<LeadMetrics />

				<LeadFilters />

				<div className='bg-card text-card-foreground flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 shadow-xs'>
					<div className='flex items-center gap-2'>
						<span className='text-sm font-semibold'>Leads Directory</span>
						<span className='bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
							{hasActiveFilters
								? `${filteredLeads.length} of ${leads.length} ${leads.length === 1 ? 'record' : 'records'}`
								: `${leads.length} ${leads.length === 1 ? 'record' : 'records'}`}
						</span>
					</div>

					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNavigateToUpload}
							type='button'
						>
							<PlusIcon className='size-3.5' weight='bold' />
							<span>Upload another file</span>
						</Button>

						<Button
							variant='destructive'
							size='sm'
							onClick={handleClearLeads}
							type='button'
						>
							<TrashIcon className='size-3.5' />
							<span>Clear list</span>
						</Button>
					</div>
				</div>

				<div className='min-h-0 flex-1'>
					<LeadTable />
				</div>

				<LeadDetailsDialog />
			</main>
		)
	}

	const hasExistingLeads = leads.length > 0

	return (
		<main className='flex flex-1 items-center justify-center p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					{hasExistingLeads ? (
						<>
							<CardTitle>Add more leads</CardTitle>
							<CardDescription className='mt-1'>
								Upload additional CSV files. Duplicate leads will be merged
								automatically.
							</CardDescription>
							<CardAction>
								<Button
									variant='outline'
									size='sm'
									onClick={handleReturnToLeads}
									type='button'
								>
									<ArrowLeftIcon className='size-3.5' />
									<span>Back to leads</span>
								</Button>
							</CardAction>
						</>
					) : (
						<div>
							<CardTitle>Your leads here!</CardTitle>
							<CardDescription className='mt-1'>
								Upload your lead files here to get started.
							</CardDescription>
						</div>
					)}
				</CardHeader>
				<CardContent className='flex flex-col gap-4'>
					{error !== null && (
						<div
							role='alert'
							className='border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border p-3'
						>
							<WarningCircleIcon
								className='mt-0.5 size-5 shrink-0'
								weight='fill'
							/>
							<div className='flex-1 text-xs'>
								<p className='font-semibold'>Import error</p>
								<p className='mt-0.5 opacity-90'>{error}</p>
							</div>
							<button
								type='button'
								onClick={handleDismissError}
								className='text-destructive hover:opacity-75'
								aria-label='Dismiss error'
							>
								<XIcon className='size-4' />
							</button>
						</div>
					)}

					<FileUpload
						value={files}
						onValueChange={handleFilesChange}
						accept='.csv'
						multiple
						disabled={isLoading}
					/>

					{files.length > 0 && (
						<div className='flex items-center gap-2'>
							<Button
								className='flex-1'
								disabled={isLoading}
								onClick={handleImport}
								type='button'
							>
								{isLoading ? (
									<>
										<SpinnerIcon className='size-3.5 animate-spin' />
										<span>Processing CSV...</span>
									</>
								) : (
									<>
										<UploadSimpleIcon className='size-3.5' />
										<span>
											{hasExistingLeads
												? `Add ${files.length} ${files.length === 1 ? 'file' : 'files'} to list`
												: `Import ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
										</span>
									</>
								)}
							</Button>

							{hasExistingLeads && (
								<Button
									variant='outline'
									size='sm'
									disabled={isLoading}
									onClick={handleReturnToLeads}
									type='button'
								>
									Cancel
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	)
}

export function HomeMain() {
	return (
		<LeadsProvider>
			<HomeMainContent />
		</LeadsProvider>
	)
}
