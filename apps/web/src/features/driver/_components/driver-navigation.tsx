import { useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useUserQuery } from "@/hooks/query/use-user-query";
import {
	LayoutDashboardIcon,
	UserIcon,
	SettingsIcon,
	ClipboardListIcon,
	MailIcon,
} from "lucide-react";

interface NavigationItem {
	id: string;
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	requiresEmailVerification?: boolean;
}

export function DriverNavigation() {
	const navigate = useNavigate();
	const location = useLocation();
	const { session } = useUserQuery();

	const isEmailVerified = session?.user.emailVerified || false;

	const navigationItems: NavigationItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: LayoutDashboardIcon,
			href: '/driver'
		},
		{
			id: 'onboarding',
			label: 'Complete Profile',
			icon: ClipboardListIcon,
			href: '/driver/onboarding',
			requiresEmailVerification: true
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

	const canAccess = (item: NavigationItem) => {
		if (item.requiresEmailVerification && !isEmailVerified) {
			return false;
		}
		return true;
	};

	return (
		<div className="space-y-1">
			{navigationItems.map((item) => {
				const Icon = item.icon;
				const accessible = canAccess(item);
				const active = isActive(item.href);

				return (
					<div key={item.id} className="relative">
						<Button
							variant={active ? "default" : "ghost"}
							className={`w-full justify-start ${!accessible ? 'opacity-50 cursor-not-allowed' : ''
								}`}
							onClick={() => {
								if (accessible) {
									navigate({ to: item.href });
								} else {
									navigate({ to: '/driver/verify-email' });
								}
							}}
							disabled={!accessible}
						>
							<Icon className="h-4 w-4 mr-2" />
							{item.label}
						</Button>

						{item.requiresEmailVerification && !isEmailVerified && (
							<div className="absolute right-2 top-1/2 transform -translate-y-1/2">
								<Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
									<MailIcon className="h-2 w-2 mr-1" />
									Verify
								</Badge>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
