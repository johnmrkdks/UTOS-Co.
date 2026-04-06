import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	ArrowRight,
	Award,
	ChevronRight,
	Clock,
	Plane,
	Shield,
	Sparkles,
	Star,
	Users,
} from "lucide-react";
import homeHeroVclassPlaza from "@/assets/marketing/home-hero-vclass-plaza.png";
import { InstantQuoteWidget } from "./instant-quote-widget";

type HomeProps = {
	className?: string;
};

const audiences = [
	{
		title: "Business & private",
		description: "Airport, meetings, and city transfers.",
		href: "/services",
		icon: Plane,
	},
	{
		title: "Events & occasions",
		description: "Weddings, concerts, and VIP arrivals.",
		href: "/fleet",
		icon: Sparkles,
	},
	{
		title: "Executive bookings",
		description: "Repeat itineraries and clear confirmations.",
		href: "/contact-us",
		icon: Users,
	},
];

const features = [
	{
		icon: Shield,
		title: "Licensed & insured",
		description: "Commercially licensed chauffeurs and full coverage.",
	},
	{
		icon: Clock,
		title: "Nearly 24/7",
		description: "Mon–Sun 00:00 – 23:45.",
	},
	{
		icon: Award,
		title: "Premium fleet",
		description: "Vehicles maintained to a high standard.",
	},
	{
		icon: Star,
		title: "5-star service",
		description: "Rated highly by our clients.",
	},
];

export function Home({ className, ...props }: HomeProps) {
	return (
		<div {...props} className={cn("relative", className)}>
			{/* Hero */}
			<section className="relative min-h-[26rem] overflow-hidden border-border/40 border-b bg-background md:min-h-[30rem]">
				<div
					className="pointer-events-none absolute inset-0 bg-[position:58%_center] bg-cover bg-no-repeat"
					style={{ backgroundImage: `url(${homeHeroVclassPlaza})` }}
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/92 via-background/45 to-background/25 sm:hidden"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[0%] from-background/95 via-[42%] via-background/55 to-[68%] to-transparent sm:block"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20"
					aria-hidden
				/>

				<div className="container relative z-[1] mx-auto max-w-7xl px-6 py-10 md:py-14 lg:py-16">
					<div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
						<div className="max-w-xl space-y-6">
							<p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Australia
							</p>

							<div className="space-y-3">
								<h1 className="font-sans font-semibold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
									Luxury transport, on your schedule.
								</h1>
								<p className="max-w-md text-base text-muted-foreground leading-relaxed md:text-lg">
									Professional drivers and instant quotes — from first click to
									drop-off.
								</p>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<Link to="/fleet">
									<Button
										size="lg"
										className="h-11 w-full rounded-full px-7 font-semibold sm:w-auto"
									>
										Book your journey
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link to="/services">
									<Button
										size="lg"
										variant="outline"
										className="h-11 w-full rounded-full border-border/80 bg-background/60 sm:w-auto"
									>
										Services
									</Button>
								</Link>
							</div>
						</div>

						<div className="flex w-full flex-col items-stretch justify-center lg:items-end">
							<div className="w-full max-w-sm sm:max-w-md">
								<InstantQuoteWidget className="border-0 shadow-none ring-1 ring-black/5" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Audiences */}
			<section className="py-14 md:py-16">
				<div className="container mx-auto max-w-7xl px-6">
					<h2 className="mb-8 font-sans font-semibold text-2xl text-foreground tracking-tight md:mb-10 md:text-3xl">
						Who we serve
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
						{audiences.map((item) => (
							<Link
								key={item.title}
								to={item.href}
								className="group flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md md:p-6"
							>
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
									<item.icon className="h-5 w-5 text-foreground/80" />
								</div>
								<h3 className="font-semibold text-base text-foreground">
									{item.title}
								</h3>
								<p className="mt-1.5 flex-1 text-muted-foreground text-sm leading-snug">
									{item.description}
								</p>
								<span className="mt-4 inline-flex items-center font-medium text-primary text-sm">
									Learn more
									<ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Why us */}
			<section className="border-border/50 border-y bg-muted/25 py-14 md:py-16">
				<div className="container mx-auto max-w-7xl px-6">
					<h2 className="mb-8 text-center font-sans font-semibold text-2xl text-foreground tracking-tight md:mb-10 md:text-3xl">
						Why Utos & Co.
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6"
							>
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
									<feature.icon className="h-5 w-5 text-foreground/75" />
								</div>
								<h3 className="font-semibold text-base text-foreground">
									{feature.title}
								</h3>
								<p className="mt-1.5 text-muted-foreground text-sm leading-snug">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ — single compact CTA (detail lives on /faqs) */}
			<section className="border-border/50 border-t bg-muted/15 py-12 md:py-14">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border/60 bg-card px-6 py-8 shadow-sm sm:flex-row sm:items-center sm:px-8 md:py-9">
						<div className="max-w-xl">
							<h2 className="font-sans font-semibold text-foreground text-xl tracking-tight md:text-2xl">
								Questions?
							</h2>
							<p className="mt-1 text-muted-foreground text-sm md:text-base">
								Booking, changes, and policies — all in one place.
							</p>
						</div>
						<Link to="/faqs" className="w-full shrink-0 sm:w-auto">
							<Button
								variant="outline"
								className="h-11 w-full rounded-full px-8 sm:w-auto"
							>
								View FAQs
								<ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="pt-6 pb-16 md:pt-8 md:pb-20">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary to-primary/90 px-6 py-10 text-primary-foreground shadow-xl md:px-12 md:py-11">
						<div
							className="-right-16 -top-16 pointer-events-none absolute h-48 w-48 rounded-full bg-white/10 blur-2xl md:h-56 md:w-56"
							aria-hidden
						/>
						<div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
							<div className="max-w-md">
								<h2 className="font-sans font-semibold text-xl tracking-tight md:text-2xl">
									Ready to ride
								</h2>
								<p className="mt-1.5 text-primary-foreground/85 text-sm leading-relaxed md:text-base">
									Fleet, services, or a quote — your choice.
								</p>
							</div>
							<div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
								<Link to="/fleet" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="secondary"
										className="h-11 w-full rounded-full font-semibold sm:min-w-[9rem]"
									>
										Fleet
									</Button>
								</Link>
								<Link to="/contact-us" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="outline"
										className="h-11 w-full rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 sm:min-w-[9rem]"
									>
										Contact
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
