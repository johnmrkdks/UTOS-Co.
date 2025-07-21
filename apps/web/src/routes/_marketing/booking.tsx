import { Booking } from '@/features/marketing/booking/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/booking')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<main className="text-center w-10/12 mx-auto p-4">
			<Booking />
		</main>
	)
}
