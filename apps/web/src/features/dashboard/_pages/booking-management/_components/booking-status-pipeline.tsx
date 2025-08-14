import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { Clock, User, Car, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { BookingFilters } from "./booking-filters";

interface BookingStatusPipelineProps {
	filters?: BookingFilters;
}

const statusColumns = [
	{ 
		status: "pending", 
		title: "Pending", 
		description: "Awaiting confirmation",
		color: "bg-yellow-50 border-yellow-200",
		headerColor: "bg-yellow-100"
	},
	{ 
		status: "confirmed", 
		title: "Confirmed", 
		description: "Ready for driver assignment",
		color: "bg-blue-50 border-blue-200",
		headerColor: "bg-blue-100"
	},
	{ 
		status: "driver_assigned", 
		title: "Driver Assigned", 
		description: "Driver en route to pickup",
		color: "bg-purple-50 border-purple-200",
		headerColor: "bg-purple-100"
	},
	{ 
		status: "in_progress", 
		title: "In Progress", 
		description: "Service in progress",
		color: "bg-orange-50 border-orange-200",
		headerColor: "bg-orange-100"
	},
	{ 
		status: "completed", 
		title: "Completed", 
		description: "Service completed",
		color: "bg-green-50 border-green-200",
		headerColor: "bg-green-100"
	},
];

export function BookingStatusPipeline({ filters }: BookingStatusPipelineProps) {
	const [draggedBooking, setDraggedBooking] = useState<string | null>(null);
	
	const bookingsQuery = useGetBookingsQuery({
		limit: 100,
	});

	// Apply filters to bookings
	const filteredBookings = (bookingsQuery.data?.data || []).filter(booking => {
		if (!filters) return true;
		
		if (filters.bookingType && booking.bookingType !== filters.bookingType) return false;
		if (filters.customerName && !booking.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false;
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			if (new Date(booking.scheduledPickupTime) < fromDate) return false;
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59, 999);
			if (new Date(booking.scheduledPickupTime) > toDate) return false;
		}
		if (filters.minAmount && (booking.quotedAmount / 100) < filters.minAmount) return false;
		if (filters.maxAmount && (booking.quotedAmount / 100) > filters.maxAmount) return false;
		
		return true;
	});

	const getBookingsByStatus = (status: string) => {
		return filteredBookings.filter(booking => booking.status === status);
	};

	const handleDragStart = (bookingId: string) => {
		setDraggedBooking(bookingId);
	};

	const handleDragEnd = () => {
		setDraggedBooking(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent, newStatus: string) => {
		e.preventDefault();
		if (draggedBooking) {
			// TODO: Implement status update API call
			console.log(`Update booking ${draggedBooking} to status: ${newStatus}`);
		}
		setDraggedBooking(null);
	};

	if (bookingsQuery.isLoading) {
		return <div className="text-center py-8">Loading bookings...</div>;
	}

	if (bookingsQuery.error) {
		return <div className="text-center py-8 text-red-500">Error loading bookings: {bookingsQuery.error.message}</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Booking Status Pipeline</h3>
				<Badge variant="outline">
					{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
				</Badge>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
				{statusColumns.map(column => {
					const bookings = getBookingsByStatus(column.status);
					
					return (
						<Card 
							key={column.status} 
							className={`${column.color} transition-colors`}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, column.status)}
						>
							<CardHeader className={`${column.headerColor} rounded-t-lg`}>
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm font-medium">
										{column.title}
									</CardTitle>
									<Badge variant="secondary">
										{bookings.length}
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									{column.description}
								</p>
							</CardHeader>
							<CardContent className="p-2 space-y-2">
								{bookings.map(booking => (
									<div
										key={booking.id}
										draggable
										onDragStart={() => handleDragStart(booking.id)}
										onDragEnd={handleDragEnd}
										className={`
											bg-white rounded-lg border p-3 shadow-sm cursor-move
											hover:shadow-md transition-shadow
											${draggedBooking === booking.id ? 'opacity-50' : ''}
										`}
									>
										<div className="space-y-2">
											<div className="flex items-start justify-between">
												<div className="flex items-center space-x-2">
													<Avatar className="h-6 w-6">
														<AvatarFallback className="text-xs">
															{booking.customerName.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="text-sm font-medium truncate">
															{booking.customerName}
														</p>
														<p className="text-xs text-muted-foreground">
															#{booking.id.slice(-6)}
														</p>
													</div>
												</div>
												<Badge variant={booking.bookingType === "package" ? "default" : "secondary"} className="text-xs">
													{booking.bookingType}
												</Badge>
											</div>

											<div className="space-y-1">
												<div className="flex items-center text-xs text-muted-foreground">
													<Clock className="h-3 w-3 mr-1" />
													{format(new Date(booking.scheduledPickupTime), "MMM dd, HH:mm")}
												</div>
												
												<div className="flex items-center text-xs text-muted-foreground">
													<MapPin className="h-3 w-3 mr-1" />
													<span className="truncate">
														{booking.originAddress.slice(0, 20)}...
													</span>
												</div>

												{booking.car && (
													<div className="flex items-center text-xs text-muted-foreground">
														<Car className="h-3 w-3 mr-1" />
														<span className="truncate">
															{booking.car.name}
														</span>
													</div>
												)}

												<div className="flex items-center text-xs">
													<DollarSign className="h-3 w-3 mr-1" />
													<span className="font-medium">
														${(booking.quotedAmount / 100).toFixed(2)}
													</span>
												</div>
											</div>

											<div className="flex items-center justify-between pt-1">
												<Button 
													variant="ghost" 
													size="sm" 
													className="h-6 px-2 text-xs"
													onClick={(e) => {
														e.stopPropagation();
														// TODO: Open booking details
													}}
												>
													View
												</Button>
												
												{booking.status === "pending" && (
													<Button 
														variant="ghost" 
														size="sm" 
														className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
														onClick={(e) => {
															e.stopPropagation();
															// TODO: Quick confirm action
														}}
													>
														Confirm
													</Button>
												)}
												
												{booking.status === "confirmed" && (
													<Button 
														variant="ghost" 
														size="sm" 
														className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
														onClick={(e) => {
															e.stopPropagation();
															// TODO: Quick assign driver action
														}}
													>
														Assign
													</Button>
												)}
											</div>
										</div>
									</div>
								))}

								{bookings.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<p className="text-sm">No {column.title.toLowerCase()} bookings</p>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}