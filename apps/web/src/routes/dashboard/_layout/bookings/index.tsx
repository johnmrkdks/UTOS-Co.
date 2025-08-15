import { Loader } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { BookingManagementModalProviders } from "@/features/dashboard/_pages/booking-management/_providers/booking-management-modal-providers";
import { useBookingManagementModalProvider } from "@/features/dashboard/_pages/booking-management/_hooks/use-booking-management-modal-provider";
import { BookingsListTable } from "@/features/dashboard/_pages/booking-management/_components/bookings-list-table";
import { BookingFilters, type BookingFilters as BookingFiltersType } from "@/features/dashboard/_pages/booking-management/_components/booking-filters";
import { BookingStatusPipeline } from "@/features/dashboard/_pages/booking-management/_components/booking-status-pipeline";
import { BookingRevenueReport } from "@/features/dashboard/_pages/booking-management/_components/booking-revenue-report";
import { CreatePackageBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-package-booking-dialog";
import { CreateCustomBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-custom-booking-dialog";
import { BookingDetailsDialog } from "@/features/dashboard/_pages/booking-management/_components/booking-details-dialog";
import { useGetBookingsQuery } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-get-bookings-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, PackageIcon, RouteIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export const Route = createFileRoute("/dashboard/_layout/bookings/")({
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
		openCreatePackageBookingDialog,
		openCreateCustomBookingDialog
	} = useBookingManagementModalProvider();

	const [filters, setFilters] = useState<BookingFiltersType>({});

	const bookingsQuery = useGetBookingsQuery({
		limit: 100,
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

	const clearFilters = () => {
		setFilters({});
	}

	return (
		<PaddingLayout className="flex-1 space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Booking Management</h2>
				<div className="flex items-center space-x-2">
					<Button
						onClick={openCreatePackageBookingDialog}
						className="flex items-center gap-2"
					>
						<PackageIcon className="h-4 w-4" />
						Create Package Booking
					</Button>
					<Button
						onClick={openCreateCustomBookingDialog}
						variant="outline"
						className="flex items-center gap-2"
					>
						<RouteIcon className="h-4 w-4" />
						Create Custom Booking
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
						<CalendarPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalBookings}
						</div>
						<p className="text-xs text-muted-foreground">
							All time bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<CalendarPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingBookings}</div>
						<p className="text-xs text-muted-foreground">
							Awaiting confirmation
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
						<CalendarPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{todaysBookings}</div>
						<p className="text-xs text-muted-foreground">
							Scheduled for today
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active</CardTitle>
						<CalendarPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeBookings}</div>
						<p className="text-xs text-muted-foreground">
							Currently in progress
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Advanced Filters */}
			<BookingFilters
				filters={filters}
				onFiltersChange={setFilters}
				onClearFilters={clearFilters}
			/>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Bookings</TabsTrigger>
					<TabsTrigger value="pipeline">Status Pipeline</TabsTrigger>
					<TabsTrigger value="revenue">Revenue Report</TabsTrigger>
					<TabsTrigger value="package">Package Bookings</TabsTrigger>
					<TabsTrigger value="custom">Custom Bookings</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
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

				<TabsContent value="pipeline" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Real-time Status Pipeline</CardTitle>
							<CardDescription>
								Drag and drop bookings to update their status in real-time.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BookingStatusPipeline filters={filters} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="revenue" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Revenue Analysis & Profit Reporting</CardTitle>
							<CardDescription>
								Comprehensive revenue breakdown with profit analysis insights.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BookingRevenueReport filters={filters} />
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
			</Tabs>

			<CreatePackageBookingDialog />
			<CreateCustomBookingDialog />
			<BookingDetailsDialog />
		</PaddingLayout>
	)
}
