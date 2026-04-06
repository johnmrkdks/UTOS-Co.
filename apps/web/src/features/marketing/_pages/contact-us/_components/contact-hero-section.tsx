import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import contactOfficialFleet from "@/assets/marketing/contact-official-fleet.png";
import { BUSINESS_INFO } from "@/constants/business-info";

export function ContactHeroSection() {
	return (
		<div
			className="relative bg-[center_45%] bg-cover bg-no-repeat py-24 md:py-28"
			style={{ backgroundImage: `url(${contactOfficialFleet})` }}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/78 to-stone-950/88" />
			<div className="container relative z-10 mx-auto px-6 text-center">
				<div className="mx-auto max-w-2xl">
					<p className="mb-3 font-medium text-[0.65rem] text-primary-secondary/95 uppercase tracking-[0.22em]">
						Contact
					</p>

					<h1 className="mb-5 font-semibold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
						Get in touch
					</h1>

					<p className="mx-auto mb-8 max-w-xl text-base text-white/80 leading-relaxed md:text-lg">
						Ready to experience premium transportation? Our dedicated team is
						here to assist you daily from 00:00 – 23:45 with personalized
						service and expert guidance.
					</p>

					<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
						<a href={BUSINESS_INFO.phone.link}>
							<Button
								size="lg"
								className="h-12 rounded-md px-8 font-medium text-primary-foreground"
							>
								Call
							</Button>
						</a>
						<Link to="/fleet">
							<Button
								variant="outline"
								size="lg"
								className="h-12 rounded-md border-white/35 bg-transparent px-8 font-medium text-white hover:bg-white/10"
							>
								Fleet
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
