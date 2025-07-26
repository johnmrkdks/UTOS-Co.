import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { AddCarFormSchema } from "@/features/dashboard/_pages/car-management/_schemas/add-car-schema";
import { BasicInfoForm } from "./add-car-forms/basic-info-form";
import { Separator } from "@/components/ui/separator";
import { SpecificationsForm } from "./add-car-forms/specifications-form";
import { DetailsForm } from "./add-car-forms/details-form";

export type AddCarFormValues = z.infer<typeof AddCarFormSchema>

export function AddCarForm() {
	const form = useForm<AddCarFormValues>({
		resolver: zodResolver(AddCarFormSchema),
		defaultValues: {
			name: "",
			description: "",
			licensePlate: "",
			mileage: 0,
			color: "",
			engineSize: 0,
			doors: 4,
			cylinders: 4,
			pricePerDay: 0,
			pricePerKm: 0,
			features: [],
			images: [],
		},
	});

	const onSubmit = (data: AddCarFormValues) => {
		console.log("Form submitted:", data);
		// Handle form submission here
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-3 gap-4">
					<div className="col-span-2 flex flex-col gap-4">
						<BasicInfoForm control={form.control} />

						<Separator />

						<SpecificationsForm control={form.control} />

						<Separator />

						<DetailsForm control={form.control} />
					</div>
					<div>
						Image upload
					</div>
				</div>

				<div className="fle flex-row ">
					<Button type="submit">Add New Car</Button>
					<Button variant="ghost">Discard</Button>
				</div>
			</form>
		</Form>
	);
}
