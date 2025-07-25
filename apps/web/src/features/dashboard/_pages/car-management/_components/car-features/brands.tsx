import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBrandDialog } from "./brands/add-brand-dialog";
import { BrandTableList } from "./brands/brand-table-list";

export function Brands() {
	return (
		<Card className="shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Car Brands</CardTitle>
						<CardDescription>Manage car brands in your inventory</CardDescription>
					</div>
					<AddBrandDialog />
				</div>
			</CardHeader>
			<CardContent>
				<BrandTableList />
			</CardContent>
		</Card>
	)
}	
