import { useLocation } from "@tanstack/react-router";
import { LayoutDashboardIcon, CarIcon, UserIcon, SettingsIcon } from "lucide-react";
import type { DriverNavigationItem } from "./types";

export function useDriverNavigation(): DriverNavigationItem[] {
	const location = useLocation();

	return [
		{
			name: "Dashboard",
			href: "/driver",
			icon: LayoutDashboardIcon,
			active: location.pathname === "/driver",
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
			name: "Profile",
			href: "/driver/profile",
			icon: UserIcon,
			active: location.pathname === "/driver/profile",
			primary: true
		},
		{
			name: "Settings",
			href: "/driver/settings",
			icon: SettingsIcon,
			active: location.pathname === "/driver/settings",
			primary: true
		},
	];
}