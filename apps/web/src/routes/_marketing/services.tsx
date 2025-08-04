import { createFileRoute } from '@tanstack/react-router'
import { Services } from '@/features/marketing/_pages/services/_components'

export const Route = createFileRoute('/_marketing/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Services />
    </main>
  )
}
