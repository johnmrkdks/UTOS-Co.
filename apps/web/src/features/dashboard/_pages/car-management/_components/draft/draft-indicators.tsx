import { Button } from "@workspace/ui/components/button";
import { Save } from "lucide-react";

interface FormStatusIndicatorProps {
	isDirty: boolean;
	onSaveDraft: () => void;
}

export const FormStatusIndicator = ({
	isDirty,
	onSaveDraft,
}: FormStatusIndicatorProps) => {
	if (!isDirty) return null;

	return (
		<div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
			<div className="flex items-center justify-between">
				<p className="flex items-center gap-2 text-amber-800 text-sm dark:text-amber-200">
					<span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
					You have unsaved changes
				</p>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onSaveDraft}
					className="h-auto px-2 py-1 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-800/30"
				>
					<Save className="mr-1 h-3 w-3" />
					Save draft
				</Button>
			</div>
		</div>
	);
};

interface StatusBadgeProps {
	isDirty: boolean;
	hasErrors: boolean;
	errorCount: number;
}

export const StatusBadge = ({
	isDirty,
	hasErrors,
	errorCount,
}: StatusBadgeProps) => {
	if (isDirty) {
		return (
			<span className="flex items-center gap-1">
				<span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
				Auto-saving...
			</span>
		);
	}

	if (hasErrors) {
		return (
			<span className="text-red-600 dark:text-red-400">
				{errorCount} error{errorCount !== 1 ? "s" : ""}
			</span>
		);
	}

	return (
		<span className="flex items-center gap-1 text-green-600 dark:text-green-400">
			<span className="h-2 w-2 rounded-full bg-green-500" />
			All saved
		</span>
	);
};
