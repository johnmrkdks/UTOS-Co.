import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBodyTypeDialog } from "./body-types/add-body-type-dialog";
import { BodyTypeTableList } from "./body-types/body-type-table-list";

export function BodyTypes() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Body Types</CardTitle>
						<CardDescription>Manage car body types in your inventory</CardDescription>
					</div>
					<AddBodyTypeDialog />
				</div>
			</CardHeader>
			<CardContent>
				<BodyTypeTableList />
			</CardContent>
		</Card>
	)
}	
