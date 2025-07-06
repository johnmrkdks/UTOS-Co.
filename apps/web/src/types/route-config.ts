import type { LucideIcon } from "lucide-react";

export type RouteConfig = {
	path: string;
	label: string;
	icon?: LucideIcon;
  isActive?: boolean;
	params?: Record<string, any>;
};
