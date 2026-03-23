import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Award,
	Clock,
	Facebook,
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Shield,
	Star,
	Twitter,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { BUSINESS_INFO } from "@/constants/business-info";

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
		{ label: "VIP Experience", href: "/services" },
	],
	company: [
		{ label: "About Us", href: "/about-us" },
		{ label: "Our Fleet", href: "/services" },
		{ label: "Contact Us", href: "/contact-us" },
		{ label: "FAQs", href: "/faqs" },
		{ label: "Book Now", href: "/fleet" },
	],
	support: [
		{ label: "Customer Support", href: "/contact-us" },
		{ label: "Emergency Hotline", href: BUSINESS_INFO.phone.link },
		{ label: "Track Your Ride", href: "/fleet" },
		{ label: "Payment Options", href: "/faqs" },
		{ label: "Cancellation Policy", href: "/faqs" },
	],
};

const socialLinks = [
	{
		icon: Facebook,
		href: BUSINESS_INFO.social.facebook.url,
		label: BUSINESS_INFO.social.facebook.label,
	},
	{
		icon: Instagram,
		href: BUSINESS_INFO.social.instagram.url,
		label: BUSINESS_INFO.social.instagram.label,
	},
];

export function MarketingFooter({ className, ...props }: FooterProps) {
	return (
		<footer
			className={cn("border-border border-t bg-soft-beige", className)}
			{...props}
		>
			{/* Main Footer Content */}
			<div className="container mx-auto px-6 py-16">
				<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
					{/* Company Info */}
					<div className="lg:col-span-1">
						<Link to="/" className="group mb-6 flex items-center gap-3">
							<Logo />
							<div>
								<h2 className="font-bold text-foreground text-xl transition-colors group-hover:text-primary">
									{BUSINESS_INFO.business.name}
								</h2>
								<p className="text-muted-foreground text-xs">
									{BUSINESS_INFO.business.slogan}
								</p>
							</div>
						</Link>

						<p className="mb-6 text-muted-foreground leading-relaxed">
							Experience luxury transportation in Sydney with our professional
							chauffeur service. Available Mon-Sun 00:00 – 23:45. We are always
							at your disposal.
						</p>

						{/* Contact Info */}
						<div className="mb-6 space-y-3">
							<div className="flex items-center gap-3">
								<Phone className="h-4 w-4 flex-shrink-0 text-primary" />
								<a
									href={BUSINESS_INFO.phone.link}
									className="transition-colors hover:text-primary"
								>
									{BUSINESS_INFO.phone.display}
								</a>
							</div>
							<div className="flex items-start gap-3">
								<Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
								<div className="text-sm">
									<p className="font-medium">Hours: Mon-Sun 00:00 – 23:45</p>
									<p className="text-muted-foreground text-xs">
										We are always at your disposal
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
									className="group flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all hover:scale-110 hover:bg-primary"
									aria-label={social.label}
								>
									<social.icon className="h-4 w-4 text-primary transition-colors group-hover:text-white" />
								</a>
							))}
						</div>
					</div>

					{/* Services Links */}
					<div>
						<h3 className="mb-6 font-bold text-foreground text-lg">
							Our Services
						</h3>
						<ul className="space-y-3">
							{footerLinks.services.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-muted-foreground text-sm transition-colors hover:text-primary"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className="mb-6 font-bold text-foreground text-lg">Company</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="text-muted-foreground text-sm transition-colors hover:text-primary"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support Links */}
					<div>
						<h3 className="mb-6 font-bold text-foreground text-lg">Support</h3>
						<ul className="mb-6 space-y-3">
							{footerLinks.support.map((link) => (
								<li key={link.label}>
									{link.href.startsWith("tel:") ? (
										<a
											href={link.href}
											className="text-muted-foreground text-sm transition-colors hover:text-primary"
										>
											{link.label}
										</a>
									) : (
										<Link
											to={link.href}
											className="text-muted-foreground text-sm transition-colors hover:text-primary"
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
			<div className="border-border border-t bg-beige">
				<div className="container mx-auto px-6 py-6">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="text-center text-muted-foreground text-sm md:text-left">
							<p>
								&copy;{" "}
								{BUSINESS_INFO.business.foundedYear === 2020
									? `${BUSINESS_INFO.business.foundedYear}-${new Date().getFullYear()}`
									: new Date().getFullYear()}{" "}
								{BUSINESS_INFO.business.name}. All rights reserved.
							</p>
							<p className="mt-1">
								<Link
									to="/privacy"
									className="transition-colors hover:text-primary"
								>
									Privacy Policy
								</Link>
								{" | "}
								<Link
									to="/terms-and-conditions"
									className="transition-colors hover:text-primary"
								>
									Terms and Conditions
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
