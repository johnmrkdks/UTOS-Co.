import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import {
	ActivityIcon,
	AlertCircleIcon,
	CalendarIcon,
	CarIcon,
	CheckCircleIcon,
	ChevronRight,
	CircleDot,
	ClockIcon,
	DollarSignIcon,
	FilterIcon,
	MapPinIcon,
	MessageSquare,
	MoreVerticalIcon,
	NavigationIcon,
	PhoneIcon,
	PlusIcon,
	RefreshCwIcon,
	RouteIcon,
	SearchIcon,
	StarIcon,
	TimerIcon,
	TrashIcon,
	TrendingUpIcon,
	TruckIcon,
	User,
	UserIcon,
	UsersIcon,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingTypeBadge } from "@/components/booking-type-badge";
import { useUpdateBookingStatusMutation } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-update-booking-status-mutation";
import {
	CloseTripExtrasForm,
	type ExtrasFormData,
} from "@/features/driver/_components/close-trip-extras-form";
import { CloseTripOptionsDialog } from "@/features/driver/_components/close-trip-options-dialog";
import { TripConfirmationDialog } from "@/features/driver/_components/trip-confirmation-dialog";
import {
	useCloseTripWithExtrasMutation,
	useCloseTripWithoutExtrasMutation,
} from "@/features/driver/_hooks/query/use-close-trip-mutations";
import { useGetDriverBookingsQuery } from "@/features/driver/_hooks/query/use-get-driver-bookings-query";
import { useCurrentDriverQuery } from "@/hooks/query/use-current-driver-query";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/driver/_layout/trips")({
	component: DriverTripsComponent,
});

function DriverTripsComponent() {
	const { data: rawCurrentDriver, isLoading: isDriverLoading } =
		useCurrentDriverQuery();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");

	// Consistent status display function
	const getStatusDisplayText = (status: string) => {
		switch (status) {
			case "driver_en_route":
			case "in_progress": // Map legacy 'in_progress' status to 'EN ROUTE' for consistency
				return "EN ROUTE";
			case "arrived_pickup":
				return "AT PICKUP";
			case "passenger_on_board":
				return "ON BOARD";
			case "dropped_off":
				return "DROPPED OFF";
			case "awaiting_extras":
				return "AWAITING EXTRAS";
			default:
				return status.replace("_", " ").toUpperCase();
		}
	};
	const [passengerDetailsOpen, setPassengerDetailsOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);
	const [extras, setExtras] = useState<
		{ id: string; description: string; amount: string }[]
	>([{ id: "1", description: "", amount: "" }]);
	// New Close Trip workflow state
	const [closeTripOptionsOpen, setCloseTripOptionsOpen] = useState(false);
	const [closeTripExtrasOpen, setCloseTripExtrasOpen] = useState(false);
	const [tripConfirmationOpen, setTripConfirmationOpen] = useState(false);
	const [isNoShow, setIsNoShow] = useState(false);
	const [extrasData, setExtrasData] = useState<ExtrasFormData | undefined>(
		undefined,
	);
	const [selectedTripForClose, setSelectedTripForClose] = useState<any>(null);
	const [showMapsModal, setShowMapsModal] = useState(false);
	const [selectedMapsBooking, setSelectedMapsBooking] = useState<any>(null);
	const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
	const [selectedBookingForDetails, setSelectedBookingForDetails] =
		useState<any>(null);
	const [closeConfirmationOpen, setCloseConfirmationOpen] = useState(false);
	const [pobConfirmationOpen, setPobConfirmationOpen] = useState(false);
	const [selectedBookingForPob, setSelectedBookingForPob] = useState<any>(null);

	// Status update mutation
	const updateStatusMutation = useUpdateBookingStatusMutation();
	const closeTripWithExtrasMutation = useCloseTripWithExtrasMutation();
	const closeTripWithoutExtrasMutation = useCloseTripWithoutExtrasMutation();

	// Memoize mobile detection to prevent re-evaluation during render
	const isMobile = useMemo(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}, []);

	// Driver data with fallback values
	const currentDriver = {
		id: null as string | null,
		...rawCurrentDriver,
	};

	// Fetch all bookings for current driver - use same parameters as history page that works
	const {
		data: bookingsData,
		isLoading: isBookingsLoading,
		refetch,
	} = useGetDriverBookingsQuery({
		limit: 100, // Match history page parameters
	});

	const allBookings = bookingsData?.data || [];

	// Filter for active trip statuses that drivers need to work on
	// Note: driver_assigned trips appear in /driver/available, not here
	const activeStatuses = [
		"driver_en_route", // Driver has started the trip - heading to pickup
		"in_progress", // Legacy status for active trips
		"arrived_pickup", // Driver arrived at pickup location
		"passenger_on_board", // Passenger picked up, heading to destination
		"dropped_off", // Passenger dropped off, awaiting trip closure
		"awaiting_extras", // Trip closed, awaiting extras processing
	];

	const bookings = allBookings.filter((booking: any) =>
		activeStatuses.includes(booking.status),
	);

	// Filter bookings based on search only - already filtered to in-progress trips by query
	const filteredBookings = bookings
		.filter((booking: any) => {
			const matchesSearch =
				searchQuery === "" ||
				booking.customerName
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				booking.originAddress
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				booking.destinationAddress
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			return matchesSearch;
		})
		.sort((a: any, b: any) => {
			// Sort by closest scheduled pickup time (soonest first)
			return (
				new Date(a.scheduledPickupTime).getTime() -
				new Date(b.scheduledPickupTime).getTime()
			);
		});

	// Simple stats for in-progress trips only
	const tripStats = {
		totalInProgress: bookings.length,
		activeTrips: bookings.filter((b) =>
			[
				"driver_en_route",
				"in_progress",
				"arrived_pickup",
				"passenger_on_board",
			].includes(b.status),
		).length,
		pendingTrips: bookings.filter((b) => ["driver_assigned"].includes(b.status))
			.length,
		waitingForExtras: bookings.filter((b) =>
			["dropped_off", "awaiting_extras"].includes(b.status),
		).length,
	};

	// Driver workflow status transitions
	const getNextStatus = (currentStatus: string) => {
		switch (currentStatus) {
			case "confirmed":
				return "driver_en_route"; // Start Job
			case "driver_assigned":
				return "driver_en_route"; // Start Job
			case "driver_en_route":
				return "arrived_pickup"; // Arrived at Pickup
			case "arrived_pickup":
				return "passenger_on_board"; // Passenger/s On Board
			case "passenger_on_board":
				return "dropped_off"; // Dropped Off
			case "dropped_off":
				return "awaiting_extras"; // Extras
			case "awaiting_extras":
				return "completed"; // Complete
			default:
				return currentStatus;
		}
	};

	const getStatusButtonText = (currentStatus: string) => {
		switch (currentStatus) {
			case "confirmed":
				return "Start Job";
			case "driver_assigned":
				return "Start Job";
			case "driver_en_route":
				return "Arrived at Pickup";
			case "arrived_pickup":
				return "Passenger/s On Board";
			case "passenger_on_board":
				return "Dropped Off";
			case "dropped_off":
				return "Close Trip";
			case "awaiting_extras":
				return "Complete Trip";
			default:
				return "Update Status";
		}
	};

	const handleStartTrip = (booking: any) => {
		// If current status is 'dropped_off', show Close Trip options dialog
		if (booking.status === "dropped_off") {
			setSelectedTripForClose(booking);
			setCloseTripOptionsOpen(true);
			return;
		}

		// If current status is 'arrived_pickup', show POB confirmation dialog
		if (booking.status === "arrived_pickup") {
			setSelectedBookingForPob(booking);
			setPobConfirmationOpen(true);
			return;
		}

		const nextStatus = getNextStatus(booking.status);

		updateStatusMutation.mutate(
			{
				id: booking.id,
				status: nextStatus,
			} as any,
			{
				onSuccess: (data) => {
					// Invalidate and refetch driver trips to get refreshed data
					queryClient.invalidateQueries({
						queryKey: trpc.bookings.getDriverBookings.queryKey(),
					});
					queryClient.refetchQueries({
						queryKey: trpc.bookings.getDriverBookings.queryKey(),
					});

					// Also invalidate available trips queries to update both pages
					queryClient.invalidateQueries({
						queryKey: trpc.bookings.getAvailableTrips.queryKey(),
					});
					queryClient.refetchQueries({
						queryKey: trpc.bookings.getAvailableTrips.queryKey(),
					});

					// Update the selected booking details with new status
					if (
						selectedBookingForDetails &&
						selectedBookingForDetails.id === booking.id
					) {
						setSelectedBookingForDetails({
							...selectedBookingForDetails,
							status: nextStatus,
						});
					}
				},
				onError: (error) => {
					console.error("❌ Failed to update trip status:", error);
				},
			},
		);
	};

	const addExtraItem = () => {
		setExtras((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				description: "",
				amount: "",
			},
		]);
	};

	const removeExtraItem = (id: string) => {
		setExtras((prev) => prev.filter((item) => item.id !== id));
	};

	const updateExtraItem = (
		id: string,
		field: "description" | "amount",
		value: string,
	) => {
		setExtras((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	const calculateTotalExtras = () => {
		return extras.reduce((total, item) => {
			const amount = Number.parseFloat(item.amount || "0");
			return total + (isNaN(amount) ? 0 : amount);
		}, 0);
	};

	const handleSubmitExtras = () => {
		if (selectedBooking) {
			const totalExtrasAmount = calculateTotalExtras();
			// Update booking with extras amount and move to next status
			updateStatusMutation.mutate({
				id: selectedBooking.id,
				status: "awaiting_extras",
				extraCharges: totalExtrasAmount, // Store as dollar amount
			} as any);
		}

		setExtrasDialogOpen(false);
		setExtras([{ id: "1", description: "", amount: "" }]);
		setSelectedBooking(null);
	};

	const handleCompleteTrip = (booking: any) => {
		updateStatusMutation.mutate({
			id: booking.id,
			status: "completed",
		} as any);
	};

	// New Close Trip workflow handlers
	const handleCloseTripOption = (
		option:
			| "close"
			| "close-with-extras"
			| "no-show"
			| "no-show-with-extras"
			| "close-later",
	) => {
		setCloseTripOptionsOpen(false);

		switch (option) {
			case "close":
				// Close trip without extras - go directly to confirmation
				setIsNoShow(false);
				setExtrasData(undefined);
				setTripConfirmationOpen(true);
				break;
			case "close-with-extras":
				// Show extras form
				setIsNoShow(false);
				setCloseTripExtrasOpen(true);
				break;
			case "no-show":
				// No show without extras
				setIsNoShow(true);
				setExtrasData(undefined);
				setTripConfirmationOpen(true);
				break;
			case "no-show-with-extras":
				// No show with extras form
				setIsNoShow(true);
				setCloseTripExtrasOpen(true);
				break;
			case "close-later":
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
				location: extrasData.location || "",
				otherCharges: {
					description: extrasData.otherCharges?.description || "",
					amount: extrasData.otherCharges?.amount || 0, // Store as dollar amount
				},
				extraType: extrasData.extraType || "general",
				notes: extrasData.notes || "",
			};

			// Use the new close trip with extras mutation
			closeTripWithExtrasMutation.mutate(
				{
					bookingId: selectedTripForClose.id,
					isNoShow: isNoShow,
					extrasData: extrasForBackend,
				} as any,
				{
					onSuccess: (data) => {
						// Force immediate refresh of the data - don't clear state until after refresh
						queryClient.invalidateQueries({
							queryKey: trpc.bookings.getDriverBookings.queryKey(),
						});
						queryClient.refetchQueries({
							queryKey: trpc.bookings.getDriverBookings.queryKey(),
						});

						// Small delay to allow cache to refresh before clearing state
						setTimeout(() => {
							// Close only the trip closing workflow dialogs
							setTripConfirmationOpen(false);
							setCloseTripOptionsOpen(false);
							setCloseTripExtrasOpen(false);

							// Update the booking details dialog with the completed trip data
							if (
								selectedBookingForDetails &&
								selectedBookingForDetails.id === selectedTripForClose?.id &&
								data?.data?.booking
							) {
								const updatedBooking = data.data.booking;
								setSelectedBookingForDetails({
									...selectedBookingForDetails,
									status: updatedBooking.status,
									extraCharges: updatedBooking.extraCharges,
									finalAmount: updatedBooking.finalAmount,
									serviceCompletedAt: updatedBooking.serviceCompletedAt,
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
					},
				},
			);
		} else {
			// No extras - use simple close trip mutation
			closeTripWithoutExtrasMutation.mutate(
				{
					bookingId: selectedTripForClose.id,
					isNoShow: isNoShow,
				} as any,
				{
					onSuccess: (data) => {
						// Close only the trip closing workflow dialogs
						setTripConfirmationOpen(false);
						setCloseTripOptionsOpen(false);
						setCloseTripExtrasOpen(false);

						// Update the booking details dialog with the completed trip data
						if (
							selectedBookingForDetails &&
							selectedBookingForDetails.id === selectedTripForClose?.id &&
							data?.data?.booking
						) {
							const updatedBooking = data.data.booking;
							setSelectedBookingForDetails({
								...selectedBookingForDetails,
								status: updatedBooking.status,
								extraCharges: updatedBooking.extraCharges || 0,
								finalAmount: updatedBooking.finalAmount,
								serviceCompletedAt: updatedBooking.serviceCompletedAt,
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
					},
				},
			);
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
		const total =
			(extrasData.parkingCharges || 0) +
			(extrasData.tollCharges || 0) +
			(extrasData.otherCharges?.amount || 0);
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
		if (
			selectedBookingForDetails &&
			["completed", "no_show"].includes(selectedBookingForDetails.status)
		) {
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

		updateStatusMutation.mutate(
			{
				id: selectedBookingForPob.id,
				status: nextStatus,
			} as any,
			{
				onSuccess: (data) => {
					// Invalidate and refetch driver trips to get refreshed data
					queryClient.invalidateQueries({
						queryKey: trpc.bookings.getDriverBookings.queryKey(),
					});
					queryClient.refetchQueries({
						queryKey: trpc.bookings.getDriverBookings.queryKey(),
					});

					// Also invalidate available trips queries to update both pages
					queryClient.invalidateQueries({
						queryKey: trpc.bookings.getAvailableTrips.queryKey(),
					});
					queryClient.refetchQueries({
						queryKey: trpc.bookings.getAvailableTrips.queryKey(),
					});

					// Update the selected booking details with new status
					if (
						selectedBookingForDetails &&
						selectedBookingForDetails.id === selectedBookingForPob.id
					) {
						setSelectedBookingForDetails({
							...selectedBookingForDetails,
							status: nextStatus,
						});
					}

					// Close the confirmation dialog
					setPobConfirmationOpen(false);
					setSelectedBookingForPob(null);
				},
				onError: (error) => {
					console.error("❌ Failed to update trip status:", error);
					// Keep dialog open on error
				},
			},
		);
	};

	const navigateToLocation = (
		destinationAddress: string,
		locationType: "pickup" | "dropoff",
	) => {
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
			window.open(googleMapsUrl, "_blank");
		}

		setShowMapsModal(false);
	};

	const openMapsApp = (booking: any, appType: "google" | "apple") => {
		let mapsUrl = "";

		// Determine destination based on booking status
		let destination = "";
		let origin = "";

		if (
			["confirmed", "driver_assigned", "driver_en_route"].includes(
				booking.status,
			)
		) {
			destination = booking.originAddress; // Go to pickup
		} else if (
			["arrived_pickup", "passenger_on_board"].includes(booking.status)
		) {
			destination = booking.destinationAddress; // Go to dropoff
		} else {
			// Show full route
			origin = booking.originAddress;
			destination = booking.destinationAddress;
		}

		switch (appType) {
			case "google":
				// Google Maps always needs explicit origin for proper routing
				if (origin) {
					mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
				} else {
					// Use current location as origin for Google Maps
					mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(destination)}&travelmode=driving`;
				}
				break;
			case "apple":
				// Apple Maps uses current location by default
				if (origin) {
					mapsUrl = `maps://?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=d`;
				} else {
					mapsUrl = `maps://?daddr=${encodeURIComponent(destination)}&dirflg=d`;
				}
				break;
		}

		// Use window.location.href for mobile app links
		if (
			appType === "apple" ||
			/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent,
			)
		) {
			window.location.href = mapsUrl;
		} else {
			window.open(mapsUrl, "_blank");
		}
		setShowMapsModal(false);
	};

	if (isDriverLoading || isBookingsLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-1/3 rounded bg-gray-200" />
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 rounded bg-gray-200" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				isMobile
					? "flex min-h-screen flex-col bg-gray-50"
					: "mx-auto min-h-screen max-w-4xl bg-gray-50 p-4",
			)}
		>
			{/* Header */}
			<div
				className={cn(
					"flex-shrink-0 border-b bg-white",
					isMobile ? "px-4 py-3" : "mb-4 rounded-lg p-4",
				)}
			>
				<div className="flex items-center justify-between">
					<div>
						<h1
							className={cn(
								"font-bold text-gray-900",
								isMobile ? "text-lg" : "text-2xl",
							)}
						>
							My Trips
						</h1>
						<p className="text-gray-600 text-xs">
							Your current in-progress trips
						</p>
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
				<div
					className={cn(
						"flex-shrink-0 border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100",
						isMobile ? "mx-0 px-4 py-3" : "mx-4 mb-4 rounded-lg px-4 py-3",
					)}
				>
					<div className="flex items-center gap-3">
						<div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
						<div className="flex-1">
							<h3 className="font-semibold text-blue-900 text-sm">
								{tripStats.activeTrips === 1
									? "1 trip in progress"
									: `${tripStats.activeTrips} trips in progress`}
							</h3>
							<p className="text-blue-700 text-xs">
								{tripStats.pendingTrips > 0
									? `${tripStats.pendingTrips} pending • `
									: ""}
								{tripStats.waitingForExtras > 0
									? `${tripStats.waitingForExtras} awaiting extras • `
									: ""}
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
			<div
				className={cn(
					"flex-shrink-0",
					isMobile ? "border-b bg-white px-4 py-3" : "mb-4",
				)}
			>
				{/* Search */}
				<div className="relative mb-3">
					<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
					<Input
						placeholder="Search by customer, pickup, or destination..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={cn(
							"border-gray-300 pl-10",
							isMobile ? "h-9 text-sm" : "",
						)}
					/>
				</div>
			</div>

			{/* Trips List */}
			<div className={cn(isMobile ? "flex-1 overflow-y-auto" : "space-y-4")}>
				{filteredBookings.length === 0 ? (
					<div
						className={cn(
							"flex h-full items-center justify-center",
							isMobile ? "px-4" : "",
						)}
					>
						<div className="text-center">
							<AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
							<h3 className="mb-2 font-medium text-gray-900 text-lg">
								No trips found
							</h3>
							<p className="text-gray-500 text-sm">
								{searchQuery
									? "Try adjusting your search terms."
									: "No assigned trips at the moment."}
							</p>
						</div>
					</div>
				) : (
					<div className={cn(isMobile ? "" : "grid gap-4")}>
						{filteredBookings.map((booking: any, index: number) => {
							// Status-based color coding with stronger inline styles
							const getStatusStyle = (status: string) => {
								const baseStyle = {
									borderLeftWidth: "4px",
									borderLeftStyle: "solid" as const,
								};

								switch (status) {
									case "driver_assigned":
										return { ...baseStyle, borderLeftColor: "#3b82f6" }; // Blue
									case "driver_en_route":
										return { ...baseStyle, borderLeftColor: "#eab308" }; // Yellow
									case "arrived_pickup":
										return { ...baseStyle, borderLeftColor: "#f97316" }; // Orange
									case "passenger_on_board":
									case "in_progress":
										return { ...baseStyle, borderLeftColor: "#22c55e" }; // Green
									case "dropped_off":
									case "awaiting_extras":
										return { ...baseStyle, borderLeftColor: "#a855f7" }; // Purple
									case "completed":
										return { ...baseStyle, borderLeftColor: "#6b7280" }; // Gray
									default:
										return { ...baseStyle, borderLeftColor: "#d1d5db" }; // Light gray
								}
							};

							return (
								<Card
									key={booking.id}
									style={getStatusStyle(booking.status)}
									className={cn(
										"cursor-pointer bg-white transition-colors active:bg-gray-50",
										isMobile
											? "rounded-none border-gray-200 border-t-0 border-r-0 border-b shadow-none"
											: "border-gray-200 border-t border-r border-b shadow-sm hover:shadow-md",
									)}
									onClick={() => handleOpenBookingDetails(booking)}
								>
									<CardContent className={cn(isMobile ? "px-3 py-2.5" : "p-4")}>
										{isMobile ? (
											// Mobile optimized layout
											<>
												{/* Header - Time and Status */}
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-1.5">
														<ClockIcon className="h-3.5 w-3.5 text-gray-500" />
														<div className="flex flex-col">
															<div className="flex items-center gap-2">
																<span className="font-semibold text-gray-900 text-sm">
																	{format(
																		new Date(booking.scheduledPickupTime),
																		"h:mm a",
																	)}
																</span>
																<span className="font-mono text-gray-400 text-xs">
																	#{booking.id.slice(-6)}
																</span>
															</div>
															<span className="text-gray-500 text-xs">
																{format(
																	new Date(booking.scheduledPickupTime),
																	"MMM dd, yyyy",
																)}
															</span>
														</div>
													</div>
													<Badge
														variant={
															booking.status === "completed"
																? "default"
																: booking.status === "cancelled"
																	? "destructive"
																	: booking.status === "confirmed"
																		? "secondary"
																		: "outline"
														}
														className="px-2 py-0.5 text-xs"
													>
														{getStatusDisplayText(booking.status)}
													</Badge>
												</div>

												{/* Route - Full width for mobile */}
												<div className="mb-2 space-y-2">
													<div className="flex items-center gap-2">
														<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
														<p className="truncate text-gray-700 text-xs">
															{booking.originAddress.length > 45
																? booking.originAddress.substring(0, 45) + "..."
																: booking.originAddress}
														</p>
													</div>
													{/* Stops (if any) */}
													{(booking as any).stops &&
														(booking as any).stops.length > 0 && (
															<div className="flex items-center gap-2">
																<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
																<p className="truncate text-blue-600 text-xs">
																	{(booking as any).stops?.length || 0} stop
																	{((booking as any).stops?.length || 0) > 1
																		? "s"
																		: ""}
																</p>
															</div>
														)}
													<div className="flex items-center gap-2">
														<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
														<p className="truncate text-gray-700 text-xs">
															{booking.destinationAddress.length > 45
																? booking.destinationAddress.substring(0, 45) +
																	"..."
																: booking.destinationAddress}
														</p>
													</div>
												</div>

												{/* Customer info with status badge inline */}
												<div className="space-y-2">
													{/* Customer info with status badge */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1.5">
															<UserIcon className="h-3.5 w-3.5 text-gray-500" />
															<span className="truncate text-gray-600 text-xs">
																{booking.customerName}
															</span>
														</div>
														<div className="flex flex-wrap items-center gap-1.5">
															<BookingTypeBadge booking={booking} />
															{booking.bookingType === "offload" &&
																booking.offloadDetails && (
																	<Badge
																		variant="outline"
																		className="border-orange-200 bg-orange-50 text-orange-700 text-xs"
																	>
																		{booking.offloadDetails.offloaderName}
																	</Badge>
																)}
														</div>
													</div>
													{/* Passenger count and Vehicle info */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1">
															<UsersIcon className="h-3.5 w-3.5 text-gray-500" />
															<span className="text-gray-600 text-xs">
																{booking.passengerCount || 1} pax
															</span>
														</div>
														<div className="flex items-center gap-1">
															<CarIcon className="h-3.5 w-3.5 text-gray-500" />
															<span className="text-right font-medium text-gray-600 text-xs">
																{(() => {
																	console.log(
																		"Full booking object keys:",
																		Object.keys(booking),
																	);
																	console.log("Booking car data:", {
																		car: booking.car,
																		carId: booking.carId,
																		assignedCar: booking.assignedCar,
																		carName: booking.carName,
																		vehicleName: booking.vehicleName,
																		vehicle: booking.vehicle,
																	});
																	return (
																		booking.car?.name ||
																		booking.carName ||
																		booking.vehicleName ||
																		booking.vehicle?.name ||
																		"Unassigned"
																	);
																})()}
															</span>
														</div>
													</div>
													{/* Service type and client-booked duration info */}
													{booking.packageId && (
														<div className="mt-2 flex items-center gap-1.5">
															{booking.package?.packageServiceType?.rateType ===
															"hourly" ? (
																<>
																	<TimerIcon className="h-3.5 w-3.5 text-green-500" />
																	<span className="font-medium text-green-600 text-xs">
																		{booking.package?.name || "Hourly Service"}
																		{booking.estimatedDuration && (
																			<span>
																				{" "}
																				•{" "}
																				{Math.round(
																					booking.estimatedDuration / 60,
																				)}
																				h booked
																			</span>
																		)}
																	</span>
																</>
															) : (
																<>
																	<CircleDot className="h-3.5 w-3.5 text-blue-500" />
																	<span className="font-medium text-blue-600 text-xs">
																		{booking.package?.name || "Fixed Service"}
																	</span>
																</>
															)}
														</div>
													)}
												</div>

												{/* Offloader Details Section - Mobile */}
												{booking.bookingType === "offload" &&
													booking.offloadDetails && (
														<div className="mt-3">
															<div className="rounded-md border border-orange-100 bg-orange-50 p-2">
																<div className="mb-1 flex items-center gap-1">
																	<CarIcon className="h-3 w-3 text-orange-600" />
																	<span className="font-semibold text-orange-800 text-xs">
																		Offload Booking
																	</span>
																</div>
																<div className="space-y-1">
																	<div className="text-orange-700 text-xs">
																		<span className="font-medium">
																			Company:
																		</span>{" "}
																		{booking.offloadDetails.offloaderName}
																	</div>
																	<div className="text-orange-700 text-xs">
																		<span className="font-medium">
																			Job Type:
																		</span>{" "}
																		{booking.offloadDetails.jobType}
																	</div>
																	<div className="text-orange-700 text-xs">
																		<span className="font-medium">
																			Vehicle:
																		</span>{" "}
																		{booking.offloadDetails.vehicleType}
																	</div>
																</div>
															</div>
														</div>
													)}
											</>
										) : (
											// Desktop layout (unchanged)
											<>
												{/* Header with Time and Status */}
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-2">
														<ClockIcon className="h-4 w-4 text-gray-500" />
														<div className="flex flex-col">
															<div className="flex items-center gap-2">
																<span className="font-semibold text-gray-900">
																	{format(
																		new Date(booking.scheduledPickupTime),
																		"h:mm a",
																	)}
																</span>
																<span className="font-mono text-gray-400 text-xs">
																	#{booking.id.slice(-6)}
																</span>
															</div>
															<span className="text-gray-500 text-xs">
																{format(
																	new Date(booking.scheduledPickupTime),
																	"MMM dd, yyyy",
																)}
															</span>
														</div>
													</div>
													<Badge
														variant={
															booking.status === "completed"
																? "default"
																: booking.status === "cancelled"
																	? "destructive"
																	: booking.status === "confirmed"
																		? "secondary"
																		: "outline"
														}
														className="font-medium text-xs"
													>
														{getStatusDisplayText(booking.status)}
													</Badge>
												</div>

												{/* Route */}
												<div className="mb-2 space-y-1">
													<div>
														<div className="flex items-start gap-2">
															<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
															<div className="min-w-0 flex-1">
																<p className="truncate text-gray-900 text-sm">
																	{booking.originAddress}
																</p>
															</div>
														</div>
														{/* Stops (if any) */}
														{(booking as any).stops &&
															(booking as any).stops.length > 0 && (
																<div className="flex items-start gap-2">
																	<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
																	<div className="min-w-0 flex-1">
																		<p className="truncate text-blue-600 text-sm">
																			{(booking as any).stops?.length || 0}{" "}
																			intermediate stop
																			{((booking as any).stops?.length || 0) > 1
																				? "s"
																				: ""}
																		</p>
																	</div>
																</div>
															)}
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-1 items-start gap-2">
																<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
																<div className="min-w-0 flex-1">
																	<p className="truncate text-gray-900 text-sm">
																		{booking.destinationAddress}
																	</p>
																</div>
															</div>
														</div>
													</div>
													{/* Arrow icon at the end of route info */}
													<ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
												</div>

												{/* Customer, Pax, and Vehicle */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="flex items-center gap-2">
															<UserIcon className="h-4 w-4 text-gray-500" />
															<span className="text-gray-700 text-sm">
																{booking.customerName}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<BookingTypeBadge booking={booking} />
															{booking.bookingType === "offload" &&
																booking.offloadDetails && (
																	<Badge
																		variant="outline"
																		className="border-orange-200 bg-orange-50 text-orange-700 text-xs"
																	>
																		{booking.offloadDetails.offloaderName}
																	</Badge>
																)}
														</div>
														<div className="flex items-center gap-1">
															<UsersIcon className="h-4 w-4 text-gray-500" />
															<span className="text-gray-600 text-sm">
																{booking.passengerCount || 1} pax
															</span>
														</div>
														{(booking.car?.name ||
															booking.assignedCar?.name ||
															booking.carName) && (
															<div className="flex items-center gap-1">
																<CarIcon className="h-4 w-4 text-gray-500" />
																<span className="text-gray-600 text-sm">
																	{booking.car?.name ||
																		booking.assignedCar?.name ||
																		booking.carName}
																</span>
															</div>
														)}
														{/* Service type and client-booked duration info */}
														{booking.packageId && (
															<div className="flex items-center gap-1">
																{booking.package?.packageServiceType
																	?.rateType === "hourly" ? (
																	<>
																		<TimerIcon className="h-4 w-4 text-green-500" />
																		<span className="font-medium text-green-600 text-sm">
																			{booking.package?.name ||
																				"Hourly Service"}
																			{booking.estimatedDuration && (
																				<span>
																					{" "}
																					(
																					{Math.round(
																						booking.estimatedDuration / 60,
																					)}
																					h booked)
																				</span>
																			)}
																		</span>
																	</>
																) : (
																	<>
																		<CircleDot className="h-4 w-4 text-blue-500" />
																		<span className="font-medium text-blue-600 text-sm">
																			{booking.package?.name || "Fixed Service"}
																		</span>
																	</>
																)}
															</div>
														)}
													</div>
												</div>

												{/* Offloader Details Section - Desktop */}
												{booking.bookingType === "offload" &&
													booking.offloadDetails && (
														<div className="mt-3">
															<div className="rounded-md border border-orange-100 bg-orange-50 p-3">
																<div className="mb-2 flex items-center gap-1.5">
																	<CarIcon className="h-4 w-4 text-orange-600" />
																	<span className="font-semibold text-orange-800 text-sm">
																		Offload Booking Details
																	</span>
																</div>
																<div className="grid grid-cols-3 gap-3">
																	<div>
																		<span className="font-medium text-orange-600 text-xs">
																			Company:
																		</span>
																		<p className="text-orange-700 text-sm">
																			{booking.offloadDetails.offloaderName}
																		</p>
																	</div>
																	<div>
																		<span className="font-medium text-orange-600 text-xs">
																			Job Type:
																		</span>
																		<p className="text-orange-700 text-sm">
																			{booking.offloadDetails.jobType}
																		</p>
																	</div>
																	<div>
																		<span className="font-medium text-orange-600 text-xs">
																			Vehicle:
																		</span>
																		<p className="text-orange-700 text-sm">
																			{booking.offloadDetails.vehicleType}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													)}
											</>
										)}
									</CardContent>
								</Card>
							);
						})}
						{/* Bottom padding for mobile to ensure last item is visible above bottom nav */}
						{isMobile && <div className="h-20" />}
					</div>
				)}
			</div>

			{/* Navigation Location Selection Modal */}
			<Dialog open={showMapsModal} onOpenChange={setShowMapsModal}>
				<DialogContent
					showCloseButton={!isMobile}
					className={cn(
						isMobile
							? "!max-w-none !w-screen !h-screen !m-0 !p-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none"
							: "max-w-md",
					)}
				>
					{isMobile ? (
						// Mobile full-screen layout matching existing theme
						<div className="flex h-full flex-col bg-white">
							{/* Header matching your existing theme */}
							<div className="flex items-center justify-between border-b p-4">
								<div className="flex items-center gap-2">
									<NavigationIcon className="h-5 w-5" />
									<h2 className="font-semibold text-lg">Start navigation to</h2>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => setShowMapsModal(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Content exactly matching your design */}
							<div className="space-y-3 p-4">
								{/* Pickup Location - exactly like your design */}
								<div
									className="cursor-pointer rounded-lg border border-green-200 bg-green-50 p-4"
									onClick={() =>
										selectedMapsBooking &&
										navigateToLocation(
											selectedMapsBooking.originAddress,
											"pickup",
										)
									}
								>
									<div className="flex items-start gap-3">
										<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 font-medium text-green-800 text-sm">
												Pickup location
											</div>
											<div className="break-words text-green-700 text-sm">
												{selectedMapsBooking?.originAddress}
											</div>
										</div>
									</div>
								</div>

								{/* Stops (if any) */}
								{selectedMapsBooking?.stops &&
									selectedMapsBooking.stops.length > 0 &&
									selectedMapsBooking.stops.map((stop: any, index: number) => (
										<div
											key={stop.id || index}
											className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 p-4"
											onClick={() => navigateToLocation(stop.address, "pickup")}
										>
											<div className="flex items-start gap-3">
												<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
												<div className="min-w-0 flex-1">
													<div className="mb-1 font-medium text-blue-800 text-sm">
														Stop {index + 1}
													</div>
													<div className="break-words text-blue-700 text-sm">
														{stop.address}
													</div>
												</div>
											</div>
										</div>
									))}

								{/* Dropoff Location - exactly like your design */}
								<div
									className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-4"
									onClick={() =>
										selectedMapsBooking &&
										navigateToLocation(
											selectedMapsBooking.destinationAddress,
											"dropoff",
										)
									}
								>
									<div className="flex items-start gap-3">
										<div className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 font-medium text-red-800 text-sm">
												Dropoff location
											</div>
											<div className="break-words text-red-700 text-sm">
												{selectedMapsBooking?.destinationAddress}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Cancel button at bottom of screen */}
							<div className="mt-auto border-t bg-white p-4">
								<Button
									variant="ghost"
									className="w-full"
									onClick={() => setShowMapsModal(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						// Desktop layout (existing)
						<>
							<DialogHeader className="space-y-2">
								<DialogTitle className="flex items-center gap-2 text-base">
									<NavigationIcon className="h-5 w-5 flex-shrink-0" />
									<span>Start navigation to</span>
								</DialogTitle>
								<DialogDescription className="text-xs leading-relaxed">
									You can only navigate to the drop off location once the
									passenger is in the vehicle.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-3 py-4">
								{/* Desktop Pickup Location */}
								<Button
									variant="outline"
									className="h-auto w-full justify-start p-4"
									onClick={() =>
										selectedMapsBooking &&
										navigateToLocation(
											selectedMapsBooking.originAddress,
											"pickup",
										)
									}
								>
									<div className="flex w-full items-start gap-3 text-left">
										<div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-green-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 font-medium text-gray-900 text-sm">
												Pickup location
											</div>
											<div className="break-words text-gray-600 text-xs leading-relaxed">
												{selectedMapsBooking?.originAddress}
											</div>
										</div>
									</div>
								</Button>

								{/* Desktop Stops */}
								{selectedMapsBooking?.stops &&
									selectedMapsBooking.stops.length > 0 && (
										<div className="space-y-2">
											<div className="px-1 font-medium text-gray-700 text-sm">
												Intermediate Stops ({selectedMapsBooking.stops.length})
											</div>
											{selectedMapsBooking.stops.map(
												(stop: any, index: number) => (
													<Button
														key={stop.id || index}
														variant="outline"
														className="h-auto w-full justify-start border-blue-200 bg-blue-50 p-4"
														onClick={() =>
															navigateToLocation(stop.address, "pickup")
														}
													>
														<div className="flex w-full items-start gap-3 text-left">
															<div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
															<div className="min-w-0 flex-1">
																<div className="mb-1 font-medium text-blue-900 text-sm">
																	Stop {index + 1}
																</div>
																<div className="break-words text-blue-700 text-xs leading-relaxed">
																	{stop.address}
																</div>
															</div>
														</div>
													</Button>
												),
											)}
										</div>
									)}

								{/* Desktop Dropoff Location */}
								<Button
									variant="outline"
									className="h-auto w-full justify-start p-4"
									onClick={() =>
										selectedMapsBooking &&
										navigateToLocation(
											selectedMapsBooking.destinationAddress,
											"dropoff",
										)
									}
								>
									<div className="flex w-full items-start gap-3 text-left">
										<div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
										<div className="min-w-0 flex-1">
											<div className="mb-1 font-medium text-gray-900 text-sm">
												Dropoff location
											</div>
											<div className="break-words text-gray-600 text-xs leading-relaxed">
												{selectedMapsBooking?.destinationAddress}
											</div>
										</div>
									</div>
								</Button>

								{/* Desktop Cancel */}
								<Button
									variant="ghost"
									className="mt-4 w-full"
									onClick={() => setShowMapsModal(false)}
								>
									Cancel
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Booking Details Dialog/Fullscreen */}
			<Dialog
				open={bookingDetailsOpen}
				onOpenChange={(open) => {
					if (!open) {
						// Prevent click-outside close for completed trips on desktop
						if (
							selectedBookingForDetails &&
							["completed", "no_show"].includes(
								selectedBookingForDetails.status,
							) &&
							!isMobile
						) {
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
					showCloseButton={!isMobile}
					className={cn(
						isMobile
							? "m-0 h-full w-full max-w-full rounded-none bg-gray-50 p-0"
							: "max-h-[90vh] max-w-md bg-gray-50",
					)}
				>
					{selectedBookingForDetails && (
						<div
							className={cn(
								"flex flex-col",
								isMobile ? "h-full min-h-full" : "h-full max-h-[90vh]",
							)}
						>
							{/* Compact Header with gradient background */}
							<div
								className={cn(
									"relative flex flex-shrink-0 items-center justify-between bg-gradient-to-br from-primary to-primary/80 p-4 text-white",
									isMobile ? "pt-8" : "rounded-t-lg",
								)}
							>
								<div className="flex items-center gap-3">
									<ClockIcon className="h-5 w-5 text-white/80" />
									<div>
										<h2 className="font-bold text-lg">
											{format(
												new Date(selectedBookingForDetails.scheduledPickupTime),
												"MMM dd, yyyy h:mm a",
											)}
										</h2>
										<div className="mt-1 flex items-center gap-2">
											<span className="text-white/80 text-xs">
												Trip ID:{" "}
												{selectedBookingForDetails.id.slice(-6).toUpperCase()}
											</span>
											<Badge className="border-white/30 bg-white/20 px-2 py-0.5 text-white text-xs">
												{getStatusDisplayText(selectedBookingForDetails.status)}
											</Badge>
										</div>
									</div>
								</div>

								<Button
									variant="ghost"
									size="lg"
									className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white/30 p-0 text-white transition-all duration-200 hover:border-white/50 hover:bg-white/20"
									onClick={handleCloseBookingDetails}
								>
									<X className="h-6 w-6" />
								</Button>
							</div>

							{/* Scrollable Content Area */}
							<div className={cn("flex-1 overflow-y-auto", isMobile ? "" : "")}>
								<div className="space-y-4 p-4">
									{/* Service Information Card (for package bookings) */}
									{selectedBookingForDetails.packageId && (
										<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 text-sm">
												<ActivityIcon className="h-4 w-4 text-primary" />
												Service Details
											</h3>
											<div className="space-y-2">
												<div className="flex items-start gap-2">
													<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
													<div className="min-w-0 flex-1">
														<p className="mb-0.5 font-medium text-blue-700 text-xs">
															Service Type
														</p>
														<p className="font-medium text-gray-900 text-xs">
															{selectedBookingForDetails.package?.name ||
																"Service Package"}
														</p>
														{selectedBookingForDetails.package
															?.packageServiceType?.rateType === "hourly" && (
															<p className="mt-1 font-medium text-green-600 text-xs">
																{selectedBookingForDetails.estimatedDuration ? (
																	<>
																		Client Booked:{" "}
																		{Math.round(
																			selectedBookingForDetails.estimatedDuration /
																				60,
																		)}{" "}
																		hour
																		{Math.round(
																			selectedBookingForDetails.estimatedDuration /
																				60,
																		) !== 1
																			? "s"
																			: ""}
																	</>
																) : (
																	"Hourly Service"
																)}
															</p>
														)}
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Offload Booking Information Card */}
									{selectedBookingForDetails.bookingType === "offload" &&
										selectedBookingForDetails.offloadDetails && (
											<div className="rounded-xl border border-orange-100 bg-orange-50 p-3 shadow-sm">
												<h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-900 text-sm">
													<TruckIcon className="h-4 w-4 text-orange-600" />
													Offload Booking Details
												</h3>
												<div className="space-y-2">
													<div className="flex items-start gap-2">
														<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-500" />
														<div className="min-w-0 flex-1">
															<p className="mb-0.5 font-medium text-orange-700 text-xs">
																Company Name
															</p>
															<p className="font-medium text-gray-900 text-xs">
																{
																	selectedBookingForDetails.offloadDetails
																		.offloaderName
																}
															</p>
														</div>
													</div>
													<div className="flex items-start gap-2">
														<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-500" />
														<div className="min-w-0 flex-1">
															<p className="mb-0.5 font-medium text-orange-700 text-xs">
																Job Type
															</p>
															<p className="font-medium text-gray-900 text-xs">
																{
																	selectedBookingForDetails.offloadDetails
																		.jobType
																}
															</p>
														</div>
													</div>
													<div className="flex items-start gap-2">
														<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-500" />
														<div className="min-w-0 flex-1">
															<p className="mb-0.5 font-medium text-orange-700 text-xs">
																Vehicle Type
															</p>
															<p className="font-medium text-gray-900 text-xs">
																{
																	selectedBookingForDetails.offloadDetails
																		.vehicleType
																}
															</p>
														</div>
													</div>
												</div>
											</div>
										)}

									{/* Compact Route Information Card */}
									<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
										<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 text-sm">
											<MapPinIcon className="h-4 w-4 text-primary" />
											{selectedBookingForDetails.packageId
												? "Trip Route"
												: "Journey Route"}
										</h3>
										<div className="space-y-2">
											<div className="flex items-start gap-2">
												<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" />
												<div className="min-w-0 flex-1">
													<p className="mb-0.5 font-medium text-green-700 text-xs">
														Pick up
													</p>
													<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
														{selectedBookingForDetails.originAddress}
													</p>
												</div>
											</div>

											{/* Stops (if any) */}
											{selectedBookingForDetails.stops &&
												selectedBookingForDetails.stops.length > 0 && (
													<>
														{selectedBookingForDetails.stops.map(
															(stop: any, index: number) => (
																<div key={stop.id || index}>
																	<div className="ml-1 h-2 border-gray-200 border-l" />
																	<div className="flex items-start gap-2">
																		<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
																		<div className="min-w-0 flex-1">
																			<p className="mb-0.5 font-medium text-blue-700 text-xs">
																				Stop {index + 1}
																			</p>
																			<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
																				{stop.address}
																			</p>
																		</div>
																	</div>
																</div>
															),
														)}
													</>
												)}

											<div className="ml-1 h-2 border-gray-200 border-l" />

											<div className="flex items-start gap-2">
												<div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
												<div className="min-w-0 flex-1">
													<p className="mb-0.5 font-medium text-red-700 text-xs">
														Drop off
													</p>
													<p className="line-clamp-2 break-words text-gray-600 text-xs leading-tight">
														{selectedBookingForDetails.destinationAddress}
													</p>
												</div>
											</div>
										</div>
									</div>

									{/* Customer Information Card */}
									<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
										<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 text-sm">
											<UserIcon className="h-4 w-4 text-primary" />
											Customer Details
										</h3>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gray-400" />
												<div className="flex-1">
													<p className="font-medium text-gray-900 text-sm">
														{selectedBookingForDetails.customerName}
													</p>
												</div>
											</div>
											{selectedBookingForDetails.customerPhone && (
												<div className="flex items-center gap-2">
													<PhoneIcon className="ml-0.5 h-3 w-3 text-gray-400" />
													<p className="text-gray-600 text-xs">
														{selectedBookingForDetails.customerPhone}
													</p>
												</div>
											)}
											<div className="flex items-center gap-2">
												<UsersIcon className="ml-0.5 h-3 w-3 text-gray-400" />
												<p className="text-gray-600 text-xs">
													{selectedBookingForDetails.passengerCount || 1}{" "}
													passenger
													{(selectedBookingForDetails.passengerCount || 1) !== 1
														? "s"
														: ""}
												</p>
											</div>
										</div>
									</div>

									{/* Compact Vehicle Information */}
									{selectedBookingForDetails.car && (
										<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
											<div className="flex items-center gap-2.5">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
													<CarIcon className="h-4 w-4 text-blue-600" />
												</div>
												<div>
													<p className="font-medium text-gray-900 text-sm">
														{selectedBookingForDetails.car.name}
													</p>
													<p className="text-gray-500 text-xs">
														Assigned Vehicle
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Client-Booked Duration Information for Hourly Services */}
									{selectedBookingForDetails.packageId &&
										selectedBookingForDetails.package?.packageServiceType
											?.rateType === "hourly" &&
										selectedBookingForDetails.estimatedDuration && (
											<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
												<div className="flex items-center gap-2.5">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
														<TimerIcon className="h-4 w-4 text-green-600" />
													</div>
													<div>
														<p className="font-medium text-gray-900 text-sm">
															{Math.round(
																selectedBookingForDetails.estimatedDuration /
																	60,
															)}{" "}
															Hour
															{Math.round(
																selectedBookingForDetails.estimatedDuration /
																	60,
															) !== 1
																? "s"
																: ""}{" "}
															Booked
														</p>
														<p className="text-gray-500 text-xs">
															Client booked service duration
														</p>
													</div>
												</div>
											</div>
										)}

									{/* Customer Special Requests */}
									{selectedBookingForDetails.specialRequests && (
										<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 text-sm">
												<MessageSquare className="h-4 w-4 text-blue-600" />
												Customer Special Requests
											</h3>
											<div className="rounded-lg bg-blue-50 p-3">
												<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
													{selectedBookingForDetails.specialRequests}
												</p>
											</div>
										</div>
									)}

									{/* Additional Notes Section */}
									{selectedBookingForDetails.additionalNotes && (
										<div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
											<h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 text-sm">
												<MessageSquare className="h-4 w-4 text-primary" />
												Additional Notes
											</h3>
											<div className="rounded-lg bg-gray-50 p-3">
												<p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
													{selectedBookingForDetails.additionalNotes}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Sticky Customer Contact Info - Above Action Buttons */}
							<div className="flex-shrink-0 border-gray-200 border-t bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
											<User className="h-5 w-5 text-white" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-gray-900 text-sm">
												{selectedBookingForDetails.customerName}
											</p>
											<p className="text-gray-600 text-xs">
												{selectedBookingForDetails.customerPhone}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size={isMobile ? "default" : "sm"}
											className={cn(
												"rounded-full border-green-200 bg-green-50 shadow-sm transition-shadow hover:border-green-300 hover:bg-green-100 hover:shadow-md",
												isMobile ? "h-11 w-11 p-0" : "h-9 w-9 p-0",
											)}
											onClick={() =>
												(window.location.href = `tel:${selectedBookingForDetails.customerPhone}`)
											}
										>
											<PhoneIcon
												className={cn(
													"text-green-600",
													isMobile ? "h-5 w-5" : "h-4 w-4",
												)}
											/>
										</Button>
										<Button
											variant="outline"
											size={isMobile ? "default" : "sm"}
											className={cn(
												"rounded-full border-blue-200 bg-blue-50 shadow-sm transition-shadow hover:border-blue-300 hover:bg-blue-100 hover:shadow-md",
												isMobile ? "h-11 w-11 p-0" : "h-9 w-9 p-0",
											)}
											onClick={() =>
												(window.location.href = `sms:${selectedBookingForDetails.customerPhone}`)
											}
										>
											<MessageSquare
												className={cn(
													"text-blue-600",
													isMobile ? "h-5 w-5" : "h-4 w-4",
												)}
											/>
										</Button>
									</div>
								</div>
							</div>

							{/* Enhanced Actions - Flex positioned at bottom */}
							<div
								className={cn(
									"flex-shrink-0 border-gray-200 border-t bg-white p-4",
									isMobile ? "shadow-2xl" : "rounded-b-lg",
								)}
							>
								{/* Navigation or Fare Display based on trip status */}
								{["completed", "no_show"].includes(
									selectedBookingForDetails.status,
								) ? (
									/* Your Share Card for completed trips */
									<div className="w-full rounded-lg border-2 border-green-200 bg-green-50 p-3">
										<div className="space-y-1">
											{/* Pending Extras (from current form) - only when closing trip */}
											{selectedTripForClose?.id ===
												selectedBookingForDetails.id &&
												calculateTotalExtrasCharges() > 0 && (
													<div className="flex items-center justify-between">
														<span className="text-blue-700 text-sm">
															Pending Extras:
														</span>
														<span className="font-semibold text-blue-700">
															+${calculateTotalExtrasCharges().toFixed(2)}
														</span>
													</div>
												)}

											{/* Your Share - driver only sees their commission share (excludes toll/parking, includes waiting) */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<DollarSignIcon className="h-4 w-4 text-green-600" />
													<span className="font-bold text-green-800">
														Your Share:
													</span>
												</div>
												<span className="font-bold text-green-800 text-lg">
													${(() => {
														if (
															["completed", "cancelled"].includes(
																selectedBookingForDetails.status,
															) ||
															!selectedTripForClose
														) {
															return (
																selectedBookingForDetails.driverShare ??
																selectedBookingForDetails.finalAmount ??
																selectedBookingForDetails.quotedAmount ??
																0
															).toFixed(2);
														}
														const baseAmount =
															selectedBookingForDetails.quotedAmount || 0;
														const extrasAmount =
															selectedTripForClose?.id ===
															selectedBookingForDetails.id
																? calculateTotalExtrasCharges()
																: 0;
														return (baseAmount + extrasAmount).toFixed(2);
													})()}
												</span>
											</div>
										</div>
									</div>
								) : (
									<div className="space-y-3">
										{/* Your Share for dropped_off status */}
										{selectedBookingForDetails.status === "dropped_off" && (
											<div className="w-full rounded-lg border-2 border-green-200 bg-green-50 p-3">
												<div className="space-y-1">
													{/* Pending Extras (from current form) */}
													{selectedTripForClose?.id ===
														selectedBookingForDetails.id &&
														calculateTotalExtrasCharges() > 0 && (
															<div className="flex items-center justify-between">
																<span className="text-blue-700 text-sm">
																	Pending Extras:
																</span>
																<span className="font-semibold text-blue-700">
																	+${calculateTotalExtrasCharges().toFixed(2)}
																</span>
															</div>
														)}

													{/* Your Share */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<DollarSignIcon className="h-4 w-4 text-green-600" />
															<span className="font-bold text-green-800">
																Your Share:
															</span>
														</div>
														<span className="font-bold text-green-800 text-lg">
															${(() => {
																if (
																	["completed", "cancelled"].includes(
																		selectedBookingForDetails.status,
																	) ||
																	!selectedTripForClose
																) {
																	return (
																		selectedBookingForDetails.driverShare ??
																		selectedBookingForDetails.finalAmount ??
																		selectedBookingForDetails.quotedAmount ??
																		0
																	).toFixed(2);
																}
																const baseAmount =
																	selectedBookingForDetails.quotedAmount || 0;
																const extrasAmount =
																	selectedTripForClose?.id ===
																	selectedBookingForDetails.id
																		? calculateTotalExtrasCharges()
																		: 0;
																return (baseAmount + extrasAmount).toFixed(2);
															})()}
														</span>
													</div>
												</div>
											</div>
										)}

										{/* Horizontal Actions Layout */}
										<div className="flex items-center gap-3">
											{/* Navigate Button - Smaller size */}
											<Button
												variant="outline"
												className="h-12 w-12 rounded-lg border-2 border-primary p-0 font-medium text-primary transition-all duration-200 hover:bg-primary hover:text-white"
												onClick={() => {
													setSelectedMapsBooking(selectedBookingForDetails);
													setShowMapsModal(true);
												}}
											>
												<NavigationIcon className="h-5 w-5" />
											</Button>

											{/* Status Action - Takes remaining width */}
											{(() => {
												const canProgress = [
													"driver_assigned",
													"driver_en_route",
													"arrived_pickup",
													"passenger_on_board",
													"dropped_off",
													"awaiting_extras",
													"confirmed",
												].includes(selectedBookingForDetails.status);

												if (!canProgress) return null;

												return (
													<Button
														className="h-12 flex-1 rounded-lg bg-primary font-medium text-primary-foreground text-sm hover:bg-primary/90"
														onClick={() => {
															handleStartTrip(selectedBookingForDetails);
														}}
														disabled={updateStatusMutation.isPending}
													>
														{updateStatusMutation.isPending
															? "Updating..."
															: getStatusButtonText(
																	selectedBookingForDetails.status,
																)}
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
									onChange={(e) =>
										updateExtraItem(extra.id, "description", e.target.value)
									}
									className="flex-1"
								/>
								<Input
									placeholder="Amount"
									type="number"
									step="0.01"
									value={extra.amount}
									onChange={(e) =>
										updateExtraItem(extra.id, "amount", e.target.value)
									}
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

						<Button variant="outline" onClick={addExtraItem} className="w-full">
							<PlusIcon className="mr-2 h-4 w-4" />
							Add Another Item
						</Button>

						<div className="border-t pt-4">
							<div className="flex items-center justify-between">
								<span className="font-medium">Total Extra Charges:</span>
								<span className="font-bold text-lg">
									${calculateTotalExtras().toFixed(2)}
								</span>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => setExtrasDialogOpen(false)}
								className="flex-1"
							>
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
				isSubmitting={
					updateStatusMutation.isPending ||
					closeTripWithExtrasMutation.isPending ||
					closeTripWithoutExtrasMutation.isPending
				}
			/>

			{/* Close Confirmation Dialog */}
			<AlertDialog
				open={closeConfirmationOpen}
				onOpenChange={setCloseConfirmationOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Close Trip Details?</AlertDialogTitle>
						<AlertDialogDescription>
							The trip transaction has been completed successfully. Are you sure
							you want to close the trip details? You can always view the trip
							again from your history.
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
			<AlertDialog
				open={pobConfirmationOpen}
				onOpenChange={setPobConfirmationOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Passenger/s On Board</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure the passenger/s are now on board and you're ready to
							proceed to the destination? This will update the trip status and
							cannot be easily undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setPobConfirmationOpen(false);
								setSelectedBookingForPob(null);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePobConfirmation}
							disabled={updateStatusMutation.isPending}
						>
							{updateStatusMutation.isPending
								? "Updating..."
								: "Confirm Passenger/s On Board"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
