import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
	Plane,
	Building,
	MapPin,
	Users,
	Star,
	Clock,
	Shield,
	Car,
	Sparkles,
	Calendar
} from "lucide-react";

const services = [
	{
		icon: Plane,
		title: "Airport Transfers",
		description: "Seamless pickups and drop-offs from Sydney Airport with flight tracking and meet & greet service.",
		features: ["Flight tracking", "Meet & greet", "Luggage assistance", "Multiple terminals"],
		price: "From $85",
		popular: true
	},
	{
		icon: Building,
		title: "Corporate Travel",
		description: "Professional transportation for business meetings, conferences, and corporate events.",
		features: ["Executive vehicles", "Flexible scheduling", "Business amenities", "Invoice billing"],
		price: "From $95",
		popular: false
	},
	{
		icon: MapPin,
		title: "City Tours",
		description: "Discover Sydney's iconic landmarks with our knowledgeable chauffeurs as your personal guides.",
		features: ["Custom itineraries", "Expert local guides", "Photo stops", "Flexible duration"],
		price: "From $120",
		popular: false
	},
	{
		icon: Users,
		title: "Special Events",
		description: "Arrive in style for weddings, galas, proms, and other special occasions.",
		features: ["Red carpet service", "Luxury fleet", "Event coordination", "Group bookings"],
		price: "From $150",
		popular: false
	},
	{
		icon: Calendar,
		title: "Hourly Charter",
		description: "Flexible hourly rates for multiple stops, shopping trips, or extended city exploration.",
		features: ["Flexible timing", "Multiple stops", "Wait time included", "Personal chauffeur"],
		price: "From $80/hr",
		popular: false
	},
	{
		icon: Sparkles,
		title: "VIP Experience",
		description: "Ultimate luxury service with premium vehicles and white-glove treatment.",
		features: ["Premium fleet", "Concierge service", "Champagne service", "Priority booking"],
		price: "Custom pricing",
		popular: false
	}
];

const fleetHighlights = [
	{
		name: "Mercedes S-Class",
		type: "Executive Sedan",
		passengers: "1-3",
		image: "/images/mercedes-s-class.jpg"
	},
	{
		name: "BMW 7 Series",
		type: "Luxury Sedan",
		passengers: "1-3",
		image: "/images/bmw-7-series.jpg"
	},
	{
		name: "Mercedes V-Class",
		type: "Luxury Van",
		passengers: "1-6",
		image: "/images/mercedes-v-class.jpg"
	}
];

type ServicesProps = {
	className?: string;
};

export function Services({ className, ...props }: ServicesProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-[url('/src/assets/images/car3.jpeg')] bg-center bg-cover bg-no-repeat">
				<div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/75 to-foreground/70" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-xs md:text-sm font-medium mb-6">
							<Sparkles className="w-4 h-4 mr-2" />
							Premium Transportation Services
						</div>

						<h1 className="text-4xl lg:text-6xl font-bold text-background mb-6">
							Luxury Transportation
							<span className="block text-primary-secondary">
								Tailored for You
							</span>
						</h1>

						<p className="text-lg md:text-xl text-background/80 leading-relaxed max-w-3xl mx-auto mb-8">
							From airport transfers to special events, our comprehensive range of services
							ensures you travel in comfort, style, and punctuality every time.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/booking">
								<Button
									size="lg"
									className="bg-primary hover:bg-soft-beige px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Now
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="border-background/20 text-primary hover:bg-background/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Get Quote
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Services Grid */}
			<div className="py-24 bg-background">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Premium Services
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Choose from our comprehensive range of luxury transportation services,
							each designed to exceed your expectations.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{services.map((service, index) => (
							<div
								key={service.title}
								className={cn(
									"relative bg-card border-2 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group hover:shadow-xl",
									service.popular ? "border-primary shadow-lg" : "border-border"
								)}
							>
								{service.popular && (
									<div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
										Most Popular
									</div>
								)}

								<div className="flex items-center mb-6">
									<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
										<service.icon className="w-7 h-7 text-primary" />
									</div>
									<div>
										<h3 className="text-xl font-bold text-card-foreground mb-1">
											{service.title}
										</h3>
										<div className="text-2xl font-bold text-primary">
											{service.price}
										</div>
									</div>
								</div>

								<p className="text-muted-foreground mb-6 leading-relaxed">
									{service.description}
								</p>

								<ul className="space-y-3 mb-8">
									{service.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-center text-muted-foreground">
											<div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3">
												<div className="w-2 h-2 bg-primary rounded-full" />
											</div>
											{feature}
										</li>
									))}
								</ul>

								<Link to="/booking">
									<Button
										className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300"
									>
										Book This Service
									</Button>
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Fleet Showcase */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Premium Fleet
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Experience luxury and comfort with our meticulously maintained fleet
							of premium vehicles, each equipped with modern amenities.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{fleetHighlights.map((vehicle, index) => (
							<div
								key={vehicle.name}
								className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-border"
							>
								<div className="h-48 bg-muted flex items-center justify-center">
									<Car className="w-16 h-16 text-muted-foreground" />
								</div>

								<div className="p-6">
									<div className="flex justify-between items-start mb-3">
										<div>
											<h3 className="text-xl font-bold text-card-foreground">
												{vehicle.name}
											</h3>
											<p className="text-primary font-semibold">
												{vehicle.type}
											</p>
										</div>
										<div className="text-right">
											<div className="flex items-center text-muted-foreground">
												<Users className="w-4 h-4 mr-1" />
												{vehicle.passengers}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Why Choose Us */}
			<div className="py-24 bg-background">
				<div className="container mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-4xl font-bold text-foreground mb-6">
								Why Choose Down Under Chauffeur?
							</h2>
							<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
								We're not just a transportation service – we're your partners in creating
								exceptional travel experiences that reflect your style and priorities.
							</p>

							<div className="space-y-6">
								{[
									{
										icon: Shield,
										title: "Licensed & Insured",
										description: "Fully licensed chauffeurs with comprehensive insurance coverage for your peace of mind."
									},
									{
										icon: Clock,
										title: "Punctual Service",
										description: "We track flights and traffic to ensure you arrive at your destination on time, every time."
									},
									{
										icon: Star,
										title: "5-Star Experience",
										description: "Premium service quality that has earned us a 5-star rating from over 1000 satisfied clients."
									}
								].map((benefit, index) => (
									<div key={benefit.title} className="flex items-start">
										<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 mt-1">
											<benefit.icon className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-foreground mb-2">
												{benefit.title}
											</h3>
											<p className="text-muted-foreground leading-relaxed">
												{benefit.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="relative">
							<div className="aspect-square bg-primary/10 rounded-3xl flex items-center justify-center">
								<Car className="w-32 h-32 text-primary" />
							</div>
							<div className="absolute -bottom-6 -right-6 w-24 h-24 bg-muted rounded-2xl flex items-center justify-center">
								<Sparkles className="w-8 h-8 text-muted-foreground" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-24 bg-primary">
				<div className="container mx-auto px-6 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-4xl font-bold text-white mb-6">
							Ready to Experience Luxury Transportation?
						</h2>
						<p className="text-xl text-white/80 mb-8 leading-relaxed">
							Book your premium chauffeur service today and discover why discerning
							clients choose Down Under Chauffeur for their transportation needs.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/booking">
								<Button
									size="lg"
									className="bg-white text-primary hover:bg-beige px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="border-white/20 text-primary hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Contact Us
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
