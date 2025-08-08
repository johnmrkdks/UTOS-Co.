import { Loader } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { BookingManagementModalProviders } from "@/features/dashboard/_pages/booking-management/_providers/booking-management-modal-providers";
import { useBookingManagementModalProvider } from "@/features/dashboard/_pages/booking-management/_hooks/use-booking-management-modal-provider";
import { BookingsListTable } from "@/features/dashboard/_pages/booking-management/_components/bookings-list-table";
import { CreatePackageBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-package-booking-dialog";
import { CreateCustomBookingDialog } from "@/features/dashboard/_pages/booking-management/_components/create-custom-booking-dialog";
import { BookingDetailsDialog } from "@/features/dashboard/_pages/booking-management/_components/booking-details-dialog";
import { useGetBookingsQuery } from "@/features/dashboard/_pages/booking-management/_hooks/query/use-get-bookings-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, PackageIcon, RouteIcon } from "lucide-react";
import { Suspense } from "react";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";

export const Route = createFileRoute("/dashboard/_layout/booking-management/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<BookingManagementModalProviders>
			<BookingManagementContent />
		</BookingManagementModalProviders>
	);
}

function BookingManagementContent() {
	const {
		openCreatePackageBookingDialog,
		openCreateCustomBookingDialog
	} = useBookingManagementModalProvider();

	const bookingsQuery = useGetBookingsQuery({
		limit: 10,
	});

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
						Package Booking
					</Button>
					<Button
						onClick={openCreateCustomBookingDialog}
						variant="outline"
						className="flex items-center gap-2"
					>
						<RouteIcon className="h-4 w-4" />
						Custom Booking
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
							{bookingsQuery.data?.totalItems || 0}
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
						<div className="text-2xl font-bold">12</div>
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
						<div className="text-2xl font-bold">8</div>
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
						<div className="text-2xl font-bold">3</div>
						<p className="text-xs text-muted-foreground">
							Currently in progress
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Bookings</TabsTrigger>
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
								<BookingsListTable />
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
								<BookingsListTable bookingType="package" />
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
								<BookingsListTable bookingType="custom" />
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
								<BookingsListTable status="pending" />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<CreatePackageBookingDialog />
			<CreateCustomBookingDialog />
			<BookingDetailsDialog />
		</PaddingLayout>
	);
}
