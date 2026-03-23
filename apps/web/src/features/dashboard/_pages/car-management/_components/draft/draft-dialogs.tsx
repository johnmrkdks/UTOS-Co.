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
import { Clock, FileText, Trash2 } from "lucide-react";

// Draft age formatter
const formatDraftAge = (draftAge: number | null): string => {
	if (!draftAge) return "some time ago";

	if (draftAge < 60) {
		return `${draftAge} minute${draftAge !== 1 ? "s" : ""} ago`;
	}

	if (draftAge < 1440) {
		const hours = Math.floor(draftAge / 60);
		return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
	}

	return "more than a day ago";
};

interface DraftDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onLoadDraft: () => void;
	onDeleteDraft: () => void;
	draftAge: number | null;
}

export function DraftDialog({
	open,
	onOpenChange,
	onLoadDraft,
	onDeleteDraft,
	draftAge,
}: DraftDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Draft Available
					</AlertDialogTitle>
					<AlertDialogDescription>
						You have a saved draft from {formatDraftAge(draftAge)}. Would you
						like to continue where you left off?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={onDeleteDraft}
							className="text-red-600 hover:bg-red-50 hover:text-red-700"
						>
							<Trash2 className="h-4 w-4" />
							Delete Draft
						</Button>
						<AlertDialogCancel onClick={() => onOpenChange(false)}>
							Start Fresh
						</AlertDialogCancel>
					</div>
					<AlertDialogAction onClick={onLoadDraft}>
						<Clock className="h-4 w-4" />
						Load Draft
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

interface DiscardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirmDiscard: () => void;
	isSubmitting?: boolean;
}

export function DiscardDialog({
	open,
	onOpenChange,
	onConfirmDiscard,
	isSubmitting,
}: DiscardDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes that will be permanently lost. This action
						cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSubmitting}>
						Keep editing
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirmDiscard}
						disabled={isSubmitting}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						Discard changes
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
