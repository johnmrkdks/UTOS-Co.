import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import type { CustomerNavigationItem } from "./navigation/types";

interface CustomerNavigationProps {
	navigationItems: CustomerNavigationItem[];
	onNavigate?: () => void;
}

export function CustomerNavigation({ navigationItems, onNavigate }: CustomerNavigationProps) {
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
							{item.name === "My Bookings" && (
								<p className="text-xs text-muted-foreground mt-0.5">View and manage your reservations</p>
							)}
							{item.name === "Profile" && (
								<p className="text-xs text-muted-foreground mt-0.5">Update your personal information</p>
							)}
						</div>
					</Link>
				);
			})}
		</nav>
	);
}