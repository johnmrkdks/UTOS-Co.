import { createFileRoute } from '@tanstack/react-router';
import { CustomerTripsPage } from '@/features/customer/_pages/trips-page';

export const Route = createFileRoute('/my-bookings/_layout/trips')({
	component: CustomerTripsPage,
});