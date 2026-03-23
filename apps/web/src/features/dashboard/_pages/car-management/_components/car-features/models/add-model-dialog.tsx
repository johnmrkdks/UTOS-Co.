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
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import {
	SelectField,
	TextInputField,
	ValidatedTextInputField,
} from "@/components/form-fields";
import { EntityNameValidationDisplay } from "@/features/dashboard/_components/forms/entity-name-validation-display";
import { useEntityNameValidation } from "@/features/dashboard/_hooks/use-entity-name-validation";
import { useGetCarBrandsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-brand/use-get-car-brands-query";
import { useCreateCarModelMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-create-car-model-mutation";
import { useIsCarModelExistMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/car-model/use-is-car-model-exist-mutation";

const FormSchema = z.object({
	name: z
		.string()
		.min(1, "Model name is required")
		.max(50, "Model name must be less than 50 characters"),
	brandId: z.string().min(1, "Brand id is required"),
	year: z.coerce
		.number()
		.min(1900, "Year must be 1900 or later")
		.max(
			new Date().getFullYear(),
			`Year cannot be later than ${new Date().getFullYear()}`,
		),
});

type FormValues = z.infer<typeof FormSchema>;

export function AddModelDialog() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { data: brands, isLoading: isBrandsLoading } = useGetCarBrandsQuery({});
	const mutation = useCreateCarModelMutation();
	const checkNameMutation = useIsCarModelExistMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		disabled: mutation.isPending,
		defaultValues: {
			name: "",
			brandId: "",
		},
	});

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
		errorMessage: `${form.watch("name")} already exists.`,
	});

	const validationDisplay = EntityNameValidationDisplay({
		isChecking: nameValidation.isChecking,
		nameAvailability: nameValidation.nameAvailability,
		hasValue: !!form.watch("name")?.trim(),
		hasError: !!form.formState.errors.name,
		entityName: form.watch("name")?.trim(),
	});

	// Memoize brand options to prevent unnecessary re-renders
	const brandOptions = useMemo(
		() =>
			brands?.data?.map((brand) => ({
				value: brand.id,
				label: brand.name,
			})) || [],
		[brands?.data],
	);

	const handleReset = () => {
		form.reset();
		nameValidation.reset();
	};

	const handleSubmit = (data: FormValues) => {
		mutation.mutate(FormSchema.parse(data), {
			onSuccess: () => {
				handleReset();
				setIsDialogOpen(false);
			},
		});
	};

	// Check if form is valid and ready to submit
	const canSubmit = () => {
		const values = form.getValues();
		const hasErrors = Object.keys(form.formState.errors).length > 0;
		const isCheckingName = nameValidation.isChecking;
		const hasRequiredFields =
			values.name?.trim() && values.brandId && values.year;

		// Name validation is OK if it's either true (available) or null (not checked yet)
		const nameValidationOk = nameValidation.nameAvailability !== false;

		return (
			hasRequiredFields &&
			!hasErrors &&
			nameValidationOk &&
			!isCheckingName &&
			!mutation.isPending
		);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="h-4 w-4" />
					Add Model
				</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false} className="flex flex-col gap-8">
				<DialogHeader>
					<DialogTitle>Add New Model</DialogTitle>
					<DialogDescription>
						Enter the name of the new car model.
					</DialogDescription>
				</DialogHeader>
				<Form {...(form as any)}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-col gap-4">
							<SelectField
								form={form}
								name="brandId"
								label="Brand"
								placeholder="Select brand"
								disabled={isBrandsLoading}
								options={brandOptions}
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
							<DialogClose>
								<Button type="button" variant="ghost" onClick={handleReset}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={!canSubmit()}
								loading={mutation.isPending}
							>
								{mutation.isPending ? "Adding..." : "Add Model"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
