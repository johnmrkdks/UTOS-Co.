import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	// No authentication required for auth routes
});

function AuthLayout() {
	return <Outlet />;
}