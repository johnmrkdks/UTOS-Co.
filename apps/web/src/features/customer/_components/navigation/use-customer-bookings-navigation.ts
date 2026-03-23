import { useLocation } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Calendar, History, Home } from "lucide-react";
import type { CustomerNavigationItem } from "./types";

export function useCustomerBookingsNavigation(): CustomerNavigationItem[] {
	const location = useLocation();

	return [
		{
			name: "Back to Home",
			href: "/",
			icon: ArrowLeft,
			active: false,
			primary: false,
		},
		{
			name: "Dashboard",
			href: "/my-bookings/dashboard",
			icon: BarChart3,
			active: location.pathname === "/my-bookings/dashboard",
			primary: true,
		},
		{
			name: "Trips",
			href: "/my-bookings/trips",
			icon: Calendar,
			active: location.pathname === "/my-bookings/trips",
			primary: true,
		},
		{
			name: "History",
			href: "/my-bookings/history",
			icon: History,
			active: location.pathname === "/my-bookings/history",
			primary: true,
		},
	];
}
