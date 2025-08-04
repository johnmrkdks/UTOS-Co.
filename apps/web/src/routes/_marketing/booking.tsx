import { Booking } from '@/features/marketing/_pages/bookings/_components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/booking')({
	component: RouteComponent,
})

function RouteComponent() {
	return <Booking />
}
