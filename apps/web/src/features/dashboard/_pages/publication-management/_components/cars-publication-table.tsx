import { DataTable } from "@workspace/ui/components/data-table";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import {
	AlertCircle,
	Car,
	CheckCircle,
	EyeOff,
	Filter,
	Search,
} from "lucide-react";
import { useState } from "react";
import {
	AnalyticsCard,
	type AnalyticsCardData,
} from "@/components/analytics-card";

import { useGetCarsQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car/use-get-cars-query";
import { useTogglePublishCarMutation } from "@/features/dashboard/_pages/car-management/_hooks/query/use-toggle-publish-car-mutation";
import { useCarPricingStatusSafe } from "../_hooks/use-car-pricing-status-safe";
import { getCarsPublicationColumns } from "./columns";
import { TableSkeleton } from "./skeletons";

export function CarsPublicationTable() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const {
		hasCarPricingConfig,
		getCarPricingConfig,
		isLoading: pricingStatusLoading,
	} = useCarPricingStatusSafe();

	const { data: carsData, isLoading } = useGetCarsQuery({
		limit: 50,
		filters: search ? { search } : undefined,
	});

	const togglePublishMutation = useTogglePublishCarMutation();

	const cars = carsData?.data || [];

	// Filter cars based on publication status
	const filteredCars = cars.filter((car) => {
		if (statusFilter === "published") {
			return (
				car.isPublished &&
				car.isActive &&
				car.isAvailable &&
				car.status === "available"
			);
		}
		if (statusFilter === "unpublished") {
			return (
				!car.isPublished ||
				!car.isActive ||
				!car.isAvailable ||
				car.status !== "available"
			);
		}
		if (statusFilter === "ready") {
			return (
				!car.isPublished &&
				car.isActive &&
				car.isAvailable &&
				car.status === "available"
			);
		}
		if (statusFilter === "issues") {
			return (
				car.isPublished &&
				(!car.isActive || !car.isAvailable || car.status !== "available")
			);
		}
		return true;
	});

	const getPublicationStatus = (car: any) => {
		const isFullyPublished =
			car.isPublished &&
			car.isActive &&
			car.isAvailable &&
			car.status === "available";

		if (isFullyPublished) return "published";
		if (car.isPublished) return "published-with-issues";
		if (car.isActive && car.isAvailable && car.status === "available")
			return "ready";
		return "unpublished";
	};

	const handleTogglePublish = (carId: string) => {
		const car = filteredCars.find((c) => c.id === carId);
		if (!car) return;

		togglePublishMutation.mutate({
			id: carId,
			isPublished: !car.isPublished,
		});
	};

	// Analytics data for cars publication stats
	const carsStatsData: AnalyticsCardData[] = [
		{
			id: "published-cars",
			title: "Published",
			value: cars.filter(
				(car) =>
					car.isPublished &&
					car.isActive &&
					car.isAvailable &&
					car.status === "available",
			).length,
			icon: Car,
			bgGradient: "bg-gradient-to-br from-green-50 to-green-100",
			iconBg: "bg-green-500",
			changeText: "Publicly visible",
			changeType: "positive",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "unpublished-cars",
			title: "Unpublished",
			value: cars.filter((car) => !car.isPublished).length,
			icon: EyeOff,
			bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
			iconBg: "bg-gray-500",
			changeText: "Not visible to customers",
			changeType: "neutral",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "ready-cars",
			title: "Ready",
			value: cars.filter(
				(car) =>
					!car.isPublished &&
					car.isActive &&
					car.isAvailable &&
					car.status === "available",
			).length,
			icon: CheckCircle,
			bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
			iconBg: "bg-blue-500",
			changeText: "Ready to publish",
			changeType: "positive",
			showIcon: true,
			showBackgroundIcon: true,
		},
		{
			id: "issues-cars",
			title: "Issues",
			value: cars.filter(
				(car) =>
					car.isPublished &&
					(!car.isActive || !car.isAvailable || car.status !== "available"),
			).length,
			icon: AlertCircle,
			bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100",
			iconBg: "bg-orange-500",
			changeText: "Need attention",
			changeType: "warning",
			showIcon: true,
			showBackgroundIcon: true,
		},
	];

	const columns = getCarsPublicationColumns({
		onTogglePublish: handleTogglePublish,
		hasCarPricingConfig,
		getCarPricingConfig,
		isToggling: togglePublishMutation.isPending,
	});

	if (isLoading) {
		return <TableSkeleton rows={5} columns={6} />;
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
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
				{carsStatsData.map((data) => (
					<AnalyticsCard key={data.id} data={data} view="compact" />
				))}
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
