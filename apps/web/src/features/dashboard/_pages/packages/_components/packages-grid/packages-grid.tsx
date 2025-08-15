import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
	MoreHorizontal,
	Pencil,
	Trash2,
	Eye,
	Power,
	PowerOff,
	Package,
	DollarSign,
	Calendar,
	CheckCircle,
	AlertCircle,
	RouteIcon
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetPackagesQuery } from "../../_hooks/query/use-get-packages-query";
import { useDeletePackageMutation } from "../../_hooks/query/use-delete-package-mutation";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";
import { EditPackageDialog } from "../packages-table/edit-package-dialog";
import { ViewPackageDialog } from "../packages-table/view-package-dialog";
import { DeletePackageDialog } from "../delete-package-dialog/delete-package-dialog";
import { PackageRoutesDialog } from "../package-routes/package-routes-dialog";
import { PackageSchedulingDialog } from "../package-scheduling/package-scheduling-dialog";

interface Package {
	id: string;
	name: string;
	description: string;
	fixedPrice: number;
	isAvailable: boolean;
	isPublished?: boolean | null;
	serviceType?: string;
	bannerImageUrl?: string | null;
	createdAt: string;
}

interface PackagesGridProps {
	searchTerm?: string;
	statusFilter?: "all" | "available" | "unavailable";
}

export function PackagesGrid({ searchTerm = "", statusFilter = "all" }: PackagesGridProps) {
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
	const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
	const [routesPackage, setRoutesPackage] = useState<Package | null>(null);
	const [schedulingPackage, setSchedulingPackage] = useState<Package | null>(null);

	const packagesQuery = useGetPackagesQuery({});
	const deletePackageMutation = useDeletePackageMutation();
	const updatePackageMutation = useUpdatePackageMutation();

	const handleToggleAvailable = async (pkg: Package) => {
		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: {
					name: pkg.name,
					description: pkg.description,
					pricePerDay: pkg.fixedPrice / 100, // Convert from cents for the API
					isAvailable: !pkg.isAvailable,
					isPublished: false, // Default value
				}
			});
		} catch (error) {
			console.error("Failed to toggle package availability:", error);
		}
	};

	const allPackages = packagesQuery.data?.data || [];

	// Filter packages based on search term and status
	const packages = allPackages.filter(pkg => {
		const matchesSearch = !searchTerm ||
			pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = statusFilter === "all" ||
			(statusFilter === "available" && pkg.isAvailable) ||
			(statusFilter === "unavailable" && !pkg.isAvailable);

		return matchesSearch && matchesStatus;
	});

	if (packagesQuery.isLoading) {
		return (
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, index) => (
					<Card key={index} className="animate-pulse">
						<div className="h-48 bg-gray-200"></div>
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="h-5 bg-gray-200 rounded w-3/4"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								<div className="h-4 bg-gray-200 rounded w-full"></div>
								<div className="h-4 bg-gray-200 rounded w-2/3"></div>
								<div className="flex gap-2 mt-4">
									<div className="h-8 bg-gray-200 rounded flex-1"></div>
									<div className="h-8 bg-gray-200 rounded flex-1"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (packages.length === 0) {
		return (
			<div className="text-center py-12">
				<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-semibold mb-2">No packages found</h3>
				<p className="text-muted-foreground">Create your first package to get started</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{packages.map((pkg) => (
					<Card
						key={pkg.id}
						className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-background border"
					>
						{/* Banner Image */}
						<div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
							{pkg.bannerImageUrl ? (
								<img
									src={pkg.bannerImageUrl}
									alt={pkg.name}
									className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
								/>
							) : (
								<div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-slate-200">
									<Package className="h-16 w-16 text-slate-400" />
								</div>
							)}

							{/* Status Badge */}
							<div className="absolute top-3 left-3">
								<Badge variant={pkg.isAvailable ? "default" : "secondary"} className="shadow-sm">
									{pkg.isAvailable ? (
										<>
											<CheckCircle className="mr-1 h-3 w-3" />
											Available
										</>
									) : (
										<>
											<AlertCircle className="mr-1 h-3 w-3" />
											Unavailable
										</>
									)}
								</Badge>
							</div>

							{/* Actions Menu */}
							<div className="absolute top-3 right-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="secondary"
											size="sm"
											className="h-8 w-8 p-0 backdrop-blur-sm bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
										>
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setViewingPackage(pkg)}>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setEditingPackage(pkg)}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => setRoutesPackage(pkg)}>
											<RouteIcon className="mr-2 h-4 w-4" />
											Manage Routes
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setSchedulingPackage(pkg)}>
											<Calendar className="mr-2 h-4 w-4" />
											Manage Schedule
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleToggleAvailable(pkg)}
											disabled={updatePackageMutation.isPending}
										>
											{pkg.isAvailable ? (
												<>
													<PowerOff className="mr-2 h-4 w-4" />
													Disable
												</>
											) : (
												<>
													<Power className="mr-2 h-4 w-4" />
													Enable
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setDeletingPackage(pkg)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Published Badge */}
							{pkg.isPublished && (
								<div className="absolute bottom-3 left-3">
									<Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-sm">
										Published
									</Badge>
								</div>
							)}
						</div>

						{/* Content */}
						<CardContent className="px-4 py-0 bg-background">
							<div className="space-y-3">
								<div>
									<CardTitle className="text-lg font-semibold leading-tight mb-1 line-clamp-1">
										{pkg.name}
									</CardTitle>
									{pkg.serviceType && (
										<Badge variant="outline" className="text-xs">
											{pkg.serviceType}
										</Badge>
									)}
								</div>

								<CardDescription className="line-clamp-2 text-sm leading-relaxed min-h-[40px]">
									{pkg.description || "No description provided"}
								</CardDescription>

								<div className="flex items-center justify-between pt-2">
									<div className="flex items-center">
										<DollarSign className="h-4 w-4 text-primary" strokeWidth={3} />
										<span className="font-bold text-lg text-primary">
											{(pkg.fixedPrice ? pkg.fixedPrice / 100 : 0).toFixed(2)}
										</span>
									</div>

									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>{new Date(pkg.createdAt).toLocaleDateString()}</span>
									</div>
								</div>
							</div>

							{/* Quick Actions */}
							<div className="flex gap-2 mt-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setViewingPackage(pkg)}
									className="flex-1"
								>
									<Eye className="mr-1 h-4 w-4" />
									View
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setEditingPackage(pkg)}
									className="flex-1"
								>
									<Pencil className="mr-1 h-4 w-4" />
									Edit
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Dialogs */}
			{editingPackage && (
				<EditPackageDialog
					package={editingPackage}
					open={!!editingPackage}
					onOpenChange={(open) => !open && setEditingPackage(null)}
				/>
			)}

			{viewingPackage && (
				<ViewPackageDialog
					package={viewingPackage}
					open={!!viewingPackage}
					onOpenChange={(open) => !open && setViewingPackage(null)}
				/>
			)}

			{deletingPackage && (
				<DeletePackageDialog
					package={deletingPackage!}
					open={!!deletingPackage}
					onOpenChange={(open) => !open && setDeletingPackage(null)}
				/>
			)}

			{routesPackage && (
				<PackageRoutesDialog
					packageId={routesPackage.id}
					packageName={routesPackage.name}
					open={!!routesPackage}
					onOpenChange={(open) => !open && setRoutesPackage(null)}
				/>
			)}

			{schedulingPackage && (
				<PackageSchedulingDialog
					packageId={schedulingPackage.id}
					packageName={schedulingPackage.name}
					open={!!schedulingPackage}
					onOpenChange={(open) => !open && setSchedulingPackage(null)}
				/>
			)}
		</>
	);
}
