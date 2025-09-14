import { createFileRoute } from '@tanstack/react-router';
import { CustomerBookingsDashboardPage } from '@/features/customer/_pages/bookings-dashboard-page';

export const Route = createFileRoute('/my-bookings/_layout/dashboard')({
	component: CustomerBookingsDashboardPage,
});