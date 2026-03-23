import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerNavigationItem } from "./types";

interface CustomerBottomNavigationProps {
	navigationItems: CustomerNavigationItem[];
}

export function CustomerBottomNavigation({
	navigationItems,
}: CustomerBottomNavigationProps) {
	return (
		<div className="z-40 border-border border-t bg-background shadow-lg md:hidden">
			<nav className="pb-safe">
				<div className="flex justify-around px-2 py-3">
					{navigationItems
						.filter((item) => item.primary)
						.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center rounded-lg p-2 transition-colors active:scale-95",
										item.active
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
									)}
								>
									<Icon className="mb-1 h-5 w-5" />
									<span className="truncate font-medium text-xs">
										{item.name === "My Bookings"
											? "Trips"
											: item.name === "Browse Services"
												? "Services"
												: item.name === "Browse Cars"
													? "Cars"
													: item.name === "Instant Quote"
														? "Quote"
														: item.name}
									</span>
								</Link>
							);
						})}
				</div>
			</nav>
		</div>
	);
}
