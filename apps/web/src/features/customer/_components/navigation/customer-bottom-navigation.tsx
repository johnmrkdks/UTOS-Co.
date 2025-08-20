import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerNavigationItem } from "./types";

interface CustomerBottomNavigationProps {
	navigationItems: CustomerNavigationItem[];
}

export function CustomerBottomNavigation({ navigationItems }: CustomerBottomNavigationProps) {
	return (
		<div className="md:hidden bg-background border-t border-border shadow-lg z-40">
			<nav className="pb-safe">
				<div className="flex justify-around px-2 py-3">
					{navigationItems.filter(item => item.primary).map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.name}
								to={item.href}
								className={cn(
									"flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 touch-manipulation active:scale-95",
									item.active
										? "text-primary bg-primary/10"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
								)}
							>
								<Icon className="h-5 w-5 mb-1" />
								<span className="text-xs font-medium truncate">
									{item.name === "My Bookings" ? "Trips" :
										item.name === "Browse Services" ? "Services" :
											item.name === "Browse Cars" ? "Cars" :
												item.name === "Instant Quote" ? "Quote" :
													item.name}
								</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
