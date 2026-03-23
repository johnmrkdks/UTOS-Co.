import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle, Archive, Loader2, Trash2 } from "lucide-react";
import {
	useBulkArchiveBookingsMutation,
	useBulkDeleteBookingsMutation,
} from "../_hooks/query/use-bulk-booking-mutations";

type BulkOperationType = "archive" | "unarchive" | "delete";

interface BulkOperationsDialogProps {
	selectedBookingIds: string[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	operationType: BulkOperationType;
	onClearSelection: () => void;
}

export function BulkOperationsDialog({
	selectedBookingIds,
	open,
	onOpenChange,
	operationType,
	onClearSelection,
}: BulkOperationsDialogProps) {
	const bulkArchiveMutation = useBulkArchiveBookingsMutation();
	const bulkDeleteMutation = useBulkDeleteBookingsMutation();

	const isLoading =
		bulkArchiveMutation.isPending || bulkDeleteMutation.isPending;

	const getOperationConfig = () => {
		switch (operationType) {
			case "archive":
				return {
					title: "Archive Bookings",
					description:
						"Are you sure you want to archive these bookings? They will be hidden from the main list but can be restored later.",
					icon: Archive,
					iconColor: "text-orange-600",
					buttonText: "Archive Bookings",
					buttonVariant: "destructive" as const,
					loadingText: "Archiving...",
					warningText:
						"Archived bookings are hidden from the main list but remain in the database. You can restore them at any time from the archived bookings view.",
				};
			case "unarchive":
				return {
					title: "Restore Bookings",
					description:
						"Are you sure you want to restore these bookings? They will be visible in the main booking list again.",
					icon: Archive,
					iconColor: "text-blue-600",
					buttonText: "Restore Bookings",
					buttonVariant: "default" as const,
					loadingText: "Restoring...",
					warningText: null,
				};
			case "delete":
				return {
					title: "Delete Bookings",
					description:
						"Are you sure you want to permanently delete these bookings? This action cannot be undone.",
					icon: Trash2,
					iconColor: "text-red-600",
					buttonText: "Delete Permanently",
					buttonVariant: "destructive" as const,
					loadingText: "Deleting...",
					warningText:
						"This action is permanent and cannot be undone. All booking data will be lost forever.",
				};
		}
	};

	const config = getOperationConfig();

	const handleConfirm = async () => {
		try {
			if (operationType === "delete") {
				await (bulkDeleteMutation as any).mutateAsync({
					bookingIds: selectedBookingIds,
				});
			} else {
				await (bulkArchiveMutation as any).mutateAsync({
					bookingIds: selectedBookingIds,
					isArchived: operationType === "archive",
				});
			}
			onClearSelection();
			onOpenChange(false);
		} catch (error) {
			// Error is handled by the mutation hooks
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md" showCloseButton={false}>
				<DialogHeader>
					<div className="flex items-center gap-3">
						<config.icon className={`h-6 w-6 ${config.iconColor}`} />
						<DialogTitle>{config.title}</DialogTitle>
					</div>
					<DialogDescription className="pt-2">
						{config.description}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg bg-muted p-4">
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium">Selected Bookings:</span>
							<span className="font-semibold">{selectedBookingIds.length}</span>
						</div>
						<div className="text-muted-foreground text-xs">
							{selectedBookingIds.length === 1
								? "1 booking"
								: `${selectedBookingIds.length} bookings`}{" "}
							will be affected
						</div>
					</div>
				</div>

				{config.warningText && (
					<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
						<AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
						<div className="text-red-800 text-sm">
							<p className="font-medium">Warning:</p>
							<p>{config.warningText}</p>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant={config.buttonVariant}
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{config.loadingText}
							</>
						) : (
							<>
								<config.icon className="mr-2 h-4 w-4" />
								{config.buttonText}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
