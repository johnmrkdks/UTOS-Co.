import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
	MapPin,
	Clock,
	User,
	Phone,
	Mail,
	Car,
	Users,
	Calendar as CalendarIcon,
	DollarSign,
	Route,
	Timer,
	AlertCircle,
	CheckCircle,
	Package,
	MessageSquare,
	ArrowLeft,
	Edit3,
	XCircle,
	Loader2,
	CircleDot,
	Navigation,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useGetBookingByIdQuery } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-get-booking-by-id-query";

export function BookingDetailsPage() {
	const params = useParams({ strict: false });
	const bookingId = (params as any).bookingId || '';
	const navigate = useNavigate();
	const { data: booking, isLoading, error } = useGetBookingByIdQuery(bookingId);

	// Helper functions
	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric"
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed": return "bg-green-100 text-green-800 border-green-200";
			case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "driver_assigned": return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200";
			case "completed": return "bg-green-100 text-green-800 border-green-200";
			case "cancelled": return "bg-red-100 text-red-800 border-red-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
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
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
				<h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
				<p className="text-muted-foreground mb-4">The requested booking could not be found.</p>
				<Button onClick={() => navigate({ to: '/my-bookings/trips' })}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Trips
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b sticky top-0 z-10">
				<div className="flex items-center gap-3 p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: '/my-bookings/trips' })}
						className="p-2"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="flex items-center gap-3 flex-1">
						<h1 className="text-lg font-semibold">Booking Details</h1>
						<Badge className={cn("text-xs border", getStatusColor(booking.status))}>
							{getStatusIcon(booking.status)}
							<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
						</Badge>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 space-y-4">
				{/* Basic Info */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Trip Information</CardTitle>
						<CardDescription className="text-xs">
							Booking Reference: {(booking as any).referenceNumber || 'N/A'}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Route */}
						<div className="space-y-2">
							<div className="flex items-start gap-3">
								<div className="flex flex-col items-center mt-1">
									<CircleDot className="h-3 w-3 text-green-600" />
									<div className="w-px h-6 bg-muted-foreground/30 my-1" />
									<MapPin className="h-3 w-3 text-red-600" />
								</div>
								<div className="space-y-3 flex-1">
									<div>
										<p className="text-sm font-medium">From</p>
										<p className="text-sm text-muted-foreground">{booking.originAddress || (booking as any).pickupAddress}</p>
									</div>
									<div>
										<p className="text-sm font-medium">To</p>
										<p className="text-sm text-muted-foreground">{booking.destinationAddress || (booking as any).dropoffAddress || 'Not specified'}</p>
									</div>
								</div>
							</div>
							{booking.stops && booking.stops.length > 0 && (
								<div className="ml-6 mt-2">
									<p className="text-xs text-muted-foreground">
										+{booking.stops.length} stop{booking.stops.length > 1 ? 's' : ''}
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
									<p className="text-xs text-muted-foreground">Date</p>
									<p className="text-sm font-medium">{formatDate(booking.scheduledPickupTime)}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Time</p>
									<p className="text-sm font-medium">{formatTime(booking.scheduledPickupTime)}</p>
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
								<p className="text-xs text-muted-foreground">Email</p>
								<p className="text-sm">{booking.customerEmail || booking.user?.email || 'Not provided'}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Users className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Passengers</p>
								<p className="text-sm">{booking.passengerCount || 1} passenger{(booking.passengerCount || 1) > 1 ? 's' : ''}</p>
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
									<span className="text-sm font-semibold">{formatPrice((booking as any).amount)}</span>
								</div>
								{booking.baseFare && (
									<div className="flex justify-between text-sm text-muted-foreground">
										<span>Base Fare</span>
										<span>{formatPrice(booking.baseFare)}</span>
									</div>
								)}
								{booking.distanceFare && (
									<div className="flex justify-between text-sm text-muted-foreground">
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
									<p className="text-xs text-muted-foreground">Driver</p>
									<p className="text-sm font-medium">{(booking as any).assignedDriver.name}</p>
								</div>
							</div>
							{(booking as any).assignedDriver.phoneNumber && (
								<div className="flex items-center gap-3">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Phone</p>
										<p className="text-sm">{(booking as any).assignedDriver.phoneNumber}</p>
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
								<div className="h-2 w-2 bg-blue-500 rounded-full" />
								<div>
									<p className="text-sm font-medium">Created</p>
									<p className="text-xs text-muted-foreground">
										{booking.createdAt ? formatDate(booking.createdAt) : 'N/A'} at {booking.createdAt ? formatTime(booking.createdAt) : 'N/A'}
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
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
				<Button
					className="w-full"
					onClick={() => navigate({ to: '/my-bookings/trips' })}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to My Trips
				</Button>
			</div>
		</div>
	);
}