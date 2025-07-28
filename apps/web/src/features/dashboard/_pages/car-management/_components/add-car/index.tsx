import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { AddCarForm } from "./add-car-form";

export function AddCar() {
	return (
		<div className="flex flex-col gap-4">
			<PaddingLayout className="flex flex-col pb-0">
				<h2 className="text-xl font-bold">Add New Car</h2>
				<p className="text-sm text-muted-foreground">
					Fill in the car details using the predefined features for consistency.
				</p>
			</PaddingLayout>

			<AddCarForm />
		</div>
	)
}
