import { AddCarDialog } from "./cars-list/add-car";
import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";
import { ViewToggle } from "./cars-list/view-toggle";
import { mockCarsData } from "@/data/mock-cars-data";
import { CarsListGrid } from "./cars-list/cars-list-grid";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export function CarsList() {
	const { viewMode } = useCarsListViewToogleStore();

	return (
		<div className="relative flex flex-col gap-0">
			{/* Sticky Toolbar */}
			<PaddingLayout className="sticky top-[85px] z-9 bg-background border-b border-boder flex items-center justify-between">
				<div>
					Filters here
				</div>
				<div className="flex gap-2">
					<AddCarDialog />
					<ViewToggle />
				</div>
			</PaddingLayout>

			{/* Scrollable Content */}
			<PaddingLayout className="overflow-y-auto h-full">
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
			</PaddingLayout >
		</div>
	)
}
