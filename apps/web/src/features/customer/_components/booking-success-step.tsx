import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	ArrowRight,
	Calendar,
	Car,
	CheckCircle,
	History,
	MapPin,
} from "lucide-react";

interface BookingSuccessStepProps {
	bookingId?: string;
	onStartNewQuote: () => void;
}

export function BookingSuccessStep({
	bookingId,
	onStartNewQuote,
}: BookingSuccessStepProps) {
	const router = useRouter();

	const goToBookings = () => {
		router.navigate({ to: "/my-bookings", resetScroll: true });
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<div className="mb-4 flex justify-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
						<CheckCircle className="h-8 w-8 text-white" />
					</div>
				</div>
				<CardTitle className="text-xl">Booking Confirmed!</CardTitle>
				<CardDescription>
					Your luxury car booking has been successfully created
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{bookingId && (
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<div className="text-muted-foreground text-sm">
							Booking Reference
						</div>
						<div className="font-medium font-mono text-lg">{bookingId}</div>
						<div className="mt-1 text-muted-foreground text-xs">
							Please save this reference number for your records
						</div>
					</div>
				)}

				<div className="space-y-3 text-sm">
					<div className="flex items-center gap-3 rounded-lg border p-3">
						<Calendar className="h-5 w-5 text-primary" />
						<div>
							<div className="font-medium">What's Next?</div>
							<div className="text-muted-foreground">
								We'll send you booking confirmation and driver details via
								SMS/Email
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg border p-3">
						<Car className="h-5 w-5 text-primary" />
						<div>
							<div className="font-medium">Driver Assignment</div>
							<div className="text-muted-foreground">
								A professional driver will be assigned 30 minutes before pickup
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg border p-3">
						<MapPin className="h-5 w-5 text-primary" />
						<div>
							<div className="font-medium">Real-time Tracking</div>
							<div className="text-muted-foreground">
								Track your driver's location in real-time on booking day
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Button onClick={goToBookings} className="w-full">
						<History className="mr-2 h-4 w-4" />
						View My Bookings
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>

					<Button
						variant="outline"
						onClick={onStartNewQuote}
						className="w-full"
					>
						Book Another Journey
					</Button>
				</div>

				<div className="text-center text-muted-foreground text-xs">
					Need help? Contact our customer support at
					support@downunderchauffeur.com
				</div>
			</CardContent>
		</Card>
	);
}
