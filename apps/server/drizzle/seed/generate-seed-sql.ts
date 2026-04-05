import { createId } from "@paralleldrive/cuid2";
import { writeFileSync } from "fs";
import { join } from "path";
import { UserRoleEnum } from "../../src/db/sqlite/enums";
import { customHash } from "../../src/lib/scrypt";

// Super Admin User Data
const superAdminUser = {
	id: createId(),
	name: "Super Admin",
	email: "admin@admin.com",
	emailVerified: true,
	role: UserRoleEnum.SuperAdmin,
	banned: false,
	password: "l/19)1Ya",
};

// Car Brands - Premium luxury and sports car brands
const carBrands = [
	{ name: "Mercedes-Benz" },
	{ name: "BMW" },
	{ name: "Audi" },
	{ name: "Lexus" },
	{ name: "Porsche" },
	{ name: "Jaguar" },
	{ name: "Land Rover" },
	{ name: "Tesla" },
	{ name: "Bentley" },
	{ name: "Rolls-Royce" },
	{ name: "Maserati" },
	{ name: "Ferrari" },
	{ name: "Lamborghini" },
	{ name: "McLaren" },
	{ name: "Aston Martin" },
	{ name: "Cadillac" },
	{ name: "Genesis" },
	{ name: "Volvo" },
	{ name: "Range Rover" },
	{ name: "Chrysler" },
];

// Car Models by Brand (with years for recent luxury models)
const carModels = [
	// Mercedes-Benz
	{ name: "S-Class", brandName: "Mercedes-Benz", year: 2024 },
	{ name: "E-Class", brandName: "Mercedes-Benz", year: 2024 },
	{ name: "GLS-Class", brandName: "Mercedes-Benz", year: 2023 },
	{ name: "G-Class", brandName: "Mercedes-Benz", year: 2024 },
	{ name: "Maybach S-Class", brandName: "Mercedes-Benz", year: 2024 },
	{ name: "AMG GT", brandName: "Mercedes-Benz", year: 2023 },
	{ name: "Sprinter", brandName: "Mercedes-Benz", year: 2023 },

	// BMW
	{ name: "7 Series", brandName: "BMW", year: 2024 },
	{ name: "5 Series", brandName: "BMW", year: 2024 },
	{ name: "X7", brandName: "BMW", year: 2023 },
	{ name: "X5", brandName: "BMW", year: 2024 },
	{ name: "i7", brandName: "BMW", year: 2023 },
	{ name: "M8", brandName: "BMW", year: 2023 },

	// Audi
	{ name: "A8", brandName: "Audi", year: 2024 },
	{ name: "A6", brandName: "Audi", year: 2024 },
	{ name: "Q8", brandName: "Audi", year: 2023 },
	{ name: "Q7", brandName: "Audi", year: 2024 },
	{ name: "e-tron GT", brandName: "Audi", year: 2023 },
	{ name: "R8", brandName: "Audi", year: 2023 },

	// Lexus
	{ name: "LS", brandName: "Lexus", year: 2024 },
	{ name: "LX", brandName: "Lexus", year: 2023 },
	{ name: "GX", brandName: "Lexus", year: 2024 },
	{ name: "ES", brandName: "Lexus", year: 2024 },
	{ name: "LC", brandName: "Lexus", year: 2023 },

	// Porsche
	{ name: "Panamera", brandName: "Porsche", year: 2024 },
	{ name: "Cayenne", brandName: "Porsche", year: 2024 },
	{ name: "911", brandName: "Porsche", year: 2024 },
	{ name: "Taycan", brandName: "Porsche", year: 2023 },
	{ name: "Macan", brandName: "Porsche", year: 2023 },

	// Tesla
	{ name: "Model S", brandName: "Tesla", year: 2024 },
	{ name: "Model X", brandName: "Tesla", year: 2024 },
	{ name: "Model Y", brandName: "Tesla", year: 2024 },
	{ name: "Cybertruck", brandName: "Tesla", year: 2024 },

	// Jaguar
	{ name: "XJ", brandName: "Jaguar", year: 2023 },
	{ name: "F-Pace", brandName: "Jaguar", year: 2024 },
	{ name: "I-Pace", brandName: "Jaguar", year: 2023 },
	{ name: "F-Type", brandName: "Jaguar", year: 2023 },

	// Land Rover
	{ name: "Range Rover", brandName: "Land Rover", year: 2024 },
	{ name: "Range Rover Sport", brandName: "Land Rover", year: 2024 },
	{ name: "Discovery", brandName: "Land Rover", year: 2023 },
	{ name: "Defender", brandName: "Land Rover", year: 2024 },

	// Bentley
	{ name: "Bentayga", brandName: "Bentley", year: 2024 },
	{ name: "Flying Spur", brandName: "Bentley", year: 2023 },
	{ name: "Continental GT", brandName: "Bentley", year: 2024 },
	{ name: "Mulsanne", brandName: "Bentley", year: 2023 },

	// Rolls-Royce
	{ name: "Phantom", brandName: "Rolls-Royce", year: 2024 },
	{ name: "Ghost", brandName: "Rolls-Royce", year: 2024 },
	{ name: "Cullinan", brandName: "Rolls-Royce", year: 2023 },
	{ name: "Wraith", brandName: "Rolls-Royce", year: 2023 },

	// Luxury vans and larger vehicles
	{ name: "300", brandName: "Chrysler", year: 2023 },
	{ name: "Pacifica", brandName: "Chrysler", year: 2024 },
	{ name: "XC90", brandName: "Volvo", year: 2024 },
	{ name: "GV80", brandName: "Genesis", year: 2024 },
	{ name: "Escalade", brandName: "Cadillac", year: 2024 },
];

// Car Categories
const carCategories = [
	{
		name: "Luxury Sedan",
		description: "Premium executive sedans for business and formal occasions",
	},
	{ name: "SUV", description: "Spacious luxury SUVs for groups and families" },
	{ name: "Sports Car", description: "High-performance luxury sports cars" },
	{
		name: "Electric Vehicle",
		description: "Luxury electric vehicles for eco-conscious travel",
	},
	{
		name: "Van/Minibus",
		description: "Large capacity vehicles for group transportation",
	},
	{
		name: "Convertible",
		description: "Open-top luxury vehicles for special occasions",
	},
	{ name: "Coupe", description: "Elegant two-door luxury vehicles" },
	{
		name: "Wagon",
		description: "Luxury station wagons with extra cargo space",
	},
];

// Car Features
const carFeatures = [
	{ name: "Bluetooth", description: "Wireless connectivity for devices" },
	{ name: "Wi-Fi Hotspot", description: "Internet connectivity on the go" },
	{ name: "Leather Seats", description: "Premium leather upholstery" },
	{ name: "Heated Seats", description: "Temperature-controlled seating" },
	{
		name: "Cooled Seats",
		description: "Air-conditioned seating for hot weather",
	},
	{ name: "Massage Seats", description: "Built-in seat massage functionality" },
	{ name: "Sunroof", description: "Panoramic or standard sunroof" },
	{ name: "Navigation System", description: "Built-in GPS navigation" },
	{ name: "Premium Sound System", description: "High-end audio system" },
	{
		name: "Rear Entertainment",
		description: "Screens and entertainment for rear passengers",
	},
	{ name: "Mini Bar", description: "Built-in refreshment storage" },
	{
		name: "Champagne Cooler",
		description: "Temperature-controlled beverage storage",
	},
	{
		name: "Privacy Partition",
		description: "Separation between driver and passenger areas",
	},
	{ name: "Tinted Windows", description: "Privacy and UV protection glass" },
	{ name: "Air Conditioning", description: "Climate control system" },
	{ name: "USB Charging", description: "Multiple USB charging ports" },
	{ name: "Wireless Charging", description: "Qi wireless phone charging pad" },
	{
		name: "Keyless Entry",
		description: "Push-button start and keyless access",
	},
	{
		name: "Adaptive Cruise Control",
		description: "Advanced driver assistance",
	},
	{ name: "360° Camera", description: "Surround view monitoring system" },
	{ name: "Lane Departure Warning", description: "Safety assistance feature" },
	{
		name: "Automatic Emergency Braking",
		description: "Collision avoidance system",
	},
	{ name: "Night Vision", description: "Enhanced visibility in low light" },
	{
		name: "Heads-Up Display",
		description: "Information projected on windshield",
	},
	{ name: "Ambient Lighting", description: "Customizable interior lighting" },
];

// Body Types - Luxury vehicle body styles
const carBodyTypes = [
	{ name: "Sedan" },
	{ name: "SUV" },
	{ name: "Coupe" },
	{ name: "Convertible" },
	{ name: "Wagon" },
	{ name: "Hatchback" },
	{ name: "Van" },
	{ name: "Minibus" },
	{ name: "Limousine" },
	{ name: "Saloon" },
];

// Other data arrays (fuel types, transmission types, etc.)
const carFuelTypes = [
	{ name: "Petrol", description: "Traditional gasoline engine" },
	{ name: "Diesel", description: "Diesel fuel engine" },
	{ name: "Hybrid", description: "Combined electric and petrol/diesel" },
	{ name: "Electric", description: "Fully electric vehicle" },
	{ name: "Plug-in Hybrid", description: "Rechargeable hybrid vehicle" },
	{ name: "Hydrogen", description: "Hydrogen fuel cell technology" },
];

const carTransmissionTypes = [
	{ name: "Automatic", description: "Traditional automatic transmission" },
	{ name: "Manual", description: "Manual gear transmission" },
	{ name: "CVT", description: "Continuously Variable Transmission" },
	{ name: "Semi-Automatic", description: "Automated manual transmission" },
	{ name: "Dual-Clutch", description: "High-performance dual-clutch system" },
	{ name: "Single-Speed", description: "Electric vehicle transmission" },
];

const carDriveTypes = [
	{ name: "Front-Wheel Drive (FWD)", description: "Power to front wheels" },
	{ name: "Rear-Wheel Drive (RWD)", description: "Power to rear wheels" },
	{
		name: "All-Wheel Drive (AWD)",
		description: "Power to all wheels automatically",
	},
	{
		name: "Four-Wheel Drive (4WD)",
		description: "Selectable four-wheel power",
	},
];

const carConditionTypes = [
	{ name: "Brand New", description: "Factory new vehicle" },
	{ name: "Excellent", description: "Like-new condition with minimal wear" },
	{ name: "Very Good", description: "Well-maintained with minor wear signs" },
	{ name: "Good", description: "Properly maintained with normal wear" },
	{ name: "Fair", description: "Functional with some wear and tear" },
];

const packageServiceTypes = [
	{
		name: "Transfer",
		description: "Point-to-point transportation services",
		icon: "🚗",
		displayOrder: 1,
	},
	{
		name: "Tours",
		description: "Guided sightseeing and touring services",
		icon: "🗺️",
		displayOrder: 2,
	},
	{
		name: "Event",
		description: "Special occasion and event transportation",
		icon: "🎉",
		displayOrder: 3,
	},
];

const packageCategories = [
	{
		name: "Airport Transfer",
		description: "Premium airport pickup and drop-off services",
		displayOrder: 1,
	},
	{
		name: "Corporate Transfers",
		description: "Professional business transportation solutions",
		displayOrder: 2,
	},
	{
		name: "Private Tours",
		description: "Customized sightseeing and touring experiences",
		displayOrder: 3,
	},
	{
		name: "Wedding/Special Events",
		description: "Luxury transportation for special occasions",
		displayOrder: 4,
	},
];

function escapeSQL(value: string): string {
	return value.replace(/'/g, "''");
}

async function generateSeedSQL() {
	console.log("🚀 Generating seed SQL...");

	const currentTime = Math.floor(Date.now() / 1000);

	let sql = "-- Utos & Co. Database Seed Data\n\n";

	// Skip Super Admin User creation
	// sql += "-- Super Admin User\n";
	// const hashedPassword = await customHash(superAdminUser.password);
	// const accountId = createId();
	// sql += `INSERT INTO users (id, name, email, email_verified, role, banned, created_at, updated_at) VALUES ('${superAdminUser.id}', '${escapeSQL(superAdminUser.name)}', '${escapeSQL(superAdminUser.email)}', ${superAdminUser.emailVerified ? 1 : 0}, '${superAdminUser.role}', ${superAdminUser.banned ? 1 : 0}, ${currentTime}, ${currentTime});\n`;
	// sql += `INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('${accountId}', '${superAdminUser.email}', 'credential', '${superAdminUser.id}', '${hashedPassword}', ${currentTime}, ${currentTime});\n\n`;

	// Car Brands
	sql += "-- Car Brands\n";
	const brandIds = new Map<string, string>();
	for (const brand of carBrands) {
		const id = createId();
		brandIds.set(brand.name, id);
		sql += `INSERT INTO car_brands (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(brand.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Car Models
	sql += "-- Car Models\n";
	for (const model of carModels) {
		const id = createId();
		const brandId = brandIds.get(model.brandName);
		if (brandId) {
			sql += `INSERT INTO car_models (id, name, brand_id, year, created_at, updated_at) VALUES ('${id}', '${escapeSQL(model.name)}', '${brandId}', ${model.year}, ${currentTime}, ${currentTime});\n`;
		}
	}
	sql += "\n";

	// Car Categories
	sql += "-- Car Categories\n";
	for (const category of carCategories) {
		const id = createId();
		sql += `INSERT INTO car_categories (id, name, description, created_at, updated_at) VALUES ('${id}', '${escapeSQL(category.name)}', '${escapeSQL(category.description)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Car Body Types
	sql += "-- Car Body Types\n";
	for (const bodyType of carBodyTypes) {
		const id = createId();
		sql += `INSERT INTO car_body_types (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(bodyType.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Car Features
	sql += "-- Car Features\n";
	for (const feature of carFeatures) {
		const id = createId();
		sql += `INSERT INTO car_features (id, name, description, created_at, updated_at) VALUES ('${id}', '${escapeSQL(feature.name)}', '${escapeSQL(feature.description)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Fuel Types (no description field)
	sql += "-- Fuel Types\n";
	for (const fuelType of carFuelTypes) {
		const id = createId();
		sql += `INSERT INTO car_fuel_types (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(fuelType.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Transmission Types (no description field)
	sql += "-- Transmission Types\n";
	for (const transmission of carTransmissionTypes) {
		const id = createId();
		sql += `INSERT INTO car_transmission_types (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(transmission.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Drive Types (no description field)
	sql += "-- Drive Types\n";
	for (const driveType of carDriveTypes) {
		const id = createId();
		sql += `INSERT INTO car_drive_types (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(driveType.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Condition Types (no description field)
	sql += "-- Condition Types\n";
	for (const condition of carConditionTypes) {
		const id = createId();
		sql += `INSERT INTO car_condition_types (id, name, created_at, updated_at) VALUES ('${id}', '${escapeSQL(condition.name)}', ${currentTime}, ${currentTime});\n`;
	}
	sql += "\n";

	// Package Service Types (skipped - table may not exist)
	// sql += "-- Package Service Types\n";
	// for (const serviceType of packageServiceTypes) {
	// 	const id = createId();
	// 	sql += `INSERT INTO package_service_types (id, name, description, icon, is_active, display_order, created_at, updated_at) VALUES ('${id}', '${escapeSQL(serviceType.name)}', '${escapeSQL(serviceType.description)}', '${escapeSQL(serviceType.icon)}', 1, ${serviceType.displayOrder}, ${currentTime}, ${currentTime});\n`;
	// }
	// sql += "\n";

	// Package Categories (skipped - table may not exist)
	// sql += "-- Package Categories\n";
	// for (const category of packageCategories) {
	// 	const id = createId();
	// 	sql += `INSERT INTO package_categories (id, name, description, display_order) VALUES ('${id}', '${escapeSQL(category.name)}', '${escapeSQL(category.description)}', ${category.displayOrder});\n`;
	// }

	// Write to file
	const seedPath = join(__dirname, "seed.sql");
	writeFileSync(seedPath, sql);

	console.log(`✅ Seed SQL generated at: ${seedPath}`);
	console.log(
		`📊 Generated: ${carBrands.length} brands, ${carModels.length} models, ${carCategories.length} categories, ${carFeatures.length} features, and more!`,
	);
}

generateSeedSQL().catch(console.error);
