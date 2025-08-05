import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { InstantQuoteWidget } from "./instant-quote-widget";
import { Star, Shield, Clock, Award } from "lucide-react";

type HomeProps = {
	className?: string;
};

const features = [
	{
		icon: Shield,
		title: "Licensed & Insured",
		description: "Fully licensed chauffeurs with comprehensive insurance coverage"
	},
	{
		icon: Clock,
		title: "Nearly 24/7 Service",
		description: "Available Mon-Sun 00:00 – 23:45 - We are always at your disposal"
	},
	{
		icon: Award,
		title: "Premium Fleet",
		description: "Luxury vehicles maintained to the highest standards"
	},
	{
		icon: Star,
		title: "5-Star Service",
		description: "Exceptional service quality rated by our valued clients"
	}
];

export function Home({ className, ...props }: HomeProps) {
	return (
		<div
			{...props}
			className={cn("relative", className)}
		>
			{/* Hero Section */}
			<div className="relative bg-[url(/src/assets/images/car1.png)] bg-center bg-cover bg-no-repeat min-h-[80vh]">
				{/* Overlay for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/70 to-background/40" />

				<div className="relative z-10 container mx-auto px-6 py-20 min-h-[80vh] flex items-center">
					<div className="grid grid-flow-row grid-cols-1 space-y-10 lg:grid-flow-col lg:grid-cols-3 lg:gap-16 items-center w-full">
						{/* Left Column - Content */}
						<div className="col-span-2 flex flex-col justify-center space-y-8">
							<div className="space-y-6">
								<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-sm font-medium">
									🇦🇺 Sydney's Premier Chauffeur Service
								</div>

								<h1 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
									Premium
									<span className="block text-primary">
										Luxury
									</span>
									Transportation
								</h1>

								<p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
									Elevate your journey with Down Under Chauffeur. Professional drivers,
									premium vehicles, and unparalleled service for discerning clients.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Link to="/booking">
									<Button
										size="lg"
										className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
									>
										Book Your Journey
									</Button>
								</Link>
								<Link to="/services">
									<Button
										variant="outline"
										size="lg"
										className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
									>
										View Services
									</Button>
								</Link>
							</div>

							{/* Trust Indicators */}
							<div className="flex items-center gap-6 pt-6">
								<div className="flex items-center gap-2">
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="w-5 h-5 fill-primary text-primary" />
										))}
									</div>
									<span className="text-sm font-medium text-muted-foreground">5.0 Rating</span>
								</div>
								<div className="h-6 w-px bg-border" />
								<div className="text-sm font-medium text-muted-foreground">1000+ Happy Clients</div>
							</div>
						</div>

						{/* Right Column - Quote Widget */}
						<div className="flex justify-center lg:justify-end w-full">
							<InstantQuoteWidget />
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<section className="bg-beige py-20">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Why Choose Down Under Chauffeur?
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							We set the standard for luxury transportation in Sydney with our commitment
							to excellence, safety, and customer satisfaction.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div
								key={feature.title}
								className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-border"
							>
								<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="w-8 h-8 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-card-foreground mb-3">
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
