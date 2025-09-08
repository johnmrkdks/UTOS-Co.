import { MapPin, Clock, Headphones } from "lucide-react";
import { ContactUsForm } from "./contact-us-form";
import { ContactUsMap } from "./map";

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

export function OfficeDetailsSection() {
	return (
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
	);
}