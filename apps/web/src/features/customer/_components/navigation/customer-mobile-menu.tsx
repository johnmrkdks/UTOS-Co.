import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { User, LogOut } from "lucide-react";
import type { CustomerNavigationItem } from "./types";

interface CustomerMobileMenuProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	isOpen: boolean;
	onClose: () => void;
	onSignOut: () => void;
}

export function CustomerMobileMenu({
	session,
	navigationItems,
	isOpen,
	onClose,
	onSignOut
}: CustomerMobileMenuProps) {
	if (!isOpen) return null;

	return (
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
								onClick={onClose}
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
							onClose();
							onSignOut();
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
	);
}