import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "./navbar/user-menu";
import { NotificationMenu } from "./navbar/notification-menu";
import { ModalProviders } from "../modal-providers";
import { cn } from "@/lib/utils";

type DashboardNavbarProps = React.ComponentProps<"header">;

export function DashboardNavbar({ className, ...props }: DashboardNavbarProps) {
	return (
		<header
			className={cn(
				"bg-soft-beige px-4 py-2 border-b flex flex-row items-center justify-between",
				className,
			)}
			{...props}
		>
			<div>
				<SidebarTrigger className="-ml-1" />
			</div>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<ModalProviders />
					<NotificationMenu />
				</div>
				<UserMenu />
			</div>
		</header>
	);
}
