import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod/v3"
import { CarFormSchema } from "@/features/dashboard/_pages/car-management/_schemas/car-schema"
import { BasicInfoForm } from "./add-car-forms/basic-info-form"
import { Separator } from "@/components/ui/separator"
import { SpecificationsForm } from "./add-car-forms/specifications-form"
import { DetailsForm } from "./add-car-forms/details-form"
import { CarStatusEnum } from "server/types"
import { MaintenanceForm } from "./add-car-forms/maintenance-form"
import { OperationalStatusForm } from "./add-car-forms/operational-status-form"
import { ImagesForm } from "./add-car-forms/images-form"
import { FeaturesForm } from "./add-car-forms/features-form"
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState, useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Loader2, Save, X, FileText, Clock, Trash2 } from "lucide-react"
import { useAddCarDraftStore } from "@/features/dashboard/_pages/car-management/_hooks/add-car-draft-store"
import { toast } from "sonner"
import { useCreateCarMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-create-car-mutation"

export type AddCarFormValues = z.infer<typeof CarFormSchema>

interface AddCarFormProps {
	onSubmit?: (data: AddCarFormValues) => Promise<void> | void
	initialData?: Partial<AddCarFormValues>
	isLoading?: boolean
	className?: string
}

// Default form values - moved outside component to prevent recreation
const DEFAULT_VALUES: Partial<AddCarFormValues> = {
	name: "",
	description: "",
	licensePlate: "",
	vinNumber: "",
	mileage: 0,
	color: "",
	engineSize: 0,
	doors: 4,
	cylinders: 4,
	seatingCapacity: 4,
	luggageCapacity: "",
	availableForPackages: true,
	availableForCustom: true,
	isActive: true,
	isAvailable: true,
	status: CarStatusEnum.Available,
	features: [],
	images: [],
}

// Status indicator component - memoized to prevent re-renders
const FormStatusIndicator = ({ isDirty, onSaveDraft }: { isDirty: boolean, onSaveDraft: () => void }) => {
	if (!isDirty) return null

	return (
		<div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
			<div className="flex items-center justify-between">
				<p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
					<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
					You have unsaved changes
				</p>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onSaveDraft}
					className="h-auto px-2 py-1 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/30"
				>
					<Save className="w-3 h-3 mr-1" />
					Save draft
				</Button>
			</div>
		</div>
	)
}

// Validation errors component - memoized
const ValidationErrors = ({ errorCount }: { errorCount: number }) => {
	if (errorCount === 0) return null

	return (
		<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
			<p className="text-sm text-red-800 dark:text-red-200 font-medium">
				Please fix {errorCount} error{errorCount !== 1 ? 's' : ''} before submitting
			</p>
		</div>
	)
}

// Status badge component
const StatusBadge = ({ isDirty, hasErrors, errorCount }: { isDirty: boolean, hasErrors: boolean, errorCount: number }) => {
	if (isDirty) {
		return (
			<span className="flex items-center gap-1">
				<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
				Auto-saving...
			</span>
		)
	}

	if (hasErrors) {
		return (
			<span className="text-red-600 dark:text-red-400">
				{errorCount} error{errorCount !== 1 ? 's' : ''}
			</span>
		)
	}

	return (
		<span className="text-green-600 dark:text-green-400 flex items-center gap-1">
			<span className="w-2 h-2 bg-green-500 rounded-full"></span>
			All saved
		</span>
	)
}

// Draft age formatter
const formatDraftAge = (draftAge: number | null): string => {
	if (!draftAge) return 'some time ago'

	if (draftAge < 60) {
		return `${draftAge} minute${draftAge !== 1 ? 's' : ''} ago`
	}

	if (draftAge < 1440) {
		const hours = Math.floor(draftAge / 60)
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`
	}

	return 'more than a day ago'
}

export function AddCarForm({
	onSubmit: onSubmitProp,
	initialData,
	isLoading = false,
	className
}: AddCarFormProps) {
	const navigate = useNavigate()
	const [showDiscardAlert, setShowDiscardAlert] = useState(false)
	const [showDraftDialog, setShowDraftDialog] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const mutation = useCreateCarMutation()
	const { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge } = useAddCarDraftStore()

	// Memoize form default values
	const formDefaultValues = useMemo(() => ({
		...DEFAULT_VALUES,
		...initialData,
	}), [initialData])

	const form = useForm<AddCarFormValues>({
		resolver: zodResolver(CarFormSchema),
		defaultValues: formDefaultValues,
		mode: "onChange",
	})

	const { formState: { isDirty, isValid, errors } } = form
	const errorCount = Object.keys(errors).length
	const hasErrors = errorCount > 0
	const draftAge = getDraftAge()

	// Auto-save draft with debouncing
	useEffect(() => {
		if (!isDirty || initialData) return

		const timeoutId = setTimeout(() => {
			saveDraft(form.getValues())
		}, 2000)

		return () => clearTimeout(timeoutId)
	}, [isDirty, form, saveDraft, initialData])

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

	// Optimized handlers with useCallback
	const handleSubmit = useCallback(async (data: AddCarFormValues) => {
		if (!onSubmitProp) {
			console.log("Form submitted:", data)
			toast.success("Car has been added successfully!")
			clearDraft()
			return
		}

		setIsSubmitting(true)
		try {
			await onSubmitProp(data)
			const parsedData = CarFormSchema.parse(data)
			mutation.mutate(parsedData)

			toast.success("Car has been added successfully!")
			clearDraft()
			form.reset()
			navigate({ to: "/dashboard/car-management" })
		} catch (error) {
			console.error("Form submission error:", error)
			toast.error("Failed to add car. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}, [onSubmitProp, form, navigate, clearDraft, mutation])

	const handleDiscard = useCallback(() => {
		if (isDirty) {
			setShowDiscardAlert(true)
		} else {
			navigate({ to: "/dashboard/car-management" })
		}
	}, [isDirty, navigate])

	const confirmDiscard = useCallback(() => {
		form.reset()
		clearDraft()
		setShowDiscardAlert(false)
		navigate({ to: "/dashboard/car-management" })
	}, [form, clearDraft, navigate])

	const handleSaveDraft = useCallback(() => {
		saveDraft(form.getValues())
		toast.message("Draft saved", {
			description: "Your progress has been saved as a draft.",
		})
	}, [form, saveDraft])

	const handleLoadDraft = useCallback(() => {
		const draftData = loadDraft()
		if (draftData) {
			form.reset({ ...form.getValues(), ...draftData })
			setShowDraftDialog(false)
			toast.message("Draft loaded", {
				description: "Your previous draft has been restored.",
			})
		}
	}, [loadDraft, form])

	const handleDeleteDraft = useCallback(() => {
		clearDraft()
		setShowDraftDialog(false)
		toast.message("Draft deleted", {
			description: "Your saved draft has been removed.",
		})
	}, [clearDraft])

	const isDisabled = isSubmitting || isLoading

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className={`flex flex-col h-full ${className || ""}`}>
					<PaddingLayout className="flex-1 overflow-y-auto pb-10 pt-0">
						<FormStatusIndicator isDirty={isDirty} onSaveDraft={handleSaveDraft} />
						<ValidationErrors errorCount={errorCount} />

						<div className="grid grid-cols-3 gap-4">
							<div className="col-span-2 flex flex-col gap-4">
								<BasicInfoForm control={form.control} />
								<Separator />
								<SpecificationsForm control={form.control} />
								<Separator />
								<DetailsForm control={form.control} />
								<Separator />
								<MaintenanceForm control={form.control} />
								<Separator />
								<OperationalStatusForm control={form.control} />
							</div>
							<div className="flex flex-col gap-4">
								<FeaturesForm control={form.control} />
								<ImagesForm control={form.control} />
							</div>
						</div>
					</PaddingLayout>

					{/* Footer Actions */}
					<div className="sticky bottom-0 w-full bg-background/95 backdrop-blur-sm border-t shadow-lg">
						<PaddingLayout className="flex items-center justify-between gap-2 py-3">
							<div className="flex items-center gap-2">
								<Button
									type="submit"
									disabled={isDisabled || !isValid}
									className="min-w-[120px]"
								>
									{isDisabled ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Adding...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Add New Car
										</>
									)}
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={handleDiscard}
									disabled={isDisabled}
								>
									<X className="w-4 h-4 mr-2" />
									Cancel
								</Button>

								{hasDraft() && !isDirty && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={handleSaveDraft}
										className="text-muted-foreground"
									>
										<FileText className="w-4 h-4 mr-1" />
										Draft available
									</Button>
								)}
							</div>

							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<StatusBadge isDirty={isDirty} hasErrors={hasErrors} errorCount={errorCount} />
							</div>
						</PaddingLayout>
					</div>
				</form>
			</Form>

			{/* Draft Dialog */}
			<AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<FileText className="w-5 h-5" />
							Draft Available
						</AlertDialogTitle>
						<AlertDialogDescription>
							You have a saved draft from {formatDraftAge(draftAge)}. Would you like to continue where you left off?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col sm:flex-row gap-2">
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleDeleteDraft}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete Draft
							</Button>
							<AlertDialogCancel onClick={() => setShowDraftDialog(false)}>
								Start Fresh
							</AlertDialogCancel>
						</div>
						<AlertDialogAction onClick={handleLoadDraft}>
							<Clock className="w-4 h-4 mr-2" />
							Load Draft
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Discard Dialog */}
			<AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
						<AlertDialogDescription>
							You have unsaved changes that will be permanently lost. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Keep editing
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDiscard}
							disabled={isSubmitting}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							Discard changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
