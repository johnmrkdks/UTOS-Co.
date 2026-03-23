import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { VehicleSelectionPage } from "@/features/marketing/_pages/vehicle-selection/vehicle-selection-page";

const vehicleSelectionSearchSchema = z.object({
	origin: z.string().optional(),
	destination: z.string().optional(),
	originLat: z.string().optional(),
	originLng: z.string().optional(),
	destinationLat: z.string().optional(),
	destinationLng: z.string().optional(),
	stops: z.string().optional(), // JSON string of stops
	selectedCarId: z.string().optional(),
	fromCustomerArea: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/select-vehicle")({
	validateSearch: vehicleSelectionSearchSchema,
	component: VehicleSelectionPage,
});
