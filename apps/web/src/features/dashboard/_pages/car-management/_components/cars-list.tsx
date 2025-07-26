import { AddCarDialog } from "./cars-list/add-car";
import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";
import { ViewToggle } from "./cars-list/view-toggle";
import { CarGridCard } from "./cars-list/cars-list-grid/car-grid-card";
import { mockCarsData } from "@/data/mock-cars-data";
import { CarsListGrid } from "./cars-list/cars-list-grid";

export function CarsList() {
	const { viewMode } = useCarsListViewToogleStore();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Cars Inventory</h2>
					<p className="text-muted-foreground">Manage your car inventory and listings</p>
				</div>
				<AddCarDialog />
			</div>
			<div className="flex items-center justify-between">
				<div>
					Filters here
				</div>
				<ViewToggle />
			</div>
			<p className="text-muted-foreground text-xs italic">Mock data for testing purposes</p>

			<div>
				{
					viewMode === "grid" && (
						<CarsListGrid cars={mockCarsData} className="grid grid-cols-3 gap-4" />
					)
				}

				{
					viewMode === "table" && (
						<div>
							Table View
						</div>
					)
				}
			</div>
		</div>

	)
}
