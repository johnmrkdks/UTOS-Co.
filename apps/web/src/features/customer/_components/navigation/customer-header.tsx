import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import type { CustomerNavigationItem } from "./types";
import { BUSINESS_INFO } from "@/constants/business-info";
import { CustomerUserMenu } from "./customer-user-menu";
import { BrandLogo } from "@/components/brand-logo";
import { CustomerMobileMenuContent } from "./customer-mobile-menu-content";

interface CustomerHeaderProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	onSignOut: () => void;
}

export function CustomerHeader({
	session,
	navigationItems,
	onSignOut
}: CustomerHeaderProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-beige/95 backdrop-blur supports-[backdrop-filter]:bg-beige/60">
			<div className="container mx-auto px-4 py-3 md:py-4">
				{/* Desktop Header */}
				<div className="hidden md:flex items-center justify-between">
					<BrandLogo />

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
							<CustomerUserMenu onSignOut={onSignOut} />
						</div>
					</div>
				</div>

				{/* Mobile Header */}
				<div className="md:hidden">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{/* Mobile Menu Button with Sheet - Moved to Left */}
							<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10"
									>
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="p-0 w-full sm:w-80 flex flex-col">
									<CustomerMobileMenuContent
										session={session}
										navigationItems={navigationItems}
										onClose={() => setIsSheetOpen(false)}
										onSignOut={onSignOut}
									/>
								</SheetContent>
							</Sheet>
							
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

					</div>
				</div>
			</div>
		</header>
	);
}
