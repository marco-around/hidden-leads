import { MapTrifoldIcon } from '@phosphor-icons/react'

import { LanguageToggle } from './language-toggle'
import { ThemeToggle } from './theme-toggle'
import { Separator } from './ui/separator'

export function HomeHeader() {
	return (
		<header className='flex justify-between'>
			<div className='flex items-center gap-2'>
				<MapTrifoldIcon className='size-6' weight='fill' />
				<h1 className='text-2xl font-bold'>Hidden Leads</h1>
			</div>

			<div className='flex items-center gap-2'>
				<LanguageToggle />
				<Separator orientation='vertical' />
				<ThemeToggle />
			</div>
		</header>
	)
}
