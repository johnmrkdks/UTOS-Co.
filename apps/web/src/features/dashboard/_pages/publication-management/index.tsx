import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Car, Package2 } from "lucide-react";

import { OverviewTab, CarsTab, PackagesTab } from "./_components/tabs";

export function PublicationManagementPage() {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Publication Management</h1>
				<p className="text-muted-foreground">
					Manage publication status for cars and packages across your platform
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid grid-cols-3">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<Badge variant="outline" className="h-2 w-2 rounded-full bg-blue-500" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="cars" className="flex items-center gap-2">
						<Car className="h-4 w-4" />
						Cars Publication
					</TabsTrigger>
					<TabsTrigger value="packages" className="flex items-center gap-2">
						<Package2 className="h-4 w-4" />
						Packages Publication
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<OverviewTab />
				</TabsContent>

				<TabsContent value="cars" className="space-y-4">
					<CarsTab />
				</TabsContent>

				<TabsContent value="packages" className="space-y-4">
					<PackagesTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
