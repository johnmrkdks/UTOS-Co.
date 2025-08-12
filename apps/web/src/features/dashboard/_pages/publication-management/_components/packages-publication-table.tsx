import { useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Eye, EyeOff, Search, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { useGetPackagesQuery } from "@/features/dashboard/_pages/packages/_hooks/query/use-get-packages-query";
import { useTogglePublishPackageMutation } from "@/features/dashboard/_pages/packages/_hooks/query/use-toggle-publish-package-mutation";
import { PublicationStatusBadge, PublicationToggleButton } from "@/features/dashboard/_components/publication";

export function PackagesPublicationTable() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: packagesData, isLoading } = useGetPackagesQuery({
		limit: 50,
		search: search || undefined
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

	const handleTogglePublish = (packageId: string, currentStatus: boolean) => {
		togglePublishMutation.mutate({ id: packageId });
	};

	const columns: ColumnDef<any>[] = [
		{
			accessorKey: "name",
			header: "Package Name",
			cell: ({ row }) => {
				const pkg = row.original;
				return (
					<div className="space-y-1">
						<div className="font-medium">{pkg.name}</div>
						<div className="text-sm text-muted-foreground line-clamp-2">
							{pkg.description}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => {
				return (
					<Badge variant="outline">
						{row.original.category?.name || "No Category"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "pricing",
			header: "Price",
			cell: ({ row }) => {
				const pkg = row.original;
				return (
					<div className="space-y-1">
						<div className="font-medium">
							${pkg.pricePerDay}/day
						</div>
						{pkg.pricePerHour && (
							<div className="text-sm text-muted-foreground">
								${pkg.pricePerHour}/hour
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Publication Status",
			cell: ({ row }) => {
				const pkg = row.original;
				const status = getPublicationStatus(pkg);
				return <PublicationStatusBadge status={status} entityType="package" />;
			},
		},
		{
			accessorKey: "availability_status",
			header: "Availability Status",
			cell: ({ row }) => {
				const pkg = row.original;
				return (
					<div className="space-y-1">
						<Badge className={pkg.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
							{pkg.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
						</Badge>
						{pkg.maxBookings && (
							<div className="text-xs text-muted-foreground">
								Max: {pkg.maxBookings} bookings
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "updatedAt",
			header: "Last Updated",
			cell: ({ row }) => {
				const date = new Date(row.original.updatedAt);
				return (
					<div className="text-sm">
						{date.toLocaleDateString()}
						<div className="text-xs text-muted-foreground">
							{date.toLocaleTimeString()}
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const pkg = row.original;
				const canPublish = pkg.isAvailable;

				return (
					<PublicationToggleButton
						isPublished={pkg.isPublished}
						entityType="package"
						entityId={pkg.id}
						onToggle={() => handleTogglePublish(pkg.id, pkg.isPublished)}
						disabled={!canPublish && !pkg.isPublished}
						loading={togglePublishMutation.isPending}
					/>
				);
			},
		},
	];

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
					<SelectTrigger className="w-[200px]">
						<Filter className="mr-2 h-4 w-4" />
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
				<div className="text-center p-3 bg-green-50 rounded-lg">
					<div className="text-2xl font-bold text-green-600">
						{packages.filter(pkg => pkg.isPublished && pkg.isAvailable).length}
					</div>
					<div className="text-sm text-green-700">Published</div>
				</div>
				<div className="text-center p-3 bg-gray-50 rounded-lg">
					<div className="text-2xl font-bold text-gray-600">
						{packages.filter(pkg => !pkg.isPublished).length}
					</div>
					<div className="text-sm text-gray-700">Unpublished</div>
				</div>
				<div className="text-center p-3 bg-blue-50 rounded-lg">
					<div className="text-2xl font-bold text-blue-600">
						{packages.filter(pkg => !pkg.isPublished && pkg.isAvailable).length}
					</div>
					<div className="text-sm text-blue-700">Ready</div>
				</div>
				<div className="text-center p-3 bg-orange-50 rounded-lg">
					<div className="text-2xl font-bold text-orange-600">
						{packages.filter(pkg => pkg.isPublished && !pkg.isAvailable).length}
					</div>
					<div className="text-sm text-orange-700">Issues</div>
				</div>
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				data={filteredPackages}
				loading={isLoading}
			/>
		</div>
	);
}
