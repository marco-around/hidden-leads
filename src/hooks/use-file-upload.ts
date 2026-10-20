import { type ChangeEvent, type DragEvent, useRef, useState } from 'react'

import { filterByAccept } from '@/utils/filter-by-accept-file'

type UseFileUploadOptions = {
	value?: File[]
	defaultValue?: File[]
	onValueChange?: (files: File[]) => void
	accept?: string
	multiple?: boolean
	disabled?: boolean
}

export function useFileUpload({
	value,
	defaultValue,
	onValueChange,
	accept,
	multiple = false,
	disabled = false,
}: UseFileUploadOptions) {
	const [internalFiles, setInternalFiles] = useState<File[]>(defaultValue ?? [])
	const [isDragging, setIsDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const dragCounter = useRef(0)

	const isControlled = value !== undefined
	const files = isControlled ? value : internalFiles

	function updateFiles(nextFiles: File[]) {
		if (!isControlled) setInternalFiles(nextFiles)
		onValueChange?.(nextFiles)
	}

	function selectFiles(selectedFiles: FileList | null) {
		if (disabled || !selectedFiles || selectedFiles.length === 0) return

		let incoming = Array.from(selectedFiles)

		if (accept) {
			incoming = filterByAccept(incoming, accept)
			if (incoming.length === 0) return
		}

		const nextFiles = multiple ? [...files, ...incoming] : incoming.slice(0, 1)
		updateFiles(nextFiles)
	}

	function removeFile(indexToRemove: number) {
		const nextFiles = files.filter((_, index) => index !== indexToRemove)
		updateFiles(nextFiles)
	}

	function clearFiles() {
		updateFiles([])
	}

	function openFileDialog() {
		if (disabled) return
		inputRef.current?.click()
	}

	function getDropZoneProps() {
		return {
			onDragEnter(dragEvent: DragEvent<HTMLElement>) {
				dragEvent.preventDefault()
				if (disabled) return
				dragCounter.current++
				setIsDragging(true)
			},
			onDragLeave(dragEvent: DragEvent<HTMLElement>) {
				dragEvent.preventDefault()
				dragCounter.current--
				if (dragCounter.current === 0) setIsDragging(false)
			},
			onDragOver(dragEvent: DragEvent<HTMLElement>) {
				dragEvent.preventDefault()
			},
			onDrop(dropEvent: DragEvent<HTMLElement>) {
				dropEvent.preventDefault()
				dragCounter.current = 0
				setIsDragging(false)
				if (disabled) return
				selectFiles(dropEvent.dataTransfer.files)
			},
		} as const
	}

	function getInputProps() {
		return {
			ref: inputRef,
			type: 'file' as const,
			accept,
			multiple,
			disabled,
			tabIndex: -1,
			className: 'sr-only',
			onChange(changeEvent: ChangeEvent<HTMLInputElement>) {
				selectFiles(changeEvent.target.files)
				changeEvent.target.value = ''
			},
		}
	}

	return {
		files,
		isDragging,
		openFileDialog,
		removeFile,
		clearFiles,
		getDropZoneProps,
		getInputProps,
	}
}
