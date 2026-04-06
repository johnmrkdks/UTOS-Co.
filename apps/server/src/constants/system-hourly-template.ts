import type { packages } from "@/db/schema";

/** Must match `0016_system_hourly_template_package.sql` and instant-quote-widget. */
export const SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID = "sys_hourly_iq_template";

/**
 * In-memory package row for vehicle-priced hourly bookings when no DB row exists
 * (migration not applied yet, or D1 out of sync). Same id as the seeded template.
 */
export function getSyntheticHourlyTemplatePackageRow(): typeof packages.$inferSelect {
	const now = new Date();
	return {
		id: SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID,
		name: "Hourly vehicle booking",
		description:
			"Hourly service; pricing comes from the vehicle you select (pricing config).",
		categoryId: null,
		serviceTypeId: "sys_hourly_iq_svc_type",
		bannerImageUrl: null,
		duration: null,
		maxDistance: null,
		fixedPrice: null,
		hourlyRate: 0.01,
		extraKmPrice: null,
		extraHourPrice: null,
		depositRequired: null,
		maxPassengers: 20,
		advanceBookingHours: 0,
		cancellationHours: 24,
		includesDriver: true,
		includesFuel: true,
		includesTolls: false,
		includesWaiting: false,
		waitingTimeMinutes: 0,
		isAvailable: true,
		isPublished: false,
		availableDays: null,
		availableTimeStart: null,
		availableTimeEnd: null,
		createdAt: now,
		updatedAt: now,
	};
}
