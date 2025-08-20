import { useLocation } from "@tanstack/react-router";
import { Home, Calendar, Package, User, Settings, Calculator, Car } from "lucide-react";
import type { CustomerNavigationItem } from "./types";

export function useCustomerNavigation(): CustomerNavigationItem[] {
	const location = useLocation();

	return [
		{
			name: "Dashboard",
			href: "/customer",
			icon: Home,
			active: location.pathname === "/customer",
			primary: true
		},
		{
			name: "My Bookings",
			href: "/customer/bookings",
			icon: Calendar,
			active: location.pathname === "/customer/bookings",
			primary: true
		},
		{
			name: "Browse Services",
			href: "/customer/services",
			icon: Package,
			active: location.pathname === "/customer/services",
			primary: true
		},
		{
			name: "Browse Cars",
			href: "/customer/cars",
			icon: Car,
			active: location.pathname === "/customer/cars",
			primary: true
		},
		{
			name: "Instant Quote",
			href: "/customer/instant-quote",
			icon: Calculator,
			active: location.pathname === "/customer/instant-quote",
			primary: true
		},
	];
}
