import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function CarsList() {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Cars Inventory</h2>
				<p className="text-muted-foreground">Manage your car inventory and listings</p>
			</div>
			<Button>
				<PlusIcon className="w-4 h-4 mr-2" />
				Add New Car
			</Button>
		</div>

	)
}
