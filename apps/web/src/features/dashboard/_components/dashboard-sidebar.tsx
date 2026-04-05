import { Link, useLocation } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import {
	DASHBOARD_INVENTORY_ROUTES,
	DASHBOARD_OPERATIONS_ROUTES,
	DASHBOARD_OVERVIEW_ROUTES,
	DASHBOARD_SYSTEM_ROUTES,
	SUPER_ADMIN_ROUTES,
} from "@/constants/dashboard-routes";
import { useSession } from "@/providers/session-provider";
import type { RouteConfig } from "@/types/route-config";
import { DashboardCompanyLogo } from "./sidebar/dashboard-company";

type LinkProps = {
	title: string;
	url: string;
	items?: RouteConfig[];
};

const getLinks = (
	filterRoutes: (r: RouteConfig[]) => RouteConfig[],
	isSuperAdmin: boolean,
): LinkProps[] => {
	const baseLinks: LinkProps[] = [
		...(isSuperAdmin
			? [
					{
						title: "Super Admin",
						url: "#",
						items: SUPER_ADMIN_ROUTES,
					} as LinkProps,
				]
			: []),
		{
			title: "Overview",
			url: "#",
			items: filterRoutes(DASHBOARD_OVERVIEW_ROUTES),
		},
		{
			title: "Operations",
			url: "#",
			items: filterRoutes(DASHBOARD_OPERATIONS_ROUTES),
		},
		{
			title: "Inventory",
			url: "#",
			items: filterRoutes(DASHBOARD_INVENTORY_ROUTES),
		},
		{
			title: "System",
			url: "#",
			items: filterRoutes(DASHBOARD_SYSTEM_ROUTES),
		},
	];
	return baseLinks;
};

export function DashboardSidebar() {
	const { pathname } = useLocation();
	const { session } = useSession();
	const isSuperAdmin = session?.user?.role === "super_admin";

	const filterRoutesByRole = (routes: RouteConfig[]) =>
		routes.filter((route) => !route.superAdminOnly || isSuperAdmin);

	const isActive = (path: string) => {
		// Exact match for the main dashboard page
		if (path === "/dashboard" && pathname === "/dashboard") {
			return true;
		}

		// For other routes, check if the current pathname starts with the route path
		// This handles nested routes like /dashboard/cars/add-car matching /dashboard/cars
		return pathname === path || pathname.startsWith(`${path}/`);
	};

	const links = getLinks(filterRoutesByRole, isSuperAdmin);

	return (
		<Sidebar
			collapsible="none"
			className="border-sidebar-border border-r bg-sidebar text-sidebar-foreground shadow-[2px_0_20px_-6px_rgba(60,40,20,0.08)] print:hidden"
		>
			<SidebarHeader className="border-sidebar-border border-b px-3 py-4">
				<DashboardCompanyLogo />
			</SidebarHeader>
			<SidebarContent className="gap-0 px-2 py-3">
				{links.map((item) => {
					const isSuperBlock = item.title === "Super Admin";
					return (
						<SidebarGroup
							key={item.title}
							className={cn(
								isSuperBlock &&
									"mb-3 rounded-xl border border-amber-300/80 bg-gradient-to-b from-amber-100/90 to-amber-50/40 p-1.5 shadow-sm",
							)}
						>
							<SidebarGroupLabel
								className={cn(
									"px-2 font-semibold text-[0.65rem] uppercase tracking-[0.12em]",
									isSuperBlock
										? "text-amber-900/75"
										: "text-sidebar-foreground/50",
								)}
							>
								{item.title}
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{item.items?.map((route) => {
										const active = isActive(route.path);

										return (
											<SidebarMenuItem key={route.label}>
												<SidebarMenuButton asChild isActive={active}>
													<Link to={route.path}>
														{route.icon && (
															<route.icon
																className={cn(
																	"mr-2 h-5 w-5 shrink-0 text-sidebar-foreground/50",
																	active && "text-[oklch(0.52_0.09_75)]",
																)}
															/>
														)}
														<span
															className={cn(
																"truncate",
																active && "font-semibold",
															)}
														>
															{route.label}
														</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					);
				})}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
