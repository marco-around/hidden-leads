import { HiddenLeadsDatabase, type LeadsTable } from '@/db/database'

export const db = new HiddenLeadsDatabase()

export { HiddenLeadsDatabase }
export type { LeadsTable }
