import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

export function ContactHeroSection() {
	return (
		<div className="relative bg-[url('/src/assets/images/sydney.webp')] bg-center bg-cover bg-no-repeat py-24">
			<div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/75 to-foreground/70" />
			<div className="container relative z-10 mx-auto px-6 text-center">
				<div className="mx-auto max-w-4xl">
					<div className="mb-6 inline-flex items-center rounded-full bg-beige px-4 py-2 font-medium text-foreground text-xs md:text-sm">
						<Phone className="mr-2 h-4 w-4" />
						Get in Touch
					</div>

					<h1 className="mb-6 font-bold text-4xl text-white lg:text-6xl">
						Contact Our
						<span className="block text-primary-secondary">Luxury Team</span>
					</h1>

					<p className="mx-auto mb-8 max-w-3xl text-lg text-white/80 leading-relaxed md:text-xl">
						Ready to experience premium transportation? Our dedicated team is
						here to assist you daily from 00:00 – 23:45 with personalized
						service and expert guidance.
					</p>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<a href={BUSINESS_INFO.phone.link}>
							<Button
								size="lg"
								className="rounded-xl bg-primary px-8 py-6 font-semibold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
							>
								Call Now
							</Button>
						</a>
						<Link to="/fleet">
							<Button
								variant="outline"
								size="lg"
								className="rounded-xl border-white/30 px-8 py-6 font-semibold text-lg text-primary hover:bg-white/10"
							>
								Book Online
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
