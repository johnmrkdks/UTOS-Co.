import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import type { UseFormReturn } from "react-hook-form"
import type { AddCarFormValues } from "@/features/dashboard/_pages/car-management/_components/add-car/add-car-form"
import type { useAddCarDraftStore } from "./add-car-draft-store"

interface UseCarDraftFormProps {
	form: UseFormReturn<AddCarFormValues>
	draftStore: ReturnType<typeof useAddCarDraftStore>
	initialData?: Partial<AddCarFormValues>
	onDiscardSuccess: () => void
}

export function useCarDraftForm({
	form,
	draftStore,
	initialData,
	onDiscardSuccess,
}: UseCarDraftFormProps) {
	const [showDiscardAlert, setShowDiscardAlert] = useState(false)
	const [showDraftDialog, setShowDraftDialog] = useState(false)

	const { saveDraft, loadDraft, clearDraft, hasDraft } = draftStore
	const {
		formState: { isDirty },
		getValues,
		reset,
	} = form

	// Auto-save draft with debouncing
	useEffect(() => {
		if (!isDirty || initialData) return

		const timeoutId = setTimeout(() => {
			saveDraft(getValues())
		}, 2000)

		return () => clearTimeout(timeoutId)
	}, [isDirty, getValues, saveDraft, initialData])

	// Check for existing draft on mount
	useEffect(() => {
		if (!initialData && hasDraft()) {
			setShowDraftDialog(true)
		}
	}, [initialData, hasDraft])

	// Handle browser navigation with unsaved changes
	useEffect(() => {
		if (!isDirty) return

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault()
			e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
		}

		window.addEventListener("beforeunload", handleBeforeUnload)
		return () => window.removeEventListener("beforeunload", handleBeforeUnload)
	}, [isDirty])

	const handleDiscard = useCallback(() => {
		if (isDirty) {
			setShowDiscardAlert(true)
		} else {
			onDiscardSuccess()
		}
	}, [isDirty, onDiscardSuccess])

	const confirmDiscard = useCallback(() => {
		reset()
		clearDraft()
		setShowDiscardAlert(false)
		onDiscardSuccess()
	}, [reset, clearDraft, onDiscardSuccess])

	const handleSaveDraft = useCallback(() => {
		saveDraft(getValues())
		toast.message("Draft saved", {
			description: "Your progress has been saved as a draft.",
		})
	}, [getValues, saveDraft])

	const handleLoadDraft = useCallback(() => {
		const draftData = loadDraft()
		if (draftData) {
			reset({ ...getValues(), ...draftData })
			setShowDraftDialog(false)
			toast.message("Draft loaded", {
				description: "Your previous draft has been restored.",
			})
		}
	}, [loadDraft, reset, getValues])

	const handleDeleteDraft = useCallback(() => {
		clearDraft()
		setShowDraftDialog(false)
		toast.message("Draft deleted", {
			description: "Your saved draft has been removed.",
		})
	}, [clearDraft])

	return {
		showDiscardAlert,
		setShowDiscardAlert,
		showDraftDialog,
		setShowDraftDialog,
		handleSaveDraft,
		handleLoadDraft,
		handleDeleteDraft,
		handleDiscard,
		confirmDiscard,
	}
}
