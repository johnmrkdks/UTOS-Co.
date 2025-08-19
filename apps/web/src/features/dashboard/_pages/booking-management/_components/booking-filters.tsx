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
		<div className="bg-muted/30 rounded-lg border p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<FilterIcon className="h-4 w-4" />
					<span className="font-medium">Filters</span>
					{activeFiltersCount > 0 && (
						<Badge variant="secondary" className="h-5">
							{activeFiltersCount}
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					{activeFiltersCount > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={onClearFilters}
							className="h-7 px-2"
						>
							<X className="h-3 w-3 mr-1" />
							Clear
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="h-7 px-2"
					>
						{isExpanded ? "Less" : "More"}
					</Button>
				</div>
			</div>

			{/* Compact main filters - always visible */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<Select 
					value={filters.status || "all"} 
					onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
				>
					<SelectTrigger className="h-8">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						{statusOptions.map(status => (
							<SelectItem key={status.value} value={status.value}>
								{status.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select 
					value={filters.bookingType || "all"} 
					onValueChange={(value) => updateFilter("bookingType", value === "all" ? undefined : value as "package" | "custom")}
				>
					<SelectTrigger className="h-8">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="package">Package</SelectItem>
						<SelectItem value="custom">Custom</SelectItem>
					</SelectContent>
				</Select>

				<Input
					placeholder="Customer name..."
					className="h-8"
					value={filters.customerName || ""}
					onChange={(e) => updateFilter("customerName", e.target.value)}
				/>

				<div className="flex gap-1">
					<Input
						type="date"
						className="h-8"
						value={filters.dateFrom || ""}
						onChange={(e) => updateFilter("dateFrom", e.target.value)}
						title="Date From"
					/>
				</div>
			</div>

			{/* Advanced filters - collapsible */}
			{isExpanded && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
					<Input
						type="date"
						placeholder="Date to"
						className="h-8"
						value={filters.dateTo || ""}
						onChange={(e) => updateFilter("dateTo", e.target.value)}
						title="Date To"
					/>
					<Input
						type="number"
						placeholder="Min amount"
						className="h-8"
						min="0"
						step="0.01"
						value={filters.minAmount || ""}
						onChange={(e) => updateFilter("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
					/>
					<Input
						type="number"
						placeholder="Max amount"
						className="h-8"
						min="0"
						step="0.01"
						value={filters.maxAmount || ""}
						onChange={(e) => updateFilter("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
					/>
					<div className="flex items-center text-sm text-muted-foreground">
						More filters available
					</div>
				</div>
			)}
		</div>
	);
}