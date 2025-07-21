import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import type { ColumnDef } from "@tanstack/react-table"
import type { CarBrand } from "server/types"

export const brandColumns: ColumnDef<CarBrand>[] = [
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
]
