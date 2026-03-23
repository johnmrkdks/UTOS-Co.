import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/_layout/cars")({
	beforeLoad: () => {
		throw redirect({ to: "/fleet" })
	},
})
