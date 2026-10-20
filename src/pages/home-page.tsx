import { HomeFooter } from '@/components/home-footer'
import { HomeHeader } from '@/components/home-header'
import { HomeMain } from '@/components/home-main'

export function HomePage() {
	return (
		<div className='bg-dot-grid flex h-screen flex-col gap-4 p-4'>
			<HomeHeader />
			<HomeMain />
			<HomeFooter />
		</div>
	)
}
