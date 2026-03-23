import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle } from "lucide-react";

interface RemoveUserConfirmationDialogProps {
	driver: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (userId: string) => Promise<void>;
	isRemoving: boolean;
}

export function RemoveUserConfirmationDialog({
	driver,
	open,
	onOpenChange,
	onConfirm,
	isRemoving,
}: RemoveUserConfirmationDialogProps) {
	if (!driver) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Remove User Account
					</DialogTitle>
					<DialogDescription className="text-left">
						This will permanently remove the user account for{" "}
						<strong>{driver.user?.name || "this driver"}</strong> and all associated data.
						<br />
						<br />
						<strong>This action will:</strong>
						<ul className="mt-2 ml-4 space-y-1 text-sm">
							<li>• Delete the driver profile and all related records</li>
							<li>• Remove the user account and authentication data</li>
							<li>• Cancel any active bookings assigned to this driver</li>
							<li>• Delete all sessions, accounts, and customer profiles</li>
							<li>• Remove all ratings and booking history</li>
							<li>• Clear all foreign key references safely</li>
							<li>• Cannot be undone</li>
						</ul>
						<br />
						<span className="text-green-600 font-medium">
							✓ Recommended: Comprehensive deletion with foreign key handling
						</span>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isRemoving}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => onConfirm(driver.user?.id)}
						disabled={isRemoving || !driver.user?.id}
					>
						{isRemoving ? "Removing..." : "Remove User Account"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}