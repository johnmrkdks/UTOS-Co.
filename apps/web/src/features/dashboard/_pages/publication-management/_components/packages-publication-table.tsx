import { useState } from "react";
import { DataTable } from "@workspace/ui/components/data-table";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { AnalyticsCard, type AnalyticsCardData } from '@/components/analytics-card';
import { Search, Filter, Package2, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useTogglePublishPackageMutation } from "@/features/dashboard/_pages/packages/_hooks/query/use-toggle-publish-package-mutation";
import { getPackagesPublicationColumns } from "./columns";
import { TableSkeleton } from "./skeletons";

export function PackagesPublicationTable() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: packagesData, isLoading } = useGetPackagesQuery({
		limit: 50,
		filters: search ? { search } : undefined
	});

	const togglePublishMutation = useTogglePublishPackageMutation();

	const packages = packagesData?.data || [];

	// Filter packages based on publication status
	const filteredPackages = packages.filter(pkg => {
		if (statusFilter === "published") {
			return pkg.isPublished && pkg.isAvailable;
		}
		if (statusFilter === "unpublished") {
			return !pkg.isPublished || !pkg.isAvailable;
		}
		if (statusFilter === "ready") {
			return !pkg.isPublished && pkg.isAvailable;
		}
		if (statusFilter === "issues") {
			return pkg.isPublished && !pkg.isAvailable;
		}
		return true;
	});

	const getPublicationStatus = (pkg: any) => {
		const isFullyPublished = pkg.isPublished && pkg.isAvailable;

		if (isFullyPublished) return "published";
		if (pkg.isPublished) return "published-with-issues";
		if (pkg.isAvailable) return "ready";
		return "unpublished";
	};

	const handleTogglePublish = (packageId: string) => {
		const pkg = filteredPackages.find(p => p.id === packageId);
		if (!pkg) return;

		togglePublishMutation.mutate({
			id: packageId,
			isPublished: !pkg.isPublished
		});
	};

	// Analytics data for packages publication stats
	const packagesStatsData: AnalyticsCardData[] = [
		{
			id: 'published-packages',
			title: 'Published',
			value: packages.filter(pkg => pkg.isPublished && pkg.isAvailable).length,
			icon: Package2,
			bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
			changeText: 'Publicly visible',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'unpublished-packages',
			title: 'Unpublished',
			value: packages.filter(pkg => !pkg.isPublished).length,
			icon: EyeOff,
			bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
			iconBg: 'bg-gray-500',
			changeText: 'Not visible to customers',
			changeType: 'neutral',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'ready-packages',
			title: 'Ready',
			value: packages.filter(pkg => !pkg.isPublished && pkg.isAvailable).length,
			icon: CheckCircle,
			bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
			changeText: 'Ready to publish',
			changeType: 'positive',
			showIcon: true,
			showBackgroundIcon: true
		},
		{
			id: 'issues-packages',
			title: 'Issues',
			value: packages.filter(pkg => pkg.isPublished && !pkg.isAvailable).length,
			icon: AlertCircle,
			bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
			changeText: 'Need attention',
			changeType: 'warning',
			showIcon: true,
			showBackgroundIcon: true
		}
	];

	const columns = getPackagesPublicationColumns({
		onTogglePublish: handleTogglePublish,
		isToggling: togglePublishMutation.isPending
	});

	if (isLoading) {
		return <TableSkeleton rows={5} columns={5} />;
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search packages..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="">
						<Filter className="h-4 w-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="published">Published</SelectItem>
						<SelectItem value="unpublished">Unpublished</SelectItem>
						<SelectItem value="ready">Ready to Publish</SelectItem>
						<SelectItem value="issues">Has Issues</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Stats Summary */}
			<div className="grid grid-cols-4 gap-4">
				{packagesStatsData.map((data) => (
					<AnalyticsCard 
						key={data.id} 
						data={data} 
						view="compact" 
					/>
				))}
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				data={filteredPackages}
				isLoading={false}
				enableColumnPinning={true}
				initialColumnPinning={{ right: ["actions"] }}
				enableColumnVisibility={true}
				enableSorting={true}
			/>
		</div>
	);
}
