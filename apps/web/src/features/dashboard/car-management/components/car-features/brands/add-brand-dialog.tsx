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
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-create-car-brand-mutation"
import { useCheckCarBrandMutation } from "@/features/dashboard/car-management/hooks/brands/queries/use-check-car-brand-mutation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEntityNameValidation } from "@/features/dashboard/hooks/use-entity-name-validation"
import { EntityNameValidationDisplay } from "@/features/dashboard/components/forms/entity-name-validation-display"
import { ValidatedTextInputField } from "@/components/form-fields"

const FormSchema = z.object({
	name: z.string().min(1, "Brand name is required").max(50, "Brand name must be less than 50 characters"),
})

type FormValues = z.infer<typeof FormSchema>

export function AddBrandDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const mutation = useCreateCarBrandMutation()
	const checkNameMutation = useCheckCarBrandMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: "",
		},
	})

	const validateCarBrandName = (name: string): Promise<boolean> => {
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
		validateNameFn: validateCarBrandName,
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
		nameValidation.reset();
	}

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(FormSchema.parse(data), {
			onSuccess: () => {
				handleReset()
				setIsDialogOpen(false)
			},
		})
	}

	const canSubmit = () => {
		const values = form.getValues()
		const hasErrors = Object.keys(form.formState.errors).length > 0
		const isNameUnavailable = nameValidation.nameAvailability === false
		const isCheckingName = nameValidation.isChecking
		const hasRequiredFields = values.name?.trim()

		return hasRequiredFields && !hasErrors && !isNameUnavailable && !isCheckingName && !mutation.isPending
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add Brand
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader >
					<DialogTitle>Add New Brand</DialogTitle>
					<DialogDescription>Enter the name of the new car brand.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
						<ValidatedTextInputField
							form={form}
							name="name"
							label="Brand Name"
							placeholder="Enter brand name"
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
								{mutation.isPending ? "Adding..." : "Add Brand"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

