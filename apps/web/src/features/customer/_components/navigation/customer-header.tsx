import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Logo } from "@/components/logo";
import { BUSINESS_INFO } from "@/constants/business-info";
import { CustomerMobileMenuContent } from "./customer-mobile-menu-content";
import { CustomerUserMenu } from "./customer-user-menu";
import type { CustomerNavigationItem } from "./types";

interface CustomerHeaderProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	onSignOut: () => void;
}

export function CustomerHeader({
	session,
	navigationItems,
	onSignOut,
}: CustomerHeaderProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-beige/95 backdrop-blur supports-[backdrop-filter]:bg-beige/60">
			<div className="container mx-auto px-4 py-3 md:py-4">
				{/* Desktop Header */}
				<div className="hidden items-center justify-between md:flex">
					<BrandLogo />

					<div className="flex items-center space-x-6">
						{/* Desktop Navigation */}
						<nav className="flex space-x-6">
							{navigationItems.map((item) => (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"font-medium text-sm transition-colors hover:text-foreground",
										item.active
											? "border-primary border-b-2 pb-1 text-foreground"
											: "text-muted-foreground",
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
									<Button variant="ghost" size="icon" className="h-10 w-10">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent
									side="left"
									className="flex w-full flex-col p-0 sm:w-80"
								>
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
								<h1 className="font-bold text-base text-foreground">
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
