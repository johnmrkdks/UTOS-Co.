import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	ArrowRight,
	Award,
	Car,
	CheckCircle2,
	ChevronRight,
	Clock,
	Plane,
	Shield,
	Sparkles,
	Star,
	Users,
} from "lucide-react";
import { InstantQuoteWidget } from "./instant-quote-widget";

type HomeProps = {
	className?: string;
};

const stats = [
	{ label: "Average rating", value: "5.0" },
	{ label: "Happy clients", value: "1000+" },
	{ label: "Vehicles", value: "15+" },
];

const audiences = [
	{
		title: "Business & private travellers",
		description:
			"Airport runs, meetings, and city-to-city transfers with calm, on-time service.",
		href: "/services",
		icon: Plane,
	},
	{
		title: "Events & special occasions",
		description:
			"Weddings, concerts, and VIP arrivals — coordinated timing and discretion.",
		href: "/fleet",
		icon: Sparkles,
	},
	{
		title: "Executive & EA bookings",
		description:
			"Repeat itineraries, multiple travellers, and clear confirmations every time.",
		href: "/contact-us",
		icon: Users,
	},
];

const features = [
	{
		icon: Shield,
		title: "Licensed & insured",
		description:
			"Fully licensed chauffeurs with comprehensive insurance coverage.",
	},
	{
		icon: Clock,
		title: "Nearly 24/7 service",
		description:
			"Available Mon–Sun 00:00 – 23:45 — we are always at your disposal.",
	},
	{
		icon: Award,
		title: "Premium fleet",
		description: "Luxury vehicles maintained to the highest standards.",
	},
	{
		icon: Star,
		title: "5-star experience",
		description: "Exceptional service quality rated by our valued clients.",
	},
];

const howWeHelp = [
	{
		title: "Clear confirmations",
		body: "Know your trip is locked in with email confirmation and predictable pickup details.",
	},
	{
		title: "Professional drivers",
		body: "Courteous, punctual chauffeurs focused on safety and a smooth ride.",
	},
	{
		title: "Flexible routing",
		body: "Add stops where you need them and adjust details before you confirm.",
	},
];

const faqTeaser = [
	{
		q: "Can I book for someone else?",
		a: "Yes — add passenger details in the booking flow or contact us for account-style arrangements.",
	},
	{
		q: "What if my plans change?",
		a: "Cancellation and change rules depend on your booking — see FAQs for the full policy.",
	},
	{
		q: "Do you do airport transfers?",
		a: "Yes. Enter your pickup and terminal or destination to get an instant quote.",
	},
];

export function Home({ className, ...props }: HomeProps) {
	return (
		<div {...props} className={cn("relative", className)}>
			{/* Hero — split layout (RideMinder-style copy + COD-style quote panel) */}
			<section className="relative overflow-hidden border-border/40 border-b bg-gradient-to-b from-background via-muted/25 to-background">
				<div
					className="-right-32 -top-24 pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-primary/[0.06] blur-3xl"
					aria-hidden
				/>
				<div
					className="-left-24 pointer-events-none absolute bottom-0 h-[280px] w-[280px] rounded-full bg-chart-4/[0.12] blur-3xl"
					aria-hidden
				/>

				<div className="container relative z-[1] mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-20">
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
						<div className="max-w-xl space-y-8">
							<div className="inline-flex max-w-full items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/40 px-4 py-3 shadow-sm ring-1 ring-black/[0.04]">
								<span
									className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-inner"
									aria-hidden
								>
									<Car className="h-5 w-5 opacity-95" strokeWidth={2} />
								</span>
								<span className="min-w-0 text-left">
									<span className="block font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.22em]">
										Premium chauffeur
									</span>
									<span className="block font-medium text-base text-foreground leading-snug tracking-tight">
										Sydney & NSW
									</span>
								</span>
							</div>

							<div className="space-y-4">
								<h1 className="font-sans font-semibold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
									Trusted luxury transport — where you need to be, when you need
									to be there.
								</h1>
								<p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
									Utos & Co. pairs professional drivers with a refined fleet and
									a booking flow designed to feel effortless from first quote to
									final drop-off.
								</p>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<Link to="/fleet">
									<Button
										size="lg"
										className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto"
									>
										Book your journey
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link to="/services">
									<Button
										size="lg"
										variant="outline"
										className="h-12 w-full rounded-full border-border/80 bg-background/50 sm:w-auto"
									>
										Explore services
									</Button>
								</Link>
							</div>

							<div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
								<div className="flex items-center gap-1.5">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className="h-4 w-4 fill-primary/90 text-primary"
										/>
									))}
									<span className="ml-2 font-medium text-foreground">5.0</span>
									<span className="text-muted-foreground">· 1000+ clients</span>
								</div>
							</div>
						</div>

						<div className="flex w-full flex-col items-stretch justify-center lg:items-end">
							<div className="w-full max-w-md lg:max-w-lg">
								<InstantQuoteWidget className="border-0 shadow-xl ring-1 ring-black/5" />
							</div>
							<p className="mt-3 text-center text-muted-foreground text-xs lg:text-right">
								Instant quote — pick vehicle and confirm in minutes.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Trust strip */}
			<section className="border-border/50 border-b bg-card py-8">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						{stats.map((s) => (
							<div
								key={s.label}
								className="flex flex-col items-center justify-center text-center sm:items-start sm:text-left"
							>
								<p className="font-sans font-semibold text-3xl text-foreground tracking-tight">
									{s.value}
								</p>
								<p className="text-muted-foreground text-sm">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Audiences — COD-style “who uses” cards */}
			<section className="py-20 md:py-24">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="mb-12 max-w-2xl">
						<h2 className="font-sans font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
							Who travels with Utos & Co.
						</h2>
						<p className="mt-3 text-lg text-muted-foreground leading-relaxed">
							Whether you are booking for yourself or coordinating for a team,
							we keep the experience consistent — clear pricing, professional
							drivers, and reliable timing.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{audiences.map((item) => (
							<Link
								key={item.title}
								to={item.href}
								className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
							>
								<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
									<item.icon className="h-5 w-5 text-foreground/80" />
								</div>
								<h3 className="font-semibold text-foreground text-lg">
									{item.title}
								</h3>
								<p className="mt-2 flex-1 text-muted-foreground text-sm leading-relaxed">
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

			{/* Why us — feature grid */}
			<section className="border-border/50 border-y bg-muted/25 py-20 md:py-24">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="mb-14 text-center">
						<h2 className="font-sans font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
							Why clients choose us
						</h2>
						<p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground leading-relaxed">
							Safety, presentation, and reliability — without the noise.
						</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="rounded-2xl border border-border/70 bg-card p-7 shadow-sm transition-all hover:shadow-md"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
									<feature.icon className="h-6 w-6 text-foreground/75" />
								</div>
								<h3 className="font-semibold text-foreground text-lg">
									{feature.title}
								</h3>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How we help — RideMinder-style narrative blocks */}
			<section className="py-20 md:py-24">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="grid gap-12 lg:grid-cols-2 lg:items-center">
						<div>
							<h2 className="font-sans font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
								How we make every trip easier
							</h2>
							<p className="mt-3 text-lg text-muted-foreground leading-relaxed">
								From the first quote to the final invoice, we focus on clarity —
								so you spend less time chasing details and more time on what
								matters.
							</p>
						</div>
						<ul className="space-y-5">
							{howWeHelp.map((item) => (
								<li
									key={item.title}
									className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
								>
									<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<CheckCircle2 className="h-4 w-4 text-primary" />
									</div>
									<div>
										<p className="font-semibold text-foreground">
											{item.title}
										</p>
										<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
											{item.body}
										</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* FAQ teaser */}
			<section className="border-border/50 border-t bg-muted/20 py-20 md:py-24">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-sans font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
							Everything you need to know
						</h2>
						<p className="mt-3 text-lg text-muted-foreground">
							Quick answers — full detail on our FAQ page.
						</p>
					</div>
					<div className="mx-auto mt-10 max-w-3xl space-y-4">
						{faqTeaser.map((item) => (
							<div
								key={item.q}
								className="rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm"
							>
								<p className="font-semibold text-foreground">{item.q}</p>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{item.a}
								</p>
							</div>
						))}
					</div>
					<div className="mt-10 flex justify-center">
						<Link to="/faqs">
							<Button variant="outline" className="rounded-full px-8">
								View all FAQs
								<ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="pt-4 pb-20 md:pb-28">
				<div className="container mx-auto max-w-7xl px-6">
					<div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary to-primary/90 px-8 py-12 text-primary-foreground shadow-xl md:px-14 md:py-14">
						<div
							className="-right-16 -top-16 pointer-events-none absolute h-56 w-56 rounded-full bg-white/10 blur-2xl"
							aria-hidden
						/>
						<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
							<div className="max-w-xl">
								<h2 className="font-sans font-semibold text-2xl tracking-tight md:text-3xl">
									Ready when you are
								</h2>
								<p className="mt-2 text-primary-foreground/85 leading-relaxed">
									Browse the fleet, explore services, or get an instant quote in
									minutes.
								</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Link to="/fleet">
									<Button
										size="lg"
										variant="secondary"
										className="h-12 w-full rounded-full font-semibold sm:w-auto"
									>
										View fleet
									</Button>
								</Link>
								<Link to="/contact-us">
									<Button
										size="lg"
										variant="outline"
										className="h-12 w-full rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 sm:w-auto"
									>
										Contact us
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
