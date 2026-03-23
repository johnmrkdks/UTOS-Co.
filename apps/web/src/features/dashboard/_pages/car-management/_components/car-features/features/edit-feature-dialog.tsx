import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { SquarePenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { CarFeature } from "server/types";
import { z } from "zod/v3";
import { ValidatedTextInputField } from "@/components/form-fields";
import { EntityNameValidationDisplay } from "@/features/dashboard/_components/forms/entity-name-validation-display";
import { useEntityNameValidation } from "@/features/dashboard/_hooks/use-entity-name-validation";
import { useIsCarFeatureExistMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-is-car-feature-exist-mutation";
import { useUpdateCarFeatureMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-update-car-feature-mutation";

type EditFeatureDialogProps = {
	feature: CarFeature;
};

const FormSchema = z.object({
	name: z
		.string()
		.min(1, "Feature is required")
		.max(50, "Feature must be less than 50 characters"),
});

type FormValues = z.infer<typeof FormSchema>;

export function EditFeatureDialog({ feature }: EditFeatureDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const mutation = useUpdateCarFeatureMutation();
	const checkNameMutation = useIsCarFeatureExistMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: feature.name,
		},
	});

	// Reset form when dialog opens or feature changes
	useEffect(() => {
		if (isDialogOpen) {
			form.reset({
				name: feature.name,
			});
		}
	}, [feature, form, isDialogOpen]);

	const validateName = (name: string): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			checkNameMutation.mutate(
				{ name },
				{
					onSuccess: (isAvailable) => resolve(isAvailable!),
					onError: (error) => reject(error),
				},
			);
		});
	};

	const nameValidation = useEntityNameValidation({
		form,
		fieldName: "name",
		validateNameFn: validateName,
		originalValue: feature.name,
		errorMessage: `${form.watch("name")} already used.`,
	});

	const validationDisplay = EntityNameValidationDisplay({
		isChecking: nameValidation.isChecking,
		nameAvailability: nameValidation.nameAvailability,
		hasValue: !!form.watch("name")?.trim(),
		hasError: !!form.formState.errors.name,
		entityName: form.watch("name")?.trim(),
	});

	const handleReset = () => {
		form.reset({
			name: feature.name,
		});
		nameValidation.reset();
	};

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(
			{
				id: feature.id,
				data: FormSchema.parse(data),
			},
			{
				onSuccess: () => {
					setIsDialogOpen(false);
				},
			},
		);
	};

	// Check if form has changed from original values
	const hasChanges = () => {
		const currentValues = form.getValues();
		return currentValues.name !== feature.name;
	};

	// Check if form is valid and ready to submit
	const canSubmit = () => {
		const values = form.getValues();
		const hasErrors = Object.keys(form.formState.errors).length > 0;
		const isNameUnavailable = nameValidation.nameAvailability === false;
		const isCheckingName = nameValidation.isChecking;
		const hasRequiredFields = values.name?.trim();

		return (
			hasChanges() &&
			hasRequiredFields &&
			!hasErrors &&
			!isNameUnavailable &&
			!isCheckingName &&
			!mutation.isPending
		);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<SquarePenIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Edit Feature</DialogTitle>
					<DialogDescription>
						Edit the details of the feature.
					</DialogDescription>
				</DialogHeader>
				<Form {...(form as any)}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="flex flex-col gap-4"
					>
						<ValidatedTextInputField
							form={form}
							name="name"
							label="Feature"
							placeholder="Enter feature"
							validationDisplay={validationDisplay}
						/>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="ghost" onClick={handleReset}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={!canSubmit()}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Updating..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
