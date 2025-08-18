import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { requireCustomer } from "@/utils/auth";
import { Logo } from "@/components/logo";
import { Button } from "@workspace/ui/components/button";
import { 
	Home, 
	Calendar, 
	Package, 
	User, 
	Settings, 
	Menu,
	X,
	Calculator,
	Car,
	LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";

export const Route = createFileRoute("/customer/_layout")({
	beforeLoad: async () => {
		const session = await requireCustomer();
		return { user: session.user };
	},
	component: CustomerLayout,
});

function CustomerLayout() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { session, signOutWithConfirmation } = useUserQuery();

	const navigationItems = [
		{ 
			name: "Dashboard", 
			href: "/customer", 
			icon: Home,
			active: location.pathname === "/customer",
			primary: true
		},
		{ 
			name: "My Bookings", 
			href: "/customer/bookings", 
			icon: Calendar,
			active: location.pathname === "/customer/bookings",
			primary: true
		},
		{ 
			name: "Browse Services", 
			href: "/customer/services", 
			icon: Package,
			active: location.pathname === "/customer/services",
			primary: true
		},
		{ 
			name: "Instant Quote", 
			href: "/customer/instant-quote", 
			icon: Calculator,
			active: location.pathname === "/customer/instant-quote",
			primary: true
		},
		{ 
			name: "Profile", 
			href: "/customer/profile", 
			icon: User,
			active: location.pathname === "/customer/profile",
			primary: false
		},
		{ 
			name: "Settings", 
			href: "/customer/account/settings", 
			icon: Settings,
			active: location.pathname === "/customer/account/settings",
			primary: false
		},
	];

	return (
		<div className="relative min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-3 md:py-4">
					{/* Desktop Header */}
					<div className="hidden md:flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Logo />
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									Down Under Chauffeur
								</h1>
								<p className="text-sm text-muted-foreground">
									Your luxury travel dashboard
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-6">
							{/* Desktop Navigation */}
							<nav className="flex space-x-6">
								{navigationItems.map((item) => (
									<Link
										key={item.name}
										to={item.href}
										className={cn(
											"text-sm font-medium transition-colors hover:text-foreground",
											item.active 
												? "text-foreground border-b-2 border-primary pb-1" 
												: "text-muted-foreground"
										)}
									>
										{item.name}
									</Link>
								))}
							</nav>

							{/* User Menu */}
							<div className="flex items-center space-x-3">
								<div className="text-right">
									<p className="text-sm font-medium text-foreground">{session?.user.name}</p>
									<p className="text-xs text-muted-foreground">{session?.user.email}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={signOutWithConfirmation.openSignOutDialog}
									className="text-muted-foreground hover:text-foreground"
								>
									<LogOut className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Mobile Header */}
					<div className="md:hidden">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Logo className="h-8 w-8" />
								<div>
									<h1 className="text-lg font-bold text-foreground">
										Down Under Chauffeur
									</h1>
									<p className="text-xs text-muted-foreground">
										Customer Dashboard
									</p>
								</div>
							</div>

							{/* Mobile Menu Button */}
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="h-10 w-10"
							>
								{isMobileMenuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</Button>
						</div>

						{/* Mobile Navigation Menu */}
						{isMobileMenuOpen && (
							<div className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg z-50 max-h-[80vh] overflow-y-auto">
								<div className="container mx-auto px-4 py-4">
									{/* User Info Section */}
									<div className="flex items-center space-x-3 mb-6 p-4 bg-muted/30 rounded-lg">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
											<User className="h-6 w-6 text-primary" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-semibold text-foreground">{session?.user.name}</p>
											<p className="text-xs text-muted-foreground">{session?.user.email}</p>
											<div className="flex items-center mt-1">
												<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
												<span className="text-xs text-green-600 font-medium">Online</span>
											</div>
										</div>
									</div>

									{/* Navigation List */}
									<nav className="space-y-1">
										{navigationItems.map((item, index) => {
											const Icon = item.icon;
											return (
												<Link
													key={item.name}
													to={item.href}
													onClick={() => setIsMobileMenuOpen(false)}
													className={cn(
														"flex items-center gap-4 p-3 rounded-lg transition-all duration-200 touch-manipulation group hover:bg-muted/50 active:scale-[0.98]",
														item.active 
															? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
															: "text-foreground hover:text-primary"
													)}
												>
													{/* Icon Container */}
													<div className={cn(
														"w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
														item.active 
															? "bg-primary text-white shadow-md" 
															: "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
													)}>
														<Icon className="h-5 w-5" />
													</div>
													
													{/* Content */}
													<div className="flex-1">
														<div className="flex items-center justify-between">
															<span className="font-medium text-sm">{item.name}</span>
															{item.active && (
																<div className="w-2 h-2 bg-primary rounded-full"></div>
															)}
														</div>
														{/* Optional description for key items */}
														{index === 0 && (
															<p className="text-xs text-muted-foreground mt-0.5">View your overview and quick actions</p>
														)}
														{item.name === "Browse Services" && (
															<p className="text-xs text-muted-foreground mt-0.5">Explore luxury travel packages</p>
														)}
														{item.name === "Instant Quote" && (
															<p className="text-xs text-muted-foreground mt-0.5">Get custom pricing instantly</p>
														)}
													</div>
												</Link>
											);
										})}
										
										{/* Divider */}
										<div className="my-4 border-t border-border"></div>
										
										{/* Sign Out Button */}
										<Button
											variant="ghost"
											className="w-full justify-start gap-4 p-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 touch-manipulation active:scale-[0.98]"
											onClick={() => {
												setIsMobileMenuOpen(false);
												signOutWithConfirmation.openSignOutDialog();
											}}
										>
											<div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
												<LogOut className="h-5 w-5" />
											</div>
											<span className="font-medium text-sm">Sign Out</span>
										</Button>
									</nav>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Bottom Navigation for Mobile (Primary Items) */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
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
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									<Icon className="h-5 w-5 mb-1" />
									<span className="text-xs font-medium truncate">
										{item.name === "My Bookings" ? "Bookings" : 
										 item.name === "Browse Services" ? "Services" :
										 item.name === "Instant Quote" ? "Quote" :
										 item.name}
									</span>
								</Link>
							);
						})}
					</div>
				</nav>
			</div>

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
