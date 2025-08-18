import type { LucideIcon } from "lucide-react";

export interface DriverNavigationItem {
	name: string;
	href: string;
	icon: LucideIcon;
	active: boolean;
	primary: boolean;
}