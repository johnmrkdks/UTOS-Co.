import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { CarIcon, ExternalLink } from "lucide-react";
import { CarsPublicationTable } from "../cars-publication-table";

export function CarsTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Cars Publication Status</h2>
				<Button asChild size="sm" variant="outline">
					<Link to="/admin/dashboard/cars" className="flex items-center gap-2">
						<CarIcon className="h-4 w-4" />
						Manage Cars
						<ExternalLink className="h-3 w-3" />
					</Link>
				</Button>
			</div>
			<CarsPublicationTable />
		</div>
	);
}
