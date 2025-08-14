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
	AlertCircle
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

interface Package {
	id: string;
	name: string;
	description: string;
	fixedPrice: number;
	isAvailable: boolean;
	isPublished?: boolean | null;
	serviceType?: string;
	createdAt: string;
}

export function PackagesGrid() {
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
	const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);

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

	const packages = packagesQuery.data?.data || [];

	if (packagesQuery.isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, index) => (
					<Card key={index} className="animate-pulse">
						<CardHeader>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2"></div>
						</CardHeader>
						<CardContent>
							<div className="h-20 bg-gray-200 rounded"></div>
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
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{packages.map((pkg) => (
					<Card 
						key={pkg.id} 
						className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/50"
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className={`p-2 rounded-lg ${
										pkg.isAvailable 
											? "bg-green-100 text-green-700" 
											: "bg-gray-100 text-gray-700"
									}`}>
										<Package className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<CardTitle className="text-base leading-tight truncate">
											{pkg.name}
										</CardTitle>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant={pkg.isAvailable ? "default" : "secondary"} className="text-xs">
												{pkg.isAvailable ? (
													<CheckCircle className="mr-1 h-3 w-3" />
												) : (
													<AlertCircle className="mr-1 h-3 w-3" />
												)}
												{pkg.isAvailable ? "Available" : "Unavailable"}
											</Badge>
										</div>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
						</CardHeader>
						
						<CardContent className="pt-0">
							<CardDescription className="line-clamp-3 mb-4 min-h-[60px]">
								{pkg.description || "No description provided"}
							</CardDescription>
							
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm">
									<DollarSign className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">
										${(pkg.fixedPrice ? pkg.fixedPrice / 100 : 0).toFixed(2)}
									</span>
									<span className="text-muted-foreground">per day</span>
								</div>
								
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
								</div>
							</div>

							{/* Action Buttons - Visible on Mobile */}
							<div className="flex gap-2 mt-4 sm:hidden">
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
								<Button 
									variant="outline" 
									size="sm" 
									onClick={() => handleToggleAvailable(pkg)}
									disabled={updatePackageMutation.isPending}
								>
									{pkg.isAvailable ? (
										<PowerOff className="h-4 w-4" />
									) : (
										<Power className="h-4 w-4" />
									)}
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
					package={deletingPackage}
					open={!!deletingPackage}
					onOpenChange={(open) => !open && setDeletingPackage(null)}
				/>
			)}
		</>
	);
}