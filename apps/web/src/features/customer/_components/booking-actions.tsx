import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertTriangle,
	Car,
	CheckCircle,
	Clock,
	DollarSign,
	Edit3,
	Eye,
	Info,
	Loader2,
	MoreVertical,
	Phone,
	Save,
	Star,
	User,
	X,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useCancelBookingMutation } from "../_hooks/query/use-cancel-booking-mutation";
import { useEditBookingMutation } from "../_hooks/query/use-edit-booking-mutation";

interface BookingActionsProps {
	booking: any;
	size?: "sm" | "default" | "lg";
	variant?: "default" | "compact" | "full" | "dropdown";
	className?: string;
	onViewDetails?: (booking: any) => void;
}

export function BookingActions({
	booking,
	size = "sm",
	variant = "default",
	className,
	onViewDetails,
}: BookingActionsProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const [isDriverInfoDialogOpen, setIsDriverInfoDialogOpen] = useState(false);
	const [cancellationReason, setCancellationReason] = useState("");
	const [editData, setEditData] = useState({
		originAddress: booking?.originAddress || "",
		destinationAddress: booking?.destinationAddress || "",
		scheduledPickupTime: booking?.scheduledPickupTime || "",
		customerName: booking?.customerName || "",
		customerPhone: booking?.customerPhone || "",
		customerEmail: booking?.customerEmail || "",
		passengerCount: booking?.passengerCount || 1,
		specialRequests: booking?.specialRequests || "",
	});

	// ✅ BYPASSING validation - allow editing/cancelling regardless of time restrictions
	const validation = {
		canEdit: true, // Always allow editing
		canCancel: true, // Always allow cancelling
		editReason: booking?.editReason,
		cancelReason: booking?.cancelReason,
		hoursUntilPickup: booking?.hoursUntilPickup,
		hasDriverAssigned: booking?.hasDriverAssigned,
		cancellationFeePercentage: 0, // Default value
	};

	const validationLoading = false; // No loading since data is already included

	// Mutations
	const editMutation = useEditBookingMutation();
	const cancelMutation = useCancelBookingMutation();

	const handleEdit = () => {
		if (!booking?.id) return;
		// ✅ BYPASSING canEdit check

		editMutation.mutate({
			bookingId: booking.id,
			...editData,
		});
	};

	const handleCancel = () => {
		if (!booking?.id) return;
		// ✅ BYPASSING canCancel check

		cancelMutation.mutate({
			bookingId: booking.id,
			cancellationReason: cancellationReason || undefined,
		});
	};

	const formatPrice = (priceInCents: number) =>
		`$${(priceInCents / 100).toFixed(2)}`;

	const getTimeUntilPickup = () => {
		if (!validation?.hoursUntilPickup) return "";
		const hours = Math.floor(validation.hoursUntilPickup);
		const minutes = Math.floor((validation.hoursUntilPickup % 1) * 60);

		if (hours > 24) {
			return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""}`;
		}
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	// Loading state
	if (validationLoading) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				<span className="text-muted-foreground text-xs">
					Checking permissions...
				</span>
			</div>
		);
	}

	// No booking or completed/cancelled
	if (!booking || ["completed", "cancelled"].includes(booking.status)) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Badge variant="outline" className="text-xs">
					<CheckCircle className="mr-1 h-3 w-3" />
					{booking?.status === "completed" ? "Completed" : "Cancelled"}
				</Badge>
			</div>
		);
	}

	// Dropdown variant - return menu items only (no wrapper dropdown)
	if (variant === "dropdown") {
		return (
			<>
				{onViewDetails && (
					<>
						<DropdownMenuItem onClick={() => onViewDetails(booking)}>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}

				{booking?.driver && (
					<>
						<DropdownMenuItem onClick={() => setIsDriverInfoDialogOpen(true)}>
							<Car className="mr-2 h-4 w-4" />
							Driver Info
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}

				{validation?.canEdit && (
					<DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
						<Edit3 className="mr-2 h-4 w-4" />
						Edit Booking
					</DropdownMenuItem>
				)}

				{validation?.canCancel && (
					<DropdownMenuItem
						onClick={() => setIsCancelDialogOpen(true)}
						className="text-red-600 focus:text-red-600"
					>
						<XCircle className="mr-2 h-4 w-4" />
						Cancel Booking
					</DropdownMenuItem>
				)}

				{!validation?.canEdit && !validation?.canCancel && (
					<DropdownMenuItem disabled>
						<Info className="mr-2 h-4 w-4" />
						No actions available
					</DropdownMenuItem>
				)}
			</>
		);
	}

	return (
		<>
			<TooltipProvider>
				<div
					className={cn(
						"flex items-center gap-2",
						variant === "compact" && "gap-2",
						className,
					)}
				>
					{/* Edit Button */}
					{validation?.canEdit ? (
						<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
							<DialogTrigger asChild>
								<Button
									size={size}
									variant="outline"
									className={cn(
										"border-blue-200 text-blue-600 hover:border-blue-300 hover:text-blue-700",
										variant === "compact" && "h-7 flex-1 text-xs",
									)}
								>
									<Edit3 className="mr-1 h-4 w-4" />
									Edit
								</Button>
							</DialogTrigger>
						</Dialog>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size={size}
									variant="outline"
									disabled
									className={cn(
										"border-gray-200 text-gray-400",
										variant === "compact" && "h-7 flex-1 text-xs",
									)}
								>
									<Edit3 className="mr-1 h-4 w-4" />
									Edit
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div className="flex items-center gap-2 text-xs">
									<Info className="h-3 w-3" />
									{validation?.editReason || "Editing not available"}
								</div>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Cancel Button */}
					{validation?.canCancel ? (
						<AlertDialog
							open={isCancelDialogOpen}
							onOpenChange={setIsCancelDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Button
									size={size}
									variant="outline"
									className={cn(
										"border-red-200 text-red-600 hover:border-red-300 hover:text-red-700",
										variant === "compact" && "h-7 flex-1 text-xs",
									)}
								>
									<XCircle className="mr-1 h-4 w-4" />
									Cancel
								</Button>
							</AlertDialogTrigger>
						</AlertDialog>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size={size}
									variant="outline"
									disabled
									className={cn(
										"border-gray-200 text-gray-400",
										variant === "compact" && "h-7 flex-1 text-xs",
									)}
								>
									<XCircle className="mr-1 h-4 w-4" />
									Cancel
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div className="flex items-center gap-2 text-xs">
									<Info className="h-3 w-3" />
									{validation?.cancelReason || "Cancellation not available"}
								</div>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Time indicator for compact variant */}
					{variant === "compact" && validation?.hoursUntilPickup && (
						<Badge variant="outline" className="text-xs">
							<Clock className="mr-1 h-3 w-3" />
							{getTimeUntilPickup()}
						</Badge>
					)}
				</div>
			</TooltipProvider>

			{/* Edit Dialog - Always rendered for all variants */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit3 className="h-5 w-5" />
							Edit Booking
						</DialogTitle>
						<DialogDescription>
							Make changes to your booking. Time remaining:{" "}
							{getTimeUntilPickup()}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Route Information */}
						<div className="space-y-4">
							<h4 className="font-semibold text-sm">Route Details</h4>
							<div className="grid gap-4">
								<div>
									<Label htmlFor="originAddress">Pickup Address</Label>
									<Input
										id="originAddress"
										value={editData.originAddress}
										onChange={(e) =>
											setEditData({
												...editData,
												originAddress: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="destinationAddress">
										Destination Address
									</Label>
									<Input
										id="destinationAddress"
										value={editData.destinationAddress}
										onChange={(e) =>
											setEditData({
												...editData,
												destinationAddress: e.target.value,
											})
										}
									/>
								</div>
							</div>
						</div>

						{/* Customer Information */}
						<div className="space-y-4">
							<h4 className="font-semibold text-sm">Customer Details</h4>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="customerName">Name</Label>
									<Input
										id="customerName"
										value={editData.customerName}
										onChange={(e) =>
											setEditData({ ...editData, customerName: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerPhone">Phone</Label>
									<Input
										id="customerPhone"
										value={editData.customerPhone}
										onChange={(e) =>
											setEditData({
												...editData,
												customerPhone: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="customerEmail">Email</Label>
									<Input
										id="customerEmail"
										type="email"
										value={editData.customerEmail}
										onChange={(e) =>
											setEditData({
												...editData,
												customerEmail: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="passengerCount">Passengers</Label>
									<Input
										id="passengerCount"
										type="number"
										min="1"
										max="20"
										value={editData.passengerCount}
										onChange={(e) =>
											setEditData({
												...editData,
												passengerCount: Number.parseInt(e.target.value) || 1,
											})
										}
									/>
								</div>
							</div>
						</div>

						{/* Special Requests */}
						<div className="space-y-4">
							<h4 className="font-semibold text-sm">Special Requests</h4>
							<Textarea
								value={editData.specialRequests}
								onChange={(e) =>
									setEditData({ ...editData, specialRequests: e.target.value })
								}
								placeholder="Any special requests or notes..."
								className="min-h-20"
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-2 border-t pt-4">
							<Button
								onClick={handleEdit}
								disabled={editMutation.isPending}
								className="flex-1"
							>
								{editMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
									</>
								)}
							</Button>
							<Button
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
								disabled={editMutation.isPending}
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Cancel Dialog - Always rendered for all variants */}
			<AlertDialog
				open={isCancelDialogOpen}
				onOpenChange={setIsCancelDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5" />
							Cancel Booking
						</AlertDialogTitle>
						<AlertDialogDescription>
							<div className="space-y-3">
								<p>Are you sure you want to cancel this booking?</p>

								{/* Booking Summary */}
								<div className="space-y-2 rounded-lg bg-muted/50 p-3">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Route:</span>
										<span className="text-right font-medium">
											{booking?.originAddress?.substring(0, 30)}... →{" "}
											{booking?.destinationAddress?.substring(0, 30)}...
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-medium">
											{formatPrice(
												booking?.quotedAmount ||
													booking?.amount ||
													booking?.totalAmount ||
													0,
											)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Time until pickup:
										</span>
										<span className="font-medium">{getTimeUntilPickup()}</span>
									</div>
								</div>

								{/* Cancellation Reason */}
								<div className="space-y-2">
									<Label
										htmlFor="cancellationReason"
										className="font-medium text-sm"
									>
										Reason for cancellation (optional)
									</Label>
									<Input
										id="cancellationReason"
										placeholder="Let us know why you're cancelling..."
										value={cancellationReason}
										onChange={(e) => setCancellationReason(e.target.value)}
									/>
								</div>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Booking</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancel}
							disabled={cancelMutation.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{cancelMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cancelling...
								</>
							) : (
								<>
									<XCircle className="mr-2 h-4 w-4" />
									Cancel Booking
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Driver Info Dialog - Always rendered for all variants */}
			<Dialog
				open={isDriverInfoDialogOpen}
				onOpenChange={setIsDriverInfoDialogOpen}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Car className="h-5 w-5" />
							Driver Information
						</DialogTitle>
						<DialogDescription>Your assigned driver details</DialogDescription>
					</DialogHeader>

					{booking?.driver && (
						<div className="space-y-4 py-4">
							{/* Driver Details */}
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									{booking.driver.user?.image ? (
										<img
											src={booking.driver.user.image}
											alt={booking.driver.user?.name}
											className="h-12 w-12 rounded-full object-cover"
										/>
									) : (
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
											<User className="h-6 w-6 text-gray-500" />
										</div>
									)}
									<div className="flex-1">
										<h3 className="font-semibold text-lg">
											{booking.driver.user?.name}
										</h3>
										{booking.driver.rating && (
											<div className="flex items-center gap-1">
												<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
												<span className="text-muted-foreground text-sm">
													{booking.driver.rating.toFixed(1)} (
													{booking.driver.totalRides || 0} trips)
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Contact Information */}
								<div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-3">
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
											Phone
										</p>
										<p className="flex items-center gap-1 font-medium text-sm">
											<Phone className="h-3 w-3" />
											{booking.driver.phoneNumber || "Not provided"}
										</p>
									</div>
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
											License
										</p>
										<p className="font-medium text-sm">
											{booking.driver.licenseNumber}
										</p>
									</div>
								</div>
							</div>

							{/* Vehicle Information */}
							{booking.driver.car && (
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Vehicle Information</h4>
									<div className="space-y-2 rounded-lg bg-muted/30 p-3">
										<div className="flex justify-between">
											<span className="text-muted-foreground text-sm">
												Vehicle:
											</span>
											<span className="font-medium text-sm">
												{booking.driver.car.name}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground text-sm">
												Plate:
											</span>
											<span className="font-medium text-sm">
												{booking.driver.car.licensePlate}
											</span>
										</div>
										{booking.driver.car.color && (
											<div className="flex justify-between">
												<span className="text-muted-foreground text-sm">
													Color:
												</span>
												<span className="font-medium text-sm">
													{booking.driver.car.color}
												</span>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Action Button */}
							<div className="flex gap-2 border-t pt-4">
								<Button
									variant="outline"
									onClick={() => setIsDriverInfoDialogOpen(false)}
									className="flex-1"
								>
									Close
								</Button>
								{booking?.driver?.phoneNumber && (
									<Button
										onClick={() =>
											window.open(`tel:${booking.driver.phoneNumber}`)
										}
										className="flex-1"
									>
										<Phone className="mr-2 h-4 w-4" />
										Call Driver
									</Button>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
