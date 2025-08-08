import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/')({
	beforeLoad: async () => {
		throw redirect({
			to: '/dashboard/board'
		})
	}
})
