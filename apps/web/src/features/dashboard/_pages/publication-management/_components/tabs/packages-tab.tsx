import { Package2, ExternalLink } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import { PackagesPublicationTable } from "../packages-publication-table";

export function PackagesTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Packages Publication Status</h2>
				<Button asChild size="sm" variant="outline">
					<Link to="/dashboard/packages" className="flex items-center gap-2">
						<Package2 className="h-4 w-4" />
						Manage Packages
						<ExternalLink className="h-3 w-3" />
					</Link>
				</Button>
			</div>
			<PackagesPublicationTable />
		</div>
	);
}
