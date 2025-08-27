import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MoreHorizontal, Pencil, Eye, Power } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useGetPricingConfigsQuery } from "../_hooks/query/use-get-pricing-configs-query";
import { useTogglePricingConfigActiveMutation } from "../_hooks/query/use-toggle-pricing-config-active-mutation";
import { useState, useMemo } from "react";
import { EditPricingConfigDialog } from "./edit-pricing-config-dialog";
import { ViewPricingConfigDialog } from "./view-pricing-config-dialog";
import type { ColumnDef } from "@tanstack/react-table";

interface PricingConfig {
	id: string;
	name: string;
	baseFare: number;
	pricePerKm: number;
	pricePerMinute: number | null;
	nightMultiplier: number | null;
	isActive: boolean | null;
	createdAt: string | null;
}

export function PricingConfigTable() {
	const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(null);
	const [viewingConfig, setViewingConfig] = useState<PricingConfig | null>(null);
	
	const pricingConfigsQuery = useGetPricingConfigsQuery({});
	const toggleActiveMutation = useTogglePricingConfigActiveMutation();

	const columns: ColumnDef<PricingConfig>[] = useMemo(() => [
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
			accessorKey: "baseFare",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Base Fare" />
			),
			cell: ({ row }) => {
				const baseFare = row.getValue("baseFare") as number;
				return <div>${baseFare?.toFixed(2) || "0.00"}</div>;
			},
		},
		{
			accessorKey: "pricePerKm",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Per KM" />
			),
			cell: ({ row }) => {
				const pricePerKm = row.getValue("pricePerKm") as number;
				return <div>${pricePerKm?.toFixed(2) || "0.00"}</div>;
			},
		},
		{
			accessorKey: "pricePerMinute",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Per Minute" />
			),
			cell: ({ row }) => {
				const pricePerMinute = row.getValue("pricePerMinute") as number;
				return <div>{pricePerMinute ? `$${pricePerMinute.toFixed(2)}` : "N/A"}</div>;
			},
		},
		{
			accessorKey: "nightMultiplier",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Night Multiplier" />
			),
			cell: ({ row }) => {
				const nightMultiplier = row.getValue("nightMultiplier") as number;
				return <div>{nightMultiplier ? `${nightMultiplier}x` : "1.0x"}</div>;
			},
		},
		{
			accessorKey: "isActive",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const isActive = row.getValue("isActive") as boolean;
				return (
					<Badge variant={isActive ? "default" : "secondary"}>
						{isActive ? "Active" : "Inactive"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id))
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
								onClick={() => toggleActiveMutation.mutate({ id: config.id })}
								disabled={toggleActiveMutation.isPending}
							>
								<Power className="mr-2 h-4 w-4" />
								{config.isActive ? "Deactivate" : "Activate"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	], [toggleActiveMutation.mutate, toggleActiveMutation.isPending, setEditingConfig, setViewingConfig]);

	const filterConfigs = [
		{
			columnId: "isActive",
			title: "Status",
			options: [
				{ label: "Active", value: "true" },
				{ label: "Inactive", value: "false" },
			],
		},
	];

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
					<div className="text-center py-8">
						<p className="text-muted-foreground">No pricing configurations found</p>
						<p className="text-sm text-muted-foreground">Create your first pricing configuration to get started</p>
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
		</>
	);
}