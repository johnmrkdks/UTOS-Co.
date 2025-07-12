import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "./user-menu";

export function DashboardNavbar() {
	return (
		<header className="bg-soft-beige p-2 border-b flex flex-row items-center justify-between">
			<div>
				<SidebarTrigger className="-ml-1" />
			</div>
			<div>
				<UserMenu />
			</div>
		</header>
	);
}
