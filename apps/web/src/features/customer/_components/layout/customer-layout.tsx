import { Outlet } from "@tanstack/react-router";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import {
	CustomerHeader,
	CustomerBottomNavigation,
	useCustomerNavigation
} from "../navigation";

export function CustomerLayout() {
	const { session, signOutWithConfirmation } = useUserQuery();
	const navigationItems = useCustomerNavigation();
	const scrollContainerRef = useScrollToTop();

	return (
		<div className="flex flex-col h-screen bg-background overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0">
				<CustomerHeader
					session={session}
					navigationItems={navigationItems}
					onSignOut={signOutWithConfirmation.openSignOutDialog}
				/>
			</div>

			{/* Main Content */}
			<main ref={scrollContainerRef} className="flex-1 overflow-y-auto">
				<div className="container mx-auto px-4 py-4 md:py-6">
					<Outlet />
				</div>
			</main>

			{/* Bottom Navigation for Mobile (Primary Items) */}
			<div className="flex-shrink-0">
				<CustomerBottomNavigation navigationItems={navigationItems} />
			</div>

			{/* Sign Out Confirmation Dialog */}
			<SignOutConfirmationDialog
				isOpen={signOutWithConfirmation.isDialogOpen}
				onClose={signOutWithConfirmation.closeSignOutDialog}
				onConfirm={signOutWithConfirmation.confirmSignOut}
				userRole={session?.user.role as "user" | "driver" | "admin" | "super_admin" | undefined}
				userName={session?.user.name}
				isLoading={signOutWithConfirmation.isSigningOut}
			/>
		</div>
	);
}