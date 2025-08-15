import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
	Calendar,
	DollarSign,
	Info,
	Package,
	Settings,
	Route as RouteIcon,
	Clock,
	MapPin,
	Car,
	Edit,
	TrendingUp,
	Users,
	AlertCircle,
	CheckCircle,
	Activity,
	Globe,
	Shield,
	ImageIcon
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
	isUpdating
}: PackageOverviewTabProps) {
	// Parse available days from JSON string
	const availableDays = pkg?.availableDays ? JSON.parse(pkg.availableDays) : [];
	const dayLabels = {
		monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
		friday: "Fri", saturday: "Sat", sunday: "Sun"
	};

	// Calculate route statistics
	const totalDuration = routes.reduce((sum: number, route: any) => sum + (route.estimatedDuration || 0), 0);
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
						className="w-full h-48 object-cover"
						onError={(e) => {
							e.currentTarget.style.display = 'none';
							e.currentTarget.nextElementSibling?.classList.remove('hidden');
						}}
					/>
					{/* Fallback for broken image */}
					<div className="hidden w-full h-48 bg-gray-100 flex items-center justify-center">
						<div className="text-center text-gray-500">
							<ImageIcon className="h-12 w-12 mx-auto mb-2" />
							<p className="text-sm">Image not available</p>
						</div>
					</div>
					{/* Overlay with package info */}
					<div className="absolute inset-0 bg-black/40">
						<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
							<h3 className="text-2xl font-bold mb-2">{pkg?.name}</h3>
							<div className="flex items-center gap-2">
								<Badge variant={pkg?.isAvailable ? "default" : "secondary"} className="text-xs bg-white/20 text-white border-white/30">
									{pkg?.isAvailable ? (
										<><CheckCircle className="h-3 w-3 mr-1" />Available</>
									) : (
										<><AlertCircle className="h-3 w-3 mr-1" />Unavailable</>
									)}
								</Badge>
								{pkg?.isPublished && (
									<Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
										<Globe className="h-3 w-3 mr-1" />Published
									</Badge>
								)}
								<Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
									<Shield className="h-3 w-3 mr-1" />{pkg?.serviceType || "Standard"}
								</Badge>
							</div>
						</div>
						{/* Availability toggle in top-right */}
						<div className="absolute top-4 right-4">
							<div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
								<Switch
									checked={pkg?.isAvailable || false}
									onCheckedChange={onToggleAvailable}
									disabled={isUpdating}
								/>
								<span className="text-xs font-medium text-gray-700">Available</span>
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
								<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500">
									<Package className="h-6 w-6 text-white" />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-gray-900">{pkg?.name}</h3>
									<div className="flex items-center gap-2 mt-1">
										<Badge variant={pkg?.isAvailable ? "default" : "secondary"} className="text-xs">
											{pkg?.isAvailable ? (
												<><CheckCircle className="h-3 w-3 mr-1" />Available</>
											) : (
												<><AlertCircle className="h-3 w-3 mr-1" />Unavailable</>
											)}
										</Badge>
										{pkg?.isPublished && (
											<Badge variant="outline" className="text-xs">
												<Globe className="h-3 w-3 mr-1" />Published
											</Badge>
										)}
										<Badge variant="outline" className="text-xs">
											<Shield className="h-3 w-3 mr-1" />{pkg?.serviceType || "Standard"}
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
								<span className="text-sm font-medium text-gray-700">Available for Booking</span>
							</div>
						</div>
						{/* Banner image placeholder */}
						<div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
							<ImageIcon className="h-8 w-8 mx-auto mb-2" />
							<p className="text-sm">No banner image uploaded</p>
							<p className="text-xs text-muted-foreground">Add a banner image to make this package more appealing</p>
						</div>
					</div>
				</>
			)}

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground font-medium">Daily Rate</p>
								<p className="text-2xl font-bold text-green-600">
									${pkg?.pricePerDay?.toFixed(2) || "0.00"}
								</p>
							</div>
							<div className="p-2 bg-green-100 rounded-lg">
								<DollarSign className="h-5 w-5 text-green-600" />
							</div>
						</div>
						<div className="flex items-center gap-1 mt-2">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="text-xs text-green-600 font-medium">Competitive pricing</span>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground font-medium">Route Stops</p>
								<p className="text-2xl font-bold text-blue-600">{routes.length}</p>
							</div>
							<div className="p-2 bg-blue-100 rounded-lg">
								<RouteIcon className="h-5 w-5 text-blue-600" />
							</div>
						</div>
						<div className="flex items-center gap-1 mt-2">
							<MapPin className="h-3 w-3 text-blue-500" />
							<span className="text-xs text-blue-600 font-medium">
								{pickupPoints.length} pickup, {dropoffPoints.length} dropoff
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground font-medium">Duration</p>
								<p className="text-2xl font-bold text-purple-600">
									{Math.floor(totalDuration / 60)}h {totalDuration % 60}m
								</p>
							</div>
							<div className="p-2 bg-purple-100 rounded-lg">
								<Clock className="h-5 w-5 text-purple-600" />
							</div>
						</div>
						<div className="flex items-center gap-1 mt-2">
							<Activity className="h-3 w-3 text-purple-500" />
							<span className="text-xs text-purple-600 font-medium">Total experience time</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Package Description */}
			<Card className="border-l-4 border-l-blue-500">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Info className="h-5 w-5 text-blue-500" />
						Package Description
					</CardTitle>
				</CardHeader>
				<CardContent>
					{pkg?.description ? (
						<p className="text-sm text-gray-700 leading-relaxed">
							{pkg.description}
						</p>
					) : (
						<div className="flex items-center gap-2 text-muted-foreground">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">No description provided. Consider adding a detailed description to attract customers.</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Operational Details */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Scheduling Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<Calendar className="h-5 w-5 text-green-500" />
							Availability & Schedule
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Operating Hours</span>
								<span className="text-sm font-medium">
									{pkg?.availableTimeStart || "09:00"} - {pkg?.availableTimeEnd || "17:00"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Advance Booking</span>
								<span className="text-sm font-medium">{pkg?.advanceBookingHours || 24} hours</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Cancellation Notice</span>
								<span className="text-sm font-medium">{pkg?.cancellationHours || 24} hours</span>
							</div>
							{availableDays.length > 0 && (
								<div>
									<span className="text-sm text-muted-foreground block mb-2">Available Days</span>
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
						<CardTitle className="text-lg flex items-center gap-2">
							<Activity className="h-5 w-5 text-purple-500" />
							Package Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Package ID</span>
								<span className="text-sm font-mono font-medium">{pkg?.id}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Service Type</span>
								<Badge variant="outline" className="text-xs">
									{pkg?.serviceType || "Standard Package"}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Created</span>
								<span className="text-sm font-medium">
									{pkg?.createdAt ? new Date(pkg.createdAt).toLocaleDateString('en-US', {
										weekday: 'short',
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									}) : "Unknown"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Last Updated</span>
								<span className="text-sm font-medium">
									{pkg?.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString('en-US', {
										weekday: 'short',
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									}) : "Unknown"}
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
