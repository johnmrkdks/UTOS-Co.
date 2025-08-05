import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Logo } from "@/components/logo";
import { MarketingUserMenu } from "@/features/marketing/_components/navbar/marketing-user-menu";
import { AuthCTA } from "./navbar/auth-cta";
import { MARKETING_ROUTES } from "@/features/marketing/_constants/marketing-routes";
import { CONTACT_INFO } from "@/features/marketing/_constants/contact-info";
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
	CalendarIcon
} from "lucide-react";

type HeaderProps = {
	className?: string;
};

export function MarketingNavbar({ className, ...props }: HeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<div className={cn("bg-beige shadow-lg relative z-50", className)} {...props}>
			{/* Top Contact Bar */}
			<div className="hidden md:block bg-foreground border-b border-border">
				<div className="container mx-auto px-6 py-2">
					<div className="flex items-center justify-center md:justify-between text-xs md:text-sm">
						<div className="flex items-center gap-6 text-beige">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-primary" />
								<a href={CONTACT_INFO.phone.link} className="hover:text-primary transition-colors">
									{CONTACT_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<MailIcon className="w-4 h-4 text-primary" />
								<a href={CONTACT_INFO.email.link} className="hover:text-primary transition-colors">
									{CONTACT_INFO.email.display}
								</a>
							</div>

						</div>
						<div className="hidden md:flex items-center gap-4 text-beige text-xs md:text-sm">
							<div className="flex items-center gap-1">
								<FacebookIcon className="w-4 h-4 fill-primary text-primary" />
								<a href={CONTACT_INFO.social.facebook.url} target="_blank" rel="noopener noreferrer" >
									{CONTACT_INFO.social.facebook.label}
								</a>
							</div>
							<div className="flex items-center gap-1">
								<InstagramIcon className="w-4 h-4 text-primary" />
								<a href={CONTACT_INFO.social.instagram.url} target="_blank" rel="noopener noreferrer">
									{CONTACT_INFO.social.instagram.label}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Navigation */}
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-between py-2 md:py-4">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-3 group">
						<Logo />
						<div className="hidden sm:block">
							<h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
								{CONTACT_INFO.business.name}
							</h1>
							<p className="text-xs text-muted-foreground -mt-1">
								Sydney's Premier Luxury Service
							</p>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-8">
						<NavLinks />
					</nav>

					{/* CTA & Mobile Menu */}
					<div className="flex items-center gap-4 md:gap-8">
						<div className="flex items-center gap-3">
							<Link to="/booking">
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
					<div className="flex items-center justify-center gap-2 p-4 border-t border-border">
						<AuthCTA />
					</div>

					<div className="bg-foreground border-t border-border">
						<div className="flex flex-col items-center gap-4 text-beige text-xs md:text-sm py-4">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-primary" />
								<a href={CONTACT_INFO.phone.link} className="hover:text-primary transition-colors">
									{CONTACT_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<MailIcon className="w-4 h-4 text-primary" />
								<a href={CONTACT_INFO.email.link} className="hover:text-primary transition-colors">
									{CONTACT_INFO.email.display}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									<FacebookIcon className="w-4 h-4 fill-primary text-primary" />
									<a href={CONTACT_INFO.social.facebook.url} target="_blank" rel="noopener noreferrer" >
										{CONTACT_INFO.social.facebook.label}
									</a>
								</div>
								<div className="flex items-center gap-1">
									<InstagramIcon className="w-4 h-4 text-primary" />
									<a href={CONTACT_INFO.social.instagram.url} target="_blank" rel="noopener noreferrer">
										{CONTACT_INFO.social.instagram.label}
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
	const links = MARKETING_ROUTES.map(({ path, label }) => {
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
	const links = MARKETING_ROUTES.map(({ path, label }) => {
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
