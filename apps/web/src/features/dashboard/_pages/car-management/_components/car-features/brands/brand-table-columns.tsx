import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import { Badge } from "@workspace/ui/components/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { CarBrandWithEnrichedData } from "server/types"
import { BrandTableRowActions } from "./brand-table-row-actions"
import { formatSQLiteDate } from "@/utils/formatter/format-sqlite-date"

export const brandTableColumns: ColumnDef<CarBrandWithEnrichedData>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader className="ml-4
				" column={column} title="Brand Name" />
		),
		cell: ({ row }) => <div className="ml-4">{row.getValue("name")}</div>,
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
			<div className=""><Badge variant="secondary">{Number(row.getValue("metadata.modelCount")).toLocaleString()} cars</Badge></div>
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
			<div className=""><Badge variant="outline">{Number(row.getValue("metadata.carsCount")).toLocaleString()} cars</Badge></div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created At" />
		),
		cell: ({ row }) => (
			<div className="">{formatSQLiteDate(row.getValue("createdAt"))}</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "updatedAt",
		accessorKey: "updatedAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Updated At" />
		),
		cell: ({ row }) => (
			<div className="">{new Date(row.getValue("updatedAt")).toLocaleDateString()}</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "actions",
		accessorKey: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader className="flex justify-end mr-4" column={column} title="Actions" />
		),
		cell: ({ row }) => (
			<div className="flex justify-end mr-4">
				<BrandTableRowActions row={row} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
]
