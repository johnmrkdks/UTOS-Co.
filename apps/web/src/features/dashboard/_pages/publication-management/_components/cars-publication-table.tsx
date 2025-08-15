import { useState } from "react";
import { DataTable } from "@workspace/ui/components/data-table";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Search, Filter } from "lucide-react";

import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useTogglePublishCarMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/use-toggle-publish-car-mutation";
import { getCarsPublicationColumns } from "./columns";
import { TableSkeleton } from "./skeletons";


export function CarsPublicationTable() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: carsData, isLoading } = useGetCarsQuery({
		limit: 50,
		filters: search ? { search } : undefined
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

	const handleTogglePublish = (carId: string) => {
		const car = filteredCars.find(c => c.id === carId);
		if (!car) return;

		togglePublishMutation.mutate({
			id: carId,
			isPublished: !car.isPublished
		});
	};

	const columns = getCarsPublicationColumns({
		onTogglePublish: handleTogglePublish,
		isToggling: togglePublishMutation.isPending
	});

	if (isLoading) {
		return <TableSkeleton rows={5} columns={6} />;
	}

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
				<div className="border text-center p-3 bg-green-50 rounded-lg">
					<div className="text-2xl font-bold text-green-600">
						{cars.filter(car => car.isPublished && car.isActive && car.isAvailable && car.status === 'available').length}
					</div>
					<div className="text-sm text-green-700">Published</div>
				</div>
				<div className="border text-center p-3 bg-gray-50 rounded-lg">
					<div className="text-2xl font-bold text-gray-600">
						{cars.filter(car => !car.isPublished).length}
					</div>
					<div className="text-sm text-gray-700">Unpublished</div>
				</div>
				<div className="border text-center p-3 bg-blue-50 rounded-lg">
					<div className="text-2xl font-bold text-blue-600">
						{cars.filter(car => !car.isPublished && car.isActive && car.isAvailable && car.status === 'available').length}
					</div>
					<div className="text-sm text-blue-700">Ready</div>
				</div>
				<div className="border text-center p-3 bg-orange-50 rounded-lg">
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
				isLoading={false}
				enableColumnPinning={true}
				initialColumnPinning={{ right: ["actions"] }}
				enableColumnVisibility={true}
				enableSorting={true}
			/>
		</div>
	);
}
