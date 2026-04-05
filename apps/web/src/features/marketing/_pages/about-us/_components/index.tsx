import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Award,
	Car,
	Clock,
	Heart,
	MapPin,
	Shield,
	Star,
	Target,
	Trophy,
	Users,
} from "lucide-react";
import driverImage from "@/assets/people/driver.jpeg";

// Team member images
import founderImage from "@/assets/people/founder.jpeg";
import omImage from "@/assets/people/om.jpeg";
import { BUSINESS_INFO } from "@/constants/business-info";

const values = [
	{
		icon: Shield,
		title: "Safety First",
		description:
			"Your safety is our top priority. All our chauffeurs undergo comprehensive background checks and regular training to ensure the highest safety standards.",
	},
	{
		icon: Award,
		title: "Excellence",
		description:
			"We strive for excellence in every aspect of our service, from our immaculate vehicles to our professional chauffeurs and seamless booking experience.",
	},
	{
		icon: Heart,
		title: "Customer Care",
		description:
			"We genuinely care about our clients and go above and beyond to ensure every journey exceeds expectations and creates lasting positive memories.",
	},
	{
		icon: Target,
		title: "Reliability",
		description:
			"Punctuality and dependability are at the core of our service. We track flights, monitor traffic, and ensure you reach your destination on time.",
	},
];

const achievements = [
	{
		icon: Trophy,
		number: "1000+",
		title: "Happy Clients",
		description:
			"Satisfied customers who trust us with their transportation needs",
	},
	{
		icon: Star,
		number: "5.0",
		title: "Average Rating",
		description: "Consistently excellent service rated by our valued clients",
	},
	{
		icon: Car,
		number: "15+",
		title: "Premium Vehicles",
		description: "Diverse fleet of luxury vehicles maintained to perfection",
	},
	{
		icon: Clock,
		number: "23:45",
		title: "Daily Service",
		description:
			"Available Mon-Sun 00:00 – 23:45 - We are always at your disposal",
	},
];

const team = [
	{
		name: "Kris Dana",
		role: "Founder & CEO",
		image: founderImage,
	},
	{
		name: "John Mark Bagamaspad",
		role: "Operations Manager/IT",
		image: omImage,
	},
	{
		name: "John Stoj",
		role: "Head Driver",
		image: driverImage,
	},
];

type AboutProps = {
	className?: string;
};

export function AboutUs({ className, ...props }: AboutProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative bg-[url('/src/assets/images/car2.jpeg')] bg-center bg-cover bg-no-repeat py-24">
				<div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/75 to-foreground/70" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-beige px-4 py-2 font-medium text-foreground text-xs md:text-sm">
							<MapPin className="mr-2 h-4 w-4" />
							Sydney's Premier Luxury Transportation
						</div>

						<h1 className="mb-6 font-bold text-4xl text-white lg:text-6xl">
							Our Story of
							<span className="block text-primary-secondary">Excellence</span>
						</h1>

						<p className="mx-auto max-w-3xl text-lg text-white/80 leading-relaxed md:text-xl">
							Founded on the principles of luxury, reliability, and exceptional
							service,
							{BUSINESS_INFO.business.name} has become Sydney's most trusted
							premium transportation partner.
						</p>
					</div>
				</div>
			</div>

			{/* About Utos & Co. */}
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							About Utos & Co.
						</h2>
					</div>

					<div className="grid gap-12 lg:grid-cols-3">
						{/* Our History */}
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<Clock className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-2xl text-card-foreground">
								Our History
							</h3>
							<div className="space-y-4 text-muted-foreground leading-relaxed">
								<p>
									Founded in {BUSINESS_INFO.business.foundedYear},{" "}
									{BUSINESS_INFO.business.name.toLowerCase()} started as a small
									transportation service for local events. Over the years, we
									have expanded our services to include airport transportation
									and corporate travel.
								</p>
								<p className="font-medium text-primary">
									Airport transfers Sydney luxury chauffeur service
								</p>
							</div>
						</div>

						{/* Our Fleet */}
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<Car className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-2xl text-card-foreground">
								Our Fleet
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								We have a diverse fleet of vehicles to meet your transportation
								needs, ranging from luxury sedans to spacious vans. Our vehicles
								are regularly maintained and kept clean for your comfort.
							</p>
						</div>

						{/* Our Drivers */}
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<Users className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-4 font-bold text-2xl text-card-foreground">
								Our Drivers
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Our drivers are experienced and professional, ensuring that you
								arrive at your destination safely and on time. They undergo
								regular training and background checks to ensure your safety.
							</p>
						</div>
					</div>

					<div className="mt-12 text-center">
						<Link to="/services">
							<Button
								size="lg"
								className="rounded-xl bg-primary px-8 py-4 font-semibold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
							>
								Explore Our Services
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Our Values */}
			<div className="bg-soft-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Our Core Values
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							These fundamental principles guide every decision we make and
							every service we provide, ensuring consistent excellence in all we
							do.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{values.map((value, index) => (
							<div
								key={value.title}
								className="group rounded-2xl border border-border bg-card p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
									<value.icon className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-4 font-bold text-card-foreground text-xl">
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
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Our Achievements
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							Numbers that reflect our commitment to excellence and the trust
							our clients place in us every day.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{achievements.map((achievement, index) => (
							<div
								key={achievement.title}
								className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center transition-all duration-300 hover:from-primary/10 hover:to-primary/20"
							>
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80">
									<achievement.icon className="h-8 w-8 text-primary-foreground" />
								</div>
								<div className="mb-2 font-bold text-4xl text-primary">
									{achievement.number}
								</div>
								<h3 className="mb-3 font-bold text-foreground text-xl">
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
			<div className="bg-soft-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Meet Our Leadership Team
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							The experienced professionals behind Utos & Co.'s success,
							dedicated to delivering exceptional service every day.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{team.map((member, index) => (
							<div
								key={member.name}
								className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								<div className="mx-auto mb-6 h-40 w-32 overflow-hidden rounded-2xl shadow-lg">
									<img
										src={member.image}
										alt={`${member.name} - ${member.role}`}
										className="h-full w-full object-cover object-center"
									/>
								</div>
								<h3 className="mb-2 font-bold text-card-foreground text-xl">
									{member.name}
								</h3>
								<div className="font-semibold text-primary">{member.role}</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-gradient-to-br from-primary to-primary/80 py-24">
				<div className="container mx-auto px-6 text-center">
					<div className="mx-auto max-w-3xl">
						<h2 className="mb-6 font-bold text-4xl text-primary-foreground">
							Experience the Utos Difference
						</h2>
						<p className="mb-8 text-primary-foreground/80 text-xl leading-relaxed">
							Join thousands of satisfied clients who have discovered why{" "}
							{BUSINESS_INFO.business.name}
							is Sydney's premier choice for luxury transportation.
						</p>

						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Link to="/fleet">
								<Button
									size="lg"
									className="rounded-xl bg-beige px-8 py-6 font-semibold text-foreground text-lg shadow-lg transition-all duration-300 hover:bg-beige/90 hover:shadow-xl"
								>
									Book Your Journey
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="rounded-xl border-primary-foreground/20 px-8 py-6 font-semibold text-foreground text-lg hover:bg-primary-foreground/10"
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
