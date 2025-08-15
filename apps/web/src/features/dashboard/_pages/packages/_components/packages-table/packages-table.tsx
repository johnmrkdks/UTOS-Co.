import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Pencil, Trash2, Eye, Power, PowerOff, Route as RouteIcon, Calendar } from "lucide-react";
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
import { useState } from "react";
import { EditPackageDialog } from "./edit-package-dialog";
import { ViewPackageDialog } from "./view-package-dialog";
import { DeletePackageDialog } from "../delete-package-dialog/delete-package-dialog";
import { PackageRoutesDialog } from "../package-routes/package-routes-dialog";
import { PackageSchedulingDialog } from "../package-scheduling/package-scheduling-dialog";
import type { ColumnDef } from "@tanstack/react-table";

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

export function PackagesTable() {
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


	const columns: ColumnDef<Package>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Description" />
			),
			cell: ({ row }) => (
				<div className="max-w-[300px] truncate" title={row.getValue("description")}>
					{row.getValue("description")}
				</div>
			),
			enableSorting: false,
		},
		{
			accessorKey: "fixedPrice",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Price/Day" />
			),
			cell: ({ row }) => {
				const fixedPrice = row.getValue("fixedPrice") as number;
				return <div>${(fixedPrice ? fixedPrice / 100 : 0).toFixed(2)}</div>;
			},
		},
		{
			accessorKey: "isAvailable",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const pkg = row.original;
				return (
					<Badge variant={pkg.isAvailable ? "default" : "secondary"}>
						{pkg.isAvailable ? "Available" : "Unavailable"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Created" />
			),
			cell: ({ row }) => {
				const createdAt = row.getValue("createdAt") as string;
				return <div>{new Date(createdAt).toLocaleDateString()}</div>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const pkg = row.original;
				
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem onClick={() => setViewingPackage(pkg)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setEditingPackage(pkg)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Package
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
										Disable Package
									</>
								) : (
									<>
										<Power className="mr-2 h-4 w-4" />
										Enable Package
									</>
								)}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setDeletingPackage(pkg)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Package
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const filterConfigs = [
		{
			columnId: "isAvailable",
			title: "Availability",
			options: [
				{ label: "Available", value: "true" },
				{ label: "Unavailable", value: "false" },
			],
		},
	];

	const packages = packagesQuery.data?.data || [];

	return (
		<>
			<DataTable
				columns={columns}
				data={packages}
				isLoading={packagesQuery.isLoading}
				enableToolbar={true}
				searchKey="name"
				searchPlaceholder="Search packages..."
				filterConfigs={filterConfigs}
				enablePagination={true}
				pageSize={10}
				emptyState={
					<div className="text-center py-8">
						<p className="text-muted-foreground">No packages found</p>
						<p className="text-sm text-muted-foreground">Create your first package to get started</p>
					</div>
				}
			/>

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