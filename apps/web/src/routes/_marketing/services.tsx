import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_marketing/services"!</div>
}
