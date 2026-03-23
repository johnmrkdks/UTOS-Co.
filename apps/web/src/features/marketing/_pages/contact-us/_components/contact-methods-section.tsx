import { Mail, Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

const contactMethods = [
	{
		icon: Phone,
		title: "Call Us",
		description: "Speak directly with our team",
		contact: BUSINESS_INFO.phone.display,
		action: BUSINESS_INFO.phone.link,
		available: "00:00 – 23:45",
	},
	{
		icon: Mail,
		title: "Email Us",
		description: "Send us a detailed message",
		contact: BUSINESS_INFO.email.display,
		action: BUSINESS_INFO.email.link,
		available: "24 hours response",
	},
];

export function ContactMethodsSection() {
	return (
		<div className="bg-beige py-24">
			<div className="container mx-auto px-6">
				<div className="mb-16 text-center">
					<h2 className="mb-4 font-bold text-4xl text-foreground">
						Multiple Ways to Reach Us
					</h2>
					<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
						Choose your preferred method of communication. Our team is always
						ready to provide exceptional service and answer your questions.
					</p>
				</div>

				<div className="mb-16 grid gap-8 md:grid-cols-2">
					{contactMethods.map((method, index) => (
						<div
							key={method.title}
							className="group rounded-2xl border-2 border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
						>
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
								<method.icon className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-3 font-bold text-card-foreground text-xl">
								{method.title}
							</h3>
							<p className="mb-4 text-muted-foreground">{method.description}</p>
							<a
								href={method.action}
								className="mb-2 block font-semibold text-lg text-primary transition-colors duration-200 hover:text-primary/80"
							>
								{method.contact}
							</a>
							<div className="text-muted-foreground text-sm">
								{method.available}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
