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
		if (
			(path === "/dashboard" && pathname === "/dashboard") ||
			(path === "/admin/dashboard/board" &&
				pathname === "/admin/dashboard/board")
		) {
			return true;
		}

		return pathname === path || pathname.startsWith(`${path}/`);
	};

	const links = getLinks(filterRoutesByRole, isSuperAdmin);

	return (
		<Sidebar
			collapsible="none"
			className="border-border/60 border-r bg-sidebar text-sidebar-foreground print:hidden"
		>
			<SidebarHeader className="border-border/50 border-b px-3 py-3">
				<DashboardCompanyLogo />
			</SidebarHeader>
			<SidebarContent className="gap-1 px-2 py-3">
				{links.map((item) => {
					const isSuperBlock = item.title === "Super Admin";
					return (
						<SidebarGroup
							key={item.title}
							className={cn(
								isSuperBlock &&
									"mb-2 rounded-lg border border-border/60 bg-muted/30 p-1",
							)}
						>
							<SidebarGroupLabel
								className={cn(
									"px-2 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]",
									isSuperBlock && "text-foreground/70",
								)}
							>
								{item.title}
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu className="gap-0.5">
									{item.items?.map((route) => {
										const active = isActive(route.path);

										return (
											<SidebarMenuItem key={route.label}>
												<SidebarMenuButton
													asChild
													isActive={active}
													size="sm"
													className="h-8 text-muted-foreground data-[active=true]:bg-foreground/[0.06] data-[active=true]:font-medium data-[active=true]:text-foreground"
												>
													<Link to={route.path}>
														{route.icon && (
															<route.icon
																className={cn(
																	"mr-2 h-4 w-4 shrink-0 opacity-70",
																	active && "opacity-100",
																)}
															/>
														)}
														<span className="truncate text-[13px]">
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
