import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import { format } from "date-fns";
import { MapPin, Clock, Car, User, Calendar, Loader2, AlertCircle, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/lib/booking-status-config";
import { formatDistanceKm } from "@/utils/format";

export const Route = createFileRoute("/_marketing/track/$token")({
	component: TrackBookingPage,
});

function TrackBookingPage() {
	const { token } = useParams({ from: "/_marketing/track/$token" });
	const { data: booking, isLoading, error } = useGetBookingByShareTokenQuery(token);

	if (isLoading) {
		return (
			<div className="container max-w-2xl py-12 flex flex-col items-center justify-center min-h-[50vh]">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading your booking...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="container max-w-2xl py-12 flex flex-col items-center justify-center min-h-[50vh]">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 text-xl font-semibold">Booking not found</h2>
				<p className="mt-2 text-muted-foreground text-center">
					The share link may be invalid or expired. Please contact us if you need assistance.
				</p>
			</div>
		);
	}

	const statusConfig = BOOKING_STATUS_CONFIG[(booking.status as BookingStatus) ?? "pending"];
	const driver = booking.driver as { phoneNumber?: string | null; user?: { phone?: string | null } } | undefined;
	const driverPhone = driver?.phoneNumber || driver?.user?.phone;

	return (
		<div className="container max-w-2xl py-8 px-4">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">Track Your Booking</h1>
				<p className="text-muted-foreground mt-1">
					Real-time status for your chauffeur service
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							{booking.referenceNumber || `#${booking.id.slice(-6)}`}
						</CardTitle>
						<Badge className={statusConfig?.bg + " " + statusConfig?.text + " " + statusConfig?.border}>
							{statusConfig?.shortLabel ?? booking.status}
						</Badge>
					</div>
					<CardDescription>{statusConfig?.description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Route */}
					<div className="space-y-3">
						<div className="flex gap-3">
							<MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Pickup</p>
								<p className="font-medium">{booking.originAddress}</p>
							</div>
						</div>
						<div className="flex gap-3">
							<MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Destination</p>
								<p className="font-medium">{booking.destinationAddress}</p>
							</div>
						</div>
					</div>

					{/* Time & Date */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex gap-2">
							<Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
							<div>
								<p className="text-sm text-muted-foreground">Date</p>
								<p className="font-medium">{format(new Date(booking.scheduledPickupTime), "PPP")}</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Clock className="h-5 w-5 text-muted-foreground shrink-0" />
							<div>
								<p className="text-sm text-muted-foreground">Time</p>
								<p className="font-medium">{format(new Date(booking.scheduledPickupTime), "p")}</p>
							</div>
						</div>
					</div>

					{/* Driver & Vehicle (when assigned) */}
					{booking.driver && (
						<div className="space-y-3 pt-4 border-t">
							<div className="flex gap-2">
								<User className="h-5 w-5 text-muted-foreground shrink-0" />
								<div>
									<p className="text-sm text-muted-foreground">Driver</p>
									<p className="font-medium">{booking.driver.user?.name || "Assigned"}</p>
								</div>
							</div>
							{booking.car && (
								<div className="flex gap-2">
									<Car className="h-5 w-5 text-muted-foreground shrink-0" />
									<div>
										<p className="text-sm text-muted-foreground">Vehicle</p>
										<p className="font-medium">{booking.car.name}</p>
									</div>
								</div>
							)}
							{/* Contact driver - call or message */}
							{driverPhone && (
								<div className="flex items-center gap-2 pt-2">
									<Button
										variant="outline"
										size="sm"
										className="rounded-full border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100"
										onClick={() => (window.location.href = `tel:${driverPhone}`)}
									>
										<Phone className="h-4 w-4 text-green-600 mr-1.5" />
										Call driver
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="rounded-full border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100"
										onClick={() => (window.location.href = `sms:${driverPhone}`)}
									>
										<MessageSquare className="h-4 w-4 text-blue-600 mr-1.5" />
										Message driver
									</Button>
								</div>
							)}
						</div>
					)}

					{/* Fare */}
					<div className="pt-4 border-t flex justify-between items-center">
						<span className="text-muted-foreground">Quoted Fare</span>
						<span className="text-xl font-bold">${(booking.quotedAmount ?? 0).toFixed(2)}</span>
					</div>
				</CardContent>
			</Card>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				This page updates automatically. Refresh to see the latest status.
			</p>
		</div>
	);
}
