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
import { Eye, MoreHorizontal, Car, UserCheck, Edit, Activity } from "lucide-react";
import type { Booking } from "./booking-table-columns";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";

interface BookingTableRowActionsProps {
	row: Row<Booking>;
	onEditBooking?: (booking: Booking) => void;
}

export function BookingTableRowActions({ row, onEditBooking }: BookingTableRowActionsProps) {
	const { 
		openBookingDetailsDialog, 
		openAssignDriverDialog,
		openAssignCarDialog,
		openEditBookingDialog,
		openChangeStatusDialog
	} = useBookingManagementModalProvider();
	const booking = row.original;

	const handleAssignDriver = (booking: Booking) => {
		console.log("🚗 Opening assign driver dialog for booking:", booking.id);
		openAssignDriverDialog(booking);
	};

	const handleAssignCar = (booking: Booking) => {
		console.log("🚙 Opening assign car dialog for booking:", booking.id);
		openAssignCarDialog(booking);
	};

	const handleEditBooking = (booking: Booking) => {
		console.log("✏️ Opening edit booking dialog for booking:", booking.id);
		if (onEditBooking) {
			onEditBooking(booking);
		} else {
			openEditBookingDialog(booking);
		}
	};

	const handleChangeStatus = (booking: Booking) => {
		console.log("📋 Opening update status dialog for booking:", booking.id);
		openChangeStatusDialog(booking);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => openBookingDetailsDialog(booking.id)}
				>
					<Eye className="mr-2 h-4 w-4" />
					View details
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				
				{/* Edit Actions */}
				<DropdownMenuItem onClick={() => handleEditBooking(booking)}>
					<Edit className="mr-2 h-4 w-4" />
					Edit booking
				</DropdownMenuItem>
				
				<DropdownMenuItem onClick={() => handleChangeStatus(booking)}>
					<Activity className="mr-2 h-4 w-4" />
					Update status
				</DropdownMenuItem>
				
				<DropdownMenuSeparator />
				
				{/* Assignment Actions */}
				{booking.status !== "cancelled" && booking.status !== "completed" && (
					<>
						<DropdownMenuItem onClick={() => handleAssignDriver(booking)}>
							<UserCheck className="mr-2 h-4 w-4" />
							{booking.driver ? "Reassign driver" : "Assign driver"}
						</DropdownMenuItem>
						
						{/* Car assignment - especially useful for package bookings */}
						{(booking.bookingType === "package" || !booking.car) && (
							<DropdownMenuItem onClick={() => handleAssignCar(booking)}>
								<Car className="mr-2 h-4 w-4" />
								{booking.car ? "Reassign car" : "Assign car"}
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
					</>
				)}
				
			</DropdownMenuContent>
		</DropdownMenu>
	);
}