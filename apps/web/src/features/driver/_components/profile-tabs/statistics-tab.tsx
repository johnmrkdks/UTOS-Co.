import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
	CarIcon,
	StarIcon,
	CreditCardIcon,
	CalendarIcon,
	TrendingUpIcon
} from "lucide-react";

interface StatisticsTabProps {
	driverProfile: any;
}

export function StatisticsTab({ driverProfile }: StatisticsTabProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Total Trips</span>
							<CarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold">{driverProfile.statistics.totalTrips}</div>
						<p className="text-xs text-gray-500">Completed rides</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Rating</span>
							<StarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold">{driverProfile.statistics.averageRating}</div>
						<p className="text-xs text-gray-500">Out of 5.0</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Earnings</span>
							<CreditCardIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold">${driverProfile.statistics.totalEarnings}</div>
						<p className="text-xs text-gray-500">Lifetime</p>
					</CardContent>
				</Card>

				<Card className="p-3">
					<CardHeader className="p-0 pb-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600">Member</span>
							<CalendarIcon className="h-3 w-3 text-gray-400" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-lg font-bold">
							{new Date(driverProfile.statistics.memberSince).toLocaleDateString('en-AU', {
								month: 'short',
								year: 'numeric'
							})}
						</div>
						<p className="text-xs text-gray-500">Since</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Performance Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-6">
						<TrendingUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
						<p className="text-sm text-gray-600">Detailed performance metrics will be available once you start driving.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}