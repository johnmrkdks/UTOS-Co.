import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@workspace/ui/components/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { Car } from "server/types"
import { formatSQLiteDate } from "@/utils/formatter/format-sqlite-date"
import { CarsTableRowActions } from "./cars-table-row-actions"

export const carsTableColumns: ColumnDef<Car>[] = [
	{
		id: "image",
		accessorKey: "images",
		header: ({ column }) => (
			<DataTableColumnHeader className="ml-4" column={column} title="Image" />
		),
		cell: ({ row }) => {
			const images = row.getValue("images") as any[]
			const firstImage = images?.[0]
			return (
				<div className="ml-4">
					{firstImage ? (
						<img 
							src={firstImage.url} 
							alt="Car" 
							className="w-12 h-8 object-cover rounded"
						/>
					) : (
						<div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
							No Image
						</div>
					)}
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Car Name" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "brand",
		accessorKey: "model.brand.name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Brand" />
		),
		cell: ({ row }) => {
			const model = row.original.model as any
			return <div>{model?.brand?.name || 'N/A'}</div>
		},
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "model",
		accessorKey: "model.name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Model" />
		),
		cell: ({ row }) => {
			const model = row.original.model as any
			return <div>{model?.name || 'N/A'}</div>
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
		id: "isAvailable",
		accessorKey: "isAvailable",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Availability" />
		),
		cell: ({ row }) => {
			const isAvailable = row.getValue("isAvailable") as boolean
			return (
				<Badge variant={isAvailable ? "default" : "secondary"}>
					{isAvailable ? "Available" : "Unavailable"}
				</Badge>
			)
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
		cell: ({ row }) => <div>{row.getValue("year")}</div>,
		enableSorting: true,
		enableHiding: true,
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created At" />
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
			<DataTableColumnHeader className="flex justify-end mr-4" column={column} title="Actions" />
		),
		cell: ({ row }) => (
			<div className="flex justify-end mr-4">
				<CarsTableRowActions row={row} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
]