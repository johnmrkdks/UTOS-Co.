import { Button } from "@workspace/ui/components/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Form } from "@workspace/ui/components/form"
import { SquarePenIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v3"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CarBodyType } from "server/types"
import { ValidatedTextInputField } from "@/components/form-fields"
import { useEntityNameValidation } from "@/features/dashboard/_hooks/use-entity-name-validation"
import { EntityNameValidationDisplay } from "@/features/dashboard/_components/forms/entity-name-validation-display"
import { useUpdateCarFuelTypeMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-update-car-fuel-type-mutation"
import { useIsCarFuelTypeExistMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-fuel-type/use-is-car-fuel-type-exist-mutation"

type EditBodyTypeDialogProps = {
	bodyType: CarBodyType
}

const FormSchema = z.object({
	name: z.string().min(1, "Body type is required").max(50, "Body type must be less than 50 characters"),
})

type FormValues = z.infer<typeof FormSchema>

export function EditBodyTypeDialog({ bodyType }: EditBodyTypeDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const mutation = useUpdateCarFuelTypeMutation()
	const checkNameMutation = useIsCarFuelTypeExistMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: bodyType.name,
		},
	})

	// Reset form when dialog opens or bodyType changes
	useEffect(() => {
		if (isDialogOpen) {
			form.reset({
				name: bodyType.name,
			})
		}
	}, [bodyType, form, isDialogOpen])

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
		originalValue: bodyType.name,
		errorMessage: `${form.watch("name")} already used.`,
	})

	const validationDisplay = EntityNameValidationDisplay({
		isChecking: nameValidation.isChecking,
		nameAvailability: nameValidation.nameAvailability,
		hasValue: !!form.watch("name")?.trim(),
		hasError: !!form.formState.errors.name,
		entityName: form.watch("name")?.trim(),
	})

	const handleReset = () => {
		form.reset({
			name: bodyType.name,
		})
		nameValidation.reset()
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(
			{
				id: bodyType.id,
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
			currentValues.name !== bodyType.name
		)
	}

	// Check if form is valid and ready to submit
	const canSubmit = () => {
		const values = form.getValues()
		const hasErrors = Object.keys(form.formState.errors).length > 0
		const isNameUnavailable = nameValidation.nameAvailability === false
		const isCheckingName = nameValidation.isChecking
		const hasRequiredFields = values.name?.trim();

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
					<DialogTitle>Edit Body Type</DialogTitle>
					<DialogDescription>Edit the details of the fuel type.</DialogDescription>
				</DialogHeader>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<ValidatedTextInputField
							form={form}
							name="name"
							label="Body Type"
							placeholder="Enter fuel type"
							validationDisplay={validationDisplay}
						/>
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
