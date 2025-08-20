import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import {
	CustomerHeader,
	CustomerMobileMenu,
	CustomerBottomNavigation,
	useCustomerNavigation
} from "../navigation";

export function CustomerLayout() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
					isMobileMenuOpen={isMobileMenuOpen}
					setIsMobileMenuOpen={setIsMobileMenuOpen}
					onSignOut={signOutWithConfirmation.openSignOutDialog}
				/>
			</div>

			{/* Mobile Navigation Menu */}
			{isMobileMenuOpen && (
				<div className="absolute inset-0 z-50 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}>
					<CustomerMobileMenu
						session={session}
						navigationItems={navigationItems}
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}
						onSignOut={signOutWithConfirmation.openSignOutDialog}
					/>
				</div>
			)}

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