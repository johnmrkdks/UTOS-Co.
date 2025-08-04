import { cn } from "@workspace/ui/lib/utils";
import { ContactUsForm } from "./contact-us-form";
import { ContactUsMap } from "./map";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import { 
	Phone, 
	Mail, 
	MapPin, 
	Clock, 
	MessageCircle,
	Star,
	Car,
	Shield,
	Headphones
} from "lucide-react";

const contactMethods = [
	{
		icon: Phone,
		title: "Call Us",
		description: "Speak directly with our team",
		contact: "+61 2 9876 5432",
		action: "tel:+61298765432",
		available: "24/7"
	},
	{
		icon: Mail,
		title: "Email Us",
		description: "Send us a detailed message",
		contact: "hello@downunderchauffeur.com.au",
		action: "mailto:hello@downunderchauffeur.com.au",
		available: "24 hours response"
	},
	{
		icon: MessageCircle,
		title: "WhatsApp",
		description: "Quick chat on WhatsApp",
		contact: "+61 400 123 456",
		action: "https://wa.me/61400123456",
		available: "Instant response"
	}
];

const officeDetails = [
	{
		icon: MapPin,
		title: "Office Location",
		details: ["Level 12, 345 George Street", "Sydney NSW 2000", "Australia"]
	},
	{
		icon: Clock,
		title: "Business Hours", 
		details: ["Monday - Friday: 6:00 AM - 10:00 PM", "Saturday: 7:00 AM - 10:00 PM", "Sunday: 8:00 AM - 8:00 PM"]
	},
	{
		icon: Headphones,
		title: "Customer Support",
		details: ["24/7 Emergency Support", "Multilingual assistance", "Dedicated account managers"]
	}
];

type ContactUsProps = {
	className?: string;
};

export function ContactUs({ className, ...props }: ContactUsProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
				<div className="absolute inset-0 bg-black/20" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
							<Phone className="w-4 h-4 mr-2" />
							Get in Touch
						</div>
						
						<h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
							Contact Our
							<span className="block text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
								Luxury Team
							</span>
						</h1>
						
						<p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
							Ready to experience premium transportation? Our dedicated team is here to assist 
							you 24/7 with personalized service and expert guidance.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a href="tel:+61298765432">
								<Button
									size="lg"
									className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Call Now
								</Button>
							</a>
							<Link to="/booking">
								<Button
									variant="outline"
									size="lg"
									className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
								>
									Book Online
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Contact Methods */}
			<div className="py-24 bg-white">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Multiple Ways to Reach Us
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Choose your preferred method of communication. Our team is always ready 
							to provide exceptional service and answer your questions.
						</p>
					</div>
					
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						{contactMethods.map((method, index) => (
							<div 
								key={method.title}
								className="bg-white border-2 border-gray-200 hover:border-amber-200 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl group"
							>
								<div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<method.icon className="w-8 h-8 text-amber-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{method.title}
								</h3>
								<p className="text-gray-600 mb-4">
									{method.description}
								</p>
								<a 
									href={method.action}
									className="text-amber-600 hover:text-amber-700 font-semibold text-lg block mb-2 transition-colors duration-200"
								>
									{method.contact}
								</a>
								<div className="text-sm text-gray-500">
									{method.available}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Contact Form & Map Section */}
			<div className="py-24 bg-gray-50">
				<div className="container mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-16 items-start">
						{/* Contact Form */}
						<div className="bg-white rounded-2xl shadow-lg p-8">
							<div className="mb-8">
								<h3 className="text-3xl font-bold text-gray-900 mb-4">
									Send Us a Message
								</h3>
								<p className="text-gray-600 leading-relaxed">
									Fill out the form below and we'll get back to you within 24 hours. 
									For urgent requests, please call us directly.
								</p>
							</div>
							
							<ContactUsForm />
						</div>

						{/* Office Information */}
						<div className="space-y-8">
							<div className="bg-white rounded-2xl shadow-lg p-8">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">
									Visit Our Office
								</h3>
								<ContactUsMap className="h-64 w-full rounded-xl mb-6" />
								
								<div className="space-y-6">
									{officeDetails.map((detail, index) => (
										<div key={detail.title} className="flex items-start">
											<div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-4 mt-1">
												<detail.icon className="w-6 h-6 text-amber-600" />
											</div>
											<div>
												<h4 className="text-lg font-bold text-gray-900 mb-2">
													{detail.title}
												</h4>
												{detail.details.map((line, lineIndex) => (
													<p key={lineIndex} className="text-gray-600">
														{line}
													</p>
												))}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Trust Indicators */}
							<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8">
								<h4 className="text-xl font-bold text-gray-900 mb-6">
									Why Choose Us?
								</h4>
								<div className="space-y-4">
									{[
										{
											icon: Shield,
											text: "Licensed & Insured Service"
										},
										{
											icon: Star,
											text: "5-Star Customer Rating"
										},
										{
											icon: Car,
											text: "Premium Fleet Vehicles"
										}
									].map((item, index) => (
										<div key={index} className="flex items-center">
											<div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center mr-3">
												<item.icon className="w-4 h-4 text-white" />
											</div>
											<span className="text-gray-700 font-medium">
												{item.text}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
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
							Don't wait – experience the difference of premium chauffeur service today. 
							Book online or call us for immediate assistance.
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
		</div>
	);
}
