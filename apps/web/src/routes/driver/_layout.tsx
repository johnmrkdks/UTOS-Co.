import { createFileRoute, Outlet, useNavigate, Link, useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { useUserQuery } from '@/hooks/query/use-user-query';
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { DriverNavigation } from '@/features/driver/_components/driver-navigation';
import {
	CarIcon,
	LogOutIcon,
	MailIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	ShieldCheckIcon,
	UserIcon,
	ClipboardListIcon,
	MenuIcon,
	XIcon,
	LayoutDashboardIcon,
	SettingsIcon
} from "lucide-react";
import { Logo } from '@/components/logo';
import { SignOutConfirmationDialog } from '@/components/dialogs/sign-out-confirmation-dialog';
import { cn } from "@workspace/ui/lib/utils";

export const Route = createFileRoute('/driver/_layout')({
	component: DriverLayoutComponent,
});

function DriverLayoutComponent() {
	const navigate = useNavigate();
	const location = useLocation();
	const { session, signOutWithConfirmation } = useUserQuery();
	const { data: currentDriver } = useCurrentDriverQuery();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const user = session?.user;

	// Navigation items for bottom navigation (primary items only)
	const navigationItems = [
		{ 
			name: "Dashboard", 
			href: "/driver", 
			icon: LayoutDashboardIcon,
			active: location.pathname === "/driver",
			primary: true
		},
		{ 
			name: "My Trips", 
			href: "/driver/trips", 
			icon: CarIcon,
			active: location.pathname === "/driver/trips",
			primary: true
		},
		{ 
			name: "Profile", 
			href: "/driver/profile", 
			icon: UserIcon,
			active: location.pathname === "/driver/profile",
			primary: true
		},
		{ 
			name: "Settings", 
			href: "/driver/settings", 
			icon: SettingsIcon,
			active: location.pathname === "/driver/settings",
			primary: true
		},
	];

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


	// Driver status based on actual driver data
	const driverStatus = {
		profileComplete: Boolean(currentDriver?.licenseNumber && currentDriver?.phoneNumber),
		isApproved: Boolean(currentDriver?.isApproved),
		isActive: Boolean(currentDriver?.isActive),
	};
	
	const needsOnboarding = !driverStatus.profileComplete;

	return (
		<div className="relative min-h-screen bg-gray-50">
			{/* Top Navigation Bar */}
			<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo and Title */}
						<div className="flex items-center">
							<Logo className="lg:block" />
							<div className="ml-3 hidden sm:block">
								<h1 className="text-xl font-semibold text-gray-900">Down Under Chauffeur</h1>
								<p className="text-sm text-gray-500">Driver Portal</p>
							</div>
						</div>

						{/* Right side - Mobile Menu Button and User Info */}
						<div className="flex items-center space-x-2 sm:space-x-4">
							{/* Status Indicators - Hidden on mobile, shown on larger screens */}
							<div className="hidden lg:flex items-center space-x-3">
								{needsOnboarding && (
									<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
										<ClipboardListIcon className="h-3 w-3 mr-1" />
										Complete Profile
									</Badge>
								)}
							</div>

							{/* Desktop User Menu */}
							<div className="hidden lg:flex items-center space-x-3">
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

							{/* Mobile Menu Button - Now on the right */}
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="sm" className="lg:hidden">
										<MenuIcon className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="right" className="w-80 p-0 flex flex-col h-full">
									{/* Fixed Header */}
									<div className="p-4 border-b flex-shrink-0">
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												<Logo />
												<div className="ml-2">
													<h2 className="text-lg font-semibold">Driver Portal</h2>
												</div>
											</div>
											<Button 
												variant="ghost" 
												size="sm" 
												onClick={() => setIsMobileMenuOpen(false)}
											>
												<XIcon className="h-4 w-4" />
											</Button>
										</div>
									</div>

									{/* Scrollable Content */}
									<div className="flex-1 overflow-y-auto">
										{/* User Info Section */}
										<div className="p-4 border-b">
											<div className="flex items-center space-x-3">
												<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
													<UserIcon className="h-6 w-6 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
													<p className="text-xs text-gray-500">{session?.user.email}</p>
													<p className="text-xs text-blue-600 font-medium">Driver</p>
												</div>
											</div>
										</div>

										{/* Navigation */}
										<div className="p-4">
											<DriverNavigation onNavigate={() => setIsMobileMenuOpen(false)} />
										</div>

										{/* Account Status */}
										<div className="p-4 border-t">
											<Card>
												<CardHeader className="pb-4">
													<CardTitle className="text-lg">Account Status</CardTitle>
												</CardHeader>
												<CardContent className="space-y-4">
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
														{driverStatus.isApproved ? (
															<Badge variant="default" className="bg-green-100 text-green-700">
																Approved
															</Badge>
														) : (
															<Badge variant="secondary" className="bg-gray-100 text-gray-700">
																Pending
															</Badge>
														)}
													</div>

													{needsOnboarding && (
														<div className="pt-2 border-t">
															<Button
																size="sm"
																className="w-full"
																onClick={() => {
																	navigate({ to: '/driver/onboarding' });
																	setIsMobileMenuOpen(false);
																}}
															>
																Complete Onboarding
															</Button>
														</div>
													)}
												</CardContent>
											</Card>
										</div>
									</div>

									{/* Fixed Footer with Logout Button */}
									<div className="p-4 border-t flex-shrink-0 bg-white">
										<Button
											variant="outline"
											className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
											onClick={() => {
												setIsMobileMenuOpen(false);
												signOutWithConfirmation.openSignOutDialog();
											}}
										>
											<LogOutIcon className="h-4 w-4" />
											<span>Sign Out</span>
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
				<div className="lg:flex lg:gap-8">
					{/* Desktop Sidebar Navigation - Hidden on mobile */}
					<div className="hidden lg:block w-64 flex-shrink-0">
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
									{driverStatus.isApproved ? (
										<Badge variant="default" className="bg-green-100 text-green-700">
											Approved
										</Badge>
									) : (
										<Badge variant="secondary" className="bg-gray-100 text-gray-700">
											Pending
										</Badge>
									)}
								</div>

								{needsOnboarding && (
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
					<div className="flex-1 lg:mt-0">
						<Outlet />
					</div>
				</div>
			</div>

			{/* Bottom Navigation for Mobile (Primary Items) */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
				<nav className="container mx-auto px-2 py-2">
					<div className="flex justify-around">
						{navigationItems.filter(item => item.primary).map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
										item.active 
											? "text-primary" 
											: "text-gray-500 hover:text-gray-700"
									)}
								>
									<Icon className="h-5 w-5 mb-1" />
									<span className="text-xs font-medium truncate">
										{item.name === "My Trips" ? "Trips" : 
										 item.name}
									</span>
								</Link>
							);
						})}
					</div>
				</nav>
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
