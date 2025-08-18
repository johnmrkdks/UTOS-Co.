/**
 * Publication Validation Rules
 * 
 * Validates whether cars and packages meet requirements for publication.
 * These rules ensure quality standards and completeness before content goes live.
 */

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	score: number; // 0-100
}

export interface CarValidationData {
	id: string;
	name: string;
	description?: string;
	licensePlate?: string;
	images?: Array<{ id: string; url: string }>;
	insuranceExpiry?: Date;
	registrationExpiry?: Date;
	lastServiceDate?: Date;
	isActive: boolean;
	isAvailable: boolean;
	status: string;
	seatingCapacity?: number;
	category?: { name: string };
	model?: { name: string; brand?: { name: string } };
}

export interface PackageValidationData {
	id: string;
	name: string;
	description?: string;
	fixedPrice?: number;
	bannerImageUrl?: string;
	maxPassengers?: number;
	isAvailable: boolean;
	serviceType?: string;
	duration?: number;
	maxDistance?: number;
}

/**
 * Validate car for publication
 */
export function validateCarForPublication(car: CarValidationData): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	// Required fields validation
	if (!car.name?.trim()) {
		errors.push("Car name is required");
		score -= 20;
	}

	if (!car.description?.trim()) {
		errors.push("Car description is required");
		score -= 15;
	} else if (car.description.length < 50) {
		warnings.push("Description is quite short (recommended: 50+ characters)");
		score -= 5;
	}

	if (!car.licensePlate?.trim()) {
		errors.push("License plate is required");
		score -= 15;
	}

	// Images validation
	if (!car.images || car.images.length === 0) {
		errors.push("At least one car image is required");
		score -= 25;
	} else if (car.images.length < 3) {
		warnings.push("Consider adding more images (recommended: 3+ images)");
		score -= 5;
	}

	// Legal compliance validation (optional fields)
	if (car.insuranceExpiry) {
		if (car.insuranceExpiry < new Date()) {
			errors.push("Insurance has expired");
			score -= 30;
		} else if (car.insuranceExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
			warnings.push("Insurance expires within 30 days");
			score -= 5;
		}
	} else {
		warnings.push("Insurance expiry date not provided");
		score -= 5;
	}

	if (car.registrationExpiry) {
		if (car.registrationExpiry < new Date()) {
			errors.push("Registration has expired");
			score -= 30;
		}
	} else {
		warnings.push("Registration expiry date not provided");
		score -= 5;
	}

	// Service history
	if (!car.lastServiceDate) {
		warnings.push("Last service date not recorded");
		score -= 5;
	} else {
		const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
		if (car.lastServiceDate < sixMonthsAgo) {
			warnings.push("Car hasn't been serviced in over 6 months");
			score -= 10;
		}
	}

	// Operational status validation
	if (!car.isActive) {
		errors.push("Car must be active to publish");
		score -= 25;
	}

	if (!car.isAvailable) {
		warnings.push("Car is marked as unavailable");
		score -= 10;
	}

	if (car.status !== "available") {
		warnings.push(`Car status is "${car.status}" instead of "available"`);
		score -= 15;
	}

	// Capacity validation
	if (!car.seatingCapacity || car.seatingCapacity < 1) {
		errors.push("Valid seating capacity is required");
		score -= 10;
	}

	// Category and model validation
	if (!car.category?.name) {
		warnings.push("Car category not specified");
		score -= 5;
	}

	if (!car.model?.name || !car.model?.brand?.name) {
		warnings.push("Complete car model and brand information missing");
		score -= 5;
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		score: Math.max(0, score),
	};
}

/**
 * Validate package for publication
 */
export function validatePackageForPublication(pkg: PackageValidationData): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	// Required fields validation
	if (!pkg.name?.trim()) {
		errors.push("Package name is required");
		score -= 25;
	}

	if (!pkg.description?.trim()) {
		errors.push("Package description is required");
		score -= 20;
	} else if (pkg.description.length < 100) {
		warnings.push("Description is quite short (recommended: 100+ characters)");
		score -= 5;
	}

	// Pricing validation
	if (!pkg.fixedPrice || pkg.fixedPrice <= 0) {
		errors.push("Valid package price is required");
		score -= 30;
	}

	// Image validation
	if (!pkg.bannerImageUrl?.trim()) {
		warnings.push("Package banner image recommended for better presentation");
		score -= 10;
	}

	// Service specifications
	if (!pkg.serviceType?.trim()) {
		errors.push("Service type is required");
		score -= 15;
	}

	if (!pkg.maxPassengers || pkg.maxPassengers < 1) {
		warnings.push("Maximum passenger count not specified");
		score -= 5;
	}

	// Duration/distance validation
	if (pkg.serviceType === "tour" && (!pkg.duration || pkg.duration <= 0)) {
		warnings.push("Tour packages should specify duration");
		score -= 10;
	}

	if (pkg.serviceType === "transfer" && pkg.maxDistance && pkg.maxDistance <= 0) {
		warnings.push("Transfer packages with distance limits should specify valid distance");
		score -= 5;
	}

	// Availability validation
	if (!pkg.isAvailable) {
		warnings.push("Package is marked as unavailable");
		score -= 15;
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		score: Math.max(0, score),
	};
}

/**
 * Get validation status summary
 */
export function getValidationStatusSummary(result: ValidationResult) {
	if (result.score >= 90) return { status: "excellent", color: "green" };
	if (result.score >= 75) return { status: "good", color: "blue" };
	if (result.score >= 60) return { status: "fair", color: "yellow" };
	if (result.score >= 40) return { status: "poor", color: "orange" };
	return { status: "critical", color: "red" };
}

/**
 * Check if item can be safely published
 */
export function canPublishSafely(result: ValidationResult): boolean {
	return result.isValid && result.score >= 60;
}

/**
 * Get publication readiness score
 */
export function getPublicationReadinessText(score: number): string {
	if (score >= 90) return "Ready to publish";
	if (score >= 75) return "Good for publication";
	if (score >= 60) return "Acceptable for publication";
	if (score >= 40) return "Needs improvement";
	return "Not ready for publication";
}