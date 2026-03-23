import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	ArrowDown,
	Car,
	Clock,
	MapPin,
	Plus,
	Route as RouteIcon,
} from "lucide-react";

interface PackageRoutesTabProps {
	routes: any[];
}

export function PackageRoutesTab({ routes }: PackageRoutesTabProps) {
	// Calculate route statistics
	const totalDuration = routes.reduce(
		(sum: number, route: any) => sum + (route.estimatedDuration || 0),
		0,
	);
	const pickupPoints = routes.filter((route: any) => route.isPickupPoint);
	const dropoffPoints = routes.filter((route: any) => route.isDropoffPoint);

	if (routes.length === 0) {
		return (
			<Card className="border-2 border-dashed">
				<CardContent className="py-12 text-center">
					<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
						<RouteIcon className="h-12 w-12 text-blue-600" />
					</div>
					<h3 className="mb-3 font-semibold text-xl">No routes configured</h3>
					<p className="mx-auto mb-6 max-w-md text-muted-foreground">
						This package doesn't have any route stops configured yet. Add stops
						to create a comprehensive travel experience for your customers.
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
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="relative overflow-hidden border-l-4 border-l-blue-500">
					<div className="absolute top-0 right-0 h-16 w-16 opacity-10">
						<RouteIcon
							className="h-full w-full text-gray-600"
							strokeWidth={0.5}
						/>
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Total Stops
								</p>
								<p className="font-bold text-2xl text-blue-600">
									{routes.length}
								</p>
							</div>
							<div className="rounded-lg bg-blue-100 p-2">
								<RouteIcon className="h-5 w-5 text-blue-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-purple-500">
					<div className="absolute top-0 right-0 h-16 w-16 opacity-10">
						<Clock className="h-full w-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Total Duration
								</p>
								<p className="font-bold text-2xl text-purple-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="rounded-lg bg-purple-100 p-2">
								<Clock className="h-5 w-5 text-purple-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-green-500">
					<div className="absolute top-0 right-0 h-16 w-16 opacity-10">
						<Car className="h-full w-full text-gray-600" strokeWidth={0.5} />
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Pickup Points
								</p>
								<p className="font-bold text-2xl text-green-600">
									{pickupPoints.length}
								</p>
							</div>
							<div className="rounded-lg bg-green-100 p-2">
								<Car className="h-5 w-5 text-green-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-orange-500">
					<div className="absolute top-0 right-0 h-16 w-16 opacity-10">
						<ArrowDown
							className="h-full w-full text-gray-600"
							strokeWidth={0.5}
						/>
					</div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Drop-off Points
								</p>
								<p className="font-bold text-2xl text-orange-600">
									{dropoffPoints.length}
								</p>
							</div>
							<div className="rounded-lg bg-orange-100 p-2">
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
							<CardTitle className="flex items-center gap-2 text-xl">
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
						<div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-300" />

						<div className="space-y-6">
							{routes
								.sort((a: any, b: any) => a.stopOrder - b.stopOrder)
								.map((route: any, index: number) => {
									const isFirst = index === 0;
									const isLast = index === routes.length - 1;
									const progressPercentage =
										((index + 1) / routes.length) * 100;

									return (
										<div
											key={route.id}
											className="relative flex items-start gap-6"
										>
											{/* Timeline marker */}
											<div className="relative z-10 flex-shrink-0">
												<div
													className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white shadow-lg ${
														isFirst
															? "bg-green-500"
															: isLast
																? "bg-red-500"
																: "bg-blue-500"
													}`}
												>
													{index + 1}
												</div>
												{/* Progress indicator */}
												<div className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
													<div className="h-2 w-2 rounded-full bg-green-500" />
												</div>
											</div>

											{/* Stop content */}
											<div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
												<div className="mb-3 flex items-start justify-between">
													<div className="flex-1">
														<h4 className="mb-1 font-semibold text-gray-900 text-lg">
															{route.locationName}
														</h4>
														<div className="mb-2 flex items-center gap-2">
															{route.isPickupPoint && (
																<Badge
																	variant="default"
																	className="border-green-200 bg-green-100 text-green-700 text-xs"
																>
																	<Car className="mr-1 h-3 w-3" />
																	Pickup Available
																</Badge>
															)}
															{route.isDropoffPoint && (
																<Badge
																	variant="default"
																	className="border-orange-200 bg-orange-100 text-orange-700 text-xs"
																>
																	<ArrowDown className="mr-1 h-3 w-3" />
																	Drop-off Available
																</Badge>
															)}
															{!route.isPickupPoint &&
																!route.isDropoffPoint && (
																	<Badge
																		variant="secondary"
																		className="text-xs"
																	>
																		<MapPin className="mr-1 h-3 w-3" />
																		Scenic Stop
																	</Badge>
																)}
														</div>
													</div>
													{route.estimatedDuration && (
														<div className="text-right">
															<div className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 text-sm">
																<Clock className="mr-1 inline h-3 w-3" />
																{route.estimatedDuration}min
															</div>
														</div>
													)}
												</div>

												<div className="flex items-start gap-2 text-muted-foreground text-sm">
													<MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
													<p className="leading-relaxed">{route.address}</p>
												</div>

												{/* Route progress bar */}
												<div className="mt-4 border-gray-100 border-t pt-3">
													<div className="mb-2 flex items-center justify-between text-muted-foreground text-xs">
														<span>Journey Progress</span>
														<span>{progressPercentage.toFixed(0)}%</span>
													</div>
													<div className="h-1.5 w-full rounded-full bg-gray-200">
														<div
															className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
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
					<div className="mt-8 border-gray-200 border-t pt-6">
						<div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
							<div className="rounded-lg bg-blue-50 p-3">
								<p className="text-muted-foreground text-sm">Total Journey</p>
								<p className="font-semibold text-blue-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="rounded-lg bg-green-50 p-3">
								<p className="text-muted-foreground text-sm">Pickup Options</p>
								<p className="font-semibold text-green-600">
									{pickupPoints.length} locations
								</p>
							</div>
							<div className="rounded-lg bg-orange-50 p-3">
								<p className="text-muted-foreground text-sm">
									Drop-off Options
								</p>
								<p className="font-semibold text-orange-600">
									{dropoffPoints.length} locations
								</p>
							</div>
							<div className="rounded-lg bg-purple-50 p-3">
								<p className="text-muted-foreground text-sm">
									Experience Points
								</p>
								<p className="font-semibold text-purple-600">
									{routes.length} stops
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
