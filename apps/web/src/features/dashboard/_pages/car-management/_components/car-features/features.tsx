import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddFeatureDialog } from "./features/add-feature-dialog";
import { FeatureTableList } from "./features/feature-table-list";

export function Features() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Features</CardTitle>
						<CardDescription>Manage car features in your inventory</CardDescription>
					</div>
					<AddFeatureDialog />
				</div>
			</CardHeader>
			<CardContent>
				<FeatureTableList />
			</CardContent>
		</Card>
	)
}

