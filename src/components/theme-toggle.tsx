import { MoonIcon, SunIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
	const { setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant='outline' size='icon'>
						<SunIcon className='size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
						<MoonIcon className='absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
						<span className='sr-only'>Toggle theme</span>
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Theme</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => setTheme('light')}>
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('dark')}>
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('system')}>
						System
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
