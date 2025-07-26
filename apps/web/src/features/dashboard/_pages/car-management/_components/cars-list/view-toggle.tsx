import { Button } from "@/components/ui/button";
import { Grid3X3Icon, TableIcon } from "lucide-react";
import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";

export function ViewToggle() {
	const { viewMode, setViewMode } = useCarsListViewToogleStore()

	return (
		<div className="flex border rounded-md">
			<Button
				variant={viewMode === "grid" ? "default" : "ghost"}
				size="sm"
				onClick={() => setViewMode("grid")}
				className="rounded-r-none"
			>
				<Grid3X3Icon className="w-4 h-4" />
			</Button>
			<Button
				variant={viewMode === "table" ? "default" : "ghost"}
				size="sm"
				onClick={() => setViewMode("table")}
				className="rounded-l-none"
			>
				<TableIcon className="w-4 h-4" />
			</Button>
		</div>
	)
}
