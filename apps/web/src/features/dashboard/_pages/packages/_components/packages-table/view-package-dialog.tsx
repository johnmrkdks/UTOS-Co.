import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Calendar, Info, Package, Route as RouteIcon } from "lucide-react";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";
import { useGetPackageRoutesQuery } from "../../_hooks/query/use-get-package-routes-query";
import { useState } from "react";
import { PackageOverviewTab } from "./view-package-tabs/package-overview-tab";
import { PackageRoutesTab } from "./view-package-tabs/package-routes-tab";
import { PackageScheduleTab } from "./view-package-tabs/package-schedule-tab";

type ViewPackageDialogProps = {
	package: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewPackageDialog({ package: pkg, open, onOpenChange }: ViewPackageDialogProps) {
	const updatePackageMutation = useUpdatePackageMutation();
	const [activeTab, setActiveTab] = useState("overview");

	// Get package routes
	const routesQuery = useGetPackageRoutesQuery({ packageId: pkg?.id || "" });
	const routes = routesQuery.data || [];

	const handleToggleAvailable = async () => {
		if (!pkg?.id) return;

		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: {
					name: pkg.name,
					description: pkg.description,
					pricePerDay: (pkg.fixedPrice || pkg.pricePerDay || 0) / 100, // Convert from cents for the API
					isAvailable: !pkg.isAvailable,
					isPublished: pkg.isPublished || false,
				}
			});
		} catch (error) {
			console.error("Failed to toggle package availability:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{pkg?.name}
					</DialogTitle>
					<DialogDescription>Package details, routes, and availability schedule</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview" className="flex items-center gap-2">
							<Info className="h-4 w-4" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="routes" className="flex items-center gap-2">
							<RouteIcon className="h-4 w-4" />
							Routes ({routes.length})
						</TabsTrigger>
						<TabsTrigger value="schedule" className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Schedule
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						<PackageOverviewTab 
							pkg={pkg}
							routes={routes}
							onToggleAvailable={handleToggleAvailable}
							isUpdating={updatePackageMutation.isPending}
						/>
					</TabsContent>

					<TabsContent value="routes" className="space-y-6">
						<PackageRoutesTab routes={routes} />
					</TabsContent>

					<TabsContent value="schedule" className="space-y-6">
						<PackageScheduleTab pkg={pkg} />
					</TabsContent>
				</Tabs>

				<DialogFooter className="flex justify-between">
					<div className="flex-1" />
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}