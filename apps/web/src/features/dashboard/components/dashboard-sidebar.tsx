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
} from "@/components/ui/sidebar";
import type { RouteConfig } from "@/types/route-config";
import { Link } from "@tanstack/react-router";
import { DASHBOARD_ROUTES, DASHBOARD_SUB_ROUTES } from "../dashboard-routes";
import { DashboardCompanyLogo } from "./dashboard-company";

type LinkProps = {
	title: string;
	url: string;
	items?: RouteConfig[];
};

const links: LinkProps[] = [
	{
		title: "",
		url: "#",
		items: DASHBOARD_ROUTES,
	},
	{
		title: "Name Something",
		url: "#",
		items: DASHBOARD_SUB_ROUTES,
	},
];

export function DashboardSidebar() {
	return (
		<Sidebar className="bg-soft-beige">
			<SidebarHeader>
				<DashboardCompanyLogo />
			</SidebarHeader>
			<SidebarContent>
				{/* We create a SidebarGroup for each parent. */}
				{links.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{item.items?.map((item) => (
									<SidebarMenuItem key={item.label}>
										<SidebarMenuButton asChild isActive={item.isActive}>
											<Link to={item.path}>
												{item.icon && <item.icon className="mr-2 h-5 w-5" />}{" "}
												{item.label}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
