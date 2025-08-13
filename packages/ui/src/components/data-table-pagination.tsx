import * as React from "react"
import type { Table } from "@tanstack/react-table"
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react"

import { Button } from "./button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select"

interface DataTablePaginationProps<TData> {
	table: Table<TData>
	pageSizeOptions?: number[]
	disabled?: boolean
}

export function DataTablePagination<TData>({
	table,
	pageSizeOptions = [10, 20, 25, 30, 40, 50, 100],
	disabled = false,
}: DataTablePaginationProps<TData>) {
	const currentPageSize = table.getState().pagination.pageSize
	const currentPageIndex = table.getState().pagination.pageIndex
	const totalRows = table.getFilteredRowModel().rows.length
	const pageCount = table.getPageCount()
	
	// Calculate the row range for the current page
	const startRow = currentPageIndex * currentPageSize + 1
	const endRow = Math.min((currentPageIndex + 1) * currentPageSize, totalRows)

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length > 0 && (
					<span>
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</span>
				)}
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={`${currentPageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value))
						}}
						disabled={disabled}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={currentPageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizeOptions.map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					{totalRows > 0 ? (
						<span>
							{startRow}-{endRow} of {totalRows}
						</span>
					) : (
						<span>0 of 0</span>
					)}
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {currentPageIndex + 1} of {Math.max(pageCount, 1)}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						className="hidden size-8 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage() || disabled}
						aria-label="Go to first page"
					>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage() || disabled}
						aria-label="Go to previous page"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage() || disabled}
						aria-label="Go to next page"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="hidden size-8 lg:flex"
						onClick={() => table.setPageIndex(pageCount - 1)}
						disabled={!table.getCanNextPage() || disabled}
						aria-label="Go to last page"
					>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}