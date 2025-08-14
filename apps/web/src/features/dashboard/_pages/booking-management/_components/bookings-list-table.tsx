import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import { BookingFilters } from "./booking-filters";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, User, Car, UserCheck, Edit, Ban } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { useState, useMemo } from "react";

interface BookingsListTableProps {
	bookingType?: "package" | "custom";
	status?: string;
	filters?: BookingFilters;
}

// Type from server response
interface Booking {
	id: string;
	bookingType: string;
	status: string;
	customerName: string;
	customerPhone: string;
	originAddress: string;
	destinationAddress: string;
	scheduledPickupTime: string;
	quotedAmount: number;
	carId: string;
	userId: string;
	car?: {
		id: string;
		name: string;
		[key: string]: any;
	};
	user?: {
		name: string;
		email: string;
		[key: string]: any;
	};
	createdAt: string;
	[key: string]: any;
}

export function BookingsListTable({ bookingType, status, filters }: BookingsListTableProps) {
	const { openBookingDetailsDialog } = useBookingManagementModalProvider();
	const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
	
	const bookingsQuery = useGetBookingsQuery({
		limit: 50,
		offset: 0,
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

		return filtered;
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

	const columns: ColumnDef<Booking>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => {
						table.toggleAllPageRowsSelected(!!value);
						toggleAllSelection();
					}}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={selectedBookings.includes(row.original.id)}
					onCheckedChange={() => toggleBookingSelection(row.original.id)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "id",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Booking ID" />
			),
			cell: ({ row }) => (
				<div className="font-mono text-sm">
					{row.getValue("id")?.toString().slice(-8)}
				</div>
			),
		},
		{
			accessorKey: "bookingType",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Type" />
			),
			cell: ({ row }) => {
				const type = row.getValue("bookingType") as string;
				return (
					<Badge variant={type === "package" ? "default" : "secondary"}>
						{type === "package" ? "Package" : "Custom"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
					pending: "secondary",
					confirmed: "default",
					driver_assigned: "outline",
					in_progress: "default",
					completed: "default",
					cancelled: "destructive",
				};
				return (
					<Badge variant={statusColors[status] || "secondary"}>
						{status.replace("_", " ").toUpperCase()}
					</Badge>
				);
			},
		},
		{
			accessorKey: "customerName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Customer" />
			),
			cell: ({ row }) => (
				<div className="flex items-center space-x-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<div>
						<div className="font-medium">{row.getValue("customerName")}</div>
						<div className="text-sm text-muted-foreground">
							{row.original.customerPhone}
						</div>
					</div>
				</div>
			),
		},
		{
			accessorKey: "route",
			header: "Route",
			cell: ({ row }) => (
				<div className="max-w-[200px]">
					<div className="text-sm font-medium truncate">
						{row.original.originAddress}
					</div>
					<div className="text-sm text-muted-foreground truncate">
						→ {row.original.destinationAddress}
					</div>
				</div>
			),
		},
		{
			accessorKey: "scheduledPickupTime",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Pickup Time" />
			),
			cell: ({ row }) => {
				const date = new Date(row.getValue("scheduledPickupTime"));
				return (
					<div className="text-sm">
						<div>{format(date, "MMM dd, yyyy")}</div>
						<div className="text-muted-foreground">{format(date, "HH:mm")}</div>
					</div>
				);
			},
		},
		{
			accessorKey: "quotedAmount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Amount" />
			),
			cell: ({ row }) => {
				const amount = row.getValue("quotedAmount") as number;
				return (
					<div className="font-medium">
						${(amount / 100).toFixed(2)}
					</div>
				);
			},
		},
		{
			accessorKey: "car",
			header: "Vehicle",
			cell: ({ row }) => (
				<div className="flex items-center space-x-2">
					<Car className="h-4 w-4 text-muted-foreground" />
					<div className="text-sm">
						{row.original.car?.name || "Not assigned"}
					</div>
				</div>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const booking = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => openBookingDetailsDialog(booking.id)}
							>
								<Eye className="mr-2 h-4 w-4" />
								View details
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<Edit className="mr-2 h-4 w-4" />
								Edit booking
							</DropdownMenuItem>
							<DropdownMenuItem>
								<UserCheck className="mr-2 h-4 w-4" />
								Assign driver
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">
								<Ban className="mr-2 h-4 w-4" />
								Cancel booking
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

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
			/>
		</div>
	);
}