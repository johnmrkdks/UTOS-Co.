import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Award,
	Car,
	Clock,
	Heart,
	Shield,
	Star,
	Target,
	Trophy,
	Users,
} from "lucide-react";
import aboutExecutiveCockpit from "@/assets/marketing/about-executive-cockpit.png";
import { BUSINESS_INFO } from "@/constants/business-info";
import { TrustStatsStrip } from "@/features/marketing/_components/trust-stats-strip";

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

type AboutProps = {
	className?: string;
};

export function AboutUs({ className, ...props }: AboutProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section — executive interior */}
			<div
				className="relative bg-center bg-cover bg-no-repeat py-24 md:py-28"
				style={{ backgroundImage: `url(${aboutExecutiveCockpit})` }}
			>
				<div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/72 to-amber-950/65" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-3xl">
						<p className="mb-3 font-medium text-[0.65rem] text-primary-secondary/95 uppercase tracking-[0.22em]">
							About
						</p>

						<h1 className="mb-5 font-semibold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
							Our story
						</h1>

						<p className="mx-auto max-w-2xl text-base text-white/80 leading-relaxed md:text-lg">
							Founded on the principles of luxury, reliability, and exceptional
							service,
							{BUSINESS_INFO.business.name} has become Sydney's most trusted
							premium transportation partner.
						</p>
					</div>
				</div>
			</div>

			<TrustStatsStrip />

			{/* About Utos & Co. */}
			<div className="bg-muted/20 py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-2 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Utos & Co.
						</h2>
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						{/* Our History */}
						<div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
							<div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-muted/60">
								<Clock className="h-5 w-5 text-foreground/80" />
							</div>
							<h3 className="mb-3 font-semibold text-card-foreground text-lg tracking-tight">
								History
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
						<div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
							<div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-muted/60">
								<Car className="h-5 w-5 text-foreground/80" />
							</div>
							<h3 className="mb-3 font-semibold text-card-foreground text-lg tracking-tight">
								Fleet
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								We have a diverse fleet of vehicles to meet your transportation
								needs, ranging from luxury sedans to spacious vans. Our vehicles
								are regularly maintained and kept clean for your comfort.
							</p>
						</div>

						{/* Our Drivers */}
						<div className="rounded-xl border border-border/60 bg-card p-6 md:p-8">
							<div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-muted/60">
								<Users className="h-5 w-5 text-foreground/80" />
							</div>
							<h3 className="mb-3 font-semibold text-card-foreground text-lg tracking-tight">
								Drivers
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Our drivers are experienced and professional, ensuring that you
								arrive at your destination safely and on time. They undergo
								regular training and background checks to ensure your safety.
							</p>
						</div>
					</div>

					<div className="mt-10 text-center">
						<Link to="/services">
							<Button size="lg" className="h-11 rounded-md px-8 font-medium">
								View services
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Our Values */}
			<div className="bg-background py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Values
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							These fundamental principles guide every decision we make and
							every service we provide, ensuring consistent excellence in all we
							do.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{values.map((value) => (
							<div
								key={value.title}
								className="rounded-xl border border-border/60 bg-card p-6 text-center"
							>
								<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
									<value.icon className="h-5 w-5 text-foreground/80" />
								</div>
								<h3 className="mb-2 font-semibold text-base text-card-foreground">
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
			<div className="bg-muted/20 py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							At a glance
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							Numbers that reflect our commitment to excellence and the trust
							our clients place in us every day.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{achievements.map((achievement) => (
							<div
								key={achievement.title}
								className="rounded-xl border border-border/60 bg-card p-6 text-center"
							>
								<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
									<achievement.icon className="h-5 w-5 text-foreground/80" />
								</div>
								<div className="mb-1 font-semibold text-3xl text-foreground tabular-nums tracking-tight">
									{achievement.number}
								</div>
								<h3 className="mb-2 font-medium text-foreground text-sm">
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
			<div className="bg-background py-16 md:py-24">
				<div className="container mx-auto px-6">
					<div className="mb-12 text-center md:mb-16">
						<h2 className="mb-3 font-semibold text-2xl text-foreground tracking-tight md:text-3xl">
							Team
						</h2>
						<p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
							The experienced professionals behind Utos & Co.'s success,
							dedicated to delivering exceptional service every day.
						</p>
					</div>

					<div className="rounded-xl border border-border/60 border-dashed bg-muted/20 px-6 py-16 text-center">
						<p className="text-muted-foreground text-sm leading-relaxed">
							Team profiles will appear here once they are added.
						</p>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-primary py-16 md:py-24">
				<div className="container mx-auto px-6 text-center">
					<div className="mx-auto max-w-2xl">
						<h2 className="mb-4 font-semibold text-2xl text-primary-foreground tracking-tight md:text-3xl">
							Travel with us
						</h2>
						<p className="mb-8 text-base text-primary-foreground/85 leading-relaxed md:text-lg">
							Join thousands of satisfied clients who have discovered why{" "}
							{BUSINESS_INFO.business.name}
							is Sydney's premier choice for luxury transportation.
						</p>

						<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
							<Link to="/fleet">
								<Button
									size="lg"
									className="h-12 rounded-md bg-background px-8 font-medium text-foreground hover:bg-background/95"
								>
									Fleet
								</Button>
							</Link>
							<Link to="/contact-us">
								<Button
									variant="outline"
									size="lg"
									className="h-12 rounded-md border-primary-foreground/35 bg-transparent px-8 font-medium text-primary-foreground hover:bg-primary-foreground/10"
								>
									Contact
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
