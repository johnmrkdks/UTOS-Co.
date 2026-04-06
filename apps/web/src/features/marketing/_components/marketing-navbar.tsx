import { Link, useLocation } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import {
	BookOpen,
	CalendarIcon,
	CarIcon,
	ChevronsLeft,
	ContactIcon,
	HomeIcon,
	InfoIcon,
	LogOutIcon,
	MailIcon,
	Menu,
	Package,
	Phone,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { BUSINESS_INFO } from "@/constants/business-info";
import { MARKETING_ROUTES } from "@/constants/marketing-routes";
import { MarketingUserMenu } from "@/features/marketing/_components/navbar/marketing-user-menu";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { AuthCTA } from "./navbar/auth-cta";

type HeaderProps = {
	className?: string;
};

export function MarketingNavbar({ className, ...props }: HeaderProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	return (
		<div className={cn("relative z-50", className)} {...props}>
			{/* Top Contact Bar */}
			{/* <div className="hidden md:block bg-foreground border-b border-border"> */}
			{/* 	<div className="container mx-auto px-6 py-2"> */}
			{/* 		<div className="flex items-center justify-center md:justify-between text-xs md:text-sm"> */}
			{/* 			<div className="flex items-center gap-6 text-beige"> */}
			{/* 				<div className="flex items-center gap-2"> */}
			{/* 					<Phone className="w-4 h-4 text-primary" /> */}
			{/* 					<a href={BUSINESS_INFO.phone.link} className="hover:text-primary transition-colors"> */}
			{/* 						{BUSINESS_INFO.phone.display} */}
			{/* 					</a> */}
			{/* 				</div> */}
			{/* 				<div className="flex items-center gap-2"> */}
			{/* 					<MailIcon className="w-4 h-4 text-primary" /> */}
			{/* 					<a href={BUSINESS_INFO.email.link} className="hover:text-primary transition-colors"> */}
			{/* 						{BUSINESS_INFO.email.display} */}
			{/* 					</a> */}
			{/* 				</div> */}
			{/**/}
			{/* 			</div> */}
			{/* 			<div className="hidden md:flex items-center gap-4 text-beige text-xs md:text-sm"> */}
			{/* 				<div className="flex items-center gap-1"> */}
			{/* 					<FacebookIcon className="w-4 h-4 fill-primary text-primary" /> */}
			{/* 					<a href={BUSINESS_INFO.social.facebook.url} target="_blank" rel="noopener noreferrer" > */}
			{/* 						{BUSINESS_INFO.social.facebook.label} */}
			{/* 					</a> */}
			{/* 				</div> */}
			{/* 				<div className="flex items-center gap-1"> */}
			{/* 					<InstagramIcon className="w-4 h-4 text-primary" /> */}
			{/* 					<a href={BUSINESS_INFO.social.instagram.url} target="_blank" rel="noopener noreferrer"> */}
			{/* 						{BUSINESS_INFO.social.instagram.label} */}
			{/* 					</a> */}
			{/* 				</div> */}
			{/* 			</div> */}
			{/* 		</div> */}
			{/* 	</div> */}
			{/* </div> */}

			{/* Main Navigation */}
			<div className="container mx-auto max-w-7xl px-6">
				<div className="flex items-center justify-between gap-4 py-3 md:py-4">
					<div className="flex items-center gap-4">
						{/* Mobile menu button with Sheet - Moved to Left */}
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="text-foreground hover:text-primary lg:hidden"
								>
									<Menu className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="flex h-full w-full flex-col p-0 sm:w-80 [&>button]:hidden"
							>
								{/* Fixed Header */}
								<div className="flex-shrink-0 border-b p-4">
									<div className="flex items-center justify-between gap-3">
										<div className="flex min-w-0 flex-1 items-center gap-2.5">
											<BrandLogo
												compact
												logoClassName="h-9 max-h-10 max-w-[100px] sm:max-w-[140px]"
												className="shrink-0"
											/>
											<span className="min-w-0 truncate font-semibold text-foreground text-sm leading-snug tracking-tight sm:text-base">
												{BUSINESS_INFO.business.name}
											</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setIsSheetOpen(false)}
											className="rounded-lg p-2 hover:bg-accent"
										>
											<ChevronsLeft className="h-5 w-5 text-muted-foreground" />
										</Button>
									</div>
								</div>

								{/* Mobile Menu Content */}
								<MarketingMobileMenuContent
									onClose={() => setIsSheetOpen(false)}
								/>
							</SheetContent>
						</Sheet>

						<BrandLogo />
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden items-center gap-1 lg:flex lg:gap-2">
						<NavLinks />
					</nav>

					{/* CTA & User Menu */}
					<div className="flex items-center gap-4 md:gap-8">
						<div className="flex items-center gap-3">
							<Link to="/fleet">
								<Button
									size="sm"
									variant="default"
									className="rounded-full px-5 font-medium"
								>
									Book now
								</Button>
							</Link>
						</div>

						<MarketingUserMenu />
					</div>
				</div>
			</div>
		</div>
	);
}

function NavLinks() {
	const { session } = useUserQuery();
	const isCustomer = session?.user?.role === "user";

	// Add My Bookings for authenticated customers
	const routes = isCustomer
		? [...MARKETING_ROUTES, { path: "/my-bookings", label: "My Bookings" }]
		: MARKETING_ROUTES;

	const links = routes.map(({ path, label }) => {
		return (
			<Link
				key={path}
				to={path}
				activeProps={{
					className:
						"border-foreground text-foreground hover:border-foreground/80",
				}}
				className="border-transparent border-b-2 px-1 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:border-border/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{label}
			</Link>
		);
	});

	return <>{links}</>;
}

function MobileDashboardLinks({
	session,
	onClose,
}: {
	session: any;
	onClose: () => void;
}) {
	const isAdmin =
		session.user.role === "admin" || session.user.role === "super_admin";
	const isDriver = session.user.role === "driver";

	return (
		<div className="flex flex-col gap-2">
			{isAdmin && (
				<Button
					className="w-full justify-start gap-2 rounded-xl shadow-none"
					onClick={onClose}
					asChild
				>
					<Link to="/admin/dashboard">
						<SettingsIcon className="h-4 w-4" />
						Admin Dashboard
					</Link>
				</Button>
			)}

			{isDriver && (
				<Button
					className="w-full justify-start gap-2 rounded-xl shadow-none"
					onClick={onClose}
					asChild
				>
					<Link to="/driver">
						<UserIcon className="h-4 w-4" />
						Driver Dashboard
					</Link>
				</Button>
			)}
		</div>
	);
}

function MobileUserProfile({
	session,
	onClose,
}: {
	session: any;
	onClose: () => void;
}) {
	const isCustomer = session.user.role === "user";

	if (!isCustomer) return null;

	return (
		<div className="flex flex-col gap-2 border-border border-t pt-2">
			<div className="px-2 py-1">
				<p className="truncate font-medium text-foreground text-sm">
					{session.user.name}
				</p>
				<p className="truncate text-muted-foreground text-xs">
					{session.user.email}
				</p>
			</div>

			<Link
				to="/profile"
				onClick={onClose}
				className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground text-sm transition-colors hover:bg-muted/60"
			>
				<UserIcon className="h-4 w-4" />
				Profile
			</Link>

			<Link
				to="/account/settings"
				onClick={onClose}
				className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground text-sm transition-colors hover:bg-muted/60"
			>
				<SettingsIcon className="h-4 w-4" />
				Account Settings
			</Link>
		</div>
	);
}

function MarketingMobileMenuContent({ onClose }: { onClose: () => void }) {
	const { session, signOutWithConfirmation } = useUserQuery();
	const location = useLocation();

	// Map marketing routes to navigation items with icons
	const getNavigationItems = () => {
		const isCustomer = session?.user?.role === "user";

		const baseRoutes = [
			{ path: "/", label: "Home", icon: HomeIcon },
			{ path: "/fleet", label: "Our Fleet", icon: CarIcon },
			{ path: "/services", label: "Services", icon: Package },
			{ path: "/about-us", label: "About Us", icon: InfoIcon },
			{ path: "/blogs", label: "Blog", icon: BookOpen },
			{ path: "/contact-us", label: "Contact", icon: ContactIcon },
		];

		// Add My Bookings for authenticated customers
		if (isCustomer) {
			baseRoutes.splice(2, 0, {
				path: "/my-bookings",
				label: "My Bookings",
				icon: CalendarIcon,
			});
		}

		return baseRoutes;
	};

	const navigationItems = getNavigationItems();

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	return (
		<>
			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* User Info Section */}
				{session && (
					<div className="border-b p-4">
						<div className="flex items-center space-x-3">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={session?.user?.image ?? undefined}
									alt="Profile image"
								/>
								<AvatarFallback className="bg-primary/10 text-lg text-primary">
									{session?.user?.name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="font-medium text-foreground text-sm">
									{session?.user.name}
								</p>
								<p className="text-muted-foreground text-xs">
									{session?.user.email}
								</p>
								<p className="font-medium text-blue-600 text-xs capitalize">
									{session?.user.role === "user"
										? "Customer"
										: session?.user.role}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<div className="p-4">
					<nav className="space-y-1">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.path);
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={onClose}
									className={cn(
										"flex touch-manipulation items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50",
										active
											? "font-medium text-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<Icon
										className={cn(
											"h-5 w-5 shrink-0",
											active ? "text-foreground" : "text-muted-foreground",
										)}
										strokeWidth={1.75}
									/>
									<span className="text-sm">{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Dashboard Links for authenticated users */}
				{session && (
					<div className="border-t p-4">
						<div className="space-y-2">
							<MobileDashboardLinks session={session} onClose={onClose} />
							{session.user.role === "user" && (
								<MobileUserProfile session={session} onClose={onClose} />
							)}
						</div>
					</div>
				)}

				{/* Contact Information */}
				<div className="border-t p-4">
					<div className="space-y-3">
						<h3 className="font-semibold text-foreground text-sm">
							Contact Us
						</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<Phone className="h-4 w-4 text-primary" />
								<a
									href={BUSINESS_INFO.phone.link}
									className="transition-colors hover:text-foreground"
								>
									{BUSINESS_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<MailIcon className="h-4 w-4 text-primary" />
								<a
									href={BUSINESS_INFO.email.link}
									className="transition-colors hover:text-foreground"
								>
									{BUSINESS_INFO.email.display}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Fixed Footer */}
			<div className="flex-shrink-0 border-t bg-background p-4">
				{session ? (
					<Button
						variant="outline"
						className="flex w-full items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
						onClick={() => {
							signOutWithConfirmation.openSignOutDialog();
						}}
					>
						<LogOutIcon className="h-4 w-4" />
						<span>Sign Out</span>
					</Button>
				) : (
					<div className="flex w-full gap-2">
						<AuthCTA />
					</div>
				)}
			</div>

			{/* Sign Out Confirmation Dialog */}
			{session && (
				<SignOutConfirmationDialog
					isOpen={signOutWithConfirmation.isDialogOpen}
					onClose={signOutWithConfirmation.closeSignOutDialog}
					onConfirm={async () => {
						await signOutWithConfirmation.confirmSignOut();
						onClose(); // Close the mobile sheet after successful sign out
					}}
					userRole={(session.user.role || "user") as any}
					userName={session.user.name}
					isLoading={signOutWithConfirmation.isSigningOut}
				/>
			)}
		</>
	);
}
