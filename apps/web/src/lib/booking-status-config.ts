/**
 * Centralized booking status configuration
 * This file provides consistent status colors, labels, and styling across the application
 */

export type BookingStatus =
	| "pending"
	| "confirmed"
	| "driver_assigned"
	| "driver_en_route"
	| "arrived_pickup"
	| "passenger_on_board"
	| "in_progress"
	| "dropped_off"
	| "awaiting_extras"
	| "awaiting_pricing_review"
	| "completed"
	| "cancelled"
	| "no_show";

export interface StatusConfig {
	/** Background color class for badges */
	bg: string;
	/** Text color class for badges */
	text: string;
	/** Border color class for badges */
	border: string;
	/** Display label for the status */
	label: string;
	/** Short label for compact displays */
	shortLabel: string;
	/** Description of what this status means */
	description: string;
	/** Color for kanban columns */
	kanbanBg: string;
	/** Header color for kanban columns */
	kanbanHeader: string;
	/** Action button text for transitioning to next status */
	actionLabel?: string;
	/** Action button color classes */
	actionColor?: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
	pending: {
		bg: "bg-amber-50",
		text: "text-amber-700",
		border: "border-amber-200",
		label: "PENDING",
		shortLabel: "Pending",
		description: "Awaiting confirmation",
		kanbanBg: "bg-amber-50 border-amber-200",
		kanbanHeader: "bg-amber-100",
		actionLabel: "Confirm",
		actionColor: "text-blue-600 hover:text-blue-700",
	},
	confirmed: {
		bg: "bg-blue-50",
		text: "text-blue-700",
		border: "border-blue-200",
		label: "CONFIRMED",
		shortLabel: "Confirmed",
		description: "Ready for driver assignment",
		kanbanBg: "bg-blue-50 border-blue-200",
		kanbanHeader: "bg-blue-100",
		actionLabel: "Assign Driver",
		actionColor: "text-indigo-600 hover:text-indigo-700",
	},
	driver_assigned: {
		bg: "bg-indigo-50",
		text: "text-indigo-700",
		border: "border-indigo-200",
		label: "DRIVER ASSIGNED",
		shortLabel: "Driver Assigned",
		description: "Driver allocated to trip",
		kanbanBg: "bg-indigo-50 border-indigo-200",
		kanbanHeader: "bg-indigo-100",
		actionLabel: "Start Trip",
		actionColor: "text-orange-600 hover:text-orange-700",
	},
	driver_en_route: {
		bg: "bg-orange-50",
		text: "text-orange-700",
		border: "border-orange-200",
		label: "EN ROUTE",
		shortLabel: "En Route",
		description: "Driver heading to pickup",
		kanbanBg: "bg-orange-50 border-orange-200",
		kanbanHeader: "bg-orange-100",
		actionLabel: "Arrived at Pickup",
		actionColor: "text-purple-600 hover:text-purple-700",
	},
	arrived_pickup: {
		bg: "bg-purple-50",
		text: "text-purple-700",
		border: "border-purple-200",
		label: "ARRIVED PICKUP",
		shortLabel: "Arrived Pickup",
		description: "Driver at pickup location",
		kanbanBg: "bg-purple-50 border-purple-200",
		kanbanHeader: "bg-purple-100",
		actionLabel: "Passenger/s On Board",
		actionColor: "text-green-600 hover:text-green-700",
	},
	passenger_on_board: {
		bg: "bg-green-50",
		text: "text-green-700",
		border: "border-green-200",
		label: "ON BOARD",
		shortLabel: "On Board",
		description: "Passenger/s picked up",
		kanbanBg: "bg-green-50 border-green-200",
		kanbanHeader: "bg-green-100",
		actionLabel: "Drop Off",
		actionColor: "text-cyan-600 hover:text-cyan-700",
	},
	in_progress: {
		bg: "bg-amber-50",
		text: "text-amber-800",
		border: "border-amber-200",
		label: "IN PROGRESS",
		shortLabel: "In Progress",
		description: "Service in progress (legacy)",
		kanbanBg: "bg-amber-50 border-amber-200",
		kanbanHeader: "bg-amber-100",
		actionLabel: "Drop Off",
		actionColor: "text-cyan-600 hover:text-cyan-700",
	},
	dropped_off: {
		bg: "bg-cyan-50",
		text: "text-cyan-700",
		border: "border-cyan-200",
		label: "DROPPED OFF",
		shortLabel: "Dropped Off",
		description: "Passenger at destination",
		kanbanBg: "bg-cyan-50 border-cyan-200",
		kanbanHeader: "bg-cyan-100",
		actionLabel: "Close Trip",
		actionColor: "text-pink-600 hover:text-pink-700",
	},
	awaiting_extras: {
		bg: "bg-pink-50",
		text: "text-pink-700",
		border: "border-pink-200",
		label: "AWAITING EXTRAS",
		shortLabel: "Awaiting Extras",
		description: "Adding tolls/parking fees",
		kanbanBg: "bg-pink-50 border-pink-200",
		kanbanHeader: "bg-pink-100",
		actionLabel: "Complete Trip",
		actionColor: "text-emerald-600 hover:text-emerald-700",
	},
	awaiting_pricing_review: {
		bg: "bg-amber-50",
		text: "text-amber-800",
		border: "border-amber-300",
		label: "AWAITING PRICING REVIEW",
		shortLabel: "Pricing Review",
		description: "Admin must finalize amount (waiting time added)",
		kanbanBg: "bg-amber-50 border-amber-300",
		kanbanHeader: "bg-amber-100",
		actionLabel: "Finalize Amount",
		actionColor: "text-emerald-600 hover:text-emerald-700",
	},
	completed: {
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		border: "border-emerald-200",
		label: "COMPLETED",
		shortLabel: "Completed",
		description: "Service completed",
		kanbanBg: "bg-emerald-50 border-emerald-200",
		kanbanHeader: "bg-emerald-100",
	},
	cancelled: {
		bg: "bg-red-50",
		text: "text-red-700",
		border: "border-red-200",
		label: "CANCELLED",
		shortLabel: "Cancelled",
		description: "Booking cancelled",
		kanbanBg: "bg-red-50 border-red-200",
		kanbanHeader: "bg-red-100",
	},
	no_show: {
		bg: "bg-gray-50",
		text: "text-gray-700",
		border: "border-gray-200",
		label: "NO SHOW",
		shortLabel: "No Show",
		description: "Customer did not show up",
		kanbanBg: "bg-gray-50 border-gray-200",
		kanbanHeader: "bg-gray-100",
	},
};

/**
 * Get status configuration for a given status
 */
export function getStatusConfig(status: string): StatusConfig {
	return (
		BOOKING_STATUS_CONFIG[status as BookingStatus] || {
			bg: "bg-slate-50",
			text: "text-slate-700",
			border: "border-slate-200",
			label: status.replace("_", " ").toUpperCase(),
			shortLabel: status.replace("_", " "),
			description: "Unknown status",
			kanbanBg: "bg-slate-50 border-slate-200",
			kanbanHeader: "bg-slate-100",
		}
	);
}

/**
 * Get the next status in the workflow
 */
export function getNextStatus(currentStatus: string): string {
	switch (currentStatus) {
		case "confirmed":
		case "driver_assigned":
			return "driver_en_route";
		case "driver_en_route":
			return "arrived_pickup";
		case "arrived_pickup":
			return "passenger_on_board";
		case "passenger_on_board":
			return "dropped_off";
		case "dropped_off":
			return "awaiting_extras";
		case "awaiting_extras":
			return "completed";
		case "awaiting_pricing_review":
			return "completed";
		default:
			return currentStatus;
	}
}

/**
 * Get all possible statuses in order
 */
export function getAllStatuses(): BookingStatus[] {
	return [
		"pending",
		"confirmed",
		"driver_assigned",
		"driver_en_route",
		"arrived_pickup",
		"passenger_on_board",
		"in_progress",
		"dropped_off",
		"awaiting_extras",
		"awaiting_pricing_review",
		"completed",
		"cancelled",
		"no_show",
	];
}

/**
 * Check if a status is a final status (no further transitions)
 */
export function isFinalStatus(status: string): boolean {
	return ["completed", "cancelled", "no_show"].includes(status);
}

/**
 * Check if booking needs admin to finalize amount (driver added waiting time)
 */
export function isAwaitingPricingReview(status: string): boolean {
	return status === "awaiting_pricing_review";
}

/**
 * Check if a status allows cancellation
 */
export function canCancelBooking(status: string): boolean {
	return ![
		"completed",
		"cancelled",
		"no_show",
		"dropped_off",
		"awaiting_extras",
		"awaiting_pricing_review",
	].includes(status);
}
