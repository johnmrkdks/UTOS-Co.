import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Package2 } from "lucide-react";
import { PackagesPublicationTable } from "../packages-publication-table";

export function PackagesTab() {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package2 className="h-5 w-5" />
						Packages Publication Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<PackagesPublicationTable />
				</CardContent>
			</Card>
		</div>
	);
}