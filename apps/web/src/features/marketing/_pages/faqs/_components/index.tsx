import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	Car,
	ChevronDown,
	ChevronUp,
	Clock,
	CreditCard,
	HelpCircle,
	MapPin,
	Phone,
	Shield,
	Star,
	Users,
} from "lucide-react";
import { useState } from "react";
import { BUSINESS_INFO } from "@/constants/business-info";

const faqCategories = [
	{
		icon: Car,
		title: "Booking & Services",
		faqs: [
			{
				question: "How far in advance should I book my chauffeur service?",
				answer:
					"We recommend booking at least 24 hours in advance for guaranteed availability. However, we also accept last-minute bookings subject to availability. For special events, airport transfers during peak times, or corporate travel, we suggest booking 48-72 hours ahead.",
			},
			{
				question: "What types of vehicles are available in your fleet?",
				answer:
					"Our premium fleet includes Mercedes S-Class sedans, BMW 7 Series, Mercedes V-Class vans for groups up to 6 passengers, and luxury SUVs. All vehicles are maintained to the highest standards and equipped with modern amenities including WiFi, water, and climate control.",
			},
			{
				question: "Do you provide airport transfer services?",
				answer:
					"Yes, airport transfers are one of our specialties. We provide 24/7 airport pickup and drop-off services to/from Sydney Airport (SYD) and other regional airports. Our service includes flight tracking, meet & greet with name boards, and luggage assistance.",
			},
			{
				question: "Can I modify or cancel my booking?",
				answer:
					"Bookings can be modified or cancelled up to 4 hours before the scheduled pickup time without penalty. Cancellations made less than 4 hours before pickup may incur a 50% charge. We understand plans change and try to be as flexible as possible.",
			},
		],
	},
	{
		icon: CreditCard,
		title: "Pricing & Payment",
		faqs: [
			{
				question: "How is pricing calculated?",
				answer:
					"Our pricing is based on distance, duration, vehicle type, and time of day. Airport transfers have fixed rates, while hourly bookings start from $80/hour with a 2-hour minimum. We provide upfront, transparent pricing with no hidden fees - what you see is what you pay.",
			},
			{
				question: "What payment methods do you accept?",
				answer:
					"We accept all major credit cards (Visa, Mastercard, Amex), PayID, Apple Pay, Google Pay, and bank transfers. Payment can be made online during booking or in the vehicle. For corporate clients, we offer invoice billing with 30-day terms.",
			},
			{
				question: "Are there any additional charges I should know about?",
				answer:
					"Our quoted prices include GST, tolls within Sydney, and standard waiting time. Additional charges may apply for extended waiting (beyond 15 minutes), travel outside metro Sydney, or special requests like champagne service or multiple stops.",
			},
			{
				question: "Do you offer discounts for regular customers?",
				answer:
					"Yes! We offer corporate rates for businesses, loyalty discounts for frequent travelers, and special packages for weddings and events. Contact us to discuss custom pricing for your regular transportation needs.",
			},
		],
	},
	{
		icon: Shield,
		title: "Safety & Insurance",
		faqs: [
			{
				question: "Are your chauffeurs licensed and background checked?",
				answer:
					"Absolutely. All our chauffeurs hold valid commercial driving licenses, have undergone comprehensive background checks, and completed professional driving training. They're also required to maintain clean driving records and undergo regular safety updates.",
			},
			{
				question: "What insurance coverage do you provide?",
				answer:
					"We carry comprehensive commercial insurance including public liability coverage up to $20 million, comprehensive vehicle coverage, and workers compensation. All passengers are covered under our insurance policy during their journey.",
			},
			{
				question: "How do you ensure vehicle safety and maintenance?",
				answer:
					"Our vehicles undergo regular professional maintenance, safety inspections, and are detailed between bookings. We follow strict safety protocols and our fleet is renewed regularly to ensure optimal performance and passenger safety.",
			},
		],
	},
	{
		icon: Clock,
		title: "Service Details",
		faqs: [
			{
				question: "What areas do you service?",
				answer:
					"We primarily service Sydney and surrounding metropolitan areas including the Eastern Suburbs, North Shore, Inner West, and Hills District. We also provide services to the Central Coast, Blue Mountains, and can arrange long-distance transfers upon request.",
			},
			{
				question: "What are your operating hours?",
				answer:
					"We operate Mon-Sun from 00:00 – 23:45 (nearly 24 hours daily), including holidays. We are always at your disposal for airport transfers, events, and all your transportation needs during these hours.",
			},
			{
				question: "What happens if my flight is delayed?",
				answer:
					"We monitor all flights in real-time and automatically adjust pickup times for delays. There's no additional charge for flight delays up to 2 hours. Our chauffeurs will wait for you and track your flight status to ensure seamless pickup.",
			},
			{
				question: "Can you accommodate special requests?",
				answer:
					"Certainly! We can arrange child seats, wheelchair accessible vehicles, champagne service, specific music preferences, temperature settings, and route preferences. Just let us know your requirements when booking.",
			},
		],
	},
];

type FAQItemProps = {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
};

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
	return (
		<div className="overflow-hidden rounded-xl border border-border">
			<button
				onClick={onToggle}
				className="flex w-full items-center justify-between bg-card px-6 py-5 text-left transition-colors duration-200 hover:bg-muted"
			>
				<span className="pr-4 font-semibold text-card-foreground text-lg">
					{question}
				</span>
				{isOpen ? (
					<ChevronUp className="h-5 w-5 flex-shrink-0 text-primary" />
				) : (
					<ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
				)}
			</button>

			{isOpen && (
				<div className="border-border border-t bg-card px-6 pb-5">
					<p className="pt-4 text-muted-foreground leading-relaxed">{answer}</p>
				</div>
			)}
		</div>
	);
}

type FAQsProps = {
	className?: string;
};

export function FAQs({ className, ...props }: FAQsProps) {
	const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

	const toggleItem = (categoryIndex: number, faqIndex: number) => {
		const key = `${categoryIndex}-${faqIndex}`;
		setOpenItems((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative bg-[url('/src/assets/images/car4.jpeg')] bg-center bg-cover bg-no-repeat py-24">
				<div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/75 to-foreground/70" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-beige px-4 py-2 font-medium text-foreground text-xs md:text-sm">
							<HelpCircle className="mr-2 h-4 w-4" />
							Frequently Asked Questions
						</div>

						<h1 className="mb-6 font-bold text-4xl text-background lg:text-6xl">
							Got
							<span className="block text-primary-secondary">Questions?</span>
						</h1>

						<p className="mx-auto mb-8 max-w-3xl text-background/80 text-lg leading-relaxed md:text-xl">
							Find answers to the most common questions about our luxury
							chauffeur services. Can't find what you're looking for? Our team
							is here to help.
						</p>

						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Link to="/contact-us">
								<Button
									size="lg"
									className="rounded-xl bg-primary px-8 py-6 font-semibold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
								>
									Contact Support
								</Button>
							</Link>
							<a href={BUSINESS_INFO.phone.link}>
								<Button
									variant="outline"
									size="lg"
									className="rounded-xl border-background/20 px-8 py-6 font-semibold text-lg text-primary hover:bg-background/10"
								>
									Call Now
								</Button>
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* FAQ Categories */}
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mx-auto max-w-4xl">
						{faqCategories.map((category, categoryIndex) => (
							<div key={category.title} className="mb-12 last:mb-0">
								<div className="mb-8 flex items-center">
									<div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
										<category.icon className="h-6 w-6 text-primary" />
									</div>
									<h2 className="font-bold text-3xl text-foreground">
										{category.title}
									</h2>
								</div>

								<div className="space-y-4">
									{category.faqs.map((faq, faqIndex) => (
										<FAQItem
											key={faq.question}
											question={faq.question}
											answer={faq.answer}
											isOpen={
												openItems[`${categoryIndex}-${faqIndex}`] || false
											}
											onToggle={() => toggleItem(categoryIndex, faqIndex)}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="bg-soft-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-4xl text-foreground">
							Still Have Questions?
						</h2>
						<p className="mx-auto max-w-3xl text-muted-foreground text-xl">
							Our experienced team is here to help you with any questions about
							our services, booking process, or special requirements.
						</p>
					</div>

					<div className="mb-16 grid gap-8 md:grid-cols-3">
						{[
							{
								icon: Phone,
								title: "Call Us",
								description: "Speak with our team 24/7",
								action: BUSINESS_INFO.phone.link,
								label: BUSINESS_INFO.phone.display,
							},
							{
								icon: MapPin,
								title: "Visit Us",
								description: "Level 12, 345 George Street, Sydney",
								action: "/contact-us",
								label: "Get Directions",
							},
							{
								icon: Users,
								title: "Live Chat",
								description: "Instant support online",
								action: "/contact-us",
								label: "Start Chat",
							},
						].map((contact, index) => (
							<div
								key={contact.title}
								className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
									<contact.icon className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-3 font-bold text-card-foreground text-xl">
									{contact.title}
								</h3>
								<p className="mb-4 text-muted-foreground">
									{contact.description}
								</p>
								{contact.action.startsWith("tel:") ? (
									<a
										href={contact.action}
										className="font-semibold text-amber-600 transition-colors duration-200 hover:text-amber-700"
									>
										{contact.label}
									</a>
								) : (
									<Link
										to={contact.action}
										className="font-semibold text-amber-600 transition-colors duration-200 hover:text-amber-700"
									>
										{contact.label}
									</Link>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
