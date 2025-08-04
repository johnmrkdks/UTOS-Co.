import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import {
	Shield,
	Award,
	Users,
	Star,
	Clock,
	Car,
	Heart,
	Target,
	Trophy,
	MapPin
} from "lucide-react";

const values = [
	{
		icon: Shield,
		title: "Safety First",
		description: "Your safety is our top priority. All our chauffeurs undergo comprehensive background checks and regular training to ensure the highest safety standards."
	},
	{
		icon: Award,
		title: "Excellence",
		description: "We strive for excellence in every aspect of our service, from our immaculate vehicles to our professional chauffeurs and seamless booking experience."
	},
	{
		icon: Heart,
		title: "Customer Care",
		description: "We genuinely care about our clients and go above and beyond to ensure every journey exceeds expectations and creates lasting positive memories."
	},
	{
		icon: Target,
		title: "Reliability",
		description: "Punctuality and dependability are at the core of our service. We track flights, monitor traffic, and ensure you reach your destination on time."
	}
];

const achievements = [
	{
		icon: Trophy,
		number: "1000+",
		title: "Happy Clients",
		description: "Satisfied customers who trust us with their transportation needs"
	},
	{
		icon: Star,
		number: "5.0",
		title: "Average Rating",
		description: "Consistently excellent service rated by our valued clients"
	},
	{
		icon: Car,
		number: "15+",
		title: "Premium Vehicles",
		description: "Diverse fleet of luxury vehicles maintained to perfection"
	},
	{
		icon: Clock,
		number: "24/7",
		title: "Service Available",
		description: "Round-the-clock availability for all your transportation needs"
	}
];

const team = [
	{
		name: "Michael Chen",
		role: "Founder & CEO",
		experience: "15+ years in luxury transportation",
		description: "Passionate about delivering exceptional service and building lasting client relationships."
	},
	{
		name: "Sarah Williams",
		role: "Operations Manager",
		experience: "10+ years in hospitality",
		description: "Ensures every detail of your journey is perfectly orchestrated for maximum comfort."
	},
	{
		name: "David Thompson",
		role: "Head Chauffeur",
		experience: "20+ years professional driving",
		description: "Leads our team of chauffeurs with expertise in luxury service and Sydney navigation."
	}
];

type AboutProps = {
	className?: string;
};

export function About({ className, ...props }: AboutProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
				<div className="absolute inset-0 bg-black/20" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
							<MapPin className="w-4 h-4 mr-2" />
							Sydney's Premier Luxury Transportation
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
							Our Story of
							<span className="block text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
								Excellence
							</span>
						</h1>

						<p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
							Founded on the principles of luxury, reliability, and exceptional service,
							Down Under Chauffeur has become Sydney's most trusted premium transportation partner.
						</p>
					</div>
				</div>
			</div>

			{/* Our Story */}
			<div className="py-24 bg-white">
				<div className="container mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-4xl font-bold text-gray-900 mb-6">
								Crafting Exceptional Journeys Since 2020
							</h2>
							<div className="space-y-6 text-gray-600 leading-relaxed">
								<p className="text-lg">
									What began as a vision to transform luxury transportation in Sydney
									has evolved into the city's most trusted chauffeur service. Founded by
									industry veterans with over two decades of combined experience, Down Under
									Chauffeur was born from a simple belief: every journey should be extraordinary.
								</p>
								<p>
									We recognized that busy professionals, discerning travelers, and those
									celebrating life's special moments deserved more than just transportation –
									they deserved an experience that reflected their values and elevated their day.
								</p>
								<p>
									Today, we're proud to serve over 1000 satisfied clients, from CEOs and
									celebrities to families celebrating milestones. Our commitment to excellence
									has earned us a perfect 5-star rating and the trust of Sydney's most
									discerning clientele.
								</p>
							</div>

							<div className="mt-8">
								<Link to="/services">
									<Button
										size="lg"
										className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 text-lg font-semibold rounded-xl"
									>
										Explore Our Services
									</Button>
								</Link>
							</div>
						</div>

						<div className="relative">
							<div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center">
								<Car className="w-32 h-32 text-amber-600" />
							</div>
							<div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
								<Heart className="w-8 h-8 text-gray-600" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Our Values */}
			<div className="py-24 bg-gray-50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Our Core Values
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							These fundamental principles guide every decision we make and every
							service we provide, ensuring consistent excellence in all we do.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{values.map((value, index) => (
							<div
								key={value.title}
								className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
							>
								<div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<value.icon className="w-8 h-8 text-amber-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-4">
									{value.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Achievements */}
			<div className="py-24 bg-white">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Our Achievements
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Numbers that reflect our commitment to excellence and the trust
							our clients place in us every day.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{achievements.map((achievement, index) => (
							<div
								key={achievement.title}
								className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300"
							>
								<div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<achievement.icon className="w-8 h-8 text-white" />
								</div>
								<div className="text-4xl font-bold text-amber-600 mb-2">
									{achievement.number}
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{achievement.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{achievement.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Leadership Team */}
			<div className="py-24 bg-gray-50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Meet Our Leadership Team
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							The experienced professionals behind Down Under Chauffeur's success,
							dedicated to delivering exceptional service every day.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{team.map((member, index) => (
							<div
								key={member.name}
								className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
							>
								<div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
									<Users className="w-10 h-10 text-gray-500" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									{member.name}
								</h3>
								<div className="text-amber-600 font-semibold mb-2">
									{member.role}
								</div>
								<div className="text-sm text-gray-500 mb-4">
									{member.experience}
								</div>
								<p className="text-gray-600 leading-relaxed">
									{member.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-24 bg-gradient-to-br from-amber-600 to-amber-800">
				<div className="container mx-auto px-6 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-4xl font-bold text-white mb-6">
							Experience the Down Under Difference
						</h2>
						<p className="text-xl text-amber-100 mb-8 leading-relaxed">
							Join thousands of satisfied clients who have discovered why Down Under Chauffeur
							is Sydney's premier choice for luxury transportation.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/booking">
								<Button
									size="lg"
									className="bg-white text-amber-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
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
