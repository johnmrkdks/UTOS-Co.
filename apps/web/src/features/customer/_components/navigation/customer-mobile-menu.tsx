import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { LogOut, User, X } from "lucide-react";
import type { CustomerNavigationItem } from "./types";

interface CustomerMobileMenuProps {
	session: any;
	navigationItems: CustomerNavigationItem[];
	isOpen: boolean;
	onClose: () => void;
	onSignOut: () => void;
}

export function CustomerMobileMenu({
	session,
	navigationItems,
	isOpen,
	onClose,
	onSignOut,
}: CustomerMobileMenuProps) {
	if (!isOpen) return null;

	return (
		<div
			className="ml-0 h-full w-full max-w-sm overflow-hidden rounded-r-lg bg-background shadow-xl"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="h-full overflow-y-auto">
				{/* Close Button */}
				<div className="flex justify-end border-border border-b p-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="px-4 pb-6">
					{/* User Info Section */}
					<div className="mt-4 mb-6 flex items-center space-x-3 rounded-lg bg-muted/30 p-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<User className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-semibold text-foreground text-sm">
								{session?.user.name}
							</p>
							<p className="text-muted-foreground text-xs">
								{session?.user.email}
							</p>
							<div className="mt-1 flex items-center">
								<div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
								<span className="font-medium text-green-600 text-xs">
									Online
								</span>
							</div>
						</div>
					</div>

					{/* Navigation List */}
					<nav className="space-y-1">
						{navigationItems.map((item, index) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.name}
									to={item.href}
									onClick={onClose}
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
									</div>
								</Link>
							);
						})}

						{/* Divider */}
						<div className="my-4 border-border border-t" />

						{/* Sign Out Button */}
						<Button
							variant="ghost"
							className="h-auto w-full touch-manipulation justify-start gap-4 p-3 text-destructive transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
							onClick={() => {
								onClose();
								onSignOut();
							}}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
								<LogOut className="h-5 w-5" />
							</div>
							<span className="font-medium text-sm">Sign Out</span>
						</Button>
					</nav>
				</div>
			</div>
		</div>
	);
}
