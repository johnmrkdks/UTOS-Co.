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
		number: "23:45",
		title: "Daily Service",
		description: "Available Mon-Sun 00:00 – 23:45 - We are always at your disposal"
	}
];

const team = [
	{
		name: "Name Here",
		role: "Founder & CEO",
		experience: "15+ years in luxury transportation",
		description: "Passionate about delivering exceptional service and building lasting client relationships."
	},
	{
		name: "Name Here",
		role: "Operations Manager",
		experience: "10+ years in hospitality",
		description: "Ensures every detail of your journey is perfectly orchestrated for maximum comfort."
	},
	{
		name: "Name Here",
		role: "Head Chauffeur",
		experience: "20+ years professional driving",
		description: "Leads our team of chauffeurs with expertise in luxury service and Sydney navigation."
	}
];

type AboutProps = {
	className?: string;
};

export function AboutUs({ className, ...props }: AboutProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-foreground via-foreground/90 to-primary/20 bg-[url('/src/assets/images/car2.jpeg')] bg-center bg-cover bg-no-repeat">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-sm font-medium mb-6">
							<MapPin className="w-4 h-4 mr-2" />
							Sydney's Premier Luxury Transportation
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold text-beige mb-6">
							Our Story of
							<span className="block text-primary">
								Excellence
							</span>
						</h1>

						<p className="text-xl text-beige/80 leading-relaxed max-w-3xl mx-auto">
							Founded on the principles of luxury, reliability, and exceptional service,
							Down Under Chauffeur has become Sydney's most trusted premium transportation partner.
						</p>
					</div>
				</div>
			</div>

			{/* About Down Under Chauffeurs */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							About Down Under Chauffeurs
						</h2>
					</div>

					<div className="grid lg:grid-cols-3 gap-12">
						{/* Our History */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
								<Clock className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-card-foreground mb-4">
								Our History
							</h3>
							<div className="space-y-4 text-muted-foreground leading-relaxed">
								<p>
									Founded in 2020, downunderchauffeurs started as a small transportation service for local events. Over the years, we have expanded our services to include airport transportation and corporate travel.
								</p>
								<p className="font-medium text-primary">
									Airport transfers Sydney luxury chauffeur service
								</p>
							</div>
						</div>

						{/* Our Fleet */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
								<Car className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-card-foreground mb-4">
								Our Fleet
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								We have a diverse fleet of vehicles to meet your transportation needs, ranging from luxury sedans to spacious vans. Our vehicles are regularly maintained and kept clean for your comfort.
							</p>
						</div>

						{/* Our Drivers */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
							<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
								<Users className="w-8 h-8 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-card-foreground mb-4">
								Our Drivers
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Our drivers are experienced and professional, ensuring that you arrive at your destination safely and on time. They undergo regular training and background checks to ensure your safety.
							</p>
						</div>
					</div>

					<div className="text-center mt-12">
						<Link to="/services">
							<Button
								size="lg"
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
							>
								Explore Our Services
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Our Values */}
			<div className="py-24 bg-soft-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Core Values
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							These fundamental principles guide every decision we make and every
							service we provide, ensuring consistent excellence in all we do.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{values.map((value, index) => (
							<div
								key={value.title}
								className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-border"
							>
								<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<value.icon className="w-8 h-8 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-card-foreground mb-4">
									{value.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Achievements */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Our Achievements
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Numbers that reflect our commitment to excellence and the trust
							our clients place in us every day.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{achievements.map((achievement, index) => (
							<div
								key={achievement.title}
								className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 border border-primary/20"
							>
								<div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<achievement.icon className="w-8 h-8 text-primary-foreground" />
								</div>
								<div className="text-4xl font-bold text-primary mb-2">
									{achievement.number}
								</div>
								<h3 className="text-xl font-bold text-foreground mb-3">
									{achievement.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{achievement.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Leadership Team */}
			<div className="py-24 bg-soft-beige">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-foreground mb-4">
							Meet Our Leadership Team
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							The experienced professionals behind Down Under Chauffeur's success,
							dedicated to delivering exceptional service every day.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{team.map((member, index) => (
							<div
								key={member.name}
								className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-border"
							>
								<div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
									<Users className="w-10 h-10 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-card-foreground mb-2">
									{member.name}
								</h3>
								<div className="text-primary font-semibold mb-2">
									{member.role}
								</div>
								<div className="text-sm text-muted-foreground mb-4">
									{member.experience}
								</div>
								<p className="text-muted-foreground leading-relaxed">
									{member.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-24 bg-gradient-to-br from-primary to-primary/80">
				<div className="container mx-auto px-6 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-4xl font-bold text-primary-foreground mb-6">
							Experience the Down Under Difference
						</h2>
						<p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
							Join thousands of satisfied clients who have discovered why Down Under Chauffeur
							is Sydney's premier choice for luxury transportation.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/booking">
								<Button
									size="lg"
									className="bg-beige text-foreground hover:bg-beige/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="border-primary-foreground/20 text-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg font-semibold rounded-xl"
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
