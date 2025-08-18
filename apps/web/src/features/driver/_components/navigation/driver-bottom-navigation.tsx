import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { DriverNavigationItem } from "./types";

interface DriverBottomNavigationProps {
	navigationItems: DriverNavigationItem[];
}

export function DriverBottomNavigation({ navigationItems }: DriverBottomNavigationProps) {
	return (
		<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
			<nav className="px-3 py-2">
				<div className="flex justify-around items-center">
					{navigationItems.filter(item => item.primary).map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.name}
								to={item.href}
								className={cn(
									"flex flex-col items-center justify-center p-3 rounded-xl transition-all min-w-0 flex-1 max-w-20 touch-manipulation",
									item.active
										? "text-primary bg-primary/10"
										: "text-gray-500 hover:text-gray-700 active:bg-gray-100"
								)}
							>
								<Icon className="h-6 w-6 mb-1" />
								<span className="text-xs font-medium truncate leading-tight">
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