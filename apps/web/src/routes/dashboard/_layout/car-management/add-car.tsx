import { PaddingLayout } from '@/features/dashboard/_layouts/padding-layout'
import { AddCar } from '@/features/dashboard/_pages/car-management/_components/add-car'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
	'/dashboard/_layout/car-management/add-car',
)({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<PaddingLayout>
			<AddCar />
		</PaddingLayout>
	)
}
