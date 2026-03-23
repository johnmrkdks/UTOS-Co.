import { Clock, Headphones, MapPin } from "lucide-react";
import { ContactUsForm } from "./contact-us-form";
import { ContactUsMap } from "./map";

const officeDetails = [
	{
		icon: MapPin,
		title: "Office Location",
		details: ["Sydney New South Wales", "Australia"],
	},
	{
		icon: Clock,
		title: "Business Hours",
		details: [
			"Monday - Sunday: 00:00 – 23:45",
			"We are always at your disposal",
			"15 minutes off for maintenance only",
		],
	},
	{
		icon: Headphones,
		title: "Customer Support",
		details: [
			"Available 00:00 – 23:45 daily",
			"Multilingual assistance",
			"Dedicated account managers",
		],
	},
];

export function OfficeDetailsSection() {
	return (
		<div className="bg-soft-beige py-24">
			<div className="container mx-auto px-6">
				<div className="grid items-start gap-16 lg:grid-cols-2">
					{/* Contact Form */}
					<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
						<div className="mb-8">
							<h3 className="mb-4 font-bold text-3xl text-card-foreground">
								Send Us a Message
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Fill out the form below and we'll get back to you within 24
								hours. For urgent requests, please call us directly.
							</p>
						</div>

						<ContactUsForm />
					</div>

					{/* Office Information */}
					<div className="space-y-8">
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<h3 className="mb-6 font-bold text-2xl text-card-foreground">
								Visit Our Office
							</h3>
							<ContactUsMap className="mb-6 h-64 w-full rounded-xl" />

							<div className="space-y-6">
								{officeDetails.map((detail, index) => (
									<div key={detail.title} className="flex items-start">
										<div className="mt-1 mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
											<detail.icon className="h-6 w-6 text-primary" />
										</div>
										<div>
											<h4 className="mb-2 font-bold text-card-foreground text-lg">
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
