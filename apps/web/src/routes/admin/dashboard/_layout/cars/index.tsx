import { createFileRoute } from "@tanstack/react-router";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { CarIcon, SettingsIcon } from "lucide-react";
import { z } from "zod";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CarFeatures } from "@/features/dashboard/_pages/car-management/_components/car-features";
import { CarsList } from "@/features/dashboard/_pages/car-management/_components/cars-list";
import { CarManagementModalProviders } from "@/features/dashboard/_pages/car-management/_providers/car-management-modal-providers";

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
});

export const Route = createFileRoute("/admin/dashboard/_layout/cars/")({
	component: RouteComponent,
	validateSearch: carManagementSearchSchema,
});

function RouteComponent() {
	return (
		<>
			<div className="mx-auto">
				<Tabs defaultValue="cars" className="relative gap-0">
					<PaddingLayout className="sticky top-0 z-10 flex items-center justify-between border-border border-b bg-background/95 backdrop-blur-sm">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100">
								<CarIcon className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<h1 className="font-bold text-2xl tracking-tight">
									Car Management
								</h1>
								<p className="text-muted-foreground text-sm">
									Manage inventory and configure features
								</p>
							</div>
						</div>

						<TabsList className="grid grid-cols-2">
							<TabsTrigger value="cars" className="flex items-center gap-2">
								<CarIcon className="h-4 w-4" />
								Cars Inventory
							</TabsTrigger>
							<TabsTrigger value="features" className="flex items-center gap-2">
								<SettingsIcon className="h-4 w-4" />
								Car Features
							</TabsTrigger>
						</TabsList>
					</PaddingLayout>

					<div className="bg-gradient-to-b from-slate-50/60 to-background">
						<TabsContent value="cars">
							{" "}
							<CarsList />
						</TabsContent>
						<TabsContent value="features">
							<CarFeatures />
						</TabsContent>
					</div>
				</Tabs>
			</div>
			<CarManagementModalProviders />
		</>
	);
}
