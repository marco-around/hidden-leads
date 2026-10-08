import { Button } from './components/ui/button'
import { Dexie, type EntityTable } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

type DexieDatabase = Dexie & {
	users: EntityTable<{ id: number; name: string; email: string }, 'id'>
}
const db = new Dexie('myDatabase') as DexieDatabase

db.version(1).stores({ users: '++id, name, email' })

export function App() {
	const users = useLiveQuery(() => db.users.toArray(), [])

	function addUser() {
		db.users.add({ name: 'John Doe', email: 'john.doe@example.com' })
	}

	return (
		<div className='flex h-screen items-center justify-center'>
			<Button type='button' onClick={addUser}>
				Test Dexie.js
			</Button>
			<pre>{JSON.stringify(users, null, 2)}</pre>
		</div>
	)
}
