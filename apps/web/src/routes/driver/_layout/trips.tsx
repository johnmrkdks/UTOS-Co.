import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { useDriverBookingsQuery } from '@/hooks/query/use-driver-bookings-query';
import {
	CalendarIcon,
	MapPinIcon,
	ClockIcon,
	DollarSignIcon,
	UserIcon,
	PhoneIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	CarIcon,
	NavigationIcon,
	StarIcon,
	RefreshCwIcon,
	FilterIcon,
	SearchIcon,
	MoreVerticalIcon,
	RouteIcon,
	TimerIcon,
	TrendingUpIcon,
	MessageSquare,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useState } from 'react';
import { Input } from "@workspace/ui/components/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { useUpdateBookingStatusMutation } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-update-booking-status-mutation";
import { cn } from "@workspace/ui/lib/utils";

export const Route = createFileRoute('/driver/_layout/trips')({
	component: DriverTripsComponent,
});

function DriverTripsComponent() {
	const { data: rawCurrentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [passengerDetailsOpen, setPassengerDetailsOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);
	const [extras, setExtras] = useState<{id: string, description: string, amount: string}[]>([
		{id: '1', description: '', amount: ''}
	]);

	// Status update mutation
	const updateStatusMutation = useUpdateBookingStatusMutation();

	// Driver data with fallback values
	const currentDriver = {
		id: null,
		...rawCurrentDriver
	};

	// Fetch bookings for current driver
	const { data: bookingsData, isLoading: isBookingsLoading, refetch } = useDriverBookingsQuery({
		driverId: currentDriver.id || "",
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];

	// Filter only assigned trips for driver focus - include all driver workflow statuses
	const assignedBookings = bookings.filter(booking => 
		['confirmed', 'driver_assigned', 'driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off', 'awaiting_extras', 'completed'].includes(booking.status)
	);

	// Filter bookings based on active tab and search - focused on assigned trips
	const filteredBookings = assignedBookings.filter(booking => {
		const matchesSearch = searchQuery === '' ||
			booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.originAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesTab = activeTab === 'all' || (
			activeTab === 'active' && ['confirmed', 'driver_assigned', 'driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off', 'awaiting_extras'].includes(booking.status) ||
			activeTab === 'upcoming' && ['confirmed', 'driver_assigned'].includes(booking.status) ||
			activeTab === 'completed' && ['completed'].includes(booking.status)
		);

		return matchesSearch && matchesTab;
	});

	// Simple stats for assigned trips only
	const assignedStats = {
		totalAssigned: assignedBookings.length,
		upcomingTrips: assignedBookings.filter(b => ['confirmed', 'driver_assigned'].includes(b.status)).length,
		activeTrips: assignedBookings.filter(b => ['driver_en_route', 'arrived_pickup', 'passenger_on_board', 'in_progress', 'dropped_off', 'awaiting_extras'].includes(b.status)).length,
		completedTrips: assignedBookings.filter(b => b.status === 'completed').length,
	};


	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
			case 'driver_assigned': return 'bg-purple-100 text-purple-800 border-purple-300';
			case 'driver_en_route': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
			case 'arrived_pickup': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
			case 'passenger_on_board': return 'bg-green-100 text-green-800 border-green-300';
			case 'in_progress': return 'bg-green-100 text-green-800 border-green-300';
			case 'dropped_off': return 'bg-orange-100 text-orange-800 border-orange-300';
			case 'awaiting_extras': return 'bg-amber-100 text-amber-800 border-amber-300';
			case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
			default: return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending': return <ClockIcon className="h-4 w-4" />;
			case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
			case 'driver_assigned': return <UserIcon className="h-4 w-4" />;
			case 'in_progress': return <CarIcon className="h-4 w-4" />;
			case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
			case 'cancelled': return <AlertCircleIcon className="h-4 w-4" />;
			default: return <ClockIcon className="h-4 w-4" />;
		}
	};

	const formatTime = (timestamp: number | string) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	const formatCurrency = (cents: number) => {
		return `$${(cents / 100).toFixed(2)}`;
	};

	const formatPrice = (priceInCents: number) => `$${(priceInCents / 100).toFixed(0)}`;

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
		});
	};

	// Driver workflow status transitions
	const getNextStatus = (currentStatus: string) => {
		switch (currentStatus) {
			case 'confirmed':
				return 'driver_en_route'; // Start Job
			case 'driver_assigned':
				return 'driver_en_route'; // Start Job
			case 'driver_en_route':
				return 'arrived_pickup'; // Arrived PU
			case 'arrived_pickup':
				return 'passenger_on_board'; // POB
			case 'passenger_on_board':
				return 'dropped_off'; // Dropped Off
			case 'dropped_off':
				return 'awaiting_extras'; // Extras
			case 'awaiting_extras':
				return 'completed'; // Complete
			default:
				return currentStatus;
		}
	};

	const getStatusButtonText = (currentStatus: string) => {
		switch (currentStatus) {
			case 'confirmed':
				return 'Start Job';
			case 'driver_assigned':
				return 'Start Job';
			case 'driver_en_route':
				return 'Arrived PU';
			case 'arrived_pickup':
				return 'POB (Passenger On Board)';
			case 'passenger_on_board':
				return 'Dropped Off';
			case 'dropped_off':
				return 'Add Extras';
			case 'awaiting_extras':
				return 'Complete Trip';
			default:
				return 'Update Status';
		}
	};

	const handleStartTrip = (booking: any) => {
		// If current status is 'dropped_off', show extras dialog
		if (booking.status === 'dropped_off') {
			setSelectedBooking(booking);
			setExtrasDialogOpen(true);
			return;
		}
		
		const nextStatus = getNextStatus(booking.status);
		updateStatusMutation.mutate({
			id: booking.id,
			status: nextStatus as any,
		});
	};

	const addExtraItem = () => {
		setExtras(prev => [...prev, {
			id: Date.now().toString(),
			description: '',
			amount: ''
		}]);
	};

	const removeExtraItem = (id: string) => {
		setExtras(prev => prev.filter(item => item.id !== id));
	};

	const updateExtraItem = (id: string, field: 'description' | 'amount', value: string) => {
		setExtras(prev => prev.map(item => 
			item.id === id ? {...item, [field]: value} : item
		));
	};

	const calculateTotalExtras = () => {
		return extras.reduce((total, item) => {
			const amount = parseFloat(item.amount || '0');
			return total + (isNaN(amount) ? 0 : amount);
		}, 0);
	};

	const handleSubmitExtras = () => {
		if (selectedBooking) {
			const totalExtrasAmount = calculateTotalExtras();
			const extrasAmountInCents = Math.round(totalExtrasAmount * 100);
			
			// Update booking with extras amount and move to next status
			updateStatusMutation.mutate({
				id: selectedBooking.id,
				status: 'awaiting_extras' as any,
				extraCharges: extrasAmountInCents,
			});
		}
		
		setExtrasDialogOpen(false);
		setExtras([{id: '1', description: '', amount: ''}]);
		setSelectedBooking(null);
	};

	const handleCompleteTrip = (booking: any) => {
		updateStatusMutation.mutate({
			id: booking.id,
			status: 'completed' as any,
		});
	};

	const handleViewPassengerDetails = (booking: any) => {
		setSelectedBooking(booking);
		setPassengerDetailsOpen(true);
	};;

	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
						))}
					</div>
					<div className="h-64 bg-gray-200 rounded-lg"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 md:py-12 bg-background min-h-screen">
			<div className="container mx-auto px-6 max-w-4xl">
				<div className="space-y-6">
					{/* Page Header */}
					<div className="space-y-2 text-center md:text-left">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							My Trips
						</h1>
						<p className="text-muted-foreground text-sm md:text-base">
							{assignedStats.totalAssigned} trips assigned • {assignedStats.activeTrips} active • {assignedStats.completedTrips} completed
						</p>
					</div>

					{/* Search */}
					<div className="relative">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search trips..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 w-full"
						/>
					</div>

					{/* Trip List */}
					<div>
						{filteredBookings.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
								<div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
									<CarIcon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
								</div>
								<h3 className="font-semibold text-base md:text-lg mb-2">No trips assigned</h3>
								<p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed px-4 md:px-0">
									Your assigned trips will appear here once you receive bookings from the dispatch.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{filteredBookings.map((booking) => {
									const isUpcoming = new Date(booking.scheduledPickupTime) > new Date() && !["completed", "cancelled"].includes(booking.status);
									const isPast = new Date(booking.scheduledPickupTime) < new Date() || ["completed", "cancelled"].includes(booking.status);
									
									return (
										<Card key={booking.id} className="overflow-hidden shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all duration-200">
											<CardContent className="p-4">
												{/* Header with Title and Status */}
												<div className="flex items-center justify-between mb-3">
													<h3 className="text-lg font-semibold text-gray-900">
														Airport Transfer
													</h3>
													<div className="flex items-center gap-2">
														<Badge 
															className={cn(
																"text-xs px-2 py-1 text-white",
																isUpcoming && "bg-blue-500",
																booking.status === "in_progress" && "bg-green-500",
																booking.status === "completed" && "bg-gray-500",
																booking.status === "cancelled" && "bg-red-500"
															)}
														>
															{isUpcoming ? 'Upcoming' : booking.status === "in_progress" ? 'In Progress' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
														</Badge>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
																	<MoreVerticalIcon className="h-4 w-4 text-gray-600" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-48">
																<DropdownMenuItem onClick={() => handleViewPassengerDetails(booking)}>
																	<UserIcon className="h-4 w-4 mr-2" />
																	View Passenger Details
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => {
																	// Create route based on booking status
																	let mapsUrl = '';
																	if (['confirmed', 'driver_assigned', 'driver_en_route'].includes(booking.status)) {
																		// Driver should go to pickup location
																		mapsUrl = `https://maps.google.com/dir/?api=1&destination=${encodeURIComponent(booking.originAddress)}`;
																	} else if (['arrived_pickup', 'passenger_on_board'].includes(booking.status)) {
																		// Driver should go to drop-off location
																		mapsUrl = `https://maps.google.com/dir/?api=1&destination=${encodeURIComponent(booking.destinationAddress)}`;
																	} else {
																		// Full route for reference
																		mapsUrl = `https://maps.google.com/dir/?api=1&origin=${encodeURIComponent(booking.originAddress)}&destination=${encodeURIComponent(booking.destinationAddress)}`;
																	}
																	window.open(mapsUrl, '_blank');
																}}>
																	<NavigationIcon className="h-4 w-4 mr-2" />
																	Open Maps
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>

												{/* Service Type Badge, Time and Distance */}
												<div className="flex items-center gap-2 mb-4">
													<Badge 
														variant="secondary" 
														className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
													>
														{booking.bookingType === "package" ? "Airport Transfer" : "Custom"}
													</Badge>
													<div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
														Status: {booking.status}
													</div>
													<span className="text-sm text-gray-600">
														{formatTime(booking.scheduledPickupTime)}
													</span>
													<span className="text-sm text-gray-600">
														{formatPrice(booking.finalAmount || booking.quotedAmount)}
													</span>
													<div className="ml-auto text-sm text-gray-500">
														{booking.estimatedDistance ? `${(booking.estimatedDistance / 1609).toFixed(1)} miles` : ''}
													</div>
												</div>

												{/* Date and Route */}
												<div className="flex items-center gap-4 mb-4">
													<div className="flex items-center gap-2">
														<CalendarIcon className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-700">
															{formatDate(booking.scheduledPickupTime)}
														</span>
													</div>
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<NavigationIcon className="h-4 w-4 text-gray-400" />
														<div className="flex-1 min-w-0">
															<div className="text-sm font-medium text-gray-900">
																{booking.originAddress.split(',')[0]}
															</div>
															<div className="text-xs text-gray-500">
																to {booking.destinationAddress.split(',')[0]}
															</div>
														</div>
													</div>
												</div>

												{/* Passenger Info */}
												<div className="bg-purple-50 rounded-lg p-3 mb-4">
													<div className="flex items-center gap-2">
														<div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
															<UserIcon className="h-4 w-4 text-purple-600" />
														</div>
														<div className="flex-1">
															<div className="text-sm font-medium text-purple-900">
																{booking.customerName}
															</div>
															<div className="text-xs text-purple-700">
																{booking.customerPhone}
															</div>
														</div>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0 hover:bg-purple-200"
																onClick={() => window.open(`tel:${booking.customerPhone}`)}
															>
																<PhoneIcon className="h-4 w-4 text-purple-600" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0 hover:bg-purple-200"
																onClick={() => window.open(`sms:${booking.customerPhone}`)}
															>
																<MessageSquare className="h-4 w-4 text-purple-600" />
															</Button>
														</div>
													</div>
												</div>

												{/* Special Requests (if any) */}
												{booking.specialRequests && (
													<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
														<div className="flex items-start gap-2">
															<AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-sm font-medium text-yellow-800">Special Requests</p>
																<p className="text-sm text-yellow-700">{booking.specialRequests}</p>
															</div>
														</div>
													</div>
												)}

												{/* Action Buttons */}
												<div className="flex gap-3">
													<Button
														variant="outline"
														className="flex-1 text-gray-700 hover:bg-gray-50 border-gray-300"
														onClick={() => handleViewPassengerDetails(booking)}
													>
														Contact Passenger
													</Button>
													{['driver_assigned', 'driver_en_route', 'arrived_pickup', 'passenger_on_board', 'dropped_off', 'awaiting_extras', 'confirmed'].includes(booking.status) && (
														<Button
															className="flex-1"
															onClick={() => handleStartTrip(booking)}
															disabled={updateStatusMutation.isPending}
														>
															{updateStatusMutation.isPending ? 'Updating...' : getStatusButtonText(booking.status)}
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Passenger Details Dialog */}
			<Dialog open={passengerDetailsOpen} onOpenChange={setPassengerDetailsOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							Passenger Details
						</DialogTitle>
						<DialogDescription>
							Trip information for {selectedBooking?.customerName}
						</DialogDescription>
					</DialogHeader>
					
					{selectedBooking && (
						<div className="space-y-4 py-4">
							{/* Passenger Information */}
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
										<UserIcon className="h-6 w-6 text-blue-600" />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold text-lg">{selectedBooking.customerName}</h3>
										<p className="text-sm text-muted-foreground">
											{selectedBooking.passengerCount} passenger{selectedBooking.passengerCount !== 1 ? 's' : ''}
										</p>
									</div>
								</div>
								
								{/* Contact Information */}
								<div className="grid grid-cols-1 gap-3 p-3 bg-muted/30 rounded-lg">
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">Phone:</span>
										<span className="text-sm font-medium">{selectedBooking.customerPhone}</span>
									</div>
									{selectedBooking.customerEmail && (
										<div className="flex justify-between">
											<span className="text-sm text-muted-foreground">Email:</span>
											<span className="text-sm font-medium">{selectedBooking.customerEmail}</span>
										</div>
									)}
								</div>
							</div>

							{/* Trip Information */}
							<div className="space-y-2">
								<h4 className="font-medium text-sm">Trip Details</h4>
								<div className="p-3 bg-muted/30 rounded-lg space-y-2">
									<div className="flex items-start gap-2">
										<MapPinIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<p className="text-xs font-medium text-muted-foreground">PICKUP</p>
											<p className="text-sm">{selectedBooking.originAddress}</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<NavigationIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<p className="text-xs font-medium text-muted-foreground">DESTINATION</p>
											<p className="text-sm">{selectedBooking.destinationAddress}</p>
										</div>
									</div>
									<div className="flex justify-between pt-2 border-t">
										<div>
											<p className="text-xs font-medium text-muted-foreground">SCHEDULED</p>
											<p className="text-sm">{formatTime(selectedBooking.scheduledPickupTime)}</p>
										</div>
										<div className="text-right">
											<p className="text-xs font-medium text-muted-foreground">FARE</p>
											<p className="text-sm font-semibold">{formatCurrency(selectedBooking.finalAmount || selectedBooking.quotedAmount)}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Special Requests */}
							{selectedBooking.specialRequests && (
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Special Requests</h4>
									<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
										<p className="text-sm text-yellow-800">{selectedBooking.specialRequests}</p>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-2 pt-4 border-t">
								<Button 
									variant="outline" 
									onClick={() => setPassengerDetailsOpen(false)}
									className="flex-1"
								>
									Close
								</Button>
								<Button 
									onClick={() => window.open(`tel:${selectedBooking.customerPhone}`)}
									className="flex-1"
								>
									<PhoneIcon className="h-4 w-4 mr-2" />
									Call Passenger
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Extras Dialog */}
			<Dialog open={extrasDialogOpen} onOpenChange={setExtrasDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add Extras</DialogTitle>
						<DialogDescription>
							Add any additional charges like tolls, parking fees, etc.
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">Extra Charges</label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addExtraItem}
									className="h-8"
								>
									<PlusIcon className="h-4 w-4 mr-1" />
									Add Item
								</Button>
							</div>
							
							{extras.map((item, index) => (
								<div key={item.id} className="flex gap-2 items-start">
									<div className="flex-1">
										<Input
											placeholder="Description (e.g., Toll, Parking)"
											value={item.description}
											onChange={(e) => updateExtraItem(item.id, 'description', e.target.value)}
											className="text-sm"
										/>
									</div>
									<div className="w-24">
										<Input
											type="number"
											step="0.01"
											placeholder="$0.00"
											value={item.amount}
											onChange={(e) => updateExtraItem(item.id, 'amount', e.target.value)}
											className="text-sm"
										/>
									</div>
									{extras.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeExtraItem(item.id)}
											className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<TrashIcon className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
							
							{calculateTotalExtras() > 0 && (
								<div className="flex justify-between items-center pt-2 border-t border-gray-200">
									<span className="text-sm font-medium">Total:</span>
									<span className="text-sm font-semibold">${calculateTotalExtras().toFixed(2)}</span>
								</div>
							)}
							
							<p className="text-xs text-muted-foreground">
								Add multiple items like tolls, parking fees, or other charges
							</p>
						</div>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							variant="outline"
							onClick={() => {
								// Skip extras and complete trip directly
								if (selectedBooking) {
									updateStatusMutation.mutate({
										id: selectedBooking.id,
										status: 'completed' as any,
										extraCharges: 0,
									});
								}
								setExtrasDialogOpen(false);
								setExtras([{id: '1', description: '', amount: ''}]);
								setSelectedBooking(null);
							}}
							className="flex-1"
							disabled={updateStatusMutation.isPending}
						>
							{updateStatusMutation.isPending ? 'Completing...' : 'Skip Extras'}
						</Button>
						<Button 
							onClick={handleSubmitExtras}
							className="flex-1"
							disabled={updateStatusMutation.isPending}
						>
							{updateStatusMutation.isPending ? 'Adding...' : 'Add Extras'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
