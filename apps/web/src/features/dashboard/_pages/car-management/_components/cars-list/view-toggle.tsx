import { Button } from "@workspace/ui/components/button";
import { Grid3X3Icon, TableIcon } from "lucide-react";
import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";

export function ViewToggle() {
	const { viewMode, setViewMode } = useCarsListViewToogleStore();

	return (
		<div className="flex h-9 rounded-md border">
			<Button
				variant={viewMode === "grid" ? "default" : "ghost"}
				size="lg"
				onClick={() => setViewMode("grid")}
				className="h-9 w-9 rounded-r-none rounded-tl-sm rounded-bl-sm"
			>
				<Grid3X3Icon className="h-4 w-4" />
			</Button>
			<Button
				variant={viewMode === "table" ? "default" : "ghost"}
				size="lg"
				onClick={() => setViewMode("table")}
				className="h-9 w-9 rounded-l-none rounded-tr-sm rounded-br-sm"
			>
				<TableIcon className="h-4 w-4" />
			</Button>
		</div>
	);
}
