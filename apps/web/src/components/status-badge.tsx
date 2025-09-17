import { cn } from "@workspace/ui/lib/utils";
import { getStatusConfig, type BookingStatus } from "@/lib/booking-status-config";

export interface StatusBadgeProps {
	/** The booking status */
	status: string;
	/** Whether to show short or full label */
	variant?: "default" | "short";
	/** Additional CSS classes */
	className?: string;
	/** Size variant */
	size?: "sm" | "md" | "lg";
}

/**
 * Reusable status badge component that uses centralized status configuration
 */
export function StatusBadge({
	status,
	variant = "default",
	className,
	size = "md"
}: StatusBadgeProps) {
	const config = getStatusConfig(status);

	const sizeClasses = {
		sm: "px-1.5 py-0.5 text-xs",
		md: "px-2.5 py-1 text-xs",
		lg: "px-3 py-1.5 text-sm"
	};

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full font-medium border",
				sizeClasses[size],
				config.bg,
				config.text,
				config.border,
				className
			)}
		>
			{variant === "short" ? config.shortLabel : config.label}
		</span>
	);
}

/**
 * Props for ActionButton component
 */
export interface StatusActionButtonProps {
	/** Current booking status */
	status: string;
	/** Click handler */
	onClick: () => void;
	/** Whether the button is disabled */
	disabled?: boolean;
	/** Additional CSS classes */
	className?: string;
	/** Size variant */
	size?: "sm" | "md" | "lg";
}

/**
 * Reusable action button for status transitions
 */
export function StatusActionButton({
	status,
	onClick,
	disabled = false,
	className,
	size = "sm"
}: StatusActionButtonProps) {
	const config = getStatusConfig(status);

	if (!config.actionLabel) {
		return null;
	}

	const sizeClasses = {
		sm: "h-6 px-2 text-xs",
		md: "h-8 px-3 text-sm",
		lg: "h-10 px-4 text-base"
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"inline-flex items-center justify-center rounded-md font-medium transition-colors",
				"hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
				sizeClasses[size],
				config.actionColor,
				className
			)}
		>
			{config.actionLabel}
		</button>
	);
}