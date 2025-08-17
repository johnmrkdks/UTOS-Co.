import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Calendar, Package, Car, Clock } from "lucide-react";

export const Route = createFileRoute("/customer/_layout/bookings")({
	component: CustomerBookingsPage,
});

function CustomerBookingsPage() {
	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="space-y-2 text-center md:text-left">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Bookings</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					View and manage your luxury travel bookings.
				</p>
			</div>

			{/* Booking Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs md:text-sm font-medium">Upcoming</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl md:text-2xl font-bold">0</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs md:text-sm font-medium">In Progress</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl md:text-2xl font-bold">0</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
						<Car className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl md:text-2xl font-bold">0</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-xl md:text-2xl font-bold">0</div>
					</CardContent>
				</Card>
			</div>

			{/* Bookings List */}
			<Card>
				<CardHeader>
					<CardTitle>Booking History</CardTitle>
					<CardDescription>
						All your past and upcoming bookings with real-time status tracking.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
						<div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
						</div>
						<h3 className="font-semibold text-base md:text-lg mb-2">No bookings yet</h3>
						<p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed px-4 md:px-0">
							You haven't made any bookings yet. Start by browsing our 
							luxury packages to book your next journey.
						</p>
						<Button disabled className="h-10 md:h-11 w-full max-w-xs">
							<Package className="h-4 w-4 mr-2" />
							Browse Packages
						</Button>
						<p className="text-xs text-center text-muted-foreground mt-4">
							Package booking system coming soon
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}