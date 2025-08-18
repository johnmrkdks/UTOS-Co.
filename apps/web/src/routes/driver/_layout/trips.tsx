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
		<div className="space-y-4 max-w-full">
			{/* Compact Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold text-gray-900">Trip History</h1>
					<p className="text-sm text-gray-600">
						{stats.totalTrips} trips completed
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCwIcon className="h-4 w-4" />
				</Button>
			</div>

			{/* Stats Cards - Modern Style */}
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-700">Total Trips</div>
						<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
							<CheckCircleIcon className="h-4 w-4 text-blue-600" />
						</div>
					</div>
					<div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTrips}</div>
					<div className="flex items-center gap-1 text-xs text-blue-600">
						<TrendingUpIcon className="h-3 w-3" />
						<span>+0 this week</span>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-700">Trips Done</div>
						<div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
							<CheckCircleIcon className="h-4 w-4 text-green-600" />
						</div>
					</div>
					<div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTrips}</div>
					<div className="flex items-center gap-1 text-xs text-green-600">
						<TrendingUpIcon className="h-3 w-3" />
						<span>+{stats.totalTrips} this week</span>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-700">Upcoming</div>
						<div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
							<CalendarIcon className="h-4 w-4 text-orange-600" />
						</div>
					</div>
					<div className="text-2xl font-bold text-gray-900 mb-1">{stats.upcomingTrips}</div>
					<div className="flex items-center gap-1 text-xs text-orange-600">
						<TrendingUpIcon className="h-3 w-3" />
						<span>+{stats.upcomingTrips} this week</span>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-700">Active</div>
						<div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
							<CarIcon className="h-4 w-4 text-purple-600" />
						</div>
					</div>
					<div className="text-2xl font-bold text-gray-900 mb-1">{stats.activeTrips}</div>
					<div className="flex items-center gap-1 text-xs text-purple-600">
						<TrendingUpIcon className="h-3 w-3" />
						<span>+{stats.activeTrips} this week</span>
					</div>
				</div>
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

			{/* Compact Navigation Cards */}
			<div className="grid grid-cols-2 gap-2 mb-3">
				<button
					onClick={() => setActiveTab('all')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'all'
							? 'bg-blue-50 border-blue-200 text-blue-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">All Trips</div>
					<div className="text-xs text-gray-500 mt-0.5">{bookings.length} total</div>
				</button>
				<button
					onClick={() => setActiveTab('active')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'active'
							? 'bg-purple-50 border-purple-200 text-purple-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">Active</div>
					<div className="text-xs text-gray-500 mt-0.5">{stats.activeTrips} in progress</div>
				</button>
				<button
					onClick={() => setActiveTab('upcoming')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'upcoming'
							? 'bg-blue-50 border-blue-200 text-blue-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">Upcoming</div>
					<div className="text-xs text-gray-500 mt-0.5">{stats.upcomingTrips} scheduled</div>
				</button>
				<button
					onClick={() => setActiveTab('completed')}
					className={`p-3 rounded-lg border text-center transition-colors ${activeTab === 'completed'
							? 'bg-green-50 border-green-200 text-green-700'
							: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
				>
					<div className="font-medium text-xs">Completed</div>
					<div className="text-xs text-gray-500 mt-0.5">{stats.totalTrips} finished</div>
				</button>
			</div>

			{/* Trip List */}
			<div className="w-full">
				{filteredBookings.length === 0 ? (
					<div className="text-center py-8">
						<CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
						<h3 className="text-base font-medium text-gray-900 mb-1">
							{activeTab === 'all' ? 'No trips found' :
								activeTab === 'active' ? 'No active trips' :
									activeTab === 'upcoming' ? 'No upcoming trips' :
										'No completed trips'}
						</h3>
						<p className="text-sm text-gray-600">
							{searchQuery ? 'Try adjusting your search terms' :
								activeTab === 'active' ? 'When you accept a ride, it will appear here' :
									activeTab === 'upcoming' ? 'Confirmed bookings will appear here' :
										'Your trip history will be displayed here'}
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
