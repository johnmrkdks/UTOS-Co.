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
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v3"
import { zodResolver } from "@hookform/resolvers/zod"
import { ValidatedTextInputField } from "@/components/form-fields"
import { useEntityNameValidation } from "@/features/dashboard/_hooks/use-entity-name-validation"
import { EntityNameValidationDisplay } from "@/features/dashboard/_components/forms/entity-name-validation-display"
import { useCreateCarConditionTypeMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-create-car-condition-type-mutation"
import { useIsCarConditionTypeExistMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-condition-type/use-is-car-condition-type-exist-mutation"

const FormSchema = z.object({
	name: z
		.string()
		.min(1, "Condition type is required")
		.max(50, "Condition type must be less than 50 characters"),
});

type FormValues = z.infer<typeof FormSchema>

export function AddConditionTypeDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const mutation = useCreateCarConditionTypeMutation();
	const checkNameMutation = useIsCarConditionTypeExistMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: "",
		},
	})

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
		errorMessage: `${form.watch("name")} already exists.`,
	})

	const validationDisplay = EntityNameValidationDisplay({
		isChecking: nameValidation.isChecking,
		nameAvailability: nameValidation.nameAvailability,
		hasValue: !!form.watch("name")?.trim(),
		hasError: !!form.formState.errors.name,
		entityName: form.watch("name")?.trim(),
	})

	const handleReset = () => {
		form.reset()
		nameValidation.reset()
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(FormSchema.parse(data), {
			onSuccess: () => {
				handleReset()
				setIsDialogOpen(false)
			},
		})
	}

	// Check if form is valid and ready to submit
	const canSubmit = () => {
		const values = form.getValues()
		const hasErrors = Object.keys(form.formState.errors).length > 0
		const isNameUnavailable = nameValidation.nameAvailability === false
		const isCheckingName = nameValidation.isChecking
		const hasRequiredFields = values.name?.trim();

		return hasRequiredFields && !hasErrors && !isNameUnavailable && !isCheckingName && !mutation.isPending
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add Condition Type
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Add New Condition Type</DialogTitle>
					<DialogDescription>Enter the name of the new condition type.</DialogDescription>
				</DialogHeader>
				<Form {...form as any}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<ValidatedTextInputField
							form={form}
							name="name"
							label="Condition Type"
							placeholder="Enter condition type"
							validationDisplay={validationDisplay}
						/>
						<DialogFooter>
							<DialogClose>
								<Button
									type="button"
									variant="ghost"
									onClick={handleReset}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={!canSubmit()}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Adding..." : "Add Condition Type"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
