import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { format } from "date-fns";
import { MapPin, Clock, Calendar, Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { SquarePaymentForm } from "@/features/payments/_components/square-payment-form";
import { toast } from "sonner";

export const Route = createFileRoute("/_marketing/pay/$token")({
	component: PayBookingPage,
});

function PayBookingPage() {
	const { token } = useParams({ from: "/_marketing/pay/$token" });
	const navigate = useNavigate();
	const { data: booking, isLoading, error } = useGetBookingByShareTokenQuery(token);
	const { data: squareConfig, isLoading: squareConfigLoading } = useQuery({
		...trpc.payments.getSquareConfig.queryOptions(),
		enabled: !!booking?.id && (booking as { paymentStatus?: string }).paymentStatus === "pending_payment",
	});

	const amountCents = Math.round((booking?.quotedAmount ?? 0) * 100);

	const handleAuthorized = () => {
		toast.success("Payment authorized! Your booking is confirmed.");
		navigate({ to: "/track/$token", params: { token } });
	};

	if (isLoading) {
		return (
			<div className="container max-w-xl py-16 flex flex-col items-center justify-center min-h-[60vh]">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="container max-w-xl py-16 flex flex-col items-center justify-center min-h-[60vh]">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 text-xl font-semibold">Booking not found</h2>
				<p className="mt-2 text-muted-foreground text-center max-w-sm">
					The payment link may be invalid or expired. Please contact us if you need assistance.
				</p>
			</div>
		);
	}

	const paymentStatus = (booking as { paymentStatus?: string }).paymentStatus;

	// Already paid - redirect to track
	if (paymentStatus !== "pending_payment") {
		return (
			<div className="container max-w-xl py-16 flex flex-col items-center justify-center min-h-[60vh]">
				<CheckCircle className="h-12 w-12 text-green-600" />
				<h2 className="mt-4 text-xl font-semibold">Payment already completed</h2>
				<p className="mt-2 text-muted-foreground text-center">
					Your booking is confirmed.{" "}
					<Link to="/track/$token" params={{ token }} className="text-primary underline">
						View your booking
					</Link>
				</p>
			</div>
		);
	}

	if (!squareConfig || squareConfigLoading) {
		return (
			<div className="container max-w-xl py-16 flex flex-col items-center justify-center min-h-[60vh]">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading payment form...</p>
			</div>
		);
	}

	return (
		<div className="container max-w-xl py-8 px-4">
			<div className="mb-8">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<CreditCard className="h-7 w-7" />
					Complete Your Payment
				</h1>
				<p className="text-muted-foreground mt-1">
					Secure payment to confirm your chauffeur booking
				</p>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>{booking.referenceNumber || `#${booking.id.slice(-6)}`}</CardTitle>
					<CardDescription>Booking details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-3">
						<MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<div>
							<p className="text-sm text-muted-foreground">Route</p>
							<p className="font-medium">{booking.originAddress} → {booking.destinationAddress}</p>
						</div>
					</div>
					<div className="flex gap-4">
						<div className="flex gap-2">
							<Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
							<div>
								<p className="text-sm text-muted-foreground">Date</p>
								<p className="font-medium">{format(new Date(booking.scheduledPickupTime), "PPP")}</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Clock className="h-5 w-5 text-muted-foreground shrink-0" />
							<div>
								<p className="text-sm text-muted-foreground">Time</p>
								<p className="font-medium">{format(new Date(booking.scheduledPickupTime), "p")}</p>
							</div>
						</div>
					</div>
					<div className="pt-4 border-t flex justify-between items-center">
						<span className="text-muted-foreground">Amount to authorize</span>
						<span className="text-2xl font-bold">${(booking.quotedAmount ?? 0).toFixed(2)}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Payment</CardTitle>
					<CardDescription>
						Your card will be authorized now. The final amount will be charged after your trip is completed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SquarePaymentForm
						applicationId={squareConfig.applicationId}
						locationId={squareConfig.locationId}
						amountCents={amountCents}
						bookingId={booking.id}
						onAuthorized={handleAuthorized}
						onError={(msg) => toast.error(msg)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
