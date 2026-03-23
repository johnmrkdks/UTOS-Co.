import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeletePricingConfigMutation } from "../_hooks/query/use-delete-pricing-config-mutation";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";
import { DeletePricingConfigDialog } from "./delete-pricing-config-dialog";
import { EditPricingConfigDialog } from "./edit-pricing-config-dialog";
import { ViewPricingConfigDialog } from "./view-pricing-config-dialog";

interface PricingConfig {
	id: string;
	name: string;
	carId?: string;
	firstKmRate: number;
	firstKmLimit: number;
	pricePerKm: number;
	createdAt: string | null;
	car?: {
		name: string;
		licensePlate?: string;
	};
}

export function PricingConfigTable() {
	const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(
		null,
	);
	const [viewingConfig, setViewingConfig] = useState<PricingConfig | null>(
		null,
	);
	const [deletingConfig, setDeletingConfig] = useState<PricingConfig | null>(
		null,
	);

	const pricingConfigsQuery = useGetPricingConfigsQuery({});
	const deletePricingConfigMutation = useDeletePricingConfigMutation();

	const columns: ColumnDef<PricingConfig>[] = useMemo(
		() => [
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
				accessorKey: "car",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Car" />
				),
				cell: ({ row }) => {
					const config = row.original;
					return (
						<div className="text-sm">
							{config.car?.name ? (
								<>
									<div className="font-medium">{config.car.name}</div>
									{config.car.licensePlate && (
										<div className="text-muted-foreground">
											({config.car.licensePlate})
										</div>
									)}
								</>
							) : (
								<div className="text-muted-foreground">Global Config</div>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "firstKmRate",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="First KM Rate" />
				),
				cell: ({ row }) => {
					const firstKmRate = row.getValue("firstKmRate") as number;
					return <div>${firstKmRate?.toFixed(2) || "0.00"}</div>;
				},
			},
			{
				accessorKey: "firstKmLimit",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="First KM Limit" />
				),
				cell: ({ row }) => {
					const firstKmLimit = row.getValue("firstKmLimit") as number;
					return <div>{firstKmLimit || 10} km</div>;
				},
			},
			{
				accessorKey: "pricePerKm",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Additional KM Rate" />
				),
				cell: ({ row }) => {
					const pricePerKm = row.getValue("pricePerKm") as number;
					return <div>${pricePerKm?.toFixed(2) || "0.00"}</div>;
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
				meta: {
					sticky: "right",
				},
				cell: ({ row }) => {
					const config = row.original;

					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setViewingConfig(config)}>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setEditingConfig(config)}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeletingConfig(config)}
									className="text-red-600 focus:text-red-600"
								>
									<Trash className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
				enableSorting: false,
				enableHiding: false,
			},
		],
		[setEditingConfig, setViewingConfig, setDeletingConfig],
	);

	const filterConfigs = [];

	const configs = pricingConfigsQuery.data?.data || [];

	return (
		<>
			<DataTable
				columns={columns}
				data={configs}
				isLoading={pricingConfigsQuery.isLoading}
				enableToolbar={true}
				searchKey="name"
				searchPlaceholder="Search pricing configurations..."
				filterConfigs={filterConfigs}
				enablePagination={true}
				pageSize={10}
				emptyState={
					<div className="py-8 text-center">
						<p className="text-muted-foreground">
							No pricing configurations found
						</p>
						<p className="text-muted-foreground text-sm">
							Create your first pricing configuration to get started
						</p>
					</div>
				}
			/>

			{editingConfig && (
				<EditPricingConfigDialog
					config={editingConfig}
					open={!!editingConfig}
					onOpenChange={(open) => !open && setEditingConfig(null)}
				/>
			)}

			{viewingConfig && (
				<ViewPricingConfigDialog
					config={viewingConfig}
					open={!!viewingConfig}
					onOpenChange={(open) => !open && setViewingConfig(null)}
				/>
			)}

			{deletingConfig && (
				<DeletePricingConfigDialog
					config={deletingConfig}
					open={!!deletingConfig}
					onOpenChange={(open) => !open && setDeletingConfig(null)}
				/>
			)}
		</>
	);
}
