import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@workspace/ui/components/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { CarFuelTypeWithEnrichedData } from "server/types"
import { FuelTypeTableRowActions } from "./fuel-type-table-row-actions"

export const fuelTypeTableColumns: ColumnDef<CarFuelTypeWithEnrichedData>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader className="ml-4
				" column={column} title="Fuel Type" />
		),
		cell: ({ row }) => <div className="ml-4">{row.getValue("name")}</div>,
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
			<div className="">{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
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
				<FuelTypeTableRowActions row={row} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
]
