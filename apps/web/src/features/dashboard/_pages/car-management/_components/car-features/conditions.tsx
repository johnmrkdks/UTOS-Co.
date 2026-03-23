import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddConditionTypeDialog } from "./condition-types/add-condition-type-dialog";
import { ConditionTypeTableList } from "./condition-types/drive-type-table-list";

export function ConditionTypes() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Condition Types</CardTitle>
						<CardDescription>
							Manage car condition types in your inventory
						</CardDescription>
					</div>
					<AddConditionTypeDialog />
				</div>
			</CardHeader>
			<CardContent>
				<ConditionTypeTableList />
			</CardContent>
		</Card>
	);
}
