import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { PackagesView } from "@/features/dashboard/_pages/packages/_components/packages-view/packages-view";
import { AddNewPackageForm } from "@/features/dashboard/_pages/packages/_components/add-new-package/add-new-package-form";
import { PackageCategoriesTable } from "@/features/dashboard/_pages/packages/_components/package-categories/package-categories-table";
import { AddPackageCategoryDialog } from "@/features/dashboard/_pages/packages/_components/package-categories/add-package-category-dialog";
import { PackageRoutesManager } from "@/features/dashboard/_pages/packages/_components/package-routes/package-routes-manager";
import { PackageAnalyticsDashboard } from "@/features/dashboard/_pages/packages/_components/package-analytics/package-analytics-dashboard";
import { PackageAvailabilityScheduler } from "@/features/dashboard/_pages/packages/_components/package-scheduling/package-availability-scheduler";
import { PackageSelector } from "@/features/dashboard/_pages/packages/_components/package-selector/package-selector";
import { Package, Plus, FolderOpen, Route as RouteIcon, BarChart3, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useGetPackageCategoriesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-package-categories-query";
import { useModal } from "@/hooks/use-modal";
import { PaddingLayout } from '@/features/dashboard/_layouts/padding-layout';
import { PublicationStatsCard } from "@/features/dashboard/_components/publication";

export const Route = createFileRoute('/dashboard/_layout/packages/')(
	{
		component: RouteComponent,
	}
);

function RouteComponent() {
	const [showAddPackage, setShowAddPackage] = useState(false);
	const [activeTab, setActiveTab] = useState("packages");
	const [selectedPackageId, setSelectedPackageId] = useState<string>("");

	const packagesQuery = useGetPackagesQuery({});
	const { data: categories = [], isLoading: categoriesLoading } = useGetPackageCategoriesQuery();
	const { openModal } = useModal();

	const packages = packagesQuery.data?.data || [];

	// Auto-select first package when packages load and no package is selected
	useEffect(() => {
		if (packages.length > 0 && !selectedPackageId) {
			setSelectedPackageId(packages[0].id);
		}
	}, [packages, selectedPackageId]);

	// Get selected package details
	const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);

	// Calculate publication stats
	const publicationStats = {
		total: packages.length,
		published: packages.filter((pkg: any) => pkg.isPublished && pkg.isAvailable).length,
		unpublished: packages.filter((pkg: any) => !pkg.isPublished).length,
		publishedWithIssues: packages.filter((pkg: any) => pkg.isPublished && !pkg.isAvailable).length,
	};

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid grid-cols-4">
					<TabsTrigger value="packages" className="flex items-center gap-2">
						<Package className="h-4 w-4" />
						Packages
					</TabsTrigger>
					<TabsTrigger value="categories" className="flex items-center gap-2">
						<FolderOpen className="h-4 w-4" />
						Categories
					</TabsTrigger>
					<TabsTrigger value="routes" className="flex items-center gap-2">
						<RouteIcon className="h-4 w-4" />
						Routes
					</TabsTrigger>
					<TabsTrigger value="scheduling" className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						Scheduling
					</TabsTrigger>
					{/* <TabsTrigger value="analytics" className="flex items-center gap-2"> */}
					{/* 	<BarChart3 className="h-4 w-4" /> */}
					{/* 	Analytics */}
					{/* </TabsTrigger> */}
				</TabsList>

				<TabsContent value="packages" className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Service Packages</h3>
							<p className="text-sm text-muted-foreground">Manage your service packages, pricing, and availability</p>
						</div>
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
										Add a new package to your service offerings. Fill in the details below.
									</DialogDescription>
								</DialogHeader>
								<AddNewPackageForm onSuccess={() => setShowAddPackage(false)} />
							</DialogContent>
						</Dialog>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Packages</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{packages.length || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Available service packages
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Active Packages</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{packages.filter((pkg: any) => pkg.isAvailable).length || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Currently bookable
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Packages</CardTitle>
							<CardDescription>
								Manage your service packages, pricing, and availability.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PackagesView />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Package Categories</h3>
							<p className="text-sm text-muted-foreground">
								Manage package categories for organized booking options. Categories group packages by theme (e.g., "Airport Services", "City Tours")
								while Service Types define operational models (Transfer, Tour, Event, Hourly).
							</p>
						</div>
						<Button
							onClick={() => openModal("add-package-category")}
							className="flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Category
						</Button>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-medium">Total Categories</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{categories.length}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base font-medium">Active Categories</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">{categories.length}</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Categories</CardTitle>
							<CardDescription>
								Organize your packages into categories for better customer experience.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PackageCategoriesTable data={categories} isLoading={categoriesLoading} />
						</CardContent>
					</Card>

					<AddPackageCategoryDialog />
				</TabsContent>

				<TabsContent value="routes" className="space-y-4">
					{packages.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No packages available</h3>
								<p className="text-muted-foreground">
									Create your first package to configure routes
								</p>
							</CardContent>
						</Card>
					) : (
						<>
							<PackageSelector
								packages={packages}
								selectedPackageId={selectedPackageId}
								onSelectPackage={setSelectedPackageId}
								isLoading={packagesQuery.isLoading}
							/>
							{selectedPackage && (
								<PackageRoutesManager
									packageId={selectedPackage.id}
									packageName={selectedPackage.name}
								/>
							)}
						</>
					)}
				</TabsContent>

				<TabsContent value="scheduling" className="space-y-4">
					{packages.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No packages available</h3>
								<p className="text-muted-foreground">
									Create your first package to configure scheduling
								</p>
							</CardContent>
						</Card>
					) : (
						<>
							<PackageSelector
								packages={packages}
								selectedPackageId={selectedPackageId}
								onSelectPackage={setSelectedPackageId}
								isLoading={packagesQuery.isLoading}
							/>
							{selectedPackage && (
								<PackageAvailabilityScheduler
									packageId={selectedPackage.id}
									packageName={selectedPackage.name}
								/>
							)}
						</>
					)}
				</TabsContent>

				{/* <TabsContent value="analytics" className="space-y-4"> */}
				{/* 	<PackageAnalyticsDashboard /> */}
				{/* </TabsContent> */}
			</Tabs>
		</PaddingLayout>
	);
}
