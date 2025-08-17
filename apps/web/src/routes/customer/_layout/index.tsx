import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Car, Calendar, Star, Package, Clock } from "lucide-react";

export const Route = createFileRoute("/customer/_layout/")({
	component: CustomerDashboard,
});

function CustomerDashboard() {

	return (
		<div className="space-y-6 md:space-y-8">
			{/* Welcome Section */}
			<div className="space-y-2 text-center md:text-left">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back!</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					Manage your luxury travel bookings and discover our premium packages.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							No active bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							No upcoming trips
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Trips</CardTitle>
						<Car className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							Completed trips
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Package className="h-5 w-5" />
							<span>Browse Luxury Services</span>
						</CardTitle>
						<CardDescription>
							Discover our curated luxury travel services and book your next journey.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 md:space-y-4">
							<p className="text-sm text-muted-foreground leading-relaxed">
								Choose from our premium services including airport transfers, 
								city tours, wine country experiences, and special event transportation.
							</p>
							<Button className="w-full h-11" asChild>
								<a href="/customer/services">
									<Package className="h-4 w-4 mr-2" />
									Browse Services
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Car className="h-5 w-5" />
							<span>Custom Car Booking</span>
						</CardTitle>
						<CardDescription>
							Get an instant quote for a custom car booking with flexible routes.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 md:space-y-4">
							<p className="text-sm text-muted-foreground leading-relaxed">
								Need something specific? Create a custom booking with multiple stops, 
								flexible timing, and personalized service requirements.
							</p>
							<Button className="w-full h-11" variant="outline" asChild>
								<a href="/customer/instant-quote">
									<Car className="h-4 w-4 mr-2" />
									Get Instant Quote
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Bookings */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Bookings</CardTitle>
					<CardDescription>
						Your latest bookings and their current status.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
						<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
							<Calendar className="h-6 w-6 text-muted-foreground" />
						</div>
						<h3 className="font-semibold mb-2 text-base">No bookings yet</h3>
						<p className="text-muted-foreground text-sm mb-4 max-w-sm leading-relaxed">
							Your booking history will appear here once you make your first booking.
						</p>
						<Button variant="outline" className="h-10" asChild>
							<a href="/customer/services">
								<Package className="h-4 w-4 mr-2" />
								Browse Services
							</a>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}