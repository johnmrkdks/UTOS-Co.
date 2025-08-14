import type { RouteConfig } from "@/types/route-config";
import {
	BarChart3Icon,
	BookmarkIcon,
	BookTextIcon,
	CalendarCheck2,
	CalendarCheck2Icon,
	CalendarIcon,
	CarIcon,
	ClipboardListIcon,
	DollarSignIcon,
	EyeIcon,
	FlaskConicalIcon,
	InboxIcon,
	LayoutDashboardIcon,
	Package2Icon,
	SettingsIcon,
	UsersIcon,
} from "lucide-react";

const isDevelopment = import.meta.env.MODE === "development" || import.meta.env.DEV;

// Helper function to filter routes based on environment
const filterRoutesByEnvironment = (routes: RouteConfig[]): RouteConfig[] => {
	return routes.filter((route) => {
		// Hide these pages in production
		const developmentOnlyPaths = [
			"/dashboard/analytics",
			"/dashboard/pricing-config",
			"/dashboard/admin-testing",
			"/dashboard/publication-management",
		];

		if (developmentOnlyPaths.includes(route.path) && !isDevelopment) {
			return false;
		}

		return true;
	});
};

const ALL_DASHBOARD_ROUTES: RouteConfig[] = [
	{
		label: "Dashboard",
		path: "/dashboard/board",
		icon: LayoutDashboardIcon,
	},
	{
		label: "Analytics",
		path: "/dashboard/analytics",
		icon: BarChart3Icon,
	},
];

const ALL_DASHBOARD_MANAGEMENT_SUB_ROUTES: RouteConfig[] = [
	{
		label: "Packages",
		path: "/dashboard/packages",
		icon: Package2Icon,
	},
	{
		label: "Pricing Config",
		path: "/dashboard/pricing-config",
		icon: DollarSignIcon,
	},
	{
		label: "Car Management",
		path: "/dashboard/car-management",
		icon: CarIcon,
	},
	{
		label: "Drivers",
		path: "/dashboard/drivers",
		icon: UsersIcon,
	},
	{
		label: "Booking Management",
		path: "/dashboard/booking-management",
		icon: CalendarIcon,
	},
	{
		label: "Publication Management",
		path: "/dashboard/publication-management",
		icon: EyeIcon,
	},
];

const ALL_DASHBOARD_SUB_ROUTES: RouteConfig[] = [
	{
		label: "Admin Testing",
		path: "/dashboard/admin-testing",
		icon: FlaskConicalIcon,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		icon: SettingsIcon,
	},
	{
		label: "Report",
		path: "/dashboard/report",
		icon: ClipboardListIcon,
	},
	{
		label: "Inbox",
		path: "/dashboard/inbox",
		icon: InboxIcon,
	},
];

// Export filtered routes based on environment
export const DASHBOARD_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_ROUTES);
export const DASHBOARD_MANAGEMENT_SUB_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_MANAGEMENT_SUB_ROUTES);
export const DASHBOARD_SUB_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_SUB_ROUTES);

// Export all dashboard routes combined for breadcrumbs
export const ALL_DASHBOARD_ROUTES_COMBINED = [
	...DASHBOARD_ROUTES,
	...DASHBOARD_MANAGEMENT_SUB_ROUTES,
	...DASHBOARD_SUB_ROUTES,
];