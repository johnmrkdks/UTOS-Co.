import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import { 
	ChevronDown,
	ChevronUp,
	HelpCircle,
	Phone,
	Car,
	Clock,
	CreditCard,
	Shield,
	MapPin,
	Users,
	Star
} from "lucide-react";
import { useState } from "react";

const faqCategories = [
	{
		icon: Car,
		title: "Booking & Services",
		faqs: [
			{
				question: "How far in advance should I book my chauffeur service?",
				answer: "We recommend booking at least 24 hours in advance for guaranteed availability. However, we also accept last-minute bookings subject to availability. For special events, airport transfers during peak times, or corporate travel, we suggest booking 48-72 hours ahead."
			},
			{
				question: "What types of vehicles are available in your fleet?",
				answer: "Our premium fleet includes Mercedes S-Class sedans, BMW 7 Series, Mercedes V-Class vans for groups up to 6 passengers, and luxury SUVs. All vehicles are maintained to the highest standards and equipped with modern amenities including WiFi, water, and climate control."
			},
			{
				question: "Do you provide airport transfer services?",
				answer: "Yes, airport transfers are one of our specialties. We provide 24/7 airport pickup and drop-off services to/from Sydney Airport (SYD) and other regional airports. Our service includes flight tracking, meet & greet with name boards, and luggage assistance."
			},
			{
				question: "Can I modify or cancel my booking?",
				answer: "Bookings can be modified or cancelled up to 4 hours before the scheduled pickup time without penalty. Cancellations made less than 4 hours before pickup may incur a 50% charge. We understand plans change and try to be as flexible as possible."
			}
		]
	},
	{
		icon: CreditCard,
		title: "Pricing & Payment",
		faqs: [
			{
				question: "How is pricing calculated?",
				answer: "Our pricing is based on distance, duration, vehicle type, and time of day. Airport transfers have fixed rates, while hourly bookings start from $80/hour with a 2-hour minimum. We provide upfront, transparent pricing with no hidden fees - what you see is what you pay."
			},
			{
				question: "What payment methods do you accept?",
				answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayID, Apple Pay, Google Pay, and bank transfers. Payment can be made online during booking or in the vehicle. For corporate clients, we offer invoice billing with 30-day terms."
			},
			{
				question: "Are there any additional charges I should know about?",
				answer: "Our quoted prices include GST, tolls within Sydney, and standard waiting time. Additional charges may apply for extended waiting (beyond 15 minutes), travel outside metro Sydney, or special requests like champagne service or multiple stops."
			},
			{
				question: "Do you offer discounts for regular customers?",
				answer: "Yes! We offer corporate rates for businesses, loyalty discounts for frequent travelers, and special packages for weddings and events. Contact us to discuss custom pricing for your regular transportation needs."
			}
		]
	},
	{
		icon: Shield,
		title: "Safety & Insurance",
		faqs: [
			{
				question: "Are your chauffeurs licensed and background checked?",
				answer: "Absolutely. All our chauffeurs hold valid commercial driving licenses, have undergone comprehensive background checks, and completed professional driving training. They're also required to maintain clean driving records and undergo regular safety updates."
			},
			{
				question: "What insurance coverage do you provide?",
				answer: "We carry comprehensive commercial insurance including public liability coverage up to $20 million, comprehensive vehicle coverage, and workers compensation. All passengers are covered under our insurance policy during their journey."
			},
			{
				question: "How do you ensure vehicle safety and maintenance?",
				answer: "Our vehicles undergo regular professional maintenance, safety inspections, and are detailed between bookings. We follow strict safety protocols and our fleet is renewed regularly to ensure optimal performance and passenger safety."
			}
		]
	},
	{
		icon: Clock,
		title: "Service Details",
		faqs: [
			{
				question: "What areas do you service?",
				answer: "We primarily service Sydney and surrounding metropolitan areas including the Eastern Suburbs, North Shore, Inner West, and Hills District. We also provide services to the Central Coast, Blue Mountains, and can arrange long-distance transfers upon request."
			},
			{
				question: "Are you available 24/7?",
				answer: "Yes, we operate 24 hours a day, 7 days a week, including holidays. Whether you need an early morning airport transfer or late-night event pickup, our team is available to assist you around the clock."
			},
			{
				question: "What happens if my flight is delayed?",
				answer: "We monitor all flights in real-time and automatically adjust pickup times for delays. There's no additional charge for flight delays up to 2 hours. Our chauffeurs will wait for you and track your flight status to ensure seamless pickup."
			},
			{
				question: "Can you accommodate special requests?",
				answer: "Certainly! We can arrange child seats, wheelchair accessible vehicles, champagne service, specific music preferences, temperature settings, and route preferences. Just let us know your requirements when booking."
			}
		]
	}
];

type FAQItemProps = {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
};

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
	return (
		<div className="border border-gray-200 rounded-xl overflow-hidden">
			<button
				onClick={onToggle}
				className="w-full px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
			>
				<span className="font-semibold text-gray-900 text-lg pr-4">
					{question}
				</span>
				{isOpen ? (
					<ChevronUp className="w-5 h-5 text-amber-600 flex-shrink-0" />
				) : (
					<ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
				)}
			</button>
			
			{isOpen && (
				<div className="px-6 pb-5 bg-white border-t border-gray-100">
					<p className="text-gray-600 leading-relaxed pt-4">
						{answer}
					</p>
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
		setOpenItems(prev => ({
			...prev,
			[key]: !prev[key]
		}));
	};

	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
				<div className="absolute inset-0 bg-black/20" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
							<HelpCircle className="w-4 h-4 mr-2" />
							Frequently Asked Questions
						</div>
						
						<h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
							Got
							<span className="block text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
								Questions?
							</span>
						</h1>
						
						<p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
							Find answers to the most common questions about our luxury chauffeur services. 
							Can't find what you're looking for? Our team is here to help.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/contact-us">
								<Button
									size="lg"
									className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Contact Support
								</Button>
							</Link>
							<a href="tel:+61298765432">
								<Button
									variant="outline"
									size="lg"
									className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Call Now
								</Button>
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* FAQ Categories */}
			<div className="py-24 bg-white">
				<div className="container mx-auto px-6">
					<div className="max-w-4xl mx-auto">
						{faqCategories.map((category, categoryIndex) => (
							<div key={category.title} className="mb-12 last:mb-0">
								<div className="flex items-center mb-8">
									<div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4">
										<category.icon className="w-6 h-6 text-amber-600" />
									</div>
									<h2 className="text-3xl font-bold text-gray-900">
										{category.title}
									</h2>
								</div>
								
								<div className="space-y-4">
									{category.faqs.map((faq, faqIndex) => (
										<FAQItem
											key={faq.question}
											question={faq.question}
											answer={faq.answer}
											isOpen={openItems[`${categoryIndex}-${faqIndex}`] || false}
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
			<div className="py-24 bg-gray-50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Still Have Questions?
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Our experienced team is here to help you with any questions about our services, 
							booking process, or special requirements.
						</p>
					</div>
					
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						{[
							{
								icon: Phone,
								title: "Call Us",
								description: "Speak with our team 24/7",
								action: "tel:+61298765432",
								label: "+61 2 9876 5432"
							},
							{
								icon: MapPin,  
								title: "Visit Us",
								description: "Level 12, 345 George Street, Sydney",
								action: "/contact-us",
								label: "Get Directions"
							},
							{
								icon: Users,
								title: "Live Chat",
								description: "Instant support online",
								action: "/contact-us",
								label: "Start Chat"
							}
						].map((contact, index) => (
							<div key={contact.title} className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<contact.icon className="w-8 h-8 text-amber-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{contact.title}
								</h3>
								<p className="text-gray-600 mb-4">
									{contact.description}
								</p>
								{contact.action.startsWith('tel:') ? (
									<a 
										href={contact.action}
										className="text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-200"
									>
										{contact.label}
									</a>
								) : (
									<Link 
										to={contact.action}
										className="text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-200"
									>
										{contact.label}
									</Link>
								)}
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
							Ready to Book Your Luxury Journey?
						</h2>
						<p className="text-xl text-amber-100 mb-8 leading-relaxed">
							Experience the difference of premium chauffeur service. Book now or contact 
							our team for personalized assistance with your transportation needs.
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