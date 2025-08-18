import { createFileRoute } from '@tanstack/react-router';
import { DriverLayout } from '@/features/driver/_components/layout';

export const Route = createFileRoute('/driver/_layout')({
	component: DriverLayout,
});
