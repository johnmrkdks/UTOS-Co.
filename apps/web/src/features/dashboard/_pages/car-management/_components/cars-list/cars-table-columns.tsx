import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import { Badge } from "@workspace/ui/components/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { Car } from "server/types"
import { formatSQLiteDate } from "@/utils/formatter/format-sqlite-date"
import { CarsTableRowActions } from "./cars-table-row-actions"

export const carsTableColumns: ColumnDef<Car>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Car Name" />
		),
		cell: ({ row }) => {
			const car = row.original
			const model = car.model as any
			return (
				<div className="space-y-1">
					<div className="font-medium">{row.getValue("name")}</div>
					<div className="text-sm text-muted-foreground">
						{model?.brand?.name} {model?.name}
					</div>
				</div>
			)
		},
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "category",
		accessorKey: "category.name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Category" />
		),
		cell: ({ row }) => {
			const category = row.original.category as any
			return (
				<Badge variant="outline">
					{category?.name || 'Uncategorized'}
				</Badge>
			)
		},
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "pricePerDay",
		accessorKey: "pricePerDay",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Price/Day" />
		),
		cell: ({ row }) => {
			const price = row.getValue("pricePerDay") as number
			return (
				<div className="font-medium text-green-600">
					${price?.toLocaleString() || 0}
				</div>
			)
		},
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "availability",
		accessorKey: "isAvailable",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const isAvailable = row.getValue("isAvailable") as boolean
			const isActive = row.original.isActive as boolean
			const status = row.original.status as string

			// Determine overall status based on multiple factors
			let statusBadge;
			if (isActive && isAvailable && status === 'available') {
				statusBadge = <Badge variant="default" className="bg-green-500">Available</Badge>
			} else if (!isActive) {
				statusBadge = <Badge variant="secondary">Inactive</Badge>
			} else if (status === 'maintenance') {
				statusBadge = <Badge variant="destructive" className="bg-yellow-500">Maintenance</Badge>
			} else if (status === 'out_of_service') {
				statusBadge = <Badge variant="destructive">Out of Service</Badge>
			} else {
				statusBadge = <Badge variant="secondary">Unavailable</Badge>
			}

			return statusBadge
		},
		enableSorting: true,
		enableHiding: true,
	},
	{
		id: "year",
		accessorKey: "year",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Year" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("year")}</div>
		),
		enableSorting: true,
		enableHiding: true,
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created" />
		),
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{formatSQLiteDate(row.getValue("createdAt"))}
			</div>
		),
		enableSorting: true,
		enableHiding: true,
	},
	{
		id: "actions",
		accessorKey: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader className="flex justify-end" column={column} title="Actions" />
		),
		cell: ({ row }) => (
			<div className="flex justify-end">
				<CarsTableRowActions row={row} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
]