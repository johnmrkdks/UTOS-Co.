import type { Row } from "@tanstack/react-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	Activity,
	Archive,
	ArchiveRestore,
	Ban,
	Car,
	CheckCircle,
	Edit,
	Eye,
	MoreHorizontal,
	Trash2,
	UserCheck,
	UserX,
	X,
} from "lucide-react";
import { useState } from "react";
import { canCancelBooking } from "@/lib/booking-status-config";
import { useUnassignCarMutation } from "../_hooks/query/use-unassign-car-mutation";
import { useUnassignDriverMutation } from "../_hooks/query/use-unassign-driver-mutation";
import { useBookingManagementModalProvider } from "../_hooks/use-booking-management-modal-provider";
import type { Booking } from "./booking-table-columns";

interface BookingTableRowActionsProps {
	row: Row<Booking>;
	onEditBooking?: (booking: Booking) => void;
	onCancelBooking?: (booking: Booking) => void;
	onArchiveBooking?: (booking: Booking, isArchiving: boolean) => void;
	onDeleteBooking?: (booking: Booking) => void;
}

export function BookingTableRowActions({
	row,
	onEditBooking,
	onCancelBooking,
	onArchiveBooking,
	onDeleteBooking,
}: BookingTableRowActionsProps) {
	const {
		openBookingDetailsDialog,
		openAssignDriverDialog,
		openAssignCarDialog,
		openEditBookingDialog,
		openChangeStatusDialog,
	} = useBookingManagementModalProvider();
	const unassignDriverMutation = useUnassignDriverMutation();
	const unassignCarMutation = useUnassignCarMutation();
	const booking = row.original;

	// Confirmation dialog states
	const [unassignDriverDialogOpen, setUnassignDriverDialogOpen] =
		useState(false);
	const [unassignCarDialogOpen, setUnassignCarDialogOpen] = useState(false);

	const handleAssignDriver = (booking: Booking) => {
		openAssignDriverDialog(booking);
	};

	const handleAssignCar = (booking: Booking) => {
		openAssignCarDialog(booking);
	};

	const handleEditBooking = (booking: Booking) => {
		if (onEditBooking) {
			onEditBooking(booking);
		} else {
			openEditBookingDialog(booking);
		}
	};

	const handleChangeStatus = (booking: Booking) => {
		openChangeStatusDialog(booking);
	};

	const handleUnassignDriver = (booking: Booking) => {
		setUnassignDriverDialogOpen(true);
	};

	const handleUnassignCar = (booking: Booking) => {
		setUnassignCarDialogOpen(true);
	};

	const confirmUnassignDriver = () => {
		(unassignDriverMutation.mutate as any)({ bookingId: booking.id });
		setUnassignDriverDialogOpen(false);
	};

	const confirmUnassignCar = () => {
		(unassignCarMutation.mutate as any)({ bookingId: booking.id });
		setUnassignCarDialogOpen(false);
	};

	const handleArchiveBooking = (booking: Booking) => {
		if (onArchiveBooking) {
			const newArchiveState = booking.isArchived ? false : true;
			onArchiveBooking(booking, newArchiveState);
		}
	};

	const handleDeleteBooking = (booking: Booking) => {
		if (onDeleteBooking) {
			onDeleteBooking(booking);
		}
	};

	return (
		<>
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
							{/* Driver assignment - only allow if booking is confirmed AND has a car assigned */}
							{[
								"confirmed",
								"driver_assigned",
								"driver_en_route",
								"arrived_pickup",
								"passenger_on_board",
								"in_progress",
							].includes(booking.status) ? (
								// For confirmed status, require car to be assigned first
								booking.status === "confirmed" && !booking.car ? (
									<DropdownMenuItem
										disabled
										className="flex-col items-start py-2"
									>
										<div className="flex w-full items-center">
											<UserCheck className="mr-2 h-4 w-4 opacity-50" />
											<span className="opacity-50">Assign driver</span>
										</div>
										<span className="ml-6 text-muted-foreground text-xs">
											(Assign car first)
										</span>
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onClick={() => handleAssignDriver(booking)}>
										<UserCheck className="mr-2 h-4 w-4" />
										{booking.driver ? "Reassign driver" : "Assign driver"}
									</DropdownMenuItem>
								)
							) : (
								<DropdownMenuItem
									disabled
									className="flex-col items-start py-2"
								>
									<div className="flex w-full items-center">
										<UserCheck className="mr-2 h-4 w-4 opacity-50" />
										<span className="opacity-50">Assign driver</span>
									</div>
									<span className="ml-6 text-muted-foreground text-xs">
										(Confirm first)
									</span>
								</DropdownMenuItem>
							)}

							{/* Unassign driver - only show if driver is assigned and status allows */}
							{booking.driver &&
								["confirmed", "driver_assigned"].includes(booking.status) && (
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

					{/* Cancel booking - only for cancellable statuses */}
					{canCancelBooking(booking.status) && onCancelBooking && (
						<DropdownMenuItem
							onClick={() => onCancelBooking(booking)}
							className="text-red-600 hover:text-red-700"
						>
							<Ban className="mr-2 h-4 w-4" />
							Cancel booking
						</DropdownMenuItem>
					)}

					{/* Archive/Restore Actions */}
					<DropdownMenuItem
						onClick={() => handleArchiveBooking(booking)}
						className={
							booking.isArchived
								? "text-blue-600 hover:text-blue-700"
								: "text-orange-600 hover:text-orange-700"
						}
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

			{/* Unassign Driver Confirmation Dialog */}
			<AlertDialog
				open={unassignDriverDialogOpen}
				onOpenChange={setUnassignDriverDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unassign Driver</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unassign the driver from this booking?
							The booking status will be changed back to "Confirmed" and will
							need a new driver assignment.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmUnassignDriver}
							className="bg-orange-600 hover:bg-orange-700"
						>
							Unassign Driver
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Unassign Car Confirmation Dialog */}
			<AlertDialog
				open={unassignCarDialogOpen}
				onOpenChange={setUnassignCarDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unassign Car</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unassign the car from this booking? This
							will remove the vehicle assignment and the booking will need a new
							car to be assigned.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmUnassignCar}
							className="bg-orange-600 hover:bg-orange-700"
						>
							Unassign Car
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
