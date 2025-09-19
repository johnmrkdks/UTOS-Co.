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
import { Eye, MoreHorizontal, Car, UserCheck, Edit, Activity, UserX, X, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { Booking } from "./booking-table-columns";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import { useUnassignDriverMutation } from "../_hooks/query/use-unassign-driver-mutation";
import { useUnassignCarMutation } from "../_hooks/query/use-unassign-car-mutation";

interface BookingTableRowActionsProps {
	row: Row<Booking>;
	onEditBooking?: (booking: Booking) => void;
	onCancelBooking?: (booking: Booking) => void;
	onArchiveBooking?: (booking: Booking, isArchiving: boolean) => void;
	onDeleteBooking?: (booking: Booking) => void;
}

export function BookingTableRowActions({ row, onEditBooking, onCancelBooking, onArchiveBooking, onDeleteBooking }: BookingTableRowActionsProps) {
	const { 
		openBookingDetailsDialog, 
		openAssignDriverDialog,
		openAssignCarDialog,
		openEditBookingDialog,
		openChangeStatusDialog
	} = useBookingManagementModalProvider();
	const unassignDriverMutation = useUnassignDriverMutation();
	const unassignCarMutation = useUnassignCarMutation();
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

	const handleUnassignDriver = (booking: Booking) => {
		console.log("🚫 Unassigning driver from booking:", booking.id);
		(unassignDriverMutation.mutate as any)({ bookingId: booking.id });
	};

	const handleUnassignCar = (booking: Booking) => {
		console.log("🚫 Unassigning car from booking:", booking.id);
		(unassignCarMutation.mutate as any)({ bookingId: booking.id });
	};

	const handleArchiveBooking = (booking: Booking) => {
		console.log("📁 Archiving booking:", booking.id);
		if (onArchiveBooking) {
			// Toggle archive state: null/false -> true, true -> false
			const newArchiveState = booking.isArchived ? false : true;
			onArchiveBooking(booking, newArchiveState);
		}
	};

	const handleDeleteBooking = (booking: Booking) => {
		console.log("🗑️ Deleting booking:", booking.id);
		if (onDeleteBooking) {
			onDeleteBooking(booking);
		}
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
						
						{/* Unassign driver - only show if driver is assigned and status allows */}
						{booking.driver && ['confirmed', 'driver_assigned'].includes(booking.status) && (
							<DropdownMenuItem 
								onClick={() => handleUnassignDriver(booking)}
								className="text-orange-600 hover:text-orange-700"
							>
								<UserX className="mr-2 h-4 w-4" />
								Unassign driver
							</DropdownMenuItem>
						)}
						
						{/* Car assignment - especially useful for package bookings */}
						{(booking.bookingType === "package" || !booking.car) && (
							<DropdownMenuItem onClick={() => handleAssignCar(booking)}>
								<Car className="mr-2 h-4 w-4" />
								{booking.car ? "Reassign car" : "Assign car"}
							</DropdownMenuItem>
						)}

						{/* Unassign car - only show if car is assigned */}
						{booking.car && (
							<DropdownMenuItem 
								onClick={() => handleUnassignCar(booking)}
								className="text-orange-600 hover:text-orange-700"
							>
								<X className="mr-2 h-4 w-4" />
								Unassign car
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
					</>
				)}

				{/* Archive/Restore Actions */}
				<DropdownMenuItem
					onClick={() => handleArchiveBooking(booking)}
					className={booking.isArchived ? "text-blue-600 hover:text-blue-700" : "text-orange-600 hover:text-orange-700"}
				>
					{booking.isArchived ? (
						<>
							<ArchiveRestore className="mr-2 h-4 w-4" />
							Restore booking
						</>
					) : (
						<>
							<Archive className="mr-2 h-4 w-4" />
							Archive booking
						</>
					)}
				</DropdownMenuItem>

				{/* Delete Action */}
				<DropdownMenuItem
					onClick={() => handleDeleteBooking(booking)}
					className="text-red-600 hover:text-red-700"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete permanently
				</DropdownMenuItem>

			</DropdownMenuContent>
		</DropdownMenu>
	);
}