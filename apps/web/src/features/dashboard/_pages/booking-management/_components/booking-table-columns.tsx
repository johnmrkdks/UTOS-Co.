import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Checkbox } from "@workspace/ui/components/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { User, Car, UserCheck, Phone, CircleDot } from "lucide-react";
import { BookingTableRowActions } from "./booking-table-row-actions";
import { StatusBadge } from "@/components/status-badge";

// Booking interface
export interface Booking {
	id: string;
	bookingType: string;
	status: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string | null;
	originAddress: string;
	destinationAddress: string;
	stops?: Array<{ id: string; address: string; }>;
	scheduledPickupTime: string;
	quotedAmount: number;
	carId: string | null;
	userId: string;
	isArchived?: boolean | null;
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
	driver?: {
		id: string;
		name?: string;
		user?: {
			name: string;
			phone: string;
		};
	};
	driverName?: string;
	assignedDriver?: {
		id: string;
		name?: string;
		user?: {
			name: string;
			phone?: string;
		};
	};
	offloadDetails?: {
		id: string;
		bookingId: string;
		offloaderName: string;
		jobType: string;
		vehicleType: string;
		createdAt: string;
		updatedAt: string;
	} | null;
	createdAt: string;
	isGuestBooking?: boolean | null;
	[key: string]: any;
}

interface BookingTableColumnsOptions {
	selectedBookings?: string[];
	onToggleBookingSelection?: (id: string) => void;
	onToggleAllSelection?: () => void;
	onEditBooking?: (booking: Booking) => void;
	onCancelBooking?: (booking: Booking) => void;
	onArchiveBooking?: (booking: Booking, isArchiving: boolean) => void;
	onDeleteBooking?: (booking: Booking) => void;
	enableRowSelection?: boolean;
	compact?: boolean;
}

export const createBookingTableColumns = (options: BookingTableColumnsOptions = {}): ColumnDef<Booking>[] => {
	const {
		selectedBookings = [],
		onToggleBookingSelection,
		onToggleAllSelection,
		onEditBooking,
		onCancelBooking,
		onArchiveBooking,
		onDeleteBooking,
		enableRowSelection = false,
		compact = false
	} = options;

	const columns: ColumnDef<Booking>[] = [];

	// Selection column
	if (enableRowSelection && onToggleBookingSelection && onToggleAllSelection) {
		columns.push({
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => {
						table.toggleAllPageRowsSelected(!!value);
						onToggleAllSelection();
					}}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={selectedBookings.includes(row.original.id)}
					onCheckedChange={() => onToggleBookingSelection(row.original.id)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
			size: 50,
		});
	}

	// Actions column - moved to second position (left side)
	columns.push({
		id: "actions",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Actions" />
		),
		cell: ({ row }) => (
			<BookingTableRowActions
				row={row}
				onEditBooking={onEditBooking}
				onCancelBooking={onCancelBooking}
				onArchiveBooking={onArchiveBooking}
				onDeleteBooking={onDeleteBooking}
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 80,
	});

	// ID column
	columns.push({
		id: "id",
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ID" />
		),
		cell: ({ row }) => (
			<div className="font-mono text-xs truncate">
				#{row.getValue("id")?.toString().slice(-6)}
			</div>
		),
		size: 80,
	});

	if (!compact) {
		// Type column
		columns.push({
			id: "bookingType",
			accessorKey: "bookingType",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Type" />
			),
			cell: ({ row }) => {
				const type = row.getValue("bookingType") as string;
				return (
					<Badge variant={type === "package" ? "default" : type === "offload" ? "destructive" : "secondary"}>
						{type === "package" ? "Package" : type === "offload" ? "Offload" : "Custom"}
					</Badge>
				);
			},
			size: 100,
		});
	}

	// Status column
	columns.push({
		id: "status",
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return <StatusBadge status={status} size="md" />;
		},
		size: 140,
	});

	// Customer column
	columns.push({
		id: "customerName",
		accessorKey: "customerName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Customer" />
		),
		cell: ({ row }) => (
			<div className="flex items-center space-x-2">
				<User className="h-4 w-4 text-muted-foreground" />
				<div>
					<div className="flex items-center gap-1.5">
						<span className="font-medium text-xs truncate">{row.getValue("customerName")}</span>
						{row.original.isGuestBooking && (
							<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
								Guest
							</Badge>
						)}
					</div>
					<div className="text-xs text-muted-foreground flex items-center gap-1">
						<Phone className="h-3 w-3" />
						<span className="truncate">{row.original.customerPhone}</span>
					</div>
				</div>
			</div>
		),
		size: 180,
	});

	if (!compact) {
		// Route column
		columns.push({
			id: "route",
			accessorKey: "route",
			header: "Route",
			cell: ({ row }) => (
				<div>
					<div className="text-xs font-medium truncate">
						From: {row.original.originAddress}
					</div>
					{row.original.stops && row.original.stops.length > 0 && (
						<div className="text-xs text-blue-600 truncate">
							{row.original.stops.length} stop{row.original.stops.length > 1 ? 's' : ''}
						</div>
					)}
					<div className="text-xs text-muted-foreground truncate">
						To: {row.original.destinationAddress}
					</div>
				</div>
			),
			size: 200,
		});

		// Stops column
		columns.push({
			id: "stops",
			accessorKey: "stops",
			header: "Stops",
			cell: ({ row }) => {
				const stops = row.original.stops;
				if (!stops || stops.length === 0) {
					return (
						<div className="text-center">
							<span className="text-xs text-muted-foreground">—</span>
						</div>
					);
				}
				return (
					<div className="flex items-center gap-1">
						<CircleDot className="h-3 w-3 text-blue-500" />
						<Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
							{stops.length}
						</Badge>
					</div>
				);
			},
			size: 80,
		});
	}

	// Pickup Time column
	columns.push({
		id: "scheduledPickupTime",
		accessorKey: "scheduledPickupTime",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Pickup Time" />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue("scheduledPickupTime"));
			return (
				<div className="text-xs">
					<div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
					<div className="text-muted-foreground">{format(date, "h:mm a")}</div>
				</div>
			);
		},
		size: 120,
	});

	// Amount column
	columns.push({
		id: "quotedAmount",
		accessorKey: "quotedAmount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Amount" />
		),
		cell: ({ row }) => {
			const amount = row.getValue("quotedAmount") as number;
			return (
				<div className="font-medium text-xs">
					${amount.toFixed(2)}
				</div>
			);
		},
		size: 100,
	});

	if (!compact) {
		// Vehicle column
		columns.push({
			id: "car",
			accessorKey: "car",
			header: "Vehicle",
			cell: ({ row }) => (
				<div className="flex items-center space-x-2">
					<Car className="h-4 w-4 text-muted-foreground" />
					<div className="text-xs truncate">
						{row.original.car?.name || "Not assigned"}
					</div>
				</div>
			),
			size: 120,
		});

		// Driver column
		columns.push({
			id: "driver",
			accessorKey: "driver",
			header: "Driver",
			cell: ({ row }) => {
				// Try different possible driver data structures
				const booking = row.original;
				const driverName = 
					booking.driver?.user?.name ||  // Nested driver.user.name
					booking.driver?.name ||        // Direct driver.name
					booking.driverName ||          // Flat driverName field
					booking.assignedDriver?.name || // assignedDriver.name
					booking.assignedDriver?.user?.name; // assignedDriver.user.name
				
				return (
					<div className="flex items-center space-x-2">
						<UserCheck className="h-4 w-4 text-muted-foreground" />
						<div className="text-xs truncate">
							{driverName || "Not assigned"}
						</div>
					</div>
				);
			},
			size: 120,
		});
	}

	return columns;
};

// Pre-configured column sets for easier use
export const bookingTableColumns = (options: BookingTableColumnsOptions = {}) => 
	createBookingTableColumns({ ...options, compact: false });

export const compactBookingTableColumns = (options: BookingTableColumnsOptions = {}) => 
	createBookingTableColumns({ ...options, compact: true });