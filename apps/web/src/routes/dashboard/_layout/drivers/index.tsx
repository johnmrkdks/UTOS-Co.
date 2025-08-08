import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DriversTable } from "@/features/dashboard/_pages/drivers/_components/drivers-table";
import { DriverApprovalTable } from "@/features/dashboard/_pages/drivers/_components/driver-approval-table";
import { Users, UserCheck, UserX, Car } from "lucide-react";
import { useGetDriversQuery } from "@/features/dashboard/_pages/drivers/_hooks/query/use-get-drivers-query";

export const Route = createFileRoute('/dashboard/_layout/drivers/')({
	component: RouteComponent,
});

function RouteComponent() {
	const driversQuery = useGetDriversQuery();

	const totalDrivers = driversQuery.data?.totalItems || 0;
	const activeDrivers = driversQuery.data?.items?.filter((driver: any) => driver.isActive && driver.isApproved).length || 0;
	const pendingDrivers = driversQuery.data?.items?.filter((driver: any) => !driver.isApproved).length || 0;
	const inactiveDrivers = driversQuery.data?.items?.filter((driver: any) => !driver.isActive).length || 0;

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Driver Management</h2>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalDrivers}</div>
						<p className="text-xs text-muted-foreground">
							Registered drivers
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeDrivers}</div>
						<p className="text-xs text-muted-foreground">
							Approved and active
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
						<UserX className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pendingDrivers}</div>
						<p className="text-xs text-muted-foreground">
							Awaiting approval
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Inactive Drivers</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{inactiveDrivers}</div>
						<p className="text-xs text-muted-foreground">
							Currently inactive
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Drivers</TabsTrigger>
					<TabsTrigger value="pending">Pending Approval</TabsTrigger>
					<TabsTrigger value="active">Active</TabsTrigger>
					<TabsTrigger value="inactive">Inactive</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Drivers</CardTitle>
							<CardDescription>
								Manage all registered drivers in your system.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriversTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pending" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Pending Approval</CardTitle>
							<CardDescription>
								Review and approve new driver applications.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriverApprovalTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="active" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Active Drivers</CardTitle>
							<CardDescription>
								Currently active and approved drivers.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriversTable filter="active" />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="inactive" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Inactive Drivers</CardTitle>
							<CardDescription>
								Drivers who are currently inactive or suspended.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriversTable filter="inactive" />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}