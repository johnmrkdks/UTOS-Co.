import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertCircle,
	Ban,
	Briefcase,
	Calendar,
	Clock,
	FileText,
	Luggage,
	MapPin,
	Phone,
	Plane,
	ShieldAlert,
} from "lucide-react";
import { BUSINESS_INFO } from "@/constants/business-info";

type TermsAndConditionsProps = {
	className?: string;
};

/** Content aligned to Utos terms and conditions 2025 (PDF). */
export function TermsAndConditions({
	className,
	...props
}: TermsAndConditionsProps) {
	return (
		<div className={cn("", className)} {...props}>
			<div className="relative bg-gradient-to-br from-foreground via-foreground/90 to-primary/20 py-24">
				<div className="absolute inset-0 bg-foreground/70" />
				<div className="container relative z-10 mx-auto px-6 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 font-medium text-sm text-white">
							<FileText className="mr-2 h-4 w-4" />
							Legal Information
						</div>

						<h1 className="mb-6 font-bold text-5xl text-white lg:text-6xl">
							Terms and
							<span className="block text-primary">Conditions</span>
						</h1>

						<p className="mx-auto max-w-3xl text-white/85 text-xl leading-relaxed">
							Please read these terms and conditions carefully before using our
							services. By booking with {BUSINESS_INFO.business.name}, you agree
							to be bound by these terms.
						</p>
					</div>
				</div>
			</div>

			<div className="bg-beige py-24">
				<div className="container mx-auto px-6">
					<div className="mx-auto max-w-4xl space-y-8">
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<p className="text-muted-foreground leading-relaxed">
								<strong className="text-card-foreground">
									All prices are in Australian Dollars and are GST-inclusive.
								</strong>
							</p>
							<p className="mt-4 text-muted-foreground leading-relaxed">
								A <strong className="text-card-foreground">$50</strong>{" "}
								surcharge applies for Charter services on Public Holidays.
							</p>
						</div>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<MapPin className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Bookings, routes & stops
									</h2>
									<ul className="list-disc space-y-3 pl-5 text-muted-foreground leading-relaxed">
										<li>
											All pick-up and drop-off points must be advised at the
											time of booking, including any stops en route. Any
											impromptu stops during transfer will be at the discretion
											of the chauffeur and will incur a charge of{" "}
											<strong className="text-card-foreground">
												$25 per 15 minutes
											</strong>
											.
										</li>
										<li>
											All reservations must be fully prepaid in advance. Our
											drivers or affiliates are{" "}
											<strong className="text-card-foreground">not</strong>{" "}
											authorised to take reservations or make changes to
											bookings. All reservations must be confirmed in advance
											through our booking admin by direct chat, call or email.
										</li>
									</ul>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Clock className="h-6 w-6 text-primary" />
								</div>
								<div className="w-full space-y-6">
									<h2 className="font-bold text-2xl text-card-foreground">
										Waiting charges
									</h2>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<h3 className="mb-2 font-semibold text-card-foreground text-lg">
											Home / hotel / private address
										</h3>
										<p className="text-muted-foreground">
											Waiting time rates apply after the first{" "}
											<strong className="text-card-foreground">
												10 minutes
											</strong>{" "}
											and will be charged in{" "}
											<strong className="text-card-foreground">
												15-minute increments
											</strong>{" "}
											at a rate of{" "}
											<strong className="text-card-foreground">
												$20 inc GST
											</strong>
											.
										</p>
									</div>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<h3 className="mb-2 font-semibold text-card-foreground text-lg">
											At the airport
										</h3>
										<p className="text-muted-foreground">
											Passengers must be ready for immediate departure;
											additional charges may apply for unnecessary delays such
											as meal consumption, currency exchange or airport
											shopping.
										</p>
									</div>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<div className="mb-2 flex items-center gap-2">
											<Plane className="h-5 w-5 text-primary" />
											<h3 className="font-semibold text-card-foreground text-lg">
												International terminals
											</h3>
										</div>
										<p className="text-muted-foreground">
											Waiting time{" "}
											<strong className="text-card-foreground">
												90 minutes
											</strong>{" "}
											(from flight landing time) included; after 90 minutes{" "}
											<strong className="text-card-foreground">
												$1.00 per minute
											</strong>{" "}
											waiting charges apply.
										</p>
									</div>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<div className="mb-2 flex items-center gap-2">
											<Plane className="h-5 w-5 text-primary" />
											<h3 className="font-semibold text-card-foreground text-lg">
												Domestic terminals
											</h3>
										</div>
										<p className="text-muted-foreground">
											Waiting time{" "}
											<strong className="text-card-foreground">
												60 minutes
											</strong>{" "}
											(from flight landing time) included; after 60 minutes{" "}
											<strong className="text-card-foreground">
												$1.00 per minute
											</strong>{" "}
											waiting charges apply.
										</p>
									</div>
									<p className="text-muted-foreground leading-relaxed">
										<strong className="text-card-foreground">
											Multiple flights:
										</strong>{" "}
										If a group is arriving on multiple flights, additional
										waiting and parking time charges may apply where one of the
										flights is delayed.
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Calendar className="h-6 w-6 text-primary" />
								</div>
								<div className="w-full space-y-6">
									<h2 className="font-bold text-2xl text-card-foreground">
										Cancellation policy & changes
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										All cancellations or changes to bookings must be
										communicated through our booking admin via chat, email or
										direct call. Please follow up with a phone call to confirm
										receipt.
									</p>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<h3 className="mb-2 font-semibold text-card-foreground text-lg">
											Airport transfers, events, tours & point-to-point
											transfers
										</h3>
										<p className="text-muted-foreground">
											Transport services are{" "}
											<strong className="text-card-foreground">
												non-refundable
											</strong>
											, but we offer{" "}
											<strong className="text-card-foreground">
												credits that do not expire
											</strong>
											, which can be used for future bookings. If you have
											questions or need assistance with your credits, contact
											our support team.
										</p>
									</div>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<h3 className="mb-2 font-semibold text-card-foreground text-lg">
											Wedding transfers
										</h3>
										<p className="text-muted-foreground">
											Cancellation must be received{" "}
											<strong className="text-card-foreground">
												30 days prior
											</strong>{" "}
											to the booked wedding date{" "}
											<strong className="text-card-foreground">
												in writing
											</strong>
											. You must advise us of the cancellation by email. The
											deposit will be forfeited to cover cost and losses. If
											cancellation is received within 30 days of the booked
											wedding date, the total hire fee will become payable in
											full. All deposits and payments are non-transferable.
										</p>
									</div>
									<div className="rounded-xl border border-border bg-soft-beige p-6">
										<h3 className="mb-2 font-semibold text-card-foreground text-lg">
											COVID-19 related cancellations
										</h3>
										<p className="text-muted-foreground">
											We have been flexible when borders are closing. If your
											flight is cancelled due to borders closing, we will refund
											all but a{" "}
											<strong className="text-card-foreground">
												$20 administration fee
											</strong>
											. That $20 will be held in credit to be used for the next
											booking under your name.
										</p>
									</div>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<AlertCircle className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Disruptions or delays
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										Should there be any disruptions or delays, it is the
										responsibility of the passenger to contact{" "}
										{BUSINESS_INFO.business.name} to prevent any no-show or
										non-arrival charges. {BUSINESS_INFO.business.name} reserves
										the right to amend the itinerary if necessary. Every
										endeavour will be made to keep to arrival and departure
										times; however, they are indicative only and no guarantee
										can be made. No compensation shall be payable in the event
										of loss due to missed connections.
									</p>
									<p className="mt-4 text-muted-foreground leading-relaxed">
										{BUSINESS_INFO.business.name} accepts no liability or
										responsibility for delayed or cancelled flights or cruises
										and delays due to traffic or traffic accidents. Passengers
										need to allow enough time for city traffic and any other
										delays. {BUSINESS_INFO.business.name} shall not be held
										responsible for any cost incurred whatsoever caused by any
										issues outside its control such as vehicle breakdown or
										traffic, including costs incurred due to late flights and
										other industrial, civil or public actions.
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Ban className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Food, beverage & smoking
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										Consuming food and beverages is not permitted in any vehicle
										supplied by {BUSINESS_INFO.business.name} without prior
										approval. In such events a cleaning fee will apply. You are
										fully responsible for any charge in respect of any damage
										caused to the equipment of the vehicle as a result of your
										booking. Passengers must not litter the vehicle and must
										remove all rubbish at the end of the journey. Smoking is not
										permitted by law on any vehicle supplied by{" "}
										{BUSINESS_INFO.business.name}.
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Briefcase className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Substitutions & carriage
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{BUSINESS_INFO.business.name} may, without notice,
										substitute means of transport or service suppliers.{" "}
										{BUSINESS_INFO.business.name} is not a common carrier and is
										not liable for any loss or damage howsoever arising,
										including negligence, to any goods, baggage and personal
										effects conveyed by our service. Passengers are strongly
										advised to obtain appropriate travel insurance cover for
										these items. Carriage of passengers is in accordance with
										the{" "}
										<strong className="text-card-foreground">
											Passenger Transport Act 1990
										</strong>{" "}
										(NSW).
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-border bg-card p-8 shadow-lg">
							<div className="mb-6 flex items-start gap-4">
								<div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
									<Luggage className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h2 className="mb-4 font-bold text-2xl text-card-foreground">
										Luggage
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										In the event of excess luggage,{" "}
										{BUSINESS_INFO.business.name} reserves the right to charge
										an excess baggage fee or to refuse to transport the excess
										items. Extra fees will apply for large items (e.g. boxes,
										surfboards, bike bags, ski bags and golf bags).
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8">
							<div className="text-center">
								<div className="mb-4 flex justify-center">
									<ShieldAlert className="h-10 w-10 text-primary" />
								</div>
								<h2 className="mb-4 font-bold text-2xl text-foreground">
									Questions about these terms?
								</h2>
								<p className="mb-6 text-muted-foreground">
									Contact us if you need clarification on any part of these
									terms and conditions.
								</p>
								<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
									<div className="flex items-center text-muted-foreground">
										<Phone className="mr-2 h-5 w-5 text-primary" />
										<span className="font-medium">
											{BUSINESS_INFO.phone.display}
										</span>
									</div>
									<Link to="/contact-us">
										<Button
											size="lg"
											className="rounded-xl bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
										>
											Contact us
										</Button>
									</Link>
								</div>
							</div>
						</section>

						<div className="text-center text-muted-foreground text-sm">
							<p>
								©{" "}
								{BUSINESS_INFO.business.foundedYear === 2020
									? `${BUSINESS_INFO.business.foundedYear}-${new Date().getFullYear()}`
									: new Date().getFullYear()}{" "}
								{BUSINESS_INFO.business.name}. All rights reserved.
							</p>
							<p className="mt-2">
								Terms and conditions effective for bookings from 2025; may be
								updated from time to time.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
