import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CarFeatures } from "@/features/dashboard/_pages/car-management/_components/car-features";
import { CarsList } from "@/features/dashboard/_pages/car-management/_components/cars-list";
import { createFileRoute } from "@tanstack/react-router";
import { CarIcon, SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/_layout/car-management/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto">
			<div className="space-y-6">
				<Tabs defaultValue="cars" className="relative space-y-2">
					<PaddingLayout className="sticky top-0 z-10 flex items-center justify-between bg-background border-b border-border">
						<div>
							<h1 className="text-2xl font-bold tracking-tight">
								Car Management System
							</h1>
							<p className="text-muted-foreground">
								Manage inventory and configure features
							</p>
						</div>

						<TabsList className="grid grid-cols-2">
							<TabsTrigger value="cars" className="flex items-center gap-2">
								<CarIcon className="w-4 h-4" />
								Cars Inventory
							</TabsTrigger>
							<TabsTrigger value="features" className="flex items-center gap-2">
								<SettingsIcon className="w-4 h-4" />
								Car Features
							</TabsTrigger>
						</TabsList>
					</PaddingLayout>

					<div className="bg-gray-50">
						<PaddingLayout>
							<TabsContent value="cars"> <CarsList /></TabsContent>
							<TabsContent value="features"><CarFeatures /></TabsContent>
						</PaddingLayout>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
