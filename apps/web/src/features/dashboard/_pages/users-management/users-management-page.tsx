import { Button } from "@workspace/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ShieldIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";
import { useGetUsersQuery } from "./_hooks/query/use-get-users-query";

export function UsersManagementPage() {
	const allUsersQuery = useGetUsersQuery({ limit: 100 });
	const totalUsers = allUsersQuery.data?.users?.length || 0;
	const clientCount =
		allUsersQuery.data?.users?.filter(
			(u: { role: string }) => u.role === "user",
		).length || 0;
	const adminCount =
		allUsersQuery.data?.users?.filter(
			(u: { role: string }) => u.role === "admin" || u.role === "super_admin",
		).length || 0;

	const userStatsData: AnalyticsCardData[] = [
		{
			id: "total",
			title: "Total Users",
			value: totalUsers,
			icon: UsersIcon,
			bgGradient: "bg-gradient-to-br from-slate-50/95 to-slate-100/45",
			iconBg: "bg-slate-700",
			accentStripClassName:
				"from-slate-600/55 via-slate-500/38 to-slate-300/25",
			changeText: "All users in the system",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "clients",
			title: "Clients",
			value: clientCount,
			icon: UserIcon,
			bgGradient: "bg-gradient-to-br from-zinc-50/95 to-stone-100/45",
			iconBg: "bg-zinc-600",
			accentStripClassName: "from-zinc-600/50 via-zinc-500/38 to-stone-400/25",
			changeText: "Customer accounts",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "admins",
			title: "Admins",
			value: adminCount,
			icon: ShieldIcon,
			bgGradient: "bg-gradient-to-br from-amber-50/95 to-amber-100/55",
			iconBg: "bg-amber-800",
			accentStripClassName:
				"from-amber-700/55 via-amber-500/42 to-amber-200/30",
			changeText: "Admin & Super Admin",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	return (
		<PaddingLayout className="mb-8 flex-1 space-y-6">
			<div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5 sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 shadow-sm">
							<UsersIcon className="h-5 w-5 text-amber-800 dark:text-amber-200" />
						</div>
						<div>
							<p className="font-medium text-[0.65rem] text-amber-900/70 uppercase tracking-[0.18em] dark:text-amber-200/80">
								Super admin
							</p>
							<h2 className="font-semibold text-2xl tracking-tight">
								User management
							</h2>
							<p className="text-muted-foreground text-sm">
								Manage users and roles
							</p>
						</div>
					</div>
					<CreateUserDialog>
						<Button>
							<UserPlusIcon className="h-4 w-4" />
							Add User
						</Button>
					</CreateUserDialog>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{userStatsData.map((data) => (
					<AnalyticsCard
						key={data.id}
						data={data}
						view="compact"
						className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
					/>
				))}
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList className="inline-flex h-auto w-full max-w-md flex-wrap gap-1 rounded-2xl border border-border/60 bg-muted/40 p-1.5">
					<TabsTrigger
						className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
						value="all"
					>
						All Users
					</TabsTrigger>
					<TabsTrigger
						className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
						value="clients"
					>
						Clients
					</TabsTrigger>
					<TabsTrigger
						className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
						value="admins"
					>
						Admins
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<UsersTable />
				</TabsContent>

				<TabsContent value="clients" className="space-y-4">
					<UsersTable role="user" />
				</TabsContent>

				<TabsContent value="admins" className="space-y-4">
					<UsersTable roleFilter="admins" />
				</TabsContent>
			</Tabs>
		</PaddingLayout>
	);
}
