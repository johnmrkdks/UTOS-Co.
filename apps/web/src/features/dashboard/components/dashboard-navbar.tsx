import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "./user-menu";
import { ModalProviders } from "../modal-providers";

export function DashboardNavbar() {
	return (
		<header className="bg-soft-beige px-4 py-2 border-b flex flex-row items-center justify-between">
			<div>
				<SidebarTrigger className="-ml-1" />
			</div>
			<div className="flex gap-2">
				<ModalProviders />
				<UserMenu />
			</div>
		</header>
	);
}
