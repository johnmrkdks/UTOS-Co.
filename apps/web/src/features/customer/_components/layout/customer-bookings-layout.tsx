import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { Loader } from "@/components/loader";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { getDashboardPath } from "@/utils/auth";
import {
	CustomerBottomNavigation,
	CustomerHeader,
	CustomerMobileMenuContent,
	CustomerUserMenu,
} from "../navigation";
import { useCustomerBookingsNavigation } from "../navigation/use-customer-bookings-navigation";

export function CustomerBookingsLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { session, isPending, isFetching, signOutWithConfirmation } =
		useUserQuery();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigationItems = useCustomerBookingsNavigation();

	// Scroll to top when route changes (for browser viewport)
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [location.pathname]);

	const user = session?.user;

	// Show loading while session is being fetched or refetching (prevents redirect loop)
	if (isPending || isFetching) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	// Redirect if not authenticated (only after fetch is complete)
	if (!user) {
		navigate({ to: "/sign-in" });
		return null;
	}

	// Redirect if not customer
	if (user && user.role !== "user") {
		navigate({ to: getDashboardPath(user.role) });
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

			<div className="mx-auto max-w-7xl px-4 py-4 pb-20 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
				{/* Main Content */}
				<div className="flex-1 lg:mt-0">
					<Outlet />
				</div>
			</div>

			{/* Bottom Navigation for Mobile */}
			<div className="fixed right-0 bottom-0 left-0 z-40">
				<CustomerBottomNavigation navigationItems={navigationItems} />
			</div>

			<SignOutConfirmationDialog
				isOpen={signOutWithConfirmation.isDialogOpen}
				onClose={signOutWithConfirmation.closeSignOutDialog}
				onConfirm={signOutWithConfirmation.confirmSignOut}
				userRole={
					session?.user.role as
						| "user"
						| "driver"
						| "admin"
						| "super_admin"
						| undefined
				}
				userName={session?.user.name}
				isLoading={signOutWithConfirmation.isSigningOut}
			/>
		</div>
	);
}
