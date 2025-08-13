import * as React from "react"
import type { Table } from "@tanstack/react-table"

import { Button } from "./button"
import { Input } from "./input"
import { DataTableViewOptions } from "./data-table-view-options"
import { XIcon } from "lucide-react"
import type { DataTableFilterConfig } from "./data-table"

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	searchKey?: string
	searchPlaceholder?: string
	filterConfigs?: DataTableFilterConfig[]
	disabled?: boolean
	children?: React.ReactNode
}

export function DataTableToolbar<TData>({
	table,
	searchKey,
	searchPlaceholder = "Search...",
	filterConfigs = [],
	disabled = false,
	children,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{searchKey && (
					<Input
						placeholder={searchPlaceholder}
						value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
						onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
						className="h-8 w-[150px] lg:w-[250px]"
						disabled={disabled}
						aria-label={searchPlaceholder}
					/>
				)}
				
				{isFiltered && (
					<Button 
						variant="ghost" 
						onClick={() => table.resetColumnFilters()} 
						className="h-8 px-2 lg:px-3"
						disabled={disabled}
						aria-label="Clear all filters"
					>
						Reset
						<XIcon className="ml-2 h-4 w-4" />
					</Button>
				)}
				
				{children}
			</div>
			<div className="flex items-center space-x-2">
				<DataTableViewOptions table={table} disabled={disabled} />
			</div>
		</div>
	)
}