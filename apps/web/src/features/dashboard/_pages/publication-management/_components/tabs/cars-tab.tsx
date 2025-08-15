import { CarIcon } from "lucide-react";
import { CarsPublicationTable } from "../cars-publication-table";

export function CarsTab() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Cars Publication Status</h2>
			<CarsPublicationTable />
		</div>
	);
}
