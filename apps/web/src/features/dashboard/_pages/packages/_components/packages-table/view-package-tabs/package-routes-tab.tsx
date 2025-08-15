import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { 
	Route as RouteIcon, 
	Clock, 
	MapPin, 
	Car, 
	ArrowDown, 
	Plus 
} from "lucide-react";

interface PackageRoutesTabProps {
	routes: any[];
}

export function PackageRoutesTab({ routes }: PackageRoutesTabProps) {
	// Calculate route statistics
	const totalDuration = routes.reduce((sum: number, route: any) => sum + (route.estimatedDuration || 0), 0);
	const pickupPoints = routes.filter((route: any) => route.isPickupPoint);
	const dropoffPoints = routes.filter((route: any) => route.isDropoffPoint);

	if (routes.length === 0) {
		return (
			<Card className="border-dashed border-2">
				<CardContent className="py-12 text-center">
					<div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
						<RouteIcon className="h-12 w-12 text-blue-600" />
					</div>
					<h3 className="text-xl font-semibold mb-3">No routes configured</h3>
					<p className="text-muted-foreground mb-6 max-w-md mx-auto">
						This package doesn't have any route stops configured yet. Add stops to create a comprehensive travel experience for your customers.
					</p>
					<Button variant="outline" className="mx-auto">
						<Plus className="mr-2 h-4 w-4" />
						Add Routes
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Enhanced Route Summary with Visual Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="relative overflow-hidden border-l-4 border-l-blue-500">
					<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
						<RouteIcon className="w-full h-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Stops</p>
								<p className="text-2xl font-bold text-blue-600">{routes.length}</p>
							</div>
							<div className="p-2 bg-blue-100 rounded-lg">
								<RouteIcon className="h-5 w-5 text-blue-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-purple-500">
					<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
						<Clock className="w-full h-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Duration</p>
								<p className="text-2xl font-bold text-purple-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="p-2 bg-purple-100 rounded-lg">
								<Clock className="h-5 w-5 text-purple-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-green-500">
					<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
						<Car className="w-full h-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Pickup Points</p>
								<p className="text-2xl font-bold text-green-600">{pickupPoints.length}</p>
							</div>
							<div className="p-2 bg-green-100 rounded-lg">
								<Car className="h-5 w-5 text-green-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-orange-500">
					<div className="absolute top-0 right-0 w-16 h-16 opacity-10">
						<ArrowDown className="w-full h-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Drop-off Points</p>
								<p className="text-2xl font-bold text-orange-600">{dropoffPoints.length}</p>
							</div>
							<div className="p-2 bg-orange-100 rounded-lg">
								<ArrowDown className="h-5 w-5 text-orange-600" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Route Timeline */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl flex items-center gap-2">
								<RouteIcon className="h-5 w-5 text-blue-500" />
								Route Timeline
							</CardTitle>
							<CardDescription>
								Complete journey with stops, durations, and service points
							</CardDescription>
						</div>
						<Badge variant="outline" className="text-sm">
							{routes.length} stops
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

						<div className="space-y-6">
							{routes
								.sort((a: any, b: any) => a.stopOrder - b.stopOrder)
								.map((route: any, index: number) => {
									const isFirst = index === 0;
									const isLast = index === routes.length - 1;
									const progressPercentage = ((index + 1) / routes.length) * 100;

									return (
										<div key={route.id} className="relative flex items-start gap-6">
											{/* Timeline marker */}
											<div className="relative z-10 flex-shrink-0">
												<div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${isFirst ? 'bg-green-500' :
														isLast ? 'bg-red-500' :
															'bg-blue-500'
													}`}>
													{index + 1}
												</div>
												{/* Progress indicator */}
												<div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center">
													<div className="w-2 h-2 bg-green-500 rounded-full" />
												</div>
											</div>

											{/* Stop content */}
											<div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
												<div className="flex items-start justify-between mb-3">
													<div className="flex-1">
														<h4 className="font-semibold text-lg text-gray-900 mb-1">{route.locationName}</h4>
														<div className="flex items-center gap-2 mb-2">
															{route.isPickupPoint && (
																<Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
																	<Car className="mr-1 h-3 w-3" />
																	Pickup Available
																</Badge>
															)}
															{route.isDropoffPoint && (
																<Badge variant="default" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
																	<ArrowDown className="mr-1 h-3 w-3" />
																	Drop-off Available
																</Badge>
															)}
															{!route.isPickupPoint && !route.isDropoffPoint && (
																<Badge variant="secondary" className="text-xs">
																	<MapPin className="mr-1 h-3 w-3" />
																	Scenic Stop
																</Badge>
															)}
														</div>
													</div>
													{route.estimatedDuration && (
														<div className="text-right">
															<div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
																<Clock className="inline h-3 w-3 mr-1" />
																{route.estimatedDuration}min
															</div>
														</div>
													)}
												</div>

												<div className="flex items-start gap-2 text-sm text-muted-foreground">
													<MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
													<p className="leading-relaxed">{route.address}</p>
												</div>

												{/* Route progress bar */}
												<div className="mt-4 pt-3 border-t border-gray-100">
													<div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
														<span>Journey Progress</span>
														<span>{progressPercentage.toFixed(0)}%</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-1.5">
														<div
															className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
															style={{ width: `${progressPercentage}%` }}
														/>
													</div>
												</div>
											</div>
										</div>
									);
								})}
						</div>
					</div>

					{/* Route Summary Footer */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="bg-blue-50 rounded-lg p-3">
								<p className="text-sm text-muted-foreground">Total Journey</p>
								<p className="font-semibold text-blue-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="bg-green-50 rounded-lg p-3">
								<p className="text-sm text-muted-foreground">Pickup Options</p>
								<p className="font-semibold text-green-600">{pickupPoints.length} locations</p>
							</div>
							<div className="bg-orange-50 rounded-lg p-3">
								<p className="text-sm text-muted-foreground">Drop-off Options</p>
								<p className="font-semibold text-orange-600">{dropoffPoints.length} locations</p>
							</div>
							<div className="bg-purple-50 rounded-lg p-3">
								<p className="text-sm text-muted-foreground">Experience Points</p>
								<p className="font-semibold text-purple-600">{routes.length} stops</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}