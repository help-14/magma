export interface Grid {
	columns: number
	rows: number
	cellWidth?: number
	cellHeight?: number
}

export interface Selection {
	id: string
	childId?: string
}
