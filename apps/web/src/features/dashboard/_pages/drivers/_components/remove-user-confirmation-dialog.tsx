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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Remove User Account
					</DialogTitle>
					<DialogDescription className="text-left">
						This will permanently remove the user account for{" "}
						<strong>{driver.user?.name || "this driver"}</strong> using Better Auth's admin API.
						<br />
						<br />
						<strong>This action:</strong>
						<ul className="mt-2 ml-4 space-y-1 text-sm">
							<li>• Deletes the user account completely from Better Auth</li>
							<li>• Removes the driver profile and all associated data</li>
							<li>• Cannot be undone</li>
						</ul>
						<br />
						<span className="text-green-600 font-medium">
							✓ Recommended: This is the proper way to remove user accounts
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