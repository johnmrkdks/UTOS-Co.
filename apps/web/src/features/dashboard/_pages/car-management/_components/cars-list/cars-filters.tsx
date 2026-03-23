import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetCarBrandsQuery } from "../../_hooks/query/car-brand/use-get-car-brands-query";
import { useGetCarCategoriesQuery } from "../../_hooks/query/car-category/use-get-car-categories-query";

interface CarsFiltersProps {
	filters: {
		search: string;
		brand: string;
		category: string;
		availability: "all" | "available" | "unavailable";
		minPrice: number;
		maxPrice: number;
		page: number;
		pageSize: number;
	};
	onFiltersChange: (filters: {
		search?: string;
		brand?: string;
		category?: string;
		availability?: "all" | "available" | "unavailable";
		minPrice?: number;
		maxPrice?: number;
		page?: number;
		pageSize?: number;
	}) => void;
	onResetFilters: () => void;
	isLoading: boolean;
}

export function CarsFilters({
	filters,
	onFiltersChange,
	onResetFilters,
	isLoading,
}: CarsFiltersProps) {
	const { data: brandsData } = useGetCarBrandsQuery({});
	const { data: categoriesData } = useGetCarCategoriesQuery({});

	// Local state for search input
	const [searchTerm, setSearchTerm] = useState(filters.search);

	// Handle search when user clicks search button or presses Enter
	const handleSearch = () => {
		onFiltersChange({ search: searchTerm, page: 1 });
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	// Update local search term when filters change (e.g., from reset or URL change)
	useEffect(() => {
		setSearchTerm(filters.search);
	}, [filters.search]);

	const activeFiltersCount = [
		filters.search,
		filters.brand,
		filters.category,
		filters.availability !== "all",
		filters.minPrice > 0,
		filters.maxPrice < 10000,
	].filter(Boolean).length;

	return (
		<div className="">
			<div className="flex items-center justify-between">
				{activeFiltersCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onResetFilters}
						className="h-8 px-2 lg:px-3"
					>
						<XIcon className="h-4 w-4" />
						Reset
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
				{/* Search */}
				<div className="relative lg:col-span-2">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								placeholder="Search cars..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyPress={handleKeyPress}
								className="pl-9"
							/>
						</div>
						<Button
							onClick={handleSearch}
							variant="outline"
							size="default"
							className="px-3"
						>
							Search
						</Button>
					</div>
				</div>

				{/* Brand Filter */}
				<Select
					value={filters.brand || "all-brands"}
					onValueChange={(value) =>
						onFiltersChange({
							brand: value === "all-brands" ? "" : value,
							page: 1,
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Brands" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all-brands">All Brands</SelectItem>
						{brandsData?.data?.map((brand) => (
							<SelectItem key={brand.id} value={brand.name}>
								{brand.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Category Filter */}
				<Select
					value={filters.category || "all-categories"}
					onValueChange={(value) =>
						onFiltersChange({
							category: value === "all-categories" ? "" : value,
							page: 1,
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all-categories">All Categories</SelectItem>
						{categoriesData?.data?.map((category) => (
							<SelectItem key={category.id} value={category.name}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Availability Filter */}
				<Select
					value={filters.availability}
					onValueChange={(value: "all" | "available" | "unavailable") =>
						onFiltersChange({ availability: value, page: 1 })
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="available">Available</SelectItem>
						<SelectItem value="unavailable">Unavailable</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Active Filters Summary */}
			{activeFiltersCount > 0 && (
				<div className="flex flex-wrap gap-2">
					{filters.search && (
						<Badge variant="secondary" className="gap-1">
							Search: {filters.search}
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => onFiltersChange({ search: "" })}
							>
								<XIcon className="h-3 w-3" />
							</Button>
						</Badge>
					)}
					{filters.brand && (
						<Badge variant="secondary" className="gap-1">
							Brand: {filters.brand}
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => onFiltersChange({ brand: "" })}
							>
								<XIcon className="h-3 w-3" />
							</Button>
						</Badge>
					)}
					{filters.category && (
						<Badge variant="secondary" className="gap-1">
							Category: {filters.category}
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => onFiltersChange({ category: "" })}
							>
								<XIcon className="h-3 w-3" />
							</Button>
						</Badge>
					)}
					{filters.availability !== "all" && (
						<Badge variant="secondary" className="gap-1">
							Status: {filters.availability}
							<Button
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => onFiltersChange({ availability: "all" })}
							>
								<XIcon className="h-3 w-3" />
							</Button>
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}
