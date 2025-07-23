import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<main className="">
			Dashboard
		</main>
	)
}
