import type { RouteConfig } from "@/types/route-config";
import { ALL_DASHBOARD_ROUTES_COMBINED } from "./dashboard-routes";
import { MARKETING_ROUTES } from "./marketing-routes";

// Combined routes for easy lookup
export const ALL_ROUTES: RouteConfig[] = [
	...MARKETING_ROUTES,
	...ALL_DASHBOARD_ROUTES_COMBINED,
];

// Route lookup utility
export const getRouteByPath = (path: string): RouteConfig | undefined => {
	return ALL_ROUTES.find(route => route.path === path);
};

// Get route label by path
export const getRouteLabelByPath = (path: string): string => {
	const route = getRouteByPath(path);
	return route?.label || formatPathToLabel(path);
};

// Fallback function to format path to readable label
export const formatPathToLabel = (path: string): string => {
	// Remove leading slash and split by /
	const segments = path.replace(/^\//, "").split("/");
	const lastSegment = segments[segments.length - 1];

	if (!lastSegment) return "Home";

	// Handle special cases
	const labelMap: Record<string, string> = {
		"bookings": "Booking Management",
		"cars": "Car Management",
		"pricing-config": "Pricing Config",
		"admin-testing": "Admin Testing",
		"publications": "Publication Management",
		"todays-scheduled": "Today's Scheduled",
		"about-us": "About Us",
		"contact-us": "Contact Us",
	};

	if (labelMap[lastSegment]) {
		return labelMap[lastSegment];
	}

	// Default formatting: kebab-case to Title Case
	return lastSegment
		.split("-")
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

// Get breadcrumb trail for a given path
export const getBreadcrumbTrail = (pathname: string): Array<{ label: string; path?: string }> => {
	const pathSegments = pathname.split("/").filter(Boolean);
	const breadcrumbs: Array<{ label: string; path?: string }> = [];

	// Always start with root
	if (pathname.startsWith("/dashboard")) {
		// Always add Dashboard as root for dashboard routes
		breadcrumbs.push({ label: "Dashboard", path: "/dashboard" });

		// Skip the first segment if it's "dashboard"
		const relevantSegments = pathSegments[0] === "dashboard"
			? pathSegments.slice(1)
			: pathSegments;

		relevantSegments.forEach((segment, index) => {
			const currentPath = `/dashboard/${relevantSegments.slice(0, index + 1).join("/")}`;
			const label = getRouteLabelByPath(currentPath);

			// Skip if the label is the same as "Dashboard" to avoid duplication
			if (label === "Dashboard") {
				return;
			}

			// Don't add path to the last item (current page)
			const isLast = index === relevantSegments.length - 1;
			breadcrumbs.push({
				label,
				path: isLast ? undefined : currentPath
			});
		});
	} else {
		// For marketing routes, start with Home only if we have sub-routes
		if (pathSegments.length > 0 && pathname !== "/") {
			breadcrumbs.push({ label: "Home", path: "/" });
		}

		pathSegments.forEach((segment, index) => {
			const currentPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
			const label = getRouteLabelByPath(currentPath);

			// Don't add path to the last item (current page)
			const isLast = index === pathSegments.length - 1;
			breadcrumbs.push({
				label,
				path: isLast ? undefined : currentPath
			});
		});
	}

	return breadcrumbs;
};
