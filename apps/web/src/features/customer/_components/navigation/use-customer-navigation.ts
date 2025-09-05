import { useLocation } from "@tanstack/react-router";
import { Home, Calendar, Package, User, Settings, Calculator, Car } from "lucide-react";
import type { CustomerNavigationItem } from "./types";

export function useCustomerNavigation(): CustomerNavigationItem[] {
	const location = useLocation();

	return [
		{
			name: "Dashboard",
			href: "/dashboard",
			icon: Home,
			active: location.pathname === "/dashboard",
			primary: true
		},
		{
			name: "My Bookings",
			href: "/my-bookings",
			icon: Calendar,
			active: location.pathname === "/my-bookings",
			primary: true
		},
		{
			name: "Browse Services",
			href: "/services",
			icon: Package,
			active: location.pathname === "/services",
			primary: true
		},
		{
			name: "Browse Cars",
			href: "/fleet",
			icon: Car,
			active: location.pathname === "/fleet",
			primary: true
		},
		{
			name: "Instant Quote",
			href: "/",
			icon: Calculator,
			active: location.pathname === "/" && location.search?.includes("instant-quote"),
			primary: true
		},
	];
}
