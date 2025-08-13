import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetPackagesQuery } from "../../_hooks/query/use-get-packages-query";
import { useDeletePackageMutation } from "../../_hooks/query/use-delete-package-mutation";
import { useState } from "react";
import { EditPackageDialog } from "./edit-package-dialog";
import { ViewPackageDialog } from "./view-package-dialog";
import type { ColumnDef } from "@tanstack/react-table";

interface Package {
	id: string;
	name: string;
	description: string;
	fixedPrice: number;
	isAvailable: boolean;
	createdAt: string;
}

export function PackagesTable() {
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [viewingPackage, setViewingPackage] = useState<Package | null>(null);

	const packagesQuery = useGetPackagesQuery({});
	const deletePackageMutation = useDeletePackageMutation();

	const handleDelete = async (packageId: string) => {
		if (confirm("Are you sure you want to delete this package?")) {
			await deletePackageMutation.mutateAsync({ id: packageId });
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
				<DataTableColumnHeader column={column} title="Availability" />
			),
			cell: ({ row }) => {
				const isAvailable = row.getValue("isAvailable") as boolean;
				return (
					<Badge variant={isAvailable ? "default" : "secondary"}>
						{isAvailable ? "Available" : "Unavailable"}
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
							<DropdownMenuItem
								onClick={() => handleDelete(pkg.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
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
		</>
	);
}