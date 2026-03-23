import { createFileRoute, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	Car,
	Clock,
	Loader2,
	MapPin,
	MessageSquare,
	Phone,
	User,
} from "lucide-react";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import {
	BOOKING_STATUS_CONFIG,
	type BookingStatus,
} from "@/lib/booking-status-config";
import { formatDistanceKm } from "@/utils/format";

export const Route = createFileRoute("/_marketing/track/$token")({
	component: TrackBookingPage,
});

function TrackBookingPage() {
	const { token } = useParams({ from: "/_marketing/track/$token" });
	const {
		data: booking,
		isLoading,
		error,
	} = useGetBookingByShareTokenQuery(token);

	if (isLoading) {
		return (
			<div className="container flex min-h-[50vh] max-w-2xl flex-col items-center justify-center py-12">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading your booking...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="container flex min-h-[50vh] max-w-2xl flex-col items-center justify-center py-12">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 font-semibold text-xl">Booking not found</h2>
				<p className="mt-2 text-center text-muted-foreground">
					The share link may be invalid or expired. Please contact us if you
					need assistance.
				</p>
			</div>
		);
	}

	const statusConfig =
		BOOKING_STATUS_CONFIG[(booking.status as BookingStatus) ?? "pending"];
	const driver = booking.driver as
		| { phoneNumber?: string | null; user?: { phone?: string | null } }
		| undefined;
	const driverPhone = driver?.phoneNumber || driver?.user?.phone;

	return (
		<div className="container max-w-2xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-2xl">Track Your Booking</h1>
				<p className="mt-1 text-muted-foreground">
					Real-time status for your chauffeur service
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							{booking.referenceNumber || `#${booking.id.slice(-6)}`}
						</CardTitle>
						<Badge
							className={
								statusConfig?.bg +
								" " +
								statusConfig?.text +
								" " +
								statusConfig?.border
							}
						>
							{statusConfig?.shortLabel ?? booking.status}
						</Badge>
					</div>
					<CardDescription>{statusConfig?.description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Route */}
					<div className="space-y-3">
						<div className="flex gap-3">
							<MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Pickup
								</p>
								<p className="font-medium">{booking.originAddress}</p>
							</div>
						</div>
						<div className="flex gap-3">
							<MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Destination
								</p>
								<p className="font-medium">{booking.destinationAddress}</p>
							</div>
						</div>
					</div>

					{/* Time & Date */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex gap-2">
							<Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Date</p>
								<p className="font-medium">
									{format(new Date(booking.scheduledPickupTime), "PPP")}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Time</p>
								<p className="font-medium">
									{format(new Date(booking.scheduledPickupTime), "p")}
								</p>
							</div>
						</div>
					</div>

					{/* Driver & Vehicle (when assigned) */}
					{booking.driver && (
						<div className="space-y-3 border-t pt-4">
							<div className="flex gap-2">
								<User className="h-5 w-5 shrink-0 text-muted-foreground" />
								<div>
									<p className="text-muted-foreground text-sm">Driver</p>
									<p className="font-medium">
										{booking.driver.user?.name || "Assigned"}
									</p>
								</div>
							</div>
							{booking.car && (
								<div className="flex gap-2">
									<Car className="h-5 w-5 shrink-0 text-muted-foreground" />
									<div>
										<p className="text-muted-foreground text-sm">Vehicle</p>
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
										className="rounded-full border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
										onClick={() =>
											(window.location.href = `tel:${driverPhone}`)
										}
									>
										<Phone className="mr-1.5 h-4 w-4 text-green-600" />
										Call driver
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="rounded-full border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
										onClick={() =>
											(window.location.href = `sms:${driverPhone}`)
										}
									>
										<MessageSquare className="mr-1.5 h-4 w-4 text-blue-600" />
										Message driver
									</Button>
								</div>
							)}
						</div>
					)}

					{/* Fare */}
					<div className="flex items-center justify-between border-t pt-4">
						<span className="text-muted-foreground">Quoted Fare</span>
						<span className="font-bold text-xl">
							${(booking.quotedAmount ?? 0).toFixed(2)}
						</span>
					</div>
				</CardContent>
			</Card>

			<p className="mt-6 text-center text-muted-foreground text-sm">
				This page updates automatically. Refresh to see the latest status.
			</p>
		</div>
	);
}
