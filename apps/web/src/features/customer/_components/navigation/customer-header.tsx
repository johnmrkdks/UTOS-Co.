import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { LogOut, BellIcon, Menu, X } from "lucide-react";
import type { CustomerNavigationItem } from "./types";
import { BUSINESS_INFO } from "@/constants/business-info";
import { CustomerNotificationMenu } from "./customer-notification-menu";

interface CustomerHeaderProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;
	onSignOut: () => void;
}

export function CustomerHeader({
	session,
	navigationItems,
	isMobileMenuOpen,
	setIsMobileMenuOpen,
	onSignOut
}: CustomerHeaderProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-beige/95 backdrop-blur supports-[backdrop-filter]:bg-beige/60">
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
								Sydney's Premier Luxury Service
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
								onClick={onSignOut}
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
						<div className="flex items-center gap-2">
							<Logo className="h-8 w-8" />
							<div>
								<h1 className="text-base font-bold text-foreground">
									{BUSINESS_INFO.business.name}
								</h1>
								<p className="text-[10px] text-muted-foreground">
									{BUSINESS_INFO.business.slogan}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{/* Notifications */}
							<CustomerNotificationMenu />

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
					</div>
				</div>
			</div>
		</header>
	);
}
