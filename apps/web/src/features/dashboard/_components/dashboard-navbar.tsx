import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { DashboardUserMenu } from "@/features/dashboard/_components/navbar/dashhboard-user-menu";
import { cn } from "@workspace/ui/lib/utils";
import { ModalProviders } from "@/features/dashboard/_providers/modal-providers";
import { Breadcrumbs } from "@/components/breadcrumbs";

type DashboardNavbarProps = React.ComponentProps<"header">;

export function DashboardNavbar({ className, ...props }: DashboardNavbarProps) {
	return (
		<header
			className={cn(
				"bg-soft-beige px-4 py-2 border-b",
				className,
			)}
			{...props}
		>
			<div className="max-w-7xl mx-auto w-full flex flex-row items-center justify-between">
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
