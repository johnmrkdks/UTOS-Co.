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
	const { data: rawCurrentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Driver data with fallback values
	const currentDriver = {
		id: null,
		...rawCurrentDriver
	};

	// Fetch bookings for current driver
	const { data: bookingsData, isLoading: isBookingsLoading, refetch } = useDriverBookingsQuery({
		driverId: currentDriver.id || "",
		limit: 50,
		offset: 0,
	});

	const bookings = bookingsData?.data || [];

	// Filter only assigned trips for driver focus
	const assignedBookings = bookings.filter(booking => 
		['driver_assigned', 'in_progress', 'completed'].includes(booking.status)
	);

	// Filter bookings based on active tab and search - focused on assigned trips
	const filteredBookings = assignedBookings.filter(booking => {
		const matchesSearch = searchQuery === '' ||
			booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.originAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesTab = activeTab === 'all' || (
			activeTab === 'active' && ['driver_assigned', 'in_progress'].includes(booking.status) ||
			activeTab === 'completed' && ['completed'].includes(booking.status)
		);

		return matchesSearch && matchesTab;
	});

	// Simple stats for assigned trips only
	const assignedStats = {
		totalAssigned: assignedBookings.length,
		activeTrips: assignedBookings.filter(b => ['driver_assigned', 'in_progress'].includes(b.status)).length,
		completedTrips: assignedBookings.filter(b => b.status === 'completed').length,
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
		<div className="space-y-4 max-w-full">
			{/* Focused Header for Assigned Trips */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold text-gray-900">My Assigned Trips</h1>
					<p className="text-sm text-gray-600">
						{assignedStats.totalAssigned} trips assigned • {assignedStats.activeTrips} active • {assignedStats.completedTrips} completed
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCwIcon className="h-4 w-4" />
				</Button>
			</div>

			{/* Search */}
			<div className="relative">
				<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<Input
					placeholder="Search trips..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9 w-full"
				/>
			</div>

			{/* Simplified Navigation - Focused on Assigned Trips */}
			<div className="grid grid-cols-3 gap-2 mb-3">
				<button
					onClick={() => setActiveTab('all')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'all'
							? 'bg-blue-50 border-blue-200 text-blue-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">All Assigned</div>
					<div className="text-xs text-gray-500 mt-0.5">{assignedStats.totalAssigned} total</div>
				</button>
				<button
					onClick={() => setActiveTab('active')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'active'
							? 'bg-purple-50 border-purple-200 text-purple-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">Active</div>
					<div className="text-xs text-gray-500 mt-0.5">{assignedStats.activeTrips} in progress</div>
				</button>
				<button
					onClick={() => setActiveTab('completed')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'completed'
							? 'bg-green-50 border-green-200 text-green-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">Completed</div>
					<div className="text-xs text-gray-500 mt-0.5">{assignedStats.completedTrips} finished</div>
				</button>
			</div>

			{/* Trip List */}
			<div className="w-full">
				{filteredBookings.length === 0 ? (
					<div className="text-center py-8">
						<CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
						<h3 className="text-base font-medium text-gray-900 mb-1">
							{activeTab === 'all' ? 'No assigned trips found' :
								activeTab === 'active' ? 'No active trips' :
									'No completed trips'}
						</h3>
						<p className="text-sm text-gray-600">
							{searchQuery ? 'Try adjusting your search terms' :
								activeTab === 'active' ? 'When you start an assigned trip, it will appear here' :
								activeTab === 'completed' ? 'Completed trips will be displayed here' :
									'Your assigned trips will appear here once you receive bookings'}
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{filteredBookings.map((booking) => (
							<Card key={booking.id} className="hover:shadow-sm transition-shadow">
								<CardContent className="p-3">
									{/* Ultra Compact Trip Header */}
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-1">
											<Badge variant="outline" className={`${getStatusColor(booking.status)} text-xs px-1 py-0`}>
												{getStatusIcon(booking.status)}
												<span className="ml-1 capitalize text-xs">{booking.status.replace('_', ' ')}</span>
											</Badge>
											<Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs px-1 py-0">
												{booking.bookingType === 'package' ? 'Package' : 'Custom'}
											</Badge>
										</div>
										<div className="text-sm font-bold text-gray-900">
											{formatCurrency(booking.finalAmount || booking.quotedAmount)}
										</div>
									</div>

									{/* Customer & Route Info - Ultra Compact */}
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<UserIcon className="h-3 w-3 text-gray-500" />
											<span className="font-medium text-xs">{booking.customerName}</span>
											<PhoneIcon className="h-3 w-3 text-gray-400 ml-auto" />
										</div>

										<div className="space-y-1">
											<div className="flex items-start gap-1">
												<MapPinIcon className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
												<p className="text-xs text-gray-700 truncate leading-none">{booking.originAddress}</p>
											</div>
											<div className="flex items-start gap-1">
												<NavigationIcon className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
												<p className="text-xs text-gray-700 truncate leading-none">{booking.destinationAddress}</p>
											</div>
										</div>

										<div className="flex items-center justify-between text-xs text-gray-600 pt-1">
											<div className="flex items-center gap-1">
												<CalendarIcon className="h-3 w-3" />
												<span className="text-xs">{formatTime(booking.scheduledPickupTime)}</span>
											</div>
											{booking.estimatedDuration && (
												<div className="flex items-center gap-1">
													<TimerIcon className="h-3 w-3" />
													<span className="text-xs">{Math.round(booking.estimatedDuration / 60)} min</span>
												</div>
											)}
										</div>
									</div>

									{/* Ultra Compact Action Buttons */}
									{booking.status === 'driver_assigned' && (
										<div className="mt-2 pt-2 border-t flex gap-1">
											<Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1 text-xs h-7">
												<CarIcon className="h-3 w-3 mr-1" />
												Start
											</Button>
											<Button size="sm" variant="outline" className="flex-1 text-xs h-7">
												<NavigationIcon className="h-3 w-3 mr-1" />
												Navigate
											</Button>
										</div>
									)}

									{booking.status === 'in_progress' && (
										<div className="mt-2 pt-2 border-t flex gap-1">
											<Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 text-xs h-7">
												<CheckCircleIcon className="h-3 w-3 mr-1" />
												Complete
											</Button>
											<Button size="sm" variant="outline" className="flex-1 text-xs h-7">
												<PhoneIcon className="h-3 w-3 mr-1" />
												Call
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
