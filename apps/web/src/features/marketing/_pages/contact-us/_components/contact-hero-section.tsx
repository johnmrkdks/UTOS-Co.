import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

export function ContactHeroSection() {
	return (
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
						<Link to="/fleet">
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
	);
}