import { useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
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
						variant={active ? "default" : "ghost"}
						className="w-full justify-start"
						onClick={() => {
							navigate({ to: item.href });
							onNavigate?.();
						}}
					>
						<Icon className="h-4 w-4 mr-2" />
						{item.label}
					</Button>
				);
			})}
		</div>
	);
}
