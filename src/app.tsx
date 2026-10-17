import { Toaster } from './components/ui/toast'
import { ThemeProvider } from './hooks/use-theme'
import { HomePage } from './pages/home-page'

export function App() {
	return (
		<ThemeProvider defaultTheme='system' storageKey='hidden-leads-theme'>
			<Toaster />
			<HomePage />
		</ThemeProvider>
	)
}
