import { cn } from "@workspace/ui/lib/utils";
import { ContactUsForm } from "./contact-us-form";
import { ContactUsMap } from "./map";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import { BUSINESS_INFO } from "@/constants/business-info";
import {
	Phone,
	Mail,
	MapPin,
	Clock,
	MessageCircle,
	Star,
	Car,
	Shield,
	Headphones
} from "lucide-react";

const contactMethods = [
	{
		icon: Phone,
		title: "Call Us",
		description: "Speak directly with our team",
		contact: BUSINESS_INFO.phone.display,
		action: BUSINESS_INFO.phone.link,
		available: "00:00 – 23:45"
	},
	{
		icon: Mail,
		title: "Email Us",
		description: "Send us a detailed message",
		contact: BUSINESS_INFO.email.display,
		action: BUSINESS_INFO.email.link,
		available: "24 hours response"
	},
];

const officeDetails = [
	{
		icon: MapPin,
		title: "Office Location",
		details: ["Sydney New South Wales", "Australia"]
	},
	{
		icon: Clock,
		title: "Business Hours",
		details: ["Monday - Sunday: 00:00 – 23:45", "We are always at your disposal", "15 minutes off for maintenance only"]
	},
	{
		icon: Headphones,
		title: "Customer Support",
		details: ["Available 00:00 – 23:45 daily", "Multilingual assistance", "Dedicated account managers"]
	}
];

type ContactUsProps = {
	className?: string;
};

export function ContactUs({ className, ...props }: ContactUsProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-[url('/src/assets/images/sydney.webp')] bg-center bg-cover bg-no-repeat">
				<div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/75 to-foreground/70" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-xs md:text-sm font-medium mb-6">
							<Phone className="w-4 h-4 mr-2" />
							Get in Touch
						</div>

						<h1 className="text-4xl lg:text-6xl font-bold text-background mb-6">
							Contact Our
							<span className="block text-primary-secondary">
								Luxury Team
							</span>
						</h1>

						<p className="text-lg md:text-xl text-background/80 leading-relaxed max-w-3xl mx-auto mb-8">
							Ready to experience premium transportation? Our dedicated team is here to assist
							you daily from 00:00 – 23:45 with personalized service and expert guidance.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a href={BUSINESS_INFO.phone.link}>
								<Button
									size="lg"
									className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								>
									Call Now
								</Button>
							</a>
							<Link to="/booking">
								<Button
									variant="outline"
									size="lg"
									className="border-background/20 text-primary hover:bg-background/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Online
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Contact Methods */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Multiple Ways to Reach Us
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose your preferred method of communication. Our team is always ready
							to provide exceptional service and answer your questions.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 mb-16">
						{contactMethods.map((method, index) => (
							<div
								key={method.title}
								className="bg-card border-2 border-border hover:border-primary/30 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl group"
							>
								<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<method.icon className="w-8 h-8 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-card-foreground mb-3">
									{method.title}
								</h3>
								<p className="text-muted-foreground mb-4">
									{method.description}
								</p>
								<a
									href={method.action}
									className="text-primary hover:text-primary/80 font-semibold text-lg block mb-2 transition-colors duration-200"
								>
									{method.contact}
								</a>
								<div className="text-sm text-muted-foreground">
									{method.available}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Contact Form & Map Section */}
			<div className="py-24 bg-soft-beige">
				<div className="container mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-16 items-start">
						{/* Contact Form */}
						<div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
							<div className="mb-8">
								<h3 className="text-3xl font-bold text-card-foreground mb-4">
									Send Us a Message
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									Fill out the form below and we'll get back to you within 24 hours.
									For urgent requests, please call us directly.
								</p>
							</div>

							<ContactUsForm />
						</div>

						{/* Office Information */}
						<div className="space-y-8">
							<div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
								<h3 className="text-2xl font-bold text-card-foreground mb-6">
									Visit Our Office
								</h3>
								<ContactUsMap className="h-64 w-full rounded-xl mb-6" />

								<div className="space-y-6">
									{officeDetails.map((detail, index) => (
										<div key={detail.title} className="flex items-start">
											<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 mt-1">
												<detail.icon className="w-6 h-6 text-primary" />
											</div>
											<div>
												<h4 className="text-lg font-bold text-card-foreground mb-2">
													{detail.title}
												</h4>
												{detail.details.map((line, lineIndex) => (
													<p key={lineIndex} className="text-muted-foreground">
														{line}
													</p>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
