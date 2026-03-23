/**
 * Timezone utility functions for handling date/time consistently across the application
 */

/**
 * Creates a Date object from date and time strings in the user's local timezone
 * and returns it as an ISO string for backend storage
 */
export function createLocalDateForBackend(
	dateString: string,
	timeString: string,
): string {
	const [year, month, day] = dateString.split("-").map(Number);
	const [hours, minutes] = timeString.split(":").map(Number);

	// Create Date in user's local timezone, then convert to UTC for storage
	const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
	return localDateTime.toISOString();
}

/**
 * Formats a stored date string for display in local timezone
 */
export function formatStoredDateForDisplay(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}
