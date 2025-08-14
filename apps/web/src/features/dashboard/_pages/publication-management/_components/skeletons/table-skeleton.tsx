import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

interface TableSkeletonProps {
	rows?: number;
	columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
	return (
		<div className="space-y-4">
			{/* Filters Skeleton */}
			<div className="flex items-center gap-4">
				<Skeleton className="flex-1 h-10" />
				<Skeleton className="w-[200px] h-10" />
			</div>

			{/* Stats Summary Skeleton */}
			<div className="grid grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
						<Skeleton className="h-8 w-12 mx-auto mb-2" />
						<Skeleton className="h-4 w-16 mx-auto" />
					</div>
				))}
			</div>

			{/* Table Skeleton */}
			<div className="border rounded-lg">
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