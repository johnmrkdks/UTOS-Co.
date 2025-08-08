import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { 
	Activity, 
	Users, 
	Car, 
	Clock, 
	MapPin, 
	TrendingUp, 
	AlertCircle,
	CheckCircle,
	Wifi
} from "lucide-react";
import { useEffect, useState } from "react";

interface LiveMetric {
	id: string;
	label: string;
	value: string;
	change: string;
	status: "up" | "down" | "stable";
	lastUpdate: Date;
}

export function RealTimeMetrics() {
	const [metrics, setMetrics] = useState<LiveMetric[]>([
		{ id: "1", label: "Active Bookings", value: "12", change: "+2", status: "up", lastUpdate: new Date() },
		{ id: "2", label: "Available Drivers", value: "24", change: "-1", status: "down", lastUpdate: new Date() },
		{ id: "3", label: "Avg Wait Time", value: "4.2 min", change: "-0.3", status: "up", lastUpdate: new Date() },
		{ id: "4", label: "Current Revenue", value: "$2,847", change: "+$180", status: "up", lastUpdate: new Date() },
	]);

	const [activeDrivers] = useState([
		{ id: "DRV001", name: "Driver Alpha", status: "en_route", location: "CBD", booking: "BKG123" },
		{ id: "DRV002", name: "Driver Beta", status: "available", location: "Airport", booking: null },
		{ id: "DRV003", name: "Driver Gamma", status: "busy", location: "North Shore", booking: "BKG124" },
		{ id: "DRV004", name: "Driver Delta", status: "available", location: "Eastern Suburbs", booking: null },
		{ id: "DRV005", name: "Driver Echo", status: "en_route", location: "Inner West", booking: "BKG125" },
	]);

	const [recentActivity] = useState([
		{ id: "1", type: "booking", message: "New booking #BKG126 created", time: "2 min ago", status: "success" },
		{ id: "2", type: "driver", message: "Driver Beta became available", time: "5 min ago", status: "info" },
		{ id: "3", type: "completion", message: "Booking #BKG120 completed successfully", time: "8 min ago", status: "success" },
		{ id: "4", type: "alert", message: "Driver Charlie reported traffic delay", time: "12 min ago", status: "warning" },
		{ id: "5", type: "booking", message: "Booking #BKG119 cancelled by customer", time: "15 min ago", status: "error" },
	]);

	// Simulate real-time updates
	useEffect(() => {
		const interval = setInterval(() => {
			setMetrics(prevMetrics => 
				prevMetrics.map(metric => ({
					...metric,
					lastUpdate: new Date(),
					// Randomly update values to simulate real-time changes
					value: metric.id === "1" ? `${Math.floor(Math.random() * 5) + 10}` : metric.value,
				}))
			);
		}, 10000); // Update every 10 seconds

		return () => clearInterval(interval);
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "available":
				return "bg-green-100 text-green-800";
			case "busy":
				return "bg-red-100 text-red-800";
			case "en_route":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "booking":
				return <Car className="h-4 w-4 text-blue-500" />;
			case "driver":
				return <Users className="h-4 w-4 text-green-500" />;
			case "completion":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "alert":
				return <AlertCircle className="h-4 w-4 text-orange-500" />;
			default:
				return <Activity className="h-4 w-4 text-gray-500" />;
		}
	};

	const getActivityColor = (status: string) => {
		switch (status) {
			case "success":
				return "border-green-200 bg-green-50";
			case "warning":
				return "border-orange-200 bg-orange-50";
			case "error":
				return "border-red-200 bg-red-50";
			default:
				return "border-blue-200 bg-blue-50";
		}
	};

	return (
		<div className="space-y-4">
			{/* Live Connection Status */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Wifi className="h-5 w-5 text-green-500" />
						Live Dashboard
						<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
							Connected
						</Badge>
					</CardTitle>
				</CardHeader>
			</Card>

			{/* Real-time Metrics */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Live Metrics
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{metrics.map((metric) => (
						<div key={metric.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
							<div>
								<p className="text-sm font-medium">{metric.label}</p>
								<p className="text-xs text-muted-foreground">
									Updated {Math.floor((Date.now() - metric.lastUpdate.getTime()) / 1000)}s ago
								</p>
							</div>
							<div className="text-right">
								<p className="text-lg font-bold">{metric.value}</p>
								<div className="flex items-center gap-1">
									{metric.status === "up" ? (
										<TrendingUp className="h-3 w-3 text-green-500" />
									) : (
										<TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
									)}
									<span className={`text-xs font-medium ${
										metric.status === "up" ? "text-green-600" : "text-red-600"
									}`}>
										{metric.change}
									</span>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Active Drivers */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Car className="h-5 w-5" />
						Driver Status
						<Badge variant="outline">{activeDrivers.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[200px] pr-2">
						<div className="space-y-2">
							{activeDrivers.map((driver) => (
								<div key={driver.id} className="flex justify-between items-center p-2 rounded-lg border bg-card">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-green-500"></div>
										<div>
											<p className="text-sm font-medium">{driver.name}</p>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<MapPin className="h-3 w-3" />
												{driver.location}
											</div>
										</div>
									</div>
									<div className="text-right">
										<Badge variant="outline" className={getStatusColor(driver.status)}>
											{driver.status.replace("_", " ")}
										</Badge>
										{driver.booking && (
											<p className="text-xs text-muted-foreground mt-1">
												{driver.booking}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			{/* Recent Activity Feed */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[250px] pr-2">
						<div className="space-y-2">
							{recentActivity.map((activity) => (
								<div 
									key={activity.id} 
									className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.status)}`}
								>
									<div className="flex-shrink-0 mt-0.5">
										{getActivityIcon(activity.type)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{activity.message}</p>
										<p className="text-xs text-muted-foreground">{activity.time}</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			{/* System Health */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						System Health
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm">API Response Time</span>
						<div className="flex items-center gap-2">
							<Progress value={85} className="w-16 h-1" />
							<span className="text-sm font-medium">145ms</span>
						</div>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm">Database Performance</span>
						<div className="flex items-center gap-2">
							<Progress value={92} className="w-16 h-1" />
							<span className="text-sm font-medium">92%</span>
						</div>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm">WebSocket Connections</span>
						<div className="flex items-center gap-2">
							<Progress value={100} className="w-16 h-1" />
							<span className="text-sm font-medium">Active</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}