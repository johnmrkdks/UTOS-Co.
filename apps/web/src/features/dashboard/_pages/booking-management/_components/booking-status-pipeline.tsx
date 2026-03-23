import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import {
	Car,
	Clock,
	DollarSign,
	Grid3X3,
	MapPin,
	Table2,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { KanbanColumnProps, KanbanItemProps } from "@/components/kanban";
import {
	KanbanBoard,
	KanbanCard,
	KanbanCards,
	KanbanProvider,
} from "@/components/kanban";
import { StatusActionButton } from "@/components/status-badge";
import {
	type BookingStatus,
	getAllStatuses,
	getNextStatus,
	getStatusConfig,
	isFinalStatus,
} from "@/lib/booking-status-config";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import type { BookingFilters } from "./booking-filters";

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
	isGuestBooking?: boolean;
}

// Status column interface
interface StatusColumn extends KanbanColumnProps {
	title: string;
	description: string;
	color: string;
	headerColor: string;
}

// Generate status columns from centralized configuration
const statusColumns: StatusColumn[] = getAllStatuses().map((statusId) => {
	const config = getStatusConfig(statusId);
	return {
		id: statusId,
		name: config.shortLabel,
		title: config.shortLabel,
		description: config.description,
		color: config.kanbanBg,
		headerColor: config.kanbanHeader,
	};
});

export function BookingStatusPipeline({ filters }: BookingStatusPipelineProps) {
	const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
	const updateStatusMutation = useUpdateBookingStatusMutation();
	const { openBookingDetailsDialog } = useBookingManagementModalProvider();

	const bookingsQuery = useGetBookingsQuery({
		limit: 100,
	});

	// Apply filters and convert to kanban format
	const kanbanData: BookingKanbanItem[] = useMemo(() => {
		if (!bookingsQuery.data?.data) return [];

		return bookingsQuery.data.data
			.filter((booking) => {
				if (!filters) return true;

				if (filters.bookingType && booking.bookingType !== filters.bookingType)
					return false;
				if (
					filters.customerName &&
					!booking.customerName
						.toLowerCase()
						.includes(filters.customerName.toLowerCase())
				)
					return false;
				if (filters.dateFrom) {
					const fromDate = new Date(filters.dateFrom);
					if (new Date(booking.scheduledPickupTime) < fromDate) return false;
				}
				if (filters.dateTo) {
					const toDate = new Date(filters.dateTo);
					toDate.setHours(23, 59, 59, 999);
					if (new Date(booking.scheduledPickupTime) > toDate) return false;
				}
				if (filters.minAmount && booking.quotedAmount < filters.minAmount)
					return false;
				if (filters.maxAmount && booking.quotedAmount > filters.maxAmount)
					return false;

				return true;
			})
			.map((booking) => ({
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
				isGuestBooking: booking.isGuestBooking,
			}));
	}, [bookingsQuery.data?.data, filters]);

	const handleDataChange = async (newData: BookingKanbanItem[]) => {
		// Find items that changed column (status) and update via API
		for (const item of newData) {
			const original = kanbanData.find((k) => k.id === item.id);
			if (original && original.column !== item.column) {
				try {
					await updateStatusMutation.mutateAsync({
						id: item.id,
						status: item.column as any,
					});
				} catch {
					// Error handled by mutation toast
				}
			}
		}
	};

	const getColumnBookings = (columnId: string) => {
		return kanbanData.filter((item) => item.column === columnId);
	};

	if (bookingsQuery.isLoading) {
		return <div className="py-8 text-center">Loading bookings...</div>;
	}

	if (bookingsQuery.error) {
		return (
			<div className="py-8 text-center text-red-500">
				Error loading bookings: {bookingsQuery.error.message}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg">Booking Status Pipeline</h3>
				<div className="flex items-center gap-3">
					<Badge variant="outline">
						{kanbanData.length} booking{kanbanData.length !== 1 ? "s" : ""}
					</Badge>
					<div className="flex items-center rounded-lg border p-1">
						<Button
							variant={viewMode === "kanban" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode("kanban")}
						>
							<Grid3X3 className="mr-1 h-4 w-4" />
							Kanban
						</Button>
						<Button
							variant={viewMode === "table" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-2"
							onClick={() => setViewMode("table")}
						>
							<Table2 className="mr-1 h-4 w-4" />
							Table
						</Button>
					</div>
				</div>
			</div>

			{viewMode === "kanban" ? (
				<KanbanProvider
					columns={statusColumns}
					data={kanbanData}
					onDataChange={handleDataChange}
					className="min-h-[600px]"
				>
					{(column) => (
						<KanbanBoard key={column.id} id={column.id}>
							<Card className={`${column.color} h-full`}>
								<CardHeader
									className={`${column.headerColor} rounded-t-lg pb-3`}
								>
									<div className="flex items-center justify-between">
										<CardTitle className="font-medium text-sm">
											{column.title}
										</CardTitle>
										<Badge variant="secondary">
											{getColumnBookings(column.id).length}
										</Badge>
									</div>
									<p className="text-muted-foreground text-xs">
										{column.description}
									</p>
								</CardHeader>
								<CardContent className="p-2">
									<KanbanCards items={getColumnBookings(column.id)}>
										{(booking) => (
											<KanbanCard
												key={booking.id}
												id={booking.id}
												name={booking.name}
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
																<div className="flex items-center gap-1.5">
																	<p className="truncate font-medium text-sm">
																		{booking.customerName}
																	</p>
																	{booking.isGuestBooking && (
																		<Badge
																			variant="outline"
																			className="h-4 px-1 py-0 font-normal text-[10px]"
																		>
																			Guest
																		</Badge>
																	)}
																</div>
																<p className="text-muted-foreground text-xs">
																	#{(booking as any).referenceNumber || "N/A"}
																</p>
															</div>
														</div>
														<Badge
															variant={
																booking.bookingType === "package"
																	? "default"
																	: "secondary"
															}
															className="text-xs"
														>
															{booking.bookingType}
														</Badge>
													</div>

													<div className="space-y-1">
														<div className="flex items-center text-muted-foreground text-xs">
															<Clock className="mr-1 h-3 w-3" />
															{format(
																new Date(booking.scheduledPickupTime),
																"MMM dd, h:mm a",
															)}
														</div>

														<div className="flex items-center text-muted-foreground text-xs">
															<MapPin className="mr-1 h-3 w-3" />
															<span className="truncate">
																{booking.originAddress.slice(0, 20)}...
															</span>
														</div>

														{booking.car && (
															<div className="flex items-center text-muted-foreground text-xs">
																<Car className="mr-1 h-3 w-3" />
																<span className="truncate">
																	{booking.car.name}
																</span>
															</div>
														)}

														<div className="flex items-center text-xs">
															<DollarSign className="mr-1 h-3 w-3" />
															<span className="font-medium">
																${booking.quotedAmount.toFixed(2)}
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
																openBookingDetailsDialog(booking.id);
															}}
														>
															View
														</Button>

														{!isFinalStatus(booking.column) && (
															<StatusActionButton
																status={booking.column}
																onClick={() => {
																	const nextStatus = getNextStatus(
																		booking.column,
																	);
																	if (nextStatus !== booking.column) {
																		updateStatusMutation.mutate({
																			id: booking.id,
																			status: nextStatus as any,
																		});
																	}
																}}
																size="sm"
															/>
														)}
													</div>
												</div>
											</KanbanCard>
										)}
									</KanbanCards>
									{getColumnBookings(column.id).length === 0 && (
										<div className="py-8 text-center text-muted-foreground">
											<p className="text-sm">
												No {column.title.toLowerCase()} bookings
											</p>
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
						<div className="py-8 text-center text-muted-foreground">
							<Table2 className="mx-auto mb-2 h-8 w-8" />
							<p>Table view coming soon...</p>
							<p className="text-sm">
								Use the booking tables in other tabs for now.
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
