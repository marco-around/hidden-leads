import { FileTextIcon, UploadIcon, XIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/format-file-size'

type FileUploadProps = {
	value?: File[]
	defaultValue?: File[]
	onValueChange?: (files: File[]) => void
	accept?: string
	multiple?: boolean
	disabled?: boolean
	name?: string
} & ComponentProps<'div'>

export function FileUpload({
	value,
	defaultValue,
	onValueChange,
	accept,
	multiple = false,
	disabled = false,
	name,
	className,
	...props
}: FileUploadProps) {
	const {
		files,
		isDragging,
		openFileDialog,
		removeFile,
		clearFiles,
		getDropZoneProps,
		getInputProps,
	} = useFileUpload({
		value,
		defaultValue,
		onValueChange,
		accept,
		multiple,
		disabled,
	})

	return (
		<div
			className={cn(
				'hover:bg-secondary relative flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 transition-all',
				isDragging && 'border-primary bg-secondary',
				disabled && 'pointer-events-none opacity-50',
				className
			)}
			{...getDropZoneProps()}
			{...props}
		>
			<input name={name} {...getInputProps()} />

			{files.length > 0 ? (
				<div className='flex w-full flex-col items-center gap-2'>
					<div className='flex size-10 items-center justify-center rounded-full border'>
						<FileTextIcon className='size-4' />
					</div>

					{files.length === 1 ? (
						<div className='max-w-full text-center'>
							<span className='block max-w-xs truncate text-sm font-medium'>
								{files[0].name}
							</span>
							<p className='text-muted-foreground text-xs'>
								{formatFileSize(files[0].size)}
							</p>
						</div>
					) : (
						<div className='text-center'>
							<span className='text-sm font-medium'>
								{files.length} files selected
							</span>
							<p className='text-muted-foreground text-xs'>
								{formatFileSize(
									files.reduce((acc, file) => acc + file.size, 0)
								)}
							</p>
						</div>
					)}

					{files.length > 1 && (
						<div className='flex max-h-32 w-full flex-col gap-1 overflow-y-auto px-1'>
							{files.map((file, index) => (
								<div
									key={`${file.name}-${index}`}
									className='bg-secondary/40 flex items-center justify-between rounded px-2 py-1 text-xs'
								>
									<span className='max-w-45 truncate font-medium'>
										{file.name}
									</span>
									<div className='flex items-center gap-2'>
										<span className='text-muted-foreground'>
											{formatFileSize(file.size)}
										</span>
										<button
											type='button'
											aria-label={`Remove ${file.name}`}
											className='hover:text-destructive text-muted-foreground transition-colors'
											disabled={disabled}
											onClick={() => removeFile(index)}
										>
											<XIcon className='size-3.5' />
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					<div className='mt-1 flex items-center gap-2'>
						<Button
							variant='outline'
							type='button'
							disabled={disabled}
							onClick={openFileDialog}
						>
							{files.length === 1 ? 'Change file' : 'Add more files'}
						</Button>
						<Button
							variant='destructive'
							type='button'
							disabled={disabled}
							onClick={clearFiles}
						>
							{files.length === 1 ? 'Remove' : 'Remove all'}
						</Button>
					</div>
				</div>
			) : (
				<>
					<div className='flex size-10 items-center justify-center rounded-full border'>
						<UploadIcon className='size-4' />
					</div>
					<div className='text-center'>
						<span className='font-medium'>Drag & drop your files here</span>
						<p className='text-muted-foreground'>
							Or use the button below to browse
						</p>
					</div>
					<Button
						variant='outline'
						type='button'
						disabled={disabled}
						onClick={openFileDialog}
					>
						Browse files
					</Button>
				</>
			)}
		</div>
	)
}
