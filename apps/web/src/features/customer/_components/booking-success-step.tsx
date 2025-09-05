import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Calendar, Car, MapPin, ArrowRight, History } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface BookingSuccessStepProps {
	bookingId?: string;
	onStartNewQuote: () => void;
}

export function BookingSuccessStep({ bookingId, onStartNewQuote }: BookingSuccessStepProps) {
	const router = useRouter();

	const goToBookings = () => {
		router.navigate({ to: "/dashboard/bookings" });
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<div className="flex justify-center mb-4">
					<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
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
					<div className="bg-muted/50 p-4 rounded-lg text-center">
						<div className="text-sm text-muted-foreground">Booking Reference</div>
						<div className="font-mono font-medium text-lg">{bookingId}</div>
						<div className="text-xs text-muted-foreground mt-1">
							Please save this reference number for your records
						</div>
					</div>
				)}

				<div className="space-y-3 text-sm">
					<div className="flex items-center gap-3 p-3 border rounded-lg">
						<Calendar className="h-5 w-5 text-primary" />
						<div>
							<div className="font-medium">What's Next?</div>
							<div className="text-muted-foreground">
								We'll send you booking confirmation and driver details via SMS/Email
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 border rounded-lg">
						<Car className="h-5 w-5 text-primary" />
						<div>
							<div className="font-medium">Driver Assignment</div>
							<div className="text-muted-foreground">
								A professional driver will be assigned 30 minutes before pickup
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 border rounded-lg">
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
						<History className="h-4 w-4 mr-2" />
						View My Bookings
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>

					<Button variant="outline" onClick={onStartNewQuote} className="w-full">
						Book Another Journey
					</Button>
				</div>

				<div className="text-center text-xs text-muted-foreground">
					Need help? Contact our customer support at support@downunderchauffeur.com
				</div>
			</CardContent>
		</Card>
	);
}