import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard/_layout/')({
	beforeLoad: async () => {
		throw redirect({
			to: '/admin/dashboard/board'
		})
	}
})
