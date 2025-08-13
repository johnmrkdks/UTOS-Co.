import * as React from "react"
import type { Table } from "@tanstack/react-table"

import { Button } from "./button"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu"
import { Settings2Icon } from "lucide-react"

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>
	disabled?: boolean
}

export function DataTableViewOptions<TData>({ 
	table, 
	disabled = false 
}: DataTableViewOptionsProps<TData>) {
	const visibleColumns = table
		.getAllColumns()
		.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())

	if (visibleColumns.length === 0) {
		return null
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button 
					variant="outline" 
					size="sm" 
					className="ml-auto hidden h-8 lg:flex bg-transparent"
					disabled={disabled}
					aria-label="Toggle column visibility"
				>
					<Settings2Icon className="mr-2 h-4 w-4" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{visibleColumns.map((column) => {
					return (
						<DropdownMenuCheckboxItem
							key={column.id}
							className="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
						</DropdownMenuCheckboxItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}