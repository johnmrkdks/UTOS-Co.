import type { RouteConfig } from "@/types/route-config";
import {
	BookmarkIcon,
	BookTextIcon,
	CalendarCheck2,
	CalendarCheck2Icon,
	CalendarIcon,
	CarIcon,
	ClipboardListIcon,
	InboxIcon,
	LayoutDashboardIcon,
	Package2Icon,
	SettingsIcon,
} from "lucide-react";

export const DASHBOARD_ROUTES: RouteConfig[] = [
	{
		label: "Packages",
		path: "/dashboard",
		icon: Package2Icon,
	},
	{
		label: "Board",
		path: "/dashboard/board",
		icon: LayoutDashboardIcon,
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
	{
		label: "Settings",
		path: "/dashboard/settings",
		icon: SettingsIcon,
	},
];

export const DASHBOARD_MANAGEMENT_SUB_ROUTES: RouteConfig[] = [
	{
		label: "Car Management",
		path: "/dashboard/car-management",
		icon: CarIcon,
	},
	{
		label: "Booking Management",
		path: "/dashboard/booking-management",
		icon: CalendarIcon,
	},
];

export const DASHBOARD_SUB_ROUTES: RouteConfig[] = [
	{
		label: "Published",
		path: "/dashboard/published",
		icon: BookTextIcon,
	},
	{
		label: "Today's Scheduled",
		path: "/dashboard/todays-scheduled",
		icon: CalendarCheck2Icon,
	},
	{
		label: "Bookmarks",
		path: "/dashboard/bookmarks",
		icon: BookmarkIcon,
	},
];
