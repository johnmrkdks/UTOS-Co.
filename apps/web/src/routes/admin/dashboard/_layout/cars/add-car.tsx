import { createFileRoute } from "@tanstack/react-router";
import { AddCar } from "@/features/dashboard/_pages/car-management/_components/add-car";

export const Route = createFileRoute("/admin/dashboard/_layout/cars/add-car")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AddCar />;
}
