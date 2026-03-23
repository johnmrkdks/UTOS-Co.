import { useNavigate, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertCircle,
	ArrowLeft,
	Calendar as CalendarIcon,
	Car,
	CheckCircle,
	CircleDot,
	Clock,
	DollarSign,
	Edit3,
	Loader2,
	Mail,
	MapPin,
	MessageSquare,
	Navigation,
	Package,
	Phone,
	Route,
	Timer,
	User,
	Users,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetBookingByIdQuery } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-get-booking-by-id-query";

export function BookingDetailsPage() {
	const params = useParams({ strict: false });
	const bookingId = (params as any).bookingId || "";
	const navigate = useNavigate();
	const { data: booking, isLoading, error } = useGetBookingByIdQuery(bookingId);

	// Helper functions
	const formatPrice = (priceInCents: number) =>
		`$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-800 border-green-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "driver_assigned":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "confirmed":
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "pending":
				return <Clock className="h-4 w-4" />;
			case "driver_assigned":
				return <User className="h-4 w-4" />;
			case "in_progress":
				return <Navigation className="h-4 w-4" />;
			case "cancelled":
				return <XCircle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<AlertCircle className="mb-4 h-12 w-12 text-red-500" />
				<h2 className="mb-2 font-semibold text-xl">Booking Not Found</h2>
				<p className="mb-4 text-muted-foreground">
					The requested booking could not be found.
				</p>
				<Button onClick={() => navigate({ to: "/my-bookings/trips" })}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Trips
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-white">
				<div className="flex items-center gap-3 p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: "/my-bookings/trips" })}
						className="p-2"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="flex flex-1 items-center gap-3">
						<h1 className="font-semibold text-lg">Booking Details</h1>
						<Badge
							className={cn("border text-xs", getStatusColor(booking.status))}
						>
							{getStatusIcon(booking.status)}
							<span className="ml-1 capitalize">
								{booking.status.replace("_", " ")}
							</span>
						</Badge>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4 p-4">
				{/* Basic Info */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Trip Information</CardTitle>
						<CardDescription className="text-xs">
							Booking Reference: {(booking as any).referenceNumber || "N/A"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Route */}
						<div className="space-y-2">
							<div className="flex items-start gap-3">
								<div className="mt-1 flex flex-col items-center">
									<CircleDot className="h-3 w-3 text-green-600" />
									<div className="my-1 h-6 w-px bg-muted-foreground/30" />
									<MapPin className="h-3 w-3 text-red-600" />
								</div>
								<div className="flex-1 space-y-3">
									<div>
										<p className="font-medium text-sm">From</p>
										<p className="text-muted-foreground text-sm">
											{booking.originAddress || (booking as any).pickupAddress}
										</p>
									</div>
									<div>
										<p className="font-medium text-sm">To</p>
										<p className="text-muted-foreground text-sm">
											{booking.destinationAddress ||
												(booking as any).dropoffAddress ||
												"Not specified"}
										</p>
									</div>
								</div>
							</div>
							{booking.stops && booking.stops.length > 0 && (
								<div className="mt-2 ml-6">
									<p className="text-muted-foreground text-xs">
										+{booking.stops.length} stop
										{booking.stops.length > 1 ? "s" : ""}
									</p>
								</div>
							)}
						</div>

						<Separator />

						{/* Date & Time */}
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<CalendarIcon className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-muted-foreground text-xs">Date</p>
									<p className="font-medium text-sm">
										{formatDate(booking.scheduledPickupTime)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-muted-foreground text-xs">Time</p>
									<p className="font-medium text-sm">
										{formatTime(booking.scheduledPickupTime)}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Customer Info */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Contact Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-3">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Email</p>
								<p className="text-sm">
									{booking.customerEmail ||
										booking.user?.email ||
										"Not provided"}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Users className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-xs">Passengers</p>
								<p className="text-sm">
									{booking.passengerCount || 1} passenger
									{(booking.passengerCount || 1) > 1 ? "s" : ""}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Pricing */}
				{(booking as any).amount && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Pricing Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm">Quoted Amount</span>
									<span className="font-semibold text-sm">
										{formatPrice((booking as any).amount)}
									</span>
								</div>
								{booking.baseFare && (
									<div className="flex justify-between text-muted-foreground text-sm">
										<span>Base Fare</span>
										<span>{formatPrice(booking.baseFare)}</span>
									</div>
								)}
								{booking.distanceFare && (
									<div className="flex justify-between text-muted-foreground text-sm">
										<span>Distance Fare</span>
										<span>{formatPrice(booking.distanceFare)}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Driver Info */}
				{(booking as any).assignedDriver && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Driver Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<User className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-muted-foreground text-xs">Driver</p>
									<p className="font-medium text-sm">
										{(booking as any).assignedDriver.name}
									</p>
								</div>
							</div>
							{(booking as any).assignedDriver.phoneNumber && (
								<div className="flex items-center gap-3">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-muted-foreground text-xs">Phone</p>
										<p className="text-sm">
											{(booking as any).assignedDriver.phoneNumber}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Booking Timeline */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Booking Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<div className="h-2 w-2 rounded-full bg-blue-500" />
								<div>
									<p className="font-medium text-sm">Created</p>
									<p className="text-muted-foreground text-xs">
										{booking.createdAt ? formatDate(booking.createdAt) : "N/A"}{" "}
										at{" "}
										{booking.createdAt ? formatTime(booking.createdAt) : "N/A"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Special Requests */}
				{booking.specialRequests && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Special Requests</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm">{booking.specialRequests}</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Bottom Actions */}
			<div className="fixed right-0 bottom-0 left-0 space-y-2 border-t bg-white p-4">
				<Button
					className="w-full"
					onClick={() => navigate({ to: "/my-bookings/trips" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to My Trips
				</Button>
			</div>
		</div>
	);
}
