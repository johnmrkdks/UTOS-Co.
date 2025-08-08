import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { MapPin, Clock, User, Wifi, WifiOff } from "lucide-react";
import { useWebSocketContext } from "@/contexts/websocket-context";
import { format } from "date-fns";

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
					<div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
						<WifiOff className="h-4 w-4" />
						Real-time updates disconnected. Status may not be current.
					</div>
				)}

				{bookingUpdate && (
					<div className="space-y-3">
						{bookingUpdate.message && (
							<div className="flex items-start gap-2">
								<Clock className="h-4 w-4 mt-0.5 text-blue-500" />
								<div>
									<p className="text-sm font-medium">Latest Update</p>
									<p className="text-sm text-gray-600">{bookingUpdate.message}</p>
								</div>
							</div>
						)}

						{bookingUpdate.driverId && (
							<div className="flex items-start gap-2">
								<User className="h-4 w-4 mt-0.5 text-green-500" />
								<div>
									<p className="text-sm font-medium">Driver Assigned</p>
									<p className="text-sm text-gray-600">Driver ID: {bookingUpdate.driverId}</p>
								</div>
							</div>
						)}

						{bookingUpdate.estimatedArrival && (
							<div className="flex items-start gap-2">
								<Clock className="h-4 w-4 mt-0.5 text-purple-500" />
								<div>
									<p className="text-sm font-medium">Estimated Arrival</p>
									<p className="text-sm text-gray-600">
										{format(new Date(bookingUpdate.estimatedArrival), "PPp")}
									</p>
								</div>
							</div>
						)}

						{driverLocation && (
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<MapPin className="h-4 w-4 mt-0.5 text-red-500" />
									<div>
										<p className="text-sm font-medium">Driver Location</p>
										<p className="text-sm text-gray-600">
											{driverLocation.location.address || 
												`${driverLocation.location.latitude.toFixed(6)}, ${driverLocation.location.longitude.toFixed(6)}`
											}
										</p>
										<p className="text-xs text-gray-500">
											Updated {format(new Date(driverLocation.timestamp), "HH:mm:ss")}
										</p>
									</div>
								</div>

								{(driverLocation.location.speed !== undefined || driverLocation.location.heading !== undefined) && (
									<div className="grid grid-cols-2 gap-2 text-xs">
										{driverLocation.location.speed !== undefined && (
											<div className="bg-gray-50 p-2 rounded">
												<span className="font-medium">Speed:</span> {driverLocation.location.speed} km/h
											</div>
										)}
										{driverLocation.location.heading !== undefined && (
											<div className="bg-gray-50 p-2 rounded">
												<span className="font-medium">Heading:</span> {driverLocation.location.heading}°
											</div>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{!bookingUpdate && isConnected && (
					<div className="text-sm text-gray-500 italic">
						Waiting for real-time updates...
					</div>
				)}

				<div className="pt-2 border-t">
					<div className="flex items-center justify-between text-xs text-gray-500">
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