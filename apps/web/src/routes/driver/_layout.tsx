import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { DriverNavigation } from '@/features/driver/_components/driver-navigation';
import {
	CarIcon,
	LogOutIcon,
	MailIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	ShieldCheckIcon,
	UserIcon,
	ClipboardListIcon
} from "lucide-react";
import { Logo } from '@/components/logo';
import { SignOutConfirmationDialog } from '@/components/dialogs/sign-out-confirmation-dialog';

export const Route = createFileRoute('/driver/_layout')({
	component: DriverLayoutComponent,
});

function DriverLayoutComponent() {
	const navigate = useNavigate();
	const { session, signOutWithConfirmation } = useUserQuery();

	const user = session?.user;

	// Redirect if not driver
	if (user && user.role !== 'driver') {
		navigate({ to: '/dashboard' });
		return null;
	}

	if (!user) {
		navigate({ to: '/' });
		return null;
	}

	// Configure sign out to redirect to home page
	const signOutWithRedirect = {
		...signOutWithConfirmation,
		confirmSignOut: () => signOutWithConfirmation.confirmSignOut(),
	};


	// Determine onboarding status
	const isEmailVerified = user.emailVerified;
	const needsOnboarding = false; // TODO: Implement driverProfile check when available

	return (
		<div className="relative min-h-screen bg-gray-50">
			{/* Top Navigation Bar */}
			<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo and Title */}
						<div className="flex items-center">
							<Logo />
							<div className="ml-3">
								<h1 className="text-xl font-semibold text-gray-900">Down Under Chauffeur</h1>
								<p className="text-sm text-gray-500">Driver Portal</p>
							</div>
						</div>

						{/* User Info and Actions */}
						<div className="flex items-center space-x-4">
							{/* Status Indicators */}
							<div className="hidden md:flex items-center space-x-3">
								{isEmailVerified ? (
									<Badge variant="default" className="bg-green-100 text-green-800">
										<CheckCircleIcon className="h-3 w-3 mr-1" />
										Verified
									</Badge>
								) : (
									<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
										<AlertCircleIcon className="h-3 w-3 mr-1" />
										Email Unverified
									</Badge>
								)}

								{needsOnboarding && (
									<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
										<ClipboardListIcon className="h-3 w-3 mr-1" />
										Complete Profile
									</Badge>
								)}
							</div>

							{/* User Menu */}
							<div className="flex items-center space-x-3">
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
									<p className="text-xs text-gray-500">{session?.user.email}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={signOutWithConfirmation.openSignOutDialog}
									className="text-gray-500 hover:text-gray-700"
								>
									<LogOutIcon className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* Sidebar Navigation */}
					<div className="w-64 flex-shrink-0">
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">Navigation</CardTitle>
							</CardHeader>
							<CardContent>
								<DriverNavigation />
							</CardContent>
						</Card>

						{/* Account Status Card */}
						<Card className="mt-6">
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">Account Status</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<MailIcon className="h-4 w-4 text-gray-500" />
										<span className="text-sm">Email Status</span>
									</div>
									{isEmailVerified ? (
										<Badge variant="default" className="bg-green-100 text-green-700">
											Verified
										</Badge>
									) : (
										<Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
											Unverified
										</Badge>
									)}
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<UserIcon className="h-4 w-4 text-gray-500" />
										<span className="text-sm">Profile</span>
									</div>
									{needsOnboarding ? (
										<Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
											Incomplete
										</Badge>
									) : (
										<Badge variant="default" className="bg-green-100 text-green-700">
											Complete
										</Badge>
									)}
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<ShieldCheckIcon className="h-4 w-4 text-gray-500" />
										<span className="text-sm">Driver Status</span>
									</div>
									<Badge variant="secondary" className="bg-gray-100 text-gray-700">
										Pending
									</Badge>
								</div>

								{!isEmailVerified && (
									<div className="pt-2 border-t">
										<Button
											size="sm"
											className="w-full"
											onClick={() => navigate({ to: '/driver/verify-email' })}
										>
											Verify Email
										</Button>
									</div>
								)}

								{needsOnboarding && isEmailVerified && (
									<div className="pt-2 border-t">
										<Button
											size="sm"
											className="w-full"
											onClick={() => navigate({ to: '/driver/onboarding' })}
										>
											Complete Onboarding
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						<Outlet />
					</div>
				</div>
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
