import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { AddCarForm } from "./add-car-form";

export function AddCar() {
	return (
		<div className="flex flex-col h-full">
			<PaddingLayout className="flex flex-col pb-0 shrink-0">
				<h2 className="text-xl font-bold">Add New Car</h2>
				<p className="text-sm text-muted-foreground">
					Fill in the car details using the predefined features for consistency.
				</p>
			</PaddingLayout>

			<div className="flex-1 min-h-0">
				<AddCarForm />
			</div>
		</div>
	)
}
