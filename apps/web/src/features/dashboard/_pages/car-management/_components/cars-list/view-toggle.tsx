import { Button } from "@workspace/ui/components/button";
import { Grid3X3Icon, TableIcon } from "lucide-react";
import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";

export function ViewToggle() {
	const { viewMode, setViewMode } = useCarsListViewToogleStore()

	return (
		<div className="flex border rounded-md h-9">
			<Button
				variant={viewMode === "grid" ? "default" : "ghost"}
				size="lg"
				onClick={() => setViewMode("grid")}
				className="rounded-r-none rounded-tl-sm rounded-bl-sm h-9 w-9"
			>
				<Grid3X3Icon className="w-4 h-4" />
			</Button>
			<Button
				variant={viewMode === "table" ? "default" : "ghost"}
				size="lg"
				onClick={() => setViewMode("table")}
				className="rounded-l-none rounded-tr-sm rounded-br-sm h-9 w-9"
			>
				<TableIcon className="w-4 h-4" />
			</Button>
		</div>
	)
}
