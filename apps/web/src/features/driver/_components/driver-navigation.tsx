import { useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	CarIcon,
	ClipboardListIcon,
	ClockIcon,
	LayoutDashboardIcon,
	MapPinIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";

interface NavigationItem {
	id: string;
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
}

interface DriverNavigationProps {
	onNavigate?: () => void;
	driverStatus?: {
		profileComplete: boolean;
		isApproved: boolean;
		isActive: boolean;
	};
	needsOnboarding?: boolean;
}

export function DriverNavigation({
	onNavigate,
	driverStatus,
	needsOnboarding,
}: DriverNavigationProps = {}) {
	const navigate = useNavigate();
	const location = useLocation();

	// Base navigation items that are always shown - matching mobile navigation
	const baseNavigationItems: NavigationItem[] = [
		{
			id: "available",
			label: "Available Trips",
			icon: MapPinIcon,
			href: "/driver/available",
		},
		{
			id: "trips",
			label: "My Trips",
			icon: CarIcon,
			href: "/driver/trips",
		},
		{
			id: "history",
			label: "History",
			icon: ClockIcon,
			href: "/driver/history",
		},
		{
			id: "dashboard",
			label: "Dashboard",
			icon: LayoutDashboardIcon,
			href: "/driver/dashboard",
		},
	];

	// Conditional navigation items
	const conditionalItems: NavigationItem[] = [];

	// Only show "Complete Profile" if driver needs onboarding (not approved/active)
	if (needsOnboarding || !driverStatus?.isApproved) {
		conditionalItems.push({
			id: "onboarding",
			label: "Complete Profile",
			icon: ClipboardListIcon,
			href: "/driver/onboarding",
		});
	}

	// Standard navigation items that are always shown
	const standardItems: NavigationItem[] = [
		{
			id: "profile",
			label: "My Profile",
			icon: UserIcon,
			href: "/driver/profile",
		},
		{
			id: "settings",
			label: "Settings",
			icon: SettingsIcon,
			href: "/driver/settings",
		},
	];

	// Combine all navigation items
	const navigationItems: NavigationItem[] = [
		...baseNavigationItems,
		...conditionalItems,
		...standardItems,
	];

	const isActive = (href: string) => {
		return location.pathname === href;
	};

	return (
		<div className="space-y-1">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				const active = isActive(item.href);

				return (
					<Button
						key={item.id}
						variant="ghost"
						className={cn(
							"group h-auto w-full touch-manipulation justify-start gap-3 p-3 transition-all duration-200 hover:bg-muted/50 active:scale-[0.98]",
							active
								? "border border-primary/20 bg-primary/10 text-primary shadow-sm"
								: "text-foreground hover:text-primary",
						)}
						onClick={() => {
							navigate({ to: item.href });
							onNavigate?.();
						}}
					>
						{/* Icon Container */}
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
								active
									? "bg-primary text-white shadow-md"
									: "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
							)}
						>
							<Icon className="h-5 w-5" />
						</div>

						{/* Content */}
						<div className="flex-1 text-left">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">{item.label}</span>
								{active && <div className="h-2 w-2 rounded-full bg-primary" />}
							</div>
							{/* Optional descriptions */}
							{item.id === "available" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Accept new trips
								</p>
							)}
							{item.id === "trips" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Manage your rides
								</p>
							)}
							{item.id === "history" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Past trips & earnings
								</p>
							)}
							{item.id === "dashboard" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Overview and earnings
								</p>
							)}
							{item.id === "onboarding" && (
								<p className="mt-0.5 text-muted-foreground text-xs">
									Finish driver setup
								</p>
							)}
						</div>
					</Button>
				);
			})}
		</div>
	);
}
