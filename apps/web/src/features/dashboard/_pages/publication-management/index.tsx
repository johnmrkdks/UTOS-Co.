import { Badge } from "@workspace/ui/components/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Car, Package2 } from "lucide-react";
import { useState } from "react";

import { CarsTab, OverviewTab, PackagesTab } from "./_components/tabs";

export function PublicationManagementPage() {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="space-y-6 p-4">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">
					Publication Management
				</h1>
				<p className="text-muted-foreground">
					Manage publication status for cars and packages across your platform
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList className="grid grid-cols-3">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="h-2 w-2 rounded-full bg-blue-500"
						/>
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
