import { Button } from "@workspace/ui/components/button"
import { Form } from "@workspace/ui/components/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldErrors } from "react-hook-form"
import { z } from "zod/v3"
import { CarFormSchema } from "@/features/dashboard/_pages/car-management/_schemas/car-schema"
import { BasicInfoForm } from "./add-car-forms/basic-info-form"
import { Separator } from "@workspace/ui/components/separator"
import { SpecificationsForm } from "./add-car-forms/specifications-form"
import { DetailsForm } from "./add-car-forms/details-form"
import { CarStatusEnum } from "server/types"
import { MaintenanceForm } from "./add-car-forms/maintenance-form"
import { OperationalStatusForm } from "./add-car-forms/operational-status-form"
import { ImagesForm } from "./add-car-forms/images-form"
import { FeaturesForm } from "./add-car-forms/features-form"
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout"
import { useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SaveIcon, FileTextIcon, AlertCircleIcon, ImageIcon, InfoIcon } from "lucide-react"
import { useAddCarDraftStore } from "@/features/dashboard/_pages/car-management/_hooks/add-car-draft-store"
import { toast } from "sonner"
import { useCreateCarMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-create-car-mutation"
import { useCarDraftForm } from "@/features/dashboard/_pages/car-management/_hooks/use-car-draft-form"
import {
	DiscardDialog,
	DraftDialog,
} from "@/features/dashboard/_pages/car-management/_components/draft/draft-dialogs"
import {
	StatusBadge,
} from "@/features/dashboard/_pages/car-management/_components/draft/draft-indicators"
import { PublicationValidationPanel } from "@/features/dashboard/_components/publication"

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
	color: "",
	doors: 4,
	seatingCapacity: 4,
	availableForPackages: true,
	availableForCustom: true,
	isActive: true,
	isAvailable: true,
	status: CarStatusEnum.Available,
	features: [],
	images: [],

	modelId: "",
	bodyTypeId: "",
	fuelTypeId: "",
	transmissionTypeId: "",
	driveTypeId: "",
	conditionTypeId: "",
	categoryId: "",
}

interface ValidationErrorsProps {
	errors: FieldErrors<AddCarFormValues>
	errorCount: number
}

export const ValidationErrors = ({ errors, errorCount }: ValidationErrorsProps) => {
	if (errorCount === 0 || !errors) return null

	// Group errors by type for better user experience
	const imageErrors = errors?.images
	const formErrors = Object.entries(errors || {}).filter(([key]) => key !== 'images')

	return (
		<div className="mb-4 space-y-3">
			{/* General form errors */}
			{formErrors.length > 0 && (
				<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
					<div className="flex items-start gap-2">
						<AlertCircleIcon className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
						<div className="space-y-2">
							<p className="text-sm text-red-800 dark:text-red-200 font-medium">
								Please fix the following fields:
							</p>
							<ul className="text-xs text-red-700 dark:text-red-300 space-y-1 ml-2">
								{formErrors.map(([field, error]) => (
									<li key={field} className="flex items-start gap-1">
										<span className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0"></span>
										<span>
											<strong className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
											{error?.message || 'This field has an error'}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Image-specific errors */}
			{imageErrors && (
				<div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
					<div className="flex items-start gap-2">
						<ImageIcon className="size-4 shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
						<div className="space-y-2">
							<p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
								Image Upload Issues:
							</p>
							<div className="text-xs text-orange-700 dark:text-orange-300 space-y-2">
								{imageErrors.message && (
									<div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded border border-orange-200 dark:border-orange-700">
										{imageErrors.message}
									</div>
								)}

								<div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
									<InfoIcon className="size-3 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
									<div className="text-blue-700 dark:text-blue-300">
										<strong>Quick fixes:</strong>
										<ul className="mt-1 space-y-1 ml-2">
											<li>• Make sure at least one image is uploaded</li>
											<li>• Check that exactly one image is marked as "Main"</li>
											<li>• Try removing all images and re-uploading them</li>
											<li>• Make sure all images have valid URLs</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export function AddCarForm({ onSubmit: onSubmitProp, initialData, isLoading = false, className }: AddCarFormProps) {
	const navigate = useNavigate()

	const mutation = useCreateCarMutation()
	const draftStore = useAddCarDraftStore()

	// Memoize form default values
	const formDefaultValues = useMemo(
		() => ({
			...DEFAULT_VALUES,
			...initialData,
		}),
		[initialData],
	)

	const form = useForm<AddCarFormValues>({
		resolver: zodResolver(CarFormSchema),
		defaultValues: formDefaultValues,
		mode: "onChange",
	})

	// Watch form data for validation
	const currentFormData = form.watch()

	const {
		formState: { isDirty, isValid, errors },
	} = form

	// Transform form data for validation (add defaults for new car)
	const carValidationData = useMemo(() => ({
		id: initialData?.id || "new",
		name: currentFormData.name || "",
		description: currentFormData.description || "",
		licensePlate: currentFormData.licensePlate || "",
		images: currentFormData.images || [],
		insuranceExpiry: currentFormData.insuranceExpiry ? new Date(currentFormData.insuranceExpiry) : undefined,
		registrationExpiry: currentFormData.registrationExpiry ? new Date(currentFormData.registrationExpiry) : undefined,
		lastServiceDate: currentFormData.lastServiceDate ? new Date(currentFormData.lastServiceDate) : undefined,
		isActive: currentFormData.isActive ?? true,
		isAvailable: currentFormData.isAvailable ?? true,
		status: currentFormData.status || "available",
		seatingCapacity: currentFormData.seatingCapacity || 4,
		category: currentFormData.categoryId ? { name: "Category" } : undefined,
		model: currentFormData.modelId ? { name: "Model", brand: { name: "Brand" } } : undefined,
	}), [currentFormData, initialData])

	const errorCount = errors ? Object.keys(errors).length : 0
	const hasErrors = errorCount > 0

	const {
		showDiscardAlert,
		setShowDiscardAlert,
		showDraftDialog,
		setShowDraftDialog,
		handleSaveDraft,
		handleLoadDraft,
		handleDeleteDraft,
		handleDiscard,
		confirmDiscard,
	} = useCarDraftForm({
		form,
		draftStore,
		initialData,
		onDiscardSuccess: () => navigate({ to: "/admin/dashboard/cars" }),
	})

	const handleSubmit = useCallback(
		async (data: AddCarFormValues) => {

			const parsedData = CarFormSchema.parse(data)

			console.log("parsedData", parsedData)

			mutation.mutate(parsedData, {
				onSuccess: () => {
					toast.success("Car has been added successfully!")
					draftStore.clearDraft()
					form.reset()
					navigate({ to: "/admin/dashboard/cars" })
				},
				onError: (error) => {
					console.error("Form submission error:", error)
					toast.error("Failed to add car. Please try again.")
				},
			})

		},
		[onSubmitProp, form, navigate, draftStore, mutation],
	)

	const isPending = mutation.isPending || form.formState.isSubmitting

	return (
		<>
			<Form {...form as any}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className={`flex flex-col h-full ${className || ""}`}>
					<div className="flex-1">
						<PaddingLayout className="pt-0 pb-4">
							<ValidationErrors errors={errors} errorCount={errorCount} />

							<div className="grid grid-cols-10 gap-4">
								<div className="col-span-6 flex flex-col gap-4">
									<BasicInfoForm control={form.control as any} />
									<Separator />
									<SpecificationsForm control={form.control as any} />
									<Separator />
									<DetailsForm control={form.control as any} />
									<Separator />
									<MaintenanceForm control={form.control as any} />
									<Separator />
									<OperationalStatusForm control={form.control as any} />
								</div>
								<div className="col-span-4 flex flex-col gap-4">
									<FeaturesForm control={form.control as any} />
									<ImagesForm control={form.control as any} />

									{/* Publication Validation Panel */}
									<PublicationValidationPanel
										data={carValidationData}
										type="car"
									/>
								</div>
							</div>
						</PaddingLayout>
					</div>

					{/* Footer Actions - Sticky within form container */}
					<div className="sticky bottom-0 w-full bg-background/95 backdrop-blur-sm border-t shadow-lg z-10">
						<PaddingLayout className="flex items-center justify-between gap-2 py-3">
							<div className="flex items-center gap-2">
								<Button
									type="submit"
									disabled={isPending || !isValid}
									className="min-w-[120px]"
									loading={isPending}
								>
									{isPending ? (
										<>
											Adding...
										</>
									) : (
										<>
											<SaveIcon className="w-4 h-4" />
											Add New Car
										</>
									)}
								</Button>

								<Button 
									type="button" 
									variant="secondary" 
									onClick={handleSaveDraft} 
									disabled={isPending || !isDirty}
									className="min-w-[100px]"
								>
									<FileTextIcon className="w-4 h-4" />
									Save Draft
								</Button>

								<Button type="button" variant="outline" onClick={handleDiscard} disabled={isPending}>
									Cancel
								</Button>

								{draftStore.hasDraft() && !isDirty && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setShowDraftDialog(true)}
										className="text-muted-foreground"
									>
										<FileTextIcon className="w-4 h-4" />
										Load Draft
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
			<DraftDialog
				open={showDraftDialog}
				onOpenChange={setShowDraftDialog}
				onLoadDraft={handleLoadDraft}
				onDeleteDraft={handleDeleteDraft}
				draftAge={draftStore.getDraftAge()}
			/>

			{/* Discard Dialog */}
			<DiscardDialog
				open={showDiscardAlert}
				onOpenChange={setShowDiscardAlert}
				onConfirmDiscard={confirmDiscard}
				isSubmitting={mutation.isPending}
			/>
		</>
	)
}
