import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { DashboardUserMenu } from "@/features/dashboard/_components/navbar/dashhboard-user-menu";
import { NotificationMenu } from "@/features/dashboard/_components/navbar/notification-menu";
import { cn } from "@workspace/ui/lib/utils";
import { ModalProviders } from "@/features/dashboard/_providers/modal-providers";

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
				<DashboardUserMenu />
			</div>
		</header>
	);
}
