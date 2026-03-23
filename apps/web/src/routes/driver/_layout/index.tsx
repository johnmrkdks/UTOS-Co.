import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/driver/_layout/")({
	component: DriverIndexRedirect,
});

function DriverIndexRedirect() {
	return <Navigate to="/driver/available" replace />;
}
