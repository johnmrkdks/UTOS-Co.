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
	Car
} from "lucide-react";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

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
							<div className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg">
								<nav className="container mx-auto px-4 py-4">
									<div className="grid grid-cols-2 gap-2">
										{navigationItems.map((item) => {
											const Icon = item.icon;
											return (
												<Link
													key={item.name}
													to={item.href}
													onClick={() => setIsMobileMenuOpen(false)}
													className={cn(
														"flex flex-col items-center justify-center p-4 rounded-lg transition-colors hover:bg-muted",
														item.active 
															? "bg-primary/10 text-primary border border-primary/20" 
															: "text-muted-foreground"
													)}
												>
													<Icon className="h-5 w-5 mb-2" />
													<span className="text-xs font-medium text-center">
														{item.name}
													</span>
												</Link>
											);
										})}
									</div>
								</nav>
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
		</div>
	);
}
