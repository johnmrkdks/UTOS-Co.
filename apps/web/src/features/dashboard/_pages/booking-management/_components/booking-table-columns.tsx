import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, User, Car, UserCheck, Edit, Ban, Phone, Mail } from "lucide-react";

// Booking interface
export interface Booking {
	id: string;
	bookingType: string;
	status: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
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
	createdAt: string;
	[key: string]: any;
}

// Column configuration functions
export const createSelectColumn = (
	selectedBookings: string[],
	toggleBookingSelection: (id: string) => void,
	toggleAllSelection: () => void
): ColumnDef<Booking> => ({
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
	size: 50,
});

export const createIdColumn = (): ColumnDef<Booking> => ({
	accessorKey: "id",
	header: ({ column }) => (
		<DataTableColumnHeader column={column} title="ID" />
	),
	cell: ({ row }) => (
		<div className="font-mono text-sm truncate">
			#{row.getValue("id")?.toString().slice(-6)}
		</div>
	),
	size: 80,
});

export const createTypeColumn = (): ColumnDef<Booking> => ({
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
	size: 100,
});

export const createStatusColumn = (): ColumnDef<Booking> => ({
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
	size: 130,
});

export const createCustomerColumn = (): ColumnDef<Booking> => ({
	accessorKey: "customerName",
	header: ({ column }) => (
		<DataTableColumnHeader column={column} title="Customer" />
	),
	cell: ({ row }) => (
		<div className="flex items-center space-x-2">
			<User className="h-4 w-4 text-muted-foreground" />
			<div>
				<div className="font-medium truncate">{row.getValue("customerName")}</div>
				<div className="text-sm text-muted-foreground flex items-center gap-1">
					<Phone className="h-3 w-3" />
					<span className="truncate">{row.original.customerPhone}</span>
				</div>
			</div>
		</div>
	),
	size: 160,
});

export const createRouteColumn = (): ColumnDef<Booking> => ({
	accessorKey: "route",
	header: "Route",
	cell: ({ row }) => (
		<div>
			<div className="text-sm font-medium truncate">
				From: {row.original.originAddress}
			</div>
			<div className="text-sm text-muted-foreground truncate">
				To: {row.original.destinationAddress}
			</div>
		</div>
	),
	size: 200,
});

export const createPickupTimeColumn = (): ColumnDef<Booking> => ({
	accessorKey: "scheduledPickupTime",
	header: ({ column }) => (
		<DataTableColumnHeader column={column} title="Pickup Time" />
	),
	cell: ({ row }) => {
		const date = new Date(row.getValue("scheduledPickupTime"));
		return (
			<div className="text-sm">
				<div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
				<div className="text-muted-foreground">{format(date, "HH:mm")}</div>
			</div>
		);
	},
	size: 120,
});

export const createAmountColumn = (): ColumnDef<Booking> => ({
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
	size: 100,
});

export const createVehicleColumn = (): ColumnDef<Booking> => ({
	accessorKey: "car",
	header: "Vehicle",
	cell: ({ row }) => (
		<div className="flex items-center space-x-2">
			<Car className="h-4 w-4 text-muted-foreground" />
			<div className="text-sm truncate">
				{row.original.car?.name || "Not assigned"}
			</div>
		</div>
	),
	size: 120,
});

export const createDriverColumn = (): ColumnDef<Booking> => ({
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
				<div className="text-sm truncate">
					{driverName || "Not assigned"}
				</div>
			</div>
		);
	},
	size: 120,
});

export const createActionsColumn = (
	openBookingDetailsDialog: (id: string) => void,
	openAssignDriverDialog?: (booking: Booking) => void,
	onEditBooking?: (booking: Booking) => void,
	onCancelBooking?: (booking: Booking) => void
): ColumnDef<Booking> => ({
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
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => openBookingDetailsDialog(booking.id)}
					>
						<Eye className="mr-2 h-4 w-4" />
						View details
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{onEditBooking && (
						<DropdownMenuItem onClick={() => onEditBooking(booking)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit booking
						</DropdownMenuItem>
					)}
					{openAssignDriverDialog && booking.status !== "cancelled" && (
						<DropdownMenuItem onClick={() => openAssignDriverDialog(booking)}>
							<UserCheck className="mr-2 h-4 w-4" />
							{booking.driver ? "Reassign driver" : "Assign driver"}
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					{onCancelBooking && booking.status !== "cancelled" && booking.status !== "completed" && (
						<DropdownMenuItem 
							className="text-destructive"
							onClick={() => onCancelBooking(booking)}
						>
							<Ban className="mr-2 h-4 w-4" />
							Cancel booking
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
	size: 80,
});

// Pre-configured column sets
export const getAllBookingsColumns = (
	selectedBookings: string[],
	toggleBookingSelection: (id: string) => void,
	toggleAllSelection: () => void,
	openBookingDetailsDialog: (id: string) => void,
	openAssignDriverDialog?: (booking: Booking) => void,
	onEditBooking?: (booking: Booking) => void,
	onCancelBooking?: (booking: Booking) => void
): ColumnDef<Booking>[] => [
	createSelectColumn(selectedBookings, toggleBookingSelection, toggleAllSelection),
	createIdColumn(),
	createTypeColumn(),
	createStatusColumn(),
	createCustomerColumn(),
	createRouteColumn(),
	createPickupTimeColumn(),
	createAmountColumn(),
	createVehicleColumn(),
	createDriverColumn(),
	createActionsColumn(openBookingDetailsDialog, openAssignDriverDialog, onEditBooking, onCancelBooking),
];

export const getCompactBookingsColumns = (
	selectedBookings: string[],
	toggleBookingSelection: (id: string) => void,
	toggleAllSelection: () => void,
	openBookingDetailsDialog: (id: string) => void,
	openAssignDriverDialog?: (booking: Booking) => void
): ColumnDef<Booking>[] => [
	createSelectColumn(selectedBookings, toggleBookingSelection, toggleAllSelection),
	createIdColumn(),
	createStatusColumn(),
	createCustomerColumn(),
	createPickupTimeColumn(),
	createAmountColumn(),
	createActionsColumn(openBookingDetailsDialog, openAssignDriverDialog),
];

