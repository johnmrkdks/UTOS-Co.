import { Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useLocation } from "@tanstack/react-router";
import { Loader } from "@/components/loader";
import {
	CustomerHeader,
	CustomerBottomNavigation,
	CustomerMobileMenuContent,
	CustomerUserMenu,
} from "../navigation";
import { useCustomerBookingsNavigation } from "../navigation/use-customer-bookings-navigation";

export function CustomerBookingsLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { session, isPending, signOutWithConfirmation } = useUserQuery();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigationItems = useCustomerBookingsNavigation();

	// Scroll to top when route changes (for browser viewport)
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [location.pathname]);

	const user = session?.user;

	// Show loading while session is being fetched
	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader />
			</div>
		);
	}

	// Redirect if not authenticated (only after loading is complete)
	if (!user) {
		navigate({ to: '/sign-in' });
		return null;
	}

	// Redirect if not customer
	if (user && user.role !== 'user') {
		navigate({ to: '/dashboard' });
		return null;
	}

	return (
		<div className="relative min-h-screen bg-gray-50">
			{/* Header Navigation */}
			<CustomerHeader
				session={session}
				navigationItems={navigationItems}
				onSignOut={signOutWithConfirmation.openSignOutDialog}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
				{/* Main Content */}
				<div className="flex-1 lg:mt-0">
					<Outlet />
				</div>
			</div>

			{/* Bottom Navigation for Mobile */}
			<div className="fixed bottom-0 left-0 right-0 z-40">
				<CustomerBottomNavigation navigationItems={navigationItems} />
			</div>

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