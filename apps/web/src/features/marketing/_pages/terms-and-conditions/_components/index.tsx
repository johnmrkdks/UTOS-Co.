import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@tanstack/react-router";
import {
	FileText,
	Clock,
	DollarSign,
	AlertCircle,
	Phone,
	Calendar,
	MapPin
} from "lucide-react";

type TermsAndConditionsProps = {
	className?: string;
};

export function TermsAndConditions({ className, ...props }: TermsAndConditionsProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative py-24 bg-gradient-to-br from-foreground via-foreground/90 to-primary/20">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="relative z-10 container mx-auto px-6 text-center">
					<div className="max-w-4xl mx-auto">
						<div className="inline-flex items-center px-4 py-2 bg-beige text-foreground rounded-full text-sm font-medium mb-6">
							<FileText className="w-4 h-4 mr-2" />
							Legal Information
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold text-beige mb-6">
							Terms and
							<span className="block text-primary">
								Conditions
							</span>
						</h1>

						<p className="text-xl text-beige/80 leading-relaxed max-w-3xl mx-auto">
							Please read these terms and conditions carefully before using our services.
							By booking with Down Under Chauffeurs, you agree to be bound by these terms.
						</p>
					</div>
				</div>
			</div>

			{/* Terms Content */}
			<div className="py-24 bg-beige">
				<div className="container mx-auto px-6">
					<div className="max-w-4xl mx-auto">
						
						{/* Booking Responsibilities */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border mb-8">
							<div className="flex items-start mb-6">
								<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 mt-1">
									<AlertCircle className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-card-foreground mb-4">
										Booking Responsibilities
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										Please note it is the customer's responsibility to verify that the booking details are accurate. 
										We recommend reviewing all information including pickup times, locations, and passenger details before confirming your reservation.
									</p>
								</div>
							</div>
						</div>

						{/* Cancellation Policy */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border mb-8">
							<div className="flex items-start mb-6">
								<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 mt-1">
									<Calendar className="w-6 h-6 text-primary" />
								</div>
								<div className="w-full">
									<h2 className="text-2xl font-bold text-card-foreground mb-6">
										Cancellation Policy
									</h2>
									
									<div className="space-y-6">
										<div className="border border-border rounded-xl p-6 bg-soft-beige">
											<div className="flex items-center mb-3">
												<Clock className="w-5 h-5 text-primary mr-2" />
												<h3 className="text-lg font-semibold text-card-foreground">
													Daytime Cancellations (8:00am - 8:00pm)
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than <strong>1 hour prior to pickup</strong> will incur the full transfer fee.
											</p>
										</div>

										<div className="border border-border rounded-xl p-6 bg-soft-beige">
											<div className="flex items-center mb-3">
												<Clock className="w-5 h-5 text-primary mr-2" />
												<h3 className="text-lg font-semibold text-card-foreground">
													Evening/Night Cancellations (8:00pm - 8:00am)
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than <strong>8 hours prior to pickup</strong> will incur the full transfer charge.
											</p>
										</div>

										<div className="border border-border rounded-xl p-6 bg-soft-beige">
											<div className="flex items-center mb-3">
												<MapPin className="w-5 h-5 text-primary mr-2" />
												<h3 className="text-lg font-semibold text-card-foreground">
													As Directed/On Hold Bookings
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than <strong>12 hours prior to scheduled time</strong> will incur a 50% charge.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Charges */}
						<div className="bg-card p-8 rounded-2xl shadow-lg border border-border mb-8">
							<div className="flex items-start mb-6">
								<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 mt-1">
									<DollarSign className="w-6 h-6 text-primary" />
								</div>
								<div className="w-full">
									<h2 className="text-2xl font-bold text-card-foreground mb-6">
										Additional Charges
									</h2>
									
									<div className="grid md:grid-cols-3 gap-4">
										<div className="border border-border rounded-xl p-4 bg-soft-beige text-center">
											<MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
											<h3 className="font-semibold text-card-foreground mb-2">Extra Stops</h3>
											<p className="text-sm text-muted-foreground">Additional charges apply for extra stops or detours during transit</p>
										</div>

										<div className="border border-border rounded-xl p-4 bg-soft-beige text-center">
											<div className="text-2xl font-bold text-primary mb-2">$20</div>
											<h3 className="font-semibold text-card-foreground mb-2">Baby/Booster Seat</h3>
											<p className="text-sm text-muted-foreground">Per seat charge for child safety seats</p>
										</div>

										<div className="border border-border rounded-xl p-4 bg-soft-beige text-center">
											<div className="text-2xl font-bold text-primary mb-2">$40</div>
											<h3 className="font-semibold text-card-foreground mb-2">Luggage Trailer</h3>
											<p className="text-sm text-muted-foreground">Additional charge for luggage trailer service</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20">
							<div className="text-center">
								<h2 className="text-2xl font-bold text-foreground mb-4">
									Questions About Our Terms?
								</h2>
								<p className="text-muted-foreground mb-6">
									If you have any questions about these terms and conditions, please don't hesitate to contact us.
								</p>
								
								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<div className="flex items-center text-muted-foreground">
										<Phone className="w-5 h-5 mr-2 text-primary" />
										<span className="font-medium">+61 422 693 233</span>
									</div>
									
									<div className="flex gap-4">
										<Link to="/contact-us">
											<Button
												size="lg"
												className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
											>
												Contact Us
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Legal Footer */}
						<div className="mt-12 text-center text-sm text-muted-foreground">
							<p>© 2024 Down Under Chauffeurs. All rights reserved.</p>
							<p className="mt-2">
								These terms and conditions are effective as of the date of your booking and may be updated from time to time.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}