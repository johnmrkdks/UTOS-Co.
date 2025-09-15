import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { Clock, User, Car, MapPin, DollarSign, Grid3X3, Table2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import type { BookingFilters } from "./booking-filters";
import { KanbanProvider, KanbanBoard, KanbanCards, KanbanCard } from "@/components/kanban";
import type { KanbanItemProps, KanbanColumnProps } from "@/components/kanban";

interface BookingStatusPipelineProps {
	filters?: BookingFilters;
}

// Booking interface for kanban
interface BookingKanbanItem extends KanbanItemProps {
	customerName: string;
	customerPhone: string;
	originAddress: string;
	destinationAddress: string;
	scheduledPickupTime: string;
	quotedAmount: number;
	bookingType: string;
	car?: { name: string };
	createdAt: string;
}

// Status column interface
interface StatusColumn extends KanbanColumnProps {
	title: string;
	description: string;
	color: string;
	headerColor: string;
}

const statusColumns: StatusColumn[] = [
	{ 
		id: "pending",
		name: "Pending",
		title: "Pending", 
		description: "Awaiting confirmation",
		color: "bg-yellow-50 border-yellow-200",
		headerColor: "bg-yellow-100"
	},
	{ 
		id: "confirmed",
		name: "Confirmed",
		title: "Confirmed", 
		description: "Ready for driver assignment",
		color: "bg-blue-50 border-blue-200",
		headerColor: "bg-blue-100"
	},
	{ 
		id: "driver_assigned",
		name: "Driver Assigned",
		title: "Driver Assigned", 
		description: "Driver allocated to trip",
		color: "bg-purple-50 border-purple-200",
		headerColor: "bg-purple-100"
	},
	{ 
		id: "driver_en_route",
		name: "Driver En Route",
		title: "En Route", 
		description: "Driver heading to pickup",
		color: "bg-indigo-50 border-indigo-200",
		headerColor: "bg-indigo-100"
	},
	{ 
		id: "arrived_pickup",
		name: "Arrived Pickup",
		title: "Arrived PU", 
		description: "Driver at pickup location",
		color: "bg-cyan-50 border-cyan-200",
		headerColor: "bg-cyan-100"
	},
	{ 
		id: "passenger_on_board",
		name: "Passenger On Board",
		title: "POB", 
		description: "Passenger picked up",
		color: "bg-green-50 border-green-200",
		headerColor: "bg-green-100"
	},
	{ 
		id: "in_progress",
		name: "In Progress",
		title: "In Progress", 
		description: "Service in progress (legacy)",
		color: "bg-green-50 border-green-200",
		headerColor: "bg-green-100"
	},
	{ 
		id: "dropped_off",
		name: "Dropped Off",
		title: "Dropped Off", 
		description: "Passenger at destination",
		color: "bg-orange-50 border-orange-200",
		headerColor: "bg-orange-100"
	},
	{ 
		id: "awaiting_extras",
		name: "Awaiting Extras",
		title: "Awaiting Extras", 
		description: "Adding tolls/parking fees",
		color: "bg-amber-50 border-amber-200",
		headerColor: "bg-amber-100"
	},
	{ 
		id: "completed",
		name: "Completed",
		title: "Completed", 
		description: "Service completed",
		color: "bg-gray-50 border-gray-200",
		headerColor: "bg-gray-100"
	},
];

export function BookingStatusPipeline({ filters }: BookingStatusPipelineProps) {
	const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
	
	const bookingsQuery = useGetBookingsQuery({
		limit: 100,
	});

	// Apply filters and convert to kanban format
	const kanbanData: BookingKanbanItem[] = useMemo(() => {
		if (!bookingsQuery.data?.data) return [];
		
		return bookingsQuery.data.data
			.filter(booking => {
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
			})
			.map(booking => ({
				id: booking.id,
				name: booking.customerName,
				column: booking.status,
				customerName: booking.customerName,
				customerPhone: booking.customerPhone,
				originAddress: booking.originAddress,
				destinationAddress: booking.destinationAddress,
				scheduledPickupTime: booking.scheduledPickupTime,
				quotedAmount: booking.quotedAmount,
				bookingType: booking.bookingType,
				car: booking.car,
				createdAt: booking.createdAt,
			}));
	}, [bookingsQuery.data?.data, filters]);

	const handleDataChange = (newData: BookingKanbanItem[]) => {
		// TODO: Implement status update API call
		console.log('Status update needed:', newData);
	};

	const getColumnBookings = (columnId: string) => {
		return kanbanData.filter(item => item.column === columnId);
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
				<div className="flex items-center gap-3">
					<Badge variant="outline">
						{kanbanData.length} booking{kanbanData.length !== 1 ? 's' : ''}
					</Badge>
					<div className="flex items-center border rounded-lg p-1">
						<Button
							variant={viewMode === 'kanban' ? 'default' : 'ghost'}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode('kanban')}
						>
							<Grid3X3 className="h-4 w-4 mr-1" />
							Kanban
						</Button>
						<Button
							variant={viewMode === 'table' ? 'default' : 'ghost'}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode('table')}
						>
							<Table2 className="h-4 w-4 mr-1" />
							Table
						</Button>
					</div>
				</div>
			</div>

			{viewMode === 'kanban' ? (
				<KanbanProvider
					columns={statusColumns}
					data={kanbanData}
					onDataChange={handleDataChange}
					className="min-h-[600px]"
				>
					{(column) => (
						<KanbanBoard key={column.id} id={column.id}>
							<Card className={`${column.color} h-full`}>
								<CardHeader className={`${column.headerColor} rounded-t-lg pb-3`}>
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm font-medium">
											{column.title}
										</CardTitle>
										<Badge variant="secondary">
											{getColumnBookings(column.id).length}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										{column.description}
									</p>
								</CardHeader>
								<CardContent className="p-2">
									<KanbanCards items={getColumnBookings(column.id)}>
										{(booking) => (
											<KanbanCard key={booking.id} id={booking.id} name={booking.name}>
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
															{format(new Date(booking.scheduledPickupTime), "MMM dd, h:mm a")}
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
														
														{booking.column === "pending" && (
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
														
														{booking.column === "confirmed" && (
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

														{booking.column === "driver_assigned" && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Mark as en route
																}}
															>
																En Route
															</Button>
														)}

														{booking.column === "driver_en_route" && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-cyan-600 hover:text-cyan-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Mark as arrived
																}}
															>
																Arrived
															</Button>
														)}

														{booking.column === "arrived_pickup" && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Mark passenger on board
																}}
															>
																POB
															</Button>
														)}

														{(booking.column === "passenger_on_board" || booking.column === "in_progress") && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Mark as dropped off
																}}
															>
																Drop Off
															</Button>
														)}

														{booking.column === "dropped_off" && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Add extras dialog
																}}
															>
																Extras
															</Button>
														)}

														{booking.column === "awaiting_extras" && (
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700"
																onClick={(e) => {
																	e.stopPropagation();
																	// TODO: Complete trip
																}}
															>
																Complete
															</Button>
														)}
													</div>
												</div>
											</KanbanCard>
										)}
									</KanbanCards>
									{getColumnBookings(column.id).length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<p className="text-sm">No {column.title.toLowerCase()} bookings</p>
										</div>
									)}
								</CardContent>
							</Card>
						</KanbanBoard>
					)}
				</KanbanProvider>
			) : (
				<Card>
					<CardContent className="p-4">
						<div className="text-center py-8 text-muted-foreground">
							<Table2 className="h-8 w-8 mx-auto mb-2" />
							<p>Table view coming soon...</p>
							<p className="text-sm">Use the booking tables in other tabs for now.</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}