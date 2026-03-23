import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Logo } from "@/components/logo";
import { MarketingUserMenu } from "@/features/marketing/_components/navbar/marketing-user-menu";
import { AuthCTA } from "./navbar/auth-cta";
import { MARKETING_ROUTES } from "@/constants/marketing-routes";
import {
	Phone,
	Menu,
	X,
	Star,
	Shield,
	Clock,
	FacebookIcon,
	InstagramIcon,
	MailIcon,
	CalendarIcon,
	UserIcon,
	SettingsIcon,
	LogOutIcon,
	HomeIcon,
	CarIcon,
	InfoIcon,
	HelpCircleIcon,
	ContactIcon,
	Package,
	ChevronsLeft
} from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";

type HeaderProps = {
	className?: string;
};

export function MarketingNavbar({ className, ...props }: HeaderProps) {
	const { session } = useUserQuery();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	return (
		<div className={cn("bg-beige shadow-lg relative z-50", className)} {...props}>
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
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-between py-2 md:py-4">
					<div className="flex items-center gap-4">
						{/* Mobile menu button with Sheet - Moved to Left */}
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="lg:hidden text-foreground hover:text-primary"
								>
									<Menu className="w-6 h-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-full sm:w-80 p-0 flex flex-col h-full [&>button]:hidden">
								{/* Fixed Header */}
								<div className="p-4 border-b flex-shrink-0">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<Logo />
											<div className="ml-2">
												<h2 className="text-lg font-semibold">Down Under Chauffeur</h2>
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setIsSheetOpen(false)}
											className="p-2 hover:bg-gray-100 rounded-lg"
										>
											<ChevronsLeft className="w-5 h-5 text-gray-600" />
										</Button>
									</div>
								</div>

								{/* Mobile Menu Content */}
								<MarketingMobileMenuContent onClose={() => setIsSheetOpen(false)} />
							</SheetContent>
						</Sheet>
						
						<BrandLogo />
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-8">
						<NavLinks />
					</nav>

					{/* CTA & User Menu */}
					<div className="flex items-center gap-4 md:gap-8">
						<div className="flex items-center gap-3">
							<Link to="/fleet">
								<Button
									size="sm"
									variant="dark"
									className="text-primary-foreground font-semibold"
								>
									Book Now
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
				activeProps={{ className: "text-primary" }}
				className="text-foreground hover:text-primary transition-colors font-medium relative group"
			>
				{label}
				<div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
			</Link>
		);
	});

	return <>{links}</>;
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
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
				onClick={onClose}
				activeProps={{ className: "text-primary bg-primary/10" }}
				className="text-foreground hover:text-primary hover:bg-primary/5 transition-all px-4 py-1.5 rounded-lg font-medium"
			>
				{label}
			</Link>
		);
	});

	return <>{links}</>;
}

function MobileDashboardLinks({ session, onClose }: { session: any; onClose: () => void }) {
	const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";
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
						<SettingsIcon className="w-4 h-4" />
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
						<UserIcon className="w-4 h-4" />
						Driver Dashboard
					</Link>
				</Button>
			)}
		</div>
	);
}

function MobileUserProfile({ session, onClose }: { session: any; onClose: () => void }) {
	const isCustomer = session.user.role === "user";

	if (!isCustomer) return null;

	return (
		<div className="flex flex-col gap-2 pt-2 border-t border-border">
			<div className="px-2 py-1">
				<p className="text-sm font-medium text-foreground truncate">
					{session.user.name}
				</p>
				<p className="text-xs text-muted-foreground truncate">
					{session.user.email}
				</p>
			</div>

			<Link
				to="/profile"
				onClick={onClose}
				className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
			>
				<UserIcon className="w-4 h-4" />
				Profile
			</Link>

			<Link
				to="/account/settings"
				onClick={onClose}
				className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
			>
				<SettingsIcon className="w-4 h-4" />
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
			{ path: "/faqs", label: "FAQs", icon: HelpCircleIcon },
			{ path: "/contact-us", label: "Contact", icon: ContactIcon },
		];

		// Add My Bookings for authenticated customers
		if (isCustomer) {
			baseRoutes.splice(2, 0, { path: "/my-bookings", label: "My Bookings", icon: CalendarIcon });
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
					<div className="p-4 border-b">
						<div className="flex items-center space-x-3">
							<Avatar className="w-12 h-12">
								<AvatarImage src={session?.user?.image ?? undefined} alt="Profile image" />
								<AvatarFallback className="bg-primary/10 text-primary text-lg">
									{session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
								<p className="text-xs text-gray-500">{session?.user.email}</p>
								<p className="text-xs text-blue-600 font-medium capitalize">{session?.user.role === 'user' ? 'Customer' : session?.user.role}</p>
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
										"flex items-center gap-4 p-3 rounded-lg transition-all duration-200 touch-manipulation group hover:bg-muted/50 active:scale-[0.98]",
										active 
											? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
											: "text-foreground hover:text-primary"
									)}
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
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">{item.label}</span>
											{active && (
												<div className="w-2 h-2 bg-primary rounded-full"></div>
											)}
										</div>
										{/* Optional descriptions for key items */}
										{item.path === "/" && (
											<p className="text-xs text-muted-foreground mt-0.5">Welcome to our platform</p>
										)}
										{item.path === "/fleet" && (
											<p className="text-xs text-muted-foreground mt-0.5">Explore luxury vehicles</p>
										)}
										{item.path === "/services" && (
											<p className="text-xs text-muted-foreground mt-0.5">Browse our premium services</p>
										)}
										{item.path === "/my-bookings" && (
											<p className="text-xs text-muted-foreground mt-0.5">View and manage bookings</p>
										)}
									</div>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Dashboard Links for authenticated users */}
				{session && (
					<div className="p-4 border-t">
						<div className="space-y-2">
							<MobileDashboardLinks session={session} onClose={onClose} />
							{session.user.role === "user" && (
								<MobileUserProfile session={session} onClose={onClose} />
							)}
						</div>
					</div>
				)}

				{/* Contact Information */}
				<div className="p-4 border-t">
					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-gray-900">Contact Us</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<Phone className="w-4 h-4 text-primary" />
								<a href={BUSINESS_INFO.phone.link} className="hover:text-primary transition-colors">
									{BUSINESS_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<MailIcon className="w-4 h-4 text-primary" />
								<a href={BUSINESS_INFO.email.link} className="hover:text-primary transition-colors">
									{BUSINESS_INFO.email.display}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Fixed Footer */}
			<div className="p-4 border-t flex-shrink-0 bg-white">
				{session ? (
					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
						onClick={() => {
							signOutWithConfirmation.openSignOutDialog();
						}}
					>
						<LogOutIcon className="h-4 w-4" />
						<span>Sign Out</span>
					</Button>
				) : (
					<div className="flex gap-2 w-full">
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
