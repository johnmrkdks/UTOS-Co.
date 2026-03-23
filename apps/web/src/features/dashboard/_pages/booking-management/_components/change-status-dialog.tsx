import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { Activity, Loader } from "lucide-react";
import React, { useState } from "react";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";
import type { Booking } from "./booking-table-columns";

interface ChangeStatusDialogProps {
	booking: Booking | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// All possible booking statuses for display purposes
const allBookingStatuses = [
	{
		value: "pending",
		label: "Pending",
		color: "bg-yellow-100 text-yellow-800",
	},
	{
		value: "confirmed",
		label: "Confirmed",
		color: "bg-blue-100 text-blue-800",
	},
	{
		value: "driver_assigned",
		label: "Driver Assigned",
		color: "bg-purple-100 text-purple-800",
	},
	{
		value: "driver_en_route",
		label: "Driver En Route",
		color: "bg-indigo-100 text-indigo-800",
	},
	{
		value: "arrived_pickup",
		label: "Arrived at Pickup",
		color: "bg-cyan-100 text-cyan-800",
	},
	{
		value: "passenger_on_board",
		label: "Passenger On Board",
		color: "bg-green-100 text-green-800",
	},
	{
		value: "in_progress",
		label: "In Progress (Legacy)",
		color: "bg-green-100 text-green-800",
	},
	{
		value: "dropped_off",
		label: "Dropped Off",
		color: "bg-orange-100 text-orange-800",
	},
	{
		value: "awaiting_extras",
		label: "Awaiting Extras",
		color: "bg-amber-100 text-amber-800",
	},
	{
		value: "completed",
		label: "Completed",
		color: "bg-gray-100 text-gray-800",
	},
	{ value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

// Statuses available for manual selection (excludes driver_assigned and in_progress)
const selectableBookingStatuses = [
	{
		value: "pending",
		label: "Pending",
		color: "bg-yellow-100 text-yellow-800",
	},
	{
		value: "confirmed",
		label: "Confirmed",
		color: "bg-blue-100 text-blue-800",
	},
	{
		value: "driver_en_route",
		label: "Driver En Route",
		color: "bg-indigo-100 text-indigo-800",
	},
	{
		value: "arrived_pickup",
		label: "Arrived at Pickup",
		color: "bg-cyan-100 text-cyan-800",
	},
	{
		value: "passenger_on_board",
		label: "Passenger On Board",
		color: "bg-green-100 text-green-800",
	},
	{
		value: "dropped_off",
		label: "Dropped Off",
		color: "bg-orange-100 text-orange-800",
	},
	{
		value: "awaiting_extras",
		label: "Awaiting Extras",
		color: "bg-amber-100 text-amber-800",
	},
	{
		value: "completed",
		label: "Completed",
		color: "bg-gray-100 text-gray-800",
	},
	{ value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export function ChangeStatusDialog({
	booking,
	open,
	onOpenChange,
}: ChangeStatusDialogProps) {
	const [selectedStatus, setSelectedStatus] = useState<string>(
		booking?.status || "",
	);
	const updateStatusMutation = useUpdateBookingStatusMutation();

	const handleStatusChange = () => {
		if (!booking?.id || !selectedStatus) return;

		updateStatusMutation.mutate(
			{
				id: booking.id,
				status: selectedStatus as any,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	};

	const currentStatusInfo = allBookingStatuses.find(
		(s) => s.value === booking?.status,
	);
	const newStatusInfo = allBookingStatuses.find(
		(s) => s.value === selectedStatus,
	);

	// Reset selected status when booking changes
	React.useEffect(() => {
		if (booking) {
			setSelectedStatus(booking.status);
		}
	}, [booking]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-primary" />
						Update Booking Status
					</DialogTitle>
					<DialogDescription>
						Update the status for booking {booking?.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Status */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Current Status</label>
						<div className="flex items-center gap-2">
							{currentStatusInfo && (
								<Badge className={currentStatusInfo.color}>
									{currentStatusInfo.label}
								</Badge>
							)}
						</div>
					</div>

					{/* New Status Selection */}
					<div className="space-y-2">
						<label className="font-medium text-sm">New Status</label>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger>
								<SelectValue placeholder="Select new status" />
							</SelectTrigger>
							<SelectContent>
								{selectableBookingStatuses.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										<div className="flex items-center gap-2">
											<div
												className={`h-3 w-3 rounded-full ${status.color.replace("text-", "bg-").replace("bg-", "").replace("-100", "-500")}`}
											/>
											<span>{status.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Status Preview */}
					{selectedStatus && selectedStatus !== booking?.status && (
						<div className="rounded-lg bg-gray-50 p-3">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Status will change to:</span>
								{newStatusInfo && (
									<Badge className={newStatusInfo.color}>
										{newStatusInfo.label}
									</Badge>
								)}
							</div>
						</div>
					)}

					<div className="flex gap-3 pt-4">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleStatusChange}
							disabled={
								!selectedStatus ||
								selectedStatus === booking?.status ||
								updateStatusMutation.isPending
							}
							className="flex-1 bg-primary hover:bg-primary/90"
						>
							{updateStatusMutation.isPending ? (
								<>
									<Loader className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Status"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
