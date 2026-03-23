import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { DriverNavigationItem } from "./types";

interface DriverBottomNavigationProps {
	navigationItems: DriverNavigationItem[];
}

export function DriverBottomNavigation({
	navigationItems,
}: DriverBottomNavigationProps) {
	return (
		<div className="safe-area-pb fixed right-0 bottom-0 left-0 z-40 border-gray-200 border-t bg-white lg:hidden">
			<nav className="px-3 py-2">
				<div className="flex items-center justify-around">
					{navigationItems
						.filter((item) => item.primary)
						.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"flex min-w-0 max-w-20 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl p-3 transition-all",
										item.active
											? "bg-primary/10 text-primary"
											: "text-gray-500 hover:text-gray-700 active:bg-gray-100",
									)}
								>
									<Icon className="mb-1 h-6 w-6" />
									<span className="truncate font-medium text-xs leading-tight">
										{item.name === "My Trips" ? "Trips" : item.name}
									</span>
								</Link>
							);
						})}
				</div>
			</nav>
		</div>
	);
}
