import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CarGridSkeleton() {
	return (
		<Card className="overflow-hidden">
			<div className="relative aspect-video">
				<Skeleton className="h-full w-full" />
			</div>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<Skeleton className="mb-2 h-5 w-3/4" />
						<Skeleton className="h-4 w-full" />
					</div>
					<Skeleton className="ml-2 h-5 w-16" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex justify-between">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-20" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-16" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Skeleton className="h-4 w-full" />
			</CardFooter>
		</Card>
	);
}
