import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Car } from "lucide-react";
import { CarsPublicationTable } from "../cars-publication-table";

export function CarsTab() {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Car className="h-5 w-5" />
						Cars Publication Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CarsPublicationTable />
				</CardContent>
			</Card>
		</div>
	);
}