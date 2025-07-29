import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface FormStatusIndicatorProps {
	isDirty: boolean
	onSaveDraft: () => void
}

export const FormStatusIndicator = ({ isDirty, onSaveDraft }: FormStatusIndicatorProps) => {
	if (!isDirty) return null

	return (
		<div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
			<div className="flex items-center justify-between">
				<p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
					<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
					You have unsaved changes
				</p>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onSaveDraft}
					className="h-auto px-2 py-1 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/30"
				>
					<Save className="w-3 h-3 mr-1" />
					Save draft
				</Button>
			</div>
		</div>
	)
}

interface StatusBadgeProps {
	isDirty: boolean
	hasErrors: boolean
	errorCount: number
}

export const StatusBadge = ({ isDirty, hasErrors, errorCount }: StatusBadgeProps) => {
	if (isDirty) {
		return (
			<span className="flex items-center gap-1">
				<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
				Auto-saving...
			</span>
		)
	}

	if (hasErrors) {
		return (
			<span className="text-red-600 dark:text-red-400">
				{errorCount} error{errorCount !== 1 ? "s" : ""}
			</span>
		)
	}

	return (
		<span className="text-green-600 dark:text-green-400 flex items-center gap-1">
			<span className="w-2 h-2 bg-green-500 rounded-full"></span>
			All saved
		</span>
	)
}
