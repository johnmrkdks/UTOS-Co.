import { Loader } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { BookingManagementModalProviders } from "@/features/dashboard/_pages/booking-management/_providers/booking-management-modal-providers";
import { useBookingManagementModalProvider } from "@/features/dashboard/_pages/booking-management/_hooks/use-booking-management-modal-provider";
import { BookingsListTable } from "@/features/dashboard/_pages/booking-management/_components/bookings-list-table";
import { BookingFilters, type BookingFilters as BookingFiltersType } from "@/features/dashboard/_pages/booking-management/_components/booking-filters";
import { BookingCalendar } from "@/features/dashboard/_pages/booking-management/_components/booking-calendar";
import { CreateCustomBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-custom-booking-dialog";
import { CreateOffloadBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-offload-booking-dialog";
import { BookingDetailsDialog } from "@/features/dashboard/_pages/booking-management/_components/booking-details-dialog";
import { AssignDriverDialog } from "@/features/dashboard/_pages/booking-management/_components/assign-driver-dialog";
import { AssignCarDialog } from "@/features/dashboard/_pages/booking-management/_components/assign-car-dialog";
import { EditBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/edit-booking-dialog";
import { ChangeStatusDialog } from "@/features/dashboard/_pages/booking-management/_components/change-status-dialog";
import { ConfirmBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/confirm-booking-dialog";
import { useGetBookingsQuery } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-get-bookings-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, RouteIcon, Clock, Activity, TruckIcon, Archive, CheckCircle, CalendarDays } from "lucide-react";
import { Suspense, useState } from "react";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export const Route = createFileRoute("/admin/dashboard/_layout/bookings/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<BookingManagementModalProviders>
			<BookingManagementContent />
		</BookingManagementModalProviders>
	)
}

function BookingManagementContent() {
	const {
		openCreateCustomBookingDialog,
		openCreateOffloadBookingDialog,
		isAssignDriverDialogOpen,
		selectedBookingForDriver,
		closeAssignDriverDialog,
		isAssignCarDialogOpen,
		selectedBookingForCar,
		closeAssignCarDialog,
		isEditBookingDialogOpen,
		selectedBookingForEdit,
		closeEditBookingDialog,
		isChangeStatusDialogOpen,
		selectedBookingForStatus,
		closeChangeStatusDialog,
		isConfirmBookingDialogOpen,
		selectedBookingForConfirm,
		closeConfirmBookingDialog
	} = useBookingManagementModalProvider();

	const [filters, setFilters] = useState<BookingFiltersType>({});
	const [sortBy, setSortBy] = useState<string>('scheduledPickupTime');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Upcoming bookings first

	const bookingsQuery = useGetBookingsQuery({
		limit: 100,
		sortBy,
		sortOrder,
		...filters,
	})

	// Calculate real-time metrics from bookings data
	const bookingsData = bookingsQuery.data?.data || [];
	const totalBookings = bookingsData.length;
	const pendingBookings = bookingsData.filter(b => b.status === "pending").length;
	const todaysBookings = bookingsData.filter(b => {
		const today = new Date();
		const bookingDate = new Date(b.scheduledPickupTime);
		return bookingDate.toDateString() === today.toDateString();
	}).length;
	const activeBookings = bookingsData.filter(b =>
		["driver_assigned", "in_progress"].includes(b.status)
	).length;
	const readyBookings = bookingsData.filter(b =>
		b.driverId && b.carId && ["confirmed", "driver_assigned"].includes(b.status)
	).length;
	const archivedBookings = bookingsData.filter(b => b.isArchived === true).length;

	// Analytics card data for booking management
	const bookingManagementStatsData: AnalyticsCardData[] = [
		{
			id: 'total-bookings',
			title: 'Total Bookings',
			value: totalBookings,
			icon: CalendarPlus,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: 'All time bookings',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'pending',
			title: 'Pending',
			value: pendingBookings,
			icon: Clock,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			changeText: 'Awaiting confirmation',
			changeType: 'warning',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'todays-bookings',
			title: "Today's Bookings",
			value: todaysBookings,
			icon: CalendarPlus,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: 'Scheduled for today',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'ready',
			title: 'Ready',
			value: readyBookings,
			icon: CheckCircle,
			bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
			iconBg: 'bg-emerald-500',
			changeText: 'Driver & car assigned',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'active',
			title: 'Active',
			value: activeBookings,
			icon: Activity,
			bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
			changeText: 'Currently in progress',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'archived',
			title: 'Archived',
			value: archivedBookings,
			icon: Archive,
			bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
			iconBg: 'bg-gray-500',
			changeText: 'Archived bookings',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		}
	]

	const clearFilters = () => {
		setFilters({});
	}

	const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
	}

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
				<div className="flex items-center space-x-2">
					<Button
						onClick={openCreateOffloadBookingDialog}
						variant="outline"
						className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
					>
						<TruckIcon className="h-4 w-4" />
						Create Offload Booking
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				{bookingManagementStatsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view='compact'
					/>
				))}
			</div>

			{/* Advanced Filters */}
			<BookingFilters
				filters={filters}
				onFiltersChange={setFilters}
				onClearFilters={clearFilters}
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSortChange={handleSortChange}
			/>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Bookings</TabsTrigger>
					<TabsTrigger value="calendar">
						<CalendarDays className="h-4 w-4 mr-1" />
						Calendar
					</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="ready">Ready</TabsTrigger>
					<TabsTrigger value="package">Package Bookings</TabsTrigger>
					<TabsTrigger value="custom">Custom Bookings</TabsTrigger>
					<TabsTrigger value="offload">Offloads</TabsTrigger>
					<TabsTrigger value="archived">Archived</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Bookings</CardTitle>
							<CardDescription>
								Manage all bookings from a single dashboard.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="calendar" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Booking Calendar</CardTitle>
							<CardDescription>
								View all jobs by date. Click any booking to open details.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingCalendar filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="package" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Package Bookings</CardTitle>
							<CardDescription>
								Fixed-price package bookings with predetermined routes and services.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable bookingType="package" filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="custom" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Custom Bookings</CardTitle>
							<CardDescription>
								Custom route bookings with instant quote pricing.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable bookingType="custom" filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pending" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Pending Bookings</CardTitle>
							<CardDescription>
								Bookings awaiting confirmation or driver assignment.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable status="pending" filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="ready" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Ready Bookings</CardTitle>
							<CardDescription>
								Bookings with both driver and car assigned, ready to begin service.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable hasDriver={true} hasCar={true} filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="offload" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Offload Bookings</CardTitle>
							<CardDescription>
								Manual bookings from other companies to help with workload distribution.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable bookingType="offload" filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="archived" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Archived Bookings</CardTitle>
							<CardDescription>
								Bookings that have been archived for record keeping. Archived bookings are hidden from regular views.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense fallback={<Loader />}>
								<BookingsListTable isArchived={true} filters={filters} />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<CreateCustomBookingDialog />
			<CreateOffloadBookingDialog />
			<BookingDetailsDialog />
			<AssignDriverDialog
				booking={selectedBookingForDriver}
				open={isAssignDriverDialogOpen}
				onOpenChange={closeAssignDriverDialog}
			/>
			<AssignCarDialog
				booking={selectedBookingForCar}
				open={isAssignCarDialogOpen}
				onOpenChange={closeAssignCarDialog}
			/>
			<EditBookingDialog
				booking={selectedBookingForEdit}
				open={isEditBookingDialogOpen}
				onOpenChange={closeEditBookingDialog}
			/>
			<ChangeStatusDialog
				booking={selectedBookingForStatus}
				open={isChangeStatusDialogOpen}
				onOpenChange={closeChangeStatusDialog}
			/>
			<ConfirmBookingDialog
				booking={selectedBookingForConfirm}
				open={isConfirmBookingDialogOpen}
				onOpenChange={closeConfirmBookingDialog}
			/>
		</PaddingLayout>
	)
}
