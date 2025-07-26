import { AddCarForm } from "./add-car-form";

export function AddCar() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">
				<h2 className="text-xl font-bold">Add New Car</h2>
				<p className="text-sm text-muted-foreground">
					Fill in the car details using the predefined features for consistency.
				</p>
			</div>

			<AddCarForm />
		</div>
	)
}
