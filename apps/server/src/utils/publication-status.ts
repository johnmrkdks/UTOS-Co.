/**
 * Publication Status Utilities
 * 
 * Provides consistent logic for determining publication status across cars and packages.
 * This ensures all publication-related queries use the same criteria.
 */

import type { CarStatusEnum } from "@/types";

/**
 * Publication status for cars
 * A car is publicly visible when it's:
 * - Published by admin (isPublished = true)
 * - Active in the system (isActive = true) 
 * - Available for booking (isAvailable = true)
 * - Has an available status (status = 'available')
 */
export interface CarPublicationStatus {
	isPublished: boolean;
	isActive: boolean;
	isAvailable: boolean;
	status: CarStatusEnum;
}

/**
 * Publication status for packages
 * A package is publicly visible when it's:
 * - Published by admin (isPublished = true)
 * - Available for booking (isAvailable = true)
 */
export interface PackagePublicationStatus {
	isPublished: boolean;
	isAvailable: boolean;
}

/**
 * Check if a car is publicly available
 */
export function isCarPubliclyAvailable(car: CarPublicationStatus): boolean {
	return car.isPublished && 
	       car.isActive && 
	       car.isAvailable && 
	       car.status === 'available';
}

/**
 * Check if a package is publicly available
 */
export function isPackagePubliclyAvailable(pkg: PackagePublicationStatus): boolean {
	return pkg.isPublished && pkg.isAvailable;
}

/**
 * Get publication status summary for admin dashboard
 */
export function getPublicationSummary(
	items: (CarPublicationStatus | PackagePublicationStatus)[],
	type: 'car' | 'package'
) {
	const total = items.length;
	const published = items.filter(item => 
		type === 'car' 
			? isCarPubliclyAvailable(item as CarPublicationStatus)
			: isPackagePubliclyAvailable(item as PackagePublicationStatus)
	).length;
	
	return {
		total,
		published,
		unpublished: total - published,
		publishedPercentage: total > 0 ? Math.round((published / total) * 100) : 0,
	};
}