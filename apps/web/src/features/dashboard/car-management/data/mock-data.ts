import type { Car, CarBrand, CarModel, CarFuelType, CarBodyType, CarTransmissionType, CarDriveType, CarConditionType } from "server/types";

export const mockBrands: CarBrand[] = [
    { id: "1", name: "Toyota", createdAt: new Date() },
    { id: "2", name: "Honda", createdAt: new Date() },
    { id: "3", name: "Ford", createdAt: new Date() },
];

export const mockModels: CarModel[] = [
    { id: "1", name: "Camry", brandId: "1", year: 2022, generation: "XV70", createdAt: new Date() },
    { id: "2", name: "Civic", brandId: "2", year: 2023, generation: "FE", createdAt: new Date() },
    { id: "3", name: "Mustang", brandId: "3", year: 2024, generation: "S650", createdAt: new Date() },
];

export const mockFuelTypes: CarFuelType[] = [
    { id: "1", name: "Gasoline", createdAt: new Date() },
    { id: "2", name: "Diesel", createdAt: new Date() },
    { id: "3", name: "Electric", createdAt: new Date() },
];

export const mockBodyTypes: CarBodyType[] = [
    { id: "1", name: "Sedan", createdAt: new Date() },
    { id: "2", name: "SUV", createdAt: new Date() },
    { id: "3", name: "Truck", createdAt: new Date() },
];

export const mockTransmissionTypes: CarTransmissionType[] = [
    { id: "1", name: "Automatic", createdAt: new Date() },
    { id: "2", name: "Manual", createdAt: new Date() },
];

export const mockDriveTypes: CarDriveType[] = [
    { id: "1", name: "FWD", createdAt: new Date() },
    { id: "2", name: "RWD", createdAt: new Date() },
    { id: "3", name: "AWD", createdAt: new Date() },
];

export const mockConditions: CarConditionType[] = [
    { id: "1", name: "New", createdAt: new Date() },
    { id: "2", name: "Used", createdAt: new Date() },
];

export const mockCars: Car[] = [
    {
        id: "1",
        name: "Toyota Camry",
        description: "A reliable and comfortable sedan.",
        dateManufactured: new Date("2022-01-01"),
        modelId: "1",
        bodyTypeId: "1",
        fuelTypeId: "1",
        transmissionTypeId: "1",
        driveTypeId: "1",
        conditionTypeId: "1",
        mileage: 15000,
        price: 25000,
        imageUrl: "/placeholder.svg",
        createdAt: new Date(),
        updatedAt: new Date(),
        brand: { id: "1", name: "Toyota", createdAt: new Date() },
        model: { id: "1", name: "Camry", brandId: "1", year: 2022, generation: "XV70", createdAt: new Date() },
        bodyType: { id: "1", name: "Sedan", createdAt: new Date() },
        fuelType: { id: "1", name: "Gasoline", createdAt: new Date() },
        transmissionType: { id: "1", name: "Automatic", createdAt: new Date() },
        driveType: { id: "1", name: "FWD", createdAt: new Date() },
        conditionType: { id: "1", name: "New", createdAt: new Date() },
    },
];
