import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetPackagesQuery } from "../../_hooks/query/use-get-packages-query";
import { useDeletePackageMutation } from "../../_hooks/query/use-delete-package-mutation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useState } from "react";
import { EditPackageDialog } from "./edit-package-dialog";
import { ViewPackageDialog } from "./view-package-dialog";

export function PackagesTable() {
	const [editingPackage, setEditingPackage] = useState<any>(null);
	const [viewingPackage, setViewingPackage] = useState<any>(null);

	const packagesQuery = useGetPackagesQuery({});
	const deletePackageMutation = useDeletePackageMutation();

	const handleDelete = async (packageId: string) => {
		if (confirm("Are you sure you want to delete this package?")) {
			await deletePackageMutation.mutateAsync({ id: packageId });
		}
	};

	if (packagesQuery.isLoading) {
		return <PackagesTableSkeleton />;
	}

	if (packagesQuery.isError) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">Failed to load packages</p>
			</div>
		);
	}

	const packages = packagesQuery.data?.data || [];

	if (packages.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No packages found</p>
				<p className="text-sm text-muted-foreground">Create your first package to get started</p>
			</div>
		);
	}

	console.log(packages);

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Price/Day</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[50px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{packages.map((pkg: any) => (
						<TableRow key={pkg.id}>
							<TableCell className="font-medium">{pkg.name}</TableCell>
							<TableCell className="max-w-[300px] truncate">{pkg.description}</TableCell>
							<TableCell>${(pkg.fixedPrice ? pkg.fixedPrice / 100 : 0).toFixed(2)}</TableCell>
							<TableCell>
								<Badge variant={pkg.isAvailable ? "default" : "secondary"}>
									{pkg.isAvailable ? "Available" : "Unavailable"}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(pkg.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
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
											onClick={() => handleDelete(pkg.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

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
		</>
	);
}

function PackagesTableSkeleton() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Price/Day</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="w-[50px]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, i) => (
					<TableRow key={i}>
						<TableCell><Skeleton className="h-4 w-24" /></TableCell>
						<TableCell><Skeleton className="h-4 w-48" /></TableCell>
						<TableCell><Skeleton className="h-4 w-16" /></TableCell>
						<TableCell><Skeleton className="h-6 w-20" /></TableCell>
						<TableCell><Skeleton className="h-4 w-20" /></TableCell>
						<TableCell><Skeleton className="h-8 w-8" /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
