import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { 
	Collapsible, 
	CollapsibleContent, 
	CollapsibleTrigger 
} from "@workspace/ui/components/collapsible";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Search, Filter, X, ChevronDown, Eye, EyeOff, AlertTriangle } from "lucide-react";

export interface PublicationFiltersProps {
	onFiltersChange: (filters: PublicationFilterState) => void;
	type: "cars" | "packages";
	totalCount: number;
	filteredCount: number;
}

export interface PublicationFilterState {
	search: string;
	publicationStatus: "all" | "published" | "unpublished" | "published-with-issues";
	availability: "all" | "available" | "unavailable";
	dateRange: "all" | "last-7-days" | "last-30-days" | "last-90-days";
}

export function PublicationFilters({
	onFiltersChange,
	type,
	totalCount,
	filteredCount,
}: PublicationFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [filters, setFilters] = useState<PublicationFilterState>({
		search: "",
		publicationStatus: "all",
		availability: "all",
		dateRange: "all",
	});

	const updateFilters = (newFilters: Partial<PublicationFilterState>) => {
		const updated = { ...filters, ...newFilters };
		setFilters(updated);
		onFiltersChange(updated);
	};

	const clearFilters = () => {
		const clearedFilters = {
			search: "",
			publicationStatus: "all" as const,
			availability: "all" as const,
			dateRange: "all" as const,
		};
		setFilters(clearedFilters);
		onFiltersChange(clearedFilters);
	};

	const hasActiveFilters = filters.search || 
		filters.publicationStatus !== "all" || 
		filters.availability !== "all" || 
		filters.dateRange !== "all";

	const getActiveFilterCount = () => {
		let count = 0;
		if (filters.search) count++;
		if (filters.publicationStatus !== "all") count++;
		if (filters.availability !== "all") count++;
		if (filters.dateRange !== "all") count++;
		return count;
	};

	return (
		<Card>
			<CardContent className="p-4">
				<div className="space-y-4">
					{/* Search and Quick Actions */}
					<div className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={`Search ${type}...`}
								value={filters.search}
								onChange={(e) => updateFilters({ search: e.target.value })}
								className="pl-9"
							/>
						</div>
						
						<Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
							<CollapsibleTrigger asChild>
								<Button variant="outline" className="flex items-center gap-2">
									<Filter className="h-4 w-4" />
									Filters
									{getActiveFilterCount() > 0 && (
										<Badge variant="secondary" className="ml-2">
											{getActiveFilterCount()}
										</Badge>
									)}
									<ChevronDown className="h-4 w-4" />
								</Button>
							</CollapsibleTrigger>
							
							<CollapsibleContent className="absolute z-10 mt-2 w-80 right-0 bg-background border rounded-lg shadow-lg p-4 space-y-4">
								{/* Publication Status */}
								<div className="space-y-2">
									<Label>Publication Status</Label>
									<Select 
										value={filters.publicationStatus}
										onValueChange={(value: any) => updateFilters({ publicationStatus: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Status</SelectItem>
											<SelectItem value="published">
												<div className="flex items-center gap-2">
													<Eye className="h-4 w-4" />
													Published
												</div>
											</SelectItem>
											<SelectItem value="unpublished">
												<div className="flex items-center gap-2">
													<EyeOff className="h-4 w-4" />
													Unpublished
												</div>
											</SelectItem>
											<SelectItem value="published-with-issues">
												<div className="flex items-center gap-2">
													<AlertTriangle className="h-4 w-4" />
													Published with Issues
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Availability */}
								<div className="space-y-2">
									<Label>Availability</Label>
									<Select 
										value={filters.availability}
										onValueChange={(value: any) => updateFilters({ availability: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All</SelectItem>
											<SelectItem value="available">Available</SelectItem>
											<SelectItem value="unavailable">Unavailable</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Date Range */}
								<div className="space-y-2">
									<Label>Updated</Label>
									<Select 
										value={filters.dateRange}
										onValueChange={(value: any) => updateFilters({ dateRange: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Time</SelectItem>
											<SelectItem value="last-7-days">Last 7 Days</SelectItem>
											<SelectItem value="last-30-days">Last 30 Days</SelectItem>
											<SelectItem value="last-90-days">Last 90 Days</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Clear Filters */}
								{hasActiveFilters && (
									<Button 
										variant="outline" 
										size="sm" 
										onClick={clearFilters}
										className="w-full"
									>
										<X className="h-4 w-4 mr-2" />
										Clear Filters
									</Button>
								)}
							</CollapsibleContent>
						</Collapsible>
					</div>

					{/* Results Summary */}
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div>
							Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} {type}
						</div>
						
						{/* Active Filters Display */}
						{hasActiveFilters && (
							<div className="flex items-center gap-2">
								<span className="text-xs">Filters:</span>
								{filters.search && (
									<Badge variant="outline" className="text-xs">
										Search: {filters.search}
									</Badge>
								)}
								{filters.publicationStatus !== "all" && (
									<Badge variant="outline" className="text-xs">
										Status: {filters.publicationStatus.replace("-", " ")}
									</Badge>
								)}
								{filters.availability !== "all" && (
									<Badge variant="outline" className="text-xs">
										Available: {filters.availability}
									</Badge>
								)}
								{filters.dateRange !== "all" && (
									<Badge variant="outline" className="text-xs">
										{filters.dateRange.replace("-", " ")}
									</Badge>
								)}
								<Button 
									variant="ghost" 
									size="sm" 
									onClick={clearFilters}
									className="h-6 w-6 p-0"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}