import {
	createFileRoute,
	Link,
	Outlet,
	useMatchRoute,
} from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { Globe, Link as LinkIcon, Settings, Shield } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/_layout/settings")({
	component: SettingsLayout,
});

const settingsSections = [
	{
		title: "System",
		href: "/admin/dashboard/settings",
		icon: Globe,
		description: "Manage system-wide configuration",
	},
	{
		title: "Security",
		href: "/admin/dashboard/settings/security",
		icon: Shield,
		description: "Password and authentication",
	},
	{
		title: "Account",
		href: "/admin/dashboard/settings/account",
		icon: LinkIcon,
		description: "Account linking and profile",
	},
];

function SettingsLayout() {
	const matchRoute = useMatchRoute();

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>

			<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
				{/* Sidebar Navigation */}
				<aside className="lg:w-1/5">
					<nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
						{settingsSections.map((section) => {
							const isActive = matchRoute({ to: section.href, fuzzy: false });
							const Icon = section.icon;

							return (
								<Link
									key={section.href}
									to={section.href}
									className={cn(
										"inline-flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
										isActive
											? "bg-accent text-accent-foreground"
											: "text-muted-foreground",
									)}
								>
									<Icon className="h-4 w-4" />
									{section.title}
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Main Content Area */}
				<div className="flex-1 lg:max-w-3xl">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
