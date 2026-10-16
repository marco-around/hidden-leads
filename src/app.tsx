import { Button } from './components/ui/button'
import { toast, Toaster } from './components/ui/toast'
export function App() {
	return (
		<div className='flex h-screen items-center justify-center'>
			<Button
				type='button'
				onClick={() => {
					toast.add({ title: 'Test toast' })
				}}
			>
				Test toast
			</Button>
			<Toaster />
		</div>
	)
}
