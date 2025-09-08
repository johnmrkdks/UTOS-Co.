import { Phone, Mail } from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

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

export function ContactMethodsSection() {
	return (
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
	);
}