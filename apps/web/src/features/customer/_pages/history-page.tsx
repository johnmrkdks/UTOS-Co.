import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Calendar, Package, Car, Clock, MapPin, Users, CheckCircle, AlertTriangle, ArrowRightIcon, Loader2, Star, DollarSign, Search, Filter } from "lucide-react";
import { useUnifiedUserBookingsQuery } from "@/hooks/query/use-unified-user-bookings-query";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { BookingDetailsModal } from "@/features/customer/_components/booking-details-modal";
import { useNavigate } from "@tanstack/react-router";

export function CustomerHistoryPage() {
	const { session: sessionData, isPending: sessionLoading } = useUserQuery();
	const { data: bookingsData, isLoading, error } = useUnifiedUserBookingsQuery({
		limit: 100,
		offset: 0,
	})

	const bookings = bookingsData?.data || [];
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [sortBy, setSortBy] = useState<string>("date");
	const [filterBy, setFilterBy] = useState<string>("all");
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const handleViewDetails = (booking: any) => {
		if (isMobile) {
			// Navigate to full screen booking details page on mobile
			navigate({
				to: '/my-bookings/booking-details/$bookingId',
				params: { bookingId: booking.id }
			});
		} else {
			// Show modal on desktop/tablet
			setSelectedBooking(booking);
			setShowDetailsModal(true);
		}
	};

	const handleCloseDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedBooking(null);
	};

	// Helper functions
	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		})
	}

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		})
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed": return "bg-green-100 text-green-800";
			case "cancelled": return "bg-red-100 text-red-800";
			default: return "bg-gray-100 text-gray-800";
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "cancelled":
				return <AlertTriangle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	}

	// Filter and categorize bookings
	const categorizedBookings = useMemo(() => {
		const historicalBookings = bookings.filter(b =>
			["completed", "cancelled"].includes(b.status)
		);

		const completed = historicalBookings.filter(b => b.status === "completed");
		const cancelled = historicalBookings.filter(b => b.status === "cancelled");

		// Sort bookings
		const sortBookings = (bookings: any[]) => {
			return bookings.sort((a, b) => {
				switch (sortBy) {
					case "date":
						return new Date(b.scheduledPickupTime).getTime() - new Date(a.scheduledPickupTime).getTime();
					case "price":
						return (b.totalAmount || 0) - (a.totalAmount || 0);
					case "type":
						return a.bookingType.localeCompare(b.bookingType);
					default:
						return new Date(b.scheduledPickupTime).getTime() - new Date(a.scheduledPickupTime).getTime();
				}
			});
		};

		return {
			all: sortBookings(historicalBookings),
			completed: sortBookings(completed),
			cancelled: sortBookings(cancelled)
		};
	}, [bookings, sortBy]);

	// Calculate stats for completed bookings
	const stats = useMemo(() => {
		const completedBookings = categorizedBookings.completed;
		const totalSpent = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
		const averageSpent = completedBookings.length > 0 ? totalSpent / completedBookings.length : 0;

		return {
			totalTrips: completedBookings.length,
			totalSpent,
			averageSpent,
			cancelledTrips: categorizedBookings.cancelled.length
		};
	}, [categorizedBookings]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	const BookingHistoryCard = ({ booking }: { booking: any }) => (
		<Card key={booking.id} className="hover:shadow-md transition-shadow">
			<CardContent className="p-3 sm:p-4">
				<div className="flex items-start justify-between mb-2 sm:mb-3">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						{booking.bookingType === 'package' ? (
							<Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
						) : (
							<Car className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
						)}
						<span className="font-medium text-xs sm:text-sm truncate">
							{booking.bookingType === 'package' ? 'Service Package' : 'Custom Booking'}
						</span>
					</div>
					<Badge className={cn("text-xs flex-shrink-0", getStatusColor(booking.status))}>
						<span className="flex items-center gap-1">
							{getStatusIcon(booking.status)}
							{booking.status}
						</span>
					</Badge>
				</div>

				<div className="space-y-2 mb-3">
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium truncate">{booking.originAddress || booking.pickupAddress}</p>
							{booking.destinationAddress && (
								<>
									<div className="flex items-center gap-1 my-1">
										<div className="h-0.5 w-3 bg-muted-foreground/30"></div>
										<ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground truncate">{booking.destinationAddress}</p>
									{booking.stops && booking.stops.length > 0 && (
										<p className="text-xs text-muted-foreground mt-1">
											+{booking.stops.length} stop{booking.stops.length > 1 ? 's' : ''}
										</p>
									)}
								</>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
							<span>{formatDate(booking.scheduledPickupTime)}</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
							<span>{formatTime(booking.scheduledPickupTime)}</span>
						</div>
					</div>

					{booking.assignedDriver && booking.status === "completed" && (
						<div className="flex items-center gap-2 pt-2 border-t">
							<div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
								<Users className="h-3 w-3 text-green-600" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium">{booking.assignedDriver.name}</p>
								<p className="text-xs text-muted-foreground">Driver</p>
							</div>
							{/* Rating placeholder - could be enhanced with actual rating system */}
							<div className="flex items-center gap-1">
								<Star className="h-3 w-3 text-yellow-400 fill-current" />
								<span className="text-xs text-muted-foreground">5.0</span>
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-1">
						<DollarSign className="h-4 w-4 text-muted-foreground" />
						<span className="font-semibold text-sm sm:text-base">{formatPrice(booking.amount || 0)}</span>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={() => handleViewDetails(booking)}
							className="text-xs sm:text-sm h-8 px-2 sm:px-3"
						>
							View Details
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight">Booking History</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					View your completed and cancelled bookings
				</p>
			</div>


			{/* Filters and Sorting */}
			<div className="flex items-center gap-3">
				<Select value={sortBy} onValueChange={setSortBy}>
					<SelectTrigger className="w-32 sm:w-40">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="date">Date</SelectItem>
						<SelectItem value="price">Price</SelectItem>
						<SelectItem value="type">Type</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">
						All ({categorizedBookings.all.length})
					</TabsTrigger>
					<TabsTrigger value="completed">
						Completed ({categorizedBookings.completed.length})
					</TabsTrigger>
					<TabsTrigger value="cancelled">
						Cancelled ({categorizedBookings.cancelled.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					{categorizedBookings.all.length > 0 ? (
						<div className="grid gap-4">
							{categorizedBookings.all.map((booking) => (
								<BookingHistoryCard key={booking.id} booking={booking} />
							))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
								<h3 className="text-lg font-semibold mb-2">No booking history</h3>
								<p className="text-muted-foreground mb-4">You haven't completed any bookings yet.</p>
								<Button asChild>
									<a href="/services">Book Your First Service</a>
								</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="completed" className="space-y-4">
					{categorizedBookings.completed.length > 0 ? (
						<div className="grid gap-4">
							{categorizedBookings.completed.map((booking) => (
								<BookingHistoryCard key={booking.id} booking={booking} />
							))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
								<h3 className="text-lg font-semibold mb-2">No completed trips</h3>
								<p className="text-muted-foreground">You don't have any completed bookings yet.</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="cancelled" className="space-y-4">
					{categorizedBookings.cancelled.length > 0 ? (
						<div className="grid gap-4">
							{categorizedBookings.cancelled.map((booking) => (
								<BookingHistoryCard key={booking.id} booking={booking} />
							))}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
								<h3 className="text-lg font-semibold mb-2">No cancelled trips</h3>
								<p className="text-muted-foreground">You don't have any cancelled bookings.</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{/* Booking Details Modal */}
			<BookingDetailsModal
				booking={selectedBooking}
				isOpen={showDetailsModal}
				onClose={handleCloseDetailsModal}
			/>
		</div>
	);
}