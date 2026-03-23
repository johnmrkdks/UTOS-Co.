import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import {
	Activity,
	AlertCircle,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	DollarSign,
	Edit,
	Globe,
	ImageIcon,
	Info,
	MapPin,
	Package,
	Route as RouteIcon,
	Settings,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";

interface PackageOverviewTabProps {
	pkg: any;
	routes: any[];
	onToggleAvailable: () => void;
	isUpdating: boolean;
}

export function PackageOverviewTab({
	pkg,
	routes,
	onToggleAvailable,
	isUpdating,
}: PackageOverviewTabProps) {
	// Parse available days from JSON string
	const availableDays = pkg?.availableDays ? JSON.parse(pkg.availableDays) : [];
	const dayLabels = {
		monday: "Mon",
		tuesday: "Tue",
		wednesday: "Wed",
		thursday: "Thu",
		friday: "Fri",
		saturday: "Sat",
		sunday: "Sun",
	};

	// Calculate route statistics
	const totalDuration = routes.reduce(
		(sum: number, route: any) => sum + (route.estimatedDuration || 0),
		0,
	);
	const pickupPoints = routes.filter((route: any) => route.isPickupPoint);
	const dropoffPoints = routes.filter((route: any) => route.isDropoffPoint);

	return (
		<div className="space-y-6">
			{/* Banner Image */}
			{pkg?.bannerImageUrl ? (
				<div className="relative overflow-hidden rounded-lg border">
					<img
						src={pkg.bannerImageUrl}
						alt={`${pkg.name} banner`}
						className="h-48 w-full object-cover"
						onError={(e) => {
							e.currentTarget.style.display = "none";
							e.currentTarget.nextElementSibling?.classList.remove("hidden");
						}}
					/>
					{/* Fallback for broken image */}
					<div className="flex hidden h-48 w-full items-center justify-center bg-gray-100">
						<div className="text-center text-gray-500">
							<ImageIcon className="mx-auto mb-2 h-12 w-12" />
							<p className="text-sm">Image not available</p>
						</div>
					</div>
					{/* Overlay with package info */}
					<div className="absolute inset-0 bg-black/40">
						<div className="absolute right-0 bottom-0 left-0 p-6 text-white">
							<h3 className="mb-2 font-bold text-2xl">{pkg?.name}</h3>
							<div className="flex items-center gap-2">
								<Badge
									variant={pkg?.isAvailable ? "default" : "secondary"}
									className="border-white/30 bg-white/20 text-white text-xs"
								>
									{pkg?.isAvailable ? (
										<>
											<CheckCircle className="mr-1 h-3 w-3" />
											Available
										</>
									) : (
										<>
											<AlertCircle className="mr-1 h-3 w-3" />
											Unavailable
										</>
									)}
								</Badge>
								{pkg?.isPublished && (
									<Badge
										variant="outline"
										className="border-white/30 bg-white/20 text-white text-xs"
									>
										<Globe className="mr-1 h-3 w-3" />
										Published
									</Badge>
								)}
								<Badge
									variant="outline"
									className="border-white/30 bg-white/20 text-white text-xs"
								>
									<Shield className="mr-1 h-3 w-3" />
									{pkg?.serviceType || "Standard"}
								</Badge>
							</div>
						</div>
						{/* Availability toggle in top-right */}
						<div className="absolute top-4 right-4">
							<div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 backdrop-blur-sm">
								<Switch
									checked={pkg?.isAvailable || false}
									onCheckedChange={onToggleAvailable}
									disabled={isUpdating}
								/>
								<span className="font-medium text-gray-700 text-xs">
									Available
								</span>
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					{/* No banner image - show header card instead */}
					<div className="relative overflow-hidden rounded-lg border bg-blue-50 p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
									<Package className="h-6 w-6 text-white" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 text-xl">
										{pkg?.name}
									</h3>
									<div className="mt-1 flex items-center gap-2">
										<Badge
											variant={pkg?.isAvailable ? "default" : "secondary"}
											className="text-xs"
										>
											{pkg?.isAvailable ? (
												<>
													<CheckCircle className="mr-1 h-3 w-3" />
													Available
												</>
											) : (
												<>
													<AlertCircle className="mr-1 h-3 w-3" />
													Unavailable
												</>
											)}
										</Badge>
										{pkg?.isPublished && (
											<Badge variant="outline" className="text-xs">
												<Globe className="mr-1 h-3 w-3" />
												Published
											</Badge>
										)}
										<Badge variant="outline" className="text-xs">
											<Shield className="mr-1 h-3 w-3" />
											{pkg?.serviceType || "Standard"}
										</Badge>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={pkg?.isAvailable || false}
									onCheckedChange={onToggleAvailable}
									disabled={isUpdating}
								/>
								<span className="font-medium text-gray-700 text-sm">
									Available for Booking
								</span>
							</div>
						</div>
						{/* Banner image placeholder */}
						<div className="mt-4 rounded-lg border-2 border-gray-300 border-dashed p-4 text-center text-gray-500">
							<ImageIcon className="mx-auto mb-2 h-8 w-8" />
							<p className="text-sm">No banner image uploaded</p>
							<p className="text-muted-foreground text-xs">
								Add a banner image to make this package more appealing
							</p>
						</div>
					</div>
				</>
			)}

			{/* Key Metrics */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 h-1 w-full bg-green-500" />
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Daily Rate
								</p>
								<p className="font-bold text-2xl text-green-600">
									${pkg?.pricePerDay?.toFixed(2) || "0.00"}
								</p>
							</div>
							<div className="rounded-lg bg-green-100 p-2">
								<DollarSign className="h-5 w-5 text-green-600" />
							</div>
						</div>
						<div className="mt-2 flex items-center gap-1">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="font-medium text-green-600 text-xs">
								Competitive pricing
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Route Stops
								</p>
								<p className="font-bold text-2xl text-blue-600">
									{routes.length}
								</p>
							</div>
							<div className="rounded-lg bg-blue-100 p-2">
								<RouteIcon className="h-5 w-5 text-blue-600" />
							</div>
						</div>
						<div className="mt-2 flex items-center gap-1">
							<MapPin className="h-3 w-3 text-blue-500" />
							<span className="font-medium text-blue-600 text-xs">
								{pickupPoints.length} pickup, {dropoffPoints.length} dropoff
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 h-1 w-full bg-purple-500" />
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Duration
								</p>
								<p className="font-bold text-2xl text-purple-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="rounded-lg bg-purple-100 p-2">
								<Clock className="h-5 w-5 text-purple-600" />
							</div>
						</div>
						<div className="mt-2 flex items-center gap-1">
							<Activity className="h-3 w-3 text-purple-500" />
							<span className="font-medium text-purple-600 text-xs">
								Total experience time
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Package Description */}
			<Card className="border-l-4 border-l-blue-500">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Info className="h-5 w-5 text-blue-500" />
						Package Description
					</CardTitle>
				</CardHeader>
				<CardContent>
					{pkg?.description ? (
						<p className="text-gray-700 text-sm leading-relaxed">
							{pkg.description}
						</p>
					) : (
						<div className="flex items-center gap-2 text-muted-foreground">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">
								No description provided. Consider adding a detailed description
								to attract customers.
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Operational Details */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Scheduling Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Calendar className="h-5 w-5 text-green-500" />
							Availability & Schedule
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Operating Hours
								</span>
								<span className="font-medium text-sm">
									{pkg?.availableTimeStart || "09:00"} -{" "}
									{pkg?.availableTimeEnd || "17:00"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Advance Booking
								</span>
								<span className="font-medium text-sm">
									{pkg?.advanceBookingHours || 24} hours
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Cancellation Notice
								</span>
								<span className="font-medium text-sm">
									{pkg?.cancellationHours || 24} hours
								</span>
							</div>
							{availableDays.length > 0 && (
								<div>
									<span className="mb-2 block text-muted-foreground text-sm">
										Available Days
									</span>
									<div className="flex flex-wrap gap-1">
										{availableDays.map((day: string) => (
											<Badge key={day} variant="secondary" className="text-xs">
												{dayLabels[day as keyof typeof dayLabels] || day}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Package Metadata */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Activity className="h-5 w-5 text-purple-500" />
							Package Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Package ID
								</span>
								<span className="font-medium font-mono text-sm">{pkg?.id}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Service Type
								</span>
								<Badge variant="outline" className="text-xs">
									{pkg?.serviceType || "Standard Package"}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Created</span>
								<span className="font-medium text-sm">
									{pkg?.createdAt
										? new Date(pkg.createdAt).toLocaleDateString("en-US", {
												weekday: "short",
												year: "numeric",
												month: "short",
												day: "numeric",
											})
										: "Unknown"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Last Updated
								</span>
								<span className="font-medium text-sm">
									{pkg?.updatedAt
										? new Date(pkg.updatedAt).toLocaleDateString("en-US", {
												weekday: "short",
												year: "numeric",
												month: "short",
												day: "numeric",
											})
										: "Unknown"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			{/* <Card className="border-dashed"> */}
			{/* 	<CardHeader className="pb-3"> */}
			{/* 		<CardTitle className="text-lg flex items-center gap-2"> */}
			{/* 			<Settings className="h-5 w-5 text-gray-500" /> */}
			{/* 			Quick Actions */}
			{/* 		</CardTitle> */}
			{/* 		<CardDescription> */}
			{/* 			Common package management tasks */}
			{/* 		</CardDescription> */}
			{/* 	</CardHeader> */}
			{/* 	<CardContent> */}
			{/* 		<div className="flex flex-wrap gap-2"> */}
			{/* 			<Button variant="outline" size="sm" className="flex items-center gap-2"> */}
			{/* 				<RouteIcon className="h-4 w-4" /> */}
			{/* 				Manage Routes */}
			{/* 			</Button> */}
			{/* 			<Button variant="outline" size="sm" className="flex items-center gap-2"> */}
			{/* 				<Calendar className="h-4 w-4" /> */}
			{/* 				Manage Schedule */}
			{/* 			</Button> */}
			{/* 			<Button variant="outline" size="sm" className="flex items-center gap-2"> */}
			{/* 				<Edit className="h-4 w-4" /> */}
			{/* 				Edit Package */}
			{/* 			</Button> */}
			{/* 			<Button variant="outline" size="sm" className="flex items-center gap-2"> */}
			{/* 				<Users className="h-4 w-4" /> */}
			{/* 				View Bookings */}
			{/* 			</Button> */}
			{/* 		</div> */}
			{/* 	</CardContent> */}
			{/* </Card> */}
		</div>
	);
}
