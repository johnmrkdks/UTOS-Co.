import { useCarsListViewToogleStore } from "@/features/dashboard/_pages/car-management/_store/use-cars-list-view-toogle-store";
import { ViewToggle } from "./cars-list/view-toggle";
import { CarsListGrid } from "./cars-list/cars-list-grid";
import { CarsTableList } from "./cars-list/cars-table-list";
import { CarsFilters } from "./cars-list/cars-filters";
import { PaddingLayout } from "@/features/dashboard/_layouts/padding-layout";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useGetCarsQuery } from "../_hooks/query/car/use-get-cars-query";
import { useMemo } from "react";
import { PublicationStatsCard } from "@/features/dashboard/_components/publication";

function AddCarButton() {
	return (
		<Link to="/dashboard/cars/add-car">
			<Button>
				<PlusIcon className="w-4 h-4" />
				Add New Car
			</Button>
		</Link>
	)
}

export function CarsList() {
	const { viewMode } = useCarsListViewToogleStore();
	const navigate = useNavigate()
	const search = useSearch({
		from: "/dashboard/_layout/cars/",
	})

	// Get filters from search params with defaults
	const filters = {
		search: search.search || "",
		brand: search.brand || "",
		category: search.category || "",
		availability: search.availability || "all",
		publicationStatus: (search as any).publicationStatus || "all",
		minPrice: search.minPrice || 0,
		maxPrice: search.maxPrice || 10000,
		page: search.page || 1,
		pageSize: search.pageSize || 25,
	}

	// Fetch all cars without filters
	const { data: allCars, isLoading: isCarsLoading } = useGetCarsQuery({});

	// Client-side filtering
	const filteredCars = useMemo(() => {
		if (!allCars?.data) return [];

		let filtered = allCars.data;

		// Search filter
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter((car: any) =>
				car.name?.toLowerCase().includes(searchTerm) ||
				car.model?.name?.toLowerCase().includes(searchTerm) ||
				car.model?.brand?.name?.toLowerCase().includes(searchTerm)
			);
		}

		// Brand filter
		if (filters.brand) {
			filtered = filtered.filter((car: any) =>
				car.model?.brand?.name === filters.brand
			);
		}

		// Category filter
		if (filters.category) {
			filtered = filtered.filter((car: any) =>
				car.category?.name === filters.category
			);
		}

		// Availability filter
		if (filters.availability !== "all") {
			const isAvailable = filters.availability === "available";
			filtered = filtered.filter((car: any) =>
				car.isAvailable === isAvailable
			);
		}

		// Publication status filter
		if (filters.publicationStatus !== "all") {
			if (filters.publicationStatus === "published") {
				filtered = filtered.filter((car: any) =>
					car.isPublished && car.isActive && car.isAvailable && car.status === "available"
				);
			} else if (filters.publicationStatus === "unpublished") {
				filtered = filtered.filter((car: any) =>
					!car.isPublished
				);
			} else if (filters.publicationStatus === "published-with-issues") {
				filtered = filtered.filter((car: any) =>
					car.isPublished && (!car.isActive || !car.isAvailable || car.status !== "available")
				);
			}
		}

		// Price range filters
		if (filters.minPrice > 0) {
			filtered = filtered.filter((car: any) =>
				car.pricePerDay >= filters.minPrice
			);
		}

		if (filters.maxPrice < 10000) {
			filtered = filtered.filter((car: any) =>
				car.pricePerDay <= filters.maxPrice
			);
		}

		return filtered;
	}, [allCars?.data, filters]);

	// Create mock data structure to match API response
	const cars = useMemo(() => ({
		data: filteredCars
	}), [filteredCars]);

	// Calculate publication stats
	const publicationStats = useMemo(() => {
		if (!allCars?.data) return { total: 0, published: 0, unpublished: 0, publishedWithIssues: 0 };

		const total = allCars.data.length;
		const published = allCars.data.filter((car: any) =>
			car.isPublished && car.isActive && car.isAvailable && car.status === "available"
		).length;
		const unpublished = allCars.data.filter((car: any) => !car.isPublished).length;
		const publishedWithIssues = allCars.data.filter((car: any) =>
			car.isPublished && (!car.isActive || !car.isAvailable || car.status !== "available")
		).length;

		return { total, published, unpublished, publishedWithIssues };
	}, [allCars?.data]);

	const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
		navigate({
			to: "/dashboard/cars",
			search: (prev) => ({ ...prev, ...newFilters }),
		})
	}

	const handleResetFilters = () => {
		navigate({
			to: "/dashboard/cars",
			search: {
				search: undefined,
				brand: undefined,
				category: undefined,
				availability: undefined,
				minPrice: undefined,
				maxPrice: undefined,
				page: undefined,
				pageSize: undefined,
			},
		})
	}

	return (
		<div className="relative flex flex-col gap-0">
			{/* Sticky Toolbar */}
			<PaddingLayout className="sticky top-[85px] z-9 bg-background border-b border-boder flex items-center justify-between gap-4">
				<CarsFilters
					filters={filters}
					onFiltersChange={handleFiltersChange}
					onResetFilters={handleResetFilters}
					isLoading={isCarsLoading}
				/>

				<div className="flex gap-2">
					<AddCarButton />
					<ViewToggle />
				</div>
			</PaddingLayout>

			{/* Scrollable Content */}
			<PaddingLayout className="overflow-y-auto h-full">
				<div>
					{
						viewMode === "grid" && (
							<CarsListGrid cars={cars?.data} isLoading={isCarsLoading} className="grid grid-cols-3 gap-4" />
						)
					}
					{
						viewMode === "table" && (
							<CarsTableList carsData={cars} isLoading={isCarsLoading} />
						)
					}
				</div>
			</PaddingLayout >
		</div>
	)
}
