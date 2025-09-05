import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
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
	SettingsIcon
} from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { BrandLogo } from "@/components/brand-logo";

type HeaderProps = {
	className?: string;
};

export function MarketingNavbar({ className, ...props }: HeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { session } = useUserQuery();

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
					<BrandLogo />

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-8">
						<NavLinks />
					</nav>

					{/* CTA & Mobile Menu */}
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

						{/* Mobile menu button */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="lg:hidden text-foreground hover:text-primary transition-colors"
						>
							{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			{isMenuOpen && (
				<div className="lg:hidden absolute top-full left-0 w-full bg-beige border-t border-border shadow-lg">
					<div className="container mx-auto p-4">
						<nav className="flex flex-col items-end justify-center gap-2">
							<MobileNavLinks onClose={() => setIsMenuOpen(false)} />
						</nav>
					</div>

					{/* User Actions Section */}
					{session ? (
						<div className="border-t border-border p-4">
							<div className="flex flex-col gap-3">
								<MobileDashboardLinks session={session} onClose={() => setIsMenuOpen(false)} />
								<MobileUserProfile session={session} onClose={() => setIsMenuOpen(false)} />
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center gap-2 p-4 border-t border-border">
							<AuthCTA />
						</div>
					)}

					{/* Contact & Social Section */}
					<div className="bg-foreground border-t border-border">
						<div className="flex flex-col items-center gap-4 text-beige text-xs md:text-sm py-4">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-primary" />
								<a href={BUSINESS_INFO.phone.link} className="hover:text-primary transition-colors">
									{BUSINESS_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<MailIcon className="w-4 h-4 text-primary" />
								<a href={BUSINESS_INFO.email.link} className="hover:text-primary transition-colors">
									{BUSINESS_INFO.email.display}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									<FacebookIcon className="w-4 h-4 fill-primary text-primary" />
									<a href={BUSINESS_INFO.social.facebook.url} target="_blank" rel="noopener noreferrer" >
										{BUSINESS_INFO.social.facebook.label}
									</a>
								</div>
								<div className="flex items-center gap-1">
									<InstagramIcon className="w-4 h-4 text-primary" />
									<a href={BUSINESS_INFO.social.instagram.url} target="_blank" rel="noopener noreferrer">
										{BUSINESS_INFO.social.instagram.label}
									</a>
								</div>
							</div>
						</div>
					</div>

				</div>
			)}
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
