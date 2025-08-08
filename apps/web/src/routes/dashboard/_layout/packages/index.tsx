import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { PackagesTable } from "@/features/dashboard/_pages/packages/_components/packages-table/packages-table";
import { AddNewPackageForm } from "@/features/dashboard/_pages/packages/_components/add-new-package/add-new-package-form";
import { PackageCategoriesTable } from "@/features/dashboard/_pages/packages/_components/package-categories/package-categories-table";
import { AddPackageCategoryDialog } from "@/features/dashboard/_pages/packages/_components/package-categories/add-package-category-dialog";
import { Package, Plus, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useGetPackageCategoriesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-package-categories-query";
import { useModal } from "@/hooks/use-modal";
import { PaddingLayout } from '@/features/dashboard/_layouts/padding-layout';

export const Route = createFileRoute('/dashboard/_layout/packages/')(
	{
		component: RouteComponent,
	}
);

function RouteComponent() {
	const [showAddPackage, setShowAddPackage] = useState(false);
	const [activeTab, setActiveTab] = useState("packages");
	const packagesQuery = useGetPackagesQuery();
	const { data: categories = [], isLoading: categoriesLoading } = useGetPackageCategoriesQuery();
	const { openModal } = useModal();

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList>
					<TabsTrigger value="packages" className="flex items-center gap-2">
						<Package className="h-4 w-4" />
						Packages
					</TabsTrigger>
					<TabsTrigger value="categories" className="flex items-center gap-2">
						<FolderOpen className="h-4 w-4" />
						Categories
					</TabsTrigger>
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
							<DialogContent className="sm:max-w-[525px]">
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
									{packagesQuery.data?.totalItems || 0}
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
									{packagesQuery.data?.items?.filter((pkg: any) => pkg.isAvailable).length || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Currently bookable
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Average Price</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									${(
										(packagesQuery.data?.items?.reduce((sum: number, pkg: any) => sum + (pkg.pricePerDay || 0), 0) || 0) /
										(packagesQuery.data?.items?.length || 1)
									).toFixed(0)}
								</div>
								<p className="text-xs text-muted-foreground">
									Per day across all packages
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Inactive Packages</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{packagesQuery.data?.items?.filter((pkg: any) => !pkg.isAvailable).length || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Temporarily unavailable
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
							<PackagesTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Package Categories</h3>
							<p className="text-sm text-muted-foreground">Manage package categories for organized booking options</p>
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
			</Tabs>
		</PaddingLayout>
	);
}
