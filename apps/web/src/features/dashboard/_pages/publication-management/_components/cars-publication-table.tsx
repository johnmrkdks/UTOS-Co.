import { useState } from "react";
import { DataTable } from "@workspace/ui/components/data-table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Eye, EyeOff, Search, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useTogglePublishCarMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/use-toggle-publish-car-mutation";
import { PublicationStatusBadge, PublicationToggleButton } from "@/features/dashboard/_components/publication";

interface CarPublicationData {
	id: string;
	name: string;
	brand: string;
	model: string;
	category: string;
	isPublished: boolean;
	isActive: boolean;
	isAvailable: boolean;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export function CarsPublicationTable() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: carsData, isLoading } = useGetCarsQuery({
		page,
		limit: 50,
		search: search || undefined
	});

	const togglePublishMutation = useTogglePublishCarMutation();

	const cars = carsData?.data || [];

	// Filter cars based on publication status
	const filteredCars = cars.filter(car => {
		if (statusFilter === "published") {
			return car.isPublished && car.isActive && car.isAvailable && car.status === 'available';
		}
		if (statusFilter === "unpublished") {
			return !car.isPublished || !car.isActive || !car.isAvailable || car.status !== 'available';
		}
		if (statusFilter === "ready") {
			return !car.isPublished && car.isActive && car.isAvailable && car.status === 'available';
		}
		if (statusFilter === "issues") {
			return car.isPublished && (!car.isActive || !car.isAvailable || car.status !== 'available');
		}
		return true;
	});

	const getPublicationStatus = (car: any) => {
		const isFullyPublished = car.isPublished && car.isActive && car.isAvailable && car.status === 'available';

		if (isFullyPublished) return "published";
		if (car.isPublished) return "published-with-issues";
		if (car.isActive && car.isAvailable && car.status === 'available') return "ready";
		return "unpublished";
	};

	const handleTogglePublish = (carId: string, currentStatus: boolean) => {
		togglePublishMutation.mutate({ id: carId });
	};

	const columns: ColumnDef<any>[] = [
		{
			accessorKey: "name",
			header: "Car Name",
			cell: ({ row }) => {
				const car = row.original;
				return (
					<div className="space-y-1">
						<div className="font-medium">{car.name}</div>
						<div className="text-sm text-muted-foreground">
							{car.brand?.name} {car.model?.name}
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
			accessorKey: "status",
			header: "Publication Status",
			cell: ({ row }) => {
				const car = row.original;
				const status = getPublicationStatus(car);
				return <PublicationStatusBadge status={status} entityType="car" />;
			},
		},
		{
			accessorKey: "operational_status",
			header: "Operational Status",
			cell: ({ row }) => {
				const car = row.original;
				const getStatusColor = (status: string) => {
					switch (status) {
						case 'available': return 'bg-green-100 text-green-800';
						case 'maintenance': return 'bg-yellow-100 text-yellow-800';
						case 'out_of_service': return 'bg-red-100 text-red-800';
						default: return 'bg-gray-100 text-gray-800';
					}
				};

				return (
					<div className="space-y-1">
						<Badge className={getStatusColor(car.status)}>
							{car.status?.replace('_', ' ').toUpperCase()}
						</Badge>
						<div className="text-xs text-muted-foreground">
							Active: {car.isActive ? "Yes" : "No"} | Available: {car.isAvailable ? "Yes" : "No"}
						</div>
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
				const car = row.original;
				const canPublish = car.isActive && car.isAvailable && car.status === 'available';

				return (
					<PublicationToggleButton
						isPublished={car.isPublished}
						entityType="car"
						entityId={car.id}
						onToggle={() => handleTogglePublish(car.id, car.isPublished)}
						disabled={!canPublish && !car.isPublished}
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
						placeholder="Search cars..."
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
						{cars.filter(car => car.isPublished && car.isActive && car.isAvailable && car.status === 'available').length}
					</div>
					<div className="text-sm text-green-700">Published</div>
				</div>
				<div className="text-center p-3 bg-gray-50 rounded-lg">
					<div className="text-2xl font-bold text-gray-600">
						{cars.filter(car => !car.isPublished).length}
					</div>
					<div className="text-sm text-gray-700">Unpublished</div>
				</div>
				<div className="text-center p-3 bg-blue-50 rounded-lg">
					<div className="text-2xl font-bold text-blue-600">
						{cars.filter(car => !car.isPublished && car.isActive && car.isAvailable && car.status === 'available').length}
					</div>
					<div className="text-sm text-blue-700">Ready</div>
				</div>
				<div className="text-center p-3 bg-orange-50 rounded-lg">
					<div className="text-2xl font-bold text-orange-600">
						{cars.filter(car => car.isPublished && (!car.isActive || !car.isAvailable || car.status !== 'available')).length}
					</div>
					<div className="text-sm text-orange-700">Issues</div>
				</div>
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				data={filteredCars}
				loading={isLoading}
			/>
		</div>
	);
}
