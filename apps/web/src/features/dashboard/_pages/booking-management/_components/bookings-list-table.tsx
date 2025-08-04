import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@/components/tables/data-table";
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { useGetBookingsQuery } from "../_hooks/query/use-get-bookings-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, User, Car } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";

interface BookingsListTableProps {
	bookingType?: "package" | "custom";
	status?: string;
}

// Mock type for booking data - replace with actual type from server
interface Booking {
	id: string;
	bookingType: "package" | "custom";
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
		name: string;
		brand: { name: string };
		model: { name: string };
	};
	user?: {
		name: string;
		email: string;
	};
	createdAt: string;
}

export function BookingsListTable({ bookingType, status }: BookingsListTableProps) {
	const { openBookingDetailsDialog } = useBookingManagementModalProvider();
	
	const bookingsQuery = useGetBookingsQuery({
		page: 1,
		limit: 50,
	});

	const columns: ColumnDef<Booking>[] = [
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
				const statusColors = {
					pending: "warning",
					confirmed: "success",
					driver_assigned: "info",
					in_progress: "primary",
					completed: "success",
					cancelled: "destructive",
				};
				return (
					<Badge variant={statusColors[status as keyof typeof statusColors] || "secondary"}>
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
						{row.original.car?.brand?.name} {row.original.car?.model?.name}
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
								Edit booking
							</DropdownMenuItem>
							<DropdownMenuItem>
								Assign driver
							</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
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

	return (
		<DataTable
			columns={columns}
			data={bookingsQuery.data?.items || []}
			searchKey="customerName"
			searchPlaceholder="Search by customer name..."
		/>
	);
}