import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { AddCarForm } from "./add-car-form";

export function AddCar() {
	return (
		<div className="flex h-full flex-col">
			<PaddingLayout className="flex shrink-0 flex-col pb-0">
				<h2 className="font-bold text-xl">Add New Car</h2>
				<p className="text-muted-foreground text-sm">
					Fill in the car details using the predefined features for consistency.
				</p>
			</PaddingLayout>

			<div className="min-h-0 flex-1">
				<AddCarForm />
			</div>
		</div>
	);
}
