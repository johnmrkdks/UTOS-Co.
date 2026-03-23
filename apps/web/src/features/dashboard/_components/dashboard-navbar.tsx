import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DashboardUserMenu } from "@/features/dashboard/_components/navbar/dashhboard-user-menu";
import { ModalProviders } from "@/features/dashboard/_providers/modal-providers";

type DashboardNavbarProps = React.ComponentProps<"header">;

export function DashboardNavbar({ className, ...props }: DashboardNavbarProps) {
	return (
		<header
			className={cn("border-b bg-soft-beige px-4 py-2", className)}
			{...props}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
				<div className="flex items-center gap-3">
					<SidebarTrigger className="lg:hidden" />
					<Breadcrumbs />
				</div>
				<div className="flex items-center gap-4">
					<ModalProviders />
					<DashboardUserMenu />
				</div>
			</div>
		</header>
	);
}
