import { GithubLogoIcon } from '@phosphor-icons/react'

import { Button } from './ui/button'

export function HomeFooter() {
	return (
		<footer className='flex items-center justify-between'>
			<Button
				variant='outline'
				size='icon'
				nativeButton={false}
				render={
					<a
						href='https://github.com/marco-around/hidden-leads'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='View source code on GitHub'
					>
						<GithubLogoIcon className='size-4' />
					</a>
				}
			></Button>

			<small className='text-muted-foreground'>
				© {new Date().getFullYear()} Hidden Leads. All rights reserved.
			</small>
		</footer>
	)
}
