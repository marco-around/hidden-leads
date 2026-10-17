import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

export function LanguageToggle() {
	const [language, setLanguage] = useState<'PT' | 'EN'>('EN')

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant='outline' size='icon'>
						{language}
						<span className='sr-only'>Toggle language</span>
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Language</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => setLanguage('PT')}>
						PT
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setLanguage('EN')}>
						EN
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
