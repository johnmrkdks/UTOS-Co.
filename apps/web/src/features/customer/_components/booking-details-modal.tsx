import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import {
	MapPin,
	Clock,
	User,
	Phone,
	Mail,
	Car,
	Users,
	Calendar,
	DollarSign,
	Route,
	Timer,
	AlertCircle,
	CheckCircle,
	Package,
	MessageSquare,
	X,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface BookingDetailsModalProps {
	booking: any; // TODO: Add proper booking type
	isOpen: boolean;
	onClose: () => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
	if (!booking) return null;

	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(2)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: string | Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	const formatDistance = (meters: number) => {
		const km = meters / 1000;
		return `${km.toFixed(1)} km`;
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
			case "cancelled":
				return <AlertCircle className="h-4 w-4" />;
			case "driver_assigned":
				return <User className="h-4 w-4" />;
			case "in_progress":
				return <Car className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh]">
				<DialogHeader className="flex flex-row items-center justify-between">
					<div>
						<DialogTitle className="flex items-center gap-3">
							<span>Booking Details</span>
							<Badge className={cn("text-xs border", getStatusColor(booking.status))}>
								{getStatusIcon(booking.status)}
								<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
							</Badge>
						</DialogTitle>
						<DialogDescription>
							Booking ID: {booking.id}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto pr-4">
					<div className="space-y-6">
						{/* Service Type */}
						<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
							{booking.bookingType === "package" ? (
								<Package className="h-5 w-5 text-primary" />
							) : (
								<Route className="h-5 w-5 text-primary" />
							)}
							<div>
								<h3 className="font-semibold">
									{booking.bookingType === "package" ? "Premium Service Package" : "Custom Journey"}
								</h3>
								<p className="text-sm text-muted-foreground">
									{booking.bookingType === "package" ? "Pre-configured luxury service" : "Personalized route and service"}
								</p>
							</div>
						</div>

						{/* Route Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Route Details
							</h4>
							<div className="space-y-3">
								<div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0">
										<p className="text-sm font-medium text-green-900">Pickup Location</p>
										<p className="text-sm text-green-700">{booking.originAddress}</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
									<div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
									<div className="min-w-0">
										<p className="text-sm font-medium text-red-900">Destination</p>
										<p className="text-sm text-red-700">{booking.destinationAddress}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Schedule Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Schedule
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Date</p>
									<p className="font-semibold">{formatDate(booking.scheduledPickupTime)}</p>
								</div>
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
									<p className="font-semibold">{formatTime(booking.scheduledPickupTime)}</p>
								</div>
								{booking.estimatedDuration && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground">Estimated Duration</p>
										<p className="font-semibold">{formatDuration(booking.estimatedDuration)}</p>
									</div>
								)}
								{booking.estimatedDistance && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground">Estimated Distance</p>
										<p className="font-semibold">{formatDistance(booking.estimatedDistance)}</p>
									</div>
								)}
							</div>
						</div>

						{/* Customer Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<User className="h-4 w-4" />
								Customer Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground">Customer Name</p>
									<p className="font-semibold">{booking.customerName}</p>
								</div>
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Phone
									</p>
									<p className="font-semibold">{booking.customerPhone}</p>
								</div>
								{booking.customerEmail && (
									<div className="p-3 bg-muted/50 rounded-lg">
										<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
											<Mail className="h-3 w-3" />
											Email
										</p>
										<p className="font-semibold">{booking.customerEmail}</p>
									</div>
								)}
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
										<Users className="h-3 w-3" />
										Passengers
									</p>
									<p className="font-semibold">{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</p>
								</div>
							</div>
						</div>

						{/* Pricing Information */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Pricing Details
							</h4>
							<div className="space-y-3 p-4 bg-muted/50 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-sm">Quoted Amount</span>
									<span className="font-semibold">{formatPrice(booking.quotedAmount)}</span>
								</div>
								{booking.baseFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Base Fare</span>
										<span>{formatPrice(booking.baseFare)}</span>
									</div>
								)}
								{booking.distanceFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Distance Fare</span>
										<span>{formatPrice(booking.distanceFare)}</span>
									</div>
								)}
								{booking.timeFare && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Time Fare</span>
										<span>{formatPrice(booking.timeFare)}</span>
									</div>
								)}
								{booking.extraCharges > 0 && (
									<div className="flex justify-between items-center text-sm text-muted-foreground">
										<span>Extra Charges</span>
										<span>{formatPrice(booking.extraCharges)}</span>
									</div>
								)}
								{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
									<>
										<Separator />
										<div className="flex justify-between items-center font-semibold">
											<span>Final Amount</span>
											<span>{formatPrice(booking.finalAmount)}</span>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Special Requests */}
						{booking.specialRequests && (
							<div className="space-y-4">
								<h4 className="font-semibold flex items-center gap-2">
									<MessageSquare className="h-4 w-4" />
									Special Requests
								</h4>
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm">{booking.specialRequests}</p>
								</div>
							</div>
						)}

						{/* Timeline */}
						<div className="space-y-4">
							<h4 className="font-semibold flex items-center gap-2">
								<Timer className="h-4 w-4" />
								Booking Timeline
							</h4>
							<div className="space-y-3">
								<div className="flex items-center gap-3 text-sm">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span className="text-muted-foreground">Created:</span>
									<span>{formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}</span>
								</div>
								{booking.confirmedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-muted-foreground">Confirmed:</span>
										<span>{formatDate(booking.confirmedAt)} at {formatTime(booking.confirmedAt)}</span>
									</div>
								)}
								{booking.driverAssignedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
										<span className="text-muted-foreground">Driver Assigned:</span>
										<span>{formatDate(booking.driverAssignedAt)} at {formatTime(booking.driverAssignedAt)}</span>
									</div>
								)}
								{booking.serviceStartedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
										<span className="text-muted-foreground">Service Started:</span>
										<span>{formatDate(booking.serviceStartedAt)} at {formatTime(booking.serviceStartedAt)}</span>
									</div>
								)}
								{booking.serviceCompletedAt && (
									<div className="flex items-center gap-3 text-sm">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-muted-foreground">Service Completed:</span>
										<span>{formatDate(booking.serviceCompletedAt)} at {formatTime(booking.serviceCompletedAt)}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end pt-4 border-t">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}