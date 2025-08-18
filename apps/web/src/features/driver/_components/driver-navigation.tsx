import { useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	LayoutDashboardIcon,
	UserIcon,
	SettingsIcon,
	ClipboardListIcon,
	CarIcon,
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
}

export function DriverNavigation({ onNavigate }: DriverNavigationProps = {}) {
	const navigate = useNavigate();
	const location = useLocation();

	const navigationItems: NavigationItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: LayoutDashboardIcon,
			href: '/driver'
		},
		{
			id: 'trips',
			label: 'My Trips',
			icon: CarIcon,
			href: '/driver/trips'
		},
		{
			id: 'onboarding',
			label: 'Complete Profile',
			icon: ClipboardListIcon,
			href: '/driver/onboarding'
		},
		{
			id: 'profile',
			label: 'My Profile',
			icon: UserIcon,
			href: '/driver/profile'
		},
		{
			id: 'settings',
			label: 'Settings',
			icon: SettingsIcon,
			href: '/driver/settings'
		},
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
							"w-full justify-start gap-3 p-3 h-auto transition-all duration-200 touch-manipulation group hover:bg-muted/50 active:scale-[0.98]",
							active 
								? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
								: "text-foreground hover:text-primary"
						)}
						onClick={() => {
							navigate({ to: item.href });
							onNavigate?.();
						}}
					>
						{/* Icon Container */}
						<div className={cn(
							"w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
							active 
								? "bg-primary text-white shadow-md" 
								: "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
						)}>
							<Icon className="h-5 w-5" />
						</div>
						
						{/* Content */}
						<div className="flex-1 text-left">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">{item.label}</span>
								{active && (
									<div className="w-2 h-2 bg-primary rounded-full"></div>
								)}
							</div>
							{/* Optional descriptions */}
							{item.id === 'dashboard' && (
								<p className="text-xs text-muted-foreground mt-0.5">Overview and earnings</p>
							)}
							{item.id === 'trips' && (
								<p className="text-xs text-muted-foreground mt-0.5">Manage your rides</p>
							)}
							{item.id === 'onboarding' && (
								<p className="text-xs text-muted-foreground mt-0.5">Finish driver setup</p>
							)}
						</div>
					</Button>
				);
			})}
		</div>
	);
}
