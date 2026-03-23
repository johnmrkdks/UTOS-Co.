import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface TableSkeletonProps {
	rows?: number;
	columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
	return (
		<div className="space-y-4">
			{/* Filters Skeleton */}
			<div className="flex items-center gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-[200px]" />
			</div>

			{/* Stats Summary Skeleton */}
			<div className="grid grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="rounded-lg bg-gray-50 p-3 text-center">
						<Skeleton className="mx-auto mb-2 h-8 w-12" />
						<Skeleton className="mx-auto h-4 w-16" />
					</div>
				))}
			</div>

			{/* Table Skeleton */}
			<div className="rounded-lg border">
				{/* Header Skeleton */}
				<div className="border-b p-4">
					<div className="grid grid-cols-6 gap-4">
						{Array.from({ length: columns }).map((_, index) => (
							<Skeleton key={index} className="h-4 w-full" />
						))}
					</div>
				</div>

				{/* Rows Skeleton */}
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<div key={rowIndex} className="border-b p-4 last:border-b-0">
						<div className="grid grid-cols-6 gap-4">
							{Array.from({ length: columns }).map((_, colIndex) => (
								<div key={colIndex} className="space-y-2">
									<Skeleton className="h-4 w-full" />
									{colIndex === 0 && <Skeleton className="h-3 w-3/4" />}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
