import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { useDriverBookingsQuery } from '@/hooks/query/use-driver-bookings-query';
import {
	CalendarIcon,
	MapPinIcon,
	ClockIcon,
	DollarSignIcon,
	UserIcon,
	PhoneIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	CarIcon,
	NavigationIcon,
	StarIcon,
	RefreshCwIcon,
	FilterIcon,
	SearchIcon,
	MoreVerticalIcon,
	RouteIcon,
	TimerIcon,
	TrendingUpIcon,
} from "lucide-react";
import { useState } from 'react';
import { Input } from "@workspace/ui/components/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";

export const Route = createFileRoute('/driver/_layout/trips')({
	component: DriverTripsComponent,
});

function DriverTripsComponent() {
	const { data: currentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch bookings for current driver
	const { data: bookingsData, isLoading: isBookingsLoading, refetch } = useDriverBookingsQuery({
		driverId: currentDriver?.id || "",
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];

	// Filter bookings based on active tab and search
	const filteredBookings = bookings.filter(booking => {
		const matchesSearch = searchQuery === '' || 
			booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.originAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesTab = activeTab === 'all' || (
			activeTab === 'active' && ['driver_assigned', 'in_progress'].includes(booking.status) ||
			activeTab === 'upcoming' && ['pending', 'confirmed', 'driver_assigned'].includes(booking.status) ||
			activeTab === 'completed' && ['completed'].includes(booking.status)
		);

		return matchesSearch && matchesTab;
	});

	// Calculate stats
	const stats = {
		totalTrips: bookings.filter(b => b.status === 'completed').length,
		upcomingTrips: bookings.filter(b => ['pending', 'confirmed', 'driver_assigned'].includes(b.status)).length,
		activeTrips: bookings.filter(b => ['in_progress'].includes(b.status)).length,
		totalEarnings: bookings
			.filter(b => b.status === 'completed')
			.reduce((sum, b) => sum + (b.finalAmount || b.quotedAmount || 0), 0) / 100, // Convert from cents
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
			case 'driver_assigned': return 'bg-purple-100 text-purple-800 border-purple-300';
			case 'in_progress': return 'bg-green-100 text-green-800 border-green-300';
			case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
			default: return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending': return <ClockIcon className="h-4 w-4" />;
			case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />;
			case 'driver_assigned': return <UserIcon className="h-4 w-4" />;
			case 'in_progress': return <CarIcon className="h-4 w-4" />;
			case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
			case 'cancelled': return <AlertCircleIcon className="h-4 w-4" />;
			default: return <ClockIcon className="h-4 w-4" />;
		}
	};

	const formatTime = (timestamp: number | string) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	const formatCurrency = (cents: number) => {
		return `$${(cents / 100).toFixed(2)}`;
	};

	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
						))}
					</div>
					<div className="h-64 bg-gray-200 rounded-lg"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">My Trips & Bookings</h1>
					<p className="text-gray-600 mt-1">
						Track your rides, earnings, and customer interactions
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCwIcon className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Trips</CardTitle>
						<CheckCircleIcon className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalTrips}</div>
						<p className="text-xs text-green-600 mt-1">
							Completed successfully
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
						<CalendarIcon className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.upcomingTrips}</div>
						<p className="text-xs text-blue-600 mt-1">
							Scheduled & confirmed
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Trips</CardTitle>
						<CarIcon className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeTrips}</div>
						<p className="text-xs text-purple-600 mt-1">
							Currently in progress
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
						<DollarSignIcon className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
						<p className="text-xs text-green-600 mt-1">
							From completed trips
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filter */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<CardTitle>Trip History</CardTitle>
							<CardDescription>View and manage your bookings</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search trips..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 w-64"
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
							<TabsTrigger value="active">Active ({stats.activeTrips})</TabsTrigger>
							<TabsTrigger value="upcoming">Upcoming ({stats.upcomingTrips})</TabsTrigger>
							<TabsTrigger value="completed">Completed ({stats.totalTrips})</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab} className="mt-6">
							{filteredBookings.length === 0 ? (
								<div className="text-center py-12">
									<CarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										{activeTab === 'all' ? 'No trips found' : 
										 activeTab === 'active' ? 'No active trips' :
										 activeTab === 'upcoming' ? 'No upcoming trips' :
										 'No completed trips'}
									</h3>
									<p className="text-gray-600">
										{searchQuery ? 'Try adjusting your search terms' : 
										 activeTab === 'active' ? 'When you accept a ride, it will appear here' :
										 activeTab === 'upcoming' ? 'Confirmed bookings will appear here' :
										 'Your trip history will be displayed here'}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredBookings.map((booking) => (
										<Card key={booking.id} className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
													{/* Main Trip Info */}
													<div className="flex-1 space-y-3">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<div className="flex items-center gap-2">
																	<Badge variant="outline" className={getStatusColor(booking.status)}>
																		{getStatusIcon(booking.status)}
																		<span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
																	</Badge>
																	<Badge variant="outline" className="bg-gray-100 text-gray-700">
																		{booking.bookingType === 'package' ? 'Package' : 'Custom'}
																	</Badge>
																</div>
															</div>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="sm">
																		<MoreVerticalIcon className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem>View Details</DropdownMenuItem>
																	<DropdownMenuItem>Contact Customer</DropdownMenuItem>
																	<DropdownMenuItem>Navigate to Pickup</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>

														{/* Customer Info */}
														<div className="flex items-center gap-4">
															<div className="flex items-center gap-2">
																<UserIcon className="h-4 w-4 text-gray-500" />
																<span className="font-medium">{booking.customerName}</span>
															</div>
															<div className="flex items-center gap-2">
																<PhoneIcon className="h-4 w-4 text-gray-500" />
																<span className="text-sm text-gray-600">{booking.customerPhone}</span>
															</div>
														</div>

														{/* Route Info */}
														<div className="space-y-2">
															<div className="flex items-start gap-2">
																<MapPinIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
																<div>
																	<p className="text-sm font-medium">Pickup: {booking.originAddress}</p>
																</div>
															</div>
															<div className="flex items-start gap-2">
																<NavigationIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
																<div>
																	<p className="text-sm font-medium">Destination: {booking.destinationAddress}</p>
																</div>
															</div>
														</div>

														{/* Time Info */}
														<div className="flex items-center gap-4 text-sm text-gray-600">
															<div className="flex items-center gap-1">
																<CalendarIcon className="h-4 w-4" />
																<span>Pickup: {formatTime(booking.scheduledPickupTime)}</span>
															</div>
															{booking.estimatedDuration && (
																<div className="flex items-center gap-1">
																	<TimerIcon className="h-4 w-4" />
																	<span>Duration: {Math.round(booking.estimatedDuration / 60)} min</span>
																</div>
															)}
														</div>
													</div>

													{/* Payment Info */}
													<div className="text-right space-y-2">
														<div className="text-2xl font-bold text-gray-900">
															{formatCurrency(booking.finalAmount || booking.quotedAmount)}
														</div>
														{booking.status === 'completed' && (
															<Badge variant="default" className="bg-green-100 text-green-800">
																Earned ✨
															</Badge>
														)}
														{booking.passengerCount > 1 && (
															<p className="text-sm text-gray-600">
																{booking.passengerCount} passengers
															</p>
														)}
													</div>
												</div>

												{/* Action Buttons for Active Trips */}
												{booking.status === 'driver_assigned' && (
													<div className="mt-4 pt-4 border-t flex gap-2">
														<Button size="sm" className="bg-green-600 hover:bg-green-700">
															<CarIcon className="h-4 w-4 mr-2" />
															Start Trip
														</Button>
														<Button size="sm" variant="outline">
															<NavigationIcon className="h-4 w-4 mr-2" />
															Navigate
														</Button>
														<Button size="sm" variant="outline">
															<PhoneIcon className="h-4 w-4 mr-2" />
															Call Customer
														</Button>
													</div>
												)}

												{booking.status === 'in_progress' && (
													<div className="mt-4 pt-4 border-t flex gap-2">
														<Button size="sm" className="bg-blue-600 hover:bg-blue-700">
															<CheckCircleIcon className="h-4 w-4 mr-2" />
															Complete Trip
														</Button>
														<Button size="sm" variant="outline">
															<PhoneIcon className="h-4 w-4 mr-2" />
															Call Customer
														</Button>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}