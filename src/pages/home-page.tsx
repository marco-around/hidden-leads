import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GithubLogoIcon, MapTrifoldIcon } from '@phosphor-icons/react'

export function HomePage() {
	return (
		<div className='bg-dot-grid flex h-screen flex-col gap-4 p-4'>
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

			<main className='flex flex-1 items-center justify-center'>
				<Card className='grid size-full max-h-1/2 max-w-2xl gap-0 py-0 shadow-xl md:grid-cols-2'>
					<div className='bg-background flex items-center justify-center'>
						Interactive map here!
					</div>
					<div className='bg-foreground/10 p-4'>filters here!</div>
				</Card>
			</main>

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
		</div>
	)
}
