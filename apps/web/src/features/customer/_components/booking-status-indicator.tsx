import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertTriangle,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	Package,
	Route as RouteIcon,
	User,
	XCircle,
} from "lucide-react";

interface BookingStatusIndicatorProps {
	status: string;
	bookingType?: string;
	size?: "sm" | "default" | "lg";
	className?: string;
	showIcon?: boolean;
	showUpcoming?: boolean;
	scheduledPickupTime?: string | Date;
}

export function BookingStatusIndicator({
	status,
	bookingType,
	size = "default",
	className,
	showIcon = true,
	showUpcoming = false,
	scheduledPickupTime,
}: BookingStatusIndicatorProps) {
	const getStatusConfig = (status: string) => {
		switch (status) {
			case "pending":
				return {
					color: "bg-yellow-100 text-yellow-800 border-yellow-200",
					icon: Clock,
					label: "Pending",
					description: "Awaiting confirmation",
				};
			case "confirmed":
				return {
					color: "bg-green-100 text-green-800 border-green-200",
					icon: CheckCircle,
					label: "Confirmed",
					description: "Booking confirmed",
				};
			case "driver_assigned":
				return {
					color: "bg-blue-100 text-blue-800 border-blue-200",
					icon: User,
					label: "Driver Assigned",
					description: "Driver has been assigned",
				};
			case "in_progress":
				return {
					color: "bg-purple-100 text-purple-800 border-purple-200",
					icon: Car,
					label: "In Progress",
					description: "Service is active",
				};
			case "completed":
				return {
					color: "bg-green-100 text-green-800 border-green-200",
					icon: CheckCircle,
					label: "Completed",
					description: "Service completed successfully",
				};
			case "cancelled":
				return {
					color: "bg-red-100 text-red-800 border-red-200",
					icon: XCircle,
					label: "Cancelled",
					description: "Booking was cancelled",
				};
			default:
				return {
					color: "bg-gray-100 text-gray-800 border-gray-200",
					icon: Clock,
					label: "Unknown",
					description: "Status unknown",
				};
		}
	};

	const getBookingTypeConfig = (type?: string) => {
		switch (type) {
			case "package":
				return {
					color: "bg-emerald-50 text-emerald-700 border-emerald-200",
					icon: Package,
					label: "Premium Service",
				};
			case "custom":
				return {
					color: "bg-blue-50 text-blue-700 border-blue-200",
					icon: RouteIcon,
					label: "Custom Journey",
				};
			default:
				return null;
		}
	};

	const isUpcoming =
		showUpcoming &&
		scheduledPickupTime &&
		new Date(scheduledPickupTime) > new Date() &&
		!["completed", "cancelled"].includes(status);

	const statusConfig = getStatusConfig(status);
	const typeConfig = bookingType ? getBookingTypeConfig(bookingType) : null;
	const IconComponent = statusConfig.icon;
	const TypeIconComponent = typeConfig?.icon;

	const sizeClasses = {
		sm: "text-xs px-2 py-1",
		default: "text-sm px-3 py-1",
		lg: "text-base px-4 py-2",
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{/* Main Status Badge */}
			<Badge
				variant="outline"
				className={cn(
					statusConfig.color,
					sizeClasses[size],
					"border font-medium",
				)}
			>
				{showIcon && (
					<IconComponent
						className={cn(
							size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
							"mr-1",
						)}
					/>
				)}
				<span className="capitalize">
					{statusConfig.label.replace("_", " ")}
				</span>
			</Badge>

			{/* Show upcoming indicator only if needed */}
			{isUpcoming && size !== "sm" && (
				<Badge
					variant="secondary"
					className="border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700 text-xs"
				>
					<Calendar className="mr-1 h-3 w-3" />
					Upcoming
				</Badge>
			)}
		</div>
	);
}

// Simplified version for quick status display
export function BookingStatusBadge({
	status,
	size = "default",
	showIcon = true,
}: {
	status: string;
	size?: "sm" | "default" | "lg";
	showIcon?: boolean;
}) {
	return (
		<BookingStatusIndicator
			status={status}
			size={size}
			showIcon={showIcon}
			showUpcoming={false}
		/>
	);
}
