import { useLocation } from "@tanstack/react-router";
import { LayoutDashboardIcon, CarIcon, ClockIcon, MapPinIcon, UserIcon, SettingsIcon } from "lucide-react";
import type { DriverNavigationItem } from "./types";

export function useDriverNavigation(): DriverNavigationItem[] {
	const location = useLocation();

	return [
		{
			name: "Available Trips",
			href: "/driver/available",
			icon: MapPinIcon,
			active: location.pathname === "/driver/available",
			primary: true
		},
		{
			name: "My Trips",
			href: "/driver/trips",
			icon: CarIcon,
			active: location.pathname === "/driver/trips",
			primary: true
		},
		{
			name: "History",
			href: "/driver/history",
			icon: ClockIcon,
			active: location.pathname === "/driver/history",
			primary: true
		},
		{
			name: "Dashboard",
			href: "/driver/dashboard",
			icon: LayoutDashboardIcon,
			active: location.pathname === "/driver/dashboard",
			primary: true
		},
		{
			name: "Profile",
			href: "/driver/profile",
			icon: UserIcon,
			active: location.pathname === "/driver/profile",
			primary: false
		},
		{
			name: "Settings",
			href: "/driver/settings",
			icon: SettingsIcon,
			active: location.pathname === "/driver/settings",
			primary: false
		},
	];
}