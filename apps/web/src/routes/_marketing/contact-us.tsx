import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/contact-us')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_marketing/contact-us"!</div>
}
