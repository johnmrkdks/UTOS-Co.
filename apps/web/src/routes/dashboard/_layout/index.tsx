import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
		<main className="min-h-screen bg-[url(/images/car1.png)] bg-center bg-cover bg-no-repeat">
      Dashboard
    </main>
	)
}
