import { Badge } from "@workspace/ui/components/badge";
import {
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
	Activity,
	Car,
	CheckCircle,
	Clock,
	MapPin,
	TrendingUp,
	Users,
	Wifi,
} from "lucide-react";
import { DashboardChartCard } from "@/features/dashboard/_components/dashboard-chart-card";

interface AnalyticsData {
	activeBookings: number;
	activeDrivers: number;
	totalDrivers: number;
	monthlyRevenue: number;
	recentBookings: Array<{
		id: string;
		bookingType: string;
		customerName: string | null;
		originAddress: string | null;
		destinationAddress: string | null;
		status: string;
		totalAmount: number | null;
		createdAt: Date;
	}>;
}

interface RealTimeMetricsProps {
	analytics?: AnalyticsData | null;
}

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60),
	);
	if (diffInMinutes < 1) return "Just now";
	if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;
	return date.toLocaleDateString();
}

export function RealTimeMetrics({ analytics }: RealTimeMetricsProps) {
	const activeBookings = analytics?.activeBookings ?? 0;
	const activeDrivers = analytics?.activeDrivers ?? 0;
	const totalDrivers = analytics?.totalDrivers ?? 0;
	const monthlyRevenue = (analytics?.monthlyRevenue ?? 0) / 100;
	const recentBookings = analytics?.recentBookings ?? [];

	const metrics = [
		{ id: "1", label: "Active Bookings", value: String(activeBookings) },
		{
			id: "2",
			label: "Active Drivers",
			value: `${activeDrivers} of ${totalDrivers}`,
		},
		{
			id: "3",
			label: "This Month Revenue",
			value: `$${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
		},
	];

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "package":
				return <Car className="h-4 w-4 text-blue-500" />;
			case "custom":
				return <Car className="h-4 w-4 text-green-500" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			default:
				return <Activity className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "border-green-200 bg-green-50";
			case "cancelled":
				return "border-red-200 bg-red-50";
			case "confirmed":
			case "driver_assigned":
			case "in_progress":
				return "border-blue-200 bg-blue-50";
			default:
				return "border-gray-200 bg-muted/50";
		}
	};

	return (
		<div className="space-y-4">
			<DashboardChartCard>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Wifi className="h-5 w-5 text-green-500" />
						Live Dashboard
						<Badge
							variant="outline"
							className="border-green-200 bg-green-50 text-green-700"
						>
							Connected
						</Badge>
					</CardTitle>
				</CardHeader>
			</DashboardChartCard>

			<DashboardChartCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Live Metrics
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{metrics.map((metric) => (
						<div
							key={metric.id}
							className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
						>
							<div>
								<p className="font-medium text-sm">{metric.label}</p>
								<p className="text-muted-foreground text-xs">
									From analytics API
								</p>
							</div>
							<div className="text-right">
								<p className="font-bold text-lg">{metric.value}</p>
								<div className="flex items-center gap-1">
									<TrendingUp className="h-3 w-3 text-green-500 opacity-70" />
									<span className="text-muted-foreground text-xs">Live</span>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</DashboardChartCard>

			<DashboardChartCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Driver Status
						<Badge variant="outline">{activeDrivers} active</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex items-center justify-between rounded-lg border bg-card p-2">
							<div>
								<p className="font-medium text-sm">Active Drivers</p>
								<p className="text-muted-foreground text-xs">
									Currently available
								</p>
							</div>
							<span className="font-bold text-lg">{activeDrivers}</span>
						</div>
						<div className="flex items-center justify-between rounded-lg border bg-card p-2">
							<div>
								<p className="font-medium text-sm">Total Fleet</p>
								<p className="text-muted-foreground text-xs">All drivers</p>
							</div>
							<span className="font-bold text-lg">{totalDrivers}</span>
						</div>
					</div>
				</CardContent>
			</DashboardChartCard>

			<DashboardChartCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[250px] pr-2">
						<div className="space-y-2">
							{recentBookings.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No recent bookings.
								</p>
							) : (
								recentBookings.map((booking) => (
									<div
										key={booking.id}
										className={`flex items-start gap-3 rounded-lg border p-3 ${getStatusColor(booking.status)}`}
									>
										<div className="mt-0.5 flex-shrink-0">
											{getActivityIcon(booking.bookingType)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm">
												{booking.bookingType === "package"
													? `Package booking for ${booking.customerName || "Customer"}`
													: `Custom booking for ${booking.customerName || "Customer"}`}
											</p>
											{booking.originAddress && booking.destinationAddress && (
												<p className="mt-0.5 flex items-center gap-1 text-muted-foreground text-xs">
													<MapPin className="h-3 w-3" />
													{booking.originAddress} → {booking.destinationAddress}
												</p>
											)}
											<p className="mt-1 text-muted-foreground text-xs">
												{formatTimeAgo(new Date(booking.createdAt))} ·{" "}
												{booking.status}
												{booking.totalAmount != null && (
													<>
														{" "}
														· ${((booking.totalAmount ?? 0) / 100).toFixed(2)}
													</>
												)}
											</p>
										</div>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</CardContent>
			</DashboardChartCard>
		</div>
	);
}
