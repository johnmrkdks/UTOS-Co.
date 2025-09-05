import { Fleet } from '@/features/marketing/_pages/fleet/_components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/fleet')({
	component: RouteComponent,
})

function RouteComponent() {
	return <Fleet />
}
