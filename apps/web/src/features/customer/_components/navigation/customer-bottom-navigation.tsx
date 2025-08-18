import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerNavigationItem } from "./types";

interface CustomerBottomNavigationProps {
	navigationItems: CustomerNavigationItem[];
}

export function CustomerBottomNavigation({ navigationItems }: CustomerBottomNavigationProps) {
	return (
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
	);
}