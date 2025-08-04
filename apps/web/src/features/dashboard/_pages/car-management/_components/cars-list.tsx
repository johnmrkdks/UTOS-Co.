import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";
import { ViewToggle } from "./cars-list/view-toggle";
import { CarsListGrid } from "./cars-list/cars-list-grid";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useGetCarsQuery } from "../_hooks/query/car/use-get-cars-query";

function AddCarButton() {
	return (
		<Link to="/dashboard/car-management/add-car">
			<Button>
				<PlusIcon className="w-4 h-4" />
				Add New Car
			</Button>
		</Link>
	)
}

export function CarsList() {
	const { viewMode } = useCarsListViewToogleStore();
	const { data: cars, isLoading: isCarsLoading } = useGetCarsQuery({});

	console.log("cars", cars);

	return (
		<div className="relative flex flex-col gap-0">
			{/* Sticky Toolbar */}
			<PaddingLayout className="sticky top-[85px] z-9 bg-background border-b border-boder flex items-center justify-between">
				<div>
					Filters here
				</div>

				<div className="flex gap-2">
					<AddCarButton />
					<ViewToggle />
				</div>
			</PaddingLayout>

			{/* Scrollable Content */}
			<PaddingLayout className="overflow-y-auto h-full">
				<div>
					{
						viewMode === "grid" && (
							<CarsListGrid cars={cars?.data} isLoading={isCarsLoading} className="grid grid-cols-3 gap-4" />
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
