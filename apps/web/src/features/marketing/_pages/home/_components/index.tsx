import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Award, Clock, Shield, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstantQuoteWidget } from "./instant-quote-widget";

type HomeProps = {
	className?: string;
};

const features = [
	{
		icon: Shield,
		title: "Licensed & Insured",
		description:
			"Fully licensed chauffeurs with comprehensive insurance coverage",
	},
	{
		icon: Clock,
		title: "Nearly 24/7 Service",
		description:
			"Available Mon-Sun 00:00 – 23:45 - We are always at your disposal",
	},
	{
		icon: Award,
		title: "Premium Fleet",
		description: "Luxury vehicles maintained to the highest standards",
	},
	{
		icon: Star,
		title: "5-Star Service",
		description: "Exceptional service quality rated by our valued clients",
	},
];

export function Home({ className, ...props }: HomeProps) {
	const isMobile = useIsMobile();

	return (
		<div {...props} className={cn("relative", className)}>
			{/* Hero Section */}
			<div className="relative min-h-[80vh] bg-[url(/src/assets/images/car1.png)] bg-center bg-cover bg-gradient-to-r from-background/60 via-background/70 to-background/40 bg-no-repeat">
				{/* Overlay for better text readability */}
				<div className="absolute inset-0 bg-foreground/70" />

				<div className="container relative z-10 mx-auto flex min-h-[80vh] items-center px-6 py-10 md:py-20">
					<div className="grid w-full grid-flow-row grid-cols-1 items-center space-y-10 lg:grid-flow-col lg:grid-cols-3 lg:gap-16">
						{/* Left Column - Content */}
						<div className="col-span-2 flex flex-col justify-center space-y-8">
							<div className="space-y-6">
								<div className="group inline-flex items-center rounded-full border border-beige/20 bg-beige/10 px-4 py-1.5 font-medium text-beige text-xs shadow-2xl backdrop-blur-xl transition-all duration-500 hover:bg-beige/20 hover:shadow-amber-500/20 md:text-sm">
									<span className="mr-2 text-base transition-transform duration-300 group-hover:scale-110">
										🇦🇺
									</span>
									<span className="bg-gradient-to-r from-beige to-amber-100 bg-clip-text font-semibold text-transparent tracking-wide">
										Sydney's Premier Chauffeur Service
									</span>
									<div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/10 via-transparent to-amber-200/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
								</div>

								<h1 className="font-bold font-serif text-4xl text-beige leading-tight lg:text-7xl">
									Premium
									<span className="block text-primary-secondary italic">
										Luxury
									</span>
									Transportation
								</h1>

								<p className="max-w-lg text-background/80 text-base leading-relaxed md:text-xl">
									Elevate your journey with Down Under Chauffeur. Professional
									drivers, premium vehicles, and unparalleled service for
									discerning clients.
								</p>
							</div>

							<div className="flex flex-col gap-4 sm:flex-row">
								<Link to="/fleet">
									<Button className="rounded-xl bg-primary px-4.5 py-5 font-semibold text-base text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl md:px-8 md:py-6 md:text-lg">
										Book Your Journey
									</Button>
								</Link>
								<Link to="/services">
									<Button
										variant="outline"
										className="rounded-xl border-background/20 px-4.5 py-5 font-semibold text-base text-primary transition-all duration-300 hover:bg-background/10 md:px-8 md:py-6 md:text-lg"
									>
										View Services
									</Button>
								</Link>
							</div>

							{/* Trust Indicators */}
							<div className="flex items-center gap-6 pt-6">
								<div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className="h-5 w-5 fill-primary-secondary text-primary-secondary"
											/>
										))}
									</div>
									<span className="font-medium text-background/70 text-sm">
										5.0 Rating
									</span>
								</div>
								<div className="h-6 w-px bg-background/30" />
								<div className="font-medium text-background/70 text-sm">
									1000+ Happy Clients
								</div>
							</div>
						</div>

						{/* Right Column - Quote Widget */}
						<div className="flex w-full justify-center lg:justify-end">
							<InstantQuoteWidget />
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<section className="bg-beige py-20">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Why Choose Down Under Chauffeur?
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							We set the standard for luxury transportation in Sydney with our
							commitment to excellence, safety, and customer satisfaction.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<div
								key={feature.title}
								className="group rounded-2xl border border-border bg-card p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
									<feature.icon className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-3 font-bold text-card-foreground text-xl">
									{feature.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
