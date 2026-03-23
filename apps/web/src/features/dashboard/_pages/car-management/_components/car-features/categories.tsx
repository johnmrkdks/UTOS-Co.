import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { AddCategoryDialog } from "./categories/add-category-dialog";
import { CategoryTableList } from "./categories/drive-type-table-list";

export function Categories() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Categories</CardTitle>
						<CardDescription>
							Manage car categories in your inventory
						</CardDescription>
					</div>
					<AddCategoryDialog />
				</div>
			</CardHeader>
			<CardContent>
				<CategoryTableList />
			</CardContent>
		</Card>
	);
}
