import type * as React from "react"
import { DataTableSkeleton } from "./data-table-skeleton"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableLoadingWrapperProps<TData, TValue> {
	isLoading: boolean
	columns: ColumnDef<TData, TValue>[]
	loadingRowCount?: number
	enableToolbar?: boolean
	enablePagination?: boolean
	children: React.ReactNode
	className?: string
}

export function DataTableLoadingWrapper<TData, TValue>({
	isLoading,
	columns,
	loadingRowCount = 10,
	enableToolbar = false,
	enablePagination = true,
	children,
	className,
}: DataTableLoadingWrapperProps<TData, TValue>) {
	if (isLoading) {
		return (
			<DataTableSkeleton
				columnCount={columns.length}
				rowCount={loadingRowCount}
				searchableColumnCount={enableToolbar ? 1 : 0}
				filterableColumnCount={enableToolbar ? 2 : 0}
				showPagination={enablePagination}
				className={className}
			/>
		)
	}

	return <>{children}</>
}

