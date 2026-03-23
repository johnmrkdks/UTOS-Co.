import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { ExternalLink, Package2 } from "lucide-react";
import { PackagesPublicationTable } from "../packages-publication-table";

export function PackagesTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Packages Publication Status</h2>
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
