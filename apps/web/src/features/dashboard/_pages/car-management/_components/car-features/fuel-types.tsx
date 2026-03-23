import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddFuelTypeDialog } from "./fuel-types/add-fuel-type-dialog";
import { FuelTypeTableList } from "./fuel-types/fuel-type-table-list";

export function FuelTypes() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Fuel Types</CardTitle>
						<CardDescription>
							Manage car fuel types in your inventory
						</CardDescription>
					</div>
					<AddFuelTypeDialog />
				</div>
			</CardHeader>
			<CardContent>
				<FuelTypeTableList />
			</CardContent>
		</Card>
	);
}
