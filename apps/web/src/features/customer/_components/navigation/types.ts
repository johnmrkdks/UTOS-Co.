import type { LucideIcon } from "lucide-react";

export interface CustomerNavigationItem {
	name: string;
	href: string;
	icon: LucideIcon;
	active: boolean;
	primary: boolean;
}