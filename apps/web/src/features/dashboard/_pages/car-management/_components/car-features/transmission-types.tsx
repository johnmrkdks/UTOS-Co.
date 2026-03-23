import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddTransmissionTypeDialog } from "./transmission-types/add-transmission-type-dialog";
import { TransmissionTypeTableList } from "./transmission-types/transmission-type-table-list";

export function TransmissionTypes() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Transmission Types</CardTitle>
						<CardDescription>
							Manage car transmission types in your inventory
						</CardDescription>
					</div>
					<AddTransmissionTypeDialog />
				</div>
			</CardHeader>
			<CardContent>
				<TransmissionTypeTableList />
			</CardContent>
		</Card>
	);
}
