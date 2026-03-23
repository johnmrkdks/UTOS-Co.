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
import type { RouteConfig } from "@/types/route-config";
import { Link, useLocation } from "@tanstack/react-router";
import {
	DASHBOARD_OVERVIEW_ROUTES,
	DASHBOARD_OPERATIONS_ROUTES,
	DASHBOARD_INVENTORY_ROUTES,
	DASHBOARD_SYSTEM_ROUTES,
	SUPER_ADMIN_ROUTES,
} from "@/constants/dashboard-routes";
import { DashboardCompanyLogo } from "./sidebar/dashboard-company";
import { cn } from "@workspace/ui/lib/utils";
import { useSession } from "@/providers/session-provider";

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
		<Sidebar collapsible="none" className="bg-soft-beige border-r print:hidden">
			<SidebarHeader>
				<DashboardCompanyLogo />
			</SidebarHeader>
			<SidebarContent>
				{links.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
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
																"mr-2 h-5 w-5",
																active && "text-primary",
															)}
														/>
													)}
													<span
														className={cn("truncate", active && "text-primary")}
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
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
