import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useCurrentDriverQuery } from '@/hooks/query/use-current-driver-query';
import { useGetDriverBookingsQuery } from "@/features/driver/_hooks/query/use-get-driver-bookings-query";
import {
	CalendarIcon,
	MapPinIcon,
	ClockIcon,
	DollarSignIcon,
	UserIcon,
	UsersIcon,
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
	MessageSquare,
	PlusIcon,
	TrashIcon,
	X,
	ActivityIcon,
	CircleDot,
	ChevronRight,
} from "lucide-react";
import { useState, useMemo } from 'react';
import { Input } from "@workspace/ui/components/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@workspace/ui/components/alert-dialog";
import { useUpdateBookingStatusMutation } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-update-booking-status-mutation";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { CloseTripOptionsDialog } from "@/features/driver/_components/close-trip-options-dialog";
import { CloseTripExtrasForm, type ExtrasFormData } from "@/features/driver/_components/close-trip-extras-form";
import { TripConfirmationDialog } from "@/features/driver/_components/trip-confirmation-dialog";
import { useCloseTripWithExtrasMutation, useCloseTripWithoutExtrasMutation } from "@/features/driver/_hooks/query/use-close-trip-mutations";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const Route = createFileRoute('/driver/_layout/trips')({
	component: DriverTripsComponent,
});

function DriverTripsComponent() {
	const { data: rawCurrentDriver, isLoading: isDriverLoading } = useCurrentDriverQuery();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [passengerDetailsOpen, setPassengerDetailsOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);
	const [extras, setExtras] = useState<{ id: string, description: string, amount: string }[]>([
		{ id: '1', description: '', amount: '' }
	]);
	// New Close Trip workflow state
	const [closeTripOptionsOpen, setCloseTripOptionsOpen] = useState(false);
	const [closeTripExtrasOpen, setCloseTripExtrasOpen] = useState(false);
	const [tripConfirmationOpen, setTripConfirmationOpen] = useState(false);
	const [isNoShow, setIsNoShow] = useState(false);
	const [extrasData, setExtrasData] = useState<ExtrasFormData | undefined>(undefined);
	const [selectedTripForClose, setSelectedTripForClose] = useState<any>(null);
	const [showMapsModal, setShowMapsModal] = useState(false);
	const [selectedMapsBooking, setSelectedMapsBooking] = useState<any>(null);
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);
	const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false);
	const [pobConfirmationOpen, setPobConfirmationOpen] = useState(false);
	const [selectedBookingForPob, setSelectedBookingForPob] = useState<any>(null);

	// Status update mutation
	const updateStatusMutation = useUpdateBookingStatusMutation();
	const closeTripWithExtrasMutation = useCloseTripWithExtrasMutation();
	const closeTripWithoutExtrasMutation = useCloseTripWithoutExtrasMutation();

	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}, []);

	// Driver data with fallback values
	const currentDriver = {
		id: null as string | null,
		...rawCurrentDriver
	};

	// Fetch all bookings for current driver - use same parameters as history page that works
	const { data: bookingsData, isLoading: isBookingsLoading, refetch } = useGetDriverBookingsQuery({
		limit: 100, // Match history page parameters
	});

	const allBookings = bookingsData?.data || [];

	// Filter for active trip statuses that drivers need to work on
	// Note: driver_assigned trips appear in /driver/available, not here
	const activeStatuses = [
		"driver_en_route",     // Driver has started the trip - heading to pickup
		"in_progress",         // Legacy status for active trips
		"arrived_pickup",      // Driver arrived at pickup location
		"passenger_on_board",  // Passenger picked up, heading to destination
		"dropped_off",         // Passenger dropped off, awaiting trip closure
		"awaiting_extras"      // Trip closed, awaiting extras processing
	];

	const bookings = allBookings.filter((booking: any) =>
		activeStatuses.includes(booking.status)
	);

	// Filter bookings based on search only - already filtered to in-progress trips by query
	const filteredBookings = bookings.filter((booking: any) => {
		const matchesSearch = searchQuery === '' ||
			booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.originAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesSearch;
	}).sort((a: any, b: any) => {
		// Sort by closest scheduled pickup time (soonest first)
		return new Date(a.scheduledPickupTime).getTime() - new Date(b.scheduledPickupTime).getTime();
	});

	// Simple stats for in-progress trips only
	const tripStats = {
		totalInProgress: bookings.length,
		activeTrips: bookings.filter(b => ['driver_en_route', 'in_progress', 'arrived_pickup', 'passenger_on_board'].includes(b.status)).length,
		pendingTrips: bookings.filter(b => ['driver_assigned'].includes(b.status)).length,
		waitingForExtras: bookings.filter(b => ['dropped_off', 'awaiting_extras'].includes(b.status)).length,
	};

	// Driver workflow status transitions
	const getNextStatus = (currentStatus: string) => {
		switch (currentStatus) {
			case 'confirmed':
				return 'driver_en_route'; // Start Job
			case 'driver_assigned':
				return 'driver_en_route'; // Start Job
			case 'driver_en_route':
				return 'arrived_pickup'; // Arrived at Pickup
			case 'arrived_pickup':
				return 'passenger_on_board'; // Passenger/s On Board
			case 'passenger_on_board':
				return 'dropped_off'; // Dropped Off
			case 'dropped_off':
				return 'awaiting_extras'; // Extras
			case 'awaiting_extras':
				return 'completed'; // Complete
			default:
				return currentStatus;
		}
	};

	const getStatusButtonText = (currentStatus: string) => {
		switch (currentStatus) {
			case 'confirmed':
				return 'Start Job';
			case 'driver_assigned':
				return 'Start Job';
			case 'driver_en_route':
				return 'Arrived at Pickup';
			case 'arrived_pickup':
				return 'Passenger/s On Board';
			case 'passenger_on_board':
				return 'Dropped Off';
			case 'dropped_off':
				return 'Close Trip';
			case 'awaiting_extras':
				return 'Complete Trip';
			default:
				return 'Update Status';
		}
	};

	const handleStartTrip = (booking: any) => {
		// If current status is 'dropped_off', show Close Trip options dialog
		if (booking.status === 'dropped_off') {
			setSelectedTripForClose(booking);
			setCloseTripOptionsOpen(true);
			return;
		}

		// If current status is 'arrived_pickup', show POB confirmation dialog
		if (booking.status === 'arrived_pickup') {
			setSelectedBookingForPob(booking);
			setPobConfirmationOpen(true);
			return;
		}

		const nextStatus = getNextStatus(booking.status);

		updateStatusMutation.mutate({
			id: booking.id,
			status: nextStatus,
		} as any, {
			onSuccess: (data) => {
				// Invalidate and refetch driver trips to get refreshed data
				queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });
				queryClient.refetchQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

				// Also invalidate available trips queries to update both pages
				queryClient.invalidateQueries({ queryKey: trpc.bookings.getAvailableTrips.queryKey() });
				queryClient.refetchQueries({ queryKey: trpc.bookings.getAvailableTrips.queryKey() });

				// Update the selected booking details with new status
				if (selectedBookingForDetails && selectedBookingForDetails.id === booking.id) {
					setSelectedBookingForDetails({
						...selectedBookingForDetails,
						status: nextStatus
					});
				}
			},
			onError: (error) => {
				console.error('❌ Failed to update trip status:', error);
			}
		});
	};

	const addExtraItem = () => {
		setExtras(prev => [...prev, {
			id: Date.now().toString(),
			description: '',
			amount: ''
		}]);
	};

	const removeExtraItem = (id: string) => {
		setExtras(prev => prev.filter(item => item.id !== id));
	};

	const updateExtraItem = (id: string, field: 'description' | 'amount', value: string) => {
		setExtras(prev => prev.map(item =>
			item.id === id ? { ...item, [field]: value } : item
		));
	};

	const calculateTotalExtras = () => {
		return extras.reduce((total, item) => {
			const amount = parseFloat(item.amount || '0');
			return total + (isNaN(amount) ? 0 : amount);
		}, 0);
	};

	const handleSubmitExtras = () => {
		if (selectedBooking) {
			const totalExtrasAmount = calculateTotalExtras();
			// Update booking with extras amount and move to next status
			updateStatusMutation.mutate({
				id: selectedBooking.id,
				status: 'awaiting_extras',
				extraCharges: totalExtrasAmount, // Store as dollar amount
			} as any);
		}

		setExtrasDialogOpen(false);
		setExtras([{ id: '1', description: '', amount: '' }]);
		setSelectedBooking(null);
	};

	const handleCompleteTrip = (booking: any) => {
		updateStatusMutation.mutate({
			id: booking.id,
			status: 'completed',
		} as any);
	};

	// New Close Trip workflow handlers
	const handleCloseTripOption = (option: 'close' | 'close-with-extras' | 'no-show' | 'no-show-with-extras' | 'close-later') => {
		setCloseTripOptionsOpen(false);

		switch (option) {
			case 'close':
				// Close trip without extras - go directly to confirmation
				setIsNoShow(false);
				setExtrasData(undefined);
				setTripConfirmationOpen(true);
				break;
			case 'close-with-extras':
				// Show extras form
				setIsNoShow(false);
				setCloseTripExtrasOpen(true);
				break;
			case 'no-show':
				// No show without extras
				setIsNoShow(true);
				setExtrasData(undefined);
				setTripConfirmationOpen(true);
				break;
			case 'no-show-with-extras':
				// No show with extras form
				setIsNoShow(true);
				setCloseTripExtrasOpen(true);
				break;
			case 'close-later':
				// Just close the dialog, don't do anything
				setSelectedTripForClose(null);
				break;
		}
	};

	const handleExtrasSubmit = (formData: ExtrasFormData) => {
		setExtrasData(formData);
		setCloseTripExtrasOpen(false);
		setTripConfirmationOpen(true);
	};

	const handleExtrasBack = () => {
		setCloseTripExtrasOpen(false);
		setCloseTripOptionsOpen(true);
	};

	const handleTripConfirmation = () => {
		if (!selectedTripForClose) return;

		if (extrasData) {
			// Convert form amounts from dollars to cents for backend
			const extrasForBackend = {
				additionalWaitTime: extrasData.additionalWaitTime || 0,
				unscheduledStops: extrasData.unscheduledStops || 0,
				parkingCharges: extrasData.parkingCharges || 0, // Store as dollar amount
				tollCharges: extrasData.tollCharges || 0, // Store as dollar amount
				location: extrasData.location || '',
				otherCharges: {
					description: extrasData.otherCharges?.description || '',
					amount: extrasData.otherCharges?.amount || 0, // Store as dollar amount
				},
				extraType: extrasData.extraType || 'general',
				notes: extrasData.notes || '',
			};

			// Use the new close trip with extras mutation
			closeTripWithExtrasMutation.mutate({
				bookingId: selectedTripForClose.id,
				isNoShow: isNoShow,
				extrasData: extrasForBackend,
			} as any, {
				onSuccess: (data) => {

					// Force immediate refresh of the data - don't clear state until after refresh
					queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });
					queryClient.refetchQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

					// Small delay to allow cache to refresh before clearing state
					setTimeout(() => {
						// Close only the trip closing workflow dialogs
						setTripConfirmationOpen(false);
						setCloseTripOptionsOpen(false);
						setCloseTripExtrasOpen(false);

						// Update the booking details dialog with the completed trip data
						if (selectedBookingForDetails && selectedBookingForDetails.id === selectedTripForClose?.id && data?.data?.booking) {
							const updatedBooking = data.data.booking;
							setSelectedBookingForDetails({
								...selectedBookingForDetails,
								status: updatedBooking.status,
								extraCharges: updatedBooking.extraCharges,
								finalAmount: updatedBooking.finalAmount,
								serviceCompletedAt: updatedBooking.serviceCompletedAt
							});
						}

						// Clear trip close state
						setSelectedTripForClose(null);
						setExtrasData(undefined);
						setIsNoShow(false);
					}, 500); // Half second delay to allow cache refresh
				},
				onError: (error) => {
					// Keep dialogs open on error so user can retry
					console.error("Failed to close trip with extras:", error);
				}
			});
		} else {
			// No extras - use simple close trip mutation
			closeTripWithoutExtrasMutation.mutate({
				bookingId: selectedTripForClose.id,
				isNoShow: isNoShow,
			} as any, {
				onSuccess: (data) => {
					// Close only the trip closing workflow dialogs
					setTripConfirmationOpen(false);
					setCloseTripOptionsOpen(false);
					setCloseTripExtrasOpen(false);

					// Update the booking details dialog with the completed trip data
					if (selectedBookingForDetails && selectedBookingForDetails.id === selectedTripForClose?.id && data?.data?.booking) {
						const updatedBooking = data.data.booking;
						setSelectedBookingForDetails({
							...selectedBookingForDetails,
							status: updatedBooking.status,
							extraCharges: updatedBooking.extraCharges || 0,
							finalAmount: updatedBooking.finalAmount,
							serviceCompletedAt: updatedBooking.serviceCompletedAt
						});
					}

					// Clear trip close state
					setSelectedTripForClose(null);
					setExtrasData(undefined);
					setIsNoShow(false);
				},
				onError: (error) => {
					// Keep dialogs open on error so user can retry
					console.error("Failed to close trip:", error);
				}
			});
		}
	};

	const handleTripConfirmationBack = () => {
		setTripConfirmationOpen(false);
		if (extrasData) {
			// Go back to extras form
			setCloseTripExtrasOpen(true);
		} else {
			// Go back to options
			setCloseTripOptionsOpen(true);
		}
	};

	const calculateTotalExtrasCharges = () => {
		if (!extrasData) {
			return 0;
		}
		const total = (extrasData.parkingCharges || 0) + (extrasData.tollCharges || 0) + (extrasData.otherCharges?.amount || 0);
		return total;
	};

	const handleViewPassengerDetails = (booking: any) => {
		setSelectedBooking(booking);
		setPassengerDetailsOpen(true);
	};

	const handleOpenBookingDetails = (booking: any) => {
		setSelectedBookingForDetails(booking);
		setBookingDetailsOpen(true);
	};

	const handleCloseBookingDetails = () => {
		// If trip is completed, require confirmation to close
		if (selectedBookingForDetails && ['completed', 'no_show'].includes(selectedBookingForDetails.status)) {
			setCloseConfirmationOpen(true);
		} else {
			// For non-completed trips, close directly
			setBookingDetailsOpen(false);
		}
	};

	const confirmCloseBookingDetails = () => {
		setCloseConfirmationOpen(false);
		setBookingDetailsOpen(false);
	};

	const handlePobConfirmation = () => {
		if (!selectedBookingForPob) return;

		const nextStatus = getNextStatus(selectedBookingForPob.status);

		updateStatusMutation.mutate({
			id: selectedBookingForPob.id,
			status: nextStatus,
		} as any, {
			onSuccess: (data) => {
				// Invalidate and refetch driver trips to get refreshed data
				queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });
				queryClient.refetchQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

				// Also invalidate available trips queries to update both pages
				queryClient.invalidateQueries({ queryKey: trpc.bookings.getAvailableTrips.queryKey() });
				queryClient.refetchQueries({ queryKey: trpc.bookings.getAvailableTrips.queryKey() });

				// Update the selected booking details with new status
				if (selectedBookingForDetails && selectedBookingForDetails.id === selectedBookingForPob.id) {
					setSelectedBookingForDetails({
						...selectedBookingForDetails,
						status: nextStatus
					});
				}

				// Close the confirmation dialog
				setPobConfirmationOpen(false);
				setSelectedBookingForPob(null);
			},
			onError: (error) => {
				console.error('❌ Failed to update trip status:', error);
				// Keep dialog open on error
			}
		});
	};

	const navigateToLocation = (destinationAddress: string, locationType: 'pickup' | 'dropoff') => {
		// Prefer Google Maps for all platforms as requested by client
		const destination = encodeURIComponent(destinationAddress);
		const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destination}&travelmode=driving`;

		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isAndroid = /Android/.test(navigator.userAgent);

		if (isIOS || isAndroid) {
			// On mobile, use window.location.href to open Google Maps app or fallback to web
			window.location.href = googleMapsUrl;
		} else {
			// Desktop - open Google Maps in new tab
			window.open(googleMapsUrl, '_blank');
		}

		setShowMapsModal(false);
	};

	const openMapsApp = (booking: any, appType: 'google' | 'apple') => {
		let mapsUrl = '';

		// Determine destination based on booking status
		let destination = '';
		let origin = '';

		if (['confirmed', 'driver_assigned', 'driver_en_route'].includes(booking.status)) {
			destination = booking.originAddress; // Go to pickup
		} else if (['arrived_pickup', 'passenger_on_board'].includes(booking.status)) {
			destination = booking.destinationAddress; // Go to dropoff
		} else {
			// Show full route
			origin = booking.originAddress;
			destination = booking.destinationAddress;
		}

		switch (appType) {
			case 'google':
				// Google Maps always needs explicit origin for proper routing
				if (origin) {
					mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
				} else {
					// Use current location as origin for Google Maps
					mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(destination)}&travelmode=driving`;
				}
				break;
			case 'apple':
				// Apple Maps uses current location by default
				if (origin) {
					mapsUrl = `maps://?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=d`;
				} else {
					mapsUrl = `maps://?daddr=${encodeURIComponent(destination)}&dirflg=d`;
				}
				break;
		}

		// Use window.location.href for mobile app links
		if (appType === 'apple' || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			window.location.href = mapsUrl;
		} else {
			window.open(mapsUrl, '_blank');
		}
		setShowMapsModal(false);
	};

	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn(
			isMobile ? "min-h-screen bg-gray-50 flex flex-col" : "min-h-screen bg-gray-50 p-4 max-w-4xl mx-auto"
		)}>
			{/* Header */}
			<div className={cn(
				"bg-white border-b flex-shrink-0",
				isMobile ? "px-4 py-3" : "rounded-lg mb-4 p-4"
			)}>
				<div className="flex items-center justify-between">
					<div>
						<h1 className={cn(
							"font-bold text-gray-900",
							isMobile ? "text-lg" : "text-2xl"
						)}>My Trips</h1>
						<p className="text-gray-600 text-xs">Your current in-progress trips</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className={cn(isMobile ? "h-8 px-2" : "h-8")}
					>
						<RefreshCwIcon className="h-4 w-4" />
						{!isMobile && <span className="ml-2">Refresh</span>}
					</Button>
				</div>
			</div>

			{/* Active Trips Banner */}
			{tripStats.activeTrips > 0 && (
				<div className={cn(
					"bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex-shrink-0",
					isMobile ? "mx-0 px-4 py-3" : "mx-4 mb-4 rounded-lg px-4 py-3"
				)}>
					<div className="flex items-center gap-3">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
						<div className="flex-1">
							<h3 className="font-semibold text-blue-900 text-sm">
								{tripStats.activeTrips === 1
									? "1 trip in progress"
									: `${tripStats.activeTrips} trips in progress`
								}
							</h3>
							<p className="text-blue-700 text-xs">
								{tripStats.pendingTrips > 0 ? `${tripStats.pendingTrips} pending • ` : ''}
								{tripStats.waitingForExtras > 0 ? `${tripStats.waitingForExtras} awaiting extras • ` : ''}
								Tap any trip to continue
							</p>
						</div>
						<div className="flex items-center gap-1">
							<ActivityIcon className="h-4 w-4 text-blue-600" />
						</div>
					</div>
				</div>
			)}

			{/* Filters and Search */}
			<div className={cn(
				"flex-shrink-0",
				isMobile ? "px-4 py-3 bg-white border-b" : "mb-4"
			)}>
				{/* Search */}
				<div className="relative mb-3">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						placeholder="Search by customer, pickup, or destination..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={cn(
							"pl-10 border-gray-300",
							isMobile ? "h-9 text-sm" : ""
						)}
					/>
				</div>

			</div>

			{/* Trips List */}
			<div className={cn(
				isMobile ? "flex-1 overflow-y-auto" : "space-y-4"
			)}>
				{filteredBookings.length === 0 ? (
					<div className={cn(
						"flex items-center justify-center h-full",
						isMobile ? "px-4" : ""
					)}>
						<div className="text-center">
							<AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
							<p className="text-gray-500 text-sm">
								{searchQuery ? 'Try adjusting your search terms.' : 'No assigned trips at the moment.'}
							</p>
						</div>
					</div>
				) : (
					<div className={cn(
						isMobile ? "" : "grid gap-4"
					)}>
						{filteredBookings.map((booking: any, index: number) => {
							// Status-based color coding with stronger inline styles 
							const getStatusStyle = (status: string) => {
								const baseStyle = {
									borderLeftWidth: '4px',
									borderLeftStyle: 'solid' as const
								};

								switch (status) {
									case 'driver_assigned':
										return { ...baseStyle, borderLeftColor: '#3b82f6' }; // Blue
									case 'driver_en_route':
										return { ...baseStyle, borderLeftColor: '#eab308' }; // Yellow
									case 'arrived_pickup':
										return { ...baseStyle, borderLeftColor: '#f97316' }; // Orange
									case 'passenger_on_board':
									case 'in_progress':
										return { ...baseStyle, borderLeftColor: '#22c55e' }; // Green
									case 'dropped_off':
									case 'awaiting_extras':
										return { ...baseStyle, borderLeftColor: '#a855f7' }; // Purple
									case 'completed':
										return { ...baseStyle, borderLeftColor: '#6b7280' }; // Gray
									default:
										return { ...baseStyle, borderLeftColor: '#d1d5db' }; // Light gray
								}
							};

							return (
								<Card
									key={booking.id}
									style={getStatusStyle(booking.status)}
									className={cn(
										"bg-white transition-colors cursor-pointer active:bg-gray-50",
										isMobile
											? "border-r-0 border-t-0 border-b border-gray-200 rounded-none shadow-none"
											: "border-r border-t border-b border-gray-200 shadow-sm hover:shadow-md"
									)}
									onClick={() => handleOpenBookingDetails(booking)}
								>
									<CardContent className={cn(
										isMobile ? "px-3 py-2.5" : "p-4"
									)}>
										{isMobile ? (
											// Mobile optimized layout
											<>
												{/* Header - Time and Status */}
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-1.5">
														<ClockIcon className="h-3.5 w-3.5 text-gray-500" />
														<div className="flex flex-col">
															<div className="flex items-center gap-2">
																<span className="text-sm font-semibold text-gray-900">
																	{format(new Date(booking.scheduledPickupTime), "h:mm a")}
																</span>
																<span className="text-xs text-gray-400 font-mono">
																	#{booking.id.slice(-6)}
																</span>
															</div>
															<span className="text-xs text-gray-500">
																{format(new Date(booking.scheduledPickupTime), "MMM dd, yyyy")}
															</span>
														</div>
													</div>
													<Badge
														variant={booking.status === 'completed' ? 'default' :
															booking.status === 'cancelled' ? 'destructive' :
																booking.status === 'confirmed' ? 'secondary' : 'outline'}
														className="text-xs px-2 py-0.5"
													>
														{booking.status === 'driver_en_route' ? 'IN PROGRESS' : booking.status.replace('_', ' ').toUpperCase()}
													</Badge>
												</div>

												{/* Route - More aggressive truncation for mobile */}
												<div className="flex items-center justify-between space-y-1 mb-2">
													<div className="flex flex-col items-start gap-2">
														<div className="flex items-center gap-2">
															<div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
															<p className="text-xs text-gray-700 truncate flex-1 max-w-[200px]">
																{booking.originAddress.length > 35
																	? booking.originAddress.substring(0, 35) + '...'
																	: booking.originAddress}
															</p>
														</div>
														{/* Stops (if any) */}
														{(booking as any).stops && (booking as any).stops.length > 0 && (
															<div className="flex items-center gap-2">
																<div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
																<p className="text-xs text-blue-600 truncate flex-1 max-w-[200px]">
																	{(booking as any).stops?.length || 0} stop{((booking as any).stops?.length || 0) > 1 ? 's' : ''}
																</p>
															</div>
														)}
														<div className="flex items-center gap-2 justify-between">
															<div className="flex items-center gap-2 flex-1">
																<div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
																<p className="text-xs text-gray-700 truncate max-w-[200px]">
																	{booking.destinationAddress.length > 35
																		? booking.destinationAddress.substring(0, 35) + '...'
																		: booking.destinationAddress}
																</p>
															</div>
														</div>
													</div>
													{/* Arrow icon at the end of route info */}
													<ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
												</div>

												{/* Customer, Pax, and Vehicle - Compact */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="flex items-center gap-1.5">
															<UserIcon className="h-3.5 w-3.5 text-gray-500" />
															<span className="text-xs text-gray-600 truncate">{booking.customerName}</span>
														</div>
														<div className="flex items-center gap-1">
															<UsersIcon className="h-3.5 w-3.5 text-gray-500" />
															<span className="text-xs text-gray-600">{booking.passengerCount || 1} pax</span>
														</div>
														{(booking.car?.name || booking.assignedCar?.name) && (
															<div className="flex items-center gap-1">
																<CarIcon className="h-3.5 w-3.5 text-gray-500" />
																<span className="text-xs text-gray-600 truncate max-w-[80px]">
																	{booking.car?.name || booking.assignedCar?.name}
																</span>
															</div>
														)}
													</div>
												</div>
											</>
										) : (
											// Desktop layout (unchanged)
											<>
												{/* Header with Time and Status */}
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-2">
														<ClockIcon className="h-4 w-4 text-gray-500" />
														<div className="flex flex-col">
															<div className="flex items-center gap-2">
																<span className="font-semibold text-gray-900">
																	{format(new Date(booking.scheduledPickupTime), "h:mm a")}
																</span>
																<span className="text-xs text-gray-400 font-mono">
																	#{booking.id.slice(-6)}
																</span>
															</div>
															<span className="text-xs text-gray-500">
																{format(new Date(booking.scheduledPickupTime), "MMM dd, yyyy")}
															</span>
														</div>
													</div>
													<Badge
														variant={booking.status === 'completed' ? 'default' :
															booking.status === 'cancelled' ? 'destructive' :
																booking.status === 'confirmed' ? 'secondary' : 'outline'}
														className="text-xs font-medium"
													>
														{booking.status === 'driver_en_route' ? 'IN PROGRESS' : booking.status.replace('_', ' ').toUpperCase()}
													</Badge>
												</div>

												{/* Route */}
												<div className="space-y-1 mb-2">
													<div>
														<div className="flex items-start gap-2">
															<div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
															<div className="flex-1 min-w-0">
																<p className="text-sm text-gray-900 truncate">{booking.originAddress}</p>
															</div>
														</div>
														{/* Stops (if any) */}
														{(booking as any).stops && (booking as any).stops.length > 0 && (
															<div className="flex items-start gap-2">
																<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
																<div className="flex-1 min-w-0">
																	<p className="text-sm text-blue-600 truncate">
																		{(booking as any).stops?.length || 0} intermediate stop{((booking as any).stops?.length || 0) > 1 ? 's' : ''}
																	</p>
																</div>
															</div>
														)}
														<div className="flex items-start gap-2 justify-between">
															<div className="flex items-start gap-2 flex-1">
																<div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
																<div className="flex-1 min-w-0">
																	<p className="text-sm text-gray-900 truncate">{booking.destinationAddress}</p>
																</div>
															</div>
														</div>
													</div>
													{/* Arrow icon at the end of route info */}
													<ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />

												</div>

												{/* Customer, Pax, and Vehicle */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="flex items-center gap-2">
															<UserIcon className="h-4 w-4 text-gray-500" />
															<span className="text-sm text-gray-700">{booking.customerName}</span>
														</div>
														<div className="flex items-center gap-1">
															<UsersIcon className="h-4 w-4 text-gray-500" />
															<span className="text-sm text-gray-600">{booking.passengerCount || 1} pax</span>
														</div>
														{(booking.car?.name || booking.assignedCar?.name) && (
															<div className="flex items-center gap-1">
																<CarIcon className="h-4 w-4 text-gray-500" />
																<span className="text-sm text-gray-600">
																	{booking.car?.name || booking.assignedCar?.name}
																</span>
															</div>
														)}
													</div>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							);
						})}
						{/* Bottom padding for mobile to ensure last item is visible above bottom nav */}
						{isMobile && (
							<div className="h-20"></div>
						)}
					</div>
				)}
			</div>

			{/* Navigation Location Selection Modal */}
			<Dialog open={showMapsModal} onOpenChange={setShowMapsModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<NavigationIcon className="h-5 w-5" />
							Start navigation to
						</DialogTitle>
						<DialogDescription>
							You can only navigate to the drop off location once the passenger is in the vehicle.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-4">
						{/* Pickup Location */}
						<Button
							variant="outline"
							className="w-full justify-start p-4 h-auto"
							onClick={() => selectedMapsBooking && navigateToLocation(selectedMapsBooking.originAddress, 'pickup')}
						>
							<div className="flex items-start gap-3 text-left">
								<div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-gray-900 mb-1">Pickup location</div>
									<div className="text-xs text-gray-600 leading-relaxed">
										{selectedMapsBooking?.originAddress}
									</div>
								</div>
							</div>
						</Button>

						{/* Stops (if any) */}
						{selectedMapsBooking?.stops && selectedMapsBooking.stops.length > 0 && (
							<div className="space-y-2">
								<div className="text-sm font-medium text-gray-700 px-1">
									Intermediate Stops ({selectedMapsBooking.stops.length})
								</div>
								{selectedMapsBooking.stops.map((stop: any, index: number) => (
									<Button
										key={stop.id || index}
										variant="outline"
										className="w-full justify-start p-4 h-auto bg-blue-50 border-blue-200"
										onClick={() => navigateToLocation(stop.address, 'pickup')}
									>
										<div className="flex items-start gap-3 text-left">
											<div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
											<div className="flex-1 min-w-0">
												<div className="text-sm font-medium text-blue-900 mb-1">Stop {index + 1}</div>
												<div className="text-xs text-blue-700 leading-relaxed">
													{stop.address}
												</div>
											</div>
										</div>
									</Button>
								))}
							</div>
						)}

						{/* Dropoff Location */}
						<Button
							variant="outline"
							className="w-full justify-start p-4 h-auto"
							onClick={() => selectedMapsBooking && navigateToLocation(selectedMapsBooking.destinationAddress, 'dropoff')}
						>
							<div className="flex items-start gap-3 text-left">
								<div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-gray-900 mb-1">Dropoff location</div>
									<div className="text-xs text-gray-600 leading-relaxed">
										{selectedMapsBooking?.destinationAddress}
									</div>
								</div>
							</div>
						</Button>

						{/* Cancel */}
						<Button
							variant="ghost"
							className="w-full mt-4"
							onClick={() => setShowMapsModal(false)}
						>
							Cancel
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Booking Details Dialog/Fullscreen */}
			<Dialog
				open={bookingDetailsOpen}
				onOpenChange={(open) => {
					if (!open) {
						// Prevent click-outside close for completed trips on desktop
						if (selectedBookingForDetails && ['completed', 'no_show'].includes(selectedBookingForDetails.status) && !isMobile) {
							return; // Do nothing, prevent closing
						}
						// For mobile or non-completed trips, use confirmation handler
						handleCloseBookingDetails();
					} else {
						setBookingDetailsOpen(open);
					}
				}}
			>
				<DialogContent
					className={cn(
						"[&>button]:hidden", // Hide default close button
						isMobile ? "max-w-full w-full h-full m-0 rounded-none p-0 bg-gray-50" : "max-w-md bg-gray-50"
					)}
				>
					{selectedBookingForDetails && (
						<div className={cn(
							isMobile ? "flex flex-col h-full" : "flex flex-col"
						)}>
							{/* Compact Header with gradient background */}
							<div className={cn(
								"relative p-4 bg-gradient-to-br from-primary to-primary/80 text-white flex-shrink-0 flex items-center justify-between",
								isMobile ? "pt-8" : "rounded-t-lg"
							)}>
								<div className="flex items-center gap-3">
									<ClockIcon className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="text-lg font-bold">
											{format(new Date(selectedBookingForDetails.scheduledPickupTime), "MMM dd, yyyy h:mm a")}
										</h2>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs text-white/80">
												Trip ID: {selectedBookingForDetails.id.slice(-6).toUpperCase()}
											</span>
											<Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
												{selectedBookingForDetails.status.replace('_', ' ').toUpperCase()}
											</Badge>
										</div>
									</div>
								</div>

								<Button
									variant="ghost"
									size="lg"
									className="h-12 w-12 p-0 text-white hover:bg-white/20 rounded-full flex-shrink-0 border-2 border-white/30 hover:border-white/50 transition-all duration-200"
									onClick={handleCloseBookingDetails}
								>
									<X className="h-6 w-6" />
								</Button>
							</div>

							{/* Scrollable Content with improved design */}
							<div className={cn(
								"p-4 space-y-4",
								isMobile ? "flex-1 overflow-y-auto pb-32" : ""
							)}>
								{/* Compact Route Information Card */}
								<div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
									<h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
										<MapPinIcon className="h-4 w-4 text-primary" />
										Trip Route
									</h3>
									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-green-700 mb-0.5">Pick up</p>
												<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
													{selectedBookingForDetails.originAddress}
												</p>
											</div>
										</div>

										{/* Stops (if any) */}
										{selectedBookingForDetails.stops && selectedBookingForDetails.stops.length > 0 && (
											<>
												{selectedBookingForDetails.stops.map((stop: any, index: number) => (
													<div key={stop.id || index}>
														<div className="border-l border-gray-200 ml-1 h-2"></div>
														<div className="flex items-start gap-2">
															<div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
															<div className="flex-1 min-w-0">
																<p className="text-xs font-medium text-blue-700 mb-0.5">Stop {index + 1}</p>
																<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
																	{stop.address}
																</p>
															</div>
														</div>
													</div>
												))}
											</>
										)}

										<div className="border-l border-gray-200 ml-1 h-2"></div>

										<div className="flex items-start gap-2">
											<div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-red-700 mb-0.5">Drop off</p>
												<p className="text-xs text-gray-600 leading-tight break-words line-clamp-2">
													{selectedBookingForDetails.destinationAddress}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Compact Vehicle Information */}
								{selectedBookingForDetails.car && (
									<div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
										<div className="flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
												<CarIcon className="h-4 w-4 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">{selectedBookingForDetails.car.name}</p>
												<p className="text-xs text-gray-500">Assigned Vehicle</p>
											</div>
										</div>
									</div>
								)}


								{/* Compact Customer Information Card - Moved down for easier access */}
								<div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
											<UserIcon className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm text-gray-900 truncate">{selectedBookingForDetails.customerName}</p>
											<p className="text-xs text-gray-600">{selectedBookingForDetails.customerPhone}</p>
										</div>
										<div className="flex gap-1.5">
											<Button
												variant="outline"
												size="sm"
												className="h-9 w-9 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
												onClick={() => window.location.href = `tel:${selectedBookingForDetails.customerPhone}`}
											>
												<PhoneIcon className="h-4 w-4 text-green-600" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="h-9 w-9 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
												onClick={() => window.location.href = `sms:${selectedBookingForDetails.customerPhone}`}
											>
												<MessageSquare className="h-4 w-4 text-blue-600" />
											</Button>
										</div>
									</div>
								</div>
							</div>

							{/* Enhanced Actions - Sticky at bottom for mobile */}
							<div className={cn(
								"p-4 bg-white border-t border-gray-200",
								isMobile ? "fixed bottom-0 left-0 right-0 z-50 shadow-2xl safe-area-pb" : "rounded-b-lg"
							)}>
								{/* Navigation or Fare Display based on trip status */}
								{['completed', 'no_show'].includes(selectedBookingForDetails.status) ? (
									/* Trip Fare Card for completed trips */
									<div className="w-full border-2 border-green-200 bg-green-50 rounded-lg p-3">
										<div className="space-y-1">
											{/* Base fare */}
											<div className="flex items-center justify-between">
												<span className="text-green-700 text-sm">Trip Fare:</span>
												<span className="text-green-800 font-semibold">
													${(selectedBookingForDetails.quotedAmount || 0).toFixed(2)}
												</span>
											</div>

											{/* Extras if any */}
											{(selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0) ? (
												<div className="flex items-center justify-between">
													<span className="text-green-700 text-sm">Extras:</span>
													<span className="text-green-700 font-semibold">
														+${(selectedBookingForDetails.extraCharges || 0).toFixed(2)}
													</span>
												</div>
											) : null}

											{/* Pending Extras (from current form) */}
											{selectedTripForClose?.id === selectedBookingForDetails.id && calculateTotalExtrasCharges() > 0 && (
												<div className="flex items-center justify-between">
													<span className="text-blue-700 text-sm">Pending Extras:</span>
													<span className="text-blue-700 font-semibold">
														+${calculateTotalExtrasCharges().toFixed(2)}
													</span>
												</div>
											)}

											{/* Divider if there are extras */}
											{((selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0) ||
											  (selectedTripForClose?.id === selectedBookingForDetails.id && calculateTotalExtrasCharges() > 0)) ? (
												<div className="border-t border-green-300"></div>
											) : null}

											{/* Total */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<DollarSignIcon className="h-4 w-4 text-green-600" />
													<span className="text-green-800 font-bold">Total:</span>
												</div>
												<span className="text-green-800 font-bold text-lg">
													${(() => {
														// If trip is completed, show finalAmount (includes extras)
														if (['completed', 'cancelled'].includes(selectedBookingForDetails.status) || !selectedTripForClose) {
															return (selectedBookingForDetails.finalAmount || selectedBookingForDetails.quotedAmount || 0).toFixed(2);
														}
														// If trip is being closed with extras, show original + extras preview
														const baseAmount = selectedBookingForDetails.quotedAmount || 0;
														const extrasAmount = selectedTripForClose?.id === selectedBookingForDetails.id ? calculateTotalExtrasCharges() : 0;
														return (baseAmount + extrasAmount).toFixed(2);
													})()}
												</span>
											</div>
										</div>
									</div>
								) : (
									<div className="space-y-3">
										{/* Trip Fare for dropped_off status */}
										{selectedBookingForDetails.status === 'dropped_off' && (
											<div className="w-full border-2 border-green-200 bg-green-50 rounded-lg p-3">
												<div className="space-y-1">
													{/* Base fare */}
													<div className="flex items-center justify-between">
														<span className="text-green-700 text-sm">Trip Fare:</span>
														<span className="text-green-800 font-semibold">
															${(selectedBookingForDetails.quotedAmount || 0).toFixed(2)}
														</span>
													</div>

													{/* Extras if any */}
													{(selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0) ? (
														<div className="flex items-center justify-between">
															<span className="text-green-700 text-sm">Extras:</span>
															<span className="text-green-700 font-semibold">
																+${(selectedBookingForDetails.extraCharges || 0).toFixed(2)}
															</span>
														</div>
													) : null}

													{/* Pending Extras (from current form) */}
													{selectedTripForClose?.id === selectedBookingForDetails.id && calculateTotalExtrasCharges() > 0 && (
														<div className="flex items-center justify-between">
															<span className="text-blue-700 text-sm">Pending Extras:</span>
															<span className="text-blue-700 font-semibold">
																+${calculateTotalExtrasCharges().toFixed(2)}
															</span>
														</div>
													)}

													{/* Divider if there are extras */}
													{((selectedBookingForDetails.extraCharges && selectedBookingForDetails.extraCharges > 0) ||
													  (selectedTripForClose?.id === selectedBookingForDetails.id && calculateTotalExtrasCharges() > 0)) ? (
														<div className="border-t border-green-300"></div>
													) : null}

													{/* Total */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<DollarSignIcon className="h-4 w-4 text-green-600" />
															<span className="text-green-800 font-bold">Total:</span>
														</div>
														<span className="text-green-800 font-bold text-lg">
															${(() => {
																// If trip is completed, show finalAmount (includes extras)
																if (['completed', 'cancelled'].includes(selectedBookingForDetails.status) || !selectedTripForClose) {
																	return (selectedBookingForDetails.finalAmount || selectedBookingForDetails.quotedAmount || 0).toFixed(2);
																}
																// If trip is being closed with extras, show original + extras preview
																const baseAmount = selectedBookingForDetails.quotedAmount || 0;
																const extrasAmount = selectedTripForClose?.id === selectedBookingForDetails.id ? calculateTotalExtrasCharges() : 0;
																return (baseAmount + extrasAmount).toFixed(2);
															})()}
														</span>
													</div>
												</div>
											</div>
										)}

										{/* Horizontal Actions Layout */}
										<div className="flex gap-3 items-center">
										{/* Navigate Button - Smaller size */}
										<Button
											variant="outline"
											className="h-12 w-12 p-0 border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium transition-all duration-200 rounded-lg"
											onClick={() => {
												setSelectedMapsBooking(selectedBookingForDetails);
												setShowMapsModal(true);
											}}
										>
											<NavigationIcon className="h-5 w-5" />
										</Button>

										{/* Status Action - Takes remaining width */}
										{(() => {
											const canProgress = ['driver_assigned', 'driver_en_route', 'arrived_pickup', 'passenger_on_board', 'dropped_off', 'awaiting_extras', 'confirmed'].includes(selectedBookingForDetails.status);

											if (!canProgress) return null;

											return (
												<Button
													className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium"
													onClick={() => {
														handleStartTrip(selectedBookingForDetails);
													}}
													disabled={updateStatusMutation.isPending}
												>
													{updateStatusMutation.isPending ? 'Updating...' : getStatusButtonText(selectedBookingForDetails.status)}
												</Button>
											);
										})()}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Extras Dialog */}
			<Dialog open={extrasDialogOpen} onOpenChange={setExtrasDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add Trip Extras</DialogTitle>
						<DialogDescription>
							Add any additional charges for {selectedBooking?.customerName}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{extras.map((extra, index) => (
							<div key={extra.id} className="flex gap-2">
								<Input
									placeholder="Description (e.g., Tolls, Parking)"
									value={extra.description}
									onChange={(e) => updateExtraItem(extra.id, 'description', e.target.value)}
									className="flex-1"
								/>
								<Input
									placeholder="Amount"
									type="number"
									step="0.01"
									value={extra.amount}
									onChange={(e) => updateExtraItem(extra.id, 'amount', e.target.value)}
									className="w-24"
								/>
								{extras.length > 1 && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => removeExtraItem(extra.id)}
										className="h-10 w-10 p-0"
									>
										<TrashIcon className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}

						<Button
							variant="outline"
							onClick={addExtraItem}
							className="w-full"
						>
							<PlusIcon className="h-4 w-4 mr-2" />
							Add Another Item
						</Button>

						<div className="border-t pt-4">
							<div className="flex justify-between items-center">
								<span className="font-medium">Total Extra Charges:</span>
								<span className="font-bold text-lg">${calculateTotalExtras().toFixed(2)}</span>
							</div>
						</div>

						<div className="flex gap-2">
							<Button variant="outline" onClick={() => setExtrasDialogOpen(false)} className="flex-1">
								Cancel
							</Button>
							<Button onClick={handleSubmitExtras} className="flex-1">
								Add Extras & Continue
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* New Close Trip Workflow Dialogs */}
			<CloseTripOptionsDialog
				open={closeTripOptionsOpen}
				onOpenChange={setCloseTripOptionsOpen}
				booking={selectedTripForClose}
				onSelectOption={handleCloseTripOption}
			/>

			<CloseTripExtrasForm
				open={closeTripExtrasOpen}
				onOpenChange={setCloseTripExtrasOpen}
				booking={selectedTripForClose}
				isNoShow={isNoShow}
				onSubmit={handleExtrasSubmit}
				onBack={handleExtrasBack}
			/>

			<TripConfirmationDialog
				open={tripConfirmationOpen}
				onOpenChange={setTripConfirmationOpen}
				booking={selectedTripForClose}
				extrasData={extrasData}
				totalCharges={calculateTotalExtrasCharges()}
				onConfirm={handleTripConfirmation}
				onGoBack={handleTripConfirmationBack}
				isSubmitting={updateStatusMutation.isPending || closeTripWithExtrasMutation.isPending || closeTripWithoutExtrasMutation.isPending}
			/>

			{/* Close Confirmation Dialog */}
			<AlertDialog open={closeConfirmationOpen} onOpenChange={setCloseConfirmationOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Close Trip Details?</AlertDialogTitle>
						<AlertDialogDescription>
							The trip transaction has been completed successfully. Are you sure you want to close the trip details? You can always view the trip again from your history.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Open</AlertDialogCancel>
						<AlertDialogAction onClick={confirmCloseBookingDetails}>
							Close Details
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* POB Confirmation Dialog */}
			<AlertDialog open={pobConfirmationOpen} onOpenChange={setPobConfirmationOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Passenger/s On Board</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure the passenger/s are now on board and you're ready to proceed to the destination? This will update the trip status and cannot be easily undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => {
							setPobConfirmationOpen(false);
							setSelectedBookingForPob(null);
						}}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePobConfirmation}
							disabled={updateStatusMutation.isPending}
						>
							{updateStatusMutation.isPending ? 'Updating...' : 'Confirm Passenger/s On Board'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
