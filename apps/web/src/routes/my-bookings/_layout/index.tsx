import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/my-bookings/_layout/')({
	component: () => <Navigate to="/my-bookings/dashboard" replace />,
});