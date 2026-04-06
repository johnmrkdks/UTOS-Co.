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
		<div className="bg-background py-16 md:py-24">
			<div className="container mx-auto px-6">
				<div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Contact Form */}
					<div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
						<div className="mb-8">
							<h3 className="mb-2 font-semibold text-card-foreground text-xl tracking-tight md:text-2xl">
								Message
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed md:text-base">
								Fill out the form below and we'll get back to you within 24
								hours. For urgent requests, please call us directly.
							</p>
						</div>

						<ContactUsForm />
					</div>

					{/* Office Information */}
					<div className="space-y-8">
						<div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
							<h3 className="mb-5 font-semibold text-card-foreground text-xl tracking-tight md:text-2xl">
								Office
							</h3>
							<ContactUsMap className="mb-6 h-64 w-full rounded-lg border border-border/40" />

							<div className="space-y-5">
								{officeDetails.map((detail) => (
									<div key={detail.title} className="flex items-start">
										<div className="mt-0.5 mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
											<detail.icon className="h-4 w-4 text-foreground/80" />
										</div>
										<div>
											<h4 className="mb-1 font-medium text-card-foreground text-sm">
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
