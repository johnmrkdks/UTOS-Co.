import { createFileRoute } from '@tanstack/react-router'
import { FAQs } from '@/features/marketing/_pages/faqs/_components'

export const Route = createFileRoute('/_marketing/faqs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <FAQs />
    </main>
  )
}
