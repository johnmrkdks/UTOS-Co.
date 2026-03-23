import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	CalendarIcon,
	CarIcon,
	CreditCardIcon,
	StarIcon,
	TrendingUpIcon,
} from "lucide-react";

interface StatisticsTabProps {
	driverProfile: any;
}

export function StatisticsTab({ driverProfile }: StatisticsTabProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-gray-600 text-xs">
								Total Trips
							</span>
							<CarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="font-bold text-lg">
							{driverProfile.statistics.totalTrips}
						</div>
						<p className="text-gray-500 text-xs">Completed rides</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-gray-600 text-xs">Rating</span>
							<StarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="font-bold text-lg">
							{driverProfile.statistics.averageRating}
						</div>
						<p className="text-gray-500 text-xs">Out of 5.0</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-gray-600 text-xs">
								Earnings
							</span>
							<CreditCardIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="font-bold text-lg">
							${driverProfile.statistics.totalEarnings}
						</div>
						<p className="text-gray-500 text-xs">Lifetime</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-gray-600 text-xs">Member</span>
							<CalendarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="font-bold text-lg">
							{new Date(
								driverProfile.statistics.memberSince,
							).toLocaleDateString("en-AU", {
								month: "short",
								year: "numeric",
							})}
						</div>
						<p className="text-gray-500 text-xs">Since</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Performance Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-6 text-center">
						<TrendingUpIcon className="mx-auto mb-3 h-8 w-8 text-gray-400" />
						<p className="text-gray-600 text-sm">
							Detailed performance metrics will be available once you start
							driving.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
