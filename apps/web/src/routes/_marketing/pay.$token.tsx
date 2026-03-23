import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Loader2,
	MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useGetBookingByShareTokenQuery } from "@/features/booking-tracking/_hooks/use-get-booking-by-share-token-query";
import { SquarePaymentForm } from "@/features/payments/_components/square-payment-form";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/_marketing/pay/$token")({
	component: PayBookingPage,
});

function PayBookingPage() {
	const { token } = useParams({ from: "/_marketing/pay/$token" });
	const navigate = useNavigate();
	const {
		data: booking,
		isLoading,
		error,
	} = useGetBookingByShareTokenQuery(token);
	const { data: squareConfig, isLoading: squareConfigLoading } = useQuery({
		...trpc.payments.getSquareConfig.queryOptions(),
		enabled:
			!!booking?.id &&
			(booking as { paymentStatus?: string }).paymentStatus ===
				"pending_payment",
	});

	const amountCents = Math.round((booking?.quotedAmount ?? 0) * 100);

	const handleAuthorized = () => {
		toast.success("Payment authorized! Your booking is confirmed.");
		navigate({ to: "/track/$token", params: { token } });
	};

	if (isLoading) {
		return (
			<div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="mt-4 font-semibold text-xl">Booking not found</h2>
				<p className="mt-2 max-w-sm text-center text-muted-foreground">
					The payment link may be invalid or expired. Please contact us if you
					need assistance.
				</p>
			</div>
		);
	}

	const paymentStatus = (booking as { paymentStatus?: string }).paymentStatus;

	// Already paid - redirect to track
	if (paymentStatus !== "pending_payment") {
		return (
			<div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16">
				<CheckCircle className="h-12 w-12 text-green-600" />
				<h2 className="mt-4 font-semibold text-xl">
					Payment already completed
				</h2>
				<p className="mt-2 text-center text-muted-foreground">
					Your booking is confirmed.{" "}
					<Link
						to="/track/$token"
						params={{ token }}
						className="text-primary underline"
					>
						View your booking
					</Link>
				</p>
			</div>
		);
	}

	if (!squareConfig || squareConfigLoading) {
		return (
			<div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16">
				<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading payment form...</p>
			</div>
		);
	}

	return (
		<div className="container max-w-xl px-4 py-8">
			<div className="mb-8">
				<h1 className="flex items-center gap-2 font-bold text-2xl">
					<CreditCard className="h-7 w-7" />
					Complete Your Payment
				</h1>
				<p className="mt-1 text-muted-foreground">
					Secure payment to confirm your chauffeur booking
				</p>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>
						{booking.referenceNumber || `#${booking.id.slice(-6)}`}
					</CardTitle>
					<CardDescription>Booking details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-3">
						<MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
						<div>
							<p className="text-muted-foreground text-sm">Route</p>
							<p className="font-medium">
								{booking.originAddress} → {booking.destinationAddress}
							</p>
						</div>
					</div>
					<div className="flex gap-4">
						<div className="flex gap-2">
							<Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Date</p>
								<p className="font-medium">
									{format(new Date(booking.scheduledPickupTime), "PPP")}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Time</p>
								<p className="font-medium">
									{format(new Date(booking.scheduledPickupTime), "p")}
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-between border-t pt-4">
						<span className="text-muted-foreground">Amount to authorize</span>
						<span className="font-bold text-2xl">
							${(booking.quotedAmount ?? 0).toFixed(2)}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Payment</CardTitle>
					<CardDescription>
						Your card will be authorized now. The final amount will be charged
						after your trip is completed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SquarePaymentForm
						applicationId={squareConfig.applicationId}
						locationId={squareConfig.locationId}
						amountCents={amountCents}
						bookingId={booking.id}
						onAuthorized={handleAuthorized}
						onError={(msg) =>
							toast.error("Payment failed", { description: msg })
						}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
