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
			"/dashboard/admin-testing",
		];

		if (developmentOnlyPaths.includes(route.path) && !isDevelopment) {
			return false;
		}

		return true;
	});
};

// Core dashboard and insights
const ALL_DASHBOARD_OVERVIEW_ROUTES: RouteConfig[] = [
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
	{
		label: "Reports",
		path: "/dashboard/report",
		icon: ClipboardListIcon,
	},
];

// Daily operational activities - booking lifecycle
const ALL_DASHBOARD_OPERATIONS_ROUTES: RouteConfig[] = [
	{
		label: "Bookings",
		path: "/dashboard/bookings",
		icon: CalendarIcon,
	},
	{
		label: "Drivers",
		path: "/dashboard/drivers",
		icon: UsersIcon,
	},
	{
		label: "Inbox",
		path: "/dashboard/inbox",
		icon: InboxIcon,
	},
];

// Business setup and configuration
const ALL_DASHBOARD_INVENTORY_ROUTES: RouteConfig[] = [
	{
		label: "Cars",
		path: "/dashboard/cars",
		icon: CarIcon,
	},
	{
		label: "Packages",
		path: "/dashboard/packages",
		icon: Package2Icon,
	},
	{
		label: "Publications",
		path: "/dashboard/publications",
		icon: EyeIcon,
	},
];

// System configuration and tools
const ALL_DASHBOARD_SYSTEM_ROUTES: RouteConfig[] = [
	{
		label: "Pricing Config",
		path: "/dashboard/pricing-config",
		icon: DollarSignIcon,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		icon: SettingsIcon,
	},
	{
		label: "Admin Testing",
		path: "/dashboard/admin-testing",
		icon: FlaskConicalIcon,
	},
];

// Export filtered routes based on environment
export const DASHBOARD_OVERVIEW_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_OVERVIEW_ROUTES);
export const DASHBOARD_OPERATIONS_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_OPERATIONS_ROUTES);
export const DASHBOARD_INVENTORY_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_INVENTORY_ROUTES);
export const DASHBOARD_SYSTEM_ROUTES = filterRoutesByEnvironment(ALL_DASHBOARD_SYSTEM_ROUTES);

// Backward compatibility - deprecated, use specific route groups above
export const DASHBOARD_ROUTES = DASHBOARD_OVERVIEW_ROUTES;
export const DASHBOARD_MANAGEMENT_SUB_ROUTES = [...DASHBOARD_OPERATIONS_ROUTES, ...DASHBOARD_INVENTORY_ROUTES];
export const DASHBOARD_SUB_ROUTES = DASHBOARD_SYSTEM_ROUTES;

// Export all dashboard routes combined for breadcrumbs
export const ALL_DASHBOARD_ROUTES_COMBINED = [
	...DASHBOARD_OVERVIEW_ROUTES,
	...DASHBOARD_OPERATIONS_ROUTES,
	...DASHBOARD_INVENTORY_ROUTES,
	...DASHBOARD_SYSTEM_ROUTES,
];
