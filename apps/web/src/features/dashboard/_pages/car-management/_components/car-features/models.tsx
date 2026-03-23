import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddModelDialog } from "./models/add-model-dialog";
import { ModelTableList } from "./models/model-table-list";

export function Models() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Models</CardTitle>
						<CardDescription>
							Manage car models in your inventory
						</CardDescription>
					</div>
					<AddModelDialog />
				</div>
			</CardHeader>
			<CardContent>
				<ModelTableList />
			</CardContent>
		</Card>
	);
}
