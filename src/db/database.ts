import Dexie, { type EntityTable } from 'dexie'

import type { Lead } from '@/types/lead'

export type LeadsTable = EntityTable<Lead, 'id'>

export class HiddenLeadsDatabase extends Dexie {
	declare leads: LeadsTable

	constructor() {
		super('hidden_leads_db')

		this.version(1).stores({
			leads: 'id, name, status, importedAt',
		})
	}
}
