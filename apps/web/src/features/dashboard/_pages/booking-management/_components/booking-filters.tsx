import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CalendarIcon, X, FilterIcon } from "lucide-react";
import { useState } from "react";

export interface BookingFilters {
	status?: string;
	bookingType?: "package" | "custom";
	dateFrom?: string;
	dateTo?: string;
	customerName?: string;
	driverId?: string;
	carId?: string;
	minAmount?: number;
	maxAmount?: number;
}

interface BookingFiltersProps {
	filters: BookingFilters;
	onFiltersChange: (filters: BookingFilters) => void;
	onClearFilters: () => void;
}

const statusOptions = [
	{ value: "pending", label: "Pending" },
	{ value: "confirmed", label: "Confirmed" },
	{ value: "driver_assigned", label: "Driver Assigned" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "no_show", label: "No Show" },
	{ value: "failed", label: "Failed" },
];

export function BookingFilters({ filters, onFiltersChange, onClearFilters }: BookingFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const updateFilter = (key: keyof BookingFilters, value: string | number | undefined) => {
		onFiltersChange({
			...filters,
			[key]: value || undefined,
		});
	};

	const getActiveFiltersCount = () => {
		return Object.values(filters).filter(value => 
			value !== undefined && value !== "" && value !== null
		).length;
	};

	const activeFiltersCount = getActiveFiltersCount();

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg flex items-center gap-2">
						<FilterIcon className="h-4 w-4" />
						Advanced Filters
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="ml-2">
								{activeFiltersCount} active
							</Badge>
						)}
					</CardTitle>
					<div className="flex items-center gap-2">
						{activeFiltersCount > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={onClearFilters}
								className="h-8"
							>
								<X className="h-3 w-3 mr-1" />
								Clear All
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
							className="h-8"
						>
							{isExpanded ? "Collapse" : "Expand"}
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Quick filters - always visible */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select 
							value={filters.status || "all"} 
							onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								{statusOptions.map(status => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bookingType">Booking Type</Label>
						<Select 
							value={filters.bookingType || "all"} 
							onValueChange={(value) => updateFilter("bookingType", value === "all" ? undefined : value as "package" | "custom")}
						>
							<SelectTrigger>
								<SelectValue placeholder="All types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								<SelectItem value="package">Package</SelectItem>
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="customerName">Customer Name</Label>
						<Input
							id="customerName"
							placeholder="Search by customer..."
							value={filters.customerName || ""}
							onChange={(e) => updateFilter("customerName", e.target.value)}
						/>
					</div>
				</div>

				{/* Advanced filters - collapsible */}
				{isExpanded && (
					<div className="space-y-4 pt-4 border-t">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="dateFrom">Date From</Label>
								<div className="relative">
									<Input
										id="dateFrom"
										type="date"
										value={filters.dateFrom || ""}
										onChange={(e) => updateFilter("dateFrom", e.target.value)}
									/>
									<CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="dateTo">Date To</Label>
								<div className="relative">
									<Input
										id="dateTo"
										type="date"
										value={filters.dateTo || ""}
										onChange={(e) => updateFilter("dateTo", e.target.value)}
									/>
									<CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="minAmount">Min Amount ($)</Label>
								<Input
									id="minAmount"
									type="number"
									placeholder="0.00"
									min="0"
									step="0.01"
									value={filters.minAmount || ""}
									onChange={(e) => updateFilter("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxAmount">Max Amount ($)</Label>
								<Input
									id="maxAmount"
									type="number"
									placeholder="1000.00"
									min="0"
									step="0.01"
									value={filters.maxAmount || ""}
									onChange={(e) => updateFilter("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
								/>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}