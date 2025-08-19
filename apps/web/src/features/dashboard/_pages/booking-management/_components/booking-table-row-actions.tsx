import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Row } from "@tanstack/react-table";
import { Eye, MoreHorizontal, User, Car, UserCheck, Edit, Ban, Phone, Mail } from "lucide-react";
import type { Booking } from "./booking-table-columns";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";

interface BookingTableRowActionsProps {
	row: Row<Booking>;
	onEditBooking?: (booking: Booking) => void;
	onCancelBooking?: (booking: Booking) => void;
}

export function BookingTableRowActions({ row, onEditBooking, onCancelBooking }: BookingTableRowActionsProps) {
	const { openBookingDetailsDialog, openAssignDriverDialog } = useBookingManagementModalProvider();
	const booking = row.original;

	const handleAssignDriver = (booking: Booking) => {
		console.log("🚗 Opening assign driver dialog for booking:", booking.id);
		openAssignDriverDialog(booking);
	};

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
				{booking.status !== "cancelled" && (
					<DropdownMenuItem onClick={() => handleAssignDriver(booking)}>
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
}