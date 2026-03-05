import { cn } from "@workspace/ui/lib/utils";
import { ReportCard } from "./report-card";
import {
	CheckCheckIcon,
	CircleDashedIcon,
	Clock3Icon,
	ListIcon,
} from "lucide-react";
import { useGetDashboardAnalyticsEnhancedQuery } from "@/features/dashboard/_hooks/query/use-get-dashboard-analytics-enhanced-query";

export function ReportCards({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	const { data: analyticsData, isLoading, error } = useGetDashboardAnalyticsEnhancedQuery();

	if (isLoading) {
		return (
			<div className={cn("flex flex-col gap-4", className)} {...props}>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={cn("text-destructive py-4", className)} {...props}>
				Failed to load report data
			</div>
		);
	}

	const totalBookings = analyticsData?.totalBookings ?? 0;
	const completedBookings = analyticsData?.completedBookings ?? 0;
	const pendingBookings = analyticsData?.pendingBookings ?? 0;
	const activeBookings = analyticsData?.activeBookings ?? 0;

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<ReportCard
					title="Completed Bookings"
					value={completedBookings}
					description="Total bookings completed"
					icon={CheckCheckIcon}
				/>
				<ReportCard
					title="Pending Bookings"
					value={pendingBookings}
					description="Awaiting confirmation"
					icon={CircleDashedIcon}
				/>
				<ReportCard
					title="Active Trips"
					description="Currently in progress"
					value={activeBookings}
					icon={Clock3Icon}
				/>
				<ReportCard
					title="Total Bookings"
					description="All time"
					value={totalBookings}
					icon={ListIcon}
				/>
			</div>
		</div>
	);
}
