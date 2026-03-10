import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CarFeatures } from "@/features/dashboard/_pages/car-management/_components/car-features";
import { CarsList } from "@/features/dashboard/_pages/car-management/_components/cars-list";
import { CarManagementModalProviders } from "@/features/dashboard/_pages/car-management/_providers/car-management-modal-providers";
import { createFileRoute } from "@tanstack/react-router";
import { CarIcon, SettingsIcon } from "lucide-react";
import { z } from "zod";

// Search params schema for filters
const carManagementSearchSchema = z.object({
	search: z.string().optional(),
	brand: z.string().optional(),
	category: z.string().optional(),
	availability: z.enum(["all", "available", "unavailable"]).optional(),
	minPrice: z.number().optional(),
	maxPrice: z.number().optional(),
	page: z.number().optional(),
	pageSize: z.number().optional(),
})

export const Route = createFileRoute("/admin/dashboard/_layout/cars/")({
	component: RouteComponent,
	validateSearch: carManagementSearchSchema,
});

function RouteComponent() {
	return (
		<>
			<div className="mx-auto">
				<Tabs defaultValue="cars" className="relative gap-0">
					<PaddingLayout className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b border-border">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200/50">
								<CarIcon className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<h1 className="text-2xl font-bold tracking-tight">
									Car Management
								</h1>
								<p className="text-sm text-muted-foreground">
									Manage inventory and configure features
								</p>
							</div>
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

					<div className="bg-gradient-to-b from-slate-50/60 to-background">
						<TabsContent value="cars"> <CarsList /></TabsContent>
						<TabsContent value="features"><CarFeatures /></TabsContent>
					</div>
				</Tabs>
			</div>
			<CarManagementModalProviders />
		</>
	)
}
