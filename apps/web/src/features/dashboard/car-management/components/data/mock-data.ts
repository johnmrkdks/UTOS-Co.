import type {
	Car,
	CarBrand,
	CarModel,
	CarFuelType,
	CarBodyType,
	CarTransmissionType,
	CarDriveType,
	CarConditionType,
} from "server/types";

export const mockBrands: CarBrand[] = [
	{ id: "1", name: "Toyota", createdAt: new Date() },
	{ id: "2", name: "Honda", createdAt: new Date() },
	{ id: "3", name: "BMW", createdAt: new Date() },
	{ id: "4", name: "Mercedes-Benz", createdAt: new Date() },
	{ id: "5", name: "Audi", createdAt: new Date() },
];

export const mockModels: CarModel[] = [
	{ id: "1", name: "Camry", brandId: "1", createdAt: new Date() },
	{ id: "2", name: "Corolla", brandId: "1", createdAt: new Date() },
	{ id: "3", name: "Civic", brandId: "2", createdAt: new Date() },
	{ id: "4", name: "Accord", brandId: "2", createdAt: new Date() },
	{ id: "5", name: "X3", brandId: "3", createdAt: new Date() },
	{ id: "6", name: "X5", brandId: "3", createdAt: new Date() },
];

export const mockFuelTypes: CarFuelType[] = [
	{ id: "1", name: "Petrol", createdAt: new Date() },
	{ id: "2", name: "Diesel", createdAt: new Date() },
	{ id: "3", name: "Hybrid", createdAt: new Date() },
	{ id: "4", name: "Electric", createdAt: new Date() },
];

export const mockBodyTypes: CarBodyType[] = [
	{ id: "1", name: "Sedan", createdAt: new Date() },
	{ id: "2", name: "SUV", createdAt: new Date() },
	{ id: "3", name: "Hatchback", createdAt: new Date() },
	{ id: "4", name: "Coupe", createdAt: new Date() },
	{ id: "5", name: "Convertible", createdAt: new Date() },
];

export const mockTransmissionTypes: CarTransmissionType[] = [
	{ id: "1", name: "Manual", createdAt: new Date() },
	{ id: "2", name: "Automatic", createdAt: new Date() },
	{ id: "3", name: "CVT", createdAt: new Date() },
];

export const mockDriveTypes: CarDriveType[] = [
	{ id: "1", name: "Front-Wheel Drive", createdAt: new Date() },
	{ id: "2", name: "Rear-Wheel Drive", createdAt: new Date() },
	{ id: "3", name: "All-Wheel Drive", createdAt: new Date() },
	{ id: "4", name: "Four-Wheel Drive", createdAt: new Date() },
];

export const mockConditions: CarConditionType[] = [
	{ id: "1", name: "New", createdAt: new Date() },
	{ id: "2", name: "Like New", createdAt: new Date() },
	{ id: "3", name: "Excellent", createdAt: new Date() },
	{ id: "4", name: "Good", createdAt: new Date() },
	{ id: "5", name: "Fair", createdAt: new Date() },
];

export const mockCars: Car[] = [
	{
		id: "1",
		name: "2023 Toyota Camry LE",
		brandId: "1",
		modelId: "1",
		year: 2023,
		fuelTypeId: "3",
		bodyTypeId: "1",
		transmissionTypeId: "2",
		driveTypeId: "1",
		conditionId: "2",
		price: 28500,
		mileage: 15000,
		description: "Well-maintained hybrid sedan with excellent fuel economy",
		imageUrl: "/placeholder.svg?height=200&width=300",
		createdAt: new Date(),
	},
	{
		id: "2",
		name: "2022 Honda Civic Sport",
		brandId: "2",
		modelId: "3",
		year: 2022,
		fuelTypeId: "1",
		bodyTypeId: "3",
		transmissionTypeId: "1",
		driveTypeId: "1",
		conditionId: "3",
		price: 24900,
		mileage: 22000,
		description: "Sporty hatchback with manual transmission",
		imageUrl: "/placeholder.svg?height=200&width=300",
		createdAt: new Date(),
	},
	{
		id: "3",
		name: "2021 BMW X5 xDrive40i",
		brandId: "3",
		modelId: "6",
		year: 2021,
		fuelTypeId: "1",
		bodyTypeId: "2",
		transmissionTypeId: "2",
		driveTypeId: "3",
		conditionId: "3",
		price: 52900,
		mileage: 35000,
		description: "Luxury SUV with all-wheel drive and premium features",
		imageUrl: "/placeholder.svg?height=200&width=300",
		createdAt: new Date(),
	},
];
