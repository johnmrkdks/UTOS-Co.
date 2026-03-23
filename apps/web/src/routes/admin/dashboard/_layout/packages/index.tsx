import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Package, Plus, Tags } from "lucide-react";
import { useState } from "react";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { AddNewPackageForm } from "@/features/dashboard/_pages/packages/_components/add-new-package/add-new-package-form";
import { PackageAnalyticsCards } from "@/features/dashboard/_pages/packages/_components/package-analytics/package-analytics-cards";
import { AddPackageServiceTypeDialog } from "@/features/dashboard/_pages/packages/_components/package-service-types/add-package-service-type-dialog";
import { PackageServiceTypesTable } from "@/features/dashboard/_pages/packages/_components/package-service-types/package-service-types-table";
import { PackagesView } from "@/features/dashboard/_pages/packages/_components/packages-view/packages-view";
import { useGetPackageServiceTypesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-package-service-types-query";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useModal } from "@/hooks/use-modal";

export const Route = createFileRoute("/admin/dashboard/_layout/packages/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showAddPackage, setShowAddPackage] = useState(false);
	const [activeTab, setActiveTab] = useState("packages");

	const packagesQuery = useGetPackagesQuery({ limit: 50 });
	const { data: serviceTypesData, isLoading: serviceTypesLoading } =
		useGetPackageServiceTypesQuery();
	const { openModal } = useModal();

	const serviceTypes = serviceTypesData?.data || [];

	const packages = (packagesQuery.data as any)?.data || [];

	return (
		<div className="flex-1">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="">
				<PaddingLayout className="flex flex-col items-center justify-between gap-4 border-b sm:flex-row">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100">
							<Package className="h-5 w-5 text-purple-600" />
						</div>
						<div>
							<h2 className="font-bold text-2xl tracking-tight">
								Package Management
							</h2>
							<p className="text-muted-foreground text-sm">
								Manage packages and service types
							</p>
						</div>
					</div>
					<TabsList className="grid grid-cols-2">
						<TabsTrigger value="packages" className="flex items-center gap-2">
							<Package className="h-4 w-4" />
							Packages
						</TabsTrigger>
						<TabsTrigger
							value="service-types"
							className="flex items-center gap-2"
						>
							<Tags className="h-4 w-4" />
							Service Types
						</TabsTrigger>
					</TabsList>
				</PaddingLayout>

				<PaddingLayout className="pt-1">
					<TabsContent value="packages" className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-semibold text-lg">Service Packages</h3>
								<p className="text-muted-foreground text-sm">
									Manage your service packages, pricing, and availability
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Dialog open={showAddPackage} onOpenChange={setShowAddPackage}>
									<DialogTrigger asChild>
										<Button className="flex items-center gap-2">
											<Plus className="h-4 w-4" />
											Add Package
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[800px]">
										<DialogHeader>
											<DialogTitle>Create New Package</DialogTitle>
											<DialogDescription>
												Add a new package to your service offerings. Fill in the
												details below.
											</DialogDescription>
										</DialogHeader>
										<AddNewPackageForm
											onSuccess={() => setShowAddPackage(false)}
										/>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						<PackageAnalyticsCards
							packages={packages}
							isLoading={packagesQuery.isLoading}
						/>

						<PackagesView />
					</TabsContent>

					<TabsContent value="service-types" className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-semibold text-lg">Service Types</h3>
								<p className="text-muted-foreground text-sm">
									Define operational service models that determine how packages
									are delivered (Transfer, Tour, Event, Hourly). Service Types
									define the core operational structure of your packages.
								</p>
							</div>
							<Button
								onClick={() => openModal("add-package-service-type")}
								className="flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								Add Service Type
							</Button>
						</div>

						<Card>
							<CardHeader>
								<CardTitle>All Service Types</CardTitle>
								<CardDescription>
									Manage the operational models that define how your packages
									function.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<PackageServiceTypesTable
									data={serviceTypes as any}
									isLoading={serviceTypesLoading}
								/>
							</CardContent>
						</Card>

						<AddPackageServiceTypeDialog />
					</TabsContent>
				</PaddingLayout>
			</Tabs>
		</div>
	);
}
