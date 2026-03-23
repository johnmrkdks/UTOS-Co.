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
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemName?: string;
	isLoading?: boolean;
}

export function DeleteConfirmationDialog({
	open,
	onOpenChange,
	onConfirm,
	title = "Delete Item",
	description,
	itemName = "this item",
	isLoading = false,
}: DeleteConfirmationDialogProps) {
	const defaultDescription = `Are you sure you want to delete ${itemName}? This action cannot be undone and will permanently remove all associated data.`;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<Trash2 className="h-5 w-5 text-red-600" />
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{description || defaultDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						{isLoading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
