import { Mail, Phone } from "lucide-react";
import contactOfficialFleet from "@/assets/marketing/contact-official-fleet.png";
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
		<div className="relative overflow-hidden bg-muted/20 py-16 md:py-24">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[position:30%_40%] bg-cover bg-no-repeat opacity-[0.06]"
				style={{ backgroundImage: `url(${contactOfficialFleet})` }}
			/>
			<div className="container relative z-[1] mx-auto px-6">
				<div className="mb-12 text-center md:mb-16">
					<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
						Reach us
					</h2>
					<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
						Choose your preferred method of communication. Our team is always
						ready to provide exceptional service and answer your questions.
					</p>
				</div>

				<div className="mb-12 grid gap-6 md:grid-cols-2">
					{contactMethods.map((method) => (
						<div
							key={method.title}
							className="rounded-xl border border-border/60 bg-card p-6 text-center md:p-8"
						>
							<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
								<method.icon className="h-5 w-5 text-foreground/80" />
							</div>
							<h3 className="mb-2 font-semibold text-base text-card-foreground">
								{method.title}
							</h3>
							<p className="mb-3 text-muted-foreground text-sm">
								{method.description}
							</p>
							<a
								href={method.action}
								className="mb-2 block font-medium text-foreground underline-offset-4 transition-colors hover:underline"
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
