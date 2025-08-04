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
		title: "24/7 Availability",
		description: "Round-the-clock service for all your transportation needs"
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
			className={cn("min-h-screen relative overflow-hidden", className)}
		>
			{/* Hero Section */}
			<div className="relative z-10 container mx-auto px-6 py-20">
				<div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
					{/* Left Column - Content */}
					<div className="flex flex-col justify-center space-y-8">
						<div className="space-y-6">
							<div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
								🇦🇺 Sydney's Premier Chauffeur Service
							</div>
							
							<h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
								Experience
								<span className="block text-transparent bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text">
									Luxury
								</span>
								Transportation
							</h1>
							
							<p className="text-xl text-gray-600 leading-relaxed max-w-lg">
								Elevate your journey with Down Under Chauffeur. Professional drivers, 
								premium vehicles, and unparalleled service for discerning clients.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Link to="/booking">
								<Button
									size="lg"
									className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/services">
								<Button
									variant="outline"
									size="lg"
									className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
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
										<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
									))}
								</div>
								<span className="text-sm font-medium text-gray-600">5.0 Rating</span>
							</div>
							<div className="h-6 w-px bg-gray-300" />
							<div className="text-sm font-medium text-gray-600">1000+ Happy Clients</div>
						</div>
					</div>

					{/* Right Column - Quote Widget */}
					<div className="flex justify-center lg:justify-end">
						<InstantQuoteWidget />
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="relative z-10 bg-gray-50 py-20">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Why Choose Down Under Chauffeur?
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							We set the standard for luxury transportation in Sydney with our commitment 
							to excellence, safety, and customer satisfaction.
						</p>
					</div>
					
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div 
								key={feature.title}
								className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
							>
								<div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="w-8 h-8 text-amber-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/30 to-gray-100/50" />
			<div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-amber-300/20 rounded-full blur-3xl" />
			<div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-gray-200/20 to-gray-300/20 rounded-full blur-3xl" />
		</div>
	);
}
