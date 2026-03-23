import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddDriveTypeDialog } from "./drive-types/add-drive-type-dialog";
import { DriveTypeTableList } from "./drive-types/drive-type-table-list";

export function DriveTypes() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Drive Types</CardTitle>
						<CardDescription>
							Manage car drive types in your inventory
						</CardDescription>
					</div>
					<AddDriveTypeDialog />
				</div>
			</CardHeader>
			<CardContent>
				<DriveTypeTableList />
			</CardContent>
		</Card>
	);
}
