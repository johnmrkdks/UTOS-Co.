import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertCircle,
	Calendar,
	Clock,
	DollarSign,
	FileText,
	MapPin,
	Phone,
} from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

type TermsAndConditionsProps = {
	className?: string;
};

export function TermsAndConditions({
	className,
	...props
}: TermsAndConditionsProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-foreground via-foreground/90 to-primary/20 py-24">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-beige px-4 py-2 font-medium text-foreground text-sm">
							<FileText className="mr-2 h-4 w-4" />
							Legal Information
						</div>

						<h1 className="mb-6 font-bold text-5xl text-beige lg:text-6xl">
							Terms and
							<span className="block text-primary">Conditions</span>
						</h1>

						<p className="mx-auto max-w-3xl text-beige/80 text-xl leading-relaxed">
							Please read these terms and conditions carefully before using our
							services. By booking with Down Under Chauffeurs, you agree to be
							bound by these terms.
						</p>
					</div>
				</div>
			</div>

			{/* Terms Content */}
			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mx-auto max-w-4xl">
						{/* Booking Responsibilities */}
						<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start">
								<div className="mt-1 mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<AlertCircle className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Booking Responsibilities
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										Please note it is the customer's responsibility to verify
										that the booking details are accurate. We recommend
										reviewing all information including pickup times, locations,
										and passenger details before confirming your reservation.
									</p>
								</div>
							</div>
						</div>

						{/* Cancellation Policy */}
						<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start">
								<div className="mt-1 mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Calendar className="h-6 w-6 text-primary" />
								</div>
								<div className="w-full">
									<h2 className="mb-6 font-bold text-2xl text-card-foreground">
										Cancellation Policy
									</h2>

									<div className="space-y-6">
										<div className="rounded-xl border border-border bg-soft-beige p-6">
											<div className="mb-3 flex items-center">
												<Clock className="mr-2 h-5 w-5 text-primary" />
												<h3 className="font-semibold text-card-foreground text-lg">
													Daytime Cancellations (8:00am - 8:00pm)
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than{" "}
												<strong>1 hour prior to pickup</strong> will incur the
												full transfer fee.
											</p>
										</div>

										<div className="rounded-xl border border-border bg-soft-beige p-6">
											<div className="mb-3 flex items-center">
												<Clock className="mr-2 h-5 w-5 text-primary" />
												<h3 className="font-semibold text-card-foreground text-lg">
													Evening/Night Cancellations (8:00pm - 8:00am)
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than{" "}
												<strong>8 hours prior to pickup</strong> will incur the
												full transfer charge.
											</p>
										</div>

										<div className="rounded-xl border border-border bg-soft-beige p-6">
											<div className="mb-3 flex items-center">
												<MapPin className="mr-2 h-5 w-5 text-primary" />
												<h3 className="font-semibold text-card-foreground text-lg">
													As Directed/On Hold Bookings
												</h3>
											</div>
											<p className="text-muted-foreground">
												Cancellations made less than{" "}
												<strong>12 hours prior to scheduled time</strong> will
												incur a 50% charge.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Charges */}
						<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start">
								<div className="mt-1 mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<DollarSign className="h-6 w-6 text-primary" />
								</div>
								<div className="w-full">
									<h2 className="mb-6 font-bold text-2xl text-card-foreground">
										Additional Charges
									</h2>

									<div className="grid gap-4 md:grid-cols-3">
										<div className="rounded-xl border border-border bg-soft-beige p-4 text-center">
											<MapPin className="mx-auto mb-3 h-8 w-8 text-primary" />
											<h3 className="mb-2 font-semibold text-card-foreground">
												Extra Stops
											</h3>
											<p className="text-muted-foreground text-sm">
												Additional charges apply for extra stops or detours
												during transit
											</p>
										</div>

										<div className="rounded-xl border border-border bg-soft-beige p-4 text-center">
											<div className="mb-2 font-bold text-2xl text-primary">
												$20
											</div>
											<h3 className="mb-2 font-semibold text-card-foreground">
												Baby/Booster Seat
											</h3>
											<p className="text-muted-foreground text-sm">
												Per seat charge for child safety seats
											</p>
										</div>

										<div className="rounded-xl border border-border bg-soft-beige p-4 text-center">
											<div className="mb-2 font-bold text-2xl text-primary">
												$40
											</div>
											<h3 className="mb-2 font-semibold text-card-foreground">
												Luggage Trailer
											</h3>
											<p className="text-muted-foreground text-sm">
												Additional charge for luggage trailer service
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8">
							<div className="text-center">
								<h2 className="mb-4 font-bold text-2xl text-foreground">
									Questions About Our Terms?
								</h2>
								<p className="mb-6 text-muted-foreground">
									If you have any questions about these terms and conditions,
									please don't hesitate to contact us.
								</p>

								<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
									<div className="flex items-center text-muted-foreground">
										<Phone className="mr-2 h-5 w-5 text-primary" />
										<span className="font-medium">
											{BUSINESS_INFO.phone.display}
										</span>
									</div>

									<div className="flex gap-4">
										<Link to="/contact-us">
											<Button
												size="lg"
												className="rounded-xl bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
											>
												Contact Us
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Legal Footer */}
						<div className="mt-12 text-center text-muted-foreground text-sm">
							<p>
								©{" "}
								{BUSINESS_INFO.business.foundedYear === 2020
									? `${BUSINESS_INFO.business.foundedYear}-${new Date().getFullYear()}`
									: new Date().getFullYear()}{" "}
								{BUSINESS_INFO.business.name}. All rights reserved.
							</p>
							<p className="mt-2">
								These terms and conditions are effective as of the date of your
								booking and may be updated from time to time.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
