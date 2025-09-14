import { createFileRoute } from '@tanstack/react-router';
import { CustomerBookingsLayout } from '@/features/customer/_components/layout/customer-bookings-layout';

export const Route = createFileRoute('/my-bookings/_layout')({
	component: CustomerBookingsLayout,
});