import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { useGetBookingByIdQuery } from "../_hooks/query/use-get-booking-by-id-query";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useAssignDriverMutation } from "../_hooks/query/use-assign-driver-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { format } from "date-fns";
import {
	User,
	Phone,
	Mail,
	MapPin,
	Clock,
	Car,
	DollarSign,
	Package,
	Route,
	Calendar,
	Users,
	UserPlus,
	Navigation,
	CheckCircle,
	AlertCircle,
	Timer,
	TrendingUp,
	CreditCard,
	Edit3,
	X
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const statusOptions = [
	{ value: "pending", label: "Pending", color: "warning", icon: Timer, description: "Awaiting confirmation" },
	{ value: "confirmed", label: "Confirmed", color: "success", icon: CheckCircle, description: "Booking confirmed" },
	{ value: "driver_assigned", label: "Driver Assigned", color: "info", icon: UserPlus, description: "Driver ready" },
	{ value: "in_progress", label: "In Progress", color: "primary", icon: Navigation, description: "Service active" },
	{ value: "completed", label: "Completed", color: "success", icon: CheckCircle, description: "Service complete" },
	{ value: "cancelled", label: "Cancelled", color: "destructive", icon: X, description: "Booking cancelled" },
];

const getStatusProgress = (status: string): number => {
	switch (status) {
		case "pending": return 20;
		case "confirmed": return 40;
		case "driver_assigned": return 60;
		case "in_progress": return 80;
		case "completed": return 100;
		case "cancelled": return 0;
		default: return 0;
	}
};

export function BookingDetailsDialog() {
	const {
		isBookingDetailsDialogOpen,
		closeBookingDetailsDialog,
		selectedBookingId
	} = useBookingManagementModalProvider();

	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] = useState(false);

	const bookingQuery = useGetBookingByIdQuery(
		{ id: selectedBookingId! },
		!!selectedBookingId
	);

	const updateStatusMutation = useUpdateBookingStatusMutation();
	const assignDriverMutation = useAssignDriverMutation();

	const handleStatusUpdate = (newStatus: string) => {
		if (!selectedBookingId || !newStatus) return;

		updateStatusMutation.mutate({
			id: selectedBookingId,
			status: newStatus as any,
		});
	};

	const booking = bookingQuery.data;

	// Debug booking data
	console.log("📋 Dialog state:", { 
		isOpen: isBookingDetailsDialogOpen, 
		selectedBookingId, 
		bookingData: booking,
		isLoading: bookingQuery.isLoading,
		error: bookingQuery.error
	});
	console.log("📋 Has driverId:", booking?.driverId);
	console.log("📋 Assign driver dialog open:", isAssignDriverDialogOpen);

	if (!booking) return null;

	const currentStatus = statusOptions.find(s => s.value === booking.status);
	const StatusIcon = currentStatus?.icon || Timer;

	return (
		<>
			<Dialog open={isBookingDetailsDialogOpen} onOpenChange={closeBookingDetailsDialog}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
				{/* Header with gradient background */}
				<div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 -mx-6 -mt-6 mb-6">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<div className="bg-white/20 p-3 rounded-xl">
								<StatusIcon className="h-8 w-8" />
							</div>
							<div>
								<div className="flex items-center gap-3 mb-2">
									<h2 className="text-2xl font-bold">Booking Details</h2>
									<Badge 
										variant={booking.bookingType === "package" ? "default" : "secondary"}
										className="bg-white/20 text-white border-white/30 hover:bg-white/30"
									>
										{booking.bookingType === "package" ? "Package" : "Custom"}
									</Badge>
								</div>
								<p className="text-blue-100 text-sm font-mono">
									{booking.id}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<Badge 
										variant={currentStatus?.color as any || "secondary"}
										className="bg-white text-gray-800 hover:bg-gray-100"
									>
										{booking.status.replace("_", " ").toUpperCase()}
									</Badge>
									<span className="text-blue-100 text-sm">{currentStatus?.description}</span>
								</div>
							</div>
						</div>
						<div className="text-right">
							<div className="text-3xl font-bold">
								${(booking.quotedAmount / 100).toFixed(2)}
							</div>
							<div className="text-blue-100 text-sm">Total Amount</div>
						</div>
					</div>
					
					{/* Status Progress Bar */}
					<div className="mt-6">
						<div className="flex justify-between text-sm text-blue-100 mb-2">
							<span>Progress</span>
							<span>{getStatusProgress(booking.status)}%</span>
						</div>
						<Progress 
							value={getStatusProgress(booking.status)} 
							className="bg-white/20 [&>div]:bg-white"
						/>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto max-h-[calc(95vh-280px)]">

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main booking details */}
						<div className="lg:col-span-2 space-y-6">
							{/* Customer Information */}
							<Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-200">
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center gap-3 text-lg">
										<div className="bg-blue-100 p-2 rounded-lg">
											<User className="h-5 w-5 text-blue-600" />
										</div>
										Customer Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4 mb-6">
										<Avatar className="h-16 w-16">
											<AvatarImage src="" alt={booking.customerName} />
											<AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
												{booking.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<h3 className="font-bold text-xl text-gray-900 mb-1">{booking.customerName}</h3>
											<div className="flex items-center gap-1 text-blue-600 mb-1">
												<Users className="h-4 w-4" />
												<span className="font-medium">{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</span>
											</div>
										</div>
									</div>
									
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="bg-gray-50 p-4 rounded-lg">
											<div className="flex items-center gap-2 mb-2">
												<Phone className="h-4 w-4 text-green-600" />
												<span className="text-sm font-medium text-gray-600">Phone</span>
											</div>
											<a href={`tel:${booking.customerPhone}`} className="font-semibold text-gray-900 hover:text-blue-600">
												{booking.customerPhone}
											</a>
										</div>
										{booking.customerEmail && (
											<div className="bg-gray-50 p-4 rounded-lg">
												<div className="flex items-center gap-2 mb-2">
													<Mail className="h-4 w-4 text-blue-600" />
													<span className="text-sm font-medium text-gray-600">Email</span>
												</div>
												<a href={`mailto:${booking.customerEmail}`} className="font-semibold text-gray-900 hover:text-blue-600">
													{booking.customerEmail}
												</a>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Route Information */}
							<Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-200">
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center gap-3 text-lg">
										<div className="bg-green-100 p-2 rounded-lg">
											<Navigation className="h-5 w-5 text-green-600" />
										</div>
										Route Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Journey Path */}
									<div className="relative">
										{/* Pickup */}
										<div className="flex items-start gap-4 mb-8">
											<div className="relative">
												<div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
													<MapPin className="h-5 w-5" />
												</div>
											</div>
											<div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-200">
												<div className="text-sm font-semibold text-green-700 mb-1">PICKUP LOCATION</div>
												<div className="font-medium text-gray-900">{booking.originAddress}</div>
											</div>
										</div>
										
										{/* Connecting Line */}
										<div className="absolute left-6 top-16 bottom-4 w-0.5 bg-gradient-to-b from-green-500 to-red-500"></div>
										
										{/* Destination */}
										<div className="flex items-start gap-4">
											<div className="relative">
												<div className="bg-red-500 text-white p-3 rounded-full shadow-lg">
													<MapPin className="h-5 w-5" />
												</div>
											</div>
											<div className="flex-1 bg-red-50 p-4 rounded-lg border border-red-200">
												<div className="text-sm font-semibold text-red-700 mb-1">DESTINATION</div>
												<div className="font-medium text-gray-900">{booking.destinationAddress}</div>
											</div>
										</div>
									</div>
									
									{/* Trip Stats */}
									{booking.estimatedDistance && (
										<div className="grid grid-cols-2 gap-4 mt-6">
											<div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
												<div className="text-2xl font-bold text-blue-600">
													{(booking.estimatedDistance / 1000).toFixed(1)}
												</div>
												<div className="text-sm font-medium text-blue-700">Kilometers</div>
											</div>
											{booking.estimatedDuration && (
												<div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
													<div className="text-2xl font-bold text-purple-600">
														{Math.round(booking.estimatedDuration / 60)}
													</div>
													<div className="text-sm font-medium text-purple-700">Minutes</div>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Schedule Information */}
							<Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-200">
								<CardHeader className="pb-4">
									<CardTitle className="flex items-center gap-3 text-lg">
										<div className="bg-orange-100 p-2 rounded-lg">
											<Calendar className="h-5 w-5 text-orange-600" />
										</div>
										Schedule Timeline
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Scheduled Pickup */}
									<div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
										<div className="flex items-center gap-3 mb-2">
											<Clock className="h-5 w-5 text-orange-600" />
											<span className="font-semibold text-orange-700">SCHEDULED PICKUP</span>
										</div>
										<div className="text-lg font-bold text-gray-900 mb-1">
											{format(new Date(booking.scheduledPickupTime), "EEEE, MMMM do")}
										</div>
										<div className="text-2xl font-bold text-orange-600">
											{format(new Date(booking.scheduledPickupTime), "h:mm a")}
										</div>
									</div>
									
									{/* Actual Times */}
									{(booking.actualPickupTime || booking.actualDropoffTime) && (
										<div className="space-y-3">
											<Separator />
											<div className="text-sm font-semibold text-gray-600 mb-3">ACTUAL SERVICE TIMES</div>
											
											{booking.actualPickupTime && (
												<div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
													<div className="flex items-center gap-2">
														<CheckCircle className="h-4 w-4 text-green-600" />
														<span className="font-medium text-green-700">Picked Up</span>
													</div>
													<span className="font-bold text-gray-900">
														{format(new Date(booking.actualPickupTime), "MMM dd, h:mm a")}
													</span>
												</div>
											)}
											
											{booking.actualDropoffTime && (
												<div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
													<div className="flex items-center gap-2">
														<CheckCircle className="h-4 w-4 text-blue-600" />
														<span className="font-medium text-blue-700">Completed</span>
													</div>
													<span className="font-bold text-gray-900">
														{format(new Date(booking.actualDropoffTime), "MMM dd, h:mm a")}
													</span>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Vehicle Information */}
							{booking.car && (
								<Card className="border-l-4 border-l-indigo-500 shadow-lg hover:shadow-xl transition-shadow duration-200">
									<CardHeader className="pb-4">
										<CardTitle className="flex items-center gap-3 text-lg">
											<div className="bg-indigo-100 p-2 rounded-lg">
												<Car className="h-5 w-5 text-indigo-600" />
											</div>
											Assigned Vehicle
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 text-center">
											<div className="text-3xl mb-4">🚗</div>
											<div className="text-xl font-bold text-gray-900 mb-2">{booking.car.name}</div>
											<div className="text-sm text-indigo-600 font-medium">Luxury Vehicle</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Special Requests */}
							{booking.specialRequests && (
								<Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow duration-200">
									<CardHeader className="pb-4">
										<CardTitle className="flex items-center gap-3 text-lg">
											<div className="bg-yellow-100 p-2 rounded-lg">
												<AlertCircle className="h-5 w-5 text-yellow-600" />
											</div>
											Special Requests
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
											<p className="text-gray-800 font-medium leading-relaxed">{booking.specialRequests}</p>
										</div>
									</CardContent>
								</Card>
							)}
					</div>

						{/* Status and pricing sidebar */}
						<div className="lg:col-span-1 space-y-6">
							{/* Status Management */}
							<Card className="shadow-xl border-t-4 border-t-blue-500">
								<CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Edit3 className="h-5 w-5 text-blue-600" />
										Booking Management
									</CardTitle>
									<CardDescription className="text-gray-600">
										Update status and manage assignments
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6 pt-6">
									{/* Current Status Display */}
									<div className="text-center">
										<div className="text-sm font-medium text-gray-600 mb-3">CURRENT STATUS</div>
										<div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
											<div className="flex items-center justify-center gap-3 mb-2">
												<StatusIcon className="h-6 w-6 text-blue-600" />
												<Badge 
													variant={currentStatus?.color as any || "secondary"}
													className="text-sm px-3 py-1"
												>
													{booking.status.replace("_", " ").toUpperCase()}
												</Badge>
											</div>
											<div className="text-sm text-gray-500">{currentStatus?.description}</div>
										</div>
									</div>

									<Separator className="my-6" />

									{/* Status Update Section */}
									<div className="space-y-4">
										<div className="text-center">
											<div className="text-sm font-semibold text-gray-700 mb-3">UPDATE STATUS</div>
										</div>
										<Select value={selectedStatus} onValueChange={setSelectedStatus}>
											<SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300">
												<SelectValue placeholder="Choose new status" />
											</SelectTrigger>
											<SelectContent>
												{statusOptions.map((status) => {
													const Icon = status.icon;
													return (
														<SelectItem key={status.value} value={status.value}>
															<div className="flex items-center gap-2">
																<Icon className="h-4 w-4" />
																<span>{status.label}</span>
															</div>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										<Button
											size="lg"
											className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
											onClick={() => handleStatusUpdate(selectedStatus)}
											disabled={!selectedStatus || updateStatusMutation.isPending}
										>
											{updateStatusMutation.isPending ? (
												<>
													<Timer className="h-4 w-4 mr-2 animate-spin" />
													Updating...
												</>
											) : (
												<>
													<Edit3 className="h-4 w-4 mr-2" />
													Update Status
												</>
											)}
										</Button>
									</div>

									{/* Driver Assignment Section */}
									<Separator className="my-6" />
									<div className="space-y-4">
										<div className="text-center">
											<div className="text-sm font-semibold text-gray-700 mb-3">DRIVER ASSIGNMENT</div>
										</div>
										{booking.driverId ? (
											<div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
												<div className="text-center mb-3">
													<div className="bg-green-500 text-white p-2 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
														<UserPlus className="h-6 w-6" />
													</div>
													<div className="font-bold text-green-800 mb-1">Driver Assigned</div>
													<div className="text-sm text-green-600 font-mono">{booking.driverId}</div>
													{booking.driverAssignedAt && (
														<div className="text-xs text-green-600 mt-1">
															{format(new Date(booking.driverAssignedAt), "MMM dd, h:mm a")}
														</div>
													)}
												</div>
												<Button
													size="lg"
													variant="outline"
													className="w-full h-12 border-2 border-green-300 hover:bg-green-100 text-green-700 font-semibold"
													onClick={() => {
														console.log("🔄 Reassign driver button clicked");
														setIsAssignDriverDialogOpen(true);
													}}
												>
													<UserPlus className="h-4 w-4 mr-2" />
													Reassign Driver
												</Button>
											</div>
										) : (
											<div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200 text-center">
												<div className="bg-orange-400 text-white p-2 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
													<AlertCircle className="h-6 w-6" />
												</div>
												<div className="text-orange-800 font-semibold mb-1">No Driver Assigned</div>
												<div className="text-sm text-orange-600 mb-4">Ready for driver assignment</div>
												<Button
													size="lg"
													onClick={() => {
														console.log("🚗 Assign driver button clicked");
														setIsAssignDriverDialogOpen(true);
													}}
													className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
												>
													<UserPlus className="h-5 w-5 mr-2" />
													Assign Driver
												</Button>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Pricing Information */}
							<Card className="shadow-xl border-t-4 border-t-green-500">
								<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
									<CardTitle className="flex items-center gap-3 text-lg">
										<div className="bg-green-100 p-2 rounded-lg">
											<CreditCard className="h-5 w-5 text-green-600" />
										</div>
										Pricing Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 pt-6">
									{booking.bookingType === "package" ? (
										<div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
											<Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
											<div className="text-sm font-semibold text-green-700 mb-1">PACKAGE BOOKING</div>
											<div className="text-sm text-green-600">Fixed package pricing</div>
										</div>
									) : (
										<div className="space-y-3">
											<div className="text-center text-sm font-semibold text-gray-700 mb-3">FARE BREAKDOWN</div>
											{booking.baseFare && (
												<div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
													<span className="font-medium text-gray-700">Base Fare</span>
													<span className="font-bold text-gray-900">${(booking.baseFare / 100).toFixed(2)}</span>
												</div>
											)}
											{booking.distanceFare && (
												<div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
													<span className="font-medium text-blue-700">Distance Fare</span>
													<span className="font-bold text-gray-900">${(booking.distanceFare / 100).toFixed(2)}</span>
												</div>
											)}
											{booking.timeFare && (
												<div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
													<span className="font-medium text-purple-700">Time Fare</span>
													<span className="font-bold text-gray-900">${(booking.timeFare / 100).toFixed(2)}</span>
												</div>
											)}
											{booking.extraCharges && booking.extraCharges > 0 && (
												<div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
													<span className="font-medium text-yellow-700">Extra Charges</span>
													<span className="font-bold text-gray-900">${(booking.extraCharges / 100).toFixed(2)}</span>
												</div>
											)}
										</div>
									)}

									<Separator className="my-4" />

									{/* Total Amount */}
									<div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg text-center">
										<div className="text-sm font-semibold mb-1">QUOTED AMOUNT</div>
										<div className="text-3xl font-bold">${(booking.quotedAmount / 100).toFixed(2)}</div>
									</div>

									{booking.finalAmount && booking.finalAmount !== booking.quotedAmount && (
										<div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg text-center mt-3">
											<div className="text-sm font-semibold mb-1">FINAL AMOUNT</div>
											<div className="text-3xl font-bold">${(booking.finalAmount / 100).toFixed(2)}</div>
											<div className="text-sm opacity-90 mt-1">
												{booking.finalAmount > booking.quotedAmount ? 'Additional charges applied' : 'Discount applied'}
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Booking Timeline */}
							<Card className="shadow-xl border-t-4 border-t-indigo-500">
								<CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
									<CardTitle className="flex items-center gap-3 text-lg">
										<div className="bg-indigo-100 p-2 rounded-lg">
											<Clock className="h-5 w-5 text-indigo-600" />
										</div>
										Booking Timeline
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 pt-6">
									{/* Created */}
									<div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-gray-600" />
											<span className="font-medium text-gray-700">Created</span>
										</div>
										<span className="font-semibold text-gray-900">
											{booking.createdAt ? format(new Date(booking.createdAt), "MMM dd, h:mm a") : "N/A"}
										</span>
									</div>
									
									{/* Confirmed */}
									{booking.confirmedAt ? (
										<div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span className="font-medium text-green-700">Confirmed</span>
											</div>
											<span className="font-semibold text-gray-900">
												{format(new Date(booking.confirmedAt), "MMM dd, h:mm a")}
											</span>
										</div>
									) : (
										<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg opacity-50">
											<div className="flex items-center gap-2">
												<Timer className="h-4 w-4 text-gray-400" />
												<span className="font-medium text-gray-500">Confirmed</span>
											</div>
											<span className="font-semibold text-gray-400">Pending</span>
										</div>
									)}
									
									{/* Started */}
									{booking.serviceStartedAt ? (
										<div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
											<div className="flex items-center gap-2">
												<Navigation className="h-4 w-4 text-blue-600" />
												<span className="font-medium text-blue-700">Started</span>
											</div>
											<span className="font-semibold text-gray-900">
												{format(new Date(booking.serviceStartedAt), "MMM dd, h:mm a")}
											</span>
										</div>
									) : (
										<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg opacity-50">
											<div className="flex items-center gap-2">
												<Timer className="h-4 w-4 text-gray-400" />
												<span className="font-medium text-gray-500">Started</span>
											</div>
											<span className="font-semibold text-gray-400">Pending</span>
										</div>
									)}
									
									{/* Completed */}
									{booking.serviceCompletedAt ? (
										<div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-purple-600" />
												<span className="font-medium text-purple-700">Completed</span>
											</div>
											<span className="font-semibold text-gray-900">
												{format(new Date(booking.serviceCompletedAt), "MMM dd, h:mm a")}
											</span>
										</div>
									) : (
										<div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg opacity-50">
											<div className="flex items-center gap-2">
												<Timer className="h-4 w-4 text-gray-400" />
												<span className="font-medium text-gray-500">Completed</span>
											</div>
											<span className="font-semibold text-gray-400">Pending</span>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				</DialogContent>
			</Dialog>

			{/* Assign Driver Dialog - Outside main dialog to avoid z-index issues */}
			<AssignDriverDialog
				booking={booking}
				open={isAssignDriverDialogOpen}
				onOpenChange={setIsAssignDriverDialogOpen}
			/>
		</>
	);
}
