import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { CheckCircle, Loader2 } from "lucide-react";
import { useUpdateBookingStatusMutation } from "../_hooks/query/use-update-booking-status-mutation";

type ConfirmBookingDialogProps = {
	booking: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ConfirmBookingDialog({
	booking,
	open,
	onOpenChange,
}: ConfirmBookingDialogProps) {
	const updateStatusMutation = useUpdateBookingStatusMutation();

	const handleConfirm = async () => {
		if (!booking?.id) return;

		try {
			await updateStatusMutation.mutateAsync({
				id: booking.id,
				status: "confirmed" as any,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to confirm booking:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5 text-green-600" />
						Confirm Booking
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to confirm booking #{booking?.id?.slice(-6)}?
					</DialogDescription>
				</DialogHeader>

				{booking && (
					<div className="space-y-4">
						{/* Current Status */}
						<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
							<span className="font-medium text-sm">Current Status:</span>
							<Badge variant="secondary" className="text-xs">
								{booking.status.replace("_", " ").toUpperCase()}
							</Badge>
						</div>

						{/* New Status */}
						<div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
							<span className="font-medium text-sm">New Status:</span>
							<Badge variant="default" className="bg-green-600 text-xs">
								<CheckCircle className="mr-1 h-3 w-3" />
								CONFIRMED
							</Badge>
						</div>

						{/* Booking Info */}
						<div className="text-gray-600 text-sm">
							<p>
								<strong>Customer:</strong> {booking.customerName || "N/A"}
							</p>
							<p>
								<strong>Amount:</strong> $
								{booking.quotedAmount?.toFixed(2) || "0.00"}
							</p>
							<p>
								<strong>Type:</strong>{" "}
								{booking.bookingType === "package"
									? "Package"
									: booking.bookingType === "guest"
										? "Guest"
										: "Custom"}
							</p>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateStatusMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={updateStatusMutation.isPending}
						className="bg-green-600 hover:bg-green-700"
					>
						{updateStatusMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Confirming...
							</>
						) : (
							<>
								<CheckCircle className="mr-2 h-4 w-4" />
								Confirm Booking
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
