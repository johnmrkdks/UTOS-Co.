import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard/_layout/bookmarks/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/dashboard/_layout/bookmarks/"!</div>
}
