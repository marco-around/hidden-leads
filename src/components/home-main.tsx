import { useState } from 'react'

import { FileUpload } from '@/components/file-upload'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export function HomeMain() {
	const [files, setFiles] = useState<File[]>([])

	return (
		<main className='flex flex-1 items-center justify-center'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle>Insira os dados aqui!</CardTitle>
					<CardDescription>
						Por favor, insira os dados solicitados abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FileUpload
						value={files}
						onValueChange={setFiles}
						accept='.csv,.xlsx,.json'
						multiple
					/>
				</CardContent>
			</Card>
		</main>
	)
}
