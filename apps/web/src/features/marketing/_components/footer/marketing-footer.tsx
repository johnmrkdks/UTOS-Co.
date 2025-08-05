import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Logo } from "@/components/logo";
import { CONTACT_INFO } from "@/features/marketing/_constants/contact-info";
import {
	Phone,
	Mail,
	MapPin,
	Clock,
	Star,
	Shield,
	Award,
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
	MessageCircle
} from "lucide-react";

type FooterProps = {
	className?: string;
};

const footerLinks = {
	services: [
		{ label: "Airport Transfers", href: "/services" },
		{ label: "Corporate Travel", href: "/services" },
		{ label: "Special Events", href: "/services" },
		{ label: "City Tours", href: "/services" },
		{ label: "Hourly Charter", href: "/services" },
		{ label: "VIP Experience", href: "/services" }
	],
	company: [
		{ label: "About Us", href: "/about-us" },
		{ label: "Our Fleet", href: "/services" },
		{ label: "Contact Us", href: "/contact-us" },
		{ label: "FAQs", href: "/faqs" },
		{ label: "Book Now", href: "/booking" }
	],
	support: [
		{ label: "Customer Support", href: "/contact-us" },
		{ label: "Emergency Hotline", href: CONTACT_INFO.phone.link },
		{ label: "Track Your Ride", href: "/booking" },
		{ label: "Payment Options", href: "/faqs" },
		{ label: "Cancellation Policy", href: "/faqs" }
	]
};

const socialLinks = [
	{ icon: Facebook, href: CONTACT_INFO.social.facebook.url, label: CONTACT_INFO.social.facebook.label },
	{ icon: Instagram, href: CONTACT_INFO.social.instagram.url, label: CONTACT_INFO.social.instagram.label },
];

export function MarketingFooter({ className, ...props }: FooterProps) {
	return (
		<footer className={cn("bg-soft-beige border-t border-border", className)} {...props}>
			{/* Main Footer Content */}
			<div className="container mx-auto px-6 py-16">
				<div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
					{/* Company Info */}
					<div className="lg:col-span-1">
						<Link to="/" className="flex items-center gap-3 mb-6 group">
							<Logo />
							<div>
								<h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
									{CONTACT_INFO.business.name}
								</h2>
								<p className="text-xs text-muted-foreground">
									Sydney's Premier Luxury Service
								</p>
							</div>
						</Link>

						<p className="text-muted-foreground mb-6 leading-relaxed">
							Experience luxury transportation in Sydney with our professional chauffeur
							service. Available Mon-Sun 00:00 – 23:45. We are always at your disposal.
						</p>

						{/* Contact Info */}
						<div className="space-y-3 mb-6">
							<div className="flex items-center gap-3">
								<Phone className="w-4 h-4 text-primary flex-shrink-0" />
								<a href={CONTACT_INFO.phone.link} className="hover:text-primary transition-colors">
									{CONTACT_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-start gap-3">
								<Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
								<div className="text-sm">
									<p className="font-medium">Hours: Mon-Sun 00:00 – 23:45</p>
									<p className="text-muted-foreground text-xs">We are always at your disposal</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
								<div className="text-sm">
									<p>Sydney, New South Wales, Australia</p>
								</div>
							</div>
						</div>

						{/* Social Links */}
						<div className="flex items-center gap-3">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="w-10 h-10 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all hover:scale-110 group"
									aria-label={social.label}
								>
									<social.icon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
								</a>
							))}
						</div>
					</div>

					{/* Services Links */}
					<div>
						<h3 className="text-lg font-bold text-foreground mb-6">Our Services</h3>
						<ul className="space-y-3">
							{footerLinks.services.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className="text-lg font-bold text-foreground mb-6">Company</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support Links */}
					<div>
						<h3 className="text-lg font-bold text-foreground mb-6">Support</h3>
						<ul className="space-y-3 mb-6">
							{footerLinks.support.map((link) => (
								<li key={link.label}>
									{link.href.startsWith('tel:') ? (
										<a
											href={link.href}
											className="text-muted-foreground hover:text-primary transition-colors text-sm"
										>
											{link.label}
										</a>
									) : (
										<Link
											to={link.href}
											className="text-muted-foreground hover:text-primary transition-colors text-sm"
										>
											{link.label}
										</Link>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-border bg-beige">
				<div className="container mx-auto px-6 py-6">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="text-muted-foreground text-sm text-center md:text-left">
							<p>&copy; {CONTACT_INFO.business.foundedYear === 2020 ? `${CONTACT_INFO.business.foundedYear}-${new Date().getFullYear()}` : new Date().getFullYear()} {CONTACT_INFO.business.name}. All rights reserved.</p>
							<p className="mt-1">
								<Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
								{" | "}
								<Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms and Conditions</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
