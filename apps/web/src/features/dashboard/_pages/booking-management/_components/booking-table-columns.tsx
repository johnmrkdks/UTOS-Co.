import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { format } from "date-fns";
import { Car, CircleDot, Phone, User, UserCheck } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { BookingTableRowActions } from "./booking-table-row-actions";

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
	stops?: Array<{ id: string; address: string }>;
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
	paymentStatus?: string | null;
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

export const createBookingTableColumns = (
	options: BookingTableColumnsOptions = {},
): ColumnDef<Booking>[] => {
	const {
		selectedBookings = [],
		onToggleBookingSelection,
		onToggleAllSelection,
		onEditBooking,
		onCancelBooking,
		onArchiveBooking,
		onDeleteBooking,
		enableRowSelection = false,
		compact = false,
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
			<div onClick={(e) => e.stopPropagation()}>
				<BookingTableRowActions
					row={row}
					onEditBooking={onEditBooking}
					onCancelBooking={onCancelBooking}
					onArchiveBooking={onArchiveBooking}
					onDeleteBooking={onDeleteBooking}
				/>
			</div>
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
			<div className="truncate font-mono text-xs">
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
					<Badge
						variant={
							type === "package"
								? "default"
								: type === "offload"
									? "destructive"
									: "secondary"
						}
					>
						{type === "package"
							? "Package"
							: type === "offload"
								? "Offload"
								: "Custom"}
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

	// Payment Status column
	columns.push({
		id: "paymentStatus",
		accessorKey: "paymentStatus",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Payment" />
		),
		cell: ({ row }) => {
			const status = (row.original.paymentStatus ?? "—") as string;
			if (!status || status === "—")
				return <span className="text-muted-foreground text-xs">—</span>;
			const config: Record<
				string,
				{
					label: string;
					variant: "default" | "secondary" | "destructive" | "outline";
				}
			> = {
				pending_payment: { label: "Pending", variant: "secondary" },
				payment_authorized: { label: "Authorized", variant: "default" },
				awaiting_capture: { label: "Awaiting Capture", variant: "outline" },
				payment_captured: { label: "Captured", variant: "default" },
				payment_failed: { label: "Failed", variant: "destructive" },
				payment_cancelled: { label: "Cancelled", variant: "destructive" },
				refunded: { label: "Refunded", variant: "secondary" },
			};
			const c = config[status] ?? {
				label: status.replace(/_/g, " "),
				variant: "outline" as const,
			};
			return (
				<Badge variant={c.variant} className="text-xs">
					{c.label}
				</Badge>
			);
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
			<div className="flex min-w-0 items-center space-x-2 overflow-hidden">
				<User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
				<div className="min-w-0 flex-1 overflow-hidden">
					<div className="flex min-w-0 items-center gap-1.5">
						<span className="min-w-0 truncate font-medium text-xs">
							{row.getValue("customerName") as string}
						</span>
						{row.original.isGuestBooking && (
							<Badge
								variant="outline"
								className="h-4 flex-shrink-0 px-1.5 py-0 font-normal text-[10px]"
							>
								Guest
							</Badge>
						)}
					</div>
					<div className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs">
						<Phone className="h-3 w-3 flex-shrink-0" />
						<span className="min-w-0 truncate">
							{row.original.customerPhone}
						</span>
					</div>
				</div>
			</div>
		),
		size: 200,
		meta: { className: "min-w-0 max-w-[200px] overflow-hidden" },
	});

	if (!compact) {
		// Route column
		columns.push({
			id: "route",
			accessorKey: "route",
			header: "Route",
			cell: ({ row }) => (
				<div className="min-w-0 space-y-0.5 overflow-hidden">
					<div
						className="block truncate font-medium text-xs"
						title={row.original.originAddress}
					>
						From: {row.original.originAddress}
					</div>
					{row.original.stops && row.original.stops.length > 0 && (
						<div className="block truncate text-blue-600 text-xs">
							{row.original.stops.length} stop
							{row.original.stops.length > 1 ? "s" : ""}
						</div>
					)}
					<div
						className="block truncate text-muted-foreground text-xs"
						title={row.original.destinationAddress}
					>
						To: {row.original.destinationAddress}
					</div>
				</div>
			),
			size: 260,
			meta: { className: "min-w-0 max-w-[260px] overflow-hidden" },
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
							<span className="text-muted-foreground text-xs">—</span>
						</div>
					);
				}
				return (
					<div className="flex items-center gap-1">
						<CircleDot className="h-3 w-3 text-blue-500" />
						<Badge
							variant="secondary"
							className="border-blue-200 bg-blue-50 px-1.5 py-0.5 text-blue-700 text-xs"
						>
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
			return <div className="font-medium text-xs">${amount.toFixed(2)}</div>;
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
				<div className="flex min-w-0 items-center space-x-2 overflow-hidden">
					<Car className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
					<div className="min-w-0 truncate text-xs">
						{row.original.car?.name || "Not assigned"}
					</div>
				</div>
			),
			size: 140,
			meta: { className: "min-w-0" },
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
					booking.driver?.user?.name || // Nested driver.user.name
					booking.driver?.name || // Direct driver.name
					booking.driverName || // Flat driverName field
					booking.assignedDriver?.name || // assignedDriver.name
					booking.assignedDriver?.user?.name; // assignedDriver.user.name

				return (
					<div className="flex items-center space-x-2">
						<UserCheck className="h-4 w-4 text-muted-foreground" />
						<div className="truncate text-xs">
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

export const compactBookingTableColumns = (
	options: BookingTableColumnsOptions = {},
) => createBookingTableColumns({ ...options, compact: true });
