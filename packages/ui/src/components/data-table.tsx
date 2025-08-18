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
	type RowSelectionState,
	type ColumnPinningState,
	type Column,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { Skeleton } from "./skeleton"
import { cn } from "../lib/utils"

export interface DataTableFilterOption {
	label: string
	value: string
	icon?: React.ComponentType<{ className?: string }>
}

export interface DataTableFilterConfig {
	columnId: string
	title: string
	options: DataTableFilterOption[]
}

export interface DataTableProps<TData, TValue> {
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
	rowSelectionState?: RowSelectionState
	onRowSelectionChange?: (selection: RowSelectionState) => void

	// Filtering and sorting
	enableSorting?: boolean
	enableFiltering?: boolean
	enableColumnFilters?: boolean
	filterConfigs?: DataTableFilterConfig[]

	// Toolbar options
	enableToolbar?: boolean
	searchKey?: string
	searchPlaceholder?: string

	// Visibility options
	enableColumnVisibility?: boolean

	// Column pinning options
	enableColumnPinning?: boolean
	initialColumnPinning?: ColumnPinningState
	onColumnPinningChange?: (pinning: ColumnPinningState) => void

	// Custom components
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
	onSortingChange?: (sorting: SortingState) => void
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void

	// Accessibility
	"aria-label"?: string
	"aria-describedby"?: string
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
	pageSizeOptions = [5, 10, 25, 50, 100],

	// Selection defaults
	enableRowSelection = false,
	enableMultiRowSelection = true,
	rowSelectionState,
	onRowSelectionChange,

	// Filtering and sorting defaults
	enableSorting = true,
	enableFiltering = true,
	enableColumnFilters = true,
	filterConfigs = [],

	// Toolbar defaults
	enableToolbar = false,
	searchKey,
	searchPlaceholder = "Search...",

	// Visibility defaults
	enableColumnVisibility = true,

	// Pinning defaults
	enableColumnPinning = true,
	initialColumnPinning = { left: [], right: [] },
	onColumnPinningChange,

	// Custom components
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
	onSortingChange,
	onColumnFiltersChange,

	// Accessibility
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
}: DataTableProps<TData, TValue>) {
	// State management
	const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)
	const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
	const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(initialColumnPinning)

	// Use controlled or uncontrolled row selection
	const rowSelection = rowSelectionState !== undefined ? rowSelectionState : internalRowSelection

	// Helper function to get pinning styles
	const getPinningStyles = React.useCallback((column: Column<TData>) => {
		const isPinned = column.getIsPinned()
		const isFirstPinned = isPinned === "left" && column.getStart("left") === 0
		const isLastPinned = isPinned === "right" && column.getAfter("right") === 0

		return {
			left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
			right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
			position: isPinned ? ("sticky" as const) : ("relative" as const),
			width: column.getSize(),
			zIndex: isPinned ? 1 : 0,
			boxShadow: isPinned && isFirstPinned
				? "4px 0 4px -2px rgba(0, 0, 0, 0.1)"
				: isPinned && isLastPinned
					? "-4px 0 4px -2px rgba(0, 0, 0, 0.1)"
					: "none"
		} as const
	}, [])

	const table = useReactTable<TData>({
		data: isLoading ? [] : data,
		columns,
		state: {
			...(enableSorting && { sorting }),
			...(enableColumnVisibility && { columnVisibility }),
			...(enableRowSelection && { rowSelection }),
			...(enableColumnFilters && { columnFilters }),
			...(enableColumnPinning && { columnPinning }),
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
		enableColumnPinning: enableColumnPinning,
		onRowSelectionChange: enableRowSelection
			? (updater) => {
				const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
				if (onRowSelectionChange) {
					onRowSelectionChange(newSelection)
				} else {
					setInternalRowSelection(newSelection)
				}
			}
			: undefined,
		onSortingChange: (updater) => {
			const newSorting = typeof updater === "function" ? updater(sorting) : updater
			setSorting(newSorting)
			onSortingChange?.(newSorting)
		},
		onColumnFiltersChange: (updater) => {
			const newFilters = typeof updater === "function" ? updater(columnFilters) : updater
			setColumnFilters(newFilters)
			onColumnFiltersChange?.(newFilters)
		},
		onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
		onColumnPinningChange: enableColumnPinning 
			? (updater) => {
				const newPinning = typeof updater === "function" ? updater(columnPinning) : updater
				setColumnPinning(newPinning)
				onColumnPinningChange?.(newPinning)
			}
			: undefined,
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
	const shouldShowToolbar = enableToolbar
	const shouldShowPagination = enablePagination

	return (
		<div className={cn(className)}>
			{shouldShowToolbar && (
				<DataTableToolbar
					table={table}
					searchKey={searchKey}
					searchPlaceholder={searchPlaceholder}
					filterConfigs={filterConfigs}
					disabled={isLoading}
				/>
			)}

			<div className={cn("rounded-md border bg-white", tableClassName)}>
				<div className="overflow-x-auto">
					<Table aria-label={ariaLabel} aria-describedby={ariaDescribedBy}>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const pinningStyles = enableColumnPinning ? getPinningStyles(header.column) : {}
									return (
										<TableHead 
											key={header.id} 
											colSpan={header.colSpan}
											style={pinningStyles}
											className={cn(header.column.getIsPinned() && "bg-background")}
										>
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
										className={row.getIsSelected() ? "bg-muted/50" : ""}
									>
										{row.getVisibleCells().map((cell) => {
											const pinningStyles = enableColumnPinning ? getPinningStyles(cell.column) : {}
											return (
												<TableCell 
													key={cell.id} 
													style={pinningStyles}
													className={cn(cell.column.getIsPinned() && "bg-background")}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											)
										})}
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
			</div>

			{shouldShowPagination && (
				<DataTablePagination table={table} pageSizeOptions={pageSizeOptions} disabled={isLoading} />
			)}
		</div>
	)
}