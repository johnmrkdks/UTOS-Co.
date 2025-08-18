import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
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

	return (
		<div className="relative min-h-screen bg-background">
			{/* Header */}
			<CustomerHeader
				session={session}
				navigationItems={navigationItems}
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
				onSignOut={signOutWithConfirmation.openSignOutDialog}
			/>

			{/* Mobile Navigation Menu */}
			<CustomerMobileMenu
				session={session}
				navigationItems={navigationItems}
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onSignOut={signOutWithConfirmation.openSignOutDialog}
			/>

			{/* Bottom Navigation for Mobile (Primary Items) */}
			<CustomerBottomNavigation navigationItems={navigationItems} />

			{/* Main Content */}
			<main className="container mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
				<Outlet />
			</main>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/20 z-40 md:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

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