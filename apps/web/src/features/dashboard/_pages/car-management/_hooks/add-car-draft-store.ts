import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AddCarFormValues } from "@/features/dashboard/_pages/car-management/_components/add-car/add-car-form";

type DraftState = {
	// Draft data
	addCarDraft: Partial<AddCarFormValues> | null;
	draftTimestamp: number | null;

	// Actions
	saveDraft: (data: Partial<AddCarFormValues>) => void;
	loadDraft: () => Partial<AddCarFormValues> | null;
	clearDraft: () => void;
	hasDraft: () => boolean;
	getDraftAge: () => number | null; // in minutes
};

export const useAddCarDraftStore = create<DraftState>()(
	persist(
		(set, get) => ({
			addCarDraft: null,
			draftTimestamp: null,

			saveDraft: (data) => {
				set({
					addCarDraft: data,
					draftTimestamp: Date.now(),
				});
			},

			loadDraft: () => {
				const { addCarDraft } = get();
				return addCarDraft;
			},

			clearDraft: () => {
				set({
					addCarDraft: null,
					draftTimestamp: null,
				});
			},

			hasDraft: () => {
				const { addCarDraft } = get();
				return addCarDraft !== null && Object.keys(addCarDraft).length > 0;
			},

			getDraftAge: () => {
				const { draftTimestamp } = get();
				if (!draftTimestamp) return null;
				return Math.floor((Date.now() - draftTimestamp) / (1000 * 60)); // minutes
			},
		}),
		{
			name: "car-form-drafts", // unique name for localStorage key
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				addCarDraft: state.addCarDraft,
				draftTimestamp: state.draftTimestamp,
			}),
		},
	),
);
