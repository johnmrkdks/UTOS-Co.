import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { format } from "date-fns";
import {
	AlertCircle,
	AlertTriangle,
	Bell,
	CheckCircle,
	Info,
	X,
} from "lucide-react";
import { useWebSocketContext } from "@/contexts/websocket-context";

export function RealTimeNotifications() {
	const { notifications, clearNotification, isConnected } =
		useWebSocketContext();

	const getIcon = (type: string) => {
		switch (type) {
			case "info":
				return <Info className="h-4 w-4 text-blue-500" />;
			case "warning":
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case "error":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			default:
				return <Bell className="h-4 w-4 text-gray-500" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "info":
				return "bg-blue-100 text-blue-800";
			case "warning":
				return "bg-yellow-100 text-yellow-800";
			case "error":
				return "bg-red-100 text-red-800";
			case "success":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Live Notifications
					</div>
					<Badge variant={isConnected ? "default" : "secondary"}>
						{notifications.length}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{!isConnected && (
					<div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-orange-600 text-sm">
						<AlertTriangle className="h-4 w-4" />
						Notifications may be delayed - connection lost
					</div>
				)}

				{notifications.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
						<p>No recent notifications</p>
						<p className="text-sm">System alerts will appear here</p>
					</div>
				) : (
					<ScrollArea className="h-[300px] pr-4">
						<div className="space-y-3">
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className="flex items-start gap-3 rounded-lg border bg-card p-3"
								>
									<div className="mt-0.5 flex-shrink-0">
										{getIcon(notification.type)}
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<div className="mb-1 flex items-center gap-2">
													<p className="font-medium text-sm">
														{notification.title}
													</p>
													<Badge
														variant="outline"
														className={`text-xs ${getTypeColor(notification.type)}`}
													>
														{notification.type}
													</Badge>
												</div>
												<p className="mb-2 text-muted-foreground text-sm">
													{notification.message}
												</p>
												<p className="text-muted-foreground text-xs">
													Just now
												</p>
											</div>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => clearNotification(notification.id)}
												className="h-6 w-6 flex-shrink-0 p-0"
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				)}

				{notifications.length > 0 && (
					<div className="flex justify-center border-t pt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								notifications.forEach((n) => clearNotification(n.id));
							}}
						>
							Clear All
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
