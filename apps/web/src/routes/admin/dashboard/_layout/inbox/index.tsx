import { createFileRoute } from '@tanstack/react-router'
import { InboxPage } from '@/features/dashboard/_pages/inbox/_components/inbox-page'

export const Route = createFileRoute('/admin/dashboard/_layout/inbox/')({
  component: InboxPage,
})
