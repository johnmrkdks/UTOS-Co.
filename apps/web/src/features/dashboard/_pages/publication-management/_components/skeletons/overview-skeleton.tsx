import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

export function OverviewSkeleton() {
	return (
		<div className="space-y-6">
			{/* Main Stats Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16 mb-1" />
							<Skeleton className="h-3 w-20" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Charts Section Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-72" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[300px] w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[300px] w-full" />
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-56" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="flex items-center space-x-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-1">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-3 w-2/3" />
								</div>
								<Skeleton className="h-3 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}