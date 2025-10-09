import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle, Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { useArchiveBookingMutation } from "../_hooks/query/use-archive-booking-mutation";
import type { Booking } from "../_components/booking-table-columns";

interface ArchiveBookingDialogProps {
	booking: Booking | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isArchiving?: boolean; // true for archive, false for unarchive, null for reset
}

export function ArchiveBookingDialog({
	booking,
	open,
	onOpenChange,
	isArchiving = true
}: ArchiveBookingDialogProps) {
	const archiveBookingMutation = useArchiveBookingMutation();

	const handleConfirm = async () => {
		if (!booking) return;

		try {
			await (archiveBookingMutation as any).mutateAsync({
				bookingId: booking.id,
				isArchived: isArchiving,
			});
			onOpenChange(false);
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	if (!booking) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						{isArchiving ? (
							<Archive className="h-6 w-6 text-orange-600" />
						) : (
							<ArchiveRestore className="h-6 w-6 text-blue-600" />
						)}
						<DialogTitle>
							{isArchiving ? "Archive Booking" : "Restore Booking"}
						</DialogTitle>
					</div>
					<DialogDescription className="pt-2">
						{isArchiving ? (
							<>
								Are you sure you want to archive this booking? The booking will be hidden from the main list but can be restored later.
							</>
						) : (
							<>
								Are you sure you want to restore this booking? It will be visible in the main booking list again.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-muted p-4">
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium">Booking Reference:</span>
							<span className="font-mono">{(booking as any).referenceNumber || 'N/A'}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="font-medium">Customer:</span>
							<span>{booking.customerName}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="font-medium">Type:</span>
							<span className="capitalize">{booking.bookingType}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="font-medium">Status:</span>
							<span className="capitalize">{booking.status}</span>
						</div>
					</div>
				</div>

				{isArchiving && (
					<div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3 border border-orange-200">
						<AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
						<div className="text-sm text-orange-800">
							<p className="font-medium">Important:</p>
							<p>Archived bookings are hidden from the main list but remain in the database. You can restore them at any time from the archived bookings view.</p>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={archiveBookingMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						variant={isArchiving ? "destructive" : "default"}
						onClick={handleConfirm}
						disabled={archiveBookingMutation.isPending}
					>
						{archiveBookingMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isArchiving ? "Archiving..." : "Restoring..."}
							</>
						) : (
							<>
								{isArchiving ? (
									<Archive className="mr-2 h-4 w-4" />
								) : (
									<ArchiveRestore className="mr-2 h-4 w-4" />
								)}
								{isArchiving ? "Archive Booking" : "Restore Booking"}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}