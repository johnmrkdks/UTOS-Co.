import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarFeatures } from "@/features/dashboard/_pages/car-management/_components/car-features";
import { createFileRoute } from "@tanstack/react-router";
import { CarIcon, SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/_layout/car-management/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Car Management System
					</h1>
					<p className="text-muted-foreground">
						Manage your car inventory and configure car features for easy
						selection when adding new vehicles.
					</p>
				</div>

				<Tabs defaultValue="cars" className="space-y-4">
					<TabsList className="grid w-full grid-cols-2 max-w-md">
						<TabsTrigger value="cars" className="flex items-center gap-2">
							<CarIcon className="w-4 h-4" />
							Cars Inventory
						</TabsTrigger>
						<TabsTrigger value="features" className="flex items-center gap-2">
							<SettingsIcon className="w-4 h-4" />
							Car Features
						</TabsTrigger>
					</TabsList>

					<TabsContent value="cars">{/* <CarsList /> */}</TabsContent>

					<TabsContent value="features"><CarFeatures /></TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
