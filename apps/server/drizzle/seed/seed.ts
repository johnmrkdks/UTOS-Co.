import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../src/db/sqlite/schema";
import { UserRoleEnum } from "../../src/db/sqlite/enums";
import { createId } from "@paralleldrive/cuid2";

// Super Admin User Data
const superAdminUser = {
	id: createId(),
	name: "Super Admin",
	email: "admin@downunderchauffeurs.com",
	emailVerified: true,
	role: UserRoleEnum.SuperAdmin,
	banned: false,
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

// Car Models by Brand
const carModels = [
	// Mercedes-Benz
	{ name: "S-Class", brandName: "Mercedes-Benz" },
	{ name: "E-Class", brandName: "Mercedes-Benz" },
	{ name: "GLS-Class", brandName: "Mercedes-Benz" },
	{ name: "G-Class", brandName: "Mercedes-Benz" },
	{ name: "Maybach S-Class", brandName: "Mercedes-Benz" },
	{ name: "AMG GT", brandName: "Mercedes-Benz" },
	{ name: "Sprinter", brandName: "Mercedes-Benz" },

	// BMW
	{ name: "7 Series", brandName: "BMW" },
	{ name: "5 Series", brandName: "BMW" },
	{ name: "X7", brandName: "BMW" },
	{ name: "X5", brandName: "BMW" },
	{ name: "i7", brandName: "BMW" },
	{ name: "M8", brandName: "BMW" },

	// Audi
	{ name: "A8", brandName: "Audi" },
	{ name: "A6", brandName: "Audi" },
	{ name: "Q8", brandName: "Audi" },
	{ name: "Q7", brandName: "Audi" },
	{ name: "e-tron GT", brandName: "Audi" },
	{ name: "R8", brandName: "Audi" },

	// Lexus
	{ name: "LS", brandName: "Lexus" },
	{ name: "LX", brandName: "Lexus" },
	{ name: "GX", brandName: "Lexus" },
	{ name: "ES", brandName: "Lexus" },
	{ name: "LC", brandName: "Lexus" },

	// Porsche
	{ name: "Panamera", brandName: "Porsche" },
	{ name: "Cayenne", brandName: "Porsche" },
	{ name: "911", brandName: "Porsche" },
	{ name: "Taycan", brandName: "Porsche" },
	{ name: "Macan", brandName: "Porsche" },

	// Tesla
	{ name: "Model S", brandName: "Tesla" },
	{ name: "Model X", brandName: "Tesla" },
	{ name: "Model Y", brandName: "Tesla" },
	{ name: "Cybertruck", brandName: "Tesla" },

	// Jaguar
	{ name: "XJ", brandName: "Jaguar" },
	{ name: "F-Pace", brandName: "Jaguar" },
	{ name: "I-Pace", brandName: "Jaguar" },
	{ name: "F-Type", brandName: "Jaguar" },

	// Land Rover
	{ name: "Range Rover", brandName: "Land Rover" },
	{ name: "Range Rover Sport", brandName: "Land Rover" },
	{ name: "Discovery", brandName: "Land Rover" },
	{ name: "Defender", brandName: "Land Rover" },

	// Bentley
	{ name: "Bentayga", brandName: "Bentley" },
	{ name: "Flying Spur", brandName: "Bentley" },
	{ name: "Continental GT", brandName: "Bentley" },
	{ name: "Mulsanne", brandName: "Bentley" },

	// Rolls-Royce
	{ name: "Phantom", brandName: "Rolls-Royce" },
	{ name: "Ghost", brandName: "Rolls-Royce" },
	{ name: "Cullinan", brandName: "Rolls-Royce" },
	{ name: "Wraith", brandName: "Rolls-Royce" },

	// Luxury vans and larger vehicles
	{ name: "300", brandName: "Chrysler" },
	{ name: "Pacifica", brandName: "Chrysler" },
	{ name: "XC90", brandName: "Volvo" },
	{ name: "GV80", brandName: "Genesis" },
	{ name: "Escalade", brandName: "Cadillac" },
];

// Car Categories
const carCategories = [
	{ name: "Luxury Sedan", description: "Premium executive sedans for business and formal occasions" },
	{ name: "SUV", description: "Spacious luxury SUVs for groups and families" },
	{ name: "Sports Car", description: "High-performance luxury sports cars" },
	{ name: "Electric Vehicle", description: "Luxury electric vehicles for eco-conscious travel" },
	{ name: "Van/Minibus", description: "Large capacity vehicles for group transportation" },
	{ name: "Convertible", description: "Open-top luxury vehicles for special occasions" },
	{ name: "Coupe", description: "Elegant two-door luxury vehicles" },
	{ name: "Wagon", description: "Luxury station wagons with extra cargo space" },
];

// Car Features
const carFeatures = [
	{ name: "Bluetooth", description: "Wireless connectivity for devices" },
	{ name: "Wi-Fi Hotspot", description: "Internet connectivity on the go" },
	{ name: "Leather Seats", description: "Premium leather upholstery" },
	{ name: "Heated Seats", description: "Temperature-controlled seating" },
	{ name: "Cooled Seats", description: "Air-conditioned seating for hot weather" },
	{ name: "Massage Seats", description: "Built-in seat massage functionality" },
	{ name: "Sunroof", description: "Panoramic or standard sunroof" },
	{ name: "Navigation System", description: "Built-in GPS navigation" },
	{ name: "Premium Sound System", description: "High-end audio system" },
	{ name: "Rear Entertainment", description: "Screens and entertainment for rear passengers" },
	{ name: "Mini Bar", description: "Built-in refreshment storage" },
	{ name: "Champagne Cooler", description: "Temperature-controlled beverage storage" },
	{ name: "Privacy Partition", description: "Separation between driver and passenger areas" },
	{ name: "Tinted Windows", description: "Privacy and UV protection glass" },
	{ name: "Air Conditioning", description: "Climate control system" },
	{ name: "USB Charging", description: "Multiple USB charging ports" },
	{ name: "Wireless Charging", description: "Qi wireless phone charging pad" },
	{ name: "Keyless Entry", description: "Push-button start and keyless access" },
	{ name: "Adaptive Cruise Control", description: "Advanced driver assistance" },
	{ name: "360° Camera", description: "Surround view monitoring system" },
	{ name: "Lane Departure Warning", description: "Safety assistance feature" },
	{ name: "Automatic Emergency Braking", description: "Collision avoidance system" },
	{ name: "Night Vision", description: "Enhanced visibility in low light" },
	{ name: "Heads-Up Display", description: "Information projected on windshield" },
	{ name: "Ambient Lighting", description: "Customizable interior lighting" },
];

// Fuel Types
const carFuelTypes = [
	{ name: "Petrol", description: "Traditional gasoline engine" },
	{ name: "Diesel", description: "Diesel fuel engine" },
	{ name: "Hybrid", description: "Combined electric and petrol/diesel" },
	{ name: "Electric", description: "Fully electric vehicle" },
	{ name: "Plug-in Hybrid", description: "Rechargeable hybrid vehicle" },
	{ name: "Hydrogen", description: "Hydrogen fuel cell technology" },
];

// Transmission Types
const carTransmissionTypes = [
	{ name: "Automatic", description: "Traditional automatic transmission" },
	{ name: "Manual", description: "Manual gear transmission" },
	{ name: "CVT", description: "Continuously Variable Transmission" },
	{ name: "Semi-Automatic", description: "Automated manual transmission" },
	{ name: "Dual-Clutch", description: "High-performance dual-clutch system" },
	{ name: "Single-Speed", description: "Electric vehicle transmission" },
];

// Drive Types
const carDriveTypes = [
	{ name: "Front-Wheel Drive (FWD)", description: "Power to front wheels" },
	{ name: "Rear-Wheel Drive (RWD)", description: "Power to rear wheels" },
	{ name: "All-Wheel Drive (AWD)", description: "Power to all wheels automatically" },
	{ name: "Four-Wheel Drive (4WD)", description: "Selectable four-wheel power" },
];

// Condition Types
const carConditionTypes = [
	{ name: "Brand New", description: "Factory new vehicle" },
	{ name: "Excellent", description: "Like-new condition with minimal wear" },
	{ name: "Very Good", description: "Well-maintained with minor wear signs" },
	{ name: "Good", description: "Properly maintained with normal wear" },
	{ name: "Fair", description: "Functional with some wear and tear" },
];

// Package Service Types
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

// Package Categories
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

export async function seed(db: any) {
	console.log("🌱 Starting database seeding...");

	try {
		// 1. Create Super Admin User
		console.log("👤 Creating super admin user...");
		await db.insert(schema.users).values(superAdminUser);

		// 2. Insert Car Brands
		console.log("🏢 Inserting car brands...");
		const insertedBrands = await db.insert(schema.carBrands).values(
			carBrands.map(brand => ({
				id: createId(),
				name: brand.name,
			}))
		).returning();

		// Create brand lookup for models
		const brandLookup = new Map(
			insertedBrands.map((brand: { name: string; id: string }) => [brand.name, brand.id])
		);

		// 3. Insert Car Models
		console.log("🚗 Inserting car models...");
		await db.insert(schema.carModels).values(
			carModels.map(model => ({
				id: createId(),
				name: model.name,
				brandId: brandLookup.get(model.brandName)!,
			}))
		);

		// 4. Insert Car Categories
		console.log("📋 Inserting car categories...");
		await db.insert(schema.carCategories).values(
			carCategories.map(category => ({
				id: createId(),
				name: category.name,
				description: category.description,
			}))
		);

		// 5. Insert Car Features
		console.log("✨ Inserting car features...");
		await db.insert(schema.carFeatures).values(
			carFeatures.map(feature => ({
				id: createId(),
				name: feature.name,
				description: feature.description,
			}))
		);

		// 6. Insert Fuel Types
		console.log("⛽ Inserting fuel types...");
		await db.insert(schema.carFuelTypes).values(
			carFuelTypes.map(fuelType => ({
				id: createId(),
				name: fuelType.name,
				description: fuelType.description,
			}))
		);

		// 7. Insert Transmission Types
		console.log("⚙️ Inserting transmission types...");
		await db.insert(schema.carTransmissionTypes).values(
			carTransmissionTypes.map(transmission => ({
				id: createId(),
				name: transmission.name,
				description: transmission.description,
			}))
		);

		// 8. Insert Drive Types
		console.log("🛞 Inserting drive types...");
		await db.insert(schema.carDriveTypes).values(
			carDriveTypes.map(driveType => ({
				id: createId(),
				name: driveType.name,
				description: driveType.description,
			}))
		);

		// 9. Insert Condition Types
		console.log("🔧 Inserting condition types...");
		await db.insert(schema.carConditionTypes).values(
			carConditionTypes.map(condition => ({
				id: createId(),
				name: condition.name,
				description: condition.description,
			}))
		);

		// 10. Insert Package Service Types
		console.log("📦 Inserting package service types...");
		await db.insert(schema.packageServiceTypes).values(
			packageServiceTypes.map(serviceType => ({
				id: createId(),
				name: serviceType.name,
				description: serviceType.description,
				icon: serviceType.icon,
				isActive: true,
				displayOrder: serviceType.displayOrder,
			}))
		);

		// 11. Insert Package Categories
		console.log("📂 Inserting package categories...");
		await db.insert(schema.packageCategories).values(
			packageCategories.map(category => ({
				id: createId(),
				name: category.name,
				description: category.description,
				displayOrder: category.displayOrder,
			}))
		);

		console.log("✅ Database seeding completed successfully!");
		console.log(`
📊 Seeding Summary:
   👤 Users: 1 super admin
   🏢 Car Brands: ${carBrands.length}
   🚗 Car Models: ${carModels.length}
   📋 Car Categories: ${carCategories.length}
   ✨ Car Features: ${carFeatures.length}
   ⛽ Fuel Types: ${carFuelTypes.length}
   ⚙️ Transmission Types: ${carTransmissionTypes.length}
   🛞 Drive Types: ${carDriveTypes.length}
   🔧 Condition Types: ${carConditionTypes.length}
   📦 Service Types: ${packageServiceTypes.length}
   📂 Package Categories: ${packageCategories.length}
		`);

	} catch (error) {
		console.error("❌ Seeding failed:", error);
		throw error;
	}
}

// Export default function for direct execution
export default seed;