import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { BookingFilters } from "./booking-filters";
import { bookingTableColumns, compactBookingTableColumns, type Booking } from "./booking-table-columns";
import { useState, useMemo } from "react";
import { UserCheck, Ban } from "lucide-react";

interface BookingsListTableProps {
	bookingType?: "package" | "custom";
	status?: string;
	filters?: BookingFilters;
	compact?: boolean;
}

export function BookingsListTable({ bookingType, status, filters, compact = false }: BookingsListTableProps) {
	const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
	
	const bookingsQuery = useGetBookingsQuery({
		limit: 50,
		offset: 0,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	// Apply filters to the data
	const filteredData = useMemo(() => {
		if (!bookingsQuery.data?.data) return [];
		
		let filtered = bookingsQuery.data.data;

		// Apply basic filters
		if (bookingType) {
			filtered = filtered.filter(b => b.bookingType === bookingType);
		}
		if (status) {
			filtered = filtered.filter(b => b.status === status);
		}

		// Apply advanced filters
		if (filters) {
			if (filters.status) {
				filtered = filtered.filter(b => b.status === filters.status);
			}
			if (filters.bookingType) {
				filtered = filtered.filter(b => b.bookingType === filters.bookingType);
			}
			if (filters.customerName) {
				filtered = filtered.filter(b => 
					b.customerName.toLowerCase().includes(filters.customerName!.toLowerCase())
				);
			}
			if (filters.dateFrom) {
				const fromDate = new Date(filters.dateFrom);
				filtered = filtered.filter(b => new Date(b.scheduledPickupTime) >= fromDate);
			}
			if (filters.dateTo) {
				const toDate = new Date(filters.dateTo);
				toDate.setHours(23, 59, 59, 999); // Include the entire day
				filtered = filtered.filter(b => new Date(b.scheduledPickupTime) <= toDate);
			}
			if (filters.minAmount) {
				filtered = filtered.filter(b => (b.quotedAmount / 100) >= filters.minAmount!);
			}
			if (filters.maxAmount) {
				filtered = filtered.filter(b => (b.quotedAmount / 100) <= filters.maxAmount!);
			}
		}

		// Ensure data is sorted by createdAt in descending order (newest first)
		return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [bookingsQuery.data?.data, bookingType, status, filters]);

	// Handle bulk selection
	const toggleBookingSelection = (bookingId: string) => {
		setSelectedBookings(prev => 
			prev.includes(bookingId) 
				? prev.filter(id => id !== bookingId)
				: [...prev, bookingId]
		);
	};

	const toggleAllSelection = () => {
		if (selectedBookings.length === filteredData.length) {
			setSelectedBookings([]);
		} else {
			setSelectedBookings(filteredData.map(b => b.id));
		}
	};

	// Action handlers
	const handleEditBooking = (booking: Booking) => {
		// TODO: Implement edit booking functionality
		console.log("Edit booking:", booking.id);
	};

	const handleCancelBooking = (booking: Booking) => {
		// TODO: Implement cancel booking functionality
		console.log("Cancel booking:", booking.id);
	};

	// Use appropriate column configuration based on compact mode
	const columns = compact 
		? compactBookingTableColumns({
			selectedBookings,
			onToggleBookingSelection: toggleBookingSelection,
			onToggleAllSelection: toggleAllSelection,
			onEditBooking: handleEditBooking,
			onCancelBooking: handleCancelBooking
		})
		: bookingTableColumns({
			selectedBookings,
			onToggleBookingSelection: toggleBookingSelection,
			onToggleAllSelection: toggleAllSelection,
			onEditBooking: handleEditBooking,
			onCancelBooking: handleCancelBooking
		});

	if (bookingsQuery.isLoading) {
		return <div>Loading bookings...</div>;
	}

	if (bookingsQuery.error) {
		return <div>Error loading bookings: {bookingsQuery.error.message}</div>;
	}

	// Bulk operations actions
	const bulkAssignDriver = () => {
		// TODO: Implement bulk driver assignment
		console.log("Bulk assign driver to:", selectedBookings);
	};

	const bulkUpdateStatus = (newStatus: string) => {
		// TODO: Implement bulk status update
		console.log("Bulk update status to:", newStatus, "for:", selectedBookings);
	};

	return (
		<div className="space-y-4">
			{/* Bulk Operations Bar */}
			{selectedBookings.length > 0 && (
				<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">
							{selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''} selected
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={bulkAssignDriver}>
							<UserCheck className="h-4 w-4 mr-2" />
							Assign Driver
						</Button>
						<Button variant="outline" size="sm" onClick={() => bulkUpdateStatus("confirmed")}>
							Confirm Selected
						</Button>
						<Button variant="outline" size="sm" onClick={() => bulkUpdateStatus("cancelled")}>
							<Ban className="h-4 w-4 mr-2" />
							Cancel Selected
						</Button>
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={() => setSelectedBookings([])}
						>
							Clear Selection
						</Button>
					</div>
				</div>
			)}

			<DataTable
				columns={columns}
				data={filteredData}
				searchKey="customerName"
				searchPlaceholder="Search by customer name..."
				isLoading={bookingsQuery.isLoading}
				enableSorting={true}
			/>
		</div>
	);
}