import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { CarBrandWithEnrichedData } from "server/types"
import { BrandTableRowActions } from "./brand-table-row-actions"

export const brandTableColumns: ColumnDef<CarBrandWithEnrichedData>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Brand Name" />
		),
		cell: ({ row }) => <div className="w-[80px]">{row.getValue("name")}</div>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "metadata.modelCount",
		accessorKey: "metadata.modelCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Model Count" />
		),
		cell: ({ row }) => (
			<div className="w-[80px]"><Badge variant="secondary">{Number(row.getValue("metadata.modelCount")).toLocaleString()} cars</Badge></div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "metadata.carsCount",
		accessorKey: "metadata.carsCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Car Count" />
		),
		cell: ({ row }) => (
			<div className="w-[80px]"><Badge variant="outline">{Number(row.getValue("metadata.carsCount")).toLocaleString()} cars</Badge></div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "actions",
		accessorKey: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Actions" />
		),
		cell: ({ row }) => <BrandTableRowActions row={row} />,
		enableSorting: false,
		enableHiding: false,
	},
]
