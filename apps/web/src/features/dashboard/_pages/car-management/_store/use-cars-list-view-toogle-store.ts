import { create } from 'zustand'

type Store = {
	viewMode: "grid" | "table"
	setViewMode: (viewMode: "grid" | "table") => void
}

export const useCarsListViewToogleStore = create<Store>()((set) => ({
	viewMode: "grid",
	setViewMode: (viewMode: "grid" | "table") => set({ viewMode }),
}))

