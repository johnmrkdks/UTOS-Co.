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
	DASHBOARD_ROUTES,
	DASHBOARD_SUB_ROUTES,
	DASHBOARD_MANAGEMENT_SUB_ROUTES,
} from "@/features/dashboard/_constants/dashboard-routes";
import { DashboardCompanyLogo } from "./sidebar/dashboard-company";
import { cn } from "@workspace/ui/lib/utils";

type LinkProps = {
	title: string;
	url: string;
	items?: RouteConfig[];
};

const links: LinkProps[] = [
	{
		title: "Overview",
		url: "#",
		items: DASHBOARD_ROUTES,
	},
	{
		title: "Operations",
		url: "#",
		items: DASHBOARD_MANAGEMENT_SUB_ROUTES,
	},
	{
		title: "Tools & Settings",
		url: "#",
		items: DASHBOARD_SUB_ROUTES,
	},
];

export function DashboardSidebar() {
	const { pathname } = useLocation();

	const isActive = (path: string) => {
		return pathname === path;
	};

	return (
		<Sidebar className="bg-soft-beige">
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
