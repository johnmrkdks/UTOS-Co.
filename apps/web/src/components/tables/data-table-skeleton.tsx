import { Skeleton } from "@workspace/ui/components/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

interface DataTableSkeletonProps {
	columnCount: number
	rowCount?: number
	searchableColumnCount?: number
	filterableColumnCount?: number
	showPagination?: boolean
	cellWidths?: string[]
	className?: string
}

export function DataTableSkeleton({
	columnCount,
	rowCount = 10,
	searchableColumnCount = 0,
	filterableColumnCount = 0,
	showPagination = true,
	cellWidths = ["auto"],
	className,
}: DataTableSkeletonProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{/* Toolbar skeleton */}
			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					{searchableColumnCount > 0 && <Skeleton className="h-8 w-[150px] lg:w-[250px]" />}
					{filterableColumnCount > 0 &&
						Array.from({ length: filterableColumnCount }).map((_, i) => (
							<Skeleton key={i} className="h-8 w-[70px] border-dashed" />
						))}
				</div>
				<div className="flex items-center space-x-2">
					<Skeleton className="ml-auto h-8 w-[70px]" />
					<Skeleton className="h-8 w-[100px]" />
				</div>
			</div>

			{/* Table skeleton */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							{Array.from({ length: columnCount }).map((_, i) => (
								<TableHead key={i} style={{ width: cellWidths[i] || cellWidths[0] }}>
									<Skeleton className="h-6 w-full" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rowCount }).map((_, i) => (
							<TableRow key={i} className="hover:bg-transparent">
								{Array.from({ length: columnCount }).map((_, j) => (
									<TableCell key={j} style={{ width: cellWidths[j] || cellWidths[0] }}>
										<Skeleton className="h-6 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination skeleton */}
			{showPagination && (
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-[100px]" />
					<div className="flex items-center space-x-2">
						<Skeleton className="h-8 w-[100px]" />
						<div className="flex items-center space-x-1">
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
						</div>
						<Skeleton className="h-8 w-[100px]" />
					</div>
				</div>
			)}
		</div>
	)
}

