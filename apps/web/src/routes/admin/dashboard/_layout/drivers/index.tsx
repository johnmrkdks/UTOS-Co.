import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
	InfoIcon,
	PlusIcon,
	UserCheckIcon,
	UserPlusIcon,
	UsersIcon,
	UserXIcon,
} from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CreateDriverUserDialog } from "@/features/dashboard/_pages/drivers/_components/create-driver-user-dialog";
import { DriverApprovalTable } from "@/features/dashboard/_pages/drivers/_components/driver-approval-table";
import { DriverProcessGuide } from "@/features/dashboard/_pages/drivers/_components/driver-process-guide";
import { DriverUsersTable } from "@/features/dashboard/_pages/drivers/_components/driver-users-table";
import { DriversTable } from "@/features/dashboard/_pages/drivers/_components/drivers-table";
import { useGetDriversQuery } from "@/features/dashboard/_pages/drivers/_hooks/query/use-get-drivers-query";

export const Route = createFileRoute("/admin/dashboard/_layout/drivers/")({
	component: RouteComponent,
});

function RouteComponent() {
	const driversQuery = useGetDriversQuery({});
	const navigate = useNavigate();

	const totalDrivers = driversQuery.data?.totalItems || 0;
	const activeDrivers =
		driversQuery.data?.items?.filter(
			(driver: any) => driver.isActive && driver.isApproved,
		).length || 0;
	const pendingDrivers =
		driversQuery.data?.items?.filter((driver: any) => !driver.isApproved)
			.length || 0;
	const inactiveDrivers =
		driversQuery.data?.items?.filter(
			(driver: any) => driver.isApproved && !driver.isActive,
		).length || 0;

	const handleAddDriver = () => {
		navigate({ to: "/admin/dashboard/drivers/onboarding" });
	};

	const driverStatsData: AnalyticsCardData[] = [
		{
			id: "total",
			title: "Total Drivers",
			value: totalDrivers,
			icon: UsersIcon,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: "Registered drivers",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "active",
			title: "Active Drivers",
			value: activeDrivers,
			icon: UserCheckIcon,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			changeText: "Approved and active",
			changeType: "positive",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "pending",
			title: "Pending Approval",
			value: pendingDrivers,
			icon: UserXIcon,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			changeText: "Awaiting approval",
			changeType: "warning",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "inactive",
			title: "Inactive Drivers",
			value: inactiveDrivers,
			icon: UsersIcon,
			bgGradient: "bg-gradient-to-br from-slate-50 to-slate-100",
			iconBg: "bg-slate-500",
			changeText: "Approved but inactive",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	return (
		<PaddingLayout className="mb-8 flex-1 space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100">
						<UsersIcon className="h-5 w-5 text-orange-600" />
					</div>
					<div>
						<h2 className="font-bold text-2xl tracking-tight">
							Driver Management
						</h2>
						<p className="text-muted-foreground text-sm">
							Manage drivers and approvals
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<CreateDriverUserDialog>
						<Button variant="outline">
							<UserPlusIcon className="h-4 w-4" />
							Create Driver Account
						</Button>
					</CreateDriverUserDialog>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{driverStatsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
					/>
				))}
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Drivers</TabsTrigger>
					<TabsTrigger value="accounts">Driver Accounts</TabsTrigger>
					<TabsTrigger value="pending">Pending Approval</TabsTrigger>
					<TabsTrigger value="active">Active</TabsTrigger>
					<TabsTrigger value="inactive">Inactive</TabsTrigger>
					{/* Hidden Process Guide tab for now */}
					{/* <TabsTrigger value="guide" className="ml-auto">
						<InfoIcon className="h-4 w-4 mr-1" />
						Process Guide
					</TabsTrigger> */}
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card className="border-gray-200 shadow-sm transition-shadow hover:shadow-md">
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

				<TabsContent value="accounts" className="space-y-4">
					<DriverUsersTable />
				</TabsContent>

				<TabsContent value="pending" className="space-y-4">
					<Card className="border-orange-200/50 shadow-sm transition-shadow hover:shadow-md">
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
					<Card className="border-green-200/50 shadow-sm transition-shadow hover:shadow-md">
						<CardHeader>
							<CardTitle>Active Drivers</CardTitle>
							<CardDescription>
								Approved drivers who are currently active and can accept
								bookings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriversTable filter="approved-active" />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="inactive" className="space-y-4">
					<Card className="border-slate-200/50 shadow-sm transition-shadow hover:shadow-md">
						<CardHeader>
							<CardTitle>Inactive Drivers</CardTitle>
							<CardDescription>
								Approved drivers who are currently inactive and cannot accept
								bookings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DriversTable filter="approved-inactive" />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Hidden Process Guide content for now */}
				{/* <TabsContent value="guide" className="space-y-4">
					<DriverProcessGuide />
				</TabsContent> */}
			</Tabs>
		</PaddingLayout>
	);
}
