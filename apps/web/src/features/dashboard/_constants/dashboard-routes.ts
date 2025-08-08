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
	FlaskConicalIcon,
	FoldersIcon,
	InboxIcon,
	LayoutDashboardIcon,
	Package2Icon,
	SettingsIcon,
	UsersIcon,
} from "lucide-react";

export const DASHBOARD_ROUTES: RouteConfig[] = [
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

export const DASHBOARD_MANAGEMENT_SUB_ROUTES: RouteConfig[] = [
	{
		label: "Packages",
		path: "/dashboard/packages",
		icon: Package2Icon,
	},
	{
		label: "Package Categories",
		path: "/dashboard/package-categories",
		icon: FoldersIcon,
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
];

export const DASHBOARD_SUB_ROUTES: RouteConfig[] = [
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
