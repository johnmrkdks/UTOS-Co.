import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { SquarePenIcon } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v3"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CarModel } from "server/types"
import { SelectField, ValidatedTextInputField, TextInputField } from "@/components/form-fields"
import { useEntityNameValidation } from "@/features/dashboard/_hooks/use-entity-name-validation"
import { EntityNameValidationDisplay } from "@/features/dashboard/_components/forms/entity-name-validation-display"
import { useUpdateCarModelMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-update-car-model-mutation"
import { useGetCarBrandsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-brand/use-get-car-brands-query"
import { useIsCarModelExistMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-is-car-model-exist-mutation"

type EditModelDialogProps = {
	model: CarModel
}

const FormSchema = z.object({
	name: z.string().min(1, "Model name is required").max(50, "Model name must be less than 50 characters"),
	brandId: z.string().min(1, "Brand id is required"),
	year: z.coerce
		.number()
		.min(1900, "Year must be 1900 or later")
		.max(new Date().getFullYear(), `Year cannot be later than ${new Date().getFullYear()}`),
})

type FormValues = z.infer<typeof FormSchema>

export function EditModelDialog({ model }: EditModelDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { data: brands, isLoading: isBrandsLoading } = useGetCarBrandsQuery({})
	const mutation = useUpdateCarModelMutation()
	const checkNameMutation = useIsCarModelExistMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: model.name,
			brandId: model.brandId,
			year: model.year,
		},
	})

	// Reset form when dialog opens or model changes
	useEffect(() => {
		if (isDialogOpen) {
			form.reset({
				name: model.name,
				brandId: model.brandId,
				year: model.year,
			})
		}
	}, [model, form, isDialogOpen])

	const validateName = (name: string): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			checkNameMutation.mutate(
				{ name },
				{
					onSuccess: (isAvailable) => resolve(isAvailable!),
					onError: (error) => reject(error),
				}
			)
		})
	}

	const nameValidation = useEntityNameValidation({
		form,
		fieldName: "name",
		validateNameFn: validateName,
		originalValue: model.name,
		errorMessage: `${form.watch("name")} already used.`,
	})

	const validationDisplay = EntityNameValidationDisplay({
		isChecking: nameValidation.isChecking,
		nameAvailability: nameValidation.nameAvailability,
		hasValue: !!form.watch("name")?.trim(),
		hasError: !!form.formState.errors.name,
		entityName: form.watch("name")?.trim(),
	})

	// Memoize brand options to prevent unnecessary re-renders
	const brandOptions = useMemo(() =>
		brands?.data?.map(brand => ({
			value: brand.id,
			label: brand.name
		})) || [],
		[brands?.data]
	)

	const handleReset = () => {
		form.reset({
			name: model.name,
			brandId: model.brandId,
			year: model.year,
		})
		nameValidation.reset()
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(
			{
				id: model.id,
				data: FormSchema.parse(data),
			},
			{
				onSuccess: () => {
					setIsDialogOpen(false)
				},
			},
		)
	}

	// Check if form has changed from original values
	const hasChanges = () => {
		const currentValues = form.getValues()
		return (
			currentValues.name !== model.name ||
			currentValues.brandId !== model.brandId ||
			currentValues.year !== model.year
		)
	}

	// Check if form is valid and ready to submit
	const canSubmit = () => {
		const values = form.getValues()
		const hasErrors = Object.keys(form.formState.errors).length > 0
		const isNameUnavailable = nameValidation.nameAvailability === false
		const isCheckingName = nameValidation.isChecking
		const hasRequiredFields = values.name?.trim() && values.brandId && values.year

		return (
			hasChanges() && hasRequiredFields && !hasErrors && !isNameUnavailable && !isCheckingName && !mutation.isPending
		)
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<SquarePenIcon className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Edit Model</DialogTitle>
					<DialogDescription>Edit the details of the model.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<div className="flex flex-col gap-4">
							<SelectField
								form={form}
								name="brandId"
								label="Brand"
								placeholder="Select brand"
								disabled={isBrandsLoading}
								options={brandOptions}
								value={form.watch("brandId")}
							/>

							<div className="grid grid-cols-2 gap-2">
								<ValidatedTextInputField
									form={form}
									name="name"
									label="Model Name"
									placeholder="Enter model name"
									className="flex flex-col items-start"
									validationDisplay={validationDisplay}
								/>

								<TextInputField
									form={form}
									name="year"
									label="Model Year"
									type="number"
									placeholder="Enter year"
									className="flex flex-col items-start"
								/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="ghost" onClick={handleReset}>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={!canSubmit()} loading={mutation.isPending}>
								{mutation.isPending ? "Updating..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
