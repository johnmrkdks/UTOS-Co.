import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import { Clock, MapPin, User, Wifi, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useWebSocketContext } from "@/contexts/websocket-context";

interface RealTimeBookingStatusProps {
	bookingId: string;
	initialStatus?: string;
	onStatusUpdate?: (status: string, details: any) => void;
}

export function RealTimeBookingStatus({
	bookingId,
	initialStatus,
	onStatusUpdate,
}: RealTimeBookingStatusProps) {
	const {
		isConnected,
		bookingUpdates,
		driverLocations,
		subscribeToBooking,
		unsubscribeFromBooking,
		subscribeToDriver,
		unsubscribeFromDriver,
	} = useWebSocketContext();

	const bookingUpdate = bookingUpdates[bookingId];
	const currentStatus = bookingUpdate?.status || initialStatus || "pending";

	// Subscribe to booking updates on mount
	useEffect(() => {
		subscribeToBooking(bookingId);

		return () => {
			unsubscribeFromBooking(bookingId);
		};
	}, [bookingId, subscribeToBooking, unsubscribeFromBooking]);

	// Subscribe to driver location if driver is assigned
	useEffect(() => {
		if (bookingUpdate?.driverId) {
			subscribeToDriver(bookingUpdate.driverId);

			return () => {
				unsubscribeFromDriver(bookingUpdate.driverId!);
			};
		}
	}, [bookingUpdate?.driverId, subscribeToDriver, unsubscribeFromDriver]);

	// Notify parent component of status changes
	useEffect(() => {
		if (bookingUpdate && onStatusUpdate) {
			onStatusUpdate(bookingUpdate.status, bookingUpdate);
		}
	}, [bookingUpdate, onStatusUpdate]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "confirmed":
				return "bg-blue-100 text-blue-800";
			case "driver_assigned":
				return "bg-purple-100 text-purple-800";
			case "in_progress":
				return "bg-green-100 text-green-800";
			case "completed":
				return "bg-green-500 text-white";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const driverLocation = bookingUpdate?.driverId
		? driverLocations[bookingUpdate.driverId]
		: null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						Real-Time Status
						{isConnected ? (
							<Wifi className="h-4 w-4 text-green-500" />
						) : (
							<WifiOff className="h-4 w-4 text-red-500" />
						)}
					</div>
					<Badge className={getStatusColor(currentStatus)}>
						{currentStatus.replace("_", " ").toUpperCase()}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{!isConnected && (
					<div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-orange-600 text-sm">
						<WifiOff className="h-4 w-4" />
						Real-time updates disconnected. Status may not be current.
					</div>
				)}

				{bookingUpdate && (
					<div className="space-y-3">
						{bookingUpdate.message && (
							<div className="flex items-start gap-2">
								<Clock className="mt-0.5 h-4 w-4 text-blue-500" />
								<div>
									<p className="font-medium text-sm">Latest Update</p>
									<p className="text-gray-600 text-sm">
										{bookingUpdate.message}
									</p>
								</div>
							</div>
						)}

						{bookingUpdate.driverId && (
							<div className="flex items-start gap-2">
								<User className="mt-0.5 h-4 w-4 text-green-500" />
								<div>
									<p className="font-medium text-sm">Driver Assigned</p>
									<p className="text-gray-600 text-sm">
										Driver ID: {bookingUpdate.driverId}
									</p>
								</div>
							</div>
						)}

						{bookingUpdate.estimatedArrival && (
							<div className="flex items-start gap-2">
								<Clock className="mt-0.5 h-4 w-4 text-purple-500" />
								<div>
									<p className="font-medium text-sm">Estimated Arrival</p>
									<p className="text-gray-600 text-sm">
										{format(new Date(bookingUpdate.estimatedArrival), "PPp")}
									</p>
								</div>
							</div>
						)}

						{driverLocation && (
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<MapPin className="mt-0.5 h-4 w-4 text-red-500" />
									<div>
										<p className="font-medium text-sm">Driver Location</p>
										<p className="text-gray-600 text-sm">
											{driverLocation.location.address ||
												`${driverLocation.location.latitude.toFixed(6)}, ${driverLocation.location.longitude.toFixed(6)}`}
										</p>
										<p className="text-gray-500 text-xs">
											Updated{" "}
											{format(new Date(driverLocation.timestamp), "h:mm:ss a")}
										</p>
									</div>
								</div>

								{(driverLocation.location.speed !== undefined ||
									driverLocation.location.heading !== undefined) && (
									<div className="grid grid-cols-2 gap-2 text-xs">
										{driverLocation.location.speed !== undefined && (
											<div className="rounded bg-gray-50 p-2">
												<span className="font-medium">Speed:</span>{" "}
												{driverLocation.location.speed} km/h
											</div>
										)}
										{driverLocation.location.heading !== undefined && (
											<div className="rounded bg-gray-50 p-2">
												<span className="font-medium">Heading:</span>{" "}
												{driverLocation.location.heading}°
											</div>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{!bookingUpdate && isConnected && (
					<div className="text-gray-500 text-sm italic">
						Waiting for real-time updates...
					</div>
				)}

				<div className="border-t pt-2">
					<div className="flex items-center justify-between text-gray-500 text-xs">
						<span>Booking ID: {bookingId}</span>
						<span>
							Connection: {isConnected ? "Connected" : "Disconnected"}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
