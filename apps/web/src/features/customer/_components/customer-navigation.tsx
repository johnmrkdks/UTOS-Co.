import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerNavigationItem } from "./navigation/types";

interface CustomerNavigationProps {
	navigationItems: CustomerNavigationItem[];
	onNavigate?: () => void;
}

export function CustomerNavigation({
	navigationItems,
	onNavigate,
}: CustomerNavigationProps) {
	return (
		<nav className="space-y-1">
			{navigationItems.map((item, index) => {
				const Icon = item.icon;
				return (
					<Link
						key={item.name}
						to={item.href}
						onClick={onNavigate}
						className={cn(
							"group flex touch-manipulation items-center gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-muted/50 active:scale-[0.98]",
							item.active
								? "border border-primary/20 bg-primary/10 text-primary shadow-sm"
								: "text-foreground hover:text-primary",
						)}
					>
						{/* Icon Container */}
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
								item.active
									? "bg-primary text-white shadow-md"
									: "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
							)}
						>
							<Icon className="h-5 w-5" />
						</div>

						{/* Content */}
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">{item.name}</span>
								{item.active && (
									<div className="h-2 w-2 rounded-full bg-primary" />
								)}
							</div>
							{/* Optional description for key items */}
							{index === 0 && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									View your overview and quick actions
								</p>
							)}
							{item.name === "Browse Services" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Explore luxury travel packages
								</p>
							)}
							{item.name === "Instant Quote" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Get custom pricing instantly
								</p>
							)}
							{item.name === "My Bookings" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									View and manage your reservations
								</p>
							)}
							{item.name === "Profile" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Update your personal information
								</p>
							)}
						</div>
					</Link>
				);
			})}
		</nav>
	);
}
