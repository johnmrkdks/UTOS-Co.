import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { BookingFilters } from "./booking-filters";
import { bookingTableColumns, compactBookingTableColumns, type Booking } from "./booking-table-columns";
import { useState, useMemo } from "react";
import { UserCheck, Ban, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { ArchiveBookingDialog } from "./archive-booking-dialog";
import { BulkOperationsDialog } from "./bulk-operations-dialog";
import { useArchiveBookingMutation } from "../_hooks/query/use-archive-booking-mutation";

interface BookingsListTableProps {
	bookingType?: "package" | "custom" | "offload";
	status?: string;
	filters?: BookingFilters;
	compact?: boolean;
}

export function BookingsListTable({ bookingType, status, filters, compact = false }: BookingsListTableProps) {
	const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
	const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
	const [bulkOperationsDialogOpen, setBulkOperationsDialogOpen] = useState(false);
	const [selectedBookingForArchive, setSelectedBookingForArchive] = useState<Booking | null>(null);
	const [isArchivingOperation, setIsArchivingOperation] = useState(true);
	const [bulkOperationType, setBulkOperationType] = useState<"archive" | "unarchive" | "delete">("archive");
	
	const bookingsQuery = useGetBookingsQuery({
		limit: 1000, // Removed practical limit for now - will implement pagination later
		offset: 0,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	// Debug logging
	console.log("🔍 BookingsListTable Debug:");
	console.log("- Query status:", {
		isLoading: bookingsQuery.isLoading,
		isError: bookingsQuery.isError,
		error: bookingsQuery.error
	});
	console.log("- Raw data:", bookingsQuery.data);
	console.log("- Data count:", bookingsQuery.data?.data?.length);
	console.log("- Booking type filter:", bookingType);
	console.log("- Status filter:", status);

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
				filtered = filtered.filter(b => b.quotedAmount >= filters.minAmount!);
			}
			if (filters.maxAmount) {
				filtered = filtered.filter(b => b.quotedAmount <= filters.maxAmount!);
			}
		}

		// Ensure data is sorted by createdAt in descending order (newest first)
		const sortedFiltered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		console.log("🔍 Filtered Data Debug:");
		console.log("- Original count:", bookingsQuery.data?.data?.length || 0);
		console.log("- After filters:", sortedFiltered.length);
		console.log("- Filtered bookings:", sortedFiltered.map(b => ({
			id: b.id,
			bookingType: b.bookingType,
			status: b.status,
			customerName: b.customerName,
			createdAt: b.createdAt
		})));

		return sortedFiltered;
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

	const handleArchiveBooking = (booking: Booking, isArchiving: boolean) => {
		setSelectedBookingForArchive(booking);
		setIsArchivingOperation(isArchiving);
		setArchiveDialogOpen(true);
	};

	const handleDeleteBooking = (booking: Booking) => {
		setSelectedBookings([booking.id]);
		setBulkOperationType("delete");
		setBulkOperationsDialogOpen(true);
	};

	// Use appropriate column configuration based on compact mode
	const columns = compact
		? compactBookingTableColumns({
			selectedBookings,
			onToggleBookingSelection: toggleBookingSelection,
			onToggleAllSelection: toggleAllSelection,
			onEditBooking: handleEditBooking,
			onCancelBooking: handleCancelBooking,
			onArchiveBooking: handleArchiveBooking,
			onDeleteBooking: handleDeleteBooking
		})
		: bookingTableColumns({
			selectedBookings,
			onToggleBookingSelection: toggleBookingSelection,
			onToggleAllSelection: toggleAllSelection,
			onEditBooking: handleEditBooking,
			onCancelBooking: handleCancelBooking,
			onArchiveBooking: handleArchiveBooking,
			onDeleteBooking: handleDeleteBooking
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
							variant="outline"
							size="sm"
							onClick={() => {
								setBulkOperationType("archive");
								setBulkOperationsDialogOpen(true);
							}}
							className="text-orange-600 hover:text-orange-700"
						>
							<Archive className="h-4 w-4 mr-2" />
							Archive Selected
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setBulkOperationType("delete");
								setBulkOperationsDialogOpen(true);
							}}
							className="text-red-600 hover:text-red-700"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Selected
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

			{/* Archive/Restore Dialog */}
			<ArchiveBookingDialog
				booking={selectedBookingForArchive}
				open={archiveDialogOpen}
				onOpenChange={setArchiveDialogOpen}
				isArchiving={isArchivingOperation}
			/>

			{/* Bulk Operations Dialog */}
			<BulkOperationsDialog
				selectedBookingIds={selectedBookings}
				open={bulkOperationsDialogOpen}
				onOpenChange={setBulkOperationsDialogOpen}
				operationType={bulkOperationType}
				onClearSelection={() => setSelectedBookings([])}
			/>
		</div>
	);
}