import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/faqs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_marketing/faqs"!</div>
}
