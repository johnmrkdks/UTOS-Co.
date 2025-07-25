import { useRouterState } from "@tanstack/react-router";

export function useModalProvider() {
	const router = useRouterState();
	const pathname = router.location.pathname;

	const isInDashboard = pathname.startsWith("/dashboard");

	// Handle both /dashboard and /dashboard/section paths
	let currentSection: string | undefined;

	if (pathname === "/dashboard") {
		currentSection = "dashboard"; // Base dashboard path
	} else if (pathname.startsWith("/dashboard/")) {
		currentSection = pathname.split("/dashboard/")[1]?.split("/")[0];
	}

	return {
		isInDashboard,
		currentSection,
		shouldShowModal: (section: string): boolean =>
			isInDashboard && currentSection === section,
	};
}
