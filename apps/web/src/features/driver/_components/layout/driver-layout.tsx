import { Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { useCurrentDriverQuery } from "@/hooks/query/use-current-driver-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useLocation } from "@tanstack/react-router";
import { Loader } from "@/components/loader";
import {
	DriverTopNavigation,
	DriverMobileMenuContent,
	DriverBottomNavigation,
	DriverSidebar,
	useDriverNavigation
} from "../navigation";

export function DriverLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { session, isPending, signOutWithConfirmation } = useUserQuery();
	const { data: currentDriver } = useCurrentDriverQuery();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigationItems = useDriverNavigation();

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
		navigate({ to: '/' });
		return null;
	}

	// Redirect if not driver
	if (user && user.role !== 'driver') {
		navigate({ to: '/dashboard' });
		return null;
	}

	// Driver status based on actual driver data with fallbacks
	const driver = {
		licenseNumber: null,
		phoneNumber: null,
		isApproved: false,
		isActive: false,
		...currentDriver
	};

	const driverStatus = {
		profileComplete: Boolean(driver.licenseNumber && driver.phoneNumber),
		isApproved: Boolean(driver.isApproved),
		isActive: Boolean(driver.isActive),
	};

	const needsOnboarding = !driverStatus.profileComplete;

	const mobileMenuContent = (
		<DriverMobileMenuContent
			session={session}
			driverStatus={driverStatus}
			needsOnboarding={needsOnboarding}
			onClose={() => setIsMobileMenuOpen(false)}
			onSignOut={signOutWithConfirmation.openSignOutDialog}
		/>
	);

	return (
		<div className="relative min-h-screen bg-gray-50">
			{/* Top Navigation Bar */}
			<DriverTopNavigation
				session={session}
				needsOnboarding={needsOnboarding}
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
				onSignOut={signOutWithConfirmation.openSignOutDialog}
				mobileMenuContent={mobileMenuContent}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
				<div className="lg:flex lg:gap-8">
					{/* Desktop Sidebar Navigation - Hidden on mobile */}
					<DriverSidebar
						driverStatus={driverStatus}
						needsOnboarding={needsOnboarding}
					/>

					{/* Main Content */}
					<div className="flex-1 lg:mt-0">
						<Outlet />
					</div>
				</div>
			</div>

			{/* Bottom Navigation for Mobile (Primary Items) */}
			<DriverBottomNavigation navigationItems={navigationItems} />

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