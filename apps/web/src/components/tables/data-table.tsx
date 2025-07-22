import * as React from "react"
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	type PaginationState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableLoadingWrapper } from "./data-table-loading-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]

	// Loading state
	isLoading?: boolean
	loadingRowCount?: number

	// Pagination options
	enablePagination?: boolean
	pageSize?: number
	pageSizeOptions?: number[]

	// Selection options
	enableRowSelection?: boolean
	enableMultiRowSelection?: boolean

	// Filtering and sorting
	enableSorting?: boolean
	enableFiltering?: boolean
	enableColumnFilters?: boolean

	// Toolbar options
	enableToolbar?: boolean
	searchKey?: string
	searchPlaceholder?: string

	// Visibility options
	enableColumnVisibility?: boolean

	// Custom components
	ToolbarComponent?: React.ComponentType<any>
	PaginationComponent?: React.ComponentType<any>
	emptyState?: React.ReactNode
	loadingState?: React.ReactNode

	// Styling
	className?: string
	tableClassName?: string

	// Initial state
	initialSorting?: SortingState
	initialColumnFilters?: ColumnFiltersState
	initialColumnVisibility?: VisibilityState
	initialPagination?: Partial<PaginationState>

	// Callbacks
	onRowSelectionChange?: (selection: any) => void
	onSortingChange?: (sorting: SortingState) => void
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void
}

function TableRowSkeleton({ columnCount }: { columnCount: number }) {
	return (
		<TableRow className="hover:bg-transparent">
			{Array.from({ length: columnCount }).map((_, i) => (
				<TableCell key={i}>
					<Skeleton className="h-6 w-full" />
				</TableCell>
			))}
		</TableRow>
	)
}

export function DataTable<TData, TValue>({
	columns,
	data,

	// Loading defaults
	isLoading = false,
	loadingRowCount = 10,

	// Pagination defaults
	enablePagination = true,
	pageSize = 25,
	pageSizeOptions = [10, 25, 50, 100],

	// Selection defaults
	enableRowSelection = false,
	enableMultiRowSelection = true,

	// Filtering and sorting defaults
	enableSorting = true,
	enableFiltering = true,
	enableColumnFilters = true,

	// Toolbar defaults
	enableToolbar = false,
	searchKey,
	searchPlaceholder = "Search...",

	// Visibility defaults
	enableColumnVisibility = true,

	// Custom components
	ToolbarComponent,
	PaginationComponent,
	emptyState,
	loadingState,

	// Styling
	className = "flex flex-col gap-4",
	tableClassName = "rounded-md border",

	// Initial state
	initialSorting = [],
	initialColumnFilters = [],
	initialColumnVisibility = {},
	initialPagination = {},

	// Callbacks
	onRowSelectionChange,
	onSortingChange,
	onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)
	const [sorting, setSorting] = React.useState<SortingState>(initialSorting)

	const table = useReactTable<TData>({
		data: isLoading ? [] : data, // Use empty array when loading to prevent flash
		columns,
		state: {
			...(enableSorting && { sorting }),
			...(enableColumnVisibility && { columnVisibility }),
			...(enableRowSelection && { rowSelection }),
			...(enableColumnFilters && { columnFilters }),
		},
		initialState: {
			...(enablePagination && {
				pagination: {
					pageSize,
					...initialPagination,
				},
			}),
		},
		enableRowSelection: enableRowSelection,
		enableMultiRowSelection: enableMultiRowSelection,
		enableSorting: enableSorting,
		enableColumnFilters: enableColumnFilters,
		onRowSelectionChange: enableRowSelection
			? (updater) => {
				setRowSelection(updater)
				if (onRowSelectionChange) {
					const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
					onRowSelectionChange(newSelection)
				}
			}
			: undefined,
		onSortingChange: (updater) => {
			setSorting(updater)
			if (onSortingChange) {
				const newSorting = typeof updater === "function" ? updater(sorting) : updater
				onSortingChange(newSorting)
			}
		},
		onColumnFiltersChange: (updater) => {
			setColumnFilters(updater)
			if (onColumnFiltersChange) {
				const newFilters = typeof updater === "function" ? updater(columnFilters) : updater
				onColumnFiltersChange(newFilters)
			}
		},
		onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
		getCoreRowModel: getCoreRowModel(),
		...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
		...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
		...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
		...(enableColumnFilters && {
			getFacetedRowModel: getFacetedRowModel(),
			getFacetedUniqueValues: getFacetedUniqueValues(),
		}),
	})

	// Determine which components to render
	const shouldShowToolbar = ToolbarComponent || enableToolbar
	const shouldShowPagination = PaginationComponent || enablePagination
	const ToolbarToRender = ToolbarComponent || DataTableToolbar
	const PaginationToRender = PaginationComponent || DataTablePagination

	return (
		<DataTableLoadingWrapper
			isLoading={isLoading}
			columns={columns}
			loadingRowCount={loadingRowCount}
			enableToolbar={shouldShowToolbar}
			enablePagination={shouldShowPagination}
			className={className}
		>
			<div className={cn(className)}>
				{shouldShowToolbar && (
					<ToolbarToRender
						table={table}
						searchKey={searchKey}
						searchPlaceholder={searchPlaceholder}
						disabled={isLoading}
					/>
				)}

				<div className={cn("bg-white", tableClassName)}>
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										)
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								// Show skeleton rows when loading
								Array.from({ length: loadingRowCount }).map((_, i) => (
									<TableRowSkeleton key={i} columnCount={columns.length} />
								))
							) : table.getRowModel().rows?.length ? (
								// Show actual data
								table
									.getRowModel()
									.rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={enableRowSelection && row.getIsSelected() ? "selected" : undefined}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
											))}
										</TableRow>
									))
							) : (
								// Show empty state
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										{emptyState || "No results."}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{shouldShowPagination && (
					<PaginationToRender table={table} pageSizeOptions={pageSizeOptions} disabled={isLoading} />
				)}
			</div>
		</DataTableLoadingWrapper>
	)
}

